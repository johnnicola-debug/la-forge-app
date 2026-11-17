// Construction des mouvements du moteur (version 2) : une pose se décrit par ce qui compte — où sont les pieds et les mains
// au sol, où va le bassin, ce que font le buste et les bras — et les angles des membres s'en déduisent par cinématique
// inverse (body3d.js). Un pied posé ne glisse donc pas d'une étape à l'autre, et le centre de masse se place au-dessus
// d'un appui. Calculs sur le corps aux proportions moyennes : les angles obtenus valent pour toute taille.
import {bodyDims, joints3d, extrasOf, reachFoot, reachHand, centerOfMass3d} from './body3d.js';

export const DIMS = bodyDims();
export const cm = v => v / 100 / DIMS.unit;   // centimètres → unités de position du moteur (x, z)
const clone = o => JSON.parse(JSON.stringify(o));
const r1 = v => Math.round(v * 10) / 10;
const tidy = p => {
  for (const k in p.angles) p.angles[k] = r1(p.angles[k]);
  for (const k of ['x', 'z', 'lift']) if (p[k] !== undefined) p[k] = r1(p[k]);
  if (p.d3) for (const k in p.d3) p.d3[k] = r1(p.d3[k]);
  return p;
};
export const at = (style, p) => joints3d(p, DIMS, extrasOf({style}, p));
const anchor = (j, side) => j[side + 'Heel'][1] <= 0.02 ? 'Heel' : 'Toe';
const keepAbd = (p, ex, side) => { p.d3 = {...p.d3, [side + 'Abd']: ex[side + 'Abd']}; };

// À partir d'une pose de référence : changer buste, bras, tête (`angles`), bassin (`x`, `z` en unités ; `drop` : descente en
// mètres) ou réglages 3D (`d3`) ; chaque pied reste où il était au sol, ou va où on le demande : `feet: {lead: {dx, dz, pitch,
// on}}` (déplacement en mètres, inclinaison du pied, point d'appui 'Heel' ou 'Toe'). `free` : jambes en l'air, angles donnés.
export function move(style, ref, {angles = {}, x, z, drop = 0, d3, feet = {}, free = []} = {}) {
  const jR = at(style, ref), p = clone(ref);
  Object.assign(p.angles, angles);
  if (x !== undefined) p.x = x;
  if (z !== undefined) p.z = z;
  if (d3) p.d3 = {...p.d3, ...d3};
  const ex = extrasOf({style}, p), y = jR.pelvis[1] - drop;
  for (const side of ['lead', 'rear']) {
    if (free.includes(side)) continue;
    const f = feet[side] ?? {}, on = f.on ?? anchor(jR, side), w = jR[side + on];   // un point d'appui reste au ras du sol
    reachFoot(p, ex, side, [w[0] + (f.dx ?? 0), w[1] <= 0.02 ? 0 : w[1], w[2] + (f.dz ?? 0)], y, DIMS, {at: on, pitch: f.pitch});
    keepAbd(p, ex, side);
  }
  return tidy(p);
}

// Déplacer le bassin (à hauteur constante) jusqu'à ce que le centre de masse soit au-dessus du pied `side`, à la fraction
// `aim` de la longueur du pied (0 talon, 1 avant-pied ; `side` 'both' : entre les deux pieds) — ou seulement une fraction `part`
// du chemin (transfert partiel) ;
// les pieds posés restent en place, les jambes `free` suivent le bassin.
export function over(style, ref, side, {aim = 0.45, free = [], part = 1} = {}) {
  const p = clone(ref), j0 = at(style, p), y = j0.pelvis[1];
  // Les pieds posés restent là où ils sont au départ (au sol), quelle que soit l'itération.
  const keep = ['lead', 'rear'].filter(s => !free.includes(s)).map(s => { const on = anchor(j0, s), w = j0[s + on]; return [s, on, [w[0], 0, w[2]]]; });
  const c0 = centerOfMass3d(j0), sides = side === 'both' ? ['lead', 'rear'] : [side];
  const goal = [0, 2].map(i => c0[i] + (sides.reduce((a, s) => a + j0[s + 'Heel'][i] + (j0[s + 'Toe'][i] - j0[s + 'Heel'][i]) * aim, 0) / sides.length - c0[i]) * part);
  for (let n = 0; n < 16; n++) {
    const j = at(style, p), c = centerOfMass3d(j);
    const dx = goal[0] - c[0], dz = goal[1] - c[2];
    if (Math.hypot(dx, dz) < 0.002) break;
    p.x = (p.x ?? 0) + dx / DIMS.unit; p.z = (p.z ?? 0) + dz / DIMS.unit;
    const ex = extrasOf({style}, p);
    for (const [s, on, w] of keep) { reachFoot(p, ex, s, w, y, DIMS, {at: on}); keepAbd(p, ex, s); }
  }
  return tidy(p);
}

// Poser les mains au sol : `targets` = {lead: [x, z], rear: [x, z]} en mètres (monde) ; épaules et coudes s'en déduisent.
export function hands(style, ref, targets) {
  const p = clone(ref), ex = extrasOf({style}, p), j = at(style, p);
  for (const [s, [x, z]] of Object.entries(targets)) { reachHand(p, ex, s, [x, DIMS.fist * 0.75, z], j.pelvis[1], DIMS); p.d3 = {...p.d3, [s + 'ArmAbd']: ex[s + 'ArmAbd']}; }
  return tidy(p);
}
