// Arène de réaction : réagir à une cible qui s'allume dans l'une des quatre directions, en ignorant les leurres.
// Trois niveaux : la fenêtre de réponse rétrécit et les leurres apparaissent. Mesure : temps de réaction médian des
// bonnes réponses, précision, anticipations. Sur écran, le délai de l'appareil s'ajoute : ne comparer qu'à soi-même.

export const DIRS = ['haut', 'droite', 'bas', 'gauche'];
export const KEYS = {ArrowUp: 'haut', ArrowRight: 'droite', ArrowDown: 'bas', ArrowLeft: 'gauche', KeyW: 'haut', KeyD: 'droite', KeyS: 'bas', KeyA: 'gauche', KeyZ: 'haut', KeyQ: 'gauche'};
export const LEVELS = {
  1: {name: 'Éveil', trials: 12, window: 1500, lures: 0, delay: [900, 2400]},
  2: {name: 'Vigilance', trials: 16, window: 900, lures: 0.2, delay: [700, 2000]},
  3: {name: 'Éclair', trials: 20, window: 650, lures: 0.3, delay: [500, 1600]}
};
export const MIN_MS = 100;   // en dessous : anticipation

export function plan(level, rnd = Math.random) {
  const L = LEVELS[level], trials = [];
  for (let i = 0; i < L.trials; i++) {
    let dir = DIRS[Math.floor(rnd() * 4)];
    if (i && dir === trials[i - 1].dir && rnd() < 0.6) dir = DIRS[(DIRS.indexOf(dir) + 1 + Math.floor(rnd() * 3)) % 4];   // peu de répétitions
    trials.push({dir, lure: i > 1 && rnd() < L.lures, delay: Math.round(L.delay[0] + rnd() * (L.delay[1] - L.delay[0]))});
  }
  return trials;
}

// Résultat d'un essai : answer = direction donnée (ou null), rt en ms (ou null), early = appui avant la cible.
export function judge(trial, answer, rt, level, early = false) {
  if (early) return 'anticipation';
  if (trial.lure) return answer === null ? 'leurre-ignore' : 'leurre-frappe';
  if (answer === null || rt === null || rt > LEVELS[level].window) return 'trop-tard';
  if (rt < MIN_MS) return 'anticipation';
  return answer === trial.dir ? 'touche' : 'mauvais-cote';
}

const med = xs => { if (!xs.length) return null; const s = [...xs].sort((a, b) => a - b), m = s.length >> 1; return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2); };

export function score(results) {
  const n = k => results.filter(r => r.kind === k).length, targets = results.filter(r => !r.lure).length, lures = results.length - targets;
  const hits = results.filter(r => r.kind === 'touche');
  let best = 0, cur = 0;
  for (const r of results) { if (r.kind === 'touche' || r.kind === 'leurre-ignore') best = Math.max(best, ++cur); else cur = 0; }
  return {median: med(hits.map(r => r.rt)), hits: hits.length, targets, accuracy: targets ? Math.round(100 * hits.length / targets) : 0,
    luresHeld: n('leurre-ignore'), lures, wrong: n('mauvais-cote'), late: n('trop-tard'), anticipations: n('anticipation'), bestStreak: best,
    reliable: hits.length >= 6};
}
