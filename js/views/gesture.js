// Atelier de mouvement : le mannequin 3D au centre, la ligne des étapes dessous. On choisit une étape, on attrape une partie
// du corps (points dorés : poings, pieds, tête, buste, bassin ; points verts : coudes, genoux) et on la fait glisser ;
// le logiciel relie les poses entre elles. Chaque modification s'annule (Ctrl+Z) et rien n'est rangé avant « Enregistrer ».
// Une seule page pour « Mes mouvements » (espace Créer) et pour les gestes d'une méthode (atelier de méthodes).
// Sans 3D : vue de profil et curseurs. Vérification prudente de chaque étape : engine/biomeca.js.
import {ANGLE_KEYS, computeJoints, sequenceDuration} from '../engine/skeleton.js';
import {inkFigure} from '../engine/render.js';
import {D3_KEYS, extrasOf} from '../engine/body3d.js';
import {HANDLES} from '../engine/posing.js';
import {balance, checkStep, worst} from '../engine/biomeca.js';
import {STEP_MS, addStep, removeStep, setDuration, replaceWithMovement, normalizeAngles, history} from '../engine/steps.js';
import {sequences} from '../data/sequences.js';
import {uid} from '../store.js';
import {DIMENSIONS, LIMITS, findMovement, adaptMovement, saveMovement, removeMovement, movementLibrary} from '../engine/movement.js';
import {webglAvailable, dimsFromState, mount3d} from './mannequin3d.js';
import {thumb} from './visualiser.js';
import {$, esc, page, notify} from '../ui.js';

export {balance};
export const ANGLE_LABELS = {torso: 'Inclinaison du buste', neck: 'Tête (flexion)', leadShoulder: 'Épaule avant', leadElbow: 'Coude avant', rearShoulder: 'Épaule arrière',
  rearElbow: 'Coude arrière', leadHip: 'Hanche avant', leadKnee: 'Genou avant', leadAnkle: 'Cheville avant', rearHip: 'Hanche arrière', rearKnee: 'Genou arrière', rearAnkle: 'Cheville arrière'};
const D3_LABELS = {face: 'Orientation du corps (tour)', turn: 'Rotation des hanches', chestTurn: 'Rotation des épaules', leadAbd: 'Écart jambe avant', rearAbd: 'Écart jambe arrière',
  leadFootOut: 'Pied avant ouvert', rearFootOut: 'Pied arrière ouvert', leadArmAbd: 'Bras avant écarté', rearArmAbd: 'Bras arrière écarté',
  leadLegRot: 'Genou avant tourné vers l’extérieur', rearLegRot: 'Genou arrière tourné vers l’extérieur', lean: 'Buste penché sur le côté',
  pelvisTilt: 'Bassin basculé (avant +)', pelvisList: 'Bassin incliné (côté avant +)', headTurn: 'Tête tournée', headTilt: 'Tête inclinée',
  leadArmRot: 'Bras avant tourné (humérus)', rearArmRot: 'Bras arrière tourné (humérus)', leadPronation: 'Poing avant tourné (pronation)', rearPronation: 'Poing arrière tourné (pronation)',
  leadWristFlex: 'Poignet avant fléchi', rearWristFlex: 'Poignet arrière fléchi', leadHandOpen: 'Main avant ouverte (0 / 1)', rearHandOpen: 'Main arrière ouverte (0 / 1)',
  leadFootRoll: 'Arrière-pied avant (inversion +)', rearFootRoll: 'Arrière-pied arrière (inversion +)', leadToes: 'Orteils avant relevés', rearToes: 'Orteils arrière relevés'};
