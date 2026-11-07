// Arbre de compétences : constellation radiale, déplacement et zoom, panneau de nœud avec preuves de progression.
import {skills, skillById, branches, capacityToSkill} from '../data/skills.js';
import {VOIES} from '../data/orientation.js';
import {entries} from '../data/library.js';
import {exercises} from '../data/exercises.js';
import {assessments} from '../data/assessments.js';
import {PERF_EXERCISES, EVAL_BY, ORIGINS} from '../store.js';
import {buildIndex, computeAll, branchSummary, addTrace, STAGE_LABEL} from '../engine/progress.js';
import {checkGraph} from '../engine/graph.js';
import {levels} from '../engine/method.js';
import {$, esc, page, fmtDate, notify} from '../ui.js';

export const index = buildIndex(skills, entries, exercises, capacityToSkill);
const entryById = Object.fromEntries(entries.map(e => [e.id, e]));
const exById = Object.fromEntries(exercises.map(e => [e.id, e]));
const testName = ref => { const [k, id] = ref.split(':'); return k === 'perf' ? PERF_EXERCISES[id]?.name ?? id : assessments.find(a => a.id === id)?.name ?? (id.startsWith('reaction') ? 'Test de réaction' : id); };
const ROMAN = ['', 'I', 'II', 'III'];
const deg = a => a * Math.PI / 180;

// ——— Disposition radiale ———
export function treeLayout() {
  const main = branches.filter(b => b.angle !== null), pos = {};
  const width = b => { const per = {}; skills.filter(s => s.branch === b.id).forEach(s => per[s.depth] = (per[s.depth] ?? 0) + 1); return Math.max(...Object.values(per)); };
  const total = main.reduce((s, b) => s + width(b) + 1, 0);
  let start = -90 - 360 * (width(main[0]) + 1) / total / 2;
  const sectors = {};
  for (const b of main) {
    const span = 360 * (width(b) + 1) / total;
    sectors[b.id] = {from: start, to: start + span, mid: start + span / 2};
    const nodes = skills.filter(s => s.branch === b.id), depths = [...new Set(nodes.map(s => s.depth))].sort((x, y) => x - y);
    for (const [ring, d] of depths.entries()) {
      // Rayon assez grand pour garder ≈ 135 unités entre deux nœuds voisins d'un même anneau.
      const row = nodes.filter(s => s.depth === d), r = Math.max(240 + ring * 165, (row.length + 1) * 135 / deg(span));
      row.forEach((s, i) => { const a = start + span * (i + 1) / (row.length + 1); pos[s.id] = {x: r * Math.cos(deg(a)), y: r * Math.sin(deg(a)), a, r}; });
    }
    start += span;
  }
  const outer = Math.max(...Object.values(pos).map(p => p.r)) + 150;
  const spe = skills.filter(s => s.branch === 'spe').map(s => {
    const v = s.prerequisites.reduce((acc, p) => [acc[0] + Math.cos(deg(pos[p].a)), acc[1] + Math.sin(deg(pos[p].a))], [0, 0]);
    return {s, a: Math.atan2(v[1], v[0]) * 180 / Math.PI};
  }).sort((x, y) => x.a - y.a);
  for (let k = 0; k < 4; k++) for (let i = 1; i < spe.length; i++) if (spe[i].a - spe[i - 1].a < 26) { spe[i].a = spe[i - 1].a + 26; }
  for (const {s, a} of spe) pos[s.id] = {x: outer * Math.cos(deg(a)), y: outer * Math.sin(deg(a)), a, r: outer};
  const t = skills.find(s => s.branch === 'trans'), ta = (pos['lecture-adaptation'].a + 25);
  pos[t.id] = {x: (outer + 120) * Math.cos(deg(ta)), y: (outer + 120) * Math.sin(deg(ta)), a: ta, r: outer + 120};
  const xs = Object.values(pos).map(p => p.x), ys = Object.values(pos).map(p => p.y), m = 90;
  const box = [Math.min(...xs) - m, Math.min(...ys) - m, Math.max(...xs) - Math.min(...xs) + 2 * m, Math.max(...ys) - Math.min(...ys) + 2 * m + 30];
  return {pos, sectors, extent: outer + 200, box, rings: [...new Set(Object.values(pos).filter(p => p.r < outer - 100).map(p => Math.round(p.r)))]};
}
const LAYOUT = treeLayout();

