// Corps 3D : cinématique directe en trois dimensions, proportions du pratiquant, centre de masse et polygone d'appui.
// Repère : x vers l'avant (la cible), y vers le haut, z vers le côté avant (pied avant à gauche en garde « gaucher devant »).
// Les angles du plan de profil sont ceux du moteur 2D (skeleton.js) ; s'y ajoutent des réglages 3D par style :
// rotation des hanches et des épaules, écartement des jambes et des bras, orientation des pieds.
// Les poses restent des illustrations choisies à l'œil : aucune contrainte anatomique n'est vérifiée.
import {SEGMENT_MASS, easing, segment, slope, hermite} from './skeleton.js';
import {twoBone, near, clamp} from './ik.js';

// Proportions segmentaires moyennes, en fraction de la taille (Drillis et Contini, reprises par Winter,
// Biomechanics and Motor Control of Human Movement, 4e éd., 2009, fig. 4.1). Approximation pour un adulte « moyen ».
export const FRACTIONS = {torso: 0.29, neck: 0.05, head: 0.075, shoulderSep: 0.2, hipSep: 0.1,
  upperArm: 0.186, forearm: 0.146, fist: 0.04, thigh: 0.245, shin: 0.246, ankleH: 0.039, footFwd: 0.12, heelBack: 0.032, footHalfW: 0.025};

// Réglages 3D par style de garde (degrés). face : orientation de tout le corps (0 = vers la cible, 180 = dos tourné, 360 = tour complet) ;
// turn : rotation des hanches (0 = de face, 90 = complètement de profil). Ajouts du 17/11/2026 (zéro par défaut, rien ne change
// pour les poses existantes) : leadLegRot / rearLegRot, genou tourné vers l'extérieur (le plan où la jambe se plie tourne comme
// le pied, pour que le genou reste au-dessus des orteils) ; lean, buste penché sur le côté (positif vers le côté avant).
export const PRESETS = {
  boxe:    {face: 0, turn: 28, chestTurn: 6,  leadAbd: 4, rearAbd: 7, leadFootOut: 18, rearFootOut: 45, leadArmAbd: 8, rearArmAbd: 14, leadLegRot: 0, rearLegRot: 0, lean: 0},
  escrime: {face: 0, turn: 68, chestTurn: 8,  leadAbd: 0, rearAbd: 2, leadFootOut: 0,  rearFootOut: 85, leadArmAbd: 4, rearArmAbd: 30, leadLegRot: 0, rearLegRot: 0, lean: 0},
  karate:  {face: 0, turn: 30, chestTurn: 0,  leadAbd: 5, rearAbd: 8, leadFootOut: 8,  rearFootOut: 30, leadArmAbd: 6, rearArmAbd: 18, leadLegRot: 0, rearLegRot: 0, lean: 0},
  carre:   {face: 0, turn: 12, chestTurn: 0,  leadAbd: 6, rearAbd: 8, leadFootOut: 15, rearFootOut: 30, leadArmAbd: 10, rearArmAbd: 12, leadLegRot: 0, rearLegRot: 0, lean: 0}
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
  const pelvis = [(pose.x ?? 0) * d.unit, 0, (pose.z ?? 0) * d.unit];
  const lean = e.lean ?? 0, up = rotX(sag(180 - a.torso), lean);   // buste penché vers l'avant (torso), puis sur le côté (lean)
  const j = {pelvis, chest: add(pelvis, up, d.torso * 0.8), neckBase: add(pelvis, up, d.torso)};
  j.head = add(j.neckBase, rotX(sag(180 - a.torso - (a.neck ?? 0)), lean), d.neck + d.head);
  const shAxis = rotX(rotY([0, 0, 1], e.turn + e.chestTurn), lean), hipAxis = rotY([0, 0, 1], e.turn), shoulderLine = add(pelvis, up, d.torso * 0.93);
  for (const [side, sgn] of [['lead', 1], ['rear', -1]]) {
    const sh = add(shoulderLine, shAxis, sgn * d.shoulderSep / 2), armAbd = e[side + 'ArmAbd'];
    const upper = a.torso + a[side + 'Shoulder'], elbow = add(sh, limb(upper, armAbd, sgn), d.upperArm);
    const wrist = add(elbow, limb(upper + a[side + 'Elbow'], armAbd, sgn), d.forearm + d.fist);
    const hip = add(pelvis, hipAxis, sgn * d.hipSep / 2), abd = e[side + 'Abd'], rot = -(e[side + 'LegRot'] ?? 0) * sgn;
    const thigh = a[side + 'Hip'], knee = add(hip, rotY(limb(thigh, abd, sgn), rot), d.thigh);
    const shin = thigh - a[side + 'Knee'], ankle = add(knee, rotY(limb(shin, abd, sgn), rot), d.shin);
    // Pied rigide : direction du pied (tangage puis orientation vers l'extérieur) et normale vers la semelle.
    const pitch = shin + 90 + (a[side + 'Ankle'] ?? 0), yaw = -e[side + 'FootOut'] * sgn;
    const foot = rotY(sag(pitch), yaw), sole = rotY(sag(pitch - 90), yaw);
    const toe = add(add(ankle, foot, d.footFwd), sole, d.ankleH * 0.55);
    const flat = norm([foot[0], 0, foot[2]]), heel = add(add(ankle, foot, -d.heelBack), sole, d.ankleH);
    Object.assign(j, {[side + 'Shoulder']: sh, [side + 'Elbow']: elbow, [side + 'Wrist']: wrist, [side + 'Hip']: hip,
      [side + 'Knee']: knee, [side + 'Ankle']: ankle, [side + 'Toe']: toe, [side + 'Heel']: heel, [side + 'FootDir']: flat});
  }
  // Rotation de tout le corps autour de l'axe vertical du bassin (voltes, techniques retournées).
  if (e.face) for (const k in j) { const p = j[k]; if (k.endsWith('FootDir')) j[k] = rotY(p, e.face); else { const r = rotY([p[0] - pelvis[0], p[1], p[2] - pelvis[2]], e.face); j[k] = [pelvis[0] + r[0], r[1], pelvis[2] + r[2]]; } }
  // Appui : le point le plus bas du corps touche le sol (pieds en général ; mains, genoux, dos ou tête dans le travail au sol).
  const R = {head: d.head * 0.85, leadWrist: d.fist * 0.75, rearWrist: d.fist * 0.75, leadKnee: 0.035 * d.H, rearKnee: 0.035 * d.H, leadElbow: 0.027 * d.H, rearElbow: 0.027 * d.H, pelvis: 0.06 * d.H, chest: 0.07 * d.H};
  const low = Math.min(j.leadHeel[1], j.rearHeel[1], j.leadToe[1], j.rearToe[1], ...Object.entries(R).map(([k, r]) => j[k][1] - r));
  const dy = -low + (pose.lift ?? 0) * d.unit;
  for (const k in j) if (!k.endsWith('FootDir')) j[k] = [j[k][0], j[k][1] + dy, j[k][2]];
  return j;
}
function norm(v) { const l = Math.hypot(...v) || 1; return v.map(x => x / l); }

