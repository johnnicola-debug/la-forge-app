// « Mon reflet » : fiche de personnage. Chaque statistique affichée est une donnée réelle, datée, avec son origine.
// Une donnée inconnue reste « inconnue ». Aucun score global, aucune valeur déduite de l'apparence.
import {PERF_EXERCISES, ASSIST, ORIGINS, EXPERIENCE, validPerformance, validMeasurement, uid, pushLimited} from '../store.js';
import {assessments} from '../data/assessments.js';
import {VOIES, VOIE_IDS} from '../data/orientation.js';
import {skills} from '../data/skills.js';
import {computeAll} from '../engine/progress.js';
import {index} from './tree.js';
import {sigil} from './orientation.js';
import {mount3d, webglAvailable, dimsFromState} from './mannequin3d.js';
import {norms} from '../data/norms.js';
import {rate} from '../engine/grades.js';
import {$, esc, page, fmtDate, notify, numOrNull, options, today} from '../ui.js';

const A = Object.fromEntries(assessments.map(a => [a.id, a]));
export const METRICS = [
  {id: 'test:taille', cat: 'morpho'}, {id: 'test:envergure', cat: 'morpho'}, {id: 'test:masse', cat: 'morpho'},
  ...['squat', 'bench', 'deadlift', 'ohp', 'row', 'pullup', 'dip', 'pushup'].map(id => ({id: 'perf:' + id, cat: 'force', name: PERF_EXERCISES[id].name, kind: 'perf', ex: id})),
  {id: 'test:grip', cat: 'force'},
  {id: 'test:run5k', cat: 'endurance'}, {id: 'test:cooper', cat: 'endurance'}, {id: 'test:marche-continue', cat: 'endurance'},
  {id: 'test:cmj', cat: 'puissance'}, {id: 'test:broadjump', cat: 'puissance'}, {id: 'test:sprint20', cat: 'puissance'},
  {id: 'test:squat-profond', cat: 'mobilite'}, {id: 'test:flexion-avant', cat: 'mobilite'},
  {id: 'test:equilibre-unipodal', cat: 'equilibre'}, {id: 'test:pas-croises', cat: 'equilibre'},
  {id: 'test:reaction-simple', cat: 'reaction', name: 'Réaction simple (écran)', app: true}, {id: 'test:reaction-choix', cat: 'reaction', name: 'Réaction à choix (écran)', app: true},
  {id: 'test:rythme-calme', cat: 'recuperation'}
].map(m => m.kind ? m : {...m, kind: 'test', test: m.id.slice(5), name: m.name ?? A[m.id.slice(5)]?.name ?? m.id});
const CATS = {morpho: 'Morphologie', force: 'Force', endurance: 'Endurance', puissance: 'Explosivité', mobilite: 'Mobilité et souplesse', equilibre: 'Équilibre et coordination', reaction: 'Réaction', recuperation: 'Récupération'};
const ZONES = {force: ['bras', 'epaules', 'torse'], endurance: ['coeur'], puissance: ['jambes'], mobilite: ['hanches', 'articulations'], equilibre: ['pieds'], reaction: ['tete'], recuperation: ['souffle'], morpho: []};

export const refletTabs = active => `<nav class="subtabs" aria-label="Mon reflet">${[['avatar', 'Personnage et données'], ['profil', 'Profil, réaction et carnet']]
  .map(([h, l]) => `<a href="#${h}" ${h === active ? 'aria-current="page"' : ''}>${l}</a>`).join('')}</nav>`;

export function history(state, m) {
  if (m.kind === 'perf') return state.performances.filter(p => p.exercise === m.ex).map(p => ({date: p.date ?? p.createdAt, origin: p.origin, item: p, text: perfText(p)}));
  return state.measurements.filter(x => x.test === m.test).map(x => ({date: x.date, origin: x.origin, item: x, text: x.value !== null ? `${x.value} ${x.unit}` : x.details?.choice ?? '—'}));
}
const perfText = p => [p.load !== null ? `${p.load} kg` : null, p.reps !== null ? `${p.reps} rép.` : null, p.sets ? `× ${p.sets}` : null,
  p.assistance !== 'aucune' ? `${ASSIST[p.assistance].toLowerCase()}${p.extra !== null ? ` ${p.extra} kg` : ''}` : null].filter(Boolean).join(' ');

