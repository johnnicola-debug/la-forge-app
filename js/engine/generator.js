// Générateur de techniques : invente des enchaînements à partir des gestes réels du moteur, en les recombinant
// et en les transformant (rotation, niveau, hauteur, feinte, vitesse, bras inversés, garde d'une autre discipline).
// Chaque proposition est filtrée par l'équilibre (centre de masse au-dessus des appuis au départ, à l'arrivée et
// pendant les appuis au sol) et notée en nouveauté (distance aux gestes connus). Ce sont des idées à éprouver,
// jamais des techniques validées. Une graine (code) permet de retrouver exactement la même technique.
import {ANGLE_KEYS, validSequence} from './skeleton.js';
import {PRESETS, D3_KEYS, joints3d, bodyDims, extrasOf, centerOfMass3d, supportPolygon, insideMargin} from './body3d.js';

// Rôle et discipline des gestes du moteur.
export const ROLES = {
  'pas-glisse': ['move', 'boxe'], 'pas-arriere': ['exit', 'boxe'], 'changement-niveau': ['move', 'lutte'], 'escrime-garde': ['move', 'escrime'],
  'direct-avant': ['attack', 'boxe'], 'direct-arriere': ['attack', 'boxe'], 'coup-pied-avant': ['attack', 'boxe'], teep: ['attack', 'muay-thai'],
  'gyaku-zuki': ['attack', 'karate'], 'escrime-fente': ['attack', 'escrime'], 'esquive-laterale': ['exit', 'boxe']
};
export const BASE_NAMES = {'direct-avant': 'Direct', 'direct-arriere': 'Croisé', 'coup-pied-avant': 'Coup de pied', teep: 'Teep', 'gyaku-zuki': 'Gyaku', 'escrime-fente': 'Fente'};

// Transformations. `traits` : pictogramme + mot court affichés sous l'animation (peu de texte, beaucoup de visuel).
export const MUTATIONS = {
  spirale: {icon: '↻', label: 'en spirale', apply: k => { k.pose.d3 = {...k.pose.d3, turn: (k.pose.d3.turn ?? 28) + 40, chestTurn: (k.pose.d3.chestTurn ?? 6) + 35}; }},
  bas: {icon: '▼', label: 'au ras du sol', apply: k => { const a = k.pose.angles; a.leadKnee += 22; a.rearKnee += 18; a.leadHip += 12; a.torso += 12; }},
  haut: {icon: '▲', label: 'vers le haut', apply: (k, ctx) => { const a = k.pose.angles; if (ctx.kick) a[ctx.kickLeg + 'Hip'] += 22; else { a.leadShoulder += 22; a.rearShoulder += 18; } }},
  eclair: {icon: '⚡', label: 'en éclair', time: 0.6},
  lent: {icon: '◔', label: 'au ralenti', time: 1.7},
  inverse: {icon: '⇄', label: 'bras inversés', apply: k => { const a = k.pose.angles; [a.leadShoulder, a.rearShoulder] = [a.rearShoulder, a.leadShoulder]; [a.leadElbow, a.rearElbow] = [a.rearElbow, a.leadElbow]; }},
  feinte: {icon: '◐', label: 'après feinte', structural: true},
  hybride: {icon: '✦', label: 'garde hybride', style: true}
};