// Bornes des curseurs des réglages 3D (degrés ; la main ouverte est un interrupteur 0 / 1).
const D3_RANGE = {face: [-180, 360], turn: [-90, 90], chestTurn: [-90, 90], lean: [-45, 45], pelvisTilt: [-30, 35], pelvisList: [-25, 25], headTurn: [-180, 180], headTilt: [-50, 50],
  leadArmRot: [-90, 105], rearArmRot: [-90, 105], leadPronation: [-90, 95], rearPronation: [-90, 95], leadWristFlex: [-85, 95], rearWristFlex: [-85, 95],
  leadHandOpen: [0, 1], rearHandOpen: [0, 1], leadFootRoll: [-25, 45], rearFootRoll: [-25, 45], leadToes: [0, 90], rearToes: [0, 90]};
const STYLES = {boxe: 'Garde de boxe', escrime: 'Garde d’escrime', karate: 'Garde de karaté', carre: 'Garde carrée'};
const EASES_FR = {doux: 'Douce', lineaire: 'Régulière', vif: 'Départ vif', retenu: 'Fin vive'};
// Réglages de la partie attrapée, en mots simples : [type, clé, libellé, min, max]. Tout le reste est dans « Réglages fins ».
const PART_SLIDERS = {
  arm: s => [['d3', s + 'ArmAbd', 'Écarter le bras', -30, 90], ['d3', s + 'ArmRot', 'Tourner le bras', -90, 105], ['d3', s + 'Pronation', 'Tourner le poing', -90, 95], ['d3', s + 'HandOpen', 'Ouvrir la main', 0, 1]],
  upperArm: s => [['d3', s + 'ArmAbd', 'Écarter le bras', -30, 90], ['d3', s + 'ArmRot', 'Tourner le bras', -90, 105]],
  leg: s => [['d3', s + 'Abd', 'Écarter la jambe', -30, 90], ['d3', s + 'FootOut', 'Ouvrir le pied', -30, 90], ['d3', s + 'LegRot', 'Tourner le genou', -30, 90], ['angle', s + 'Ankle', 'Pointe du pied', -80, 60], ['d3', s + 'FootRoll', 'Bord du pied (inversion +)', -25, 45]],
  thigh: s => [['d3', s + 'Abd', 'Écarter la jambe', -30, 90], ['d3', s + 'LegRot', 'Tourner le genou', -30, 90]],
  pelvis: () => [['d3', 'turn', 'Tourner les hanches', -90, 90], ['d3', 'pelvisTilt', 'Basculer le bassin', -30, 35], ['d3', 'pelvisList', 'Incliner le bassin', -25, 25], ['d3', 'face', 'Tourner tout le corps', -180, 360], ['pos', 'lift', 'Sauter', 0, 80]],
  trunk: () => [['d3', 'chestTurn', 'Tourner les épaules', -90, 90], ['d3', 'lean', 'Pencher sur le côté', -45, 45]],
  head: () => [['d3', 'headTurn', 'Tourner la tête', -180, 180], ['d3', 'headTilt', 'Incliner la tête', -50, 50]]
};
const HINTS = {arm: 'Faites-le glisser : l’épaule et le coude suivent.', upperArm: 'Faites-le glisser : le bras tourne autour de l’épaule.',
  leg: 'Faites-le glisser : la hanche et le genou suivent ; un pied posé reste à plat.', thigh: 'Faites-le glisser : la cuisse tourne autour de la hanche.',
  head: 'Faites-la glisser pour pencher la tête ; tournez-la ici.', trunk: 'Faites-le glisser pour pencher le buste.', pelvis: 'Faites-le glisser pour déplacer le corps sur le sol.'};
const GUIDE = ['Choisir une étape', 'Attraper un point doré', 'Lire le mouvement'];
const clone = o => JSON.parse(JSON.stringify(o));
const secs = ms => `${(ms / 1000).toFixed(2).replace('.', ',')} s`;
const unit = kind => kind === 'pos' ? '' : '°';
const getV = (pose, ex, kind, k) => kind === 'angle' ? pose.angles[k] ?? 0 : kind === 'pos' ? pose[k] ?? 0 : ex[k] ?? 0;
const setV = (pose, kind, k, v) => { if (kind === 'angle') pose.angles[k] = v; else if (kind === 'pos') pose[k] = v; else pose.d3 = {...pose.d3, [k]: v}; };
const slider = (kind, k, label, v, min, max) => `<label class="gslider">${esc(label)} <output>${Math.round(v)}${unit(kind)}</output>
  <input type="range" min="${min}" max="${max}" step="1" value="${Math.round(v)}" data-kind="${kind}" data-k="${k}"></label>`;
