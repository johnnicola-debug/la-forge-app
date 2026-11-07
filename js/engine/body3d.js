// Corps 3D : cinématique directe en trois dimensions, proportions du pratiquant, centre de masse et polygone d'appui.
// Repère : x vers l'avant (la cible), y vers le haut, z vers le côté avant (pied avant à gauche en garde « gaucher devant »).
// Les angles du plan de profil sont ceux du moteur 2D (skeleton.js) ; s'y ajoutent des réglages 3D par style :
// rotation des hanches et des épaules, écartement des jambes et des bras, orientation des pieds.
// Les poses restent des illustrations choisies à l'œil : aucune contrainte anatomique n'est vérifiée.
import {SEGMENT_MASS} from './skeleton.js';

// Proportions segmentaires moyennes, en fraction de la taille (Drillis et Contini, reprises par Winter,
// Biomechanics and Motor Control of Human Movement, 4e éd., 2009, fig. 4.1). Approximation pour un adulte « moyen ».
export const FRACTIONS = {torso: 0.29, neck: 0.05, head: 0.075, shoulderSep: 0.2, hipSep: 0.1,
  upperArm: 0.186, forearm: 0.146, fist: 0.04, thigh: 0.245, shin: 0.246, ankleH: 0.039, footFwd: 0.12, heelBack: 0.032, footHalfW: 0.025};

// Réglages 3D par style de garde (degrés). face : orientation de tout le corps (0 = vers la cible, 180 = dos tourné, 360 = tour complet) ;
// turn : rotation des hanches (0 = de face, 90 = complètement de profil).
export const PRESETS = {
  boxe:    {face: 0, turn: 28, chestTurn: 6,  leadAbd: 4, rearAbd: 7, leadFootOut: 18, rearFootOut: 45, leadArmAbd: 8, rearArmAbd: 14},
  escrime: {face: 0, turn: 68, chestTurn: 8,  leadAbd: 0, rearAbd: 2, leadFootOut: 0,  rearFootOut: 85, leadArmAbd: 4, rearArmAbd: 30},
  karate:  {face: 0, turn: 30, chestTurn: 0,  leadAbd: 5, rearAbd: 8, leadFootOut: 8,  rearFootOut: 30, leadArmAbd: 6, rearArmAbd: 18},
  carre:   {face: 0, turn: 12, chestTurn: 0,  leadAbd: 6, rearAbd: 8, leadFootOut: 15, rearFootOut: 30, leadArmAbd: 10, rearArmAbd: 12}
};
export const D3_KEYS = Object.keys(PRESETS.boxe);

// Dimensions en mètres. Taille par défaut 1,75 m ; l'envergure, si elle est connue, allonge ou raccourcit les bras.
export function bodyDims({height = 175, span = null} = {}) {
  const H = Math.min(2.3, Math.max(1.2, (Number(height) || 175) / 100));
  const S = span ? Math.min(2.5, Math.max(1.1, Number(span) / 100)) : H;
  const arm = (S - FRACTIONS.shoulderSep * H) / (H - FRACTIONS.shoulderSep * H);
  const d = {H, span: S, armScale: arm};
  for (const [k, f] of Object.entries(FRACTIONS)) d[k] = f * H * (['upperArm', 'forearm', 'fist'].includes(k) ? arm : 1);
  d.unit = 0.0068 * H / 1.75;          // 1 unité du moteur 2D (déplacements x, lift) en mètres
  return d;
}

const R = a => a * Math.PI / 180;
const rotX = ([x, y, z], a) => { const c = Math.cos(R(a)), s = Math.sin(R(a)); return [x, y * c - z * s, y * s + z * c]; };
const rotY = ([x, y, z], a) => { const c = Math.cos(R(a)), s = Math.sin(R(a)); return [x * c + z * s, y, -x * s + z * c]; };
const sag = a => [Math.sin(R(a)), -Math.cos(R(a)), 0];      // 0 = vers le bas, 90 = vers l'avant, 180 = vers le haut
const add = (p, v, l = 1) => [p[0] + v[0] * l, p[1] + v[1] * l, p[2] + v[2] * l];
// Direction d'un membre : angle du plan de profil, puis écartement vers l'extérieur (côté avant : +z).
const limb = (a, abd, sgn) => rotX(sag(a), -abd * sgn);