function nodeSvg(sk, st, sel, key = false) {
  const {x, y} = LAYOUT.pos[sk.id], big = sk.branch === 'spe' || sk.branch === 'trans', r = big ? 32 : 25;
  const prog = Math.min(1, st.practiceCount / 8), C = 2 * Math.PI * (r + 5);
  const marks = [st.self.length ? `<path class="m-auto" d="M${x + r * .7} ${y - r - 6}l5 5-5 5-5-5z"/>` : '',
    st.measures.length || st.tests.length ? `<path class="m-test" d="M${x} ${y - r - 6}l5 5-5 5-5-5z"/>` : '',
    st.external.length ? `<path class="m-ext" d="M${x - r * .7} ${y - r - 6}l5 5-5 5-5-5z"/>` : ''].join('');
  const words = sk.name.split(' '), lines = [];
  for (const w of words) { if (lines.length && (lines.at(-1) + ' ' + w).length <= 14) lines[lines.length - 1] += ' ' + w; else lines.push(w); }
  return `<g class="node st-${st.stage} br-${sk.branch} ${st.available ? 'avail' : 'locked'} ${sel ? 'sel' : ''} ${key ? 'voie-key' : ''}" data-node="${sk.id}" tabindex="0" role="button"
    aria-label="${esc(sk.name)} : ${STAGE_LABEL[st.stage]}${st.mastery ? ', niveau ' + st.mastery : ''}">
    <circle class="halo" cx="${x}" cy="${y}" r="${r + 12}"/>${key ? `<circle class="keyring" cx="${x}" cy="${y}" r="${r + 17}"/>` : ''}
    <circle class="track" cx="${x}" cy="${y}" r="${r + 5}"/>
    ${prog ? `<circle class="prog" cx="${x}" cy="${y}" r="${r + 5}" stroke-dasharray="${C * prog} ${C}" transform="rotate(-90 ${x} ${y})"/>` : ''}
    <circle class="core" cx="${x}" cy="${y}" r="${r}"/>
    ${st.mastery ? `<text class="lvl" x="${x}" y="${y + 5}">${ROMAN[st.mastery]}</text>` : `<circle class="pip" cx="${x}" cy="${y}" r="${st.stage === 'inconnu' ? 2 : 4}"/>`}
    ${marks}
    ${lines.map((l, i) => `<text class="lab" x="${x}" y="${y + r + 24 + i * 18}">${esc(l)}</text>`).join('')}</g>`;
}

