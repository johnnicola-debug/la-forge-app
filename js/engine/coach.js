// Construction des séances à partir des programmes, et déroulé d'une séance guidée.
// Fonctions pures (testables) : le temps courant est toujours passé en paramètre.

export const REP_SECONDS = 4; // durée indicative d'une répétition, pour l'estimation seulement

// Choisit l'exercice faisable avec le matériel déclaré (sinon une alternative).
export function resolveExercise(id, byId, equipment) {
  const ok = ex => ex && ex.equipment.every(e => equipment.includes(e));
  const ex = byId[id];
  if (ok(ex)) return {exercise: ex, substituted: false};
  for (const alt of ex?.alternatives ?? []) if (ok(byId[alt])) return {exercise: byId[alt], substituted: true, original: ex};
  return {exercise: ex, substituted: false, missing: ex ? ex.equipment.filter(e => !equipment.includes(e)) : []};
}

const blockSeconds = b => b.sets * ((b.reps ? b.reps * REP_SECONDS + 10 : b.durationSec ?? 30) + (b.restSec ?? 0));
export const estimateSeconds = t => t.warmup.reduce((s, w) => s + w.durationSec, 0) + t.cooldown.reduce((s, w) => s + w.durationSec, 0)
  + t.main.reduce((s, b) => s + blockSeconds(b), 0);

// Adapte un modèle de séance au temps disponible : retire d'abord les blocs de priorité 3,
// puis 2, puis réduit le nombre de séries (jamais sous 1). Rien n'est ajouté.
export function fitTemplate(template, minutes) {
  const t = {...template, main: template.main.map(b => ({...b}))}, budget = minutes * 60 * 1.1, changes = [];
  for (const prio of [3, 2]) {
    while (estimateSeconds(t) > budget && t.main.some(b => b.priority === prio) && t.main.length > 1) {
      const i = t.main.findLastIndex(b => b.priority === prio);
      changes.push(`bloc retiré : ${t.main[i].exerciseId}`);
      t.main.splice(i, 1);
    }
  }
  while (estimateSeconds(t) > budget && t.main.some(b => b.sets > 1)) {
    const b = t.main.reduce((m, x) => x.sets > m.sets ? x : m);
    b.sets--; changes.push(`une série en moins : ${b.exerciseId}`);
  }
  // Dernier recours : raccourcir un long bloc minuté (jusqu'à la moitié de sa durée).
  for (const b of t.main.filter(x => x.durationSec >= 300)) {
    const excess = estimateSeconds(t) - budget;
    if (excess <= 0) break;
    const cut = Math.min(Math.ceil(excess / b.sets / 30) * 30, Math.floor(b.durationSec / 2 / 30) * 30);
    if (cut > 0) { b.durationSec -= cut; changes.push(`bloc raccourci : ${b.exerciseId}`); }
  }
  const seconds = estimateSeconds(t);
  return {template: t, changes, seconds, over: seconds > budget};
}

// Aplatit une séance en étapes guidées.
export function buildSteps(template, byId, equipment) {
  const steps = [], notes = [];
  const ex = id => { const r = resolveExercise(id, byId, equipment); if (r.substituted) notes.push(`${r.original.name} → ${r.exercise.name} (matériel)`); if (r.missing?.length) notes.push(`${r.exercise?.name ?? id} : matériel manquant`); return r.exercise; };
  for (const w of template.warmup) steps.push({kind: 'preparation', exerciseId: ex(w.exerciseId)?.id ?? w.exerciseId, durationSec: w.durationSec});
  template.main.forEach((b, bi) => {
    const e = ex(b.exerciseId);
    for (let s = 1; s <= b.sets; s++) {
      steps.push({kind: 'travail', exerciseId: e?.id ?? b.exerciseId, set: s, sets: b.sets, reps: b.reps ?? null, durationSec: b.reps ? null : b.durationSec, block: bi});
      const last = bi === template.main.length - 1 && s === b.sets;
      if (b.restSec && !last) steps.push({kind: 'repos', durationSec: b.restSec, block: bi});
    }
  });
  for (const c of template.cooldown) steps.push({kind: 'retour-au-calme', exerciseId: ex(c.exerciseId)?.id ?? c.exerciseId, durationSec: c.durationSec});
  return {steps, notes};
}

// ——— Déroulé ———
export function startRun({id, title, programId = null, templateId = null, steps, plannedMin, notes = []}, now) {
  return {id, title, programId, templateId, steps, plannedMin, notes, index: 0, startedAt: new Date(now).toISOString(),
    running: false, runSince: null, stepMs: 0, activeMs: 0, log: steps.map(() => null)};
}
const elapsedNow = (r, now) => r.running ? now - r.runSince : 0;
export const stepElapsed = (r, now) => r.stepMs + elapsedNow(r, now);
export const activeElapsed = (r, now) => r.activeMs + elapsedNow(r, now);
export function remaining(r, now) {
  const d = r.steps[r.index]?.durationSec;
  return d ? Math.max(0, Math.ceil(d - stepElapsed(r, now) / 1000)) : null;
}
export function play(r, now) { return r.running ? r : {...r, running: true, runSince: now}; }
export function pause(r, now) {
  if (!r.running) return r;
  const e = now - r.runSince;
  return {...r, running: false, runSince: null, stepMs: r.stepMs + e, activeMs: r.activeMs + e};
}
// Passe à l'étape suivante en consignant le résultat ({done, reps}). Le minuteur continue s'il tournait.
export function next(r, now, result = {done: true}) {
  const p = pause(r, now), log = [...p.log];
  log[p.index] = {...result, ms: Math.round(p.stepMs)};
  const moved = {...p, log, index: Math.min(p.index + 1, p.steps.length), stepMs: 0};
  return r.running && moved.index < moved.steps.length ? play(moved, now) : moved;
}
export function previous(r, now) {
  const p = pause(r, now);
  return {...p, index: Math.max(0, p.index - 1), stepMs: 0};
}
export const isOver = r => r.index >= r.steps.length;

// Résumé enregistré dans l'historique.
export function summarize(r, now, {effort = null, notes = '', status = 'terminee'} = {}) {
  const p = pause(r, now);
  const work = p.steps.map((s, i) => ({s, l: p.log[i]})).filter(x => x.s.kind === 'travail');
  const blocks = [];
  for (const {s, l} of work) {
    let b = blocks.find(x => x.block === s.block);
    if (!b) blocks.push(b = {block: s.block, exerciseId: s.exerciseId, sets: []});
    b.sets.push({planned: s.reps ?? s.durationSec, unit: s.reps ? 'rép.' : 's', done: Boolean(l?.done), reps: l?.reps ?? null});
  }
  return {id: p.id, title: p.title, programId: p.programId, templateId: p.templateId, startedAt: p.startedAt, endedAt: new Date(now).toISOString(),
    plannedMin: p.plannedMin, activeSec: Math.round(p.activeMs / 1000), effort, status, notes,
    blocks: blocks.map(({block, ...rest}) => rest)};
}

// Prochaine séance d'un programme : rotation A, B, C… selon les séances terminées de ce programme.
export function nextTemplate(program, history) {
  const done = history.filter(h => h.programId === program.id && h.status === 'terminee').length;
  return program.sessions[done % program.sessions.length];
}
export function programWeek(program, startedAt, now) {
  return Math.min(program.weeks, 1 + Math.floor((now - Date.parse(startedAt)) / (7 * 864e5)));
}
