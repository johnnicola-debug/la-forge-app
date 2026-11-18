// Vérification prudente d'une étape (atelier de mouvement) : amplitudes articulaires, équilibre, vitesse d'arrivée.
// Des repères pour attirer l'œil, pas un diagnostic. Le mannequin ne connaît ni la souplesse de la personne ni la rotation
// des bras et des jambes : ses angles sont ceux d'un dessin de profil complété par quelques réglages 3D (body3d.js).
// Seuils « habituels » : ordres de grandeur des amplitudes moyennes de l'adulte publiées par l'American Academy of
// Orthopaedic Surgeons (genou ≈ 135°, hanche ≈ 120° en flexion et 30° en extension, abduction de hanche ≈ 45°, coude ≈ 150°,
// cou ≈ 50°), élargis là où le mannequin simplifie : son buste est d'un seul bloc (la flexion du bas du dos compte avec
// la hanche), et la cheville en appui se relève plus qu'à vide (≈ 40°). Hanche et cheville sont mesurées en 3D, dans le
// repère du bassin tourné et du pied orienté. Seuils « très inhabituels » et vitesses : choix prudents propres à cet outil.
import {joints3d, bodyDims, extrasOf, centerOfMass3d, supportPolygon, insideMargin} from './body3d.js';

// Angles anatomiques en degrés : [habituel min, habituel max] puis [très inhabituel min, très inhabituel max].
export const RANGES = {
  knee: {usual: [-5, 145], extreme: [-15, 165]},     // flexion positive, hyperextension négative
  hip: {usual: [-30, 125], extreme: [-55, 175]},     // cuisse / buste : flexion positive ; genou plié (≥ 45°) : jusqu'à 160° habituels
  ankle: {usual: [-55, 40], extreme: [-75, 60]},     // pied relevé positif, pointe tendue négative
  elbow: {usual: [0, 150], extreme: [0, 170]},       // pliure seule (le sens dépend de la rotation du bras, inconnue)
  neck: {usual: [-55, 60], extreme: [-80, 80]},
  legAbd: {usual: [-30, 50], extreme: [-45, 95]},    // jambe écartée du bassin sur le côté (négatif : croisée)
  twist: {usual: [-35, 35], extreme: [-55, 55]},     // genou plié (30° et plus) qui ne pointe pas comme le pied : torsion
  lean: {usual: [-30, 30], extreme: [-45, 45]},      // buste penché sur le côté
  // Squelette version 3 — amplitudes moyennes de l'adulte (AAOS) : rotation cervicale ≈ 80°, inclinaison ≈ 45°, rotation de
  // l'humérus interne 70° / externe 90°, pronation et supination 80°, poignet flexion 80° / extension 70°, extension du gros
  // orteil 70° ; arrière-pied inversion ≈ 30° / éversion ≈ 15° ; bassin : repères prudents propres à l'outil.
  neckRot: {usual: [-80, 80], extreme: [-95, 95]},   // tête par rapport aux épaules
  headTilt: {usual: [-40, 40], extreme: [-50, 50]},
  armRot: {usual: [-70, 90], extreme: [-85, 105]},
  pronation: {usual: [-80, 80], extreme: [-95, 95]},
  wrist: {usual: [-70, 80], extreme: [-85, 95]},
  footRoll: {usual: [-15, 30], extreme: [-25, 45]},
  toes: {usual: [0, 70], extreme: [0, 90]},
  pelvisTilt: {usual: [-20, 25], extreme: [-30, 35]},
  pelvisList: {usual: [-15, 15], extreme: [-25, 25]},
  spineRot: {usual: [-45, 45], extreme: [-60, 60]}   // épaules par rapport au bassin : rotation thoraco-lombaire ≈ 45° (AAOS)
};
// Vitesse moyenne en ligne droite pour atteindre une étape (sous-estime le trajet réel), en m/s.
export const SPEEDS = [['leadWrist', 'Poing avant', 10], ['rearWrist', 'Poing arrière', 10], ['leadAnkle', 'Pied avant', 15], ['rearAnkle', 'Pied arrière', 15], ['pelvis', 'Bassin', 6]];