export function render(ctx, app, [selId]) {
  document.body.classList.add('scene');
  ctx.cleanup.push(() => document.body.classList.remove('scene'));
  const s = ctx.state, status = computeAll(skills, s, index), sum = branchSummary(skills, status), check = checkGraph(skills);
  const sel = skillById[selId] ? selId : null;
  const voie = VOIES[s.orientation?.primary], keys = new Set(voie?.keySkills ?? []);
  const lit = (a, b) => ['pratique', 'evalue', 'maitrise'].includes(status[a].stage) && ['pratique', 'evalue', 'maitrise'].includes(status[b].stage);
  const edges = skills.flatMap(sk => sk.prerequisites.map(p => {
    const A = LAYOUT.pos[p], B = LAYOUT.pos[sk.id], mx = (A.x + B.x) / 2 * 0.86, my = (A.y + B.y) / 2 * 0.86;
    const onPath = sel && (sel === sk.id || sel === p);
    return `<path class="edge ${lit(p, sk.id) ? 'lit' : ''} ${onPath ? 'path' : ''}" d="M${A.x} ${A.y}Q${mx} ${my} ${B.x} ${B.y}"/>`;
  })).join('');
  const sectorLabels = branches.filter(b => LAYOUT.sectors[b.id]).map(b => {
    const m = LAYOUT.sectors[b.id].mid, x = 150 * Math.cos(deg(m)), y = 150 * Math.sin(deg(m)), c = sum[b.id];
    return `<g class="sector"><text x="${x}" y="${y}" class="sec-name">${esc(b.name.toUpperCase())}</text><text x="${x}" y="${y + 22}" class="sec-count">${c.pratique + c.evalue + c.maitrise} / ${c.total} engagés</text></g>`;
  }).join('');
  const E = LAYOUT.extent;
  const mode = ctx.treeMode ??= (innerWidth < 760 ? 'liste' : 'carte');
  app.innerHTML = page('Arbre de compétences', `
  <section class="hero compact"><span class="kicker">Arbre de compétences</span><h1>Ce qui se construit<span class="dot">.</span></h1>
    <p class="intro">Chaque nœud est une compétence réelle, reliée à des fiches à étudier, des exercices à pratiquer et des tests. Un nœud ne devient « maîtrisé » que lorsqu’une personne qualifiée l’a constaté.</p>
    <div class="tabs" role="group" aria-label="Affichage"><button data-mode="carte" aria-selected="${mode === 'carte'}">Constellation</button><button data-mode="liste" aria-selected="${mode === 'liste'}">Liste en chaînes</button></div></section>
  ${check.ok ? '' : `<div class="notice error">Incohérence de l’arbre : ${esc([...check.missing, ...check.cycles].join(' ; '))}</div>`}
  <div class="tree-shell ${mode}">
    ${mode === 'liste' ? listHtml(s, status, sel, keys) : `<div class="tree-stage" id="stage">
      <svg class="skilltree" id="tree" viewBox="${LAYOUT.box.join(' ')}" role="group" aria-label="Arbre de compétences">
        <defs><radialGradient id="core-glow"><stop offset="0" stop-color="var(--glow)" stop-opacity=".55"/><stop offset="1" stop-color="var(--glow)" stop-opacity="0"/></radialGradient></defs>
        <g id="viewport">
          ${LAYOUT.rings.map(r => `<circle class="ring" r="${r}"/>`).join('')}
          ${Object.values(LAYOUT.sectors).map(sc => `<line class="spoke" x1="${90 * Math.cos(deg(sc.from))}" y1="${90 * Math.sin(deg(sc.from))}" x2="${(E - 120) * Math.cos(deg(sc.from))}" y2="${(E - 120) * Math.sin(deg(sc.from))}"/>`).join('')}
          ${edges}
          <circle r="90" fill="url(#core-glow)"/><circle class="center" r="58"/><text class="center-t" y="-2">VOUS</text>
          <text class="center-s" y="20">${s.orientation ? 'orientation faite' : 'orientation à faire'}</text>
          ${sectorLabels}
          ${skills.map(sk => nodeSvg(sk, status[sk.id], sk.id === sel, keys.has(sk.id))).join('')}
        </g>
      </svg>
      <div class="tree-find"><input id="find" list="skill-names" placeholder="Trouver une compétence…" aria-label="Trouver une compétence"><datalist id="skill-names">${skills.map(k => `<option value="${esc(k.name)}">`).join('')}</datalist>
        ${voie ? `<span class="pill voie-pill">◌ Parcours de la ${esc(voie.name)}</span>` : ''}</div>
      <div class="tree-tools"><button data-z="1.25" aria-label="Zoomer">+</button><button data-z="0.8" aria-label="Dézoomer">−</button><button data-z="0" aria-label="Recentrer">⟲</button></div>
      <div class="legend"><span><i class="lg st-decouvert"></i>Découvert</span><span><i class="lg st-etudie"></i>Étudié</span><span><i class="lg st-pratique"></i>Pratiqué (anneau = nombre de pratiques)</span>
        <span><i class="lg avail"></i>Disponible</span><span><b class="d auto"></b>Auto-évaluation</span><span><b class="d test"></b>Mesure / test</span><span><b class="d ext"></b>Évaluation externe</span><span><i class="lg st-maitrise"></i>Maîtrise constatée</span></div>
    </div>`}
    <aside class="tree-panel ${sel ? 'open' : ''}" id="panel" aria-live="polite">${sel ? panel(skillById[sel], status, s) : intro(sum)}</aside>
  </div>`);
  wire(ctx, app, sel);
}

function intro(sum) {
  return `<h2>Lire l’arbre</h2><p>Au centre, vous. Cinq branches de fondations rayonnent : <strong>Corps</strong>, <strong>Appuis</strong>, <strong>Actions</strong>, <strong>Défense</strong> et <strong>Lecture</strong>.
  En périphérie, les <strong>spécialisations</strong> (disciplines) se nourrissent des fondations qui leur importent le plus.</p>
  <p>Un nœud est <em>disponible</em> quand ses prérequis ont été pratiqués. Rien n’est verrouillé : on peut toujours explorer.</p>
  <dl class="kv">${branches.filter(b => sum[b.id]).map(b => `<dt>${esc(b.name)}</dt><dd>${sum[b.id].etudie + sum[b.id].pratique + sum[b.id].evalue + sum[b.id].maitrise} engagés · ${sum[b.id].maitrise} constatés / ${sum[b.id].total}</dd>`).join('')}</dl>
  <p class="subtle">Choisissez un nœud pour voir pourquoi il compte et comment le faire progresser.</p>`;
}

