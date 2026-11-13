// État local version 2 : validation, migration depuis la v1, sauvegardes.
// Rien n'est envoyé au serveur ; tout reste dans le navigateur (localStorage).

import {validBody} from './engine/body.js';
import {validMovement} from './engine/movement.js';
export const VERSION = 3;
export const KEY = 'la-forge.v3', KEY_V2 = 'la-forge.v2', KEY_V1 = 'la-forge.v1', BACKUP_KEY = 'la-forge.copies';
export const LIMIT = 1000;

export const ORIGINS = {declaree: 'Déclarée', mesuree: 'Mesurée dans l’application', verifiee: 'Vérifiée par un tiers', estimee: 'Estimation'};
export const EVAL_BY = {auto: 'Auto-évaluation', externe: 'Évaluation par un enseignant ou un pair qualifié', test: 'Test objectif'};
export const EXPERIENCE = {aucune: 'Aucune pratique martiale', debutant: 'Moins d’un an', intermediaire: '1 à 3 ans', confirme: 'Plus de 3 ans'};
export const EQUIPMENT = {'barre-traction': 'Barre de traction', elastique: 'Élastiques', halteres: 'Haltères', 'barre-olympique': 'Barre et disques',
  banc: 'Banc', kettlebell: 'Kettlebell', 'corde-a-sauter': 'Corde à sauter', tapis: 'Tapis', chaise: 'Chaise stable', mur: 'Mur dégagé'};
export const PERF_EXERCISES = {
  squat: {name: 'Squat', load: true}, bench: {name: 'Développé couché', load: true}, deadlift: {name: 'Soulevé de terre', load: true},
  pullup: {name: 'Tractions', load: false, assist: true}, dip: {name: 'Dips', load: false, assist: true},
  pushup: {name: 'Pompes', load: false}, ohp: {name: 'Développé militaire', load: true}, row: {name: 'Rowing', load: true}, autre: {name: 'Autre exercice', load: true}};
export const ASSIST = {aucune: 'Poids du corps', lest: 'Avec lest', elastique: 'Assistée (élastique)', machine: 'Assistée (machine)'};
export const SHARE_KEYS = {profile: 'Profil et disciplines', performances: 'Performances physiques', sessions: 'Séances', methods: 'Méthodes de l’atelier', observations: 'Observations'};
export const SHARE_LEVELS = {prive: 'Privé', guilde: 'Ma guilde', public: 'Public'};

export const initial = () => ({
  version: VERSION,
  profile: {name: '', goals: [], experience: 'aucune', disciplines: [], minutes: 30, perWeek: 2, equipment: [], constraints: '', adult: false},
  performances: [], measurements: [], observations: [], sessions: [], activeSession: null,
  program: null, library: {consulted: {}, practiced: {}}, workshop: {methods: []},
  sharing: Object.fromEntries(Object.keys(SHARE_KEYS).map(k => [k, 'prive'])), legacy: null,
  skills: {}, orientation: null, avatar: {emblem: 'cercle', title: ''}
});

const str = (v, max) => typeof v === 'string' && v.length <= max;
const optNum = (v, min, max) => v === null || (typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max);
const isDate = v => typeof v === 'string' && Number.isFinite(Date.parse(v));
const optDate = v => v === null || isDate(v);
const arr = (v, max = LIMIT) => Array.isArray(v) && v.length <= max;
const ids = v => arr(v, 200) && v.every(x => str(x, 80));

export function validPerformance(p) {
  return p && str(p.id, 80) && p.exercise in PERF_EXERCISES && str(p.variant, 80) && optNum(p.load, 0, 1000)
    && optNum(p.reps, 1, 1000) && optNum(p.sets, 1, 100) && p.assistance in ASSIST && optNum(p.extra, 0, 500)
    && optNum(p.bodyweight, 20, 400) && optDate(p.date) && str(p.context, 300) && p.origin in ORIGINS
    && (p.load !== null || p.reps !== null);
}

export function validMeasurement(m) {
  return m && str(m.id, 80) && str(m.test, 60) && optNum(m.value, -1e6, 1e6) && str(m.unit, 20) && m.origin in ORIGINS
    && isDate(m.date) && str(m.context ?? '', 300) && (m.details === undefined || typeof m.details === 'object');
}

function validSession(s) {
  return s && str(s.id, 80) && str(s.title, 120) && isDate(s.startedAt) && optDate(s.endedAt ?? null)
    && optNum(s.plannedMin, 0, 600) && optNum(s.activeSec ?? null, 0, 86400) && optNum(s.effort ?? null, 1, 10)
    && ['terminee', 'arretee', 'importee-v1'].includes(s.status) && arr(s.blocks ?? [], 100) && str(s.notes ?? '', 1000) && validBody(s.body);
}

