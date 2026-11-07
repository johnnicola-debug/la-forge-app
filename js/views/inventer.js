// Le Creuset : générateur visuel de techniques. Le corps d'ombre joue l'invention en grand ; le texte se limite à un nom,
// un code et des pictogrammes (transformations, nouveauté, stabilité, disciplines). Les inventions gardées rejoignent l'atelier.
import {sequences} from '../data/sequences.js';
import {generate, vary, codeToSeed, MUTATIONS} from '../engine/generator.js';
import {computeJoints} from '../engine/skeleton.js';
import {inkFigure} from '../engine/render.js';
import {uid} from '../store.js';
import {$, esc, page, notify} from '../ui.js';

const DISC = {boxe: ['Boxe', '#e0674c'], escrime: ['Escrime', '#d8b25e'], karate: ['Karaté', '#c8c2b3'], 'muay-thai': ['Muay-thaï', '#b886d6'], lutte: ['Lutte', '#6db8a0']};
const STYLE_DISC = {boxe: 'boxe', escrime: 'escrime', karate: 'karate', carre: 'muay-thai'};
const thumb = g => { const k = g.sequence.keys, peak = k[Math.min(k.length - 2, Math.max(1, Math.floor(k.length / 2)))];
  return `<svg viewBox="-150 30 380 270" aria-hidden="true">${inkFigure(computeJoints(peak.pose, 280))}</svg>`; };

export function render(ctx, app, [base]) {
  document.body.classList.add('scene');
  ctx.cleanup.push(() => document.body.classList.remove('scene'));
  const C = ctx.creuset ??= {audace: 2, disc: [], history: [], current: null};
  const opts = () => ({sequences, audace: C.audace, disciplines: C.disc});
  if (base && C.base !== base) { C.base = base; const g0 = generate({...opts(), disciplines: [], base}); if (g0) { C.current = g0; C.history.unshift(g0); } }
  if (!C.current) { C.current = generate(opts()); if (C.current) C.history.unshift(C.current); }
  const g = C.current;
  const discs = g ? g.disciplines.map(d => DISC[STYLE_DISC[d] ?? d] ?? [d, '#999']) : [];
  app.innerHTML = page('Le Creuset', `
  <section class="creuset">
    <div class="cr-stage" id="cr-stage"></div>
    ${g ? `<div class="cr-id"><h1>${esc(g.name)}<span class="dot">.</span></h1><span class="cr-code" title="Code pour retrouver cette technique">${g.code}</span>
      <span class="cr-badge" title="Invention générée : idée à éprouver avec prudence, jamais validée">⚠ idée non éprouvée</span></div>
    <div class="cr-traits">${g.traits.map(t => `<span class="cr-trait" title="${esc(t.label)}"><b>${t.icon}</b>${esc(t.label)}</span>`).join('') || '<span class="cr-trait"><b>○</b>forme d’origine</span>'}</div>
    <div class="cr-meters">
      <div class="cr-meter" title="Écart avec les gestes connus de la bibliothèque"><span>✧</span><i style="--v:${g.novelty}%"></i><small>${g.novelty}</small></div>
      <div class="cr-meter stab" title="Marge d’équilibre au départ et à l’arrivée (centre de masse au-dessus des appuis)"><span>⚖</span><i style="--v:${Math.min(100, g.stability * 10)}%"></i><small>${g.stability} cm</small></div>
      <div class="cr-discs">${discs.map(([n, c]) => `<span style="--c:${c}" title="${esc(n)}">●</span>`).join('')}<small>${discs.map(([n]) => esc(n)).join(' · ')}</small></div>
    </div>` : '<p class="empty">Aucune invention stable avec ces réglages : élargissez les disciplines.</p>'}
    <div class="cr-actions">
      <button class="primary big" data-act="new">⟳ Inventer</button><button class="big" data-act="vary" ${g ? '' : 'disabled'}>≈ Varier</button>
      <button class="big" data-act="keep" ${g ? '' : 'disabled'}>♥ Garder</button>
    </div>
    <div class="cr-controls">
      <label class="cr-audace" title="Nombre de transformations">Audace <input type="range" min="1" max="4" value="${C.audace}" id="cr-audace"><span>${'●'.repeat(C.audace)}${'○'.repeat(4 - C.audace)}</span></label>
      <div class="cr-chips">${Object.entries(DISC).map(([id, [n, c]]) => `<button class="chip" data-disc="${id}" aria-pressed="${C.disc.includes(id)}" style="--c:${c}">● ${esc(n)}</button>`).join('')}</div>
      <form class="cr-codeform" id="cr-codeform"><input name="code" placeholder="LF-……" maxlength="9" aria-label="Retrouver une technique par son code"><button>↵</button></form>
    </div>
    ${C.history.length > 1 ? `<div class="cr-history">${C.history.slice(0, 8).map((h, i) => `<button class="cr-thumb ${h === g ? 'on' : ''}" data-h="${i}" title="${esc(h.name)}">${thumb(h)}<small>${h.code}</small></button>`).join('')}</div>` : ''}
    <details class="cr-more"><summary>Comment le Creuset invente</summary>
      <p>Il recombine les gestes animés de la bibliothèque (entrée, attaque, sortie) et transforme l’attaque : ${Object.values(MUTATIONS).map(m => `${m.icon} ${m.label}`).join(' · ')}.
      Une invention n’est montrée que si le corps reste en équilibre au départ, à l’arrivée et pendant les appuis. ✧ mesure l’écart avec les gestes connus.
      Rien n’est vérifié sur les amplitudes articulaires ni l’efficacité : à essayer lentement, à vide, et à faire juger par un enseignant.</p></details>
  </section>`);

  const go = next => { if (!next) return notify('Pas d’invention stable avec ces réglages.'); C.current = next; C.history = [next, ...C.history.filter(h => h.code !== next.code)].slice(0, 12); ctx.gong?.(); ctx.render(); };
  app.querySelector('[data-act=new]').onclick = () => go(generate(opts()));
  app.querySelector('[data-act=vary]').onclick = () => go(vary(g, opts()));
  app.querySelector('[data-act=keep]').onclick = () => keep(ctx, g);
  $('#cr-audace').onchange = e => { C.audace = Number(e.target.value); ctx.render(); };
  app.querySelectorAll('[data-disc]').forEach(b => b.onclick = () => { const d = b.dataset.disc; C.disc = C.disc.includes(d) ? C.disc.filter(x => x !== d) : [...C.disc, d]; ctx.render(); });
  app.querySelectorAll('[data-h]').forEach(b => b.onclick = () => { C.current = C.history[Number(b.dataset.h)]; ctx.render(); });
  $('#cr-codeform').onsubmit = e => { e.preventDefault(); const seed = codeToSeed(new FormData(e.target).get('code'));
    if (seed === null) return notify('Code inconnu : il ressemble à LF-ABC234.'); go(generate({...opts(), seed, disciplines: []})); };
  if (!g) return;
  const host = $('#cr-stage');
  import('./mannequin3d.js').then(async m => {
    if (!m.webglAvailable()) { host.innerHTML = `<div class="cr-2d">${thumb(g)}</div>`; return; }
    const stop = await m.mount3d(host, g.sequence, {dims: m.dimsFromState(ctx.state), loop: true, minimal: true});
    if (host.isConnected) ctx.cleanup.push(stop); else stop();
  }).catch(() => { host.innerHTML = `<div class="cr-2d">${thumb(g)}</div>`; });
}

