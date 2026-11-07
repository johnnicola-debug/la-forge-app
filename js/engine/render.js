// Rendu SVG « planche d'étude » : mannequin blanc en volume, poses fantômes,
// trajectoires fines et annotations. Illustration uniquement.
import {computeJoints, samplePose, keyPositions, trajectory, JOINT_LABELS, centerOfMass, supportBase} from './skeleton.js';

const W = {upperArm: 13, forearm: 11, thigh: 19, shin: 14, foot: 9, neck: 10};
const f = n => Math.round(n * 10) / 10;
const pt = p => `${f(p[0])} ${f(p[1])}`;

// Style « encre » : silhouette pleine, pour les scènes (inspiration ombre chinoise).
let INK = false;
function capsule(a, b, w, ghost) {
  const d = `M${pt(a)}L${pt(b)}`;
  if (INK) return `<path d="${d}" stroke="var(--ink-fig, #0b0f10)" stroke-width="${w + 1}"/>`;
  if (ghost) return `<path d="${d}" stroke="var(--ghost-line)" stroke-width="${w + 1.5}"/><path d="${d}" stroke="var(--ghost-fill)" stroke-width="${w - 1}"/>`;
  const off = (p, o) => [p[0] + o, p[1] + o];
  return `<path d="${d}" stroke="var(--mq-outline)" stroke-width="${w + 2.4}"/>`
    + `<path d="${d}" stroke="var(--mq-shade)" stroke-width="${w}"/>`
    + `<path d="M${pt(off(a, -1))}L${pt(off(b, -1))}" stroke="var(--mq-body)" stroke-width="${w - 3}"/>`
    + `<path d="M${pt(off(a, -2))}L${pt(off(b, -2))}" stroke="var(--mq-light)" stroke-width="${Math.max(2, w * 0.3)}"/>`;
}

// Tronc de mannequin : bassin, abdomen et cage thoracique en volumes séparés.
function torso(j, ghost, id) {
  const [px, py] = j.pelvis, [cx, cy] = j.chest;
  const ang = Math.atan2(cx - px, -(cy - py)) * 180 / Math.PI;
  const at = t => [px + (cx - px) * t, py + (cy - py) * t];
  const fill = ghost ? 'fill="var(--ghost-fill)" stroke="var(--ghost-line)"' : `fill="url(#${id}-vol)" stroke="var(--mq-outline)" stroke-width="1.3"`;
  const ell = (c, rx, ry) => `<ellipse cx="${f(c[0])}" cy="${f(c[1])}" rx="${rx}" ry="${ry}" transform="rotate(${f(ang)} ${f(c[0])} ${f(c[1])})" ${fill}/>`;
  return capsule(at(0.12), at(0.62), 22, ghost) + ell(at(0.02), 16, 12) + ell(at(0.72), 18, 25);
}

function head(j, ghost, id) {
  const [x, y] = j.head;
  return ghost ? `<ellipse cx="${f(x)}" cy="${f(y)}" rx="13" ry="15" fill="var(--ghost-fill)" stroke="var(--ghost-line)"/>`
    : `<ellipse cx="${f(x)}" cy="${f(y)}" rx="13" ry="15.5" fill="url(#${id}-vol)" stroke="var(--mq-outline)" stroke-width="1.4"/>`
      + `<path d="M${f(x + 6)} ${f(y - 2)}q5 2 5 6" stroke="var(--mq-outline)" stroke-width="1" fill="none"/>`;
}

function limbs(j, side, ghost) {
  return capsule(j[side + 'Hip'], j[side + 'Knee'], W.thigh, ghost) + capsule(j[side + 'Knee'], j[side + 'Ankle'], W.shin, ghost)
    + capsule(j[side + 'Ankle'], j[side + 'Toe'], W.foot, ghost);
}
function arm(j, side, ghost, id) {
  const fist = j[side + 'Wrist'];
  return capsule(j[side + 'Shoulder'], j[side + 'Elbow'], W.upperArm, ghost) + capsule(j[side + 'Elbow'], fist, W.forearm, ghost)
    + (ghost ? `<circle cx="${f(fist[0])}" cy="${f(fist[1])}" r="7" fill="var(--ghost-fill)" stroke="var(--ghost-line)"/>`
      : `<circle cx="${f(fist[0])}" cy="${f(fist[1])}" r="7.5" fill="url(#${id}-vol)" stroke="var(--mq-outline)" stroke-width="1.2"/>`);
}

