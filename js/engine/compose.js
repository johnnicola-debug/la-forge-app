// Enchaînements animés : coller plusieurs séquences du moteur bout à bout.
// Chaque séquence garde ses réglages 3D (style) ; les positions avancent de l'une à l'autre (pas de retour en arrière).
import {PRESETS} from './body3d.js';

export const TRANSITION_MS = 450;

export function compose(ids, sequences, name = 'Enchaînement') {
  const parts = ids.map(id => sequences.find(s => s.id === id)).filter(Boolean);
  if (!parts.length) return null;
  const keys = [];
  let offset = 0, turned = 0, side = 0;
  parts.forEach((seq, n) => {
    const style = PRESETS[seq.style] ?? PRESETS.boxe;
    if (n) { offset = keys.at(-1).pose.x - (seq.keys[0].pose.x ?? 0); turned = keys.at(-1).pose.d3.face ?? 0; side = (keys.at(-1).pose.z ?? 0) - (seq.keys[0].pose.z ?? 0); }
    seq.keys.forEach((k, i) => {
      if (n && i === 0) { keys.push({label: `→ ${k.label}`, ms: TRANSITION_MS, cue: `Transition vers : ${seq.name}.`, pose: shift(k.pose, offset, style, turned, side)}); return; }
      keys.push({label: k.label, ms: i ? k.ms : undefined, cue: k.cue, ...(k.ease ? {ease: k.ease} : {}), pose: shift(k.pose, offset, style, turned, side)});
    });
  });
  return {id: 'compo', name, style: parts[0].style, track: ['leadWrist', 'leadToe'], keys, parts: parts.map(p => p.id)};
}
// La première clé de chaque séquence suivante démarre là où la précédente s'est arrêtée.
function shift(pose, offset, style, turned = 0, side = 0) {
  const d3 = {...style, ...pose.d3}, z = (pose.z ?? 0) + side;
  return {...pose, x: (pose.x ?? 0) + offset, ...(pose.z !== undefined || z ? {z} : {}), d3: {...d3, face: (d3.face ?? 0) + turned}};
}
