// Moteur de transfert entre disciplines.
// Principe : chaque discipline est décrite par des facettes (garde, distances, déplacements, outils, règles)
// et par l'importance qu'elle donne à chaque compétence de l'arbre. Pour une paire source → cible, le moteur :
//   1. compare les facettes (ce qui change concrètement) ;
//   2. classe chaque compétence : transférable, à adapter (même compétence mais contexte différent),
//      risque d'interférence (habitude source contraire à la cible), à construire (absente de la source) ;
//   3. enrichit ce calcul avec des notes vérifiées (sources, niveau de fiabilité) ;
//   4. propose des exercices de transition et personnalise selon l'ancienneté et les traces de la personne.
// Les classements automatiques sont des déductions du modèle (fiabilité « expérimentale ») ; seules les notes
// sourcées peuvent porter une fiabilité supérieure. La science du transfert moteur indique un transfert souvent
// partiel et spécifique : le moteur reste prudent par construction.

// Facettes dont dépend chaque compétence (une différence sur ces facettes impose une adaptation).
export const SKILL_FACETS = {
  'appuis-posture': ['guard.orientation', 'guard.width', 'guard.weight'],
  'appuis-poids': ['guard.weight'],
  'appuis-pas': ['movement.lineaire', 'guard.width'],
  'appuis-pivot': ['movement.circulaire'],
  'appuis-lateral': ['movement.lateral', 'movement.circulaire'],
  'appuis-distance': ['distances', 'weapon'],
  'appuis-niveau': ['movement.niveau'],
  'action-direct': ['tools', 'weapon', 'guard.orientation'],
  'action-entree': ['movement.lineaire', 'weapon', 'distances'],
  'action-enchainement': ['tools', 'weapon'],
  'action-saisie': ['contact'], 'action-projection': ['contact'],
  'defense-garde': ['guard.handsHigh', 'weapon'],
  'defense-parade': ['weapon', 'tools'],
  'defense-esquive': ['guard.handsHigh', 'movement.niveau'],
  'defense-retrait': ['movement.lineaire'],
  'defense-sortie-ligne': ['movement.lateral', 'movement.circulaire'],
  'lecture-timing': ['weapon', 'distances'],
  'lecture-indices': ['weapon', 'contact']
};

const get = (d, path) => path.split('.').reduce((o, k) => o?.[k], d);

// Écarts de facettes entre deux disciplines, sous forme lisible.
export function facetDiffs(a, b, facets = {}) {
  const out = [];
  const label = path => {
    if (facets[path]) return facets[path].name;
    const [g, k] = path.split('.'), grp = facets[g] ?? facets[path.replace(/\.[^.]+$/, '')];
    return grp ? `${grp.name} : ${(grp.labels?.[k] ?? k).split(' (')[0].toLowerCase()}` : path;
  };
  for (const path of ['weapon', 'contact', 'guard.orientation', 'guard.width', 'guard.weight']) {
    const x = get(a, path), y = get(b, path);
    if (x !== undefined && y !== undefined && x !== y) out.push({path, label: label(path), from: x, to: y, size: 2});
  }
  const hx = get(a, 'guard.handsHigh'), hy = get(b, 'guard.handsHigh');
  if (Number.isFinite(hx) && Number.isFinite(hy) && Math.abs(hx - hy) >= 1) out.push({path: 'guard.handsHigh', label: label('guard.handsHigh'), from: hx, to: hy, size: Math.abs(hx - hy)});
  for (const group of ['movement', 'distances']) for (const k of Object.keys(b[group] ?? {})) {
    const x = a[group]?.[k] ?? 0, y = b[group][k];
    if (Math.abs(x - y) >= 1) out.push({path: `${group}.${k}`, label: label(`${group}.${k}`), from: x, to: y, size: Math.abs(x - y)});
  }
  const ta = new Set(a.tools ?? []), tb = new Set(b.tools ?? []);
  const gained = [...tb].filter(t => !ta.has(t)), lost = [...ta].filter(t => !tb.has(t));
  if (gained.length || lost.length) out.push({path: 'tools', label: label('tools'), from: [...ta].join(', '), to: [...tb].join(', '), size: gained.length + lost.length, gained, lost});
  return out;
}

