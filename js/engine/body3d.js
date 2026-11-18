// Corps 3D — squelette version 3 (nuit du 17 au 18/11/2026) : articulations en trois dimensions aux proportions du pratiquant,
// centre de masse estimé et zone d'appui. C'est de la cinématique : les positions découlent des angles (et, pour tenir les
// appuis, d'une cinématique inverse) ; aucune force, aucun couple, aucun centre de pression n'est calculé.
// Repère : x vers l'avant (la cible), y vers le haut, z vers le côté avant (pied avant à gauche en garde « gaucher devant »).
// Contrôles : angles du plan de profil du moteur 2D (skeleton.js) et réglages 3D (PRESETS, pose.d3). Parent, pivot, axes,
// posture neutre et limites de chaque articulation : docs/SQUELETTE_V3.md.
import {easing, segment, groupOf, groupTime, groupValue} from './skeleton.js';
import {twoBone, near, clamp} from './ik.js';

// Proportions segmentaires moyennes, en fraction de la taille (Drillis et Contini, reprises par Winter,
// Biomechanics and Motor Control of Human Movement, 4e éd., 2009, fig. 4.1). Approximation pour un adulte « moyen ».
export const FRACTIONS = {torso: 0.29, neck: 0.05, head: 0.075, shoulderSep: 0.2, hipSep: 0.1,
  upperArm: 0.186, forearm: 0.146, fist: 0.04, thigh: 0.245, shin: 0.246, ankleH: 0.039, footFwd: 0.12, heelBack: 0.032, footHalfW: 0.025};
// Pied en deux segments (fractions de la taille) : têtes des métatarsiens à 72 % de la longueur du pied depuis le talon
// (`ball` : distance cheville → avant-pied le long du pied), orteils au-delà (`toes`) ; semelle de l'avant-pied à 75 % de la
// hauteur de la cheville. Colonne : lombaires 36 %, thorax bas 32 %, thorax haut 32 % de la longueur du tronc.
export const FOOT = {ball: 0.72 * (0.032 + 0.12) - 0.032, toes: 0.28 * (0.032 + 0.12), ballSole: 0.75};
const SPINE = [0.36, 0.32, 0.32];

// Réglages 3D par style de garde (degrés). face : orientation de tout le corps (0 = vers la cible) ; turn : rotation du bassin
// (0 = de face, 90 = de profil) ; chestTurn : rotation des épaules par rapport au bassin (répartie sur la colonne).
// Ajouts du 17/11 : leadLegRot / rearLegRot (genou orienté comme le pied), lean (buste penché sur le côté).
// Ajouts de la version 3 (zéro par défaut : les poses existantes gardent leurs angles) : bascule (pelvisTilt, + vers l'avant)
// et inclinaison (pelvisList, + côté avant plus haut) du bassin ; rotation (headTurn) et inclinaison (headTilt) de la tête —
// headTurn 0 = regard vers l'avant du corps ; comme face, turn et chestTurn, une rotation positive tourne vers le côté arrière ; rotation de l'humérus (…ArmRot, + vers l'extérieur),
// pronation de l'avant-bras (…Pronation, 0 = pouce en haut, 90 = paume vers le bas), flexion du poignet (…WristFlex, + vers
// la paume), main ouverte (…HandOpen, 0 poing fermé, 1 main ouverte) ; inversion-éversion de l'arrière-pied (…FootRoll,
// + inversion) ; extension des orteils (…Toes ; à plat au sol automatiquement quand l'avant-pied porte).
const V3 = {pelvisTilt: 0, pelvisList: 0, headTurn: 0, headTilt: 0, leadArmRot: 0, rearArmRot: 0, leadPronation: 0, rearPronation: 0,
  leadWristFlex: 0, rearWristFlex: 0, leadHandOpen: 0, rearHandOpen: 0, leadFootRoll: 0, rearFootRoll: 0, leadToes: 0, rearToes: 0};