const SIDE = {lead: 'avant', rear: 'arrière'};
const deg = v => `${Math.round(Math.abs(v))}°`;
const TEXT = {
  knee: (v, s) => v < 0 ? `Genou ${s} en hyperextension (${deg(v)})` : `Genou ${s} plié à ${deg(v)}`,
  hip: (v, s) => v < 0 ? `Hanche ${s} tendue vers l’arrière de ${deg(v)}` : `Hanche ${s} fléchie à ${deg(v)}`,
  ankle: (v, s) => v < 0 ? `Pointe du pied ${s} tendue de ${deg(v)}` : `Pied ${s} relevé de ${deg(v)}`,
  elbow: (v, s) => `Coude ${s} plié à ${deg(v)}`,
  neck: v => v < 0 ? `Tête renversée en arrière de ${deg(v)}` : `Tête penchée en avant de ${deg(v)}`,
  trunk: v => v < 0 ? `Buste renversé en arrière de ${deg(v)}` : `Buste penché en avant de ${deg(v)}`,
  legAbd: (v, s) => v < 0 ? `Jambe ${s} croisée de ${deg(v)}` : `Jambe ${s} écartée de ${deg(v)}`,
  twist: (v, s) => `Genou ${s} et pied mal alignés (${deg(v)} de torsion du genou)`,
  lean: v => `Buste penché sur le côté de ${deg(v)}`,
  neckRot: v => `Tête tournée de ${deg(v)} par rapport aux épaules`,
  headTilt: v => `Tête inclinée de ${deg(v)}`,
  armRot: (v, s) => `Bras ${s} tourné vers ${v < 0 ? 'l’intérieur' : 'l’extérieur'} de ${deg(v)}`,
  pronation: (v, s) => `Avant-bras ${s} en ${v < 0 ? 'supination' : 'pronation'} de ${deg(v)}`,
  wrist: (v, s) => `Poignet ${s} ${v < 0 ? 'en extension' : 'fléchi'} de ${deg(v)}`,
  footRoll: (v, s) => `Arrière-pied ${s} en ${v < 0 ? 'éversion' : 'inversion'} de ${deg(v)}`,
  toes: (v, s) => `Orteils ${s} relevés de ${deg(v)}`,
  pelvisTilt: v => `Bassin basculé ${v < 0 ? 'en arrière' : 'en avant'} de ${deg(v)}`,
  pelvisList: v => `Bassin incliné sur le côté de ${deg(v)}`,
  spineRot: v => `Épaules tournées de ${deg(v)} par rapport au bassin`
};
const R = Math.PI / 180;
const sag = a => [Math.sin(a * R), -Math.cos(a * R), 0];
const rotX = ([x, y, z], a) => { const c = Math.cos(a * R), s = Math.sin(a * R); return [x, y * c - z * s, y * s + z * c]; };
const rotY = ([x, y, z], a) => { const c = Math.cos(a * R), s = Math.sin(a * R); return [x * c + z * s, y, -x * s + z * c]; };
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const flat = (v, n) => { const k = dot(v, n); return [v[0] - k * n[0], v[1] - k * n[1], v[2] - k * n[2]]; };
const between = (a, b) => Math.acos(Math.max(-1, Math.min(1, dot(a, b)))) / R;

// Angles anatomiques d'une pose : [articulation, côté, valeur, angle du genou]. Mêmes vecteurs que body3d.js : cuisse et tibia
// dans le plan de la jambe (écartement), pied orienté vers l'extérieur ; la hanche se lit autour de l'axe du bassin tourné.
export function anatomy(pose, extras) {
  const a = pose.angles, lat = rotY([0, 0, 1], extras.turn ?? 0), down = flat(rotX(sag(-a.torso), extras.lean ?? 0), lat), out = [];
  for (const [s, sgn] of [['lead', 1], ['rear', -1]]) {
    const abd = extras[s + 'Abd'] ?? 0, rot = -(extras[s + 'LegRot'] ?? 0) * sgn, shinA = a[s + 'Hip'] - a[s + 'Knee'], thigh = rotY(rotX(sag(a[s + 'Hip']), -abd * sgn), rot);
    const shin = rotY(rotX(sag(shinA), -abd * sgn), rot), foot = rotY(sag(shinA + 90 + (a[s + 'Ankle'] ?? 0)), -(extras[s + 'FootOut'] ?? 0) * sgn), t = flat(thigh, lat);
    out.push(['knee', s, a[s + 'Knee']], ['hip', s, Math.atan2(dot(cross(down, t), lat), dot(down, t)) / R, a[s + 'Knee']],
      ['legAbd', s, Math.asin(Math.max(-1, Math.min(1, dot(thigh, lat) * sgn))) / R], ['ankle', s, between(shin, foot) - 90], ['elbow', s, Math.abs(a[s + 'Elbow'])],
      ['twist', s, (extras[s + 'FootOut'] ?? 0) - (extras[s + 'LegRot'] ?? 0), a[s + 'Knee']],
      ['armRot', s, extras[s + 'ArmRot'] ?? 0], ['pronation', s, extras[s + 'Pronation'] ?? 0], ['wrist', s, extras[s + 'WristFlex'] ?? 0],
      ['footRoll', s, extras[s + 'FootRoll'] ?? 0], ['toes', s, extras[s + 'Toes'] ?? 0]);
  }
  out.push(['neck', null, a.neck ?? 0], ['lean', null, extras.lean ?? 0], ['neckRot', null, (extras.headTurn ?? 0) - (extras.turn ?? 0) - (extras.chestTurn ?? 0)],
    ['headTilt', null, extras.headTilt ?? 0], ['pelvisTilt', null, extras.pelvisTilt ?? 0], ['pelvisList', null, extras.pelvisList ?? 0],
    ['spineRot', null, extras.chestTurn ?? 0]);
  return out;
}
export function judge(kind, side, v, knee) {
  const {usual: [lo, h0], extreme: [elo, ehi]} = RANGES[kind], hi = kind === 'hip' && knee >= 45 ? 160 : h0;
  if ((v >= lo && v <= hi) || (kind === 'twist' && Math.abs(knee) < 30)) return null;   // genou presque tendu : la hanche tourne, pas le genou
  const far = v < elo || v > ehi, straight = kind === 'hip' && v > hi && knee < 45 ? ', jambe tendue' : '';
  return {level: far ? 'alerte' : 'attention', text: `${TEXT[kind](v, SIDE[side])}${straight} : ${far ? 'très ' : ''}au-delà de l’amplitude habituelle (${deg(v < lo ? lo : hi)}).`};
}

