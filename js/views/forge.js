// Forge de style : comprendre ce qui passe d'une discipline à l'autre, puis construire sa méthode (atelier).
import {disciplines, facets} from '../data/disciplines.js';
import {transferNotes} from '../data/transfers.js';
import {skills} from '../data/skills.js';
import {exercises} from '../data/exercises.js';
import {entries} from '../data/library.js';
import {analyze, transitionPlan} from '../engine/transfer.js';
import {hybridize, draftName} from '../engine/hybrid.js';
import {computeAll} from '../engine/progress.js';
import {index} from './tree.js';
import {still} from './movement.js';

// Séquence de garde disponible pour une discipline (illustration).
const GUARD_SEQ = {boxe: 'garde', escrime: 'escrime-garde', 'muay-thai': 'garde', karate: null, judo: null, lutte: null, jjb: null};
import {uid} from '../store.js';
import {$, esc, page, notify} from '../ui.js';

const REL = {etabli: 'Établi', plausible: 'Plausible', experimental: 'Expérimental'};
const exById = Object.fromEntries(exercises.map(e => [e.id, e])), entById = Object.fromEntries(entries.map(e => [e.id, e]));
const dName = id => (disciplines.find(d => d.id === id)?.name ?? id).split(' (')[0];
const drillLink = id => exById[id] ? `<a href="#entrainement/exercice/${id}">${esc(exById[id].name)}</a>` : entById[id] ? `<a href="#bibliotheque/${id}">${esc(entById[id].title)}</a>` : '';
const sourcesHtml = list => (list ?? []).length ? `<small class="srcs">Sources : ${list.map(x => x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noreferrer">${esc(x.label)}</a>` : esc(x.label)).join(' · ')}</small>` : '';
const fmt = (path, v) => typeof v === 'number' ? `<span title="${v}/3">${'●'.repeat(v)}${'○'.repeat(Math.max(0, 3 - v))}</span>` : esc((facets[path]?.labels?.[v] ?? v).split(' (')[0]);

function item(i, kind) {
  return `<li class="tf-item tf-${kind}"><div class="tf-head"><a href="#arbre/${i.skill.id}">${esc(i.skill.name)}</a>
    <span class="rel r-${i.reliability}" title="Fiabilité">${REL[i.reliability] ?? i.reliability}</span>${i.worked ? '<span class="pill jade">déjà travaillé</span>' : ''}</div>
    ${i.notes.length ? i.notes.map(n => `<p>${esc(n.text)}</p>${sourcesHtml(n.sources)}${(n.drills ?? []).length ? `<p class="subtle">Exercices : ${n.drills.map(drillLink).filter(Boolean).join(' · ')}</p>` : ''}`).join('')
      : `<p class="subtle">Déduction du modèle : importance ${i.a}/3 → ${i.b}/3${i.diffs.length ? ` ; diffère sur ${i.diffs.map(d => esc(d.label)).join(', ')}` : ''}.</p>`}</li>`;
}

export function render(ctx, app, [from, to]) {
  if (from === 'creer') return renderHybrid(ctx, app);
  document.body.classList.add('scene');
  ctx.cleanup.push(() => document.body.classList.remove('scene'));
  const s = ctx.state, t = s.orientation?.transfer;
  const same = (profileName, id) => profileName.toLowerCase().split(' (')[0] === dName(id).toLowerCase();
  const mineFirst = s.profile.disciplines.map(d => disciplines.find(x => same(d.name, x.id))?.id).find(Boolean);
  from = disciplines.some(d => d.id === from) ? from : t?.from ?? mineFirst ?? 'escrime';
  to = disciplines.some(d => d.id === to) && to !== from ? to : t?.to && t.to !== from ? t.to : (from === 'boxe' ? 'escrime' : 'boxe');
  const years = s.profile.disciplines.find(d => same(d.name, from))?.years ?? null;
  const status = computeAll(skills, s, index);
  const res = analyze({from, to, disciplines, notes: transferNotes, skills, facets, years, status}), plan = transitionPlan(res);
  const sel = (name, v) => `<select id="${name}">${disciplines.map(d => `<option value="${d.id}" ${d.id === v ? 'selected' : ''}>${esc(d.name)}</option>`).join('')}</select>`;
  app.innerHTML = page('Forge de style', `
  <section class="hero compact"><span class="kicker">Forge de style</span><h1>De ${esc(dName(from))} à ${esc(dName(to))}<span class="dot">.</span></h1>
    <p class="intro">Ce qui se transfère, ce qui doit être adapté, ce qui risque de gêner, ce qu’il faut construire. Une base de réflexion à éprouver avec un enseignant, pas un verdict.</p>
    <div class="tabs"><button aria-selected="true">Transfert entre disciplines</button><button data-go="forge/creer">Créer un style</button><button data-go="atelier">Atelier de méthode</button></div></section>
  <div class="pair panel"><label>Discipline d’origine ${sel('from', from)}</label><button id="swap" aria-label="Inverser">⇄</button><label>Discipline visée ${sel('to', to)}</label>
    <p class="subtle">${years !== null ? `${years} an(s) déclarés en ${esc(dName(from))}${res.ingrained ? ' : vos automatismes sont probablement solides, les risques d’interférence sont mis en avant.' : '.'}` : 'Ancienneté non renseignée dans votre profil.'}</p></div>
  <section class="panel"><h2>Ce qui change concrètement</h2><div class="facets">
    ${res.diffs.length ? res.diffs.map(d => `<div class="facet"><span>${esc(d.label)}</span><b>${fmt(d.path, d.from)}</b><i>→</i><b>${fmt(d.path, d.to)}</b></div>`).join('') : '<p class="subtle">Peu de différences de cadre.</p>'}</div>
    <div class="split even"><p><strong>${esc(dName(from))}.</strong> ${esc(res.from.summary)}</p><p><strong>${esc(dName(to))}.</strong> ${esc(res.to.summary)}</p></div></section>
  ${GUARD_SEQ[from] && GUARD_SEQ[to] && GUARD_SEQ[from] !== GUARD_SEQ[to] ? `<section class="panel"><h2>Les deux gardes, côte à côte</h2>
    <div class="split even guards"><figure><div class="study-wrap">${still(GUARD_SEQ[from], 0, 'gf', {ghosts: false, tracks: false, com: true, height: 300})}</div><figcaption>${esc(dName(from))}</figcaption></figure>
    <figure><div class="study-wrap">${still(GUARD_SEQ[to], 0, 'gt', {ghosts: false, tracks: false, com: true, height: 300})}</div><figcaption>${esc(dName(to))}</figcaption></figure></div>
    <p class="subtle">Vue de profil, poses illustratives. Le point doré est le centre de masse estimé, la barre au sol la base d’appui. <a href="#bibliotheque/${from === 'escrime' ? 'escrime-garde' : 'garde'}">Voir en 3D dans la bibliothèque</a></p></section>` : ''}
  <div class="tf-grid">
    <section class="panel"><h2>Se transfère</h2><ul class="tf">${res.transfer.map(i => item(i, 'transfer')).join('') || '<li class="subtle">Rien de net.</li>'}</ul></section>
    <section class="panel"><h2>À adapter</h2><ul class="tf">${res.adapt.map(i => item(i, 'adapt')).join('') || '<li class="subtle">Rien de net.</li>'}</ul></section>
    <section class="panel"><h2>Risques d’interférence</h2><ul class="tf">${res.risk.map(i => item(i, 'risk')).join('') || '<li class="subtle">Pas de conflit d’habitude détecté.</li>'}</ul></section>
    <section class="panel"><h2>À construire</h2><ul class="tf">${res.build.map(i => item(i, 'build')).join('') || '<li class="subtle">Rien de spécifique.</li>'}</ul></section>
  </div>
  ${res.general.length ? `<section class="panel"><h2>Repères généraux</h2>${res.general.map(n => `<p><span class="rel r-${n.reliability}">${REL[n.reliability]}</span> ${esc(n.text)}</p>${sourcesHtml(n.sources)}`).join('')}</section>` : ''}
  <section class="panel ink"><h2>Plan de transition proposé</h2>
    <ol class="phases">${plan.map(ph => `<li><h3>${esc(ph.title)}</h3><p class="subtle">${esc(ph.why)}</p><p>${ph.items.map(i => `<a class="chip" href="#arbre/${i.skill.id}">${esc(i.skill.name)}</a>`).join(' ')}</p>
      ${ph.drills.length ? `<p>Exercices : ${ph.drills.map(drillLink).filter(Boolean).join(' · ')}</p>` : ''}</li>`).join('')}</ol>
    <div class="actions"><button class="primary" id="to-method">Créer une méthode d’adaptation dans l’atelier</button></div>
    <p class="subtle">« Expérimental » : déduction du modèle de facettes de LA FORGE. « Plausible » / « Établi » : notes appuyées sur des sources. Voir docs/RECHERCHE_TRANSFERT.md.</p></section>`);
  const go = () => ctx.go(`forge/${$('#from').value}/${$('#to').value}`);
  $('#from').onchange = go; $('#to').onchange = go;
  $('#swap').onclick = () => ctx.go(`forge/${to}/${from}`);
  app.querySelectorAll('.tabs [data-go]').forEach(b => b.onclick = () => ctx.go(b.dataset.go));
  $('#to-method').onclick = () => {
    const now = new Date().toISOString(), els = [];
    for (const [list, label] of [[res.risk, 'Risque à surveiller'], [res.adapt, 'À adapter'], [res.build, 'À construire'], [res.transfer, 'À réinvestir']])
      for (const i of list.slice(0, 4)) els.push({id: uid(), ref: (i.skill.library ?? [])[0] ?? null, label: i.skill.name.slice(0, 120), note: label, status: list === res.transfer ? 'retenu' : 'a-explorer'});
    s.workshop.methods.unshift({id: uid(), name: `${dName(from)} → ${dName(to)}`, createdAt: now, origin: {type: 'adaptation', discipline: dName(from)},
      intentions: `Réutiliser mon expérience de ${dName(from)} pour progresser en ${dName(to)}.`, context: '', elements: els.slice(0, 16), sequences: [], trials: [],
      decisions: [{date: now, text: 'Méthode créée depuis la Forge de style (analyse de transfert).'}]});
    ctx.save(); notify('Méthode créée dans l’atelier.'); ctx.go('atelier/' + s.workshop.methods[0].id);
  };
}

// ——— Créer un style qui n'existe pas encore (mélange pondéré de 2 ou 3 disciplines) ———
function renderHybrid(ctx, app) {
  document.body.classList.add('scene');
  ctx.cleanup.push(() => document.body.classList.remove('scene'));
  const s = ctx.state;
  ctx.hybrid ??= {mix: {escrime: 60, boxe: 40}, choices: {}, name: ''};
  const H = ctx.hybrid, picked = Object.entries(H.mix).filter(([, w]) => w > 0), sum = picked.reduce((a, [, x]) => a + x, 0);
  let res = null;
  try { res = picked.length >= 2 ? hybridize({sources: picked.map(([id, weight]) => ({id, weight})), disciplines, skills, facets, entries}) : null; } catch { res = null; }
  const choice = g => H.choices[g.path] ?? g.choice, lab = (g, v) => g.options.find(o => o.value === v)?.label ?? v;
  const bar = v => `<span title="${v}/3">${'●'.repeat(Math.floor(v))}${v % 1 ? '◐' : ''}${'○'.repeat(Math.max(0, 3 - Math.ceil(v)))}</span>`;
  app.innerHTML = page('Forge de style', `
  <section class="hero compact"><span class="kicker">Forge de style</span><h1>Forger un style qui n’existe pas encore<span class="dot">.</span></h1>
    <p class="intro">Choisissez deux ou trois disciplines et leur poids. La forge en tire les piliers, une garde de synthèse, ce que chacune apporte, les habitudes qui se contredisent et un premier parcours de techniques.
    Tout est <span class="rel r-experimental">expérimental</span> : une base de travail à éprouver, pas un style validé.</p>
    <div class="tabs"><button data-go="forge">Transfert entre disciplines</button><button aria-selected="true">Créer un style</button><button data-go="atelier">Atelier de méthode</button></div></section>
  <section class="panel"><h2>Les ingrédients</h2><div class="mix">${disciplines.map(d => { const w = H.mix[d.id] ?? 0;
    return `<label class="mix-row ${w ? 'on' : ''}"><input type="checkbox" data-disc="${d.id}" ${w ? 'checked' : ''} ${!w && picked.length >= 3 ? 'disabled' : ''}> <span>${esc(dName(d.id))}</span>
      <input type="range" min="10" max="100" step="5" value="${w || 50}" data-weight="${d.id}" ${w ? '' : 'disabled'} aria-label="Poids de ${esc(dName(d.id))}"><output>${w ? Math.round(100 * w / sum) + ' %' : ''}</output></label>`; }).join('')}</div>
    <p class="subtle">Trois disciplines au plus. Le poids dit laquelle donne le ton quand elles se contredisent.</p></section>
  ${res ? `
  <div class="split even">
    <section class="panel ink"><h2>La garde de synthèse</h2><div id="hy-3d" class="hy-3d"></div>
      <p class="subtle">Corps d’ombre à vos proportions ; rotation des hanches, écart des appuis et orientation des pieds mélangés selon les poids.</p></section>
    <section class="panel"><h2>Le cadre du style</h2>
      ${res.guard.map(g => `<div class="hy-facet"><strong>${esc(g.name)}</strong>${g.agreed ? `<span>${esc(g.choiceLabel.split(' (')[0])} <small class="subtle">(commun)</small></span>`
        : `<span class="hy-choice">${g.options.map(o => `<label><input type="radio" name="hy-${g.path}" value="${esc(o.value)}" data-facet="${g.path}" ${o.value === choice(g) ? 'checked' : ''}> ${esc(o.label.split(' (')[0])} <small class="subtle">${o.from.map(dName).join(', ')}</small></label>`).join('')}</span>`}</div>`).join('')}
      <div class="hy-facet"><strong>Distances</strong><span>${Object.entries(res.scales.distances).map(([k, v]) => `${esc(facets.distances.labels[k].split(' (')[0])} ${bar(v)}`).join(' · ')}</span></div>
      <div class="hy-facet"><strong>Déplacements</strong><span>${Object.entries(res.scales.movement).map(([k, v]) => `${esc(k)} ${bar(v)}`).join(' · ')}</span></div>
      <div class="hy-facet"><strong>Outils</strong><span>${res.tools.map(esc).join(', ')}</span></div></section>
  </div>
  <section class="panel"><h2>Les piliers</h2><p>${res.piliers.map(p => `<a class="chip" href="#arbre/${p.skill.id}">${esc(p.skill.name)}</a>`).join(' ')}</p>
    <p class="subtle">Compétences jugées centrales par l’ensemble du mélange (moyenne pondérée des notes 0 à 3).</p></section>
  <div class="split even">
    <section class="panel"><h2>Ce que chacune apporte</h2>${res.apports.length ? `<ul>${res.apports.map(a => `<li><a href="#arbre/${a.skill.id}">${esc(a.skill.name)}</a> <small class="subtle">— ${a.from.map(dName).join(', ')}</small></li>`).join('')}</ul>` : '<p class="subtle">Les disciplines se recouvrent beaucoup.</p>'}</section>
    <section class="panel"><h2>Habitudes qui se contredisent</h2>${res.frictions.length ? `<ul>${res.frictions.map(f => `<li><strong>${esc(f.label)}</strong> <small class="subtle">— ${f.between.map(dName).join(' / ')}</small></li>`).join('')}</ul>
      <p class="subtle">Les points à trancher et à entraîner à part : un mélange mal tranché crée des hésitations.</p>` : '<p class="subtle">Pas de contradiction forte.</p>'}</section>
  </div>
  <section class="panel ink"><h2>Premier parcours de techniques</h2>
    <ol class="hy-path">${res.techniques.map(t => `<li><a href="#bibliotheque/${t.entry.id}">${esc(t.entry.title)}</a>${t.after.length ? ` <small class="subtle">après ${esc(entById[t.after[0]]?.title ?? '')}</small>` : ''}</li>`).join('')}</ol>
    <label>Nom de votre style<input id="hy-name" maxlength="100" value="${esc(H.name || draftName(res))}"></label>
    <div class="actions"><button class="primary" id="hy-create">Forger ce style dans l’atelier</button></div>
    <p class="subtle">L’atelier reprend le cadre, les points à trancher et les techniques en chaînes : c’est là que le style devient le vôtre (arbre propre, essais, décisions).</p></section>` : '<section class="panel"><p class="empty">Choisissez au moins deux disciplines.</p></section>'}`);
  app.querySelectorAll('.tabs [data-go]').forEach(b => b.onclick = () => ctx.go(b.dataset.go));
  app.querySelectorAll('[data-disc]').forEach(c => c.onchange = () => { if (c.checked) H.mix[c.dataset.disc] = 50; else delete H.mix[c.dataset.disc]; ctx.render(); });
  app.querySelectorAll('[data-weight]').forEach(r => r.onchange = () => { H.mix[r.dataset.weight] = Number(r.value); ctx.render(); });
  app.querySelectorAll('[data-facet]').forEach(r => r.onchange = () => { H.choices[r.dataset.facet] = r.value; });
  if (!res) return;
  $('#hy-name').oninput = e => { H.name = e.target.value; };
  const host = $('#hy-3d');
  import('./mannequin3d.js').then(m => m.webglAvailable() ? m.mount3d(host, 'garde', {compact: true, d3: res.d3, dims: m.dimsFromState(s)}) : null)
    .then(stop => { if (stop) { if (host.isConnected) ctx.cleanup.push(stop); else stop(); } }).catch(() => {});
  $('#hy-create').onclick = () => {
    const now = new Date().toISOString(), name = ($('#hy-name').value.trim() || draftName(res)).slice(0, 100);
    const idOf = {}, els = [];
    for (const g of res.guard) els.push({id: uid(), ref: null, label: `Cadre — ${g.name} : ${lab(g, choice(g)).split(' (')[0]}`.slice(0, 120), note: g.agreed ? 'Commun aux disciplines sources.' : 'Choix tranché à la création ; à éprouver.', status: 'retenu'});
    for (const f of res.frictions.slice(0, 5)) els.push({id: uid(), ref: null, label: `Point à trancher — ${f.label}`.slice(0, 120), note: `Habitudes opposées : ${f.between.map(dName).join(' / ')}.`, status: 'a-explorer'});
    for (const t of res.techniques) { const id = uid(); idOf[t.entry.id] = id; els.push({id, ref: t.entry.id, label: t.entry.title.slice(0, 120), note: 'Proposée par la forge.', status: 'a-explorer', after: t.after.map(a => idOf[a]).filter(Boolean)}); }
    s.workshop.methods.unshift({id: uid(), name, createdAt: now, origin: {type: 'hybride', discipline: res.sources.map(x => dName(x.id)).join(' + '), sources: res.sources.map(x => ({id: x.id, weight: x.weight}))},
      intentions: `Style hybride : ${res.sources.map(x => `${dName(x.id)} ${Math.round(x.weight * 100)} %`).join(', ')}. Piliers : ${res.piliers.map(p => p.skill.name).join(', ')}.`.slice(0, 2000), context: '',
      elements: els.slice(0, 300), sequences: [], trials: [], decisions: [{date: now, text: 'Style créé dans la Forge (mélange pondéré, fiabilité expérimentale).'}]});
    ctx.hybrid = null; ctx.save(); notify('Style forgé : il vous attend dans l’atelier.'); ctx.go('atelier/' + s.workshop.methods[0].id);
  };
}