export const PRESETS = {
  boxe:    {face: 0, turn: 28, chestTurn: 6,  leadAbd: 4, rearAbd: 7, leadFootOut: 18, rearFootOut: 45, leadArmAbd: 8, rearArmAbd: 14, leadLegRot: 0, rearLegRot: 0, lean: 0, ...V3},
  escrime: {face: 0, turn: 68, chestTurn: 8,  leadAbd: 0, rearAbd: 2, leadFootOut: 0,  rearFootOut: 85, leadArmAbd: 4, rearArmAbd: 30, leadLegRot: 0, rearLegRot: 0, lean: 0, ...V3},
  karate:  {face: 0, turn: 30, chestTurn: 0,  leadAbd: 5, rearAbd: 8, leadFootOut: 8,  rearFootOut: 30, leadArmAbd: 6, rearArmAbd: 18, leadLegRot: 0, rearLegRot: 0, lean: 0, ...V3},
  carre:   {face: 0, turn: 12, chestTurn: 0,  leadAbd: 6, rearAbd: 8, leadFootOut: 15, rearFootOut: 30, leadArmAbd: 10, rearArmAbd: 12, leadLegRot: 0, rearLegRot: 0, lean: 0, ...V3}
};
export const D3_KEYS = Object.keys(PRESETS.boxe);
// Les bras suivent la ceinture scapulaire : ils tournent de ce dont les épaules s'écartent de leur orientation de repos dans la
// garde (turn + chestTurn du style). Au repos, rien ne change pour les poses existantes.
const ARM_REST = Object.fromEntries(Object.entries(PRESETS).map(([k, p]) => [k, p.turn + p.chestTurn]));

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

const DEG = 180 / Math.PI, R = a => a / DEG;
const rotX = ([x, y, z], a) => { const c = Math.cos(R(a)), s = Math.sin(R(a)); return [x, y * c - z * s, y * s + z * c]; };
const rotY = ([x, y, z], a) => { const c = Math.cos(R(a)), s = Math.sin(R(a)); return [x * c + z * s, y, -x * s + z * c]; };
const sag = a => [Math.sin(R(a)), -Math.cos(R(a)), 0];      // 0 = vers le bas, 90 = vers l'avant, 180 = vers le haut
const add = (p, v, l = 1) => [p[0] + v[0] * l, p[1] + v[1] * l, p[2] + v[2] * l];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
function norm(v) { const l = Math.hypot(...v) || 1; return v.map(x => x / l); }
// Rotation d'un vecteur autour d'un axe unitaire (formule de Rodrigues), en degrés.
const turnAround = (v, k, deg) => { const t = R(deg), c = Math.cos(t), s = Math.sin(t), x = cross(k, v), kd = dot(k, v) * (1 - c);
  return [v[0] * c + x[0] * s + k[0] * kd, v[1] * c + x[1] * s + k[1] * kd, v[2] * c + x[2] * s + k[2] * kd]; };
// Direction d'un membre : angle du plan de profil, puis écartement vers l'extérieur (côté avant : +z).
const limb = (a, abd, sgn) => rotX(sag(a), -abd * sgn);

export const extrasOf = (seq, pose) => ({...PRESETS[seq?.style] ?? PRESETS.boxe, armRest: ARM_REST[seq?.style] ?? ARM_REST.boxe, ...pose?.d3});

// Pied : avant (F), direction de la semelle (S), extérieur (L), après inversion-éversion de l'arrière-pied (rotation autour de F).
export function footFrame(pitch, yaw, sgn, roll = 0) {
  let F = rotY(sag(pitch), yaw), S = rotY(sag(pitch - 90), yaw), L = cross(S, F).map(v => v * sgn);
  if (roll) { S = turnAround(S, F, sgn * roll); L = turnAround(L, F, sgn * roll); }
  return {F, S, L};
}
// Repères d'appui à partir de la cheville : talon, centre de l'avant-pied (« Toe » : pivot), têtes du 1er (médial) et du 5e
// (latéral) métatarsien.
export function footPoints(ankle, {F, S, L}, d) {
  const ball = add(add(ankle, F, FOOT.ball * d.H), S, d.ankleH * FOOT.ballSole);
  return {heel: add(add(ankle, F, -d.heelBack), S, d.ankleH), ball, mtp1: add(add(ball, L, -d.footHalfW), F, 0.006 * d.H), mtp5: add(add(ball, L, d.footHalfW), F, -0.012 * d.H)};
}
// Inclinaison (degrés ; 90 = horizontal vers l'avant) d'un pied posé à plat : talon et avant-pied à la même hauteur.
export const FOOT_FLAT = Math.atan((FRACTIONS.heelBack + FOOT.ball) / ((1 - FOOT.ballSole) * FRACTIONS.ankleH)) * DEG;

