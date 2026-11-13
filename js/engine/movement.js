// Modèle de mouvement commun aux trois espaces (Visualiser, Analyser, Créer).
// Un mouvement EST une séquence du moteur (mêmes clés, mêmes poses) accompagnée de sa dimension, de son origine et de sa
// fiabilité : le lecteur 3D, la planche 2D, les enchaînements et le Creuset le lisent donc sans aucune conversion.
// Les mouvements personnels vivent dans state.movements (champ facultatif, validé par validMovement).
import {sequences, SEQUENCE_DIMENSION} from '../data/sequences.js';
import {ANGLE_KEYS, JOINT_NAMES, EASES} from './skeleton.js';
import {PRESETS, D3_KEYS} from './body3d.js';

export const DIMENSIONS = {deplacement: 'Déplacements', garde: 'Gardes et postures', defense: 'Défense', attaque: 'Attaque', transition: 'Transitions',
  enchainement: 'Enchaînements', distance: 'Gestion de la distance'};
export const MOVE_ORIGINS = {bibliotheque: 'Bibliothèque', creation: 'Créé à la main', creuset: 'Inventé par le Creuset', idee: 'Né d’une idée', video: 'Extrait d’une vidéo', adaptation: 'Adapté'};
// La fiabilité dit ce que vaut l'animation, jamais ce que vaut la technique : rien n'est validé par un enseignant.
export const RELIABILITY = {illustration: 'Illustration', personnel: 'Création personnelle', experimental: 'Idée non éprouvée', reconstruit: 'Reconstruit depuis une vidéo'};
export const LIMITS = {keys: 60, msMin: 20, msMax: 10000, movements: 300};
const BUILTIN_DATE = '2026-11-13T00:00:00.000Z';

const has = (o, k) => typeof k === 'string' && Object.hasOwn(o, k);
const str = (v, max) => typeof v === 'string' && v.length > 0 && v.length <= max;
const txt = (v, max) => typeof v === 'string' && v.length <= max;
const num = (v, lo, hi) => Number.isFinite(v) && v >= lo && v <= hi;
const opt = (v, ok) => v === undefined || ok(v);
const isDate = v => typeof v === 'string' && !Number.isNaN(Date.parse(v));
const clamp = (v, lo, hi, def) => Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : def;
const cut = (v, max) => typeof v === 'string' ? v.trim().slice(0, max) : '';
export const isBuiltin = id => sequences.some(s => s.id === id);

// Copie nettoyée d'une pose : seules les valeurs connues du moteur sont gardées, bornées ; rien n'est ajouté qui change la lecture.
function cleanPose(p) {
  const angles = {}, d3 = {};
  for (const a of ANGLE_KEYS) angles[a] = clamp(p?.angles?.[a], -360, 360, 0);
  for (const k of D3_KEYS) if (Number.isFinite(p?.d3?.[k])) d3[k] = clamp(p.d3[k], -1080, 1080, 0);
  return {x: clamp(p?.x, -2000, 2000, 0), lift: clamp(p?.lift, -200, 400, 0), ...(Number.isFinite(p?.z) ? {z: clamp(p.z, -2000, 2000, 0)} : {}), angles, ...(Object.keys(d3).length ? {d3} : {})};
}
// Une clé : une pose, la durée pour l'atteindre (sauf la première), et au besoin un rythme, une confiance (vidéo) ou la marque « interpolée ».
const cleanKey = (k, i) => ({label: cut(k?.label, 60) || `Étape ${i + 1}`, ...(i ? {ms: clamp(k?.ms, LIMITS.msMin, LIMITS.msMax, 500)} : {}), pose: cleanPose(k?.pose),
  ...(typeof k?.cue === 'string' ? {cue: k.cue.slice(0, 200)} : {}), ...(i && has(EASES, k?.ease) ? {ease: k.ease} : {}),
  ...(Number.isFinite(k?.confidence) ? {confidence: clamp(k.confidence, 0, 1, 0)} : {}), ...(typeof k?.interpolated === 'boolean' ? {interpolated: k.interpolated} : {})});