function panel(sk, status, s) {
  const st = status[sk.id], br = branches.find(b => b.id === sk.branch);
  const dependents = skills.filter(x => x.prerequisites.includes(sk.id));
  const chip = id => `<a class="chip st-${status[id].stage}" href="#arbre/${id}">${esc(skillById[id].name)}</a>`;
  return `<button class="ghost close" data-close aria-label="Fermer">✕</button>
  <span class="kind">${esc(br.name)}${sk.discipline ? ' · spécialisation' : ''}</span>
  <h2>${esc(sk.name)}</h2>
  <p><span class="pill stage st-${st.stage}">${STAGE_LABEL[st.stage]}${st.mastery ? ` · niveau ${ROMAN[st.mastery]}` : ''}</span>${st.self.length && !st.mastery ? `<span class="pill">auto-évalué ${ROMAN[st.selfLevel]}</span>` : ''}${st.available ? '<span class="pill jade">Prérequis pratiqués</span>' : ''}</p>
  <p>${esc(sk.why)}</p>
  ${sk.prerequisites.length ? `<h3>S’appuie sur</h3><div class="chips">${sk.prerequisites.map(chip).join('')}</div>` : ''}
  ${dependents.length ? `<h3>Ouvre vers</h3><div class="chips">${dependents.map(x => chip(x.id)).join('')}</div>` : ''}
  <h3>1 · Étudier</h3>${st.libs.length ? `<ul>${st.libs.map(id => `<li><a href="#bibliotheque/${id}">${esc(entryById[id]?.title ?? id)}</a>${s.library.consulted[id] ? ' <small>· consultée</small>' : ''}</li>`).join('')}</ul>` : '<p class="subtle">Pas encore de fiche reliée.</p>'}
  ${st.studied ? `<p class="subtle">Étudié le ${fmtDate(st.studied)}${st.studiedAuto ? ' (fiche consultée)' : ''}.</p>` : `<button data-act="study">J’ai étudié cette compétence</button>`}
  <h3>2 · Pratiquer</h3>${st.exercises.length ? `<p>${st.exercises.slice(0, 6).map(id => `<a href="#entrainement/exercice/${id}">${esc(exById[id]?.name ?? id)}</a>`).join(' · ')}</p>` : ''}
  <p>${st.practiceCount ? `${st.practiceCount} pratique(s) consignée(s), dernière le ${fmtDate(st.lastPractice)}.` : 'Aucune pratique consignée.'}</p>
  <button data-act="practice">Consigner une pratique aujourd’hui</button>
  <h3>3 · Mesurer</h3>${(sk.tests ?? []).length ? `<ul>${sk.tests.map(ref => { const m = st.measures.find(x => x.ref === ref); return `<li>${esc(testName(ref))} — ${m ? `<strong>${esc(m.item.value ?? m.item.details?.choice ?? (m.item.load !== undefined ? (m.item.load !== null ? m.item.load + ' kg' : '') + (m.item.reps ? ' × ' + m.item.reps : '') : ''))} ${m.item.unit ? esc(m.item.unit) : ''}</strong> <small>${fmtDate(m.date)} · ${esc(ORIGINS[m.origin] ?? m.origin)}</small>` : '<span class="subtle">inconnu</span>'}</li>`; }).join('')}</ul>
    <a href="#avatar">Compléter dans ma fiche de personnage →</a>` : '<p class="subtle">Pas de test objectif simple pour cette compétence : elle s’évalue par observation.</p>'}
  <h3>4 · Évaluer</h3>
  <ol class="levels">${sk.levels.map(l => `<li class="${st.mastery >= l.level ? 'got' : ''}"><strong>${ROMAN[l.level]} · ${esc(l.label)}</strong> — ${esc(l.criterion)}</li>`).join('')}</ol>
  ${[...st.external, ...st.self].slice(0, 4).map(e => `<p class="ev ${e.by}"><small>${fmtDate(e.date)} · ${esc(EVAL_BY[e.by])}${e.evaluator ? ' · ' + esc(e.evaluator) : ''}</small><br>Niveau ${ROMAN[e.level]}${e.note ? ' — ' + esc(e.note) : ''}</p>`).join('')}
  <details><summary>Auto-évaluation</summary><form data-form="auto"><p class="subtle">Votre ressenti, affiché comme tel. Il ne vaut pas maîtrise.</p>
    <div class="chips">${[1, 2, 3].map(l => `<label><input type="radio" name="level" value="${l}" ${l === 1 ? 'checked' : ''}>${ROMAN[l]}</label>`).join('')}</div>
    <label>Note<input name="note" maxlength="300"></label><button>Enregistrer</button></form></details>
  <details><summary>Évaluation par une personne qualifiée</summary><form data-form="externe">
    <label>Qui a évalué (nom et rôle)<input name="evaluator" maxlength="100" required placeholder="ex. M. Dupont, entraîneur du club"></label>
    <div class="chips">${[1, 2, 3].map(l => `<label><input type="radio" name="level" value="${l}" ${l === 1 ? 'checked' : ''}>${ROMAN[l]}</label>`).join('')}</div>
    <label>Remarques<input name="note" maxlength="300"></label>
    <label class="check"><input type="checkbox" name="honest" required>Cette évaluation a réellement été faite par cette personne, en présence.</label><button>Enregistrer</button></form></details>`;
}

