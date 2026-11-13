// Éditeur de poses de l'atelier : créer ses propres gestes, clé par clé, articulation par articulation.
// Aperçu 2D immédiat (profil) avec l'équilibre calculé en 3D, aperçu 3D à la demande. Les gestes créés
// rejoignent les enchaînements animés de la méthode. Rien n'est vérifié anatomiquement : c'est un carnet de mouvement.
import {ANGLE_KEYS, computeJoints} from '../engine/skeleton.js';
import {inkFigure} from '../engine/render.js';
import {D3_KEYS, joints3d, bodyDims, extrasOf, centerOfMass3d, supportPolygon, insideMargin} from '../engine/body3d.js';
import {sequences} from '../data/sequences.js';
import {uid} from '../store.js';
import {DIMENSIONS, LIMITS, findMovement, adaptMovement, saveMovement, removeMovement} from '../engine/movement.js';
import {$, esc, page, notify} from '../ui.js';

export const ANGLE_LABELS = {torso: 'Inclinaison du buste', neck: 'Tête (flexion)', leadShoulder: 'Épaule avant', leadElbow: 'Coude avant', rearShoulder: 'Épaule arrière',
  rearElbow: 'Coude arrière', leadHip: 'Hanche avant', leadKnee: 'Genou avant', leadAnkle: 'Cheville avant', rearHip: 'Hanche arrière', rearKnee: 'Genou arrière', rearAnkle: 'Cheville arrière'};
const D3_LABELS = {face: 'Orientation du corps (tour)', turn: 'Rotation des hanches', chestTurn: 'Rotation des épaules', leadAbd: 'Écart jambe avant', rearAbd: 'Écart jambe arrière',
  leadFootOut: 'Pied avant ouvert', rearFootOut: 'Pied arrière ouvert', leadArmAbd: 'Bras avant écarté', rearArmAbd: 'Bras arrière écarté'};
const STYLES = {boxe: 'Garde de boxe', escrime: 'Garde d’escrime', karate: 'Garde de karaté', carre: 'Garde carrée'};
const clone = o => JSON.parse(JSON.stringify(o));
const balClass = mg => mg >= 2 ? 'ok' : mg >= 0 ? 'juste' : 'non';
const balText = mg => mg >= 2 ? `Équilibre stable (marge ${mg} cm)` : mg >= 0 ? `Équilibre juste (marge ${mg} cm)` : `Hors d’équilibre : le centre de masse dépasse les appuis de ${-mg} cm`;

// Équilibre d'une pose (corps 3D aux proportions moyennes) : marge du centre de masse dans le polygone d'appui, en cm.
export function balance(gesture, pose) {
  const j = joints3d(pose, bodyDims(), extrasOf(gesture, pose)), c = centerOfMass3d(j);
  return Math.round(insideMargin(supportPolygon(j), [c[0], c[2]]) * 100);
}