const validPose = p => Boolean(p) && typeof p === 'object' && num(p.x, -2000, 2000) && num(p.lift, -200, 400) && opt(p.z, v => num(v, -2000, 2000))
  && Boolean(p.angles) && typeof p.angles === 'object' && ANGLE_KEYS.every(a => num(p.angles[a], -360, 360))
  && opt(p.d3, d => Boolean(d) && typeof d === 'object' && !Array.isArray(d) && Object.entries(d).every(([k, v]) => D3_KEYS.includes(k) && num(v, -1080, 1080)));
const validKey = (k, i) => Boolean(k) && typeof k === 'object' && str(k.label, 60) && (i ? num(k.ms, LIMITS.msMin, LIMITS.msMax) : k.ms === undefined) && validPose(k.pose)
  && opt(k.cue, v => txt(v, 200)) && opt(k.ease, v => has(EASES, v)) && opt(k.confidence, v => num(v, 0, 1)) && opt(k.interpolated, v => typeof v === 'boolean');
export const validMovement = m => Boolean(m && typeof m === 'object' && m.v === 1 && str(m.id, 80) && str(m.name, 100) && has(PRESETS, m.style) && has(DIMENSIONS, m.dimension)
  && Array.isArray(m.keys) && m.keys.length >= 2 && m.keys.length <= LIMITS.keys && m.keys.every(validKey)
  && m.origin && typeof m.origin === 'object' && has(MOVE_ORIGINS, m.origin.type) && opt(m.origin.ref, v => str(v, 80)) && opt(m.origin.text, v => txt(v, 500)) && opt(m.origin.code, v => str(v, 20))
  && m.reliability && typeof m.reliability === 'object' && has(RELIABILITY, m.reliability.level) && opt(m.reliability.score, v => num(v, 0, 1)) && opt(m.reliability.note, v => txt(v, 300))
  && Array.isArray(m.parents) && m.parents.length <= 10 && m.parents.every(p => str(p, 80))
  && opt(m.track, t => Array.isArray(t) && t.length <= 6 && t.every(n => JOINT_NAMES.includes(n))) && opt(m.ground, g => typeof g === 'boolean') && opt(m.note, v => txt(v, 500))
  && isDate(m.createdAt) && isDate(m.updatedAt));

// Dimension proposée par défaut d'après le geste lui-même (l'utilisateur garde la main dans l'éditeur).
export function guessDimension(seq) {
  const keys = seq?.keys ?? [], p0 = keys[0]?.pose;
  if (!p0) return 'transition';
  const span = f => { const v = keys.map(k => k.pose?.[f] ?? 0); return Math.max(...v) - Math.min(...v); };
  const change = names => Math.max(0, ...keys.flatMap(k => names.map(a => Math.abs((k.pose?.angles?.[a] ?? 0) - (p0.angles?.[a] ?? 0)))));
  const arm = change(['leadShoulder', 'rearShoulder', 'leadElbow', 'rearElbow']), leg = change(['leadHip', 'rearHip', 'leadKnee', 'rearKnee']);
  if (arm >= 40 || leg >= 50) return 'attaque';
  if (Math.max(span('x'), span('z')) >= 15) return 'deplacement';
  return Math.max(arm, leg, change(['torso'])) < 12 ? 'garde' : 'transition';
}