// Articulations en mètres, posées au sol (le point d'appui le plus bas à y = 0, sauf « lift »). Le résultat porte aussi, non
// énumérables, les repères d'orientation (`frames` : tête, mains, pieds, segments de la colonne) utiles au dessin.
export function joints3d(pose, dims = bodyDims(), extras = PRESETS.boxe) {
  const a = pose.angles, d = dims, e = {...PRESETS.boxe, ...extras}, H = d.H, T = d.torso;
  const pelvis = [(pose.x ?? 0) * d.unit, 0, (pose.z ?? 0) * d.unit], j = {pelvis}, fr = {};
  // Colonne en trois segments : la corde bassin → base du cou garde l'inclinaison `torso` ; la bascule du bassin courbe les
  // lombaires ; l'inclinaison latérale croît vers le haut ; la rotation des épaules se répartit (lombaires 15 %, thorax bas 40 %).
  const tilt = e.pelvisTilt ?? 0, lean = e.lean ?? 0, psi = [e.turn + 0.15 * e.chestTurn, e.turn + 0.55 * e.chestTurn, e.turn + e.chestTurn];
  const theta = [a.torso + 0.6 * tilt, a.torso, a.torso - 0.6 * tilt], phi = [0.6 * lean, lean, 1.4 * lean];
  const ups = theta.map((t, i) => rotX(sag(180 - t), phi[i]));
  j.spineLow = add(pelvis, ups[0], SPINE[0] * T); j.spineMid = add(j.spineLow, ups[1], SPINE[1] * T); j.neckBase = add(j.spineMid, ups[2], SPINE[2] * T);
  j.chest = add(j.spineMid, ups[2], 0.4 * SPINE[2] * T);
  fr.spine = ups.map((up, i) => ({up, yaw: psi[i]}));
  fr.pelvis = {yaw: e.turn, tilt, list: e.pelvisList ?? 0, up: ups[0]};
  // Tête : flexion (`neck`) dans le plan du buste ; regard vers l'avant du corps tourné de headTurn (inclinaison : headTilt).
  const headUp = rotX(sag(180 - a.torso - (a.neck ?? 0)), phi[2]);
  j.head = add(j.neckBase, headUp, d.neck + d.head);
  const gaze = rotY([1, 0, 0], e.headTurn ?? 0);
  fr.head = {up: headUp, fwd: norm(sub(gaze, headUp.map(v => v * dot(gaze, headUp)))), tilt: e.headTilt ?? 0};
  // Ceinture scapulaire : axe des épaules tourné de psi[2], incliné avec le thorax haut ; avant du thorax pour la protraction.
  const shAxis = rotX(rotY([0, 0, 1], psi[2]), phi[2]), shoulderLine = add(j.neckBase, ups[2], -0.07 * T);
  const chestFwd = norm(sub(rotY([1, 0, 0], psi[2]), ups[2].map(v => v * dot(rotY([1, 0, 0], psi[2]), ups[2]))));
  const armYaw = e.armRest === undefined ? 0 : psi[2] - e.armRest;
  // Bassin : rotation `turn`, inclinaison latérale (le côté avant monte si pelvisList > 0) autour de l'axe avant du bassin.
  const hipAxis = turnAround(rotY([0, 0, 1], e.turn), rotY([1, 0, 0], e.turn), -(e.pelvisList ?? 0));
  for (const [side, sgn] of [['lead', 1], ['rear', -1]]) {
    // Bras : direction de profil + écartement (comme avant), tournés avec la ceinture scapulaire ; rotation de l'humérus.
    const armAbd = e[side + 'ArmAbd'], upper = a.torso + a[side + 'Shoulder'];
    const U = rotY(limb(upper, armAbd, sgn), armYaw), rotH = (e[side + 'ArmRot'] ?? 0) * sgn;
    const F = turnAround(rotY(limb(upper + a[side + 'Elbow'], armAbd, sgn), armYaw), U, rotH);
    // Épaule : l'omoplate monte quand le bras s'élève au-delà de 30° (jusqu'à 2,2 % de la taille) et avance avec lui
    // (protraction, jusqu'à 1,8 % ; recul quand le bras part en arrière) — approximation documentée du rythme scapulo-huméral.
    const elev = Math.acos(clamp(-dot(U, ups[2]), -1, 1)) * DEG, reachFwd = dot(U, chestFwd);
    const sh = add(add(add(shoulderLine, shAxis, sgn * d.shoulderSep / 2), ups[2], 0.022 * H * clamp((elev - 30) / 120, 0, 1)), chestFwd, 0.018 * H * clamp(reachFwd, -0.6, 1));
    const elbow = add(sh, U, d.upperArm), carpus = add(elbow, F, d.forearm);
    // Main : repère médial du plan du bras, puis pronation autour de l'avant-bras et flexion du poignet vers la paume.
    const medial = turnAround(rotY(rotX([0, 0, 1], -armAbd * sgn), armYaw).map(v => v * -sgn), U, rotH);
    let palm = norm(sub(medial, F.map(v => v * dot(medial, F))));
    palm = turnAround(palm, F, -sgn * (e[side + 'Pronation'] ?? 0));
    const flexAxis = cross(F, palm), flex = e[side + 'WristFlex'] ?? 0, hand = flex ? turnAround(F, flexAxis, flex) : F;
    if (flex) palm = turnAround(palm, flexAxis, flex);
    fr[side + 'Hand'] = {fwd: hand, palm, open: clamp(e[side + 'HandOpen'] ?? 0, 0, 1)};
    // Jambe : hanche au bord du bassin (incliné), plan de la jambe écarté (Abd) et tourné (LegRot), genou en charnière.
    const hip = add(pelvis, hipAxis, sgn * d.hipSep / 2), abd = e[side + 'Abd'], rot = -(e[side + 'LegRot'] ?? 0) * sgn;
    const thigh = a[side + 'Hip'], knee = add(hip, rotY(limb(thigh, abd, sgn), rot), d.thigh);
    const shin = thigh - a[side + 'Knee'], ankle = add(knee, rotY(limb(shin, abd, sgn), rot), d.shin);
    const ff = footFrame(shin + 90 + (a[side + 'Ankle'] ?? 0), -e[side + 'FootOut'] * sgn, sgn, e[side + 'FootRoll'] ?? 0), fp = footPoints(ankle, ff, d);
    fr[side + 'Foot'] = {...ff, toes: e[side + 'Toes'] ?? 0};
    Object.assign(j, {[side + 'Shoulder']: sh, [side + 'Elbow']: elbow, [side + 'Carpus']: carpus, [side + 'Wrist']: add(carpus, hand, d.fist), [side + 'Hip']: hip,
      [side + 'Knee']: knee, [side + 'Ankle']: ankle, [side + 'Heel']: fp.heel, [side + 'Toe']: fp.ball, [side + 'Mtp1']: fp.mtp1, [side + 'Mtp5']: fp.mtp5,
      [side + 'FootDir']: norm([ff.F[0], 0, ff.F[2]])});
  }
  // Racine : rotation de tout le corps autour de l'axe vertical du bassin (voltes, techniques retournées).
  const vecs = ['head', 'leadHand', 'rearHand', 'leadFoot', 'rearFoot'];
  if (e.face) {
    for (const k in j) { const p = j[k]; if (k.endsWith('FootDir')) j[k] = rotY(p, e.face); else { const r = rotY([p[0] - pelvis[0], p[1], p[2] - pelvis[2]], e.face); j[k] = [pelvis[0] + r[0], r[1], pelvis[2] + r[2]]; } }
    for (const k of vecs) for (const v of Object.keys(fr[k])) if (Array.isArray(fr[k][v])) fr[k][v] = rotY(fr[k][v], e.face);
    fr.spine.forEach(s => { s.up = rotY(s.up, e.face); s.yaw += e.face; }); fr.pelvis.up = rotY(fr.pelvis.up, e.face); fr.pelvis.yaw += e.face;
  }
  // Appui : le point le plus bas du corps touche le sol (talons et têtes des métatarsiens en général ; mains, genoux, dos, tête au sol).
  const RAD = {head: d.head * 0.85, leadWrist: d.fist * 0.75, rearWrist: d.fist * 0.75, leadKnee: 0.035 * H, rearKnee: 0.035 * H, leadElbow: 0.027 * H, rearElbow: 0.027 * H, pelvis: 0.06 * H, chest: 0.07 * H};
  const low = Math.min(...['lead', 'rear'].flatMap(s => [j[s + 'Heel'][1], j[s + 'Mtp1'][1], j[s + 'Mtp5'][1]]), ...Object.entries(RAD).map(([k, r]) => j[k][1] - r));
  const dy = -low + (pose.lift ?? 0) * d.unit;
  for (const k in j) if (!k.endsWith('FootDir')) j[k] = [j[k][0], j[k][1] + dy, j[k][2]];
  // Orteils : articulés aux têtes des métatarsiens. Quand l'avant-pied porte (moins de 3 cm du sol), ils restent à plat au sol
  // (talon levé : l'articulation métatarso-phalangienne s'étend, jusqu'à 75°) ; en l'air, ils gardent l'extension demandée.
  for (const [side, sgn] of [['lead', 1], ['rear', -1]]) {
    const {F, L, toes} = fr[side + 'Foot'], axis = L.map(v => v * sgn), up = cross(axis, F);
    const flat = clamp(Math.atan2(-F[1], up[1]) * DEG, 0, 75), ext = j[side + 'Toe'][1] < 0.03 ? Math.max(toes, flat) : toes, T2 = turnAround(F, axis, ext);
    const hallux = add(j[side + 'Mtp1'], T2, FOOT.toes * H), lesser = add(add(j[side + 'Mtp5'], sub(j[side + 'Mtp1'], j[side + 'Mtp5']), 0.35), T2, 0.8 * FOOT.toes * H);
    j[side + 'Hallux'] = [hallux[0], Math.max(0, hallux[1]), hallux[2]]; j[side + 'Toes'] = [lesser[0], Math.max(0, lesser[1]), lesser[2]];
    fr[side + 'Foot'].toeDir = T2; fr[side + 'Foot'].ext = ext;
  }
  Object.defineProperty(j, 'frames', {value: fr, enumerable: false});
  return j;
}

