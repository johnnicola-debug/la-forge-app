// Squelette articulé 2D vu de profil (le pratiquant regarde vers la droite).
// Cinématique directe à partir du bassin. Aucun calcul de force, d'angle « sûr »
// ni de contrainte anatomique : les poses sont des illustrations.

export const SEGMENTS = {torso: 72, neck: 12, head: 16, upperArm: 42, forearm: 40, thigh: 64, shin: 60, foot: 22};

// Angles en degrés. Pour un segment, 0 = vers le bas, 90 = vers l'avant, 180 = vers le haut.
export const ANGLE_KEYS = ['torso', 'neck', 'leadShoulder', 'leadElbow', 'rearShoulder', 'rearElbow',
  'leadHip', 'leadKnee', 'leadAnkle', 'rearHip', 'rearKnee', 'rearAnkle'];

export const JOINT_NAMES = ['pelvis', 'chest', 'neckBase', 'head',
  'leadShoulder', 'leadElbow', 'leadWrist', 'rearShoulder', 'rearElbow', 'rearWrist',
  'leadHip', 'leadKnee', 'leadAnkle', 'leadToe', 'rearHip', 'rearKnee', 'rearAnkle', 'rearToe'];

export const JOINT_LABELS = {head: 'Tête', pelvis: 'Bassin', chest: 'Poitrine', leadWrist: 'Poing avant',
  rearWrist: 'Poing arrière', leadAnkle: 'Cheville avant', rearAnkle: 'Cheville arrière',
  leadKnee: 'Genou avant', rearKnee: 'Genou arrière', leadToe: 'Pied avant', rearToe: 'Pied arrière'};

const rad = d => d * Math.PI / 180;
const dir = a => [Math.sin(rad(a)), Math.cos(rad(a))];
const add = (p, a, len) => { const [dx, dy] = dir(a); return [p[0] + dx * len, p[1] + dy * len]; };

// Calcule la position des articulations. Le personnage est posé sur `ground`
// (le point le plus bas des pieds touche le sol), sauf si `airborne` est fourni.
export function computeJoints(pose, ground = 280) {
  const a = pose.angles, L = SEGMENTS;
  const pelvis = [pose.x ?? 0, 0];
  const torsoUp = 180 - a.torso; // inclinaison avant positive
  const chest = add(pelvis, torsoUp, L.torso);
  const neckBase = add(pelvis, torsoUp, L.torso + 4);
  const head = add(neckBase, torsoUp - (a.neck ?? 0), L.neck + L.head);
  const shoulderAt = side => add(chest, torsoUp, -6).map((v, i) => i === 0 ? v + (side === 'lead' ? 5 : -5) : v);
  const hipAt = side => [pelvis[0] + (side === 'lead' ? 6 : -6), pelvis[1]];
  const j = {pelvis, chest, neckBase, head};
  for (const side of ['lead', 'rear']) {
    const sh = shoulderAt(side);
    const upper = a.torso + a[side + 'Shoulder'];
    const elbow = add(sh, upper, L.upperArm);
    const wrist = add(elbow, upper + a[side + 'Elbow'], L.forearm);
    const hip = hipAt(side);
    const thigh = a[side + 'Hip'];
    const knee = add(hip, thigh, L.thigh);
    const shin = thigh - a[side + 'Knee'];
    const ankle = add(knee, shin, L.shin);
    const toe = add(ankle, shin + 90 + (a[side + 'Ankle'] ?? 0), L.foot);
    Object.assign(j, {[side + 'Shoulder']: sh, [side + 'Elbow']: elbow, [side + 'Wrist']: wrist,
      [side + 'Hip']: hip, [side + 'Knee']: knee, [side + 'Ankle']: ankle, [side + 'Toe']: toe});
  }
  const face = Math.cos((pose.d3?.face ?? 0) * Math.PI / 180);
  if (face !== 1) for (const k in j) j[k] = [pelvis[0] + (j[k][0] - pelvis[0]) * face, j[k][1]];
  // Point le plus bas du corps (rayon approximatif de chaque partie) : pieds en général, mains, genoux, dos ou tête au sol.
  const lowest = Math.max(j.leadAnkle[1] + 5, j.rearAnkle[1] + 5, j.leadToe[1], j.rearToe[1], j.head[1] + 15, j.leadWrist[1] + 5, j.rearWrist[1] + 5,
    j.leadKnee[1] + 6, j.rearKnee[1] + 6, j.leadElbow[1] + 5, j.rearElbow[1] + 5, j.pelvis[1] + 12, j.chest[1] + 14);
  const dy = ground - lowest - (pose.lift ?? 0);
  for (const k in j) j[k] = [j[k][0], j[k][1] + dy];
  return j;
}

