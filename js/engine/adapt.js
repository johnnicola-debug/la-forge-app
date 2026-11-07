// Séance adaptée : le modèle du programme est ajusté à la personne, avec des règles simples et affichées.
//  1. Carte du corps : douleur déclarée (7 jours) → exercice remplacé ou retiré ; courbature forte (3 jours) → une série de moins.
//  2. Historique : toutes les séries faites deux fois de suite avec un effort ≤ 7 → +10 % (répétitions ou durée) ;
//     séries manquées ou effort ≥ 9 la dernière fois → −10 %. (Principe de surcharge progressive ; les pourcentages sont un choix de LA FORGE.)
//  3. Record connu (pompes, tractions, dips) sans historique → répétitions ≈ 60 % du record.
//  4. Voie : une série de plus sur un exercice qui travaille les capacités de la voie (sans dépasser 5 séries).
// Le temps disponible est appliqué ensuite (fitTemplate). Chaque changement porte un pictogramme et une raison courte.
import {soreness, ZONES} from './body.js';

export const VOIE_CAPS = {foudre: ['puissance', 'force'], racine: ['force', 'equilibre', 'endurance-musculaire'], vent: ['appuis', 'coordination', 'endurance']};
const VOIE_NAME = {foudre: 'Foudre', racine: 'Racine', vent: 'Vent'};
const PERF_OF = {pompes: 'pushup', tractions: 'pullup', 'dips-chaise': 'dip'};

// Dernières séances réelles contenant un exercice (les plus récentes d'abord), avec le bloc correspondant.
function history(sessions, exerciseId, n = 2) {
  return sessions.filter(s => s.status !== 'importee-v1').sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    .map(s => ({s, b: (s.blocks ?? []).find(b => b.exerciseId === exerciseId)})).filter(x => x.b?.sets?.length).slice(0, n);
}
// Séance réussie : chaque série faite (et, en répétitions, au moins le nombre prévu quand il est noté) avec un effort ≤ 7.
const allDone = ({s, b}) => b.sets.every(x => x.done && (x.unit !== 'rép.' || x.reps == null || x.reps >= x.planned)) && (s.effort ?? 10) <= 7;
const struggled = ({s, b}) => b.sets.filter(x => x.done).length / b.sets.length < 0.7 || (s.effort ?? 0) >= 9;

export function adapt(template, {state, byId, zonesOf, now = Date.now()}) {
  const t = {...template, main: template.main.map(b => ({...b}))}, changes = [];
  // Chaque changement est rangé dans la liste générale et sur le bloc concerné (b.why), pour l'afficher au bon endroit.
  const add = (exerciseId, icon, kind, text, b = null) => { const c = {exerciseId, icon, kind, text}; changes.push(c); if (b) b.why = [...(b.why ?? []), c]; };
  const recent3 = soreness(state.sessions, now, 3), recent7 = soreness(state.sessions, now, 7);
  const pain = Object.keys(recent7).filter(z => recent7[z].max === 3), strong = Object.keys(recent3).filter(z => recent3[z].max >= 2 && !pain.includes(z));
  const hits = (id, zones) => (zonesOf(id) ?? []).filter(z => zones.includes(z));

  // 1. Carte du corps.
  for (let i = t.main.length - 1; i >= 0; i--) {
    const b = t.main[i], hurt = hits(b.exerciseId, pain);
    if (hurt.length) {
      const ex = byId[b.exerciseId], pool = [...(ex?.alternatives ?? []), ...Object.values(byId).filter(x => x.id !== b.exerciseId && x.capacities.some(c => ex?.capacities.includes(c))).map(x => x.id)];
      const alt = pool.find(id => byId[id] && !hits(id, pain).length && !t.main.some(x => x.exerciseId === id) && (byId[id].equipment ?? []).every(e => state.profile.equipment.includes(e)));
      if (alt) { add(alt, '↺', 'remplace', `Douleur signalée (${hurt.map(z => ZONES[z].toLowerCase()).join(', ')}) : remplace ${ex?.name ?? b.exerciseId}`, b); b.exerciseId = alt; b.adapted = true; }
      else { add(b.exerciseId, '✕', 'retire', `Douleur signalée (${hurt.map(z => ZONES[z].toLowerCase()).join(', ')}) : exercice retiré`); t.main.splice(i, 1); }
      continue;
    }
    const sore = hits(b.exerciseId, strong);
    if (sore.length && b.sets > 1) { b.sets--; b.adapted = true; add(b.exerciseId, '▼', 'moins', `Courbature forte (${sore.map(z => ZONES[z].toLowerCase()).join(', ')}) : une série de moins`, b); }
  }

  // 2 et 3. Progression selon l'historique, ou calage sur le record.
  for (const b of t.main) {
    if (b.adapted) continue;
    const h = history(state.sessions, b.exerciseId);
    const bump = f => { if (b.reps) { const n = Math.max(1, Math.round(b.reps * f) - b.reps); b.reps = Math.max(1, b.reps + (f > 1 ? Math.max(1, n) : Math.min(-1, n))); } else if (b.durationSec) b.durationSec = Math.max(10, Math.round(b.durationSec * f / 5) * 5); };
    if (h.length === 2 && h.every(allDone)) { bump(1.1); b.adapted = true; add(b.exerciseId, '▲', 'plus', 'Toutes les séries faites deux fois de suite : un peu plus', b); }
    else if (h.length && struggled(h[0])) { bump(0.9); b.adapted = true; add(b.exerciseId, '▼', 'moins', 'Séries manquées ou effort très élevé la dernière fois : un peu moins', b); }
    else if (!h.length && PERF_OF[b.exerciseId] && b.reps) {
      const best = state.performances.filter(p => p.exercise === PERF_OF[b.exerciseId] && p.load === null && p.assistance === 'aucune' && p.reps).sort((a, c) => c.reps - a.reps)[0];
      if (best) { const r = Math.max(3, Math.min(50, Math.round(best.reps * 0.6))); if (r !== b.reps) { b.reps = r; b.adapted = true; add(b.exerciseId, '◆', 'record', `Calé sur votre record (${best.reps} rép.) : environ 60 %`, b); } }
    }
  }

  // 4. Accent de la voie (une seule fois par séance).
  const voie = state.orientation?.primary;
  if (voie && VOIE_CAPS[voie]) {
    const b = t.main.find(x => !x.adapted && x.sets < 5 && byId[x.exerciseId]?.capacities.some(c => VOIE_CAPS[voie].includes(c)) && !hits(x.exerciseId, [...pain, ...strong]).length);
    if (b) { b.sets++; b.adapted = true; add(b.exerciseId, '◎', 'voie', `Accent de la voie ${VOIE_NAME[voie]} : une série de plus`, b); }
  }
  t.main.forEach(b => delete b.adapted);
  return {template: t, changes};
}

// Séance libre composée par la personne → modèle de séance (échauffement et retour au calme courts ajoutés).
export function customTemplate(c) {
  return {id: 'libre', title: c.name, focus: 'Séance composée', warmup: c.warmup === false ? [] : [{exerciseId: 'mobilisation-articulaire', durationSec: 180}],
    main: c.blocks.map((b, i) => ({exerciseId: b.exerciseId, sets: b.sets, ...(b.reps ? {reps: b.reps} : {durationSec: b.durationSec}), restSec: b.restSec ?? 60, priority: 1})),
    cooldown: [{exerciseId: 'respiration-lente', durationSec: 120}]};
}