export const extrasOf = (seq, pose) => ({...PRESETS[seq?.style] ?? PRESETS.boxe, ...pose?.d3});

// Articulations en mètres, posées au sol (le point le plus bas des pieds à y = 0, sauf « lift »).
export function joints3d(pose, dims = bodyDims(), extras = PRESETS.boxe) {
  const a = pose.angles, d = dims, e = {...PRESETS.boxe, ...extras};
  const pelvis = [(pose.x ?? 0) * d.unit, 0, 0];
  const up = sag(180 - a.torso);
  const j = {pelvis, chest: add(pelvis, up, d.torso * 0.8), neckBase: add(pelvis, up, d.torso)};
  j.head = add(j.neckBase, sag(180 - a.torso - (a.neck ?? 0)), d.neck + d.head);
  const shAxis = rotY([0, 0, 1], e.turn + e.chestTurn), hipAxis = rotY([0, 0, 1], e.turn), shoulderLine = add(pelvis, up, d.torso * 0.93);
  for (const [side, sgn] of [['lead', 1], ['rear', -1]]) {
    const sh = add(shoulderLine, shAxis, sgn * d.shoulderSep / 2), armAbd = e[side + 'ArmAbd'];
    const upper = a.torso + a[side + 'Shoulder'], elbow = add(sh, limb(upper, armAbd, sgn), d.upperArm);
    const wrist = add(elbow, limb(upper + a[side + 'Elbow'], armAbd, sgn), d.forearm + d.fist);
    const hip = add(pelvis, hipAxis, sgn * d.hipSep / 2), abd = e[side + 'Abd'];
    const thigh = a[side + 'Hip'], knee = add(hip, limb(thigh, abd, sgn), d.thigh);
    const shin = thigh - a[side + 'Knee'], ankle = add(knee, limb(shin, abd, sgn), d.shin);
    // Pied rigide : direction du pied (tangage puis orientation vers l'extérieur) et normale vers la semelle.
    const pitch = shin + 90 + (a[side + 'Ankle'] ?? 0), yaw = -e[side + 'FootOut'] * sgn;
    const foot = rotY(sag(pitch), yaw), sole = rotY(sag(pitch - 90), yaw);
    const toe = add(add(ankle, foot, d.footFwd), sole, d.ankleH * 0.55);
    const flat = norm([foot[0], 0, foot[2]]), heel = add(add(ankle, foot, -d.heelBack), sole, d.ankleH);
    Object.assign(j, {[side + 'Shoulder']: sh, [side + 'Elbow']: elbow, [side + 'Wrist']: wrist, [side + 'Hip']: hip,
      [side + 'Knee']: knee, [side + 'Ankle']: ankle, [side + 'Toe']: toe, [side + 'Heel']: heel, [side + 'FootDir']: flat});
  }
  // Rotation de tout le corps autour de l'axe vertical du bassin (voltes, techniques retournées).
  if (e.face) for (const k in j) { const p = j[k]; if (k.endsWith('FootDir')) j[k] = rotY(p, e.face); else { const r = rotY([p[0] - pelvis[0], p[1], p[2]], e.face); j[k] = [pelvis[0] + r[0], r[1], r[2]]; } }
  // Appui : le point le plus bas du corps touche le sol (pieds en général ; mains, genoux, dos ou tête dans le travail au sol).
  const R = {head: d.head * 0.85, leadWrist: d.fist * 0.75, rearWrist: d.fist * 0.75, leadKnee: 0.035 * d.H, rearKnee: 0.035 * d.H, leadElbow: 0.027 * d.H, rearElbow: 0.027 * d.H, pelvis: 0.06 * d.H, chest: 0.07 * d.H};
  const low = Math.min(j.leadHeel[1], j.rearHeel[1], j.leadToe[1], j.rearToe[1], ...Object.entries(R).map(([k, r]) => j[k][1] - r));
  const dy = -low + (pose.lift ?? 0) * d.unit;
  for (const k in j) if (!k.endsWith('FootDir')) j[k] = [j[k][0], j[k][1] + dy, j[k][2]];
  return j;
}
function norm(v) { const l = Math.hypot(...v) || 1; return v.map(x => x / l); }