const profile = pose => `<svg viewBox="-150 30 380 270" aria-hidden="true">${inkFigure(computeJoints({...pose, x: 0, lift: 0}, 280))}</svg>`;

export function render(ctx, app, target, gid, baseId) {
  const existing = gid ? target.find(gid) : undefined;
  if (!ctx.gEdit || ctx.gEdit.method !== target.key || ctx.gEdit.gid !== gid || ctx.gEdit.base !== baseId) {
    const guard = sequences.find(s => s.id === 'garde').keys[0].pose;
    const from = !existing && baseId ? target.adapt?.(baseId) ?? null : null;   // copie de travail d'un mouvement de la bibliothèque
    const g = existing ? clone(existing) : from ?? {id: uid(), name: `Mon ${target.noun}`, style: 'boxe',
      keys: [{label: 'Départ', pose: clone(guard)}, {label: 'Fin', ms: 600, pose: clone(guard)}]};
    ctx.gEdit = {method: target.key, gid, base: baseId, adapted: Boolean(from), k: existing || from ? 0 : 1, part: null, picker: false, playing: false, g, hist: history(g)};
  }
  const E = ctx.gEdit, g = E.g, dims = dimsFromState(ctx.state);
  app.innerHTML = page(target.title, `
  <section class="hero compact"><span class="kicker">${target.crumb}</span><h1>${existing ? 'Modifier' : E.adapted ? 'Adapter' : 'Créer'} un ${target.noun}<span class="dot">.</span></h1></section>
  <div class="atelier">
    <div class="at-bar">
      <input id="at-name" class="at-name" maxlength="100" value="${esc(g.name)}" aria-label="Nom du ${target.noun}">
      <button class="at-icon" data-act="undo" title="Annuler (Ctrl+Z)" aria-label="Annuler">↶</button><button class="at-icon" data-act="redo" title="Rétablir (Ctrl+Y)" aria-label="Rétablir">↷</button>
      <span class="at-dirty" hidden>non enregistré</span>
      <button class="primary" data-act="save">Enregistrer</button><a class="button" href="#${target.back}">${esc(target.backLabel)}</a>
    </div>
    <ol class="at-guide" aria-label="Mode d’emploi">${GUIDE.map(t => `<li>${t}</li>`).join('')}</ol>
    <div id="at-3d" class="at-stage"></div>
    <div id="at-part" class="at-part" hidden></div>
    <div class="at-steps-head"><b>Étapes</b> <span class="subtle" id="at-total"></span></div>
    <ol id="at-steps" class="at-steps" aria-label="Étapes du mouvement"></ol>
    <div id="at-tools" class="at-tools"></div>
    <div id="at-picker" class="at-picker panel" hidden></div>
    <div id="at-check" class="at-check" aria-live="polite"></div>
    <details class="at-adv" id="at-adv"><summary>Réglages fins (angles, garde, dimension)</summary><div id="at-adv-body"></div></details>
    ${existing ? `<p><button class="danger small" data-act="delete">Supprimer le ${target.noun}</button></p>` : ''}
  </div>`);
  const root = $('.atelier', app), host = $('#at-3d', root), key = () => g.keys[E.k];
  let viewer = null, lastCheck = 0;
  const flat = () => `<svg class="gpose" viewBox="-170 20 420 285" role="img" aria-label="Pose de l’étape, vue de profil"><line x1="-170" y1="280" x2="250" y2="280" stroke="var(--line-strong)"/>${inkFigure(computeJoints(key().pose, 280))}</svg>
    <p class="subtle">La 3D n’est pas disponible sur cet appareil : réglez la pose avec les curseurs des réglages fins.</p>`;
  // Montrer l'étape choisie (3D : pose exacte et poignées ; sans 3D : vue de profil).
  const show = (rebuild = false) => { if (viewer) viewer.editKey(E.k, rebuild); else if (E.no3d) host.innerHTML = flat(); };

  const paintSteps = () => {
    $('#at-steps', root).innerHTML = g.keys.map((k, i) => { const lv = worst(checkStep(g, i, dims));
      return `<li><button class="at-step" data-step="${i}" aria-pressed="${i === E.k}">${profile(k.pose)}<b>${i + 1}. ${esc(k.label)}</b><small>${i ? secs(k.ms) : 'départ'}</small>${lv === 'ok' ? ''
        : `<i class="at-flag ${lv}" title="${lv === 'alerte' ? 'Très inhabituel' : 'À surveiller'}"></i>`}</button></li>`; }).join('');
    $('#at-total', root).textContent = `${g.keys.length} étapes · ${secs(sequenceDuration(g))}`;
  };
  const paintTools = () => {
    const k = key();
    $('#at-tools', root).innerHTML = `<label>Nom de l’étape <input id="at-step-name" maxlength="60" value="${esc(k.label)}"></label>
      ${E.k ? `<span class="at-dur" role="group" aria-label="Durée pour arriver à cette étape"><button data-act="faster" title="Plus rapide" aria-label="Plus rapide" ${k.ms <= STEP_MS.min ? 'disabled' : ''}>−</button><output>${secs(k.ms)}</output><button data-act="slower" title="Plus lent" aria-label="Plus lent" ${k.ms >= STEP_MS.max ? 'disabled' : ''}>+</button></span>
        <label>Arrivée <select id="at-ease">${Object.entries(EASES_FR).map(([v, l]) => `<option value="${v}" ${(k.ease ?? 'doux') === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        ${E.k < g.keys.length - 1 ? `<label class="at-inline"><input type="checkbox" id="at-passe" ${k.passe ? 'checked' : ''}> Sans arrêt ici</label>` : ''}`
        : '<span class="subtle">Pose de départ</span>'}
      <span class="at-acts"><button data-act="add" ${g.keys.length >= target.maxKeys ? 'disabled' : ''}>＋ Ajouter une étape</button><button data-act="pick" aria-expanded="${E.picker}">Remplacer par un mouvement…</button><button data-act="remove" ${g.keys.length <= 2 ? 'disabled' : ''}>Supprimer l’étape</button></span>`;
  };
  const paintPart = () => {
    const el = $('#at-part', root), h = E.part ? HANDLES[E.part] : null;
    el.hidden = !h; if (!h) { el.innerHTML = ''; return; }
    const pose = key().pose, ex = extrasOf(g, pose), list = PART_SLIDERS[h.kind](h.side);
    el.innerHTML = `<div class="at-part-head"><b>${esc(h.label)}</b><span class="subtle">${HINTS[h.kind]}</span><button class="small" data-act="unpart" aria-label="Fermer">✕</button></div>
      ${list.length ? `<div class="gsliders">${list.map(([kind, k, label, min, max]) => slider(kind, k, label, getV(pose, ex, kind, k), min, max)).join('')}</div>` : ''}`;
  };
  const paintCheck = () => {
    const r = checkStep(g, E.k, dims), n = g.keys.filter((_, i) => worst(checkStep(g, i, dims)) !== 'ok').length;
    $('#at-check', root).innerHTML = `<h3>Vérification de l’étape ${E.k + 1}</h3><p class="${r.balance.level}">${esc(r.balance.text)}</p>
      ${r.notes.length ? `<ul>${r.notes.map(x => `<li class="${x.level}">${esc(x.text)}</li>`).join('')}</ul>` : '<p class="ok">Amplitudes et vitesse dans les repères habituels.</p>'}
      <p class="subtle">${n ? `${n} étape(s) portent une remarque (point de couleur). ` : ''}Repères prudents, pas un diagnostic : le mannequin ne connaît ni votre souplesse, ni la rotation des bras et des jambes.</p>`;
  };
  const paintAdv = () => {
    const pose = key().pose, ex = extrasOf(g, pose);
    $('#at-adv-body', root).innerHTML = `<div class="row">
      ${target.dimensions ? `<label>Dimension<select id="at-dim"><option value="">Automatique</option>${Object.entries(DIMENSIONS).map(([k, v]) => `<option value="${k}" ${k === g.dimension ? 'selected' : ''}>${v}</option>`).join('')}</select></label>` : ''}
      <label>Garde de base (3D)<select id="at-style">${Object.entries(STYLES).map(([k, v]) => `<option value="${k}" ${k === g.style ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
      <label>Partir d’une pose existante<select id="at-from"><option value="">— choisir une pose d’un geste du moteur —</option>${sequences.map(s => `<optgroup label="${esc(s.name)}">${s.keys.map((k, i) => `<option value="${s.id}:${i}">${esc(k.label)}</option>`).join('')}</optgroup>`).join('')}</select></label></div>
      <h3>Étape ${E.k + 1} vue de profil</h3><div class="gsliders">${ANGLE_KEYS.map(a => slider('angle', a, ANGLE_LABELS[a], pose.angles[a], -200, 200)).join('')}
        ${slider('pos', 'x', 'Avancée du bassin', pose.x ?? 0, -400, 800)}${slider('pos', 'lift', 'Saut (hauteur)', pose.lift ?? 0, 0, 80)}${slider('pos', 'z', 'Décalage latéral (3D)', pose.z ?? 0, -300, 300)}</div>
      <h3>Corps en 3D</h3><div class="gsliders">${D3_KEYS.map(k => slider('d3', k, D3_LABELS[k], ex[k], ...(D3_RANGE[k] ?? [-30, 90]))).join('')}</div>`;
  };
  const paintPicker = () => {
    const el = $('#at-picker', root); el.hidden = !E.picker;
    if (!E.picker) { el.innerHTML = ''; return; }
    el.innerHTML = `<div class="head"><h3>Remplacer l’étape ${E.k + 1} par un mouvement</h3><button class="small" data-act="pick">Fermer</button></div>
      <p class="subtle">Ses étapes prennent la place de l’étape ${E.k + 1}, à partir de l’endroit où se trouve le corps.</p>
      <div class="mv-grid">${movementLibrary(ctx.state).filter(m => m.id !== g.id).map(m => `<button class="mv-card" data-pick="${esc(m.id)}">${thumb(m)}<b>${esc(m.name)}</b><small>${m.keys.length} étapes</small></button>`).join('')}</div>`;
  };
  // Barre du haut et mode d'emploi : 1 tant que la 3D lit le mouvement, 2 avant la première modification, 3 ensuite.
  const paintBar = () => {
    $('[data-act=undo]', root).disabled = !E.hist.canUndo; $('[data-act=redo]', root).disabled = !E.hist.canRedo; $('.at-dirty', root).hidden = !E.hist.canUndo;
    const name = $('#at-name', root); if (document.activeElement !== name) name.value = g.name;   // après « annuler », le nom suit aussi
    const now = E.playing ? 0 : E.hist.canUndo ? 2 : 1;
    root.querySelectorAll('.at-guide li').forEach((li, i) => li.classList.toggle('now', i === now));
  };
  const paintAll = () => { paintSteps(); paintTools(); paintPart(); paintCheck(); paintAdv(); paintPicker(); paintBar(); };
  // Chaque modification terminée entre dans l'historique. Après un curseur, les curseurs ne sont pas reconstruits (le clavier garde la main).
  const commit = (sliders = true) => { E.hist.push(g); paintSteps(); paintTools(); paintCheck(); paintBar(); if (sliders) { paintPart(); paintAdv(); } };
  // Annuler / rétablir : le mouvement est remplacé sur place (la 3D garde le même objet).
  const restore = s => { if (!s) return; for (const k of Object.keys(g)) delete g[k]; Object.assign(g, s); E.k = Math.min(E.k, g.keys.length - 1); show(true); paintAll(); };
  const throttleCheck = () => { const t = Date.now(); if (t - lastCheck > 120) { lastCheck = t; paintCheck(); } };

  const pickMovement = id => {
    const src = movementLibrary(ctx.state).find(m => m.id === id); if (!src) return;
    if (replaceWithMovement(g, E.k, src, target.maxKeys) < 0) return notify(`Trop d’étapes : ${target.maxKeys} au plus. Supprimez-en d’abord.`);
    E.picker = false; paintPicker(); show(true); commit();
  };
  const save = () => {
    g.keys.forEach((k, i) => { if (i && !(k.ms > 0)) k.ms = STEP_MS.def; if (!i) { delete k.ms; delete k.ease; } });
    const done = target.save(g, Boolean(existing));
    if (!done) return notify('Enregistrement impossible : la limite est atteinte. Supprimez d’abord un mouvement dans l’espace Créer.');
    ctx.gEdit = null; ctx.save(); ctx.gong?.(); notify(done); ctx.go(target.back);
  };
  root.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || b.closest('#at-3d')) return;   // les boutons du lecteur 3D se gèrent eux-mêmes
    if (b.dataset.step !== undefined) { E.k = Number(b.dataset.step); E.playing = false; show(); paintAll(); return; }
    if (b.dataset.pick) return pickMovement(b.dataset.pick);
    const act = b.dataset.act;
    if (act === 'undo') restore(E.hist.undo());
    else if (act === 'redo') restore(E.hist.redo());
    else if (act === 'add') { const i = addStep(g, E.k, target.maxKeys); if (i < 0) return notify(`${target.maxKeys} étapes au plus.`); E.k = i; show(true); commit(); }
    else if (act === 'remove') { E.k = removeStep(g, E.k); show(true); commit(); }
    else if (act === 'faster' || act === 'slower') { setDuration(g, E.k, key().ms * (act === 'slower' ? 1.25 : 0.8)); show(); commit(false); }
    else if (act === 'pick') { E.picker = !E.picker; paintPicker(); paintTools(); }
    else if (act === 'unpart') { E.part = null; viewer?.select(null); paintPart(); }
    else if (act === 'save') save();
    else if (act === 'delete' && confirm(`Supprimer le ${target.noun} « ${g.name} » ?`)) { target.remove(g); ctx.gEdit = null; ctx.save(); ctx.go(target.back); }
  });
  root.addEventListener('input', e => {
    const r = e.target; if (!r.dataset?.kind) return;
    const v = Number(r.value); setV(key().pose, r.dataset.kind, r.dataset.k, v);
    r.previousElementSibling.textContent = `${v}${unit(r.dataset.kind)}`;
    E.playing = false; show(); throttleCheck();
  });
  root.addEventListener('change', e => {
    const t = e.target, v = t.value;
    if (t.dataset?.kind) {   // le même réglage peut être affiché deux fois (partie attrapée et réglages fins)
      root.querySelectorAll(`[data-kind="${t.dataset.kind}"][data-k="${t.dataset.k}"]`).forEach(o => { if (o !== t) { o.value = v; o.previousElementSibling.textContent = `${v}${unit(t.dataset.kind)}`; } });
      return commit(false);
    }
    if (t.id === 'at-name') { g.name = v.trim().slice(0, 100) || `Mon ${target.noun}`; t.value = g.name; commit(false); }
    else if (t.id === 'at-step-name') { key().label = v.trim().slice(0, 60) || `Étape ${E.k + 1}`; commit(false); }
    else if (t.id === 'at-ease') { if (v === 'doux') delete key().ease; else key().ease = v; commit(false); }
    else if (t.id === 'at-passe') { if (t.checked) key().passe = true; else delete key().passe; commit(false); }
    else if (t.id === 'at-dim') { if (v) g.dimension = v; else delete g.dimension; commit(false); }
    else if (t.id === 'at-style') { g.style = v; g.keys.forEach(k => { delete k.pose.d3; }); show(true); commit(); }
    else if (t.id === 'at-from') {
      const [sid, i] = v.split(':'), src = sequences.find(s => s.id === sid); if (!src) return;
      key().pose = clone(src.keys[Number(i)].pose); if (src.style) g.style = src.style; show(true); commit();
    }
  });
  // Ctrl+Z / Ctrl+Y (ou Ctrl+Maj+Z) partout sauf dans un champ de texte, qui garde son propre « annuler ».
  const onKey = e => {
    if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
    const tag = e.target.tagName; if ((tag === 'INPUT' && e.target.type !== 'range') || tag === 'TEXTAREA' || tag === 'SELECT') return;
    const k = e.key.toLowerCase();
    if (k === 'z' && !e.shiftKey) { e.preventDefault(); restore(E.hist.undo()); }
    else if (k === 'y' || (k === 'z' && e.shiftKey)) { e.preventDefault(); restore(E.hist.redo()); }
  };
  document.addEventListener('keydown', onKey); ctx.cleanup.push(() => document.removeEventListener('keydown', onKey));

  paintAll();
  const edit = {
    onSelect: i => { E.playing = i === null; if (i !== null && i !== E.k) { E.k = i; paintAll(); } else paintBar(); },
    onPart: name => { E.part = name; paintPart(); },
    onChange: () => { E.playing = false; throttleCheck(); },
    onCommit: () => commit()
  };
  const noGl = () => { E.no3d = true; host.innerHTML = flat(); $('#at-adv', root).open = true; };
  if (!webglAvailable()) noGl();
  else mount3d(host, g, {dims, edit}).then(v => {
    if (!host.isConnected) return v();
    viewer = v; ctx.cleanup.push(v); v.editKey(E.k); if (E.part) v.select(E.part);
  }).catch(noGl);
}