function spark(points) {
  const v = points.filter(p => typeof p.item.value === 'number').reverse();
  if (v.length < 2) return '';
  const xs = v.map(p => Date.parse(p.date)), ys = v.map(p => p.item.value), x0 = Math.min(...xs), x1 = Math.max(...xs) || x0 + 1, y0 = Math.min(...ys), y1 = Math.max(...ys);
  const pts = v.map((p, i) => `${4 + (xs[i] - x0) / ((x1 - x0) || 1) * 112},${26 - (y1 === y0 ? 11 : (ys[i] - y0) / (y1 - y0) * 22)}`).join(' ');
  return `<svg class="spark" viewBox="0 0 120 30" aria-label="Évolution de vos propres mesures"><polyline points="${pts}"/></svg>`;
}

// Silhouette de face, zones éclairées seulement quand une donnée réelle existe.
function silhouette(lit) {
  const z = k => `zone ${lit.has(k) ? 'on' : ''}`;
  return `<svg class="reflet" viewBox="0 0 220 440" role="img" aria-label="Silhouette : les zones éclairées correspondent aux capacités pour lesquelles vous avez des données">
  <defs><radialGradient id="aura"><stop offset="0" stop-color="var(--glow)" stop-opacity=".22"/><stop offset="1" stop-color="var(--glow)" stop-opacity="0"/></radialGradient></defs>
  <ellipse cx="110" cy="230" rx="105" ry="210" fill="url(#aura)"/>
  <g class="body-base"><ellipse cx="110" cy="46" rx="22" ry="27"/><path d="M98 70h24l2 14H96z"/>
    <path d="M70 92q40-14 80 0l8 70q-6 52-14 66H76q-8-14-14-66z"/><path d="M78 228h64l6 30H72z"/>
    <path d="M62 94q-14 4-18 22l-10 76 12 2 14-70zM158 94q14 4 18 22l10 76-12 2-14-70z"/><path d="M34 192l-6 64 10 2 10-64zM186 192l6 64-10 2-10-64z"/>
    <path d="M74 256l-4 90 18 0 8-88zM146 256l4 90-18 0-8-88z"/><path d="M70 346l2 66 16 0 0-66zM150 346l-2 66-16 0 0-66z"/><path d="M68 412h24v10H62zM152 412h-24v10h30z"/></g>
  <circle class="${z('tete')}" cx="110" cy="44" r="12"/>
  <g class="${z('epaules')}"><circle cx="64" cy="98" r="9"/><circle cx="156" cy="98" r="9"/></g>
  <g class="${z('bras')}"><path d="M50 124l-8 62M170 124l8 62" /></g>
  <path class="${z('torse')}" d="M84 104q26 10 52 0" fill="none"/>
  <circle class="${z('coeur')}" cx="120" cy="124" r="7"/>
  <path class="${z('souffle')}" d="M96 140q14 8 28 0" fill="none"/>
  <g class="${z('hanches')}"><circle cx="86" cy="250" r="8"/><circle cx="134" cy="250" r="8"/></g>
  <g class="${z('articulations')}"><circle cx="80" cy="346" r="6"/><circle cx="140" cy="346" r="6"/></g>
  <g class="${z('jambes')}"><path d="M84 270l-6 70M136 270l6 70" /></g>
  <g class="${z('pieds')}"><path d="M66 426h28M126 426h28"/></g></svg>`;
}

