// Manipulation directe du mannequin 3D (atelier de mouvement) : on attrape une partie du corps, on la déplace,
// le moteur en déduit les angles de la pose. Les angles restent ceux du moteur (plan de profil + réglages 3D, body3d.js) :
// un bras ou une jambe se plie dans son propre plan (l'écartement ne change pas), le buste et la tête basculent
// d'avant en arrière, le bassin glisse sur le sol. Deux segments : cinématique inverse analytique (loi des cosinus) ;
// le coude et le genou restent pliés du côté où ils l'étaient.
import {joints3d} from './body3d.js';
import {twoBone, near, clamp} from './ik.js';

// Poignées : `joint` = articulation sous le doigt ; `small` = poignée qui fait tourner un segment autour de son attache.
export const HANDLES = {
  leadFist: {joint: 'leadWrist', kind: 'arm', side: 'lead', label: 'Poing avant'},
  rearFist: {joint: 'rearWrist', kind: 'arm', side: 'rear', label: 'Poing arrière'},
  leadElbow: {joint: 'leadElbow', kind: 'upperArm', side: 'lead', label: 'Coude avant', small: true},
  rearElbow: {joint: 'rearElbow', kind: 'upperArm', side: 'rear', label: 'Coude arrière', small: true},
  leadFoot: {joint: 'leadAnkle', kind: 'leg', side: 'lead', label: 'Pied avant'},
  rearFoot: {joint: 'rearAnkle', kind: 'leg', side: 'rear', label: 'Pied arrière'},
  leadKnee: {joint: 'leadKnee', kind: 'thigh', side: 'lead', label: 'Genou avant', small: true},
  rearKnee: {joint: 'rearKnee', kind: 'thigh', side: 'rear', label: 'Genou arrière', small: true},
  head: {joint: 'head', kind: 'head', label: 'Tête'},
  chest: {joint: 'chest', kind: 'trunk', label: 'Buste'},
  pelvis: {joint: 'pelvis', kind: 'pelvis', label: 'Bassin'}
};

const D = Math.PI / 180;
const SIGN = {lead: 1, rear: -1};
const ABD = {arm: 'ArmAbd', upperArm: 'ArmAbd', leg: 'Abd', thigh: 'Abd'};
const ROOT = {arm: 'Shoulder', upperArm: 'Shoulder', leg: 'Hip', thigh: 'Hip'};
const rotY = ([x, y, z], a) => { const c = Math.cos(a * D), s = Math.sin(a * D); return [x * c + z * s, y, -x * s + z * c]; };
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const round = v => Math.round(v * 10) / 10;

// Axe « bas » du plan de travail, dans le repère du corps : incliné vers l'extérieur par l'écartement du membre
// (même construction que `limb` dans body3d.js), vertical pour la tête et le buste. L'axe « avant » est toujours x.
const downAxis = (h, extras) => {
  if (!h.side) return [0, -1, 0];
  const abd = (extras[h.side + ABD[h.kind]] ?? 0) * D;
  return [0, -Math.cos(abd), SIGN[h.side] * Math.sin(abd)];
};
// Une jambe se plie dans un plan tourné comme le genou (leadLegRot / rearLegRot, body3d.js).
const legYaw = (h, extras) => h.kind === 'leg' || h.kind === 'thigh' ? -(extras[h.side + 'LegRot'] ?? 0) * SIGN[h.side] : 0;
// Coordonnées (avant, bas) d'un vecteur du monde dans le plan de travail ; direction 0 = bas, 90 = avant, 180 = haut.
const inPlane = (v, h, extras) => { const l = rotY(v, -(extras.face ?? 0) - legYaw(h, extras)), d = downAxis(h, extras); return [l[0], l[1] * d[1] + l[2] * d[2]]; };
const dirOf = ([f, d]) => Math.atan2(f, d) / D;

