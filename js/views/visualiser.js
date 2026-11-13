// Espace VISUALISER : un grand lecteur 3D et, à côté, la bibliothèque commune de mouvements (gestes du moteur et créations)
// en vignettes. Choisir une vignette change de mouvement sans reconstruire la scène. « Comparer » en ajoute un second,
// joué sur le même temps relatif : les deux commencent et finissent ensemble, même si leurs durées réelles diffèrent.
import {computeJoints, sequenceDuration} from '../engine/skeleton.js';
import {inkFigure} from '../engine/render.js';
import {movementLibrary, isBuiltin, DIMENSIONS, MOVE_ORIGINS, RELIABILITY} from '../engine/movement.js';
import {entries} from '../data/library.js';
import {$, esc, page} from '../ui.js';

const PLACES = {sur: 'Superposés', cote: 'Côte à côte', face: 'Face à face'};
const secs = m => `${(sequenceDuration(m) / 1000).toFixed(1).replace('.', ',')} s`;
// Vignette à l'encre : la pose du milieu du mouvement, recentrée.
export const thumb = m => { const k = m.keys, peak = k[Math.min(k.length - 1, Math.max(1, Math.floor(k.length / 2)))];
  return `<svg viewBox="-150 30 380 270" aria-hidden="true">${inkFigure(computeJoints({...peak.pose, x: 0, lift: 0}, 280))}</svg>`; };