export function inkFigure(j) {
  INK = true;
  const [x, y] = j.head, ang = Math.atan2(j.chest[0] - j.pelvis[0], -(j.chest[1] - j.pelvis[1])) * 180 / Math.PI;
  const at = t => [j.pelvis[0] + (j.chest[0] - j.pelvis[0]) * t, j.pelvis[1] + (j.chest[1] - j.pelvis[1]) * t];
  const ell = (c, rx, ry) => `<ellipse cx="${f(c[0])}" cy="${f(c[1])}" rx="${rx}" ry="${ry}" transform="rotate(${f(ang)} ${f(c[0])} ${f(c[1])})"/>`;
  const out = `<g class="inkfig" fill="var(--ink-fig, #0b0f10)" stroke-linecap="round">${limbs(j, 'rear')}${arm(j, 'rear', false, 'x')}${capsule(j.neckBase, j.head, W.neck)}
    ${capsule(at(0.12), at(0.62), 22)}${ell(at(0.02), 16, 12)}${ell(at(0.72), 18, 25)}<ellipse cx="${f(x)}" cy="${f(y)}" rx="13" ry="15.5"/>${limbs(j, 'lead')}${arm(j, 'lead', false, 'x')}</g>`;
  INK = false;
  return out.replace(/fill="url\(#x-vol\)" stroke="var\(--mq-outline\)" stroke-width="1.2"/g, '');
}

export function figure(j, {ghost = false, id = 'mq', markers = true} = {}) {
  const parts = [arm(j, 'rear', ghost, id), limbs(j, 'rear', ghost), capsule(j.neckBase, j.head, W.neck, ghost), torso(j, ghost, id),
    head(j, ghost, id), limbs(j, 'lead', ghost), arm(j, 'lead', ghost, id)];
  const dots = !ghost && markers ? ['leadKnee', 'rearKnee', 'leadElbow', 'pelvis', 'leadShoulder'].map(k =>
    `<circle class="mk" cx="${f(j[k][0])}" cy="${f(j[k][1])}" r="3.4"/>`).join('') : '';
  return `<g class="${ghost ? 'mq ghost' : 'mq'}" fill="none" stroke-linecap="round" stroke-linejoin="round">${parts.join('')}${dots}</g>`;
}

const defs = id => `<defs><radialGradient id="${id}-vol" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="var(--mq-light)"/>`
  + `<stop offset=".55" stop-color="var(--mq-body)"/><stop offset="1" stop-color="var(--mq-shade)"/></radialGradient>`
  + `<pattern id="${id}-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="var(--grid)" stroke-width=".6"/></pattern></defs>`;

const polyline = pts => pts.map((p, i) => (i ? 'L' : 'M') + pt(p)).join('');

