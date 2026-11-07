// Moteur d'orientation : questions visibles, affinités avec les voies et explication de chaque penchant.
import {questions, VOIES, VOIE_IDS} from '../data/orientation.js';

export const visible = answers => questions.filter(q => !q.when || q.when(answers));
const asList = v => v === undefined ? [] : [].concat(v);

export function score(answers) {
  const raw = Object.fromEntries(VOIE_IDS.map(v => [v, 0])), reasons = Object.fromEntries(VOIE_IDS.map(v => [v, []]));
  for (const q of visible(answers)) for (const val of asList(answers[q.id])) {
    const opt = q.options.find(o => o.v === val);
    for (const [voie, w] of Object.entries(opt?.fx ?? {})) { raw[voie] += w; reasons[voie].push({question: q.title, answer: opt.label, weight: w}); }
  }
  const max = Math.max(...Object.values(raw));
  const aff = Object.fromEntries(VOIE_IDS.map(v => [v, max > 0 ? Math.round(raw[v] / max * 100) / 100 : 0]));
  const order = [...VOIE_IDS].sort((a, b) => raw[b] - raw[a]);
  const mixed = max > 0 && raw[order[1]] >= raw[order[0]] * 0.8;
  return {raw, aff, reasons, primary: max > 0 ? order[0] : null, secondary: max > 0 && raw[order[1]] > 0 ? order[1] : null, mixed};
}

// Traduit les réponses en profil (sans écraser ce que la personne a déjà saisi ailleurs, sauf réponses explicites).
export function toProfile(answers, profile) {
  const p = {...profile};
  if (answers.experience) p.experience = answers.experience;
  const disc = asList(answers.disciplines).filter(d => d !== 'autre');
  if (disc.length) {
    const years = answers.years ? Number(answers.years) : null;
    const names = {boxe: 'Boxe anglaise', escrime: 'Escrime', lutte: 'Lutte', judo: 'Judo', karate: 'Karaté', 'muay-thai': 'Muay-thaï', jjb: 'Jiu-jitsu brésilien'};
    p.disciplines = disc.map((d, i) => ({name: names[d], years: i === 0 ? years : null}));
  }
  if (answers.temps) { const [n, m] = answers.temps.split('x').map(Number); p.perWeek = n; p.minutes = m; }
  const mat = asList(answers.materiel).filter(m => m !== 'rien');
  if (answers.materiel !== undefined) p.equipment = mat;
  const goals = new Set(p.goals);
  const voie = score(answers).primary;
  if (answers.experience === 'aucune' || asList(answers.motivation).includes('forme')) goals.add('bases');
  if (voie === 'foudre') goals.add('condition');
  if (voie === 'racine') goals.add('force');
  if (voie === 'vent') goals.add('appuis');
  p.goals = [...goals].slice(0, 3);
  return p;
}

export function transferFrom(answers) {
  const to = answers.transfert, from = asList(answers.disciplines).find(d => d !== 'autre');
  return to && to !== 'non' && from && from !== to ? {from, to} : null;
}

export {VOIES, VOIE_IDS};