// Geste créé dans l'éditeur de poses (mêmes règles que views/gesture.js, sans dépendre de la vue).
const ANGLES = ['torso', 'neck', 'leadShoulder', 'leadElbow', 'rearShoulder', 'rearElbow', 'leadHip', 'leadKnee', 'leadAnkle', 'rearHip', 'rearKnee', 'rearAnkle'];
const STYLES = ['boxe', 'escrime', 'karate', 'carre'];
export const validGesture = g => g && str(g.id, 80) && str(g.name, 100) && STYLES.includes(g.style) && arr(g.keys, 20) && g.keys.length >= 2
  && g.keys.every((k, i) => str(k.label, 60) && (i === 0 || (Number.isFinite(k.ms) && k.ms >= 50 && k.ms <= 5000))
    && ANGLES.every(a => Number.isFinite(k.pose?.angles?.[a]) && Math.abs(k.pose.angles[a]) <= 200)
    && (k.pose.d3 === undefined || (k.pose.d3 && typeof k.pose.d3 === 'object' && Object.values(k.pose.d3).every(Number.isFinite))));

// Séance composée librement (Entraînement > Composer).
export const validCustom = c => c && str(c.id, 80) && str(c.name, 80) && isDate(c.createdAt) && arr(c.blocks, 20) && c.blocks.length > 0
  && c.blocks.every(b => str(b.exerciseId, 80) && Number.isInteger(b.sets) && b.sets >= 1 && b.sets <= 10 && optNum(b.restSec ?? 0, 0, 600)
    && ((Number.isInteger(b.reps) && b.reps >= 1 && b.reps <= 200) || (Number.isFinite(b.durationSec) && b.durationSec >= 5 && b.durationSec <= 1800)));

export function validMethod(m) {
  return m && str(m.id, 80) && str(m.name, 100) && isDate(m.createdAt) && ['creation', 'adaptation', 'hybride'].includes(m.origin?.type)
    && (m.origin.sources === undefined || (arr(m.origin.sources, 3) && m.origin.sources.every(x => str(x.id, 40) && optNum(x.weight, 0, 1))))
    && str(m.origin.discipline ?? '', 100) && str(m.intentions ?? '', 2000) && str(m.context ?? '', 2000)
    && arr(m.elements, 300) && m.elements.every(e => str(e.label, 120) && ['a-explorer', 'en-travail', 'retenu', 'ecarte'].includes(e.status)
      && (e.after === undefined || ids(e.after)) && (e.practice === undefined || (arr(e.practice, 500) && e.practice.every(isDate))))
    && arr(m.sequences, 100) && m.sequences.every(q => str(q.name, 100) && ids(q.steps) && (q.anim === undefined || ids(q.anim)))
    && arr(m.trials) && m.trials.every(t => isDate(t.date) && str(t.text, 2000))
    && arr(m.decisions) && m.decisions.every(d => isDate(d.date) && str(d.text, 1000))
    && (m.gestures === undefined || (arr(m.gestures, 30) && m.gestures.every(validGesture)));
}

export function validState(s) {
  const p = s?.profile;
  return s?.version === VERSION && p && str(p.name, 80) && ids(p.goals) && p.experience in EXPERIENCE
    && arr(p.disciplines, 20) && p.disciplines.every(d => str(d.name, 80) && optNum(d.years, 0, 80))
    && [20, 30, 45, 60].includes(p.minutes) && Number.isInteger(p.perWeek) && p.perWeek >= 1 && p.perWeek <= 6
    && ids(p.equipment) && p.equipment.every(e => e in EQUIPMENT) && str(p.constraints, 1000) && typeof p.adult === 'boolean'
    && (p.sex === undefined || ['', 'f', 'h'].includes(p.sex)) && (p.birthYear === undefined || optNum(p.birthYear, 1900, 2100))
    && arr(s.performances) && s.performances.every(validPerformance)
    && arr(s.measurements) && s.measurements.every(validMeasurement)
    && arr(s.observations) && s.observations.every(o => isDate(o.date) && str(o.text, 1000))
    && arr(s.sessions) && s.sessions.every(validSession)
    && (s.program === null || (str(s.program.id, 80) && isDate(s.program.startedAt)))
    && s.library && typeof s.library.consulted === 'object' && typeof s.library.practiced === 'object'
    && Object.values(s.library.consulted).every(isDate) && Object.values(s.library.practiced).every(v => arr(v) && v.every(isDate))
    && arr(s.workshop?.methods, 50) && s.workshop.methods.every(validMethod)
    && s.sharing && Object.keys(SHARE_KEYS).every(k => s.sharing[k] in SHARE_LEVELS)
    && validSkills(s.skills) && validOrientation(s.orientation)
    && s.avatar && typeof s.avatar === 'object' && str(s.avatar.emblem ?? '', 30) && str(s.avatar.title ?? '', 60)
    && (s.custom === undefined || (arr(s.custom, 30) && s.custom.every(validCustom)))
    && (s.movements === undefined || (arr(s.movements, 300) && s.movements.every(validMovement)));
}

