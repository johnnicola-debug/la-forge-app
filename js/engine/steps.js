// Étapes d'un mouvement (atelier de mouvement) : ajouter, retirer, régler la durée, remplacer une étape par un autre
// mouvement, et l'historique qui permet de tout annuler. Fonctions pures qui modifient la séquence reçue ; la vue affiche.
import {extrasOf} from './body3d.js';

// Durée pour atteindre une étape (ms) : bornes acceptées à la fois par « Mes mouvements » et par les gestes de méthode.
export const STEP_MS = {min: 50, max: 5000, def: 500};
const clone = o => JSON.parse(JSON.stringify(o));
const r1 = v => Math.round(v * 10) / 10;
export const stepMs = v => Math.min(STEP_MS.max, Math.max(STEP_MS.min, Math.round((Number(v) || STEP_MS.def) / 10) * 10));

// Ajoute juste après l'étape k une copie de sa pose. Renvoie l'indice de la nouvelle étape, ou −1 si la limite est atteinte.
export function addStep(seq, k, max) {
  if (seq.keys.length >= max) return -1;
  seq.keys.splice(k + 1, 0, {label: `Étape ${seq.keys.length + 1}`, ms: STEP_MS.def, pose: clone(seq.keys[k].pose)});
  return k + 1;
}

// Retire l'étape k (il en reste toujours deux) ; la nouvelle première étape n'a plus de durée. Renvoie l'étape à montrer.
export function removeStep(seq, k) {
  if (seq.keys.length <= 2) return k;
  seq.keys.splice(k, 1); delete seq.keys[0].ms; delete seq.keys[0].ease;
  return Math.max(0, k - 1);
}

export function setDuration(seq, k, ms) { if (k > 0) seq.keys[k].ms = stepMs(ms); return k; }

// Remplace l'étape k par toutes les étapes d'un autre mouvement. Le mouvement inséré part de l'endroit où se trouvait
// le corps à cette étape (avancée, décalage latéral) ; venu d'une autre garde, chaque pose emporte ses réglages 3D
// pour garder son allure (jeu de jambes d'escrime + frappe de boxe, par exemple). Renvoie k, ou −1 si trop d'étapes.
export function replaceWithMovement(seq, k, src, max) {
  const n = src?.keys?.length ?? 0;
  if (n < 1 || seq.keys.length - 1 + n > max) return -1;
  const at = seq.keys[k].pose, first = src.keys[0].pose, dx = (at.x ?? 0) - (first.x ?? 0), dz = (at.z ?? 0) - (first.z ?? 0);
  const other = (src.style ?? 'boxe') !== (seq.style ?? 'boxe');
  const keys = src.keys.map((s, i) => {
    const pose = clone(s.pose);
    pose.x = r1((pose.x ?? 0) + dx);
    if (dz || pose.z !== undefined) pose.z = r1((pose.z ?? 0) + dz);
    if (other) pose.d3 = {...extrasOf(src, s.pose)};
    const key = {label: String(s.label || `Étape ${i + 1}`).slice(0, 60), pose};
    if (i) { key.ms = stepMs(s.ms); if (s.ease) key.ease = s.ease; if (s.passe) key.passe = true; if (s.glisse) key.glisse = [...s.glisse]; if (s.timing) key.timing = clone(s.timing); if (s.pivot) key.pivot = s.pivot; }
    if (typeof s.phase === 'string') key.phase = s.phase;
    if (typeof s.cue === 'string') key.cue = s.cue.slice(0, 200);
    return key;
  });
  if (k > 0) { keys[0].ms = seq.keys[k].ms ?? STEP_MS.def; if (seq.keys[k].ease) keys[0].ease = seq.keys[k].ease; }
  seq.keys.splice(k, 1, ...keys);
  return k;
}

// Angles hors de [−200°, 200°] ramenés dans [−180°, 180°[ : même pose (la cinématique est périodique), valeur acceptée partout.
export function normalizeAngles(pose) {
  for (const [k, v] of Object.entries(pose.angles)) if (Math.abs(v) > 200) pose.angles[k] = r1(((v + 180) % 360 + 360) % 360 - 180);
  return pose;
}

// Historique d'annulation : instantanés successifs du mouvement (texte JSON), 80 au plus.
export function history(initial, limit = 80) {
  let cur = JSON.stringify(initial);
  const past = [], future = [];
  return {
    push(state) { const s = JSON.stringify(state); if (s === cur) return false; past.push(cur); if (past.length > limit) past.shift(); cur = s; future.length = 0; return true; },
    undo() { if (!past.length) return null; future.push(cur); cur = past.pop(); return JSON.parse(cur); },
    redo() { if (!future.length) return null; past.push(cur); cur = future.pop(); return JSON.parse(cur); },
    get canUndo() { return past.length > 0; },
    get canRedo() { return future.length > 0; }
  };
}
