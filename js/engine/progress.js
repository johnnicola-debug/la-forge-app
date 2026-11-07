// État de progression de chaque nœud de l'arbre, calculé uniquement à partir de traces réelles.
// Étapes : découvert → étudié → pratiqué → évalué → maîtrisé (niveau constaté par une personne qualifiée).
// Une auto-évaluation reste une auto-évaluation : elle ne rend jamais un nœud « maîtrisé ».

export const STAGES = ['inconnu', 'decouvert', 'etudie', 'pratique', 'evalue', 'maitrise'];
export const STAGE_LABEL = {inconnu: 'À découvrir', decouvert: 'Découvert', etudie: 'Étudié', pratique: 'Pratiqué', evalue: 'Évalué', maitrise: 'Maîtrise constatée'};
const rank = st => STAGES.indexOf(st);

// Index des liens fiches ↔ nœuds et exercices ↔ nœuds, construit une fois.
export function buildIndex(skills, entries, exercises, capacityToSkill) {
  const libraryOf = {}, exerciseOf = {};
  for (const sk of skills) { libraryOf[sk.id] = new Set(sk.library); exerciseOf[sk.id] = new Set(sk.exercises); }
  for (const e of entries) for (const id of e.skills ?? []) libraryOf[id]?.add(e.id);
  for (const ex of exercises) for (const c of ex.capacities) { const id = capacityToSkill[c]; if (id) exerciseOf[id]?.add(ex.id); }
  return {libraryOf, exerciseOf};
}

// Données mesurées liées à un nœud (performances, tests, réaction).
export function measuresFor(node, state) {
  const out = [];
  for (const ref of node.tests ?? []) {
    const [kind, id] = ref.split(':');
    if (kind === 'perf') out.push(...state.performances.filter(p => p.exercise === id).map(p => ({ref, date: p.date ?? p.createdAt, origin: p.origin, item: p})));
    else out.push(...state.measurements.filter(m => m.test === id).map(m => ({ref, date: m.date, origin: m.origin, item: m})));
  }
  return out.sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

export function nodeStatus(node, state, index) {
  const own = state.skills[node.id] ?? {};
  const libs = [...(index.libraryOf[node.id] ?? [])], exs = index.exerciseOf[node.id] ?? new Set();
  const consulted = libs.map(id => state.library.consulted[id]).filter(Boolean).sort();
  const practice = [...(own.practice ?? [])];
  for (const id of libs) practice.push(...(state.library.practiced[id] ?? []));
  for (const s of state.sessions) {
    if (s.status === 'importee-v1') continue;
    if (s.blocks.some(b => exs.has(b.exerciseId) && b.sets.some(x => x.done))) practice.push(s.startedAt);
  }
  practice.sort().reverse();
  const evaluations = own.evaluations ?? [];
  const external = evaluations.filter(e => e.by === 'externe'), self = evaluations.filter(e => e.by === 'auto'), tests = evaluations.filter(e => e.by === 'test');
  const measures = measuresFor(node, state);
  const mastery = external.length ? Math.max(...external.map(e => e.level)) : null;
  const studied = own.studied ?? consulted[0] ?? null;
  let stage = 'inconnu';
  if (own.discovered || consulted.length) stage = 'decouvert';
  if (studied) stage = 'etudie';
  if (practice.length) stage = 'pratique';
  // Seule une mesure ou un test objectif fait passer à « évalué » ; l'auto-évaluation reste un marqueur à part.
  if (tests.length || measures.length) stage = 'evalue';
  if (mastery) stage = 'maitrise';
  return {stage, studied, studiedAuto: !own.studied && Boolean(consulted[0]), practiceCount: practice.length, lastPractice: practice[0] ?? null,
    self, external, tests, measures, mastery, selfLevel: self.length ? self[0].level : null, libs, exercises: [...exs]};
}

// Un nœud est « disponible » quand chacun de ses prérequis a au moins été pratiqué.
export function computeAll(skills, state, index) {
  const status = Object.fromEntries(skills.map(sk => [sk.id, nodeStatus(sk, state, index)]));
  for (const sk of skills) {
    const st = status[sk.id];
    st.available = sk.prerequisites.every(p => rank(status[p]?.stage ?? 'inconnu') >= rank('pratique'));
    if (st.stage === 'inconnu' && st.available) st.stage = 'decouvert';
  }
  return status;
}

export function branchSummary(skills, status) {
  const out = {};
  for (const sk of skills) {
    const b = out[sk.branch] ??= {total: 0, ...Object.fromEntries(STAGES.map(s => [s, 0]))};
    b.total++; b[status[sk.id].stage]++;
  }
  return out;
}

// Ajoute une trace à un nœud (copie défensive, renvoie le nouvel objet skills).
export function addTrace(skillsState, id, kind, payload = {}) {
  const now = new Date().toISOString();
  const cur = {practice: [], evaluations: [], ...(skillsState[id] ?? {})};
  if (kind === 'discover') cur.discovered ??= now;
  if (kind === 'study') cur.studied = now;
  if (kind === 'practice') cur.practice = [now, ...cur.practice].slice(0, 500);
  if (kind === 'evaluate') cur.evaluations = [{date: now, ...payload}, ...cur.evaluations].slice(0, 200);
  return {...skillsState, [id]: cur};
}
