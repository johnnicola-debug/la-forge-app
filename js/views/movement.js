// Visualiseur de séquence réutilisable : planche d'étude, frise des phases, lecture lente, pas à pas, comparaison.
import {study, thumb} from '../engine/render.js';
import {keyPositions, sequenceDuration} from '../engine/skeleton.js';
import {sequences, sequenceById} from '../data/sequences.js';
import {$, esc} from '../ui.js';

// Monte le visualiseur dans `host`. Renvoie une fonction d'arrêt.
export function mountViewer(host, seqId, {compact = false, id = 'v'} = {}) {
  const seq = sequenceById(seqId);
  if (!seq) { host.innerHTML = '<p class="empty">Aucune illustration pour cette fiche.</p>'; return () => {}; }
  const keys = keyPositions(seq);
  const st = {u: 0, phase: 0, mode: 'superpose', speed: 0.5, playing: false, ghosts: true, tracks: true, com: false, compare: '', raf: 0, last: 0};
  host.innerHTML = `<div class="study-wrap"><div class="stage"></div>
    <div class="timeline">${seq.keys.map((k, i) => `<button data-key="${i}" aria-pressed="${i === 0}">${esc(k.label)}</button>`).join('')}<span class="bar"></span></div>
    ${compact ? '' : `<div class="strip">${seq.keys.map((k, i) => `<button data-key="${i}" aria-label="Phase ${i + 1} : ${esc(k.label)}" aria-pressed="${i === 0}">${thumb(seq, i, `${id}t${i}`)}</button>`).join('')}</div>`}
    <div class="controls">
      <button data-act="prev" aria-label="Phase précédente">◀</button><button data-act="play">Lire</button><button data-act="next" aria-label="Phase suivante">▶</button>
      <label>Vitesse <select data-act="speed"><option value="0.25">× 0,25</option><option value="0.5" selected>× 0,5</option><option value="1">× 1</option></select></label>
      <input type="range" min="0" max="1000" value="0" aria-label="Position dans le mouvement" data-act="scrub">
      ${compact ? '' : `<label>Vue <select data-act="mode"><option value="superpose">Superposée</option><option value="etale">Étalée</option></select></label>
      <label><input type="checkbox" data-act="ghosts" checked> Fantômes</label><label><input type="checkbox" data-act="tracks" checked> Trajectoires</label><label><input type="checkbox" data-act="com"> Centre de masse</label>
      <label>Comparer <select data-act="compare"><option value="">—</option>${sequences.filter(s => s.id !== seq.id).map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></label>`}
    </div><p class="subtle cue"></p></div>`;
  const stage = $('.stage', host), cue = $('.cue', host), scrub = $('[data-act=scrub]', host), playBtn = $('[data-act=play]', host);
  const draw = () => {
    const r = study(seq, {u: st.u, mode: st.mode, ghosts: st.ghosts, tracks: st.tracks, compare: st.compare ? sequenceById(st.compare) : null, com: st.com, id, height: compact ? 300 : 340});
    stage.innerHTML = r.svg;
    st.phase = r.phase;
    host.querySelectorAll('[data-key]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.key) === r.phase)));
    $('.bar', host).style.width = `${st.u * 100}%`;
    scrub.value = Math.round(st.u * 1000);
    const k = seq.keys[r.phase];
    cue.innerHTML = `<strong>${esc(k.label)}</strong> · ${esc(k.cue ?? '')}${st.compare ? ` <span class="pill verm">Comparaison : ${esc(sequenceById(st.compare).name)} (contour vermillon)</span>` : ''}`;
  };
  const stop = () => { st.playing = false; cancelAnimationFrame(st.raf); playBtn.textContent = 'Lire'; };
  const tick = t => {
    if (!st.playing) return;
    const dt = st.last ? t - st.last : 0; st.last = t;
    st.u += dt * st.speed / sequenceDuration(seq);
    if (st.u >= 1) { st.u = 1; draw(); stop(); return; }
    draw(); st.raf = requestAnimationFrame(tick);
  };
  host.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.key) { stop(); st.u = keys[Number(b.dataset.key)]; draw(); }
    const act = b.dataset.act;
    if (act === 'play') { if (st.playing) stop(); else { if (st.u >= 1) st.u = 0; st.playing = true; st.last = 0; playBtn.textContent = 'Pause'; st.raf = requestAnimationFrame(tick); } }
    if (act === 'prev' || act === 'next') { stop(); const i = Math.max(0, Math.min(keys.length - 1, st.phase + (act === 'next' ? 1 : -1))); st.u = keys[i]; draw(); }
  });
  host.addEventListener('input', e => {
    const a = e.target.dataset.act;
    if (a === 'scrub') { stop(); st.u = Number(e.target.value) / 1000; }
    if (a === 'speed') st.speed = Number(e.target.value);
    if (a === 'mode') st.mode = e.target.value;
    if (a === 'ghosts') st.ghosts = e.target.checked;
    if (a === 'tracks') st.tracks = e.target.checked;
    if (a === 'com') st.com = e.target.checked;
    if (a === 'compare') st.compare = e.target.value;
    draw();
  });
  draw();
  return stop;
}

// Figure fixe (pour l'accueil, la séance…).
export const still = (seqId, u = 0.5, id = 'still', opts = {}) => study(sequenceById(seqId), {u, id, ...opts}).svg;