export function render(ctx, app, target, gid, baseId) {
  const existing = gid ? target.find(gid) : undefined;
  if (!ctx.gEdit || ctx.gEdit.method !== target.key || ctx.gEdit.gid !== gid || ctx.gEdit.base !== baseId) {
    const base = clone(sequences.find(s => s.id === 'garde'));
    const from = !existing && baseId ? target.adapt?.(baseId) ?? null : null;   // copie de travail d'un mouvement de la bibliothèque
    ctx.gEdit = {method: target.key, gid, base: baseId, adapted: Boolean(from), k: 0, g: existing ? clone(existing) : from ?? {id: uid(), name: `Mon ${target.noun}`, style: 'boxe',
      keys: [{label: 'Départ', pose: base.keys[0].pose}, {label: 'Fin', ms: 600, pose: clone(base.keys[0].pose)}]}};
  }
  const E = ctx.gEdit, g = E.g, key = g.keys[E.k], pose = key.pose, ex = extrasOf(g, pose);
  const margin = balance(g, pose), j = computeJoints(pose, 280);
  const slider = (name, label, v, min, max, kind) => `<label class="gslider">${esc(label)} <output>${Math.round(v)}°</output>
    <input type="range" min="${min}" max="${max}" step="1" value="${Math.round(v)}" data-${kind}="${name}"></label>`;
  app.innerHTML = page(target.title, `
  <section class="hero compact"><span class="kicker">${target.crumb}</span><h1>${existing ? 'Modifier' : E.adapted ? 'Adapter' : 'Créer'} un ${target.noun}<span class="dot">.</span></h1>
      <p class="intro">Chaque clé est une pose ; le corps passe de l’une à l’autre en douceur. Réglez les articulations vues de profil, puis l’orientation du corps en 3D. L’indicateur d’équilibre dit si le centre de masse reste au-dessus des appuis.</p></section>
  <div class="gedit">
    <section class="panel ink gview">
      <svg class="gpose" viewBox="-170 20 420 285" role="img" aria-label="Aperçu de la pose, vue de profil">
        <line x1="-170" y1="280" x2="250" y2="280" stroke="var(--line-strong)"/>${inkFigure(j)}</svg>
      <p class="gbal ${balClass(margin)}">${balText(margin)}</p>
      <div class="gkeys">${g.keys.map((k, i) => `<button data-key="${i}" aria-pressed="${i === E.k}">${i + 1}. ${esc(k.label)}</button>`).join('')}
        <button data-act="add-key" ${g.keys.length >= target.maxKeys ? 'disabled' : ''}>+ Clé</button></div>
      <div class="row"><label>Nom de la clé<input id="g-label" maxlength="60" value="${esc(key.label)}"></label>
        ${E.k ? `<label>Durée pour l’atteindre (ms)<input id="g-ms" type="number" min="50" max="5000" step="50" value="${key.ms}"></label>` : ''}</div>
      <div class="actions"><button data-act="dup">Dupliquer cette clé</button><button data-act="del-key" ${g.keys.length <= 2 ? 'disabled' : ''}>Supprimer cette clé</button><button data-act="preview3d">Aperçu 3D</button></div>
      <div id="g-3d"></div>
    </section>
    <section class="panel">
      <div class="row"><label>Nom du ${target.noun}<input id="g-name" maxlength="100" value="${esc(g.name)}"></label>
          ${target.dimensions ? `<label>Dimension<select id="g-dim"><option value="">Automatique</option>${Object.entries(DIMENSIONS).map(([k, v]) => `<option value="${k}" ${k === g.dimension ? 'selected' : ''}>${v}</option>`).join('')}</select></label>` : ''}
        <label>Garde de base (3D)<select id="g-style">${Object.entries(STYLES).map(([k, v]) => `<option value="${k}" ${k === g.style ? 'selected' : ''}>${v}</option>`).join('')}</select></label></div>
      <label>Partir d’une clé existante<select id="g-from"><option value="">— choisir un geste du moteur —</option>${sequences.map(s => `<optgroup label="${esc(s.name)}">${s.keys.map((k, i) => `<option value="${s.id}:${i}">${esc(k.label)}</option>`).join('')}</optgroup>`).join('')}</select></label>
      <h3>Profil (angles en degrés)</h3><div class="gsliders">${ANGLE_KEYS.map(a => slider(a, ANGLE_LABELS[a], pose.angles[a], -180, 180, 'angle')).join('')}
        <label class="gslider">Avancée du bassin <output>${Math.round(pose.x ?? 0)}</output><input type="range" min="-80" max="160" value="${Math.round(pose.x ?? 0)}" data-pos="x"></label>
        <label class="gslider">Saut (hauteur) <output>${Math.round(pose.lift ?? 0)}</output><input type="range" min="0" max="80" value="${Math.round(pose.lift ?? 0)}" data-pos="lift"></label>
          <label class="gslider">Décalage latéral (3D) <output>${Math.round(pose.z ?? 0)}</output><input type="range" min="-80" max="80" value="${Math.round(pose.z ?? 0)}" data-pos="z"></label></div>
      <h3>Corps en 3D</h3><div class="gsliders">${D3_KEYS.map(k => slider(k, D3_LABELS[k], ex[k], k === 'face' ? -180 : k.includes('Turn') || k === 'turn' ? -90 : -30, k === 'face' ? 360 : 90, 'd3')).join('')}</div>
      <div class="actions"><button class="primary" data-act="save">Enregistrer le ${target.noun}</button><a class="button" href="#${target.back}">${target.backLabel}</a>
        ${existing ? `<button class="danger" data-act="delete">Supprimer le ${target.noun}</button>` : ''}</div>
      <p class="subtle">Les poses sont des illustrations : l’application ne vérifie ni les amplitudes articulaires ni la sécurité d’un geste.</p>
    </section>
  </div>`);
  // Pendant le glissement, seul l'aperçu est redessiné (la page entière n'est pas reconstruite, le curseur reste en main).
  const preview = r => {
    r.previousElementSibling.textContent = r.dataset.pos ? r.value : `${r.value}°`;
    $('.gpose').innerHTML = `<line x1="-170" y1="280" x2="250" y2="280" stroke="var(--line-strong)"/>${inkFigure(computeJoints(pose, 280))}`;
    const mg = balance(g, pose), b = $('.gbal'); b.className = 'gbal ' + balClass(mg); b.textContent = balText(mg);
  };
  app.querySelectorAll('[data-angle]').forEach(r => r.oninput = () => { pose.angles[r.dataset.angle] = Number(r.value); preview(r); });
  app.querySelectorAll('[data-pos]').forEach(r => r.oninput = () => { pose[r.dataset.pos] = Number(r.value); preview(r); });
  app.querySelectorAll('[data-d3]').forEach(r => r.oninput = () => { pose.d3 = {...pose.d3, [r.dataset.d3]: Number(r.value)}; preview(r); });
  app.querySelectorAll('[data-key]').forEach(b => b.onclick = () => { E.k = Number(b.dataset.key); ctx.render(); });
  $('#g-label').onchange = e => { key.label = e.target.value.trim().slice(0, 60) || `Clé ${E.k + 1}`; ctx.render(); };
  $('#g-ms')?.addEventListener('change', e => { key.ms = Math.min(5000, Math.max(50, Number(e.target.value) || 500)); });
  $('#g-name').onchange = e => { g.name = e.target.value.trim().slice(0, 100) || `Mon ${target.noun}`; };
  $('#g-dim')?.addEventListener('change', e => { if (e.target.value) g.dimension = e.target.value; else delete g.dimension; });
  $('#g-style').onchange = e => { g.style = e.target.value; g.keys.forEach(k => { delete k.pose.d3; }); ctx.render(); };
  $('#g-from').onchange = e => { const [sid, i] = e.target.value.split(':'), src = sequences.find(s => s.id === sid); if (!src) return;
    key.pose = clone(src.keys[Number(i)].pose); if (src.style) g.style = src.style; ctx.render(); };
  app.querySelector('[data-act=add-key]').onclick = () => { g.keys.push({label: `Clé ${g.keys.length + 1}`, ms: 500, pose: clone(g.keys.at(-1).pose)}); E.k = g.keys.length - 1; ctx.render(); };
  app.querySelector('[data-act=dup]').onclick = () => { g.keys.splice(E.k + 1, 0, {label: `${key.label} (copie)`.slice(0, 60), ms: 500, pose: clone(pose)}); E.k++; ctx.render(); };
  app.querySelector('[data-act=del-key]').onclick = () => { g.keys.splice(E.k, 1); E.k = Math.max(0, E.k - 1); delete g.keys[0].ms; ctx.render(); };
  app.querySelector('[data-act=preview3d]').onclick = async () => {
    const host = $('#g-3d'), mod = await import('./mannequin3d.js');
    if (!mod.webglAvailable()) { host.innerHTML = '<p class="subtle">La 3D n’est pas disponible sur cet appareil.</p>'; return; }
    const stop = await mod.mount3d(host, clone(g), {dims: mod.dimsFromState(ctx.state)}); if (host.isConnected) ctx.cleanup.push(stop); else stop();
  };
  app.querySelector('[data-act=save]').onclick = () => {
    g.keys.forEach((k, i) => { if (i && !(k.ms > 0)) k.ms = 500; if (!i) delete k.ms; });
    const done = target.save(g, Boolean(existing));
    if (!done) return notify('Enregistrement impossible : la limite est atteinte. Supprimez d’abord un mouvement dans l’espace Créer.');
    ctx.gEdit = null; ctx.save(); ctx.gong?.(); notify(done); ctx.go(target.back);
  };
  app.querySelector('[data-act=delete]')?.addEventListener('click', () => {
    if (!confirm(`Supprimer le ${target.noun} « ${g.name} » ?`)) return;
    target.remove(g); ctx.gEdit = null; ctx.save(); ctx.go(target.back);
  });
}

