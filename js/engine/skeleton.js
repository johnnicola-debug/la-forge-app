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

// u ∈ [0, 1] sur toute la séquence. Renvoie la pose et l'indice de la phase en cours.
export function samplePose(seq, u) {
  const total = sequenceDuration(seq);
  let t = Math.min(1, Math.max(0, u)) * total;
  for (let i = 1; i < seq.keys.length; i++) {
    const k = seq.keys[i];
    if (t <= k.ms || i === seq.keys.length - 1) {
      const local = k.ms ? Math.min(1, t / k.ms) : 1;
      return {pose: interpolatePose(seq.keys[i - 1].pose, k.pose, local, k.ease), phase: local < 0.5 ? i - 1 : i};
    }
    t -= k.ms;
  }
  return {pose: seq.keys[0].pose, phase: 0};
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