// ——— Appuis ———
// Point du monde → repère du corps (avant la rotation « face » autour du bassin et avant la mise au sol).
const toBody = (pose, dims, face, w, pelvisY) => {
  const P = [(pose.x ?? 0) * dims.unit, 0, (pose.z ?? 0) * dims.unit], r = rotY([w[0] - P[0], w[1] - pelvisY, w[2] - P[2]], -face);
  return [P[0] + r[0], r[1], P[2] + r[2]];
};
// Décalage d'un repère du pied par rapport à la cheville (repère du corps).
const footOffset = (at, frame, d) => at === 'Ankle' ? [0, 0, 0] : sub(footPoints([0, 0, 0], frame, d)[at === 'Toe' ? 'ball' : 'heel'], [0, 0, 0]);

// Jambe dirigée : hanche, genou, cheville et écartement pour amener un repère du pied (`at` : 'Heel' talon, 'Toe' avant-pied,
// 'Ankle' cheville) au point `target` du monde, le bassin étant à la hauteur `pelvisY`. Le pied garde son inclinaison (ou prend
// `pitch`) et son orientation ; le genou reste plié du côté où il l'était. Hors de portée (jambe trop courte), le talon se lève
// et l'avant-pied reste au sol, comme dans la réalité. Les segments gardent leur longueur. Modifie `pose` et `extras`.
export function reachFoot(pose, extras, side, target, pelvisY, dims = bodyDims(), {at = 'Ankle', pitch} = {}) {
  const a = pose.angles, sgn = side === 'lead' ? 1 : -1, face = extras.face ?? 0, j = joints3d(pose, dims, extras), reach = dims.thigh + dims.shin - 0.002;
  const hip = toBody(pose, dims, face, j[side + 'Hip'], j.pelvis[1]), yaw = -(extras[side + 'FootOut'] ?? 0) * sgn, roll = extras[side + 'FootRoll'] ?? 0;
  let pt = pitch ?? a[side + 'Hip'] - a[side + 'Knee'] + (a[side + 'Ankle'] ?? 0) + 90, t = toBody(pose, dims, face, target, pelvisY), D, frame;
  const solveD = () => { frame = footFrame(pt, yaw, sgn, roll); const off = footOffset(at, frame, dims);
    D = rotY([t[0] - off[0] - hip[0], t[1] - off[1] - hip[1], t[2] - off[2] - hip[2]], (extras[side + 'LegRot'] ?? 0) * sgn); };   // dans le plan tourné de la jambe
  solveD();
  // Talon déjà levé demandé mais avant-pied hors de portée : le talon se lève davantage (l'inclinaison n'est qu'une préférence) ;
  // un pied demandé à plat reste à plat.
  if (at !== 'Ankle' && Math.hypot(...D) > reach && (pitch === undefined || (at === 'Toe' && pitch < FOOT_FLAT - 0.5))) {
    if (at === 'Heel') { t = add(t, sub(footOffset('Toe', frame, dims), footOffset('Heel', frame, dims))); at = 'Toe'; solveD(); }   // le talon décolle : l'avant-pied tient
    for (let n = 0; n < 30 && Math.hypot(...D) > reach && pt > 25; n++) { pt -= 2; solveD(); }   // pas au-delà d'un pied presque vertical
  }
  // Écartement : déduit de la cible quand elle est nettement sous la hanche ; jambe presque horizontale (assis, allongé),
  // la direction de côté devient instable : on garde alors l'écartement de la pose.
  const below = -D[1] / (Math.hypot(...D) || 1), w = clamp((below - 0.2) / 0.3, 0, 1);
  if (w < 1) {   // jambe presque horizontale, pied devant (assis) : c'est l'orientation du genou qui vise le pied
    const rot0 = extras[side + 'LegRot'] ?? 0, Db = rotY(D, -rot0 * sgn);
    if (Db[0] > 0.1) { const rot = clamp(w * rot0 + (1 - w) * Math.atan2(Db[2], Db[0]) * DEG * sgn, -45, 90); extras[side + 'LegRot'] = rot; D = rotY(Db, rot * sgn); }
  }
  const ab = w * clamp(Math.atan2(sgn * D[2], -D[1]) * DEG, -45, 95) + (1 - w) * (extras[side + 'Abd'] ?? 0), bendSide = a[side + 'Knee'] < -20 ? -1 : 1;
  const {dir, at: k, bend} = twoBone(D[0], -D[1] * Math.cos(R(ab)) + sgn * D[2] * Math.sin(R(ab)), dims.thigh, dims.shin);
  a[side + 'Hip'] = near(dir + bendSide * k, a[side + 'Hip']); a[side + 'Knee'] = bendSide * bend; a[side + 'Ankle'] = pt - 90 - (a[side + 'Hip'] - a[side + 'Knee']);
  extras[side + 'Abd'] = ab;
  return pose;
}
// Bras dirigé : épaule, coude et écartement pour amener le centre du poing au point `target` du monde (mains posées au sol).
// L'épaule bouge avec le bras (omoplate) : trois passes suffisent à converger.
export function reachHand(pose, extras, side, target, pelvisY, dims = bodyDims()) {
  const a = pose.angles, sgn = side === 'lead' ? 1 : -1, face = extras.face ?? 0, armYaw = extras.armRest === undefined ? 0 : extras.turn + extras.chestTurn - extras.armRest;
  for (let n = 0; n < 3; n++) {
    const j = joints3d(pose, dims, extras), sh = toBody(pose, dims, face, j[side + 'Shoulder'], j.pelvis[1]), t = toBody(pose, dims, face, target, pelvisY);
    const D = rotY(sub(t, sh), -armYaw), ab = clamp(Math.atan2(sgn * D[2], -D[1]) * DEG, -30, 120), bendSide = a[side + 'Elbow'] < -20 ? -1 : 1;
    const {dir, at: k, bend} = twoBone(D[0], -D[1] * Math.cos(R(ab)) + sgn * D[2] * Math.sin(R(ab)), dims.upperArm, dims.forearm + dims.fist);
    a[side + 'Shoulder'] = near(dir - bendSide * k - a.torso, a[side + 'Shoulder']); a[side + 'Elbow'] = bendSide * bend;
    extras[side + 'ArmAbd'] = ab;
  }
  return pose;
}

