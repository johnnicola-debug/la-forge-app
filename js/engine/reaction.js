// Test de réaction sur écran. Mesure le délai entre l'affichage d'un signal et l'appui,
// matériel compris (écran, clavier/souris, navigateur). Ce n'est pas une mesure de compétence au combat.

export const MODES = {
  simple: {name: 'Réaction simple', trials: 5, help: 'Appuyez dès que le cercle devient jade.'},
  choix: {name: 'Réaction à choix', trials: 8, help: 'Appuyez seulement sur le jade. Ne bougez pas sur le vermillon.'}
};
export const MIN_VALID_MS = 100;   // en dessous : anticipation probable
export const MAX_VALID_MS = 1500;  // au-dessus : inattention probable

export const median = xs => { if (!xs.length) return null; const s = [...xs].sort((a, b) => a - b), m = s.length >> 1; return Math.round(s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2); };
export function quartiles(xs) {
  if (xs.length < 4) return null;
  const s = [...xs].sort((a, b) => a - b), q = p => s[Math.min(s.length - 1, Math.round(p * (s.length - 1)))];
  return [q(0.25), q(0.75)];
}

// Prépare une série. En mode choix, environ un tiers des signaux sont des leurres (vermillon), au moins deux.
export function plan(mode, rnd = Math.random) {
  const n = MODES[mode].trials;
  const trials = Array.from({length: n}, () => ({go: true, delay: 1200 + Math.round(rnd() * 2300)}));
  if (mode === 'choix') {
    const lures = Math.max(2, Math.round(n / 3));
    const idx = [...trials.keys()].sort(() => rnd() - 0.5).slice(0, lures);
    for (const i of idx) trials[i].go = false;
  }
  return trials;
}

// Classe une réponse. `rt` = délai (ms) entre signal et appui, null si aucun appui.
export function classify(trial, rt, pressedBeforeSignal = false) {
  if (pressedBeforeSignal) return 'anticipation';
  if (!trial.go) return rt === null ? 'retenue' : 'erreur-leurre';
  if (rt === null) return 'manque';
  if (rt < MIN_VALID_MS) return 'anticipation';
  if (rt > MAX_VALID_MS) return 'lent';
  return 'valide';
}

export function summary(results) {
  const valid = results.filter(r => r.kind === 'valide').map(r => r.rt);
  const count = k => results.filter(r => r.kind === k).length;
  const q = quartiles(valid);
  return {median: median(valid), valid: valid.length, spread: q ? q[1] - q[0] : null, anticipations: count('anticipation'),
    lureErrors: count('erreur-leurre'), lureHeld: count('retenue'), missed: count('manque') + count('lent'),
    reliable: valid.length >= 4};
}

export const LIMITS = [
  'Le résultat inclut le délai de l’écran, du clavier ou de la souris et du navigateur : il varie d’un appareil à l’autre.',
  'Il ne se compare qu’à vos propres essais, sur le même appareil et dans des conditions proches.',
  'Réagir à un cercle n’est pas lire un adversaire : ce test ne mesure ni l’anticipation, ni la décision, ni la compétence en combat.',
  'La fatigue, l’attention et l’heure influencent nettement le résultat.'
];
