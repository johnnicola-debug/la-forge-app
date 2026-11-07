// Parcours d'orientation adaptatif. Chaque réponse peut :
//  - pencher vers une ou plusieurs voies (effets visibles dans le bilan « pourquoi ») ;
//  - renseigner le profil (disciplines, temps, matériel…) ;
//  - ouvrir ou fermer des questions suivantes (`when`).
// Les voies décrivent des préférences, jamais des aptitudes : on peut en cumuler et en changer.

export const VOIES = {
  foudre: {name: 'Voie de la Foudre', short: 'Foudre', color: 'verm', essence: 'Impact et initiative',
    summary: 'Prendre l’initiative, frapper juste et fort à courte ou moyenne distance, imposer son rythme.',
    strengths: ['Actions décisives et simples à entraîner', 'Travail physique très complet (puissance, gainage, endurance)', 'Progrès visibles en shadow et aux paos'],
    limits: ['Risque de négliger la défense et la sortie après l’action', 'Exige une bonne gestion de l’effort pour ne pas s’épuiser', 'La puissance sans précision ni timing sert peu'],
    keySkills: ['action-direct', 'action-enchainement', 'corps-puissance', 'appuis-distance', 'defense-garde', 'corps-gainage'],
    disciplines: ['boxe', 'muay-thai', 'karate']},
  racine: {name: 'Voie de la Racine', short: 'Racine', color: 'jade', essence: 'Contrôle et stabilité',
    summary: 'Aller au contact, maîtriser l’autre par l’équilibre, les saisies et le placement, en limitant les dommages.',
    strengths: ['Contrôle sans nécessairement frapper', 'Grande importance de la technique face à la force brute', 'Très utile en défense personnelle quand la distance est perdue'],
    limits: ['Demande un partenaire, un tapis et un enseignant pour la plupart des techniques', 'Apprendre à chuter est un préalable', 'Moins de travail possible seul'],
    keySkills: ['action-saisie', 'defense-chute', 'appuis-niveau', 'corps-force', 'defense-saisie', 'appuis-poids'],
    disciplines: ['judo', 'lutte', 'jjb']},
  vent: {name: 'Voie du Vent', short: 'Vent', color: 'or', essence: 'Distance et lecture',
    summary: 'Gérer l’espace, rester insaisissable, anticiper et toucher avec précision au bon moment.',
    strengths: ['Lecture du jeu et timing transférables entre disciplines', 'Sollicite moins les échanges de coups', 'Développe appuis, endurance et coordination'],
    limits: ['Les résultats demandent du temps (lecture, timing)', 'Peut devenir passif sans actions franches', 'Exige des appuis et une endurance solides'],
    keySkills: ['appuis-lateral', 'appuis-distance', 'defense-sortie-ligne', 'lecture-timing', 'corps-endurance', 'lecture-indices'],
    disciplines: ['escrime', 'boxe', 'karate']}
};
export const VOIE_IDS = Object.keys(VOIES);
export const NAME_PROPOSALS = 'Noms provisoires : Foudre / Racine / Vent (impact / contrôle / distance). Pistes proposées le 07/11 : Marteau / Enclume / Lame (la forge) ; Comète / Gravité / Orbite (le ciel) ; Tonnerre / Montagne / Horizon (le paysage) ; Trait / Nœud / Souffle (l’encre) ; Éclat / Étreinte / Horizon.';

const DISCIPLINES = {boxe: 'Boxe anglaise', escrime: 'Escrime', lutte: 'Lutte', judo: 'Judo', karate: 'Karaté', 'muay-thai': 'Muay-thaï', jjb: 'Jiu-jitsu brésilien', autre: 'Autre'};
const has = (a, q, v) => [].concat(a[q] ?? []).includes(v);