// Appuis pendant la lecture (sans cela, interpoler les angles fait glisser les pieds) :
// – pied posé aux deux bouts d'une transition, au même endroit : il reste immobile (talon posé aux deux bouts : le talon tient ;
//   sinon l'avant-pied tient — pivot : le talon se lève ou se pose en tournant autour de lui) ;
// – posé aux deux bouts, ailleurs : il fait un pas — il quitte le sol avant d'avancer et se pose à la verticale (arc de 4 à 12 cm
//   selon la longueur ; 0,5 cm s'il glisse exprès : `glisse` sur la clé d'arrivée) ;
// – posé à un seul bout (décollage, pose) : il suit le mouvement du corps, mais ne frôle pas le sol — il monte vite au
//   décollage et ne redescend qu'à la fin de la pose, sans vitesse au moment de quitter le sol ni de s'y poser (sans à-coup) ;
//   près du sol, il part et arrive à la verticale.
// Les mains posées aux deux bouts restent en place. Une séquence peut s'en passer : `pin: false` (version d'origine).
const PLANT = 0.02, SAME = 0.025;
function holdContacts(seq, i, s, sp, pose, extras) {
  const A = seq.keys[i - 1].pose, B = seq.keys[i].pose, d = bodyDims(), jA = joints3d(A, d, extrasOf(seq, A)), jB = joints3d(B, d, extrasOf(seq, B));
  const y = jA.pelvis[1] + (jB.pelvis[1] - jA.pelvis[1]) * sp, glide = seq.keys[i].glisse ?? [], smooth = s * s * (3 - 2 * s);
  const h = (j, side, k) => k === 'Toe' ? Math.min(j[side + 'Toe'][1], j[side + 'Mtp1'][1], j[side + 'Mtp5'][1]) : j[side + k][1];   // avant-pied : son point le plus bas
  const down = (j, side, k) => h(j, side, k) <= PLANT, floor = (j, side) => down(j, side, 'Heel') || down(j, side, 'Toe');
  let p = null;
  const reach = (side, target, at) => { p ??= JSON.parse(JSON.stringify(pose)); reachFoot(p, extras, side, target, y, d, {at}); };
  for (const side of ['lead', 'rear']) {
    const fa = floor(jA, side), fb = floor(jB, side);
    if (fa && fb) {
      const at = down(jA, side, 'Heel') && down(jB, side, 'Heel') ? 'Heel' : 'Toe', a = jA[side + at], b = jB[side + at];
      // Pas : le pied monte avant d'avancer et finit d'avancer avant de se poser (déplacement entre 20 et 80 % du temps pour un
      // pas de 30 cm au plus, presque tout le temps pour un grand bond).
      const dist = Math.hypot(b[0] - a[0], b[2] - a[2]), m = clamp(0.2 - (dist - 0.3) * 0.5, 0.05, 0.2), u = clamp((s - m) / (1 - 2 * m), 0, 1);   // marge réduite pour un grand bond
      const h = dist <= SAME ? s : glide.includes(side) ? smooth : u * u * (3 - 2 * u);
      const lift = dist > SAME ? (glide.includes(side) ? 0.005 : Math.min(0.12, 0.03 + 0.08 * dist)) * Math.sin(Math.PI * s) : 0;
      reach(side, [a[0] + (b[0] - a[0]) * h, a[1] + (b[1] - a[1]) * s + lift, a[2] + (b[2] - a[2]) * h], at);
    } else if (fa || fb) {
      const at = down(fa ? jA : jB, side, 'Heel') ? 'Heel' : 'Toe', a = jA[side + at], b = jB[side + at], jp = joints3d(p ?? pose, d, extras);
      const q = s * s * (3 - 2 * s), fk = jp[side + at], fy = fk[1] - (jp.pelvis[1] - y), low = a[1] + (b[1] - a[1]) * (fa ? 1 - (1 - q) * (1 - q) : q * q);
      // Près du sol, le pied part et arrive à la verticale : tenu sur place au début d'un décollage, amené au-dessus de son point
      // de pose avant la fin d'une pose — il ne glisse ni en partant ni en arrivant.
      const k = fa ? 1 - clamp((s - 0.1) / 0.3, 0, 1) : clamp((s - 0.6) / 0.3, 0, 1), w = k * k * (3 - 2 * k), g = fa ? a : b;
      // Tout le pied (talon, têtes des métatarsiens) reste au-dessus de ce plancher, pas seulement le point tenu.
      const foot = Math.min(...['Heel', 'Toe', 'Mtp1', 'Mtp5'].map(k => jp[side + k][1])) - (jp.pelvis[1] - y), up = Math.max(0, low - foot, low - fy);
      if (up > 0.002 || w > 0.001) reach(side, [fk[0] + (g[0] - fk[0]) * w, fy + up, fk[2] + (g[2] - fk[2]) * w], at);
    }
    const hand = j => j[side + 'Wrist'][1] - d.fist * 0.75 <= PLANT, ha = hand(jA), hb = hand(jB);
    if (ha && hb) {
      const a = jA[side + 'Wrist'], b = jB[side + 'Wrist'];
      p ??= JSON.parse(JSON.stringify(pose)); reachHand(p, extras, side, [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s, a[2] + (b[2] - a[2]) * s], y, d);
    }
  }
  return p ?? pose;
}