export function render(ctx, app) {
  document.body.classList.add('scene');
  ctx.cleanup.push(() => document.body.classList.remove('scene'));
  const s = ctx.state, p = s.profile, o = s.orientation, status = computeAll(skills, s, index);
  const data = METRICS.map(m => ({m, h: history(s, m).sort((a, b) => String(b.date).localeCompare(String(a.date)))}));
  const known = data.filter(d => d.h.length), lit = new Set(known.flatMap(d => ZONES[d.m.cat]));
  const practiced = skills.filter(k => ['pratique', 'evalue', 'maitrise'].includes(status[k.id].stage)).length;
  const constated = skills.filter(k => status[k.id].mastery);
  const recent = s.sessions.filter(x => x.status !== 'importee-v1' && Date.now() - Date.parse(x.startedAt) < 30 * 864e5);
  const activeMin = Math.round(recent.reduce((t, x) => t + (x.activeSec ?? 0), 0) / 60);
  const sel = ctx.avatarAdd ?? null;
  app.innerHTML = page('Mon reflet', `${refletTabs('avatar')}
  <div class="sheet">
    <section class="sheet-id panel">
      <div class="reflet-3d" id="reflet-3d">${silhouette(lit)}</div>
      <div class="id-text"><span class="kicker">Fiche de personnage</span><h1>${esc(p.name || 'Pratiquant·e sans nom')}<span class="dot">.</span></h1>
        <form id="title-form" class="inline-form"><input name="title" maxlength="60" value="${esc(s.avatar.title)}" placeholder="Votre titre, ex. Escrimeur en reconversion" aria-label="Titre"><button>OK</button></form>
        <div class="voies-mini">${o ? VOIE_IDS.map(v => `<div title="${esc(VOIES[v].name)}">${sigil(v, 46, o.affinities[v])}<small>${esc(VOIES[v].short)}</small></div>`).join('') : '<a class="button primary" href="#orientation">Découvrir mes voies</a>'}</div>
        <dl class="kv"><dt>Expérience</dt><dd>${esc(EXPERIENCE[p.experience])}</dd>
          <dt>Disciplines</dt><dd>${p.disciplines.length ? p.disciplines.map(d => esc(d.name) + (d.years ? ` (${d.years} an${d.years > 1 ? 's' : ''})` : '')).join(', ') : '<span class="subtle">non renseignées</span>'}</dd>
          <dt>30 derniers jours</dt><dd>${recent.length} séance(s) · ${activeMin} min actives mesurées</dd>
          <dt>Arbre</dt><dd>${practiced} compétences pratiquées · ${constated.length} niveau(x) constaté(s) par un tiers</dd>
          <dt>Données connues</dt><dd>${known.length} / ${METRICS.length} <small class="subtle">(complétude de la fiche, pas un niveau)</small></dd></dl>
        <p><a href="#profil">Profil, contraintes, test de réaction →</a></p></div>
    </section>
    <section class="sheet-stats">${Object.entries(CATS).map(([cat, label]) => {
      const rows = data.filter(d => d.m.cat === cat);
      return `<div class="panel stat-cat ${rows.some(r => r.h.length) ? 'has' : ''} ${ctx.flash === cat ? 'flash' : ''}"><h2>${esc(label)}</h2>${rows.map(({m, h}) => `<div class="stat">
        <div><span>${esc(m.name)}</span>${h.length ? `<strong>${esc(h[0].text)}</strong><small>${fmtDate(h[0].date)} · <span class="origin o-${h[0].origin}">${esc(ORIGINS[h[0].origin])}</span>${h.length > 1 ? ` · ${h.length} valeurs` : ''}</small>`
          : '<em>inconnu</em>'}${h.length ? gradeChip(s, m, h[0]) : ''}</div>${spark(h)}
        ${m.app ? `<a class="button small" href="#profil">Tester</a>` : `<button class="small" data-add="${m.id}">${h.length ? '+' : 'Ajouter'}</button>`}</div>`).join('')}</div>`;
    }).join('')}</section>
  </div>
  ${sel ? addForm(METRICS.find(m => m.id === sel)) : ''}
  <section class="panel"><h2>Historique daté</h2>${known.length ? `<div class="scroll"><table><thead><tr><th>Date</th><th>Donnée</th><th>Valeur</th><th>Origine</th><th>Contexte</th><th></th></tr></thead><tbody>
    ${known.flatMap(d => d.h.map(x => ({...x, m: d.m}))).sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 60).map(x =>
      `<tr><td>${fmtDate(x.date)}</td><td>${esc(x.m.name)}</td><td>${esc(x.text)}</td><td><span class="origin o-${x.origin}">${esc(ORIGINS[x.origin])}</span></td><td><small>${esc(x.item.context ?? '')}</small></td>
      <td><button class="ghost" data-del="${x.m.kind}:${x.item.id}" aria-label="Supprimer">✕</button></td></tr>`).join('')}</tbody></table></div>`
    : '<p class="empty">Aucune donnée. Ajoutez une valeur que vous connaissez déjà : rien n’est inventé à votre place.</p>'}</section>
  ${gradesHtml(s)}
  <p class="subtle">Les statistiques sont vos valeurs brutes. Les rangs F à S ne viennent que de tables de normes publiées (sources ci-dessus) ; aucune donnée n’est convertie en niveau martial. « Vérifiée » signifie constatée par une autre personne ou un dispositif (compétition, entraîneur).</p>`);
  ctx.flash = null;
  const host3d = $('#reflet-3d');
  if (webglAvailable() && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const cats = [...new Set(known.map(d => d.m.cat))];
    mount3d(host3d, 'garde', {compact: true, glow: cats, dims: dimsFromState(s)})
      .then(stop => { if (host3d.isConnected) ctx.cleanup.push(stop); else stop(); }).catch(() => { host3d.innerHTML = silhouette(lit); });
  }
  app.querySelectorAll('[data-add]').forEach(b => b.onclick = () => { ctx.avatarAdd = b.dataset.add; ctx.render(); setTimeout(() => $('#add-form')?.scrollIntoView({behavior: 'smooth', block: 'center'}), 30); });
  $('#title-form').onsubmit = e => { e.preventDefault(); s.avatar = {...s.avatar, title: String(new FormData(e.target).get('title')).trim().slice(0, 60)}; ctx.save(); notify('Titre enregistré.'); };
  app.querySelectorAll('[data-del]').forEach(b => b.onclick = () => {
    if (!confirm('Supprimer cette valeur de votre historique ?')) return;
    const [kind, id] = b.dataset.del.split(':');
    if (kind === 'perf') s.performances = s.performances.filter(x => x.id !== id); else s.measurements = s.measurements.filter(x => x.id !== id);
    ctx.save(); ctx.render();
  });
  const f = $('#add-form');
  if (f) {
    $('#cancel-add').onclick = () => { ctx.avatarAdd = null; ctx.render(); };
    f.onsubmit = e => {
      e.preventDefault(); const d = new FormData(f), m = METRICS.find(x => x.id === sel), date = d.get('date') || null;
      if (m.kind === 'perf') {
        const perf = {id: uid(), exercise: m.ex, variant: String(d.get('variant') ?? '').trim(), load: numOrNull(d.get('load')), reps: numOrNull(d.get('reps')), sets: numOrNull(d.get('sets')),
          assistance: d.get('assistance') ?? 'aucune', extra: numOrNull(d.get('extra')), bodyweight: numOrNull(d.get('bodyweight')), date, context: String(d.get('context')).trim(), origin: d.get('origin'), createdAt: new Date().toISOString()};
        if (!validPerformance(perf)) return notify('Indiquez au moins une charge ou un nombre de répétitions plausibles.');
        pushLimited(s.performances, perf);
      } else {
        const a = A[m.test], value = a.input === 'number' ? numOrNull(d.get('value')) : null;
        const meas = {id: uid(), test: m.test, value, unit: a.unit, origin: d.get('origin'), date: date ? new Date(date + 'T12:00:00').toISOString() : new Date().toISOString(),
          context: String(d.get('context')).trim(), details: a.input === 'choice' ? {choice: d.get('choice')} : {}};
        if (!validMeasurement(meas) || (a.input === 'number' && (value === null || value < 0 || value > a.max))) return notify('Valeur invalide.');
        pushLimited(s.measurements, meas);
      }
      ctx.save(); ctx.avatarAdd = null; ctx.flash = m.cat; notify('Donnée ajoutée à votre reflet.'); ctx.render();
    };
  }
}