// Garder une invention : elle devient un geste de la méthode « Mes inventions » (créée au besoin), utilisable dans les enchaînements.
function keep(ctx, g) {
  const s = ctx.state, now = new Date().toISOString();
  let m = s.workshop.methods.find(x => x.name === 'Mes inventions');
  if (!m) { m = {id: uid(), name: 'Mes inventions', createdAt: now, origin: {type: 'creation', discipline: ''}, intentions: 'Techniques inventées dans le Creuset, à éprouver.', context: '',
    elements: [], sequences: [], trials: [], decisions: [{date: now, text: 'Méthode créée pour garder les inventions du Creuset.'}]}; s.workshop.methods.unshift(m); }
  if ((m.gestures ?? []).some(x => x.code === g.code)) return notify('Déjà gardée.');
  const gesture = {id: uid(), name: g.name.slice(0, 100), code: g.code, style: ['boxe', 'escrime', 'karate', 'carre'].includes(g.sequence.style) ? g.sequence.style : 'boxe',
    keys: g.sequence.keys.map((k, i) => ({label: String(k.label || '·').slice(0, 60), ...(i ? {ms: Math.max(50, Math.min(5000, k.ms))} : {}), pose: k.pose}))};
  m.gestures = [...(m.gestures ?? []), gesture].slice(-30);
  m.elements.push({id: uid(), ref: null, label: `${g.name} (${g.code})`.slice(0, 120), note: `Inventée dans le Creuset : ${g.traits.map(t => t.label).join(', ') || 'forme d’origine'}.`.slice(0, 300), status: 'a-explorer'});
  m.decisions.unshift({date: now, text: `Invention gardée : ${g.name} (${g.code}).`});
  ctx.save(); ctx.gong?.(); notify('Gardée dans l’atelier, méthode « Mes inventions ».');
}
