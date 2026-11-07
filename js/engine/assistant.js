// Assistant de LA FORGE : règles explicites et lisibles, appliquées aux données réelles de la personne.
// Chaque recommandation dit POURQUOI (quelles données l'ont déclenchée). Pas de texte générique figé :
// si les données manquent, l'assistant le dit et propose de les compléter.
import {VOIES} from '../data/orientation.js';

const DAY = 864e5;
const PUSH = new Set(['pompes', 'pompes-genoux', 'pompes-mur', 'dips-chaise']);
const PULL = new Set(['tractions', 'rowing-elastique', 'rowing-haltere', 'tirage-allonge-ventre', 'suspension-barre']);

export function recommend({state, status, skills, exercises, now = Date.now()}) {
  const recs = [], s = state, o = s.orientation;
  const exById = Object.fromEntries(exercises.map(e => [e.id, e]));
  const add = (priority, kind, title, why, href, label) => recs.push({priority, kind, title, why, href, label});

  if (!o) add(100, 'orientation', 'Faire le parcours d’orientation', 'Aucune orientation enregistrée : l’assistant ne connaît ni vos motivations ni vos préférences.', '#orientation', 'Commencer');

  // 1. Compétences clés de la voie dominante, dans l'ordre où elles deviennent accessibles.
  if (o?.primary) {
    const voie = VOIES[o.primary];
    const next = voie.keySkills.map(id => skills.find(k => k.id === id)).filter(k => k && !['pratique', 'evalue', 'maitrise'].includes(status[k.id].stage));
    const ready = next.filter(k => status[k.id].available);
    for (const k of (ready.length ? ready : next).slice(0, 2))
      add(70, 'competence', `Travailler : ${k.name}`, `Compétence clé de la ${voie.name}${status[k.id].available ? ', et ses prérequis sont déjà pratiqués' : ' (prérequis à pratiquer d’abord)'}.`, `#arbre/${k.id}`, 'Voir dans l’arbre');
  }

  // 2. Données manquantes utiles.
  const corps = skills.filter(k => k.branch === 'corps' && (k.tests ?? []).length);
  const unknown = corps.filter(k => !status[k.id].measures.length);
  const wanted = o?.primary ? unknown.filter(k => VOIES[o.primary].keySkills.includes(k.id)) : [];
  const pick = (wanted.length ? wanted : unknown).slice(0, 1);
  for (const k of pick) add(55, 'donnee', `Compléter : ${k.name}`, `Aucune donnée mesurée pour « ${k.name} ». Une valeur déjà connue suffit ; sinon un test simple est proposé.`, '#avatar', 'Ouvrir ma fiche');
  if (unknown.length === corps.length) add(60, 'donnee', 'Renseigner une première performance', 'Votre fiche de personnage est vide : aucune statistique n’est affichée tant qu’aucune donnée réelle n’existe.', '#avatar', 'Ajouter');

  // 3. Équilibre de l'entraînement sur 28 jours.
  const recent = s.sessions.filter(x => x.status !== 'importee-v1' && now - Date.parse(x.startedAt) < 28 * DAY);
  if (recent.length >= 3) {
    const caps = {};
    for (const x of recent) for (const b of x.blocks) if (b.sets.some(t => t.done)) for (const c of exById[b.exerciseId]?.capacities ?? []) caps[c] = (caps[c] ?? 0) + 1;
    for (const [c, label] of [['mobilite', 'la mobilité'], ['endurance', 'l’endurance générale'], ['force', 'la force']])
      if (!caps[c]) add(65, 'equilibre', `Rééquilibrer : ${label}`, `${recent.length} séances en 4 semaines, aucune ne travaille ${label}.`, '#entrainement', 'Choisir une séance');
    let push = 0, pull = 0;
    for (const x of recent) for (const b of x.blocks) { const n = b.sets.filter(t => t.done).length; if (PUSH.has(b.exerciseId)) push += n; if (PULL.has(b.exerciseId)) pull += n; }
    if (push >= 6 && pull * 2 < push) add(62, 'equilibre', 'Plus de tirages que de poussées', `${push} séries de poussée pour ${pull} de tirage ces 4 semaines. Un rapport plus équilibré est une recommandation courante en préparation physique (proposition, non personnalisée médicalement).`, '#entrainement/force', 'Programme force');
  } else if (o) add(50, 'rythme', 'Installer un rythme', `${recent.length} séance(s) enregistrée(s) en 4 semaines. Visez d’abord la régularité : ${s.profile.perWeek} séance(s) par semaine comme vous l’avez indiqué.`, '#entrainement', 'Préparer une séance');

  // 4. Transfert déclaré.
  if (o?.transfer) add(68, 'transfert', 'Étudier votre transfert', `Vous souhaitez réutiliser votre expérience vers une autre discipline : la Forge de style compare les deux pratiques.`, `#forge/${o.transfer.from}/${o.transfer.to}`, 'Ouvrir la comparaison');

  // 5. Une auto-évaluation ancienne sans regard extérieur.
  const selfOnly = skills.filter(k => status[k.id].self.length && !status[k.id].external.length);
  if (selfOnly.length >= 3) add(40, 'evaluation', 'Faire constater vos progrès', `${selfOnly.length} compétences n’ont qu’une auto-évaluation. Demandez à un enseignant de les observer : seule son évaluation peut établir un niveau.`, '#arbre', 'Voir l’arbre');

  return recs.sort((a, b) => b.priority - a.priority);
}

// Programme conseillé selon l'orientation et l'expérience.
export function suggestedGoal(state) {
  const o = state.orientation;
  if (!o || state.profile.experience === 'aucune') return 'bases';
  return {foudre: 'condition', racine: 'force', vent: 'appuis'}[o.primary] ?? 'bases';
}