// Centre de masse estimé : fractions de masse et position du centre de chaque segment le long du segment, d'après Dempster
// repris par Winter (2009, tableau 4.1) ; tronc partagé en bassin (14,2 %), abdomen (13,9 %) et thorax (21,6 %).
export const SEGMENT_MASS_3D = [['neckBase', 'head', 0.081, 1], ['spineMid', 'neckBase', 0.216, 0.5], ['spineLow', 'spineMid', 0.139, 0.5], ['pelvis', 'spineLow', 0.142, 0.3],
  ...['lead', 'rear'].flatMap(s => [[s + 'Shoulder', s + 'Elbow', 0.028, 0.436], [s + 'Elbow', s + 'Carpus', 0.016, 0.43], [s + 'Carpus', s + 'Wrist', 0.006, 0.5],
    [s + 'Hip', s + 'Knee', 0.1, 0.433], [s + 'Knee', s + 'Ankle', 0.0465, 0.433], [s + 'Heel', s + 'Toe', 0.0145, 0.5]])];
export function centerOfMass3d(j) {
  const c = [0, 0, 0]; let m = 0;
  for (const [a, b, w, r] of SEGMENT_MASS_3D) { for (let i = 0; i < 3; i++) c[i] += w * (j[a][i] + (j[b][i] - j[a][i]) * r); m += w; }
  return c.map(x => x / m);
}