export function render(ctx, app, [wanted]) {
  const s = ctx.state, lib = movementLibrary(s), find = id => lib.find(m => m.id === id);
  const V = ctx.vis ??= {filter: 'tout', compare: false, second: null, place: 'cote', last: null};
  let cur = find(wanted) ?? find(V.last) ?? find('direct-avant') ?? lib[0], viewer = null, no3d = false;
  V.last = cur.id;
  if (!find(V.second) || V.second === cur.id) V.second = null;
  const mine = m => !isBuiltin(m.id), reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const filters = [['tout', 'Tout'], ...(lib.some(mine) ? [['miens', 'Les miens']] : []), ...Object.entries(DIMENSIONS).filter(([d]) => lib.some(m => m.dimension === d))];
  if (!filters.some(([f]) => f === V.filter)) V.filter = 'tout';
  const shown = () => lib.filter(m => V.filter === 'tout' || (V.filter === 'miens' ? mine(m) : m.dimension === V.filter));
  const cards = () => shown().map(m => `<button class="mv-card${V.compare && m.id === V.second ? ' second' : ''}" data-id="${esc(m.id)}" aria-pressed="${m.id === cur.id}">${thumb(m)}<b>${esc(m.name)}</b>
    <small>${esc(DIMENSIONS[m.dimension])}${mine(m) ? ' · ✎' : ''}</small></button>`).join('');
  // Modifier : un geste du moteur n'est jamais touché (on en crée une version) ; un mouvement personnel s'ouvre là où il est rangé.
  const editLink = m => !mine(m) ? [`creer/poser/nouveau/${encodeURIComponent(m.id)}`, '✎ Adapter', 'Créer votre version de ce geste : l’original reste intact']
    : (s.movements ?? []).some(x => x.id === m.id) ? [`creer/poser/${encodeURIComponent(m.id)}`, '✎ Modifier', 'Modifier ce mouvement']
      : [`atelier/${encodeURIComponent(m.origin.ref)}/geste/${encodeURIComponent(m.id)}`, '✎ Modifier', 'Modifier ce geste dans sa méthode'];
  const info = () => { const [href, label, title] = editLink(cur), fiche = entries.find(e => e.sequence === cur.id);
    return `<div><h2>${esc(cur.name)}</h2><p class="mv-tags"><span class="chip">${esc(DIMENSIONS[cur.dimension])}</span><span class="chip">${esc(MOVE_ORIGINS[cur.origin.type])}</span>
      <span class="chip" title="Ce que vaut l’animation, pas la technique : rien n’est validé par un enseignant.">${esc(RELIABILITY[cur.reliability.level])}</span><span class="chip">${secs(cur)} · ${cur.keys.length} étapes</span></p></div>
    <div class="actions">${no3d ? '' : `<button data-act="compare" aria-pressed="${V.compare}" title="Jouer un second mouvement en même temps">⇄ Comparer</button>`}<a class="button" href="#${href}" title="${title}">${label}</a>
      ${fiche ? `<a class="button" href="#bibliotheque/${encodeURIComponent(fiche.id)}" title="Explications et principes de ce geste">▤ Fiche</a>` : ''}</div>`; };
  const compareBar = () => { const b = find(V.second);
    return b ? `<span><b>Ombre</b> ${esc(cur.name)} (${secs(cur)})</span><span class="b2"><b>Bleu</b> ${esc(b.name)} (${secs(b)})</span>
      <span class="seg" role="group" aria-label="Placement du second mouvement">${Object.entries(PLACES).map(([k, v]) => `<button data-place="${k}" aria-pressed="${k === V.place}">${v}</button>`).join('')}</span>
      <button data-act="stop">✕ Arrêter</button><small>Les deux mouvements commencent et finissent ensemble. Choisissez une autre vignette pour changer le second.</small>`
      : `<span>Choisissez dans la galerie le mouvement à comparer avec « ${esc(cur.name)} ».</span><button data-act="stop">✕ Annuler</button>`; };

  app.innerHTML = page('Visualiser', `<div class="vz-root">
  <section class="vz"><div class="vz-stage" id="vz-stage"></div><div class="vz-info" id="vz-info"></div><div class="vz-compare" id="vz-compare" hidden></div></section>
  <section class="vz-lib" aria-label="Bibliothèque de mouvements"><div class="vz-filters" id="vz-filters" role="group" aria-label="Filtrer les mouvements">${filters.map(([f, label]) => `<button class="chip" data-f="${f}" aria-pressed="${f === V.filter}">${esc(label)}</button>`).join('')}</div>
    <div class="mv-grid" id="vz-grid">${cards()}</div></section></div>`);
  const host = $('#vz-stage'), grid = $('#vz-grid'), bar = $('#vz-compare');
  const paint = () => {
    $('#vz-info').innerHTML = info(); bar.hidden = !V.compare; bar.innerHTML = V.compare ? compareBar() : '';
    grid.querySelectorAll('.mv-card').forEach(b => { b.setAttribute('aria-pressed', String(b.dataset.id === cur.id)); b.classList.toggle('second', V.compare && b.dataset.id === V.second); });
  };
  const still = () => { host.innerHTML = `<div class="vz-2d">${thumb(cur)}</div><p class="subtle">La 3D n’est pas disponible sur cet appareil : image fixe du mouvement.</p>`; };
  const endCompare = () => { V.compare = false; V.second = null; viewer?.setSecond(null); };
  // En comparaison, une vignette choisit le second mouvement ; sinon elle change le mouvement affiché (sans recharger la page).
  grid.onclick = e => {
    const m = find(e.target.closest('.mv-card')?.dataset.id); if (!m) return;
    if (V.compare) { if (m === cur) return; V.second = m.id; viewer?.setSecond(m, V.place); }
    else { cur = m; V.last = m.id; history.replaceState(null, '', '#visualiser/' + encodeURIComponent(m.id)); if (viewer) viewer.setSequence(m, !reduced); else if (no3d) still(); }
    paint();
  };
  $('#vz-filters').onclick = e => {
    const b = e.target.closest('[data-f]'); if (!b) return;
    V.filter = b.dataset.f; app.querySelectorAll('#vz-filters [data-f]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    grid.innerHTML = cards() || '<p class="empty">Aucun mouvement ici.</p>';
  };
  $('#vz-info').onclick = e => { if (!e.target.closest('[data-act=compare]')) return; if (V.compare) endCompare(); else V.compare = true; paint(); };
  bar.onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.place) { V.place = b.dataset.place; viewer?.setSecond(find(V.second), V.place); } else endCompare();
    paint();
  };
  paint();

  (async () => {
    const first = cur;
    try {
      const mod = await import('./mannequin3d.js');
      if (!host.isConnected) return;
      if (!mod.webglAvailable()) throw new Error('WebGL indisponible');
      const stop = await mod.mount3d(host, first, {dims: mod.dimsFromState(s), autoplay: !reduced});
      if (!host.isConnected) return stop();
      ctx.cleanup.push(stop); viewer = stop;
    } catch { no3d = true; V.compare = false; V.second = null; still(); paint(); return; }
    if (cur !== first) viewer.setSequence(cur, !reduced);
    if (V.compare && V.second) viewer.setSecond(find(V.second), V.place);
  })();
}