// Centre de masse : mêmes fractions segmentaires que le moteur 2D (Dempster / Winter).
export function centerOfMass3d(j) {
  const c = [0, 0, 0]; let m = 0;
  for (const [a, b, w, r] of SEGMENT_MASS) { for (let i = 0; i < 3; i++) c[i] += w * (j[a][i] + (j[b][i] - j[a][i]) * r); m += w; }
  return c.map(x => x / m);
}

// Polygone d'appui au sol (plan x-z) : enveloppe convexe des talons et des avant-pieds posés (tolérance en mètres).
export function supportPolygon(j, dims = bodyDims(), tol = 0.04) {
  const pts = [];
  for (const s of ['lead', 'rear']) {
    const f = j[s + 'FootDir'], side = [-f[2], 0, f[0]], w = dims.footHalfW;
    if (j[s + 'Heel'][1] <= tol) pts.push(add(j[s + 'Heel'], side, w * 0.7), add(j[s + 'Heel'], side, -w * 0.7));
    if (j[s + 'Toe'][1] <= tol) pts.push(add(j[s + 'Toe'], side, w), add(j[s + 'Toe'], side, -w));
  }
  // Au sol, les mains et les genoux posés font aussi partie de la base d'appui.
  for (const k of ['leadWrist', 'rearWrist', 'leadKnee', 'rearKnee']) if (j[k][1] <= tol + 0.04 * dims.H) pts.push(j[k]);
  return hull(pts.map(p => [p[0], p[2]]));
}
function hull(P) {
  if (P.length < 3) return P;
  const p = [...P].sort((a, b) => a[0] - b[0] || a[1] - b[1]), cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], hi = [];
  for (const q of p) { while (lo.length > 1 && cross(lo.at(-2), lo.at(-1), q) <= 0) lo.pop(); lo.push(q); }
  for (const q of [...p].reverse()) { while (hi.length > 1 && cross(hi.at(-2), hi.at(-1), q) <= 0) hi.pop(); hi.push(q); }
  return lo.slice(0, -1).concat(hi.slice(0, -1));
}
// Distance signée du point (x, z) au bord du polygone : positive à l'intérieur.
export function insideMargin(poly, [x, z]) {
  if (poly.length < 3) return -Infinity;
  let m = Infinity;
  for (let i = 0; i < poly.length; i++) {
    const [ax, az] = poly[i], [bx, bz] = poly[(i + 1) % poly.length], l = Math.hypot(bx - ax, bz - az) || 1;
    m = Math.min(m, ((bx - ax) * (z - az) - (bz - az) * (x - ax)) / l);
  }
  return m;
}

// Interpolation des réglages 3D entre deux poses (les angles sont interpolés par skeleton.js).
export function lerpExtras(e1, e2, t) {
  const o = {};
  for (const k of D3_KEYS) o[k] = e1[k] + (e2[k] - e1[k]) * t;
  return o;
}

// Pose et réglages 3D à la position u ∈ [0, 1] d'une séquence (même lissage que le moteur 2D).
export function sample3d(seq, u, samplePose) {
  const {pose, phase} = samplePose(seq, u), keys = seq.keys, total = keys.slice(1).reduce((s, k) => s + k.ms, 0);
  let t = Math.min(1, Math.max(0, u)) * total, i = 1;
  for (; i < keys.length - 1 && t > keys[i].ms; i++) t -= keys[i].ms;
  const local = keys[i].ms ? Math.min(1, t / keys[i].ms) : 1, s = local * local * (3 - 2 * local);
  return {pose, phase, extras: lerpExtras(extrasOf(seq, keys[i - 1].pose), extrasOf(seq, keys[i].pose), s)};
}