const smooth = t => t * t * (3 - 2 * t);
// Rythmes de transition vers une clé (champ facultatif « ease » de la clé d'arrivée). Sans précision : « doux », comme toujours.
export const EASES = {doux: smooth, lineaire: t => t, vif: t => 1 - (1 - t) ** 3, retenu: t => t ** 3};
export const easing = name => Object.hasOwn(EASES, name ?? '') ? EASES[name] : smooth;
export const lerp = (a, b, t) => a + (b - a) * t;

export function interpolatePose(p, q, t, ease) {
  const s = easing(ease)(Math.min(1, Math.max(0, t)));
  const angles = {};
  for (const k of ANGLE_KEYS) angles[k] = lerp(p.angles[k] ?? 0, q.angles[k] ?? 0, s);
  const out = {x: lerp(p.x ?? 0, q.x ?? 0, s), lift: lerp(p.lift ?? 0, q.lift ?? 0, s), angles};
  if (p.z !== undefined || q.z !== undefined) out.z = lerp(p.z ?? 0, q.z ?? 0, s);   // déplacement latéral (3D)
  if (p.d3?.face !== undefined || q.d3?.face !== undefined) out.d3 = {face: lerp(p.d3?.face ?? 0, q.d3?.face ?? 0, s)};   // rotation complète (vue 2D)
  return out;
}

// Durée totale d'une séquence (ms) : chaque clé indique le temps pour l'atteindre depuis la précédente.
export const sequenceDuration = seq => seq.keys.slice(1).reduce((s, k) => s + k.ms, 0);

// Transition en cours à la position u ∈ [0, 1] : indice de la clé d'arrivée et avancement dans le temps (0 à 1).
export function segment(seq, u) {
  let t = Math.min(1, Math.max(0, u)) * sequenceDuration(seq), i = 1;
  for (; i < seq.keys.length - 1 && t > seq.keys[i].ms; i++) t -= seq.keys[i].ms;
  return {i, local: seq.keys[i].ms ? Math.min(1, t / seq.keys[i].ms) : 1};
}

// Passage sans arrêt : une clé marquée `passe` n'arrête pas le mouvement. Autour d'elle, chaque valeur suit une courbe
// d'Hermite cubique dont la pente à cette clé vient de ses voisines (Catmull-Rom), bornée pour ne jamais dépasser ni
// revenir en arrière (Fritsch-Carlson) ; une valeur qui change de sens s'y arrête. Les clés ordinaires restent des arrêts
// (pente nulle) : sans clé `passe`, rien ne change, le rythme de la clé d'arrivée (doux, vif…) s'applique comme avant.
export function slope(seq, k, get) {
  const K = seq.keys;
  if (!K[k]?.passe || k === 0 || k === K.length - 1) return 0;
  const v0 = get(K[k - 1]), v1 = get(K[k]), v2 = get(K[k + 1]), d1 = (v1 - v0) / K[k].ms, d2 = (v2 - v1) / K[k + 1].ms;
  if (d1 * d2 <= 0) return 0;
  const m = (v2 - v0) / (K[k].ms + K[k + 1].ms);
  return Math.sign(m) * Math.min(Math.abs(m), 3 * Math.abs(d1), 3 * Math.abs(d2));
}
export const hermite = (p0, p1, m0, m1, T, t) => { const t2 = t * t, t3 = t2 * t; return (2 * t3 - 3 * t2 + 1) * p0 + (t3 - 2 * t2 + t) * T * m0 + (3 * t2 - 2 * t3) * p1 + (t3 - t2) * T * m1; };