function wire(ctx, app, sel) {
  app.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => { ctx.treeMode = b.dataset.mode; ctx.render(); });
  const svg = $('#tree'), vp = $('#viewport'), stage = $('#stage');
  if (svg) wireMap(ctx, app, sel, svg, vp, stage);
  else app.querySelectorAll('[data-node]').forEach(n => n.addEventListener('click', e => { e.preventDefault(); ctx.go('arbre/' + n.dataset.node); setTimeout(() => $('#panel')?.scrollIntoView({behavior: 'smooth', block: 'start'}), 60); }));
  wirePanel(ctx, app, sel);
}

function wireMap(ctx, app, sel, svg, vp, stage) {
  const view = ctx.treeView ??= {x: 0, y: 0, k: 1};
  const box = LAYOUT.box, apply = () => {
    vp.setAttribute('transform', `translate(${view.x} ${view.y}) scale(${view.k})`);
    // Niveau de détail : en vue d'ensemble, on n'affiche que les noms des spécialisations et des branches.
    svg.classList.toggle('far', view.k * svg.clientWidth / box[2] < 0.5);
  };
  const centerOn = (id, k = Math.max(view.k, 1.6)) => {
    const p = LAYOUT.pos[id], cx = box[0] + box[2] / 2, cy = box[1] + box[3] / 2;
    Object.assign(view, {k, x: cx - p.x * k, y: cy - p.y * k}); apply();
  };
  if (sel && ctx.centerNext) { centerOn(sel); ctx.centerNext = false; }
  apply();
  $('#find').addEventListener('change', e => { const k = skills.find(x => x.name.toLowerCase() === e.target.value.trim().toLowerCase()); if (k) { ctx.centerNext = true; ctx.go('arbre/' + k.id); } });
  const toSvg = (cx, cy) => { const pt = svg.createSVGPoint(); pt.x = cx; pt.y = cy; return pt.matrixTransform(svg.getScreenCTM().inverse()); };
  const zoomAt = (f, cx, cy) => {
    const p = toSvg(cx, cy), k = Math.min(3.5, Math.max(0.45, view.k * f)), r = k / view.k;
    view.x = p.x - (p.x - view.x) * r; view.y = p.y - (p.y - view.y) * r; view.k = k; apply();
  };
  svg.addEventListener('wheel', e => { e.preventDefault(); zoomAt(e.deltaY < 0 ? 1.12 : 0.89, e.clientX, e.clientY); }, {passive: false});
  const ptrs = new Map(); let last = null, moved = 0, pinch = 0;
  svg.addEventListener('pointerdown', e => { ptrs.set(e.pointerId, e); last = toSvg(e.clientX, e.clientY); moved = 0; if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); } });
  svg.addEventListener('pointermove', e => {
    if (!ptrs.has(e.pointerId)) return;
    ptrs.set(e.pointerId, e);
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()], d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); if (pinch) zoomAt(d / pinch, (a.clientX + b.clientX) / 2, (a.clientY + b.clientY) / 2); pinch = d; moved += 10; return; }
    const p = toSvg(e.clientX, e.clientY); view.x += p.x - last.x; view.y += p.y - last.y; moved += Math.abs(p.x - last.x) + Math.abs(p.y - last.y); apply(); last = toSvg(e.clientX, e.clientY);
    if (moved > 6) svg.setPointerCapture(e.pointerId);
  });
  const up = e => { ptrs.delete(e.pointerId); if (ptrs.size < 2) pinch = 0; };
  svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
  stage.querySelectorAll('[data-z]').forEach(b => b.onclick = () => {
    const f = Number(b.dataset.z), r = svg.getBoundingClientRect();
    if (!f) { Object.assign(view, {x: 0, y: 0, k: 1}); apply(); } else zoomAt(f, r.left + r.width / 2, r.top + r.height / 2);
  });
  app.querySelectorAll('[data-node]').forEach(n => {
    const open = () => { if (moved > 6) return; ctx.go('arbre/' + n.dataset.node); };
    n.addEventListener('click', open);
    n.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); moved = 0; open(); } });
  });
}

