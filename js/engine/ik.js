// Cinématique inverse à deux segments (loi des cosinus), partagée par la manipulation directe (posing.js)
// et par la tenue des appuis et la construction des mouvements (body3d.js).
const D = Math.PI / 180;
export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
// Angle équivalent le plus proche d'une valeur de référence (pas de tour complet parasite), gardé dans [-200°, 200°].
export const near = (a, ref) => { let v = a + 360 * Math.round((ref - a) / 360); if (v > 200) v -= 360; if (v < -200) v += 360; return v; };
// Deux segments L1, L2 depuis l'attache vers le point (f, d) d'un plan (f vers l'avant, d vers le « bas » du plan) :
// direction du point (0 = bas, 90 = avant, 180 = haut), angle entre le premier segment et cette direction, pliure au milieu.
export function twoBone(f, d, L1, L2) {
  const dist = clamp(Math.hypot(f, d), Math.abs(L1 - L2) + 1e-6, L1 + L2 - 1e-6);
  return {dir: Math.atan2(f, d) / D, at: Math.acos(clamp((L1 * L1 + dist * dist - L2 * L2) / (2 * L1 * dist), -1, 1)) / D,
    bend: 180 - Math.acos(clamp((L1 * L1 + L2 * L2 - dist * dist) / (2 * L1 * L2), -1, 1)) / D};
}
