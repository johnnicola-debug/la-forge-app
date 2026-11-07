// Sons de LA FORGE, entièrement synthétisés dans le navigateur (Web Audio) : aucun fichier sonore, donc aucune licence à vérifier.
// Coupés par défaut ; le navigateur n'autorise le son qu'après un geste de la personne (clic sur un bouton).
// Réglages gardés dans ce navigateur (clé séparée des données d'entraînement).

const KEY = 'la-forge.son';
let ac = null, master = null, ambient = null;
export const prefs = (() => { try { return {ui: false, ambient: false, ...JSON.parse(localStorage.getItem(KEY) || '{}')}; } catch { return {ui: false, ambient: false}; } })();
const keep = () => { try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch { /* stockage indisponible : réglage pour cette visite seulement */ } };

function audio() {
  if (!ac) {
    const AC = window.AudioContext ?? window.webkitAudioContext;
    if (!AC) return null;
    ac = new AC(); master = ac.createGain(); master.gain.value = 0.8; master.connect(ac.destination);
  }
  if (ac.state === 'suspended') ac.resume();
  return ac;
}
function noise(seconds) {
  const b = ac.createBuffer(1, Math.ceil(ac.sampleRate * seconds), ac.sampleRate), d = b.getChannelData(0);
  for (let i = 0, last = 0; i < d.length; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }   // bruit « brun » (doux)
  return b;
}

// Bloc de bois : navigation.
export function tick() {
  if (!prefs.ui || !audio()) return;
  const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(880, t); o.frequency.exponentialRampToValueAtTime(520, t + 0.07);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.18, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
  o.connect(g).connect(master); o.start(t); o.stop(t + 0.14);
}

// Gong : une progression enregistrée (pratique, évaluation, geste créé).
export function gong() {
  if (!prefs.ui || !audio()) return;
  const t = ac.currentTime;
  for (const [ratio, amp, dur] of [[1, 0.22, 3.2], [2.76, 0.09, 2.2], [5.4, 0.05, 1.4], [8.93, 0.025, 0.9]]) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.frequency.value = 98 * ratio; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(amp, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(master); o.start(t); o.stop(t + dur + 0.05);
  }
}

// Ambiance : bourdon grave qui respire et souffle de vent filtré.
export function startAmbient() {
  if (ambient || !audio()) return;
  const t = ac.currentTime, out = ac.createGain(); out.gain.setValueAtTime(0.0001, t); out.gain.exponentialRampToValueAtTime(0.07, t + 3); out.connect(master);
  const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420; lp.connect(out);
  const oscs = [55, 82.5, 110.4].map((f, i) => { const o = ac.createOscillator(); o.type = i ? 'sine' : 'triangle'; o.frequency.value = f; o.detune.value = i * 4; o.connect(lp); o.start(); return o; });
  const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = 0.07; lg.gain.value = 160; lfo.connect(lg).connect(lp.frequency); lfo.start();
  const wind = ac.createBufferSource(); wind.buffer = noise(4); wind.loop = true;
  const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 700; bp.Q.value = 0.7;
  const wg = ac.createGain(); wg.gain.value = 0.35; wind.connect(bp).connect(wg).connect(out); wind.start();
  const wl = ac.createOscillator(), wlg = ac.createGain(); wl.frequency.value = 0.11; wlg.gain.value = 0.25; wl.connect(wlg).connect(wg.gain); wl.start();
  ambient = {out, nodes: [...oscs, lfo, wind, wl]};
}
export function stopAmbient() {
  if (!ambient) return;
  const {out, nodes} = ambient, t = ac.currentTime; ambient = null;
  out.gain.cancelScheduledValues(t); out.gain.setValueAtTime(out.gain.value, t); out.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
  setTimeout(() => nodes.forEach(n => { try { n.stop(); } catch { /* déjà arrêté */ } }), 1400);
}

export function set(name, on) {
  prefs[name] = on; keep();
  if (name === 'ambient') on ? startAmbient() : stopAmbient();
  if (name === 'ui' && on) tick();
}