function addForm(m) {
  const a = m.kind === 'test' ? A[m.test] : null, perf = m.kind === 'perf' ? PERF_EXERCISES[m.ex] : null;
  return `<form id="add-form" class="panel add-form"><h2>${esc(m.name)}</h2>
  ${a ? `<p>${esc(a.protocol)}</p>${a.safety ? `<p class="notice">${esc(a.safety)}</p>` : ''}` : '<p class="subtle">Une série déjà réalisée suffit. N’allez pas chercher un maximum pour remplir la fiche.</p>'}
  <div class="row">${perf ? `<label>Charge (kg)<input name="load" inputmode="decimal" placeholder="${perf.load ? 'inconnue' : 'sans charge'}"></label><label>Répétitions<input name="reps" type="number" min="1" max="1000"></label>
    <label>Séries<input name="sets" type="number" min="1" max="100"></label>${perf.assist ? `<label>Assistance / lest<select name="assistance">${options(ASSIST, 'aucune')}</select></label><label>Lest / assistance (kg)<input name="extra" inputmode="decimal"></label>` : ''}
    <label>Variante<input name="variant" maxlength="80"></label><label>Poids du corps (kg)<input name="bodyweight" inputmode="decimal" placeholder="facultatif"></label>`
    : a.input === 'number' ? `<label>Valeur (${esc(a.unit)})<input name="value" inputmode="decimal" required></label>` : `<label>Résultat<select name="choice">${a.choices.map(c => `<option>${esc(c)}</option>`).join('')}</select></label>`}
    <label>Date<input name="date" type="date" max="${today()}"></label><label>Origine<select name="origin">${options(Object.fromEntries(Object.entries(ORIGINS).filter(([k]) => k !== 'mesuree')), 'declaree')}</select></label></div>
  <label>Contexte<input name="context" maxlength="300" placeholder="ex. en fin de séance, chronométré par mon entraîneur"></label>
  <div class="actions"><button class="primary">Ajouter à mon reflet</button><button type="button" id="cancel-add">Annuler</button></div></form>`;
}

