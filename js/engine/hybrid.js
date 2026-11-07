// Style hybride : composer un style qui n'existe pas encore à partir de 2 ou 3 disciplines pondérées.
// Le calcul part des facettes et des notes de compétences des disciplines (estimations « expérimentales »,
// voir data/disciplines.js) : il propose une base de travail, jamais un style validé ou efficace.
import {facetDiffs} from './transfer.js';
import {PRESETS} from './body3d.js';

const get = (o, p) => p.split('.').reduce((x, k) => x?.[k], o);
// Noms de disciplines employés dans la bibliothèque → identifiants des disciplines.
export const ENTRY_DISC = {'boxe anglaise': 'boxe', escrime: 'escrime', 'jiu-jitsu brésilien': 'jjb', judo: 'judo', 'karaté': 'karate', lutte: 'lutte', 'muay-thaï': 'muay-thai'};
const ENUMS = ['weapon', 'contact', 'guard.orientation', 'guard.width', 'guard.weight'];
// Garde 3D la plus proche de chaque discipline (moteur body3d).
export const STYLE_OF = {boxe: 'boxe', escrime: 'escrime', karate: 'karate', 'muay-thai': 'carre', judo: 'carre', lutte: 'carre', jjb: 'carre'};

export function hybridize({sources, disciplines, skills, facets = {}, entries = []}) {
  const ds = sources.map(s => ({...s, d: disciplines.find(x => x.id === s.id)})).filter(s => s.d && s.weight > 0);
  if (new Set(ds.map(s => s.id)).size < 2) throw new Error('Il faut au moins deux disciplines différentes.');
  const total = ds.reduce((a, s) => a + s.weight, 0);
  ds.forEach(s => { s.w = s.weight / total; });
  const lead = [...ds].sort((a, b) => b.w - a.w)[0];

  // Importance de chaque compétence dans le mélange (moyenne pondérée des notes 0–3).
  const base = skills.filter(k => !['spe', 'trans'].includes(k.branch));
  const emphasis = base.map(k => {
    const v = ds.map(s => s.d.skills[k.id] ?? 0);
    return {skill: k, value: ds.reduce((a, s, i) => a + s.w * v[i], 0), max: Math.max(...v), min: Math.min(...v),
      from: ds.filter((s, i) => v[i] === Math.max(...v)).map(s => s.id)};
  }).sort((a, b) => b.value - a.value);
  const emph = Object.fromEntries(emphasis.map(e => [e.skill.id, e.value]));

  // Garde de synthèse : accord, ou valeur de la discipline dominante avec les autres options à trancher.
  const guard = ENUMS.map(path => {
    const vals = ds.map(s => ({id: s.id, v: get(s.d, path)})), distinct = [...new Set(vals.map(x => x.v))];
    const lab = v => facets[path]?.labels?.[v] ?? v;
    return {path, name: facets[path]?.name ?? path, agreed: distinct.length === 1, choice: get(lead.d, path), choiceLabel: lab(get(lead.d, path)),
      options: distinct.map(v => ({value: v, label: lab(v), from: vals.filter(x => x.v === v).map(x => x.id)}))};
  });
  const mean = path => Math.round(ds.reduce((a, s) => a + s.w * (get(s.d, path) ?? 0), 0) * 2) / 2;
  const scales = {handsHigh: mean('guard.handsHigh'),
    distances: Object.fromEntries(['longue', 'moyenne', 'courte', 'corps'].map(k => [k, mean('distances.' + k)])),
    movement: Object.fromEntries(['lineaire', 'lateral', 'circulaire', 'niveau'].map(k => [k, mean('movement.' + k)]))};
  const tools = [...new Set(ds.flatMap(s => s.d.tools ?? []))];

  // Ce que chaque discipline apporte en propre (forte chez elle, faible chez une autre).
  const apports = emphasis.filter(e => e.max >= 3 && e.min <= 1).map(e => ({skill: e.skill, from: e.from}));
  // Points de friction : facettes très différentes entre deux sources (habitudes qui se contredisent).
  const seen = new Set(), frictions = [];
  for (let i = 0; i < ds.length; i++) for (let k = i + 1; k < ds.length; k++)
    for (const d of facetDiffs(ds[i].d, ds[k].d, facets)) if (d.size >= 2 && !seen.has(d.path)) {
      seen.add(d.path); frictions.push({...d, between: [ds[i].id, ds[k].id]});
    }

  // Techniques candidates : fiches des disciplines sources, classées par l'importance de leurs compétences,
  // puis ordonnées du plus simple au plus avancé ; chaque fiche suit la précédente de la même famille (chaîne).
  // Les fiches transversales (fondamentaux communs) entrent aussi, un peu moins prioritaires.
  const ids = new Set(ds.map(s => s.id)), discOf = e => (e.disciplines ?? []).map(d => ENTRY_DISC[d] ?? d);
  const scored = entries.filter(e => discOf(e).some(d => ids.has(d) || d === 'transversal'))
    .map(e => ({entry: e, score: (discOf(e).includes('transversal') ? 0.8 : 1) * (e.skills ?? []).reduce((a, k) => a + (emph[k] ?? 0), 0) / Math.max(1, (e.skills ?? []).length)}))
    .sort((a, b) => b.score - a.score).slice(0, 12)
    .sort((a, b) => (a.entry.level ?? 1) - (b.entry.level ?? 1) || b.score - a.score);
  const lastOfFamily = {};
  const techniques = scored.map(t => { const after = lastOfFamily[t.entry.family] ? [lastOfFamily[t.entry.family]] : []; lastOfFamily[t.entry.family] = t.entry.id; return {...t, after}; });

  // Garde 3D : mélange pondéré des réglages des styles sources.
  const d3 = {};
  for (const k of Object.keys(PRESETS.boxe)) d3[k] = Math.round(ds.reduce((a, s) => a + s.w * PRESETS[STYLE_OF[s.id] ?? 'boxe'][k], 0));

  return {sources: ds.map(s => ({id: s.id, name: s.d.name, weight: Math.round(s.w * 100) / 100})), lead: lead.id,
    piliers: emphasis.filter(e => e.value >= 2.2).slice(0, 8), emphasis, guard, scales, tools, apports, frictions, techniques, d3,
    reliability: 'experimental'};
}

// Nom de travail proposé (le pratiquant le change).
export const draftName = res => `Style ${res.sources.map(s => s.name.split(' ')[0]).join('-')}`;
