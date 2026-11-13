// Accueil : scène d'entrée (silhouette à l'encre, puis corps d'ombre en 3D) et les trois portes de l'atelier.
import {sequenceById, sequences} from '../data/sequences.js';
import {samplePose, computeJoints, sequenceDuration} from '../engine/skeleton.js';
import {inkFigure} from '../engine/render.js';
import {compose} from '../engine/compose.js';
import {SPACES} from '../nav.js';
import {$, esc, page} from '../ui.js';

const SCENE_SEQ = ['garde', 'direct-avant', 'garde', 'pas-glisse', 'coup-pied-avant'];
// Combat d'ombres de l'accueil (3D) : le corps d'ombre enchaîne des gestes de plusieurs disciplines.
const SHADOW_FIGHT = ['garde', 'direct-avant', 'direct-arriere', 'esquive-laterale', 'pas-arriere', 'coup-pied-avant', 'teep', 'pas-glisse'];

function sceneSvg(fig) {
  return `<svg class="seuil-art" viewBox="0 0 900 420" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
  <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#18262a"/><stop offset=".55" stop-color="#2c3b3a"/><stop offset="1" stop-color="#a99a7d"/></linearGradient>
  <linearGradient id="fog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9c0a8" stop-opacity="0"/><stop offset="1" stop-color="#c9c0a8" stop-opacity=".55"/></linearGradient></defs>
  <rect width="900" height="420" fill="url(#sky)"/>
  <circle cx="640" cy="150" r="70" fill="#e9b9a6" opacity=".55"/><circle cx="640" cy="150" r="110" fill="#e9b9a6" opacity=".08"/>
  <path class="lay l1" d="M0 260 L90 190 L150 220 L240 140 L330 210 L420 170 L520 230 L610 160 L720 220 L800 180 L900 230 V420 H0Z" fill="#3c4a48"/>
  <rect y="230" width="900" height="80" fill="url(#fog)"/>
  <path class="lay l2" d="M0 320 L120 270 L220 300 L330 250 L460 300 L560 262 L700 310 L820 280 L900 300 V420 H0Z" fill="#26302f"/>
  <g class="lay l3" stroke="#151b1b" stroke-width="10" fill="none"><path d="M120 420V250M330 420V250M96 250H354M104 270H346"/></g>
  <path d="M0 360 H900 V420 H0Z" fill="#0f1414"/><path d="M0 360 H900" stroke="#c9a95c" stroke-opacity=".35"/>
  <g class="fighter" transform="translate(560 82) scale(1)">${fig}</g>
  <ellipse cx="610" cy="364" rx="70" ry="6" fill="#000" opacity=".5"/></svg>`;
}

export function render(ctx, app) {
  document.body.classList.add('scene');
  ctx.cleanup.push(() => document.body.classList.remove('scene'));
  const s = ctx.state, name = s.profile.name;
  const frame = (seq, u) => inkFigure(computeJoints(samplePose(sequenceById(seq), u).pose, 280));
  app.innerHTML = page('Accueil', `
  <section class="seuil">${sceneSvg(frame('garde', 0))}<div class="seuil-3d" id="seuil-3d" aria-hidden="true"></div>
    <div class="seuil-text"><span class="kicker">Atelier du mouvement martial</span><h1>Donnez forme au mouvement<span class="dot">.</span></h1>
    <p class="intro">${name ? `${esc(name)}, observez` : 'Observez'} un geste sous tous les angles, décomposez un combat, créez vos propres mouvements et assemblez-les en un style personnel.</p></div>
  </section>
  <div class="doors" role="navigation" aria-label="Les trois espaces">${SPACES.map(d => `<a class="door" href="#${d.id}"><span class="door-ico" aria-hidden="true">${d.icon}</span><b>${d.label}</b><small>${d.hint}</small>${d.soon ? '<em class="soon">bientôt</em>' : ''}</a>`).join('')}</div>
  ${s.activeSession ? '<p class="home-note">Une séance d’entraînement est en cours — <a href="#entrainement/seance">▶ la reprendre</a></p>' : ''}`);
  // Animation lente de la silhouette (désactivée si l'utilisateur réduit les animations).
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const g = $('.fighter'), host3d = $('#seuil-3d');
  import('./mannequin3d.js').then(async m => {
    if (!m.webglAvailable() || !host3d.isConnected) return;
    const stop = await m.mount3d(host3d, compose(SHADOW_FIGHT, sequences, 'Combat d’ombres'), {compact: true, transparent: true, height: host3d.clientHeight || 420, dims: m.dimsFromState(s)});
    if (!host3d.isConnected) return stop();
    ctx.cleanup.push(stop); g.style.display = 'none'; cancelAnimationFrame(raf); host3d.classList.add('on');
  }).catch(() => {}); let raf = 0, t0 = performance.now(), k = 0;
  const loop = t => {
    const seq = sequenceById(SCENE_SEQ[k % SCENE_SEQ.length]), dur = sequenceDuration(seq) * 2.2 + 900, u = Math.min(1, (t - t0) / (dur - 900));
    g.innerHTML = frame(seq.id, u);
    if (t - t0 > dur) { t0 = t; k++; }
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  ctx.cleanup.push(() => cancelAnimationFrame(raf));
}