// Où l'atelier range son travail : dans une méthode de l'atelier (gestes d'origine) ou dans « Mes mouvements » (modèle commun).
export const methodTarget = m => ({key: m.id, noun: 'geste', title: 'Atelier de création', crumb: `<a href="#atelier/${m.id}">${esc(m.name)}</a> · atelier de mouvement`,
  back: 'atelier/' + m.id, backLabel: 'Retour à la méthode', maxKeys: 20, dimensions: false,
  find: id => (m.gestures ?? []).find(g => g.id === id),
  save(g, existing) {
    const c = clone(g); c.keys.forEach(k => normalizeAngles(k.pose));   // les gestes de méthode gardent leurs angles dans [−200°, 200°]
    m.gestures = [...(m.gestures ?? []).filter(x => x.id !== c.id), c].slice(-30);
    m.decisions.unshift({date: new Date().toISOString(), text: `Geste « ${c.name} » ${existing ? 'modifié' : 'créé'} dans l’atelier de mouvement (${c.keys.length} étapes).`});
    return 'Geste enregistré : il est disponible dans vos enchaînements.';
  },
  remove(g) { m.gestures = (m.gestures ?? []).filter(x => x.id !== g.id); m.sequences.forEach(q => { if (q.anim) q.anim = q.anim.filter(a => a !== g.id); }); }});
export const libraryTarget = state => ({key: 'mes-mouvements', noun: 'mouvement', title: 'Créer', crumb: '<a href="#creer">Créer</a> · atelier de mouvement',
  back: 'creer', backLabel: 'Retour à Créer', maxKeys: LIMITS.keys, dimensions: true,
  find: id => (state.movements ?? []).find(x => x.id === id),
  adapt(id) { const src = findMovement(state, id); return src ? adaptMovement(src) : null; },
  save: g => saveMovement(state, g) ? 'Mouvement enregistré dans « Mes mouvements ».' : null,
  remove(g) { removeMovement(state, g.id); }});