// Équilibre : marge du centre de masse dans le polygone d'appui, en cm (négative : hors des appuis ; −Infinity : aucun appui).
export function balance(seq, pose, dims = bodyDims()) {
  const j = joints3d(pose, dims, extrasOf(seq, pose)), c = centerOfMass3d(j);
  return Math.round(insideMargin(supportPolygon(j, dims), [c[0], c[2]]) * 100);
}

// Vitesse moyenne de chaque extrémité pour passer de l'étape i − 1 à l'étape i, en m/s.
export function arrivalSpeeds(seq, i, dims = bodyDims()) {
  const a = seq.keys[i - 1].pose, b = seq.keys[i].pose, ja = joints3d(a, dims, extrasOf(seq, a)), jb = joints3d(b, dims, extrasOf(seq, b));
  const s = Math.max(0.001, (seq.keys[i].ms ?? 0) / 1000);
  return Object.fromEntries(SPEEDS.map(([k]) => [k, Math.hypot(jb[k][0] - ja[k][0], jb[k][1] - ja[k][1], jb[k][2] - ja[k][2]) / s]));
}

// Remarques sur l'étape i : équilibre (jugé seulement pour les poses tenues, au début et à la fin), amplitudes, vitesse.
export function checkStep(seq, i, dims = bodyDims()) {
  const pose = seq.keys[i].pose, notes = [];
  for (const [kind, side, v, knee] of anatomy(pose, extrasOf(seq, pose))) { const n = judge(kind, side, v, knee); if (n) notes.push(n); }
  if (i > 0) {
    const sp = arrivalSpeeds(seq, i, dims);
    for (const [k, name, lim] of SPEEDS) if (sp[k] > lim) notes.push({level: 'attention',
      text: `${name} : ${sp[k].toFixed(1).replace('.', ',')} m/s en moyenne pour arriver ici, au-delà de ${lim} m/s : très rapide pour un corps humain. Allongez la durée.`});
  }
  const j = joints3d(pose, dims, extrasOf(seq, pose)), c = centerOfMass3d(j), poly = supportPolygon(j, dims), held = i === 0 || i === seq.keys.length - 1;
  const mg = Math.round(insideMargin(poly, [c[0], c[2]]) * 100), tail = held ? '.' : ' (normal pendant un pas, un saut ou un coup).';
  const bal = !poly.length || (pose.lift ?? 0) > 0 ? {level: 'info', text: 'En l’air : aucun appui au sol à cet instant.'}
    : poly.length < 3 ? {level: held ? 'attention' : 'info', text: `Appui trop étroit (un seul point au sol) : la pose ne tient pas immobile${tail}`}
    : mg >= 2 ? {level: 'ok', text: `Équilibre stable (marge ${mg} cm).`}
    : mg >= 0 ? {level: 'ok', text: `Équilibre juste (marge ${mg} cm).`}
    : {level: held ? 'attention' : 'info', text: `Hors d’équilibre si la pose est tenue : le centre de masse dépasse les appuis de ${-mg} cm${tail}`};
  return {balance: bal, notes};
}
const RANK = {ok: 0, info: 0, attention: 1, alerte: 2};
export const worst = r => [r.balance, ...r.notes].reduce((w, n) => RANK[n.level] > RANK[w] ? n.level : w, 'ok');