// ——— Appuis ———
// Inclinaison (degrés ; 90 = horizontal vers l'avant) d'un pied posé à plat : talon et avant-pied touchent le sol ensemble.
export const FOOT_FLAT = Math.atan((FRACTIONS.heelBack + FRACTIONS.footFwd) / (0.45 * FRACTIONS.ankleH)) * 180 / Math.PI;
const DEG = 180 / Math.PI;
// Point du monde → repère du corps (avant la rotation « face » autour du bassin et avant la mise au sol).
const toBody = (pose, dims, face, w, pelvisY) => {
  const P = [(pose.x ?? 0) * dims.unit, 0, (pose.z ?? 0) * dims.unit], r = rotY([w[0] - P[0], w[1] - pelvisY, w[2] - P[2]], -face);
  return [P[0] + r[0], r[1], P[2] + r[2]];
};

// Jambe dirigée : hanche, genou, cheville et écartement pour amener un point du pied (`at` : 'Heel' talon, 'Toe' avant-pied,
// 'Ankle' cheville) au point `target` du monde, le bassin étant à la hauteur `pelvisY`. Le pied garde son inclinaison (ou prend
// `pitch`) et son ouverture ; le genou reste plié du côté où il l'était. Hors de portée (jambe trop courte), le talon se lève
// et l'avant-pied reste au sol, comme dans la réalité. Modifie `pose` et `extras` (écartement).
export function reachFoot(pose, extras, side, target, pelvisY, dims = bodyDims(), {at = 'Ankle', pitch} = {}) {
  const a = pose.angles, sgn = side === 'lead' ? 1 : -1, face = extras.face ?? 0, j = joints3d(pose, dims, extras), reach = dims.thigh + dims.shin - 0.002;
  const hip = toBody(pose, dims, face, j[side + 'Hip'], j.pelvis[1]), yaw = -(extras[side + 'FootOut'] ?? 0) * sgn;
  let pt = pitch ?? a[side + 'Hip'] - a[side + 'Knee'] + (a[side + 'Ankle'] ?? 0) + 90, t = toBody(pose, dims, face, target, pelvisY), D;
  const frame = () => {
    const foot = rotY(sag(pt), yaw), sole = rotY(sag(pt - 90), yaw);
    const off = at === 'Toe' ? add(add([0, 0, 0], foot, dims.footFwd), sole, dims.ankleH * 0.55) : at === 'Heel' ? add(add([0, 0, 0], foot, -dims.heelBack), sole, dims.ankleH) : [0, 0, 0];
    D = rotY([t[0] - off[0] - hip[0], t[1] - off[1] - hip[1], t[2] - off[2] - hip[2]], (extras[side + 'LegRot'] ?? 0) * sgn);   // dans le plan tourné de la jambe
    return {foot, sole};
  };
  let {foot, sole} = frame();
  if (pitch === undefined && at !== 'Ankle' && Math.hypot(...D) > reach) {
    if (at === 'Heel') { t = add(add(t, foot, dims.heelBack + dims.footFwd), sole, -0.45 * dims.ankleH); at = 'Toe'; }   // le talon décolle : l'avant-pied tient
    frame();
    for (let n = 0; n < 30 && Math.hypot(...D) > reach && pt > 25; n++) { pt -= 2; frame(); }   // pas au-delà d’un pied presque vertical
  }
  // Écartement : déduit de la cible quand elle est nettement sous la hanche ; jambe presque horizontale (assis, allongé),
  // la direction de côté devient instable : on garde alors l'écartement de la pose.
  const below = -D[1] / (Math.hypot(...D) || 1), w = clamp((below - 0.2) / 0.3, 0, 1);
  if (w < 1) {   // jambe presque horizontale, pied devant (assis) : c'est l'orientation du genou qui vise le pied
    const rot0 = extras[side + 'LegRot'] ?? 0, Db = rotY(D, -rot0 * sgn);
    if (Db[0] > 0.1) { const rot = clamp(w * rot0 + (1 - w) * Math.atan2(Db[2], Db[0]) * DEG * sgn, -45, 90); extras[side + 'LegRot'] = rot; D = rotY(Db, rot * sgn); }
  }
  const ab = w * clamp(Math.atan2(sgn * D[2], -D[1]) * DEG, -45, 95) + (1 - w) * (extras[side + 'Abd'] ?? 0), bendSide = a[side + 'Knee'] < -20 ? -1 : 1;
  const {dir, at: k, bend} = twoBone(D[0], -D[1] * Math.cos(ab / DEG) + sgn * D[2] * Math.sin(ab / DEG), dims.thigh, dims.shin);
  a[side + 'Hip'] = near(dir + bendSide * k, a[side + 'Hip']); a[side + 'Knee'] = bendSide * bend; a[side + 'Ankle'] = pt - 90 - (a[side + 'Hip'] - a[side + 'Knee']);
  extras[side + 'Abd'] = ab;
  return pose;
}
// Bras dirigé : épaule, coude et écartement pour amener le poignet au point `target` du monde (mains posées au sol).
export function reachHand(pose, extras, side, target, pelvisY, dims = bodyDims()) {
  const a = pose.angles, sgn = side === 'lead' ? 1 : -1, face = extras.face ?? 0, j = joints3d(pose, dims, extras);
  const sh = toBody(pose, dims, face, j[side + 'Shoulder'], j.pelvis[1]), t = toBody(pose, dims, face, target, pelvisY), D = [t[0] - sh[0], t[1] - sh[1], t[2] - sh[2]];
  const ab = clamp(Math.atan2(sgn * D[2], -D[1]) * DEG, -30, 120), bendSide = a[side + 'Elbow'] < -20 ? -1 : 1;
  const {dir, at: k, bend} = twoBone(D[0], -D[1] * Math.cos(ab / DEG) + sgn * D[2] * Math.sin(ab / DEG), dims.upperArm, dims.forearm + dims.fist);
  a[side + 'Shoulder'] = near(dir - bendSide * k - a.torso, a[side + 'Shoulder']); a[side + 'Elbow'] = bendSide * bend;
  extras[side + 'ArmAbd'] = ab;
  return pose;
}