// Décalages entre parties du corps : une clé peut donner, pour la transition qui y mène, la fenêtre de temps de chaque groupe
// (`timing: {tete: [0, 0.6], bras: [0.3, 1]}` : la tête a fini aux 60 %, les bras ne partent qu'à 30 %). Sans `timing`,
// tout le corps commence et finit ensemble, comme avant.
export const GROUPS = {
  jambes: ['leadHip', 'leadKnee', 'leadAnkle', 'rearHip', 'rearKnee', 'rearAnkle', 'leadAbd', 'rearAbd', 'leadLegRot', 'rearLegRot', 'leadFootOut', 'rearFootOut', 'leadFootRoll', 'rearFootRoll', 'leadToes', 'rearToes'],
  bassin: ['x', 'z', 'lift', 'face', 'turn', 'pelvisTilt', 'pelvisList'],
  tronc: ['torso', 'lean', 'chestTurn'],
  tete: ['neck', 'headTurn', 'headTilt'],
  bras: ['leadShoulder', 'leadElbow', 'rearShoulder', 'rearElbow', 'leadArmAbd', 'rearArmAbd', 'leadArmRot', 'rearArmRot', 'leadPronation', 'rearPronation', 'leadWristFlex', 'rearWristFlex', 'leadHandOpen', 'rearHandOpen']
};
const GROUP_OF = Object.fromEntries(Object.entries(GROUPS).flatMap(([g, ks]) => ks.map(k => [k, g])));
export const groupOf = k => GROUP_OF[k] ?? 'bassin';
export const groupTime = (key, group, t) => {
  const w = key?.timing?.[group]; if (!w) return t;
  return w[1] > w[0] ? Math.min(1, Math.max(0, (t - w[0]) / (w[1] - w[0]))) : t >= w[0] ? 1 : 0;
};

// Valeur d'une grandeur du groupe `group` à l'instant `local` de la transition vers la clé i : rythme de la clé, fenêtre de
// temps du groupe (`timing`), passage sans arrêt (`passe`). La courbe d'Hermite est calée sur la durée réelle de la fenêtre ;
// une fenêtre qui ne touche pas une clé (départ retardé, arrivée en avance) y impose une vitesse nulle : la vitesse reste
// continue d'une transition à l'autre, sans à-coup.
export function groupValue(seq, i, local, group, get) {
  const K = seq.keys, A = K[i - 1], B = K[i], [w0, w1] = B.timing?.[group] ?? [0, 1], t = groupTime(B, group, local);
  if (!A.passe && !B.passe) return get(A) + (get(B) - get(A)) * easing(B.ease)(t);
  const prev = A.timing?.[group]?.[1] ?? 1, next = K[i + 1]?.timing?.[group]?.[0] ?? 0;
  const m0 = w0 > 0 || prev < 1 ? 0 : slope(seq, i - 1, get), m1 = w1 < 1 || next > 0 ? 0 : slope(seq, i, get);
  return hermite(get(A), get(B), m0, m1, Math.max(0.05, w1 - w0) * B.ms, t);
}

