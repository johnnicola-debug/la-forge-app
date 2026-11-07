// Animation légère en boucle : la silhouette à l'encre (2D, de profil) joue un mouvement. Peu gourmande,
// elle convient à la séance guidée et au mode mains libres (le corps d'ombre 3D reste sur la fiche exercice).
import {computeJoints, samplePose, sequenceDuration} from '../engine/skeleton.js';
import {inkFigure} from '../engine/render.js';
import {esc} from '../ui.js';

const GROUND = 280;

// Cadre qui contient tout le mouvement (couché, suspendu ou debout).
function frameOf(seq) {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity;
  for (let i = 0; i <= 40; i++) for (const p of Object.values(computeJoints(samplePose(seq, i / 40).pose, GROUND))) {
    x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]);
  }
  const pad = 34, w = Math.max(x1 - x0 + 2 * pad, 200), h = GROUND + 14 - (y0 - pad);
  return [((x0 + x1) / 2 - w / 2).toFixed(0), (y0 - pad).toFixed(0), w.toFixed(0), h.toFixed(0)];
}

// Image fixe du mouvement (milieu du geste), pour les vignettes.
export function stillInk(seq, u = 0.5) {
  const [vx, vy, vw, vh] = frameOf(seq);
  return `<svg class="inkloop" viewBox="${vx} ${vy} ${vw} ${vh}" aria-hidden="true"><line x1="${vx}" x2="${Number(vx) + Number(vw)}" y1="${GROUND}" y2="${GROUND}" class="ink-ground"/><g class="ink-fig">${inkFigure(computeJoints(samplePose(seq, u).pose, GROUND))}</g></svg>`;
}

export function mountInk(host, seq, {speed = 1, label = ''} = {}) {
  const [vx, vy, vw, vh] = frameOf(seq);
  host.innerHTML = `<svg class="inkloop" viewBox="${vx} ${vy} ${vw} ${vh}" role="img" aria-label="${esc(label || 'Animation du mouvement')}">
    <line x1="${vx}" x2="${Number(vx) + Number(vw)}" y1="${GROUND}" y2="${GROUND}" class="ink-ground"/><g class="ink-fig"></g></svg>`;
  const g = host.querySelector('.ink-fig'), dur = sequenceDuration(seq) / speed + 500;
  const draw = u => { g.innerHTML = inkFigure(computeJoints(samplePose(seq, u).pose, GROUND)); };
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { draw(0.5); return () => {}; }
  let raf = 0, t0 = performance.now();
  const loop = t => { const e = (t - t0) % dur; draw(Math.min(1, e / (dur - 500))); raf = requestAnimationFrame(loop); };
  raf = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(raf);
}