// Appuis pendant la lecture (sans cela, interpoler les angles fait glisser les pieds) :
// – pied posé aux deux bouts d'une transition, au même endroit : il reste immobile (talon posé aux deux bouts : le talon tient ;
//   sinon l'avant-pied tient, pivot du talon qui se lève ou se pose) ;
// – posé aux deux bouts, ailleurs : il fait un pas — il quitte le sol avant d'avancer et se pose à la verticale (arc de 4 à 12 cm
//   selon la longueur ; 0,5 cm s'il glisse exprès : `glisse` sur la clé d'arrivée) ;
// – posé à un seul bout (décollage, pose) : il suit le mouvement du corps, mais ne frôle pas le sol — il monte vite au
//   décollage et ne redescend qu'à la fin de la pose.
// Les mains posées aux deux bouts restent en place. Une séquence peut s'en passer : `pin: false` (version d'origine).
const PLANT = 0.02, SAME = 0.025;
function holdContacts(seq, i, s, pose, extras) {
  const A = seq.keys[i - 1].pose, B = seq.keys[i].pose, d = bodyDims(), jA = joints3d(A, d, extrasOf(seq, A)), jB = joints3d(B, d, extrasOf(seq, B));
  const y = jA.pelvis[1] + (jB.pelvis[1] - jA.pelvis[1]) * s, glide = seq.keys[i].glisse ?? [], smooth = s * s * (3 - 2 * s);
  const down = (j, side, k) => j[side + k][1] <= PLANT, floor = (j, side) => down(j, side, 'Heel') || down(j, side, 'Toe');
  let p = null;
  const reach = (side, target, at) => { p ??= JSON.parse(JSON.stringify(pose)); reachFoot(p, extras, side, target, y, d, {at}); };
  for (const side of ['lead', 'rear']) {
    const fa = floor(jA, side), fb = floor(jB, side);
    if (fa && fb) {
      const at = down(jA, side, 'Heel') && down(jB, side, 'Heel') ? 'Heel' : 'Toe', a = jA[side + at], b = jB[side + at];
      const dist = Math.hypot(b[0] - a[0], b[2] - a[2]), h = dist > SAME ? smooth : s;
      const lift = dist > SAME ? (glide.includes(side) ? 0.005 : Math.min(0.12, 0.03 + 0.08 * dist)) * Math.sin(Math.PI * s) : 0;
      reach(side, [a[0] + (b[0] - a[0]) * h, a[1] + (b[1] - a[1]) * s + lift, a[2] + (b[2] - a[2]) * h], at);
    } else if (fa || fb) {
      const at = down(fa ? jA : jB, side, 'Heel') ? 'Heel' : 'Toe', a = jA[side + at], b = jB[side + at], jp = joints3d(p ?? pose, d, extras);
      const fk = jp[side + at], fy = fk[1] - (jp.pelvis[1] - y), low = a[1] + (b[1] - a[1]) * (fa ? 1 - (1 - s) * (1 - s) : s * s);
      if (fy < low - 0.002) reach(side, [fk[0], low, fk[2]], at);
    }
    const hand = j => j[side + 'Wrist'][1] - d.fist * 0.75 <= PLANT, ha = hand(jA), hb = hand(jB);
    if (ha && hb) {
      const a = jA[side + 'Wrist'], b = jB[side + 'Wrist'];
      p ??= JSON.parse(JSON.stringify(pose)); reachHand(p, extras, side, [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s, a[2] + (b[2] - a[2]) * s], y, d);
    }
  }
  return p ?? pose;
}

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
  const {pose, phase} = samplePose(seq, u), {i, local} = segment(seq, u), A = seq.keys[i - 1], B = seq.keys[i];
  const passe = A.passe || B.passe, s = passe ? local : easing(B.ease)(local);
  const extras = passe ? Object.fromEntries(D3_KEYS.map(k => { const get = K => extrasOf(seq, K.pose)[k]; return [k, hermite(get(A), get(B), slope(seq, i - 1, get), slope(seq, i, get), B.ms, local)]; }))
    : lerpExtras(extrasOf(seq, A.pose), extrasOf(seq, B.pose), s);
  return {pose: seq.pin === false ? pose : holdContacts(seq, i, s, pose, extras), phase, extras};
}