// Constructeur unique : toute création, adaptation ou reprise passe par ici. Renvoie null s'il n'y a pas au moins deux clés.
export function createMovement(src = {}) {
  const keys = (Array.isArray(src?.keys) ? src.keys : []).slice(0, LIMITS.keys).map(cleanKey);
  if (keys.length < 2) return null;
  const now = new Date().toISOString(), o = src.origin ?? {}, r = src.reliability ?? {};
  const track = (Array.isArray(src.track) ? src.track : []).filter(n => JOINT_NAMES.includes(n)).slice(0, 6);
  return {v: 1, id: str(src.id, 80) ? src.id : crypto.randomUUID(), name: cut(src.name, 100) || 'Mouvement sans nom', style: has(PRESETS, src.style) ? src.style : 'boxe',
    dimension: has(DIMENSIONS, src.dimension) ? src.dimension : guessDimension({keys}), keys,
    origin: {type: has(MOVE_ORIGINS, o.type) ? o.type : 'creation', ...(str(o.ref, 80) ? {ref: o.ref} : {}), ...(cut(o.text, 500) ? {text: cut(o.text, 500)} : {}), ...(str(o.code, 20) ? {code: o.code} : {})},
    reliability: {level: has(RELIABILITY, r.level) ? r.level : 'personnel', ...(Number.isFinite(r.score) ? {score: clamp(r.score, 0, 1, 0)} : {}), ...(cut(r.note, 300) ? {note: cut(r.note, 300)} : {})},
    parents: (Array.isArray(src.parents) ? src.parents : []).filter(p => str(p, 80)).slice(0, 10),
    ...(track.length ? {track} : {}), ...(src.ground === true ? {ground: true} : {}), ...(cut(src.note, 500) ? {note: cut(src.note, 500)} : {}),
    createdAt: isDate(src.createdAt) ? src.createdAt : now, updatedAt: isDate(src.updatedAt) ? src.updatedAt : now};
}

// Geste du moteur vu comme un mouvement : même identifiant, même lecture, origine « bibliothèque ».
export const fromSequence = (seq, over = {}) => createMovement({...seq, style: seq.style ?? 'boxe', dimension: has(SEQUENCE_DIMENSION, seq.id) ? SEQUENCE_DIMENSION[seq.id] : undefined,
  origin: {type: 'bibliotheque'}, reliability: {level: 'illustration'}, createdAt: BUILTIN_DATE, updatedAt: BUILTIN_DATE, ...over});
// Geste rangé dans une méthode de l'atelier (ancien format) : il reste où il est, la bibliothèque le lit comme un mouvement.
export const fromGesture = (g, method) => createMovement({...g, origin: {type: g.code ? 'creuset' : 'creation', ref: method?.id, code: g.code},
  reliability: {level: g.code ? 'experimental' : 'personnel'}, createdAt: method?.createdAt, updatedAt: method?.createdAt});
// Copie de travail d'un mouvement : nouvel identifiant, le parent est noté. L'original n'est jamais touché.
export const adaptMovement = (m, over = {}) => createMovement({...m, id: undefined, name: `${m.name} (adapté)`.slice(0, 100), origin: {type: 'adaptation', ref: m.id},
  reliability: {level: 'personnel'}, parents: [m.id], createdAt: undefined, updatedAt: undefined, ...over});

// Enregistre (ou remplace) un mouvement personnel. Renvoie le mouvement gardé, ou null s'il est refusé (incomplet, ou limite atteinte).
export function saveMovement(state, src) {
  const m = createMovement({...src, id: isBuiltin(src?.id) ? undefined : src?.id, updatedAt: undefined});
  if (!m || !validMovement(m)) return null;
  const rest = (state.movements ?? []).filter(x => x.id !== m.id);
  if (rest.length >= LIMITS.movements) return null;
  state.movements = [...rest, m];
  return m;
}
// Retire un mouvement personnel, et son identifiant des enchaînements animés des méthodes.
export function removeMovement(state, id) {
  state.movements = (state.movements ?? []).filter(m => m.id !== id);
  for (const meth of state.workshop?.methods ?? []) for (const q of meth.sequences ?? []) if (q.anim) q.anim = q.anim.filter(a => a !== id);
}

let builtins = null;
// Bibliothèque commune (lecture seule) : gestes du moteur, mouvements personnels, puis gestes encore rangés dans les méthodes.
export function movementLibrary(state) {
  builtins ??= sequences.map(s => fromSequence(s));
  const out = [...builtins], seen = new Set(out.map(m => m.id));
  const push = m => { if (m && !seen.has(m.id)) { seen.add(m.id); out.push(m); } };
  for (const m of state?.movements ?? []) push(m);
  for (const meth of state?.workshop?.methods ?? []) for (const g of meth.gestures ?? []) push(fromGesture(g, meth));
  return out;
}
export const findMovement = (state, id) => movementLibrary(state).find(m => m.id === id) ?? null;