export const questions = [
  {id: 'motivation', scene: 'Le seuil', title: 'Qu’est-ce qui vous amène à la forge ?', help: 'Deux choix au plus.', multi: 2, options: [
    {v: 'defense', label: 'Savoir me défendre', fx: {racine: 1, vent: 1}},
    {v: 'depassement', label: 'Me dépasser physiquement', fx: {foudre: 1}},
    {v: 'competition', label: 'Me mesurer en compétition', fx: {foudre: 1, vent: .5}},
    {v: 'art', label: 'Un art, une discipline de vie', fx: {vent: .5, racine: .5}},
    {v: 'creation', label: 'Construire ma propre méthode', fx: {}},
    {v: 'forme', label: 'Ma forme et ma santé', fx: {}}]},
  {id: 'experience', scene: 'Le chemin parcouru', title: 'Votre expérience des sports de combat ?', options: [
    {v: 'aucune', label: 'Aucune pour l’instant'}, {v: 'debutant', label: 'Un peu (moins d’un an)'},
    {v: 'intermediaire', label: 'Plusieurs années'}, {v: 'confirme', label: 'Longue et toujours active'}]},
  {id: 'disciplines', scene: 'Le chemin parcouru', title: 'Quelles disciplines avez-vous pratiquées ?', multi: 4, when: a => a.experience && a.experience !== 'aucune',
    options: Object.entries(DISCIPLINES).map(([v, label]) => ({v, label, fx: {boxe: {foudre: .7}, 'muay-thai': {foudre: .7}, karate: {foudre: .4, vent: .3}, escrime: {vent: .8},
      judo: {racine: .8}, lutte: {racine: .8}, jjb: {racine: .8}}[v] ?? {}}))},
  {id: 'years', scene: 'Le chemin parcouru', title: 'Combien d’années dans votre discipline principale ?', when: a => [].concat(a.disciplines ?? []).length > 0, options: [
    {v: '1', label: 'Environ 1 an'}, {v: '3', label: '2 à 4 ans'}, {v: '6', label: '5 à 8 ans'}, {v: '10', label: 'Plus de 8 ans'}]},
  {id: 'sports', scene: 'Le corps', title: 'D’autres activités physiques ?', multi: 4, options: [
    {v: 'course', label: 'Course, vélo, natation'}, {v: 'muscu', label: 'Musculation'}, {v: 'collectif', label: 'Sports collectifs'},
    {v: 'souplesse', label: 'Danse, gym, yoga'}, {v: 'escalade', label: 'Escalade'}, {v: 'aucun', label: 'Rien de régulier'}]},
  {id: 'distance', scene: 'L’espace', title: 'Face à quelqu’un, où vous sentez-vous le mieux ?', options: [
    {v: 'loin', label: 'À distance, en gardant l’espace', fx: {vent: 2}},
    {v: 'moyen', label: 'À portée de frappe, prêt à entrer', fx: {foudre: 2}},
    {v: 'contact', label: 'Au contact, là où l’on peut saisir', fx: {racine: 2}},
    {v: 'nsp', label: 'Je ne sais pas encore'}]},
  {id: 'pousse', scene: 'L’instinct', title: 'Quelqu’un vous pousse brusquement. Votre premier réflexe ?', options: [
    {v: 'tourner', label: 'Tourner, m’écarter de l’axe', fx: {vent: 1.5}},
    {v: 'repousser', label: 'Repousser, répondre aussitôt', fx: {foudre: 1.5}},
    {v: 'agripper', label: 'Agripper, me stabiliser', fx: {racine: 1.5}},
    {v: 'figer', label: 'Je me fige', fx: {}}]},
  {id: 'attire', scene: 'Le regard', title: 'Qu’aimez-vous le plus regarder ?', options: [
    {v: 'combo', label: 'Un enchaînement de coups précis', fx: {foudre: 1.5}},
    {v: 'projection', label: 'Une projection nette', fx: {racine: 1.5}},
    {v: 'jambes', label: 'Un jeu de jambes insaisissable', fx: {vent: 1.5}},
    {v: 'touche', label: 'Une touche parfaite au bon moment', fx: {vent: 1, foudre: .5}}]},
  {id: 'tactique', scene: 'L’instinct', title: 'Dans un échange, vous préférez…', options: [
    {v: 'initiative', label: 'Prendre l’initiative', fx: {foudre: 1.2}},
    {v: 'contre', label: 'Attendre et contrer', fx: {vent: 1.2}},
    {v: 'controle', label: 'Neutraliser puis contrôler', fx: {racine: 1.2}},
    {v: 'varier', label: 'Varier selon l’autre', fx: {foudre: .4, racine: .4, vent: .4}}]},
  {id: 'competition', scene: 'Le cadre', title: 'La compétition, pour vous ?', when: a => !has(a, 'motivation', 'competition'), options: [
    {v: 'oui', label: 'Oui, volontiers'}, {v: 'peut-etre', label: 'Peut-être un jour'}, {v: 'non', label: 'Non, ce n’est pas mon but'}]},
  {id: 'selfdefense', scene: 'Le cadre', title: 'La défense personnelle : quelle place ?', when: a => has(a, 'motivation', 'defense'), options: [
    {v: 'essentielle', label: 'Essentielle', fx: {racine: .8, vent: .5}}, {v: 'importante', label: 'Importante, parmi d’autres buts'}, {v: 'secondaire', label: 'Secondaire'}]},
  {id: 'contact', scene: 'Le cadre', title: 'Qu’est-ce qui vous est possible ?', help: 'Plusieurs choix possibles.', multi: 4, options: [
    {v: 'partenaire', label: 'S’entraîner avec un partenaire'}, {v: 'tapis', label: 'Un tapis ou un club pour chuter'},
    {v: 'impacts', label: 'Recevoir des impacts encadrés'}, {v: 'seul', label: 'Surtout seul, à la maison'}]},
  {id: 'allonge', scene: 'Le corps', title: 'Votre allonge vous semble…', help: 'Facultatif. La morphologie n’impose aucun style : elle oriente seulement certains choix tactiques.', options: [
    {v: 'grande', label: 'Plutôt grande', fx: {vent: .4}}, {v: 'moyenne', label: 'Moyenne'}, {v: 'courte', label: 'Plutôt courte', fx: {racine: .2, foudre: .2}}, {v: 'nr', label: 'Je préfère ne pas répondre'}]},
  {id: 'donnees', scene: 'Le corps', title: 'Quelles données physiques connaissez-vous déjà ?', help: 'Vous pourrez les saisir ensuite dans votre fiche. Rien n’est obligatoire.', multi: 5, options: [
    {v: 'charges', label: 'Mes charges en salle'}, {v: 'tractions', label: 'Tractions, pompes, dips'}, {v: 'course', label: 'Des temps de course'},
    {v: 'saut', label: 'Détente, sprint'}, {v: 'souplesse', label: 'Ma souplesse'}, {v: 'rien', label: 'Aucune pour l’instant'}]},
  {id: 'temps', scene: 'Le rythme', title: 'Combien de temps pour vous entraîner ?', options: [
    {v: '2x30', label: '2 séances de 30 min par semaine'}, {v: '3x30', label: '3 × 30 min'}, {v: '3x45', label: '3 × 45 min'}, {v: '4x60', label: '4 × 60 min ou plus'}]},
  {id: 'materiel', scene: 'Le rythme', title: 'De quel matériel disposez-vous ?', multi: 6, options: [
    {v: 'barre-traction', label: 'Barre de traction'}, {v: 'elastique', label: 'Élastiques'}, {v: 'halteres', label: 'Haltères'}, {v: 'kettlebell', label: 'Kettlebell'},
    {v: 'corde-a-sauter', label: 'Corde à sauter'}, {v: 'tapis', label: 'Tapis'}, {v: 'barre-olympique', label: 'Salle de musculation'}, {v: 'rien', label: 'Rien de particulier'}]},
  {id: 'transfert', scene: 'La forge', title: 'Voulez-vous réutiliser votre expérience dans une autre discipline ?', when: a => [].concat(a.disciplines ?? []).filter(d => d !== 'autre').length > 0, options: [
    ...Object.entries(DISCIPLINES).filter(([v]) => v !== 'autre').map(([v, label]) => ({v, label: `Oui, vers : ${label}`})), {v: 'non', label: 'Pas pour l’instant'}]}
];

export const DISCIPLINE_NAMES = DISCIPLINES;
