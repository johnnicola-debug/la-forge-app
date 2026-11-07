// Rangs F à S : situer une mesure dans une table de normes PUBLIÉE (data/norms.js), jamais dans une échelle inventée.
// Deux sortes de tables :
//  - centiles (la source donne des centiles) : le score 0–100 est le centile, interpolé entre les valeurs publiées ;
//  - catégories (la source donne des catégories « faible … excellent ») : le score est la position dans ces catégories,
//    chaque catégorie occupant une part égale de 0 à 100. Ce n'est PAS un centile, et l'écran le dit.
// Sans sexe, âge ou norme applicable : aucun rang.

export const GRADES = [['S', 90], ['A', 75], ['B', 60], ['C', 45], ['D', 30], ['E', 15], ['F', 0]];
export const gradeOf = score => GRADES.find(([, min]) => score >= min)[0];

export function ageAt(birthYear, date = new Date()) {
  return Number.isInteger(birthYear) ? new Date(date).getFullYear() - birthYear : null;
}

// Bande de la table applicable à la personne (sexe 'f' | 'h', âge en années).
export function bandFor(norm, sex, age) {
  if (!norm || !['f', 'h'].includes(sex) || !Number.isFinite(age)) return null;
  return norm.bands.find(b => b.sex === sex && age >= b.ageMin && age <= b.ageMax) ?? null;
}

// Score 0–100 d'une valeur dans une bande.
//  centiles : band.points = [[centile, valeur], …] (valeurs croissantes si higherIsBetter)
//  catégories : band.cuts = seuils entre catégories successives (de la pire à la meilleure), n catégories = cuts.length + 1
export function scoreIn(norm, band, value) {
  if (!band || !Number.isFinite(value)) return null;
  const better = norm.higherIsBetter !== false, v = better ? value : -value;
  if (norm.kind === 'centiles') {
    const pts = band.points.map(([c, x]) => [c, better ? x : -x]).sort((a, b) => a[1] - b[1]);
    // Sous le plus petit centile publié : prolongement de la première pente, sans descendre sous 0.
    if (v <= pts[0][1]) { const [c0, x0] = pts[0], [c1, x1] = pts[1]; return Math.max(0, c0 - (c1 - c0) * (x0 - v) / ((x1 - x0) || 1)); }
    for (let i = 1; i < pts.length; i++) if (v <= pts[i][1]) {
      const [c0, x0] = pts[i - 1], [c1, x1] = pts[i];
      return c0 + (c1 - c0) * (v - x0) / ((x1 - x0) || 1);
    }
    const [cA, xA] = pts.at(-2), [cB, xB] = pts.at(-1);
    return Math.min(100, cB + (cB - cA) * (v - xB) / ((xB - xA) || 1));
  }
  const cuts = band.cuts.map(c => better ? c : -c), n = cuts.length + 1, w = 100 / n;
  let k = cuts.findIndex(c => v < c);
  if (k === -1) k = n - 1;
  // Position dans la catégorie : linéaire entre ses deux seuils ; catégories extrêmes : largeur de la catégorie voisine.
  const lo = k === 0 ? cuts[0] - (cuts[1] - cuts[0]) : cuts[k - 1], hi = k === n - 1 ? cuts.at(-1) + (cuts.at(-1) - cuts.at(-2)) : cuts[k];
  const t = Math.min(1, Math.max(0, (v - lo) / ((hi - lo) || 1)));
  return Math.min(100, Math.max(0, k * w + t * w));
}

// Rang d'une mesure : {score, grade, norm, band} ou {missing: 'profil' | 'norme' | 'bande'}.
export function rate({norms, test, value, sex, birthYear, date}) {
  const norm = norms.find(n => n.test === test);
  if (!norm) return {missing: 'norme'};
  if (!['f', 'h'].includes(sex) || !Number.isInteger(birthYear)) return {missing: 'profil', norm};
  const band = bandFor(norm, sex, ageAt(birthYear, date));
  if (!band) return {missing: 'bande', norm};
  const score = scoreIn(norm, band, value);
  return score === null ? {missing: 'valeur', norm} : {score: Math.round(score), grade: gradeOf(score), norm, band};
}