// Une facette pèse sur une compétence si elle diffère d'au moins 2 (énumérations : toute différence compte 2).
function blockingDiffs(skillId, diffs) {
  const deps = SKILL_FACETS[skillId] ?? [];
  return diffs.filter(d => deps.some(p => d.path === p || d.path.startsWith(p + '.')) && d.size >= 2);
}

export function analyze({from, to, disciplines, notes = [], skills, facets = {}, years = null, status = null}) {
  const A = disciplines.find(d => d.id === from), B = disciplines.find(d => d.id === to);
  if (!A || !B || from === to) throw Error('Paire de disciplines invalide');
  const diffs = facetDiffs(A, B, facets);
  const byId = Object.fromEntries(skills.map(s => [s.id, s]));
  const res = {from: A, to: B, diffs, transfer: [], adapt: [], risk: [], build: [], general: []};
  const pairNotes = notes.filter(n => n.from === from && n.to === to);
  const ingrained = years !== null && years >= 5;
  for (const sk of skills.filter(s => s.branch !== 'spe' && s.branch !== 'trans')) {
    const a = A.skills?.[sk.id] ?? 0, b = B.skills?.[sk.id] ?? 0;
    const block = blockingDiffs(sk.id, diffs);
    const curated = pairNotes.filter(n => n.skill === sk.id);
    const mine = status?.[sk.id];
    const base = {skill: sk, a, b, diffs: block, notes: curated, worked: mine ? ['pratique', 'evalue', 'maitrise'].includes(mine.stage) : false, reliability: 'experimental'};
    let kind = null;
    if (a >= 2 && b >= 2) kind = block.length ? 'adapt' : 'transfer';
    else if (a >= 2 && b <= 1 && block.length) kind = 'risk';
    else if (a <= 1 && b >= 2) kind = 'build';
    else if (a >= 1 && b >= 1 && block.length) kind = 'adapt';
    // Une note vérifiée prime sur la déduction automatique quand elle classe autrement.
    const override = curated.find(n => n.kind);
    if (override) kind = {transfert: 'transfer', adaptation: 'adapt', risque: 'risk'}[override.kind] ?? kind;
    if (!kind) continue;
    const item = {...base, priority: b * 2 + (kind === 'risk' ? 2 : 0) + (ingrained && kind === 'risk' ? 2 : 0) - (base.worked ? 1 : 0)};
    if (override) item.reliability = override.reliability;
    res[kind].push(item);
  }
  // Notes sans compétence précise, et notes de compétences hors classement (ex. une note « risque » sur une compétence faible en source).
  res.general = pairNotes.filter(n => !n.skill || !byId[n.skill]);
  for (const k of ['transfer', 'adapt', 'risk', 'build']) res[k].sort((x, y) => y.priority - x.priority);
  res.ingrained = ingrained;
  return res;
}

// Plan de transition en trois temps, construit à partir de l'analyse (proposition à valider avec un enseignant).
export function transitionPlan(res) {
  const drillsOf = items => [...new Set(items.flatMap(i => [...i.notes.flatMap(n => n.drills ?? []), ...(i.skill.exercises ?? []).slice(0, 1), ...(i.skill.library ?? []).slice(0, 1)]))];
  const first = [...res.risk, ...res.adapt.filter(i => i.skill.branch === 'appuis' || i.skill.id === 'defense-garde')].slice(0, 5);
  const second = [...res.build, ...res.adapt.filter(i => !first.includes(i))].slice(0, 6);
  const third = res.transfer.slice(0, 5);
  return [
    {title: 'Reposer les bases de la nouvelle discipline', why: 'Les habitudes de garde, d’appuis et de déplacement sont les premières à interférer : on les reconstruit lentement, à vide puis avec un partenaire.', items: first, drills: drillsOf(first)},
    {title: 'Construire ce qui manque', why: 'Compétences importantes dans la discipline visée et peu sollicitées dans la discipline d’origine.', items: second, drills: drillsOf(second)},
    {title: 'Réinvestir ce qui se transfère', why: 'Distance, timing, lecture : à réutiliser consciemment une fois les bases posées, en situations encadrées.', items: third, drills: drillsOf(third)}
  ];
}