// Zone d'appui au sol (plan x-z) : enveloppe convexe des repères posés — bords du talon, têtes des métatarsiens, gros orteil,
// autres orteils — et, au sol, mains et genoux (tolérance en mètres).
export function supportPolygon(j, dims = bodyDims(), tol = 0.04) {
  const pts = [];
  for (const s of ['lead', 'rear']) {
    const f = j[s + 'FootDir'], side = [-f[2], 0, f[0]], w = dims.footHalfW;
    if (j[s + 'Heel'][1] <= tol) pts.push(add(j[s + 'Heel'], side, w * 0.7), add(j[s + 'Heel'], side, -w * 0.7));
    for (const k of ['Mtp1', 'Mtp5', 'Hallux', 'Toes']) if (j[s + k][1] <= tol) pts.push(j[s + k]);
  }
  for (const k of ['leadWrist', 'rearWrist', 'leadKnee', 'rearKnee']) if (j[k][1] <= tol + 0.04 * dims.H) pts.push(j[k]);
  return hull(pts.map(p => [p[0], p[2]]));
}
function hull(P) {
  if (P.length < 3) return P;
  const p = [...P].sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], hi = [];
  for (const q of p) { while (lo.length > 1 && cr(lo.at(-2), lo.at(-1), q) <= 0) lo.pop(); lo.push(q); }
  for (const q of [...p].reverse()) { while (hi.length > 1 && cr(hi.at(-2), hi.at(-1), q) <= 0) hi.pop(); hi.push(q); }
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
  const o = {armRest: e1.armRest};
  for (const k of D3_KEYS) o[k] = e1[k] + (e2[k] - e1[k]) * t;
  return o;
}