// Rang F à S d'une mesure, seulement si une norme publiée existe pour ce test et que le profil (sexe, année) est renseigné.
function valueForNorm(m, last) {
  if (m.kind === 'test') return {test: m.test, value: last.item.value};
  const p = last.item;   // performance : seules les répétitions au poids du corps, sans assistance, se comparent aux normes
  return p.load === null && p.assistance === 'aucune' && p.reps !== null ? {test: 'perf:' + m.ex, value: p.reps} : null;
}
function gradeChip(s, m, last) {
  const v = valueForNorm(m, last);
  if (!v || !norms.some(n => n.test === v.test)) return '';
  const r = rate({norms, test: v.test, value: v.value, sex: s.profile.sex, birthYear: s.profile.birthYear, date: last.date});
  if (r.missing === 'profil') return '<small class="grade-miss"><a href="#profil">Rang : renseignez sexe et année de naissance</a></small>';
  if (r.missing) return '<small class="grade-miss">Pas de norme publiée applicable à votre profil</small>';
  const what = r.norm.kind === 'centiles' ? `centile ${r.score}` : `${r.score}/100 dans les catégories de la norme`;
  return `<span class="grade g-${r.grade}" title="${esc(`${what} — ${r.norm.source.label}`)}">${r.grade}<small>${r.score}</small></span>`;
}
function gradesHtml(s) {
  if (!norms.length) return '';
  return `<section class="panel"><h2>D’où viennent les rangs F à S</h2>
    <p>Score 0–100 : <strong>F</strong> &lt; 15 · <strong>E</strong> 15 · <strong>D</strong> 30 · <strong>C</strong> 45 · <strong>B</strong> 60 · <strong>A</strong> 75 · <strong>S</strong> ≥ 90.
    Quand la source publie des centiles, le score <em>est</em> le centile. Quand elle publie des catégories (« faible » à « excellent »), le score est la position dans ces catégories : ce n’est pas un centile.</p>
    ${!['f', 'h'].includes(s.profile.sex) || !Number.isInteger(s.profile.birthYear) ? '<p class="notice">Aucun rang calculé : indiquez votre sexe et votre année de naissance dans l’onglet <a href="#profil">Profil</a>.</p>' : ''}
    <ul>${norms.map(n => `<li><strong>${esc(n.name)}</strong> — ${esc(n.population)}. <a href="${esc(n.source.url)}" target="_blank" rel="noreferrer">${esc(n.source.label)}</a> <span class="rel r-${n.source.reliability}">${n.source.reliability === 'etabli' ? 'Établi' : 'Plausible'}</span></li>`).join('')}</ul>
    <p class="subtle">Les normes décrivent une population ; elles ne disent rien de votre valeur martiale. Une même mesure prise dans d’autres conditions n’est pas comparable.</p></section>`;
}