function wirePanel(ctx, app, sel) {
  if (sel && !ctx.state.skills[sel]?.discovered) { ctx.state.skills = addTrace(ctx.state.skills, sel, 'discover'); ctx.save(); }
  $('[data-close]')?.addEventListener('click', () => ctx.go('arbre'));
  const celebrate = msg => { notify(msg); ctx.gong?.(); ctx.justProgressed = sel; ctx.render(); };
  $('[data-act=study]')?.addEventListener('click', () => { ctx.state.skills = addTrace(ctx.state.skills, sel, 'study'); ctx.save(); celebrate('Compétence étudiée.'); });
  $('[data-act=practice]')?.addEventListener('click', () => { ctx.state.skills = addTrace(ctx.state.skills, sel, 'practice'); ctx.save(); celebrate('Pratique consignée.'); });
  app.querySelectorAll('[data-form]').forEach(f => f.onsubmit = e => {
    e.preventDefault(); const d = new FormData(f), by = f.dataset.form;
    ctx.state.skills = addTrace(ctx.state.skills, sel, 'evaluate', {by, level: Number(d.get('level')), evaluator: String(d.get('evaluator') ?? '').trim().slice(0, 100), note: String(d.get('note') ?? '').trim().slice(0, 300)});
    ctx.save(); celebrate(by === 'externe' ? 'Évaluation externe enregistrée.' : 'Auto-évaluation enregistrée.');
  });
  if (ctx.justProgressed) { app.querySelector(`[data-node="${ctx.justProgressed}"]`)?.classList.add('burst'); ctx.justProgressed = null; }
}

// ——— Vue liste : chaque branche se lit comme des chaînes (une compétence, puis celles qui la prolongent) ———
function listHtml(s, status, sel, keys) {
  const item = (k, depth) => `<li class="tl-item st-${status[k.id].stage} ${k.id === sel ? 'sel' : ''}" style="--d:${depth}">
    <a href="#arbre/${k.id}" data-node="${k.id}"><i class="tl-dot"></i><span>${depth ? '↳ ' : ''}${esc(k.name)}</span></a>
    <small>${STAGE_LABEL[status[k.id].stage]}${status[k.id].mastery ? ` · niveau ${ROMAN[status[k.id].mastery]}` : ''}${keys.has(k.id) ? ' · clé de votre voie' : ''}</small></li>`;
  const chains = br => {
    const own = skills.filter(k => k.branch === br.id), ids = new Set(own.map(k => k.id)), out = [], seen = new Set();
    const walk = (k, d) => { if (seen.has(k.id)) return; seen.add(k.id); out.push(item(k, d)); own.filter(x => x.prerequisites.includes(k.id)).forEach(x => walk(x, d + 1)); };
    own.filter(k => !k.prerequisites.some(p => ids.has(p))).forEach(k => walk(k, 0));
    own.forEach(k => walk(k, 0));
    return out.join('');
  };
  const methods = s.workshop.methods.filter(m => m.elements.length);
  return `<div class="tree-list">${branches.filter(b => skills.some(k => k.branch === b.id)).map(b => `<section class="panel tl-branch"><h2>${esc(b.name)}</h2><ol class="tl">${chains(b)}</ol></section>`).join('')}
    ${methods.length ? `<section class="panel tl-branch mine"><h2>Mes méthodes</h2>${methods.map(m => { const {cols} = levels(m.elements);
      return `<h3><a href="#atelier/${m.id}">${esc(m.name)}</a></h3><ol class="tl">${cols.flatMap((col, d) => col.filter(e => e.status !== 'ecarte').map(e => `<li class="tl-item own st-${e.status}" style="--d:${Math.min(d, 4)}"><a href="#atelier/${m.id}"><i class="tl-dot"></i><span>${d ? '↳ ' : ''}${esc(e.ref ? entryById[e.ref]?.title ?? e.label : e.label)}</span></a></li>`)).join('')}</ol>`; }).join('')}</section>` : ''}</div>`;
}