// Générateur pseudo-aléatoire reproductible (mulberry32) et codes lisibles.
export function rng(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
const ALPHA = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
export const seedToCode = seed => 'LF-' + Array.from({length: 6}, (_, i) => ALPHA[(seed >>> (i * 5)) & 31]).join('');
export const codeToSeed = code => { const s = String(code).toUpperCase().replace(/^LF-/, ''); if (!/^[2-9A-HJ-NP-Z]{6}$/.test(s)) return null; return [...s].reduce((acc, c, i) => acc | (ALPHA.indexOf(c) << (i * 5)), 0) >>> 0; };

const clone = o => JSON.parse(JSON.stringify(o));
const clampAngles = a => { for (const k of ANGLE_KEYS) a[k] = Math.max(-180, Math.min(180, a[k])); };
const pick = (r, list) => list[Math.floor(r() * list.length)];

// Équilibre d'une pose : marge (m) du centre de masse dans le polygone d'appui ; null si en l'air.
function margin(style, pose, dims) {
  const j = joints3d(pose, dims, extrasOf({style}, pose)), poly = supportPolygon(j, dims);
  if (poly.length < 3) return null;
  const c = centerOfMass3d(j);
  return insideMargin(poly, [c[0], c[2]]);
}

// Une technique : [déplacement ?] → attaque transformée → [deuxième attaque ?] → [sortie ?]
export function generate({seed = Math.floor(Math.random() * 2 ** 30), sequences, audace = 2, disciplines = null, base = null}) {
  const dims = bodyDims(), byId = Object.fromEntries(sequences.map(s => [s.id, s]));
  const allowed = id => byId[id] && (!disciplines?.length || disciplines.includes(ROLES[id][1]));
  const of = role => Object.keys(ROLES).filter(id => ROLES[id][0] === role && allowed(id));
  for (let attempt = 0; attempt < 30; attempt++) {
    const r = rng(seed + attempt * 7919), boldness = Math.max(1, Math.min(4, audace - Math.floor(attempt / 10)));
    const attacks = of('attack'); if (!attacks.length) return null;
    const main = base && allowed(base) ? base : pick(r, attacks);
    const recipe = [];
    if (of('move').length && r() < 0.55) recipe.push({id: pick(r, of('move'))});
    recipe.push({id: main, main: true});
    if (r() < 0.2 + 0.1 * boldness) recipe.push({id: pick(r, attacks.filter(a => a !== main).concat(main))});
    if (of('exit').length && r() < 0.6) recipe.push({id: pick(r, of('exit'))});
    // Transformations de l'attaque principale (1 à 4 selon l'audace), sans contradictions.
    const pool = Object.keys(MUTATIONS).filter(m => !(m === 'hybride' && disciplines?.length === 1));
    const muts = [];
    while (muts.length < boldness && pool.length) {
      const m = pool.splice(Math.floor(r() * pool.length), 1)[0];
      if ((m === 'eclair' && muts.includes('lent')) || (m === 'lent' && muts.includes('eclair')) || (m === 'haut' && muts.includes('bas')) || (m === 'bas' && muts.includes('haut'))) continue;
      muts.push(m);
    }
    recipe.find(x => x.main).muts = muts;
    const hybridStyle = muts.includes('hybride') ? pick(r, Object.keys(PRESETS).filter(s => s !== (byId[main].style ?? 'boxe'))) : null;
    const tech = build(recipe, byId, hybridStyle);
    if (!tech || validSequence(tech).length || tech.keys.length > 20) continue;
    // Filtre d'équilibre : départ et arrivée stables ; appuis au sol jamais très en dehors.
    const ms = tech.keys.map(k => margin(tech.style, k.pose, dims));
    if (!(ms[0] > 0.005 && ms.at(-1) > 0.005) || ms.some(m => m !== null && m < -0.09)) continue;
    const disc = [...new Set(recipe.map(x => ROLES[x.id][1]).concat(hybridStyle ? [hybridStyle] : []))];
    return {seed, code: seedToCode(seed), sequence: tech, recipe, muts, disciplines: disc,
      name: nameOf(main, muts, recipe), stability: Math.round(Math.min(ms[0], ms.at(-1)) * 100), novelty: novelty(tech, sequences),
      traits: muts.map(m => ({id: m, icon: MUTATIONS[m].icon, label: MUTATIONS[m].label})), reliability: 'experimental'};
  }
  return null;
}

// Assemblage : comme un enchaînement animé, avec les transformations appliquées aux clés d'action de l'attaque principale.
function build(recipe, byId, hybridStyle) {
  const keys = [];
  let offset = 0;
  const style0 = byId[recipe[0].id].style ?? 'boxe';
  for (const [n, part] of recipe.entries()) {
    const src = byId[part.id], style = PRESETS[(part.main && hybridStyle) || src.style || 'boxe'];
    let ks = clone(src.keys).map(k => ({...k, pose: {...k.pose, d3: {...style, ...k.pose.d3}}}));
    if (part.main) ks = transform(ks, part.muts ?? [], src);
    if (n) offset = keys.at(-1).pose.x - (ks[0].pose.x ?? 0);
    ks.forEach((k, i) => {
      const pose = {...k.pose, x: (k.pose.x ?? 0) + offset};
      keys.push(n && i === 0 ? {label: '→', ms: 420, pose} : {label: k.label, ms: i ? k.ms : undefined, cue: k.cue, pose});
    });
  }
  keys.forEach((k, i) => { if (!i) delete k.ms; });
  return {id: 'invention', name: 'Invention', style: style0, track: ['leadWrist', 'leadToe', 'rearWrist'], keys};
}

function transform(ks, muts, src) {
  const kick = /pied|teep/.test(src.id), kickLeg = 'lead', mid = ks.slice(1, -1);
  for (const m of muts) {
    const M = MUTATIONS[m];
    if (M.apply) for (const k of mid) { M.apply(k, {kick, kickLeg}); clampAngles(k.pose.angles); }
    if (M.time) for (const k of ks.slice(1)) k.ms = Math.round(k.ms * M.time);
  }
  if (muts.includes('feinte') && ks.length >= 3) {
    // Feinte : esquisse de l'action (à mi-chemin), retour vers la garde, puis l'action réelle.
    const half = clone(ks[1]), a0 = ks[0].pose.angles;
    for (const k of ANGLE_KEYS) half.pose.angles[k] = (a0[k] + half.pose.angles[k]) / 2;
    half.label = 'Feinte'; half.ms = Math.round(ks[1].ms * 0.55);
    const back = clone(ks[0]); back.label = 'Retour'; back.ms = 260;
    ks.splice(1, 0, half, back);
  }
  return ks;
}

// Nom court, fabriqué à partir du geste de base et des transformations.
function nameOf(main, muts, recipe) {
  const words = muts.map(m => MUTATIONS[m].label).filter(Boolean);
  const pre = recipe[0].main ? '' : recipe[0].id === 'changement-niveau' ? 'Plongée, ' : 'Entrée, ';
  return `${pre}${BASE_NAMES[main] ?? 'Geste'}${words.length ? ' ' + words.slice(0, 2).join(', ') : ''}`.replace(/^./, c => c.toUpperCase());
}

// Nouveauté 0–100 : écart moyen entre les poses inventées et la pose connue la plus proche.
export function novelty(tech, sequences) {
  const known = sequences.flatMap(s => s.keys.map(k => ({a: k.pose.angles, d: extrasOf(s, k.pose)})));
  const dist = (p, q) => ANGLE_KEYS.reduce((t, k) => t + Math.abs(p.a[k] - q.a[k]), 0) / ANGLE_KEYS.length + D3_KEYS.reduce((t, k) => t + Math.abs(p.d[k] - q.d[k]), 0) / D3_KEYS.length / 2;
  const own = tech.keys.map(k => ({a: k.pose.angles, d: extrasOf(tech, k.pose)}));
  const avg = own.reduce((t, p) => t + Math.min(...known.map(q => dist(p, q))), 0) / own.length;
  return Math.max(0, Math.min(100, Math.round(avg / 14 * 100)));
}

// Variante : même graine de base, autre tirage proche.
export const vary = (prev, opts) => generate({...opts, seed: (prev.seed * 1103515245 + 12345) >>> 1, base: prev.recipe.find(x => x.main).id});