// Planche d'étude d'une séquence à l'instant u.
// mode : 'superpose' (fantômes au même endroit) ou 'etale' (phases étalées de gauche à droite).
export function study(seq, {u = 0, mode = 'superpose', ghosts = true, tracks = true, compare = null, com = false, id = 'st', width = 640, height = 340} = {}) {
  const ground = height - 40, keys = keyPositions(seq);
  const spread = mode === 'etale' ? Math.min(150, (width - 200) / Math.max(1, seq.keys.length - 1)) : 0;
  const allX = seq.keys.map(k => k.pose.x ?? 0), minX = Math.min(...allX), maxX = Math.max(...allX);
  const baseX = mode === 'etale' ? 110 : width / 2 - (minX + maxX) / 2 - 10;
  const place = (j, shift) => { const o = {}; for (const k in j) o[k] = [j[k][0] + shift, j[k][1]]; return o; };
  const shiftAt = v => baseX + (mode === 'etale' ? v * spread * (seq.keys.length - 1) : 0);
  let out = `<rect width="${width}" height="${height}" fill="url(#${id}-grid)"/>`
    + `<line x1="20" x2="${width - 20}" y1="${ground + 1}" y2="${ground + 1}" class="ground"/>`;
  if (ghosts) seq.keys.forEach((k, i) => {
    if (mode === 'superpose' && Math.abs(keys[i] - u) < 0.02) return;
    out += figure(place(computeJoints(k.pose, ground), shiftAt(keys[i])), {ghost: true, id});
  });
  if (tracks) for (const [n, joint] of (seq.track ?? []).entries()) {
    const pts = trajectory(seq, joint, 48, ground).map((p, i) => [p[0] + shiftAt(i / 48), p[1]]);
    out += `<path d="${polyline(pts)}" class="track t${n}"/>`;
    const end = pts.at(-1);
    out += keys.map(v => { const p = pts[Math.round(v * 48)]; return `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="2.6" class="track-dot t${n}"/>`; }).join('');
    const right = end[0] > width - 90;
    out += `<text x="${f(end[0] + (right ? -10 : 14))}" y="${f(end[1] - 12)}" class="note" text-anchor="${right ? 'end' : 'start'}">${JOINT_LABELS[joint] ?? joint}</text>`;
  }
  if (compare) {
    const c = samplePose(compare, u).pose;
    out += `<g class="compare">${figure(place(computeJoints(c, ground), shiftAt(u)), {ghost: true, id})}</g>`;
  }
  const {pose, phase} = samplePose(seq, u);
  const j = place(computeJoints(pose, ground), shiftAt(u));
  out += figure(j, {id});
  if (com) {
    const path = Array.from({length: 49}, (_, i) => { const c = centerOfMass(computeJoints(samplePose(seq, i / 48).pose, ground)); return [c[0] + shiftAt(i / 48), c[1]]; });
    const c = centerOfMass(j), base = supportBase(j, ground), inside = base && c[0] >= base[0] && c[0] <= base[1];
    out += `<path d="${polyline(path)}" class="com-track"/>`
      + (base ? `<line x1="${f(base[0])}" x2="${f(base[1])}" y1="${ground + 1}" y2="${ground + 1}" class="base ${inside ? 'in' : 'out'}"/>` : '')
      + `<line x1="${f(c[0])}" x2="${f(c[0])}" y1="${f(c[1])}" y2="${ground}" class="plumb"/><circle cx="${f(c[0])}" cy="${f(c[1])}" r="5" class="com"/>`
      + `<text x="${f(c[0] + 9)}" y="${f(c[1] - 8)}" class="note">Centre de masse estimé${base ? (inside ? ' · au-dessus de la base' : ' · hors de la base') : ' · aucun appui'}</text>`;
  }
  out += `<ellipse cx="${f((j.leadAnkle[0] + j.rearAnkle[0]) / 2)}" cy="${ground + 3}" rx="54" ry="5" class="shadow"/>`;
  const label = seq.keys[phase]?.label ?? '';
  return {svg: `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${seq.name} : ${label}. Illustration non validée." class="study">${defs(id)}${out}`
    + `<text x="${width - 24}" y="${height - 14}" text-anchor="end" class="note">Étude illustrative · non validée</text></svg>`, phase, label};
}

// Vignette d'une clé (frise des phases).
export function thumb(seq, i, id = 'th') {
  const j = computeJoints(seq.keys[i].pose, 150);
  const cx = (j.leadAnkle[0] + j.rearAnkle[0]) / 2;
  for (const k in j) j[k] = [j[k][0] - cx + 60, j[k][1]];
  return `<svg viewBox="0 -5 120 165" aria-hidden="true">${defs(id)}${figure(j, {id, markers: false})}</svg>`;
}