// Pivot : la clé d'arrivée peut nommer le pied autour duquel tout le corps tourne (`pivot: 'lead'` ou 'rear'). Le bassin suit
// alors un arc autour de l'avant-pied de ce pied au lieu d'une ligne droite entre les deux clés : sa position vue depuis
// l'avant-pied est interpolée dans le repère du corps, puis tournée avec lui (même progression que `face`). Le corps tourne
// sur l'appui, il ne glisse pas ; le pied lui-même est tenu par holdContacts.
function orbit(seq, i, pose, extras) {
  const A = seq.keys[i - 1].pose, B = seq.keys[i].pose, side = seq.keys[i].pivot, d = bodyDims(), eA = extrasOf(seq, A), eB = extrasOf(seq, B);
  const fA = eA.face ?? 0, fB = eB.face ?? 0;
  if (Math.abs(fB - fA) < 0.5 || (side !== 'lead' && side !== 'rear')) return;
  const jA = joints3d(A, d, eA), jB = joints3d(B, d, eB), P = [0, 2].map(k => (jA[side + 'Toe'][k] + jB[side + 'Toe'][k]) / 2);
  const off = (p, face) => rotY([(p.x ?? 0) * d.unit - P[0], 0, (p.z ?? 0) * d.unit - P[1]], -face);
  const oA = off(A, fA), oB = off(B, fB), f = (extras.face - fA) / (fB - fA), o = rotY([oA[0] + (oB[0] - oA[0]) * f, 0, oA[2] + (oB[2] - oA[2]) * f], extras.face);
  pose.x = (P[0] + o[0]) / d.unit; pose.z = (P[1] + o[2]) / d.unit;
}

// Pose et réglages 3D à la position u ∈ [0, 1] d'une séquence (même lissage que le moteur 2D ; décalages par groupe : `timing`).
export function sample3d(seq, u, samplePose) {
  const {pose, phase} = samplePose(seq, u), {i, local} = segment(seq, u), A = seq.keys[i - 1], B = seq.keys[i], eA = extrasOf(seq, A.pose), eB = extrasOf(seq, B.pose);
  const passe = A.passe || B.passe, ease = easing(B.ease);
  const at = k => groupValue(seq, i, local, groupOf(k), K => K === A ? eA[k] : K === B ? eB[k] : extrasOf(seq, K.pose)[k]);
  const extras = {armRest: eA.armRest};
  for (const k of D3_KEYS) extras[k] = at(k);
  const legs = groupTime(B, 'jambes', local), hips = groupTime(B, 'bassin', local);
  if (B.pivot && seq.pin !== false) orbit(seq, i, pose, extras);
  return {pose: seq.pin === false ? pose : holdContacts(seq, i, passe ? legs : ease(legs), passe ? hips : ease(hips), pose, extras), phase, extras};
}