// Où l'éditeur range son travail : dans une méthode de l'atelier (gestes d'origine) ou dans « Mes mouvements » (modèle commun).
export const methodTarget = m => ({key: m.id, noun: 'geste', title: 'Atelier de création', crumb: `<a href="#atelier/${m.id}">${esc(m.name)}</a> · éditeur de poses`,
  back: 'atelier/' + m.id, backLabel: 'Retour à la méthode', maxKeys: 20, dimensions: false,
  find: id => (m.gestures ?? []).find(g => g.id === id),
  save(g, existing) {
    m.gestures = [...(m.gestures ?? []).filter(x => x.id !== g.id), clone(g)].slice(-30);
    m.decisions.unshift({date: new Date().toISOString(), text: `Geste « ${g.name} » ${existing ? 'modifié' : 'créé'} dans l’éditeur de poses (${g.keys.length} clés).`});
    return 'Geste enregistré : il est disponible dans vos enchaînements.';
  },
  remove(g) { m.gestures = (m.gestures ?? []).filter(x => x.id !== g.id); m.sequences.forEach(q => { if (q.anim) q.anim = q.anim.filter(a => a !== g.id); }); }});
export const libraryTarget = state => ({key: 'mes-mouvements', noun: 'mouvement', title: 'Créer', crumb: '<a href="#creer">Créer</a> · éditeur de poses',
  back: 'creer', backLabel: 'Retour à Créer', maxKeys: LIMITS.keys, dimensions: true,
  find: id => (state.movements ?? []).find(x => x.id === id),
  adapt(id) { const src = findMovement(state, id); return src ? adaptMovement(src) : null; },
  save: g => saveMovement(state, g) ? 'Mouvement enregistré dans « Mes mouvements ».' : null,
  remove(g) { removeMovement(state, g.id); }});