// u ∈ [0, 1] sur toute la séquence. Renvoie la pose et l'indice de la phase en cours.
export function samplePose(seq, u) {
  if (seq.keys.length < 2) return {pose: seq.keys[0].pose, phase: 0};
  const {i, local} = segment(seq, u), A = seq.keys[i - 1], B = seq.keys[i], phase = local < 0.5 ? i - 1 : i;
  if (!A.passe && !B.passe && !B.timing) return {pose: interpolatePose(A.pose, B.pose, local, B.ease), phase};
  const angles = {}, val = (get, k) => groupValue(seq, i, local, groupOf(k), get);
  for (const k of ANGLE_KEYS) angles[k] = val(K => K.pose.angles[k] ?? 0, k);
  const pose = {x: val(K => K.pose.x ?? 0, 'x'), lift: val(K => K.pose.lift ?? 0, 'lift'), angles};
  if (A.pose.z !== undefined || B.pose.z !== undefined) pose.z = val(K => K.pose.z ?? 0, 'z');
  if (A.pose.d3?.face !== undefined || B.pose.d3?.face !== undefined) pose.d3 = {face: val(K => K.pose.d3?.face ?? 0, 'face')};
  return {pose, phase};
}

// Position normalisée (u) de chaque clé.
export function keyPositions(seq) {
  const total = sequenceDuration(seq) || 1;
  let acc = 0;
  return seq.keys.map((k, i) => { if (i) acc += k.ms; return acc / total; });
}

// Trajectoire d'une articulation, échantillonnée sur la séquence.
export function trajectory(seq, joint, samples = 48, ground) {
  return Array.from({length: samples + 1}, (_, i) => computeJoints(samplePose(seq, i / samples).pose, ground)[joint]);
}

export function validSequence(seq) {
  const errors = [];
  if (!seq?.id || !Array.isArray(seq.keys) || seq.keys.length < 2) return ['séquence incomplète'];
  seq.keys.forEach((k, i) => {
    if (!k.label) errors.push(`clé ${i} sans nom`);
    if (i && !(k.ms > 0)) errors.push(`clé ${i} sans durée`);
    for (const a of ANGLE_KEYS) if (!Number.isFinite(k.pose?.angles?.[a])) errors.push(`clé ${i} : angle ${a} manquant`);
  });
  for (const j of seq.track ?? []) if (!JOINT_NAMES.includes(j)) errors.push(`trajectoire inconnue ${j}`);
  return errors;
}

// ——— Centre de masse (approximation segmentaire) ———
// Fractions de masse et position du centre de chaque segment (depuis l'extrémité proximale), d'après les tables
// anthropométriques de Dempster reprises par Winter (Biomechanics and Motor Control of Human Movement, 4e éd., 2009).
// Le mannequin n'ayant pas de mains ni de tronc segmenté, l'approximation reste grossière : illustration pédagogique.
export const SEGMENT_MASS = [
  ['neckBase', 'head', 0.081, 1], ['pelvis', 'neckBase', 0.497, 0.5],
  ...['lead', 'rear'].flatMap(s => [[s + 'Shoulder', s + 'Elbow', 0.028, 0.436], [s + 'Elbow', s + 'Wrist', 0.016, 0.43], [s + 'Wrist', s + 'Wrist', 0.006, 0],
    [s + 'Hip', s + 'Knee', 0.1, 0.433], [s + 'Knee', s + 'Ankle', 0.0465, 0.433], [s + 'Ankle', s + 'Toe', 0.0145, 0.5]])
];
export function centerOfMass(j) {
  let x = 0, y = 0, m = 0;
  for (const [a, b, w, r] of SEGMENT_MASS) { x += w * (j[a][0] + (j[b][0] - j[a][0]) * r); y += w * (j[a][1] + (j[b][1] - j[a][1]) * r); m += w; }
  return [x / m, y / m];
}
// Base d'appui dans le plan du profil : étendue des pieds posés au sol (talon ≈ cheville - 6, pointe).
export function supportBase(j, ground = 280, tol = 8) {
  const xs = [];
  for (const s of ['lead', 'rear']) {
    const toe = j[s + 'Toe'], ankle = j[s + 'Ankle'];
    if (toe[1] >= ground - tol) xs.push(toe[0]);
    if (ankle[1] + 5 >= ground - tol) xs.push(ankle[0] - 6);
  }
  return xs.length ? [Math.min(...xs), Math.max(...xs)] : null;
}