// Plan dans lequel la poignée glisse (repère du monde) : celui du membre, le profil pour la tête et le buste, le sol pour le bassin.
export function dragPlane(name, pose, extras, dims) {
  const h = HANDLES[name], j = joints3d(pose, dims, extras);
  if (h.kind === 'pelvis') return {point: j.pelvis, normal: [0, 1, 0]};
  const d = downAxis(h, extras);   // normale = avant × bas
  return {point: j[h.joint], normal: rotY([0, -d[2], d[1]], (extras.face ?? 0) + legYaw(h, extras))};
}

// Nouvelle pose quand la poignée `name` est amenée au point `target` (monde, mètres). On repart toujours de la pose
// du début du geste (`start`, non modifiée) : pas de dérive, et un retour au point de départ redonne la pose de départ.
export function solve(name, start, extras, dims, target) {
  const h = HANDLES[name], j = joints3d(start, dims, extras), p = JSON.parse(JSON.stringify(start)), a = p.angles;
  if (h.kind === 'pelvis') {   // x et z sont des coordonnées du monde (la rotation « face » tourne autour du bassin)
    p.x = round((start.x ?? 0) + (target[0] - j.pelvis[0]) / dims.unit);
    const z = (start.z ?? 0) + (target[2] - j.pelvis[2]) / dims.unit;
    if (start.z !== undefined || Math.abs(z) >= 0.05) p.z = round(z);
    return p;
  }
  if (h.kind === 'head' || h.kind === 'trunk') {
    const dir = dirOf(inPlane(sub(target, h.kind === 'head' ? j.neckBase : j.pelvis), h, extras));
    if (h.kind === 'head') a.neck = round(clamp(near(180 - a.torso - dir, a.neck ?? 0), -85, 85));
    else a.torso = round(clamp(near(180 - dir, a.torso), -70, 130));
    return p;
  }
  const s = h.side, v = inPlane(sub(target, j[s + ROOT[h.kind]]), h, extras);
  if (h.kind === 'upperArm') { a[s + 'Shoulder'] = round(near(dirOf(v) - a.torso, a[s + 'Shoulder'])); return p; }
  if (h.kind === 'thigh') { a[s + 'Hip'] = round(near(dirOf(v), a[s + 'Hip'])); return p; }
  if (h.kind === 'arm') {   // l'avant-bras va de (épaule + coude) : un coude plié « en avant » a un angle positif
    const side = a[s + 'Elbow'] < -20 ? -1 : 1, {dir, at, bend} = twoBone(v[0], v[1], dims.upperArm, dims.forearm + dims.fist);
    a[s + 'Shoulder'] = round(near(dir - side * at - a.torso, a[s + 'Shoulder'])); a[s + 'Elbow'] = round(side * bend);
    return p;
  }
  // Jambe : le tibia va de (hanche − genou). Un pied posé au sol au début du geste reste collé au sol tant qu'on ne le lève
  // pas franchement (5 cm) et garde son orientation (la cheville compense) ; un pied en l'air suit le tibia.
  const side = a[s + 'Knee'] < -20 ? -1 : 1, shin0 = a[s + 'Hip'] - a[s + 'Knee'], planted = Math.min(j[s + 'Heel'][1], j[s + 'Toe'][1]) < 0.02, y0 = j[s + 'Ankle'][1];
  const w = planted && target[1] < y0 + 0.05 ? inPlane(sub([target[0], y0, target[2]], j[s + 'Hip']), h, extras) : v;
  const {dir, at, bend} = twoBone(w[0], w[1], dims.thigh, dims.shin);
  a[s + 'Hip'] = round(near(dir + side * at, a[s + 'Hip'])); a[s + 'Knee'] = round(side * bend);
  if (planted) a[s + 'Ankle'] = round(clamp(shin0 + (a[s + 'Ankle'] ?? 0) - (a[s + 'Hip'] - a[s + 'Knee']), -80, 60));
  return p;
}