export function validSkills(sk) {
  if (!sk || typeof sk !== 'object' || Array.isArray(sk) || Object.keys(sk).length > 300) return false;
  return Object.entries(sk).every(([id, v]) => str(id, 80) && v && typeof v === 'object'
    && optDate(v.discovered ?? null) && optDate(v.studied ?? null)
    && arr(v.practice ?? []) && (v.practice ?? []).every(isDate)
    && arr(v.evaluations ?? [], 200) && (v.evaluations ?? []).every(e => isDate(e.date) && e.by in EVAL_BY
      && [1, 2, 3].includes(e.level) && str(e.evaluator ?? '', 100) && str(e.note ?? '', 500)));
}

function validOrientation(o) {
  if (o === null) return true;
  return o && isDate(o.completedAt) && typeof o.answers === 'object' && o.affinities && typeof o.affinities === 'object'
    && Object.values(o.affinities).every(v => typeof v === 'number' && v >= 0 && v <= 1);
}

// Migration v1 → v2. Les curseurs de capacités v1 ne sont pas convertis en données :
// ils sont conservés à part (legacy) comme simple ressenti déclaré historique.
export function migrate(old) {
  if (old?.version === VERSION) return old;
  if (old?.version === 2) return {...old, version: VERSION, skills: {}, orientation: null, avatar: {emblem: 'cercle', title: ''}};
  if (old?.version !== 1) throw Error('Version de sauvegarde inconnue');
  const s = initial();
  const p = old.profile ?? {};
  s.profile.name = String(p.name ?? '').slice(0, 80);
  s.profile.experience = p.level === 'Régulier' ? 'debutant' : 'aucune';
  s.profile.minutes = 30;
  s.profile.perWeek = Math.min(6, Math.max(1, Number(p.days) || 2));
  s.profile.adult = Boolean(p.ready);
  s.observations = (old.observations ?? []).map(o => ({id: crypto.randomUUID(), date: o.date, text: String(o.text).slice(0, 1000)}));
  s.sessions = (old.history ?? []).map(h => ({id: h.id, title: `Séance v0.1 · ${h.category}`, startedAt: h.date, endedAt: h.date,
    plannedMin: h.minutes, activeSec: null, effort: h.effort, status: 'importee-v1', blocks: [], notes: ''}));
  const map = {garde: 'garde', pas: 'pas-glisse', direct: 'direct-avant'};
  for (const id of old.studied ?? []) s.library.consulted[map[id] ?? id] = new Date().toISOString();
  s.legacy = {from: 1, migratedAt: new Date().toISOString(), goal: p.goal ?? null, declaredFeelings: old.capacities ?? null};
  return s; // déjà au format courant
}

export function load(storage) {
  const read = k => { try { return storage.getItem(k); } catch { return null; } };
  const raw = read(KEY);
  if (raw) {
    try { const s = JSON.parse(raw); if (validState(s)) return {state: s, issue: null}; } catch {}
    return {state: initial(), issue: 'illisible'};
  }
  for (const [k, label] of [[KEY_V2, 'v2 → v3'], [KEY_V1, 'v1 → v3']]) {
    const old = read(k);
    if (!old) continue;
    try {
      const s = migrate(JSON.parse(old));
      if (validState(s)) { backup(storage, old, `Avant migration ${label}`); return {state: s, issue: 'migre'}; }
    } catch {}
    return {state: initial(), issue: 'ancienne-illisible'};
  }
  return {state: initial(), issue: null};
}

export function save(storage, state) {
  try { storage.setItem(KEY, JSON.stringify(state)); return true; } catch { return false; }
}

// Copies de sécurité locales (5 dernières), prises avant une migration, un import ou un effacement.
export function backup(storage, raw, reason) {
  try {
    const list = JSON.parse(storage.getItem(BACKUP_KEY) ?? '[]');
    list.unshift({date: new Date().toISOString(), reason, raw: typeof raw === 'string' ? raw : JSON.stringify(raw)});
    storage.setItem(BACKUP_KEY, JSON.stringify(list.slice(0, 5)));
    return true;
  } catch { return false; }
}
export function backups(storage) { try { return JSON.parse(storage.getItem(BACKUP_KEY) ?? '[]'); } catch { return []; } }

// Import d'un fichier exporté (v1 ou v2).
export function parseImport(text) {
  const data = JSON.parse(text);
  const s = data?.version !== VERSION ? migrate(data) : data;
  if (!validState(s)) throw Error('Sauvegarde invalide');
  return s;
}

export const uid = () => crypto.randomUUID();
export const pushLimited = (list, item) => { list.unshift(item); list.length = Math.min(list.length, LIMIT); return list; };
