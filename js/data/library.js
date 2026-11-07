// Bibliothèque de fiches LA FORGE (v2).
// Tout contenu rédigé par IA reste au statut « brouillon » tant qu’un enseignant ne l’a pas relu.
// Une fiche « sourcee » s’appuie sur au moins une source réelle, vérifiée, qui cadre le geste, sans valider la fiche elle-même.
// Modèle v2 : voir docs/PLAN_NUIT_2026-10-31.md, section « Fiche de bibliothèque v2 ».
// Champs v2 : origin (discipline), level (1 découverte · 2 fondamental · 3 intermédiaire · 4 avancé), joints, muscles,
// principles, skills (nœuds de l’arbre), risks, transfers [{to, note, reliability}], sources [{label, url, type, reliability}].
// Les articulations et muscles décrivent un rôle fonctionnel général, sans valeur chiffrée.

const DATE_V1 = '2026-10-28';
const DATE_V2 = '2026-10-31';
const AUTHOR = 'Claude Code (IA)';

const passageV2 = () => ({ date: DATE_V2, change: 'Passage au modèle v2 (anatomie, principes, transferts)' });

// Fiches reprises de la v0.1 (déjà retravaillées le 28/10).
const reprise = (status, ...more) => ({
  status, version: '0.2', author: AUTHOR, reviewedBy: null,
  history: [{ date: DATE_V1, change: 'Reprise de la fiche v0.1 et enrichissement' }, passageV2(), ...more]
});
// Fiches créées le 28/10 (brouillon IA).
const draft = (status = 'brouillon', ...more) => ({
  status, version: '0.2', author: AUTHOR, reviewedBy: null,
  history: [{ date: DATE_V1, change: 'Création (brouillon IA)' }, passageV2(), ...more]
});
// Fiches créées directement au modèle v2.
const nouvelle = (status) => ({
  status, version: '0.1', author: AUTHOR, reviewedBy: null,
  history: [{
    date: DATE_V2,
    change: status === 'sourcee'
      ? 'Création au modèle v2 (brouillon IA, sources vérifiées ajoutées)'
      : 'Création au modèle v2 (brouillon IA, sans source vérifiée)'
  }]
});
const sourcesAjoutees = (detail) => ({ date: DATE_V2, change: `Source vérifiée ajoutée : ${detail}` });

// Sources. Chaque URL a été ouverte et lue le 31/10/2026 avant d’être écrite ici.
// Une source « cadre le geste » : elle ne valide pas la fiche, qui reste à relire par un enseignant.
const SOURCE_IA = {
  label: 'Rédaction LA FORGE (IA), sans source vérifiée — à relire par un enseignant',
  url: null, type: 'ia', reliability: 'plausible'
};
const S = {
  englandBoxing: {
    label: 'England Boxing — manuel entraîneur niveau 2, position et garde (cadre le geste, ne valide pas cette fiche)',
    url: 'https://www.englandboxing.org/wp-content/uploads/2022/03/Level-2-Coaching-Handbook-compressed.pdf',
    type: 'federation', reliability: 'etabli'
  },
  boxingScotland: {
    label: 'Boxing Scotland — boîte à outils, « Footwork » : pieds qui ne se croisent pas, pied suiveur (cadre le geste, ne valide pas cette fiche)',
    url: 'https://www.boxingscotlandtoolkit.org/session-delivery/footwork/',
    type: 'federation', reliability: 'etabli'
  },
  liu2022: {
    label: 'Liu Y. et al. (2022), « Biomechanics of the lead straight punch of different level boxers », Frontiers in Physiology, vol. 13 — 16 boxeurs ; décrit un enchaînement des segments du tronc vers la main',
    url: 'https://www.frontiersin.org/articles/10.3389/fphys.2022.1015154/full',
    type: 'academique', reliability: 'plausible'
  },
  cheraghi2014: {
    label: 'Cheraghi M. et al. (2014), « Kinematics of Straight Right Punch in Boxing », Annals of Applied Sport Science 2(2) — 8 boxeurs ; le coup part d’une poussée des jambes',
    url: 'https://aassjournal.com/article-1-136-en.html',
    type: 'academique', reliability: 'plausible'
  },
  chen2017: {
    label: 'Chen T. L.-W. et al. (2017), « Biomechanics of fencing sport: A scoping review », PLoS ONE 12(2) — revue de 37 études, surtout sur la fente et les blessures',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5302478/',
    type: 'academique', reliability: 'etabli'
  },
  nwFencing: {
    label: 'Northwest Fencing Center — « Intro to Fencing » (guide de club pour débutants : en garde, marche, retraite, fente, retour en garde, parade-riposte)',
    url: 'https://nwfencing.org/wp-content/uploads/2024/09/Intro-to-Fencing-Guide.pdf',
    type: 'pedagogique', reliability: 'plausible'
  },
  judoQuebec: {
    label: 'Judo Québec — F. Drouin, « Les chutes, guide d’instruction » (1995, révisé en 2000) : consignes et progressions des chutes arrière et roulées',
    url: 'https://judo-quebec.qc.ca/files/Pages/entraineur/Guide_apprentissage_chutes%20%281%29.pdf',
    type: 'federation', reliability: 'etabli'
  },
  murayama2020: {
    label: 'Murayama H. et al. (2020), « Ukemi Technique Prevents the Elevation of Head Acceleration of a Person Thrown by the Judo Technique “Osoto-gari” », Neurologia medico-chirurgica 60(6) — deux judokas experts seulement',
    url: 'https://www.jstage.jst.go.jp/article/nmc/60/6/60_oa.2020-0043/_article',
    type: 'academique', reliability: 'plausible'
  },
  ffjudoRegles: {
    label: 'France Judo, Commission nationale d’arbitrage — « Mise à jour des règles IJF 2026 » (saisies, rupture de saisie, kumikata conventionnel) : règles de compétition, pas une méthode d’apprentissage',
    url: 'https://www.ffjudo.com/resource-file/document/1771514735_6007a65ec0c6d4d5e9be.pdf',
    type: 'federation', reliability: 'etabli'
  },
  usaw2001: {
    label: 'USA Wrestling — T. Witulski (2001), « Reviewing the Basic Skills of Wrestling » : garde, changement de niveau, pas de pénétration, sprawl présenté comme contre-attaque',
    url: 'https://www.themat.com/news/2001/may/09/reviewing-the-basic-skills-of--10094',
    type: 'federation', reliability: 'etabli'
  },
  loczi1985: {
    label: 'Loczi J. (1985), « Biomechanics of the Oi-Tsuki in Zenkutsu-Dachi », congrès ISBS — le résumé décrit la forme couramment enseignée de la posture avant',
    url: 'https://ojs.ub.uni-konstanz.de/cpa/article/view/1457',
    type: 'academique', reliability: 'plausible'
  },
  suwarganda2009: {
    label: 'Suwarganda E. et al. (2009), « Analysis of performance of the karate punch (gyaku-zuki) », congrès ISBS — 9 athlètes élites',
    url: 'https://ojs.ub.uni-konstanz.de/cpa/article/view/3410',
    type: 'academique', reliability: 'plausible'
  },
  kesting2022: {
    label: 'S. Kesting, Grapplearts (2022), « The Four Variations of the BJJ Technical Standup » (site d’enseignant, ni fédération ni étude)',
    url: 'https://www.grapplearts.com/the-four-variations-of-the-bjj-technical-standup/',
    type: 'pedagogique', reliability: 'plausible'
  }
};

export const families = [
  { id: 'gardes-postures-appuis', name: 'Gardes, postures et appuis' },
  { id: 'deplacements-distance', name: 'Déplacements et distance' },
  { id: 'techniques-enchainements', name: 'Techniques et enchaînements' },
  { id: 'defenses', name: 'Défenses' },
  { id: 'chutes-controles', name: 'Chutes, saisies et travail au sol' },
  { id: 'notions-tactiques-pedagogiques', name: 'Notions tactiques et pédagogiques' },
  { id: 'preparation-associee', name: 'Préparation associée' }
];

export const entries = [
  // ——— Gardes, postures et appuis ———
  {
    id: 'garde',
    title: 'La garde de boxe et les appuis',
    family: 'gardes-postures-appuis',
    disciplines: ['boxe anglaise'],
    origin: 'boxe',
    level: 1,
    objective: 'Trouver une position de départ confortable, équilibrée et disponible pour bouger dans toutes les directions.',
    context: 'Point de départ de presque toutes les autres fiches. On la travaille seul, devant un miroir ou en se filmant, sans partenaire.',
    prerequisites: [],
    steps: [
      'Placer les pieds légèrement décalés, à peu près à largeur d’épaules, le pied avant orienté vers l’avant.',
      'Garder les genoux souples, sans les bloquer ni trop les plier.',
      'Monter les mains près du visage, coudes proches du corps, sans crisper les épaules.',
      'Rentrer légèrement le menton et garder le regard devant soi.',
      'Respirer calmement, puis déplacer doucement le poids d’un pied à l’autre et revenir à une position stable.'
    ],
    errors: [
      'Pieds sur une même ligne (équilibre fragile sur le côté).',
      'Pieds trop écartés ou trop serrés.',
      'Épaules remontées et crispées.',
      'Respiration bloquée.',
      'Mains qui descendent sans s’en rendre compte.'
    ],
    exercises: ['marche-sur-place', 'chevilles-genou-mur', 'deplacements-en-garde'],
    variants: [
      'Garde inversée (pied droit devant) pour les personnes gauchères ou pour découvrir l’autre côté.',
      'Garde plus haute ou plus basse selon la discipline, à faire choisir par un enseignant.'
    ],
    limits: 'Cette fiche décrit une garde générale de boxe anglaise. La position exacte dépend de la discipline, de la morphologie et du style : un enseignant doit l’ajuster. Elle ne traite ni de la protection réelle face à des coups, ni de la pratique avec partenaire.',
    joints: ['cheville', 'genou', 'hanche', 'epaule', 'cou'],
    muscles: ['mollets', 'quadriceps', 'fessiers', 'deltoides', 'trapezes', 'abdominaux'],
    principles: ['base-sustentation', 'centre-masse', 'relachement', 'alignement'],
    skills: ['appuis-posture', 'defense-garde', 'spe-boxe'],
    risks: 'Peu de risque à vide. Épaules et nuque crispées si la garde est tenue longtemps ; genoux qui rentrent vers l’intérieur si la posture est trop basse.',
    transfers: [
      { to: 'muay-thai', note: 'Même recherche d’une base stable et de mains hautes, mais la garde de muay-thaï est souvent plus de face et plus haute, à cause des coups de pied et des coudes.', reliability: 'plausible' },
      { to: 'escrime', note: 'Garde de profil dans les deux cas, mais l’escrimeur se place plus de profil et plus bas, et se protège avec la lame plutôt qu’avec les mains.', reliability: 'plausible' }
    ],
    sources: [S.englandBoxing],
    sequence: 'garde',
    editorial: reprise('sourcee')
  },
  {
    id: 'posture-basse-haute',
    title: 'Posture de base : basse ou haute',
    family: 'gardes-postures-appuis',
    disciplines: ['transversal'],
    origin: 'transversal',
    level: 1,
    objective: 'Sentir la différence entre une posture basse (plus stable, moins mobile) et une posture haute (plus mobile, moins stable).',
    context: 'Notion commune à de nombreuses disciplines, qui n’utilisent pas toutes la même hauteur de posture. Travail seul, lent, sans charge.',
    prerequisites: [],
    steps: [
      'Se tenir debout, pieds à largeur de bassin, genoux souples.',
      'Écarter un peu les pieds et descendre doucement le bassin en pliant les genoux : c’est une posture plus basse.',
      'Remarquer ce que l’on ressent : appui plus solide, mais démarrer un déplacement demande plus d’effort.',
      'Remonter progressivement vers une posture plus haute, genoux toujours souples.',
      'Remarquer la différence : on bouge plus facilement, mais on se sent moins ancré.',
      'Chercher une hauteur intermédiaire confortable, que l’on peut tenir en respirant normalement.'
    ],
    errors: [
      'Descendre en laissant les genoux rentrer vers l’intérieur.',
      'Pencher le buste en avant pour compenser.',
      'Bloquer les genoux tendus en posture haute.',
      'Descendre plus bas que ce que les hanches et les genoux permettent confortablement.'
    ],
    exercises: ['squat-poids-corps', 'hanches-90-90', 'equilibre-unipodal'],
    variants: [
      'Tenir chaque hauteur quelques respirations, puis passer de l’une à l’autre lentement.',
      'Faire un petit pas dans chaque posture pour comparer la facilité de déplacement.'
    ],
    limits: 'La « bonne » hauteur n’existe pas en général : elle dépend de la discipline, de la situation et de la personne. Cette fiche aide seulement à percevoir la différence. Un enseignant doit indiquer la posture utilisée dans sa discipline et l’adapter à chacun.',
    joints: ['cheville', 'genou', 'hanche', 'lombaires'],
    muscles: ['quadriceps', 'fessiers', 'adducteurs', 'mollets', 'erecteurs'],
    principles: ['base-sustentation', 'centre-masse', 'alignement'],
    skills: ['appuis-posture', 'appuis-niveau', 'corps-equilibre'],
    risks: 'Douleur au genou si les genoux rentrent vers l’intérieur ou si l’on descend plus bas que sa mobilité ne le permet ; bas du dos qui se creuse si le buste penche.',
    transfers: [
      { to: 'lutte', note: 'La lutte change sans cesse de hauteur : percevoir posture basse et haute prépare le changement de niveau.', reliability: 'plausible' },
      { to: 'karate', note: 'Les postures de base du karaté, comme zenkutsu-dachi, sont souvent plus basses et plus longues que la garde de boxe.', reliability: 'plausible' }
    ],
    sources: [SOURCE_IA],
    sequence: null,
    editorial: draft()
  },
  {
    id: 'repartition-poids',
    title: 'La répartition du poids entre les pieds',
    family: 'gardes-postures-appuis',
    disciplines: ['transversal'],
    origin: 'transversal',
    level: 1,
    objective: 'Savoir où se trouve son poids (avant, arrière, centre) et le déplacer volontairement sans perdre l’équilibre.',
    context: 'Base des déplacements, des coups de pied et des esquives. Travail seul, lent, en garde.',
    prerequisites: ['garde', 'posture-basse-haute'],
    steps: [
      'Se mettre en garde, genoux souples.',
      'Porter doucement le poids vers le pied avant sans décoller le talon arrière brusquement, puis revenir au centre.',
      'Porter le poids vers le pied arrière, puis revenir au centre.',
      'Chercher une position où le poids est réparti de façon à pouvoir partir facilement dans plusieurs directions.',
      'Recommencer les yeux ouverts, lentement, en sentant la pression sous chaque pied.'
    ],
    errors: [
      'Déplacer le buste seul au lieu de déplacer le bassin.',
      'Rester tout le temps sur un seul pied sans s’en rendre compte.',
      'Décoller les pieds au lieu de transférer le poids.',
      'Aller trop vite et perdre la sensation.'
    ],
    exercises: ['equilibre-unipodal', 'chevilles-genou-mur', 'deplacements-en-garde'],
    variants: [
      'Transferts de poids sur le côté, pieds à largeur d’épaules.',
      'Tenir quelques secondes chaque position avant de revenir au centre.'
    ],
    limits: 'La répartition « idéale » varie selon les disciplines et les situations ; cette fiche n’en donne aucune. Elle ne remplace pas l’observation d’un enseignant, qui seul peut corriger la position réelle du poids.',
    joints: ['cheville', 'genou', 'hanche'],
    muscles: ['mollets', 'quadriceps', 'fessiers', 'adducteurs'],
    principles: ['transfert-poids', 'centre-masse', 'base-sustentation'],
    skills: ['appuis-poids', 'corps-equilibre'],
    risks: 'Faible. Perte d’équilibre si l’on va trop loin sur un pied : travailler près d’un mur ou d’un dossier de chaise.',
    transfers: [
      { to: 'muay-thai', note: 'Un poids plutôt sur la jambe arrière, fréquent en muay-thaï, libère la jambe avant pour le teep ou le blocage.', reliability: 'plausible' },
      { to: 'escrime', note: 'Savoir placer son poids entre les deux pieds prépare la marche, la retraite et la fente.', reliability: 'plausible' }
    ],
    sources: [SOURCE_IA],
    sequence: null,
    editorial: draft()
  },

  // ——— Déplacements et distance ———
  {
    id: 'pas-glisse',
    title: 'Le pas glissé (avant, arrière, latéral)',
    family: 'deplacements-distance',
    disciplines: ['boxe anglaise'],
    origin: 'boxe',
    level: 1,
    objective: 'Se déplacer par petits pas en gardant sa base : les pieds ne se croisent pas et ne se rejoignent pas.',
    context: 'Déplacement de base de la boxe anglaise, utile dans d’autres disciplines. Travail seul, dans un espace dégagé.',
    prerequisites: ['garde', 'repartition-poids'],
    steps: [
      'Partir de la garde, regard devant soi.',
      'Pour avancer : déplacer d’abord le pied avant d’un petit pas, puis faire suivre le pied arrière pour retrouver l’écart de départ.',
      'Pour reculer : déplacer d’abord le pied arrière, puis faire suivre le pied avant.',
      'Pour aller sur le côté : déplacer d’abord le pied du côté où l’on va, puis faire suivre l’autre.',
      'Après chaque pas, vérifier que l’on a retrouvé sa garde et son écart de pieds.'
    ],
    errors: [
      'Croiser les pieds.',
      'Joindre les pieds en faisant suivre.',
      'Faire des pas trop longs qui déséquilibrent.',
      'Sautiller au lieu de glisser.',
      'Laisser tomber la garde pendant le déplacement.'
    ],
    exercises: ['deplacements-en-garde', 'chevilles-genou-mur', 'marche-sur-place'],
    variants: [
      'Trois petits pas aller puis trois retour, très lentement.',
      'Enchaîner avant, côté, arrière, côté pour dessiner un carré au sol.'
    ],
    limits: 'Pas de vitesse ni de partenaire dans cette fiche. La longueur du pas et l’usage du pied qui « pousse » sont à préciser avec un enseignant. Les déplacements en cercle et les changements de direction rapides ne sont pas traités.',
    joints: ['cheville', 'genou', 'hanche'],
    muscles: ['mollets', 'quadriceps', 'fessiers', 'adducteurs'],
    principles: ['base-sustentation', 'centre-masse', 'transfert-poids'],
    skills: ['appuis-pas', 'appuis-lateral', 'appuis-distance', 'spe-boxe'],
    risks: 'Chevilles sollicitées sur un sol glissant ou irrégulier ; chute possible si l’on croise les pieds.',
    transfers: [
      { to: 'escrime', note: 'La marche et la retraite de l’escrime suivent la même règle : en avançant, le pied avant part en premier ; en reculant, le pied arrière part en premier.', reliability: 'plausible' },
      { to: 'karate', note: 'Des déplacements glissés existent aussi en karaté de compétition, depuis une garde différente.', reliability: 'plausible' }
    ],
    sources: [S.boxingScotland],
    sequence: 'pas-glisse',
    editorial: reprise('sourcee')
  },
  {
    id: 'pivot',
    title: 'Le pivot sur le pied avant',
    family: 'deplacements-distance',
    disciplines: ['boxe anglaise'],
    origin: 'boxe',
    level: 2,
    objective: 'Changer d’angle en tournant autour du pied avant, sans faire de grand pas.',
    context: 'Déplacement complémentaire du pas glissé. Travail seul, lent, sur un sol qui permet de tourner sur la plante du pied.',
    prerequisites: ['pas-glisse'],
    steps: [
      'Partir de la garde, poids réparti.',
      'Porter un peu plus de poids sur l’avant du pied avant.',
      'Faire tourner le pied arrière en arc de cercle sur le côté, par petits mouvements, en pivotant sur l’avant du pied avant.',
      'Laisser les hanches et les épaules suivre le mouvement, la garde reste en place.',
      'S’arrêter et vérifier que l’on a retrouvé une garde stable face à la nouvelle direction.'
    ],
    errors: [
      'Pivoter sur le talon au lieu de l’avant du pied.',
      'Tourner seulement le buste, sans les pieds.',
      'Faire un arc trop grand et perdre l’équilibre.',
      'Forcer sur le genou avant au lieu de laisser le pied tourner.'
    ],
    exercises: ['chevilles-genou-mur', 'equilibre-unipodal', 'deplacements-en-garde'],
    variants: [
      'Pivoter dans un sens puis dans l’autre.',
      'Petit pivot de quelques centimètres seulement, pour garder le contrôle.'
    ],
    limits: 'L’amplitude du pivot et son usage tactique ne sont pas traités. Sur un sol qui accroche, le pivot peut gêner le genou : un enseignant doit vérifier le geste et l’adapter.',
    joints: ['cheville', 'genou', 'hanche'],
    muscles: ['mollets', 'fessiers', 'adducteurs', 'obliques'],
    principles: ['rotation-axiale', 'base-sustentation', 'centre-masse'],
    skills: ['appuis-pivot', 'defense-sortie-ligne', 'spe-boxe'],
    risks: 'Torsion du genou si le pied accroche au sol pendant que le corps tourne : travailler sur un sol qui laisse tourner, sans chaussures qui adhèrent trop.',
    transfers: [
      { to: 'muay-thai', note: 'Les changements d’angle autour du pied avant existent aussi en muay-thaï, souvent avec une base plus étroite.', reliability: 'plausible' }
    ],
    sources: [SOURCE_IA],
    sequence: null,
    editorial: draft()
  },
  {
    id: 'retrait-pas-arriere',
    title: 'Le retrait par un pas arrière',
    family: 'deplacements-distance',
    disciplines: ['transversal'],
    origin: 'transversal',
    level: 1,
    objective: 'Reculer d’un petit pas en restant en garde et en gardant le regard devant soi.',
    context: 'Façon simple de reprendre de la distance. Travail seul, lent, dans un espace dégagé derrière soi.',
    prerequisites: ['pas-glisse'],
    steps: [
      'Partir de la garde.',
      'Vérifier que l’espace derrière soi est libre.',
      'Reculer le pied arrière d’un petit pas, puis faire suivre le pied avant.',
      'Garder les mains en place et le regard devant soi pendant tout le mouvement.',
      'Retrouver sa garde et son écart de pieds.'
    ],
    errors: [
      'Se pencher en arrière avec le buste au lieu de reculer avec les pieds.',
      'Regarder derrière soi en tournant la tête.',
      'Reculer le pied avant en premier et se retrouver pieds joints.',
      'Baisser les mains en reculant.'
    ],
    exercises: ['deplacements-en-garde', 'equilibre-unipodal'],
    variants: [
      'Un pas arrière puis retour en avant.',
      'Retrait en diagonale arrière (à faire valider par un enseignant).'
    ],
    limits: 'Reculer en ligne droite n’est qu’une option parmi d’autres et n’est pas présenté ici comme une défense suffisante. Les usages réels sont à travailler avec un enseignant.',
    joints: ['cheville', 'genou', 'hanche'],
    muscles: ['mollets', 'quadriceps', 'fessiers'],
    principles: ['base-sustentation', 'centre-masse'],
    skills: ['defense-retrait', 'appuis-pas', 'appuis-distance'],
    risks: 'Chute en arrière si l’espace n’est pas dégagé ou si le sol glisse ; ne pas tourner la tête pour regarder derrière soi pendant le pas.',
    transfers: [
      { to: 'escrime', note: 'La retraite de l’escrime suit le même ordre (pied arrière d’abord) et sert aussi à faire « tomber court » une attaque.', reliability: 'plausible' }
    ],
    sources: [SOURCE_IA],
    sequence: 'pas-arriere',
    editorial: draft()
  },
  {
    id: 'gestion-distance',
    title: 'La gestion de la distance (notion)',
    family: 'deplacements-distance',
    disciplines: ['transversal'],
    origin: 'transversal',
    level: 2,
    objective: 'Comprendre que la distance entre deux personnes change ce qui est possible, et apprendre à la percevoir.',
    context: 'Notion de base, présentée ici sans contact. Elle se travaille seul avec un repère au sol ; une autre personne peut seulement donner un signal visuel, sans contact.',
    prerequisites: ['pas-glisse', 'retrait-pas-arriere'],
    steps: [
      'Poser un repère au sol (objet léger) et se placer en garde face à lui.',
      'Avancer et reculer par pas glissés en observant comment la distance au repère change.',
      'Chercher la distance où le bras avant tendu doucement n’atteindrait pas le repère, puis celle où il l’atteindrait.',
      'Repérer combien de petits pas séparent ces deux distances.',
      'Si une autre personne aide : elle montre seulement un signal visuel (main levée), et l’on avance ou recule d’un pas vers le repère, sans aucun contact.'
    ],
    errors: [
      'Croire qu’une seule distance convient à toutes les situations.',
      'Avancer en se penchant au lieu de se déplacer avec les pieds.',
      'Se concentrer sur les mains et oublier les pieds.'
    ],
    exercises: ['deplacements-en-garde', 'shadow-leger', 'reaction-signal'],
    variants: [
      'Changer la longueur de ses pas et observer l’effet.',
      'Faire varier la distance au repère au signal d’une autre personne (signal visuel, sans contact).'
    ],
    limits: 'La distance réelle dépend de la taille, de la discipline et de l’adversaire ; aucune distance « correcte » n’est donnée. La gestion de la distance face à quelqu’un qui attaque n’est pas traitée et demande un encadrement.',
    joints: ['cheville', 'genou', 'hanche'],
    muscles: ['mollets', 'quadriceps', 'fessiers'],
    principles: ['centre-masse', 'vitesse-precision'],
    skills: ['appuis-distance', 'lecture-indices', 'lecture-timing'],
    risks: 'Faible à vide. Avec une autre personne : signaux visuels seulement, aucun contact.',
    transfers: [
      { to: 'escrime', note: 'La distance est au cœur de l’escrime : on se défend souvent en reculant juste assez pour que l’attaque n’arrive pas.', reliability: 'plausible' },
      { to: 'lutte', note: 'En lutte, la distance se gère aussi en hauteur (changement de niveau) et par le contrôle des mains.', reliability: 'plausible' }
    ],
    sources: [SOURCE_IA],
    sequence: null,
    editorial: draft()
  },

  // ——— Techniques et enchaînements ———
  {
    id: 'direct-avant',
    title: 'Le direct avant à vide',
    family: 'techniques-enchainements',
    disciplines: ['boxe anglaise'],
    origin: 'boxe',
    level: 1,
    objective: 'Découvrir le trajet aller-retour de la main avant, à faible vitesse et sans cible.',
    context: 'Premier coup de poing travaillé à vide, seul, sans impact.',
    prerequisites: ['garde'],
    steps: [
      'Partir d’une garde relâchée et stable.',
      'Étendre doucement le bras avant vers l’avant, sans verrouiller le coude.',
      'Laisser l’autre main près du visage pendant tout le mouvement.',
      'Ramener la main par le même chemin jusqu’à la garde.',
      'Marquer un temps d’arrêt et vérifier sa position avant de recommencer.'
    ],
    errors: [
      'Verrouiller le coude en fin de mouvement.',
      'Projeter le buste vers l’avant.',
      'Oublier le retour de la main.',
      'Baisser l’autre main.',
      'Monter l’épaule et crisper la nuque.'
    ],
    exercises: ['shadow-leger', 'rotations-thoraciques', 'deplacements-en-garde'],
    variants: [
      'Direct avant en avançant d’un pas glissé.',
      'Direct avant en reculant d’un pas.'
    ],
    limits: 'Ébauche éditoriale à faire relire par un entraîneur. Ne pas utiliser ce schéma pour apprendre l’impact : frapper une cible ou un sac demande un encadrement et un équipement adaptés. Le placement exact du poing et du poignet n’est pas traité. À noter : l’étude de Liu et al. (2022) trouve des différences surtout sur la jambe avant entre boxeurs confirmés et juniors, alors que l’on enseigne souvent la poussée du pied arrière ; les deux ne s’excluent pas, le rôle des jambes est à préciser avec un entraîneur.',
    joints: ['epaule', 'coude', 'poignet', 'thoracique'],
    muscles: ['deltoides', 'triceps', 'pectoraux', 'coiffe-rotateurs', 'obliques'],
    principles: ['chaine-cinetique', 'relachement', 'vitesse-precision', 'alignement'],
    skills: ['action-direct', 'spe-boxe'],
    risks: 'Douleur au coude si l’on verrouille le bras en fin de geste ; épaule et nuque crispées. Aucun impact sans encadrement ni équipement.',
    transfers: [
      { to: 'escrime', note: 'Comme la fente, le direct allonge le bras avant d’engager tout le corps ; la revue de Chen et al. (2017) montre que les escrimeurs confirmés tendent le bras avant que le pied avant ne parte.', reliability: 'plausible' },
      { to: 'karate', note: 'Le coup de poing du bras avant en karaté (kizami-zuki) est proche, mais part souvent d’une garde plus longue et plus basse.', reliability: 'plausible' }
    ],
    sources: [S.liu2022],
    sequence: 'direct-avant',
    editorial: reprise('sourcee', sourcesAjoutees('Liu et al. (2022), direct avant'))
  },
  {
    id: 'direct-arriere',
    title: 'Le direct arrière à vide',
    family: 'techniques-enchainements',
    disciplines: ['boxe anglaise'],
    origin: 'boxe',
    level: 2,
    objective: 'Découvrir le trajet de la main arrière, avec la rotation des hanches et du pied arrière, lentement et sans cible.',
    context: 'Suite logique du direct avant. Travail seul, à vide.',
    prerequisites: ['direct-avant', 'repartition-poids'],
    steps: [
      'Partir de la garde, poids réparti.',
      'Faire tourner doucement le pied arrière sur sa plante et laisser la hanche arrière avancer un peu.',
      'Étendre le bras arrière vers l’avant pendant cette rotation, sans verrouiller le coude.',
      'Garder la main avant près du visage.',
      'Ramener la main, la hanche et le pied en position de garde.'
    ],
    errors: [
      'Lancer le bras sans faire participer les hanches.',
      'Trop tourner et se retrouver de face, déséquilibré.',
      'Pencher le buste en avant au-delà du pied avant.',
      'Baisser la main avant.',
      'Oublier le retour en garde.'
    ],
    exercises: ['rotations-thoraciques', 'gainage-planche', 'shadow-leger'],
    variants: [
      'Décomposer : d’abord la rotation du pied et de la hanche seule, puis ajouter le bras.',
      'Alterner un direct avant et un direct arrière, très lentement.'
    ],
    limits: 'L’amplitude de rotation est à ajuster par un enseignant selon la personne. Pas d’impact, pas de cible : la frappe réelle n’est pas traitée. Le placement du poing n’est pas traité. La source citée porte sur huit boxeurs confirmés : elle confirme le rôle de la poussée des jambes, pas les détails de cette fiche.',
    joints: ['cheville', 'genou', 'hanche', 'thoracique', 'epaule', 'coude'],
    muscles: ['mollets', 'quadriceps', 'fessiers', 'obliques', 'pectoraux', 'deltoides', 'triceps'],
    principles: ['chaine-cinetique', 'rotation-axiale', 'transfert-poids', 'stabilite-proximale'],
    skills: ['action-direct', 'appuis-pivot', 'spe-boxe'],
    risks: 'Torsion du genou arrière si le pied ne pivote pas ; bas du dos sollicité si l’on tourne trop loin ; coude verrouillé en fin de geste.',
    transfers: [
      { to: 'karate', note: 'Le gyaku-zuki (coup de poing inversé) du karaté utilise aussi la rotation des hanches avec le bras arrière, depuis une posture plus longue.', reliability: 'plausible' }
    ],
    sources: [S.cheraghi2014],
    sequence: 'direct-arriere',
    editorial: draft('sourcee', sourcesAjoutees('Cheraghi et al. (2014), direct du bras arrière'))
  },
  {
    id: 'crochet-a-vide',
    title: 'Le crochet à vide (découverte)',
    family: 'techniques-enchainements',
    disciplines: ['boxe anglaise'],
    origin: 'boxe',
    level: 3,
    objective: 'Découvrir un trajet de bras en arc de cercle, porté par la rotation du buste, lentement et sans cible.',
    context: 'Technique plus délicate que les directs. Fiche de découverte seulement, travail seul et à vide.',
    prerequisites: ['direct-arriere', 'gainage-rotation'],
    steps: [
      'Partir de la garde.',
      'Plier le bras avant à peu près à l’horizontale, coude à hauteur de l’épaule ou un peu en dessous, sans forcer l’épaule.',
      'Faire tourner doucement le buste et le pied avant pour que le bras décrive un petit arc vers l’intérieur.',
      'Garder l’autre main près du visage.',
      'Revenir en garde par le même chemin.'
    ],
    errors: [
      'Faire un grand geste du bras sans rotation du corps.',
      'Ouvrir le bras très loin avant de le ramener.',
      'Lever l’épaule et crisper la nuque.',
      'Baisser l’autre main.'
    ],
    exercises: ['rotations-thoraciques', 'gainage-planche', 'shadow-leger'],
    variants: [
      'Rotation du buste seule, bras en garde, avant d’ajouter le trajet du bras.',
      'Crochet du bras arrière, à découvrir seulement avec un enseignant.'
    ],
    limits: 'Fiche de découverte très simplifiée. La position exacte du coude, du poignet et du poing, ainsi que l’amplitude, doivent être enseignées par un entraîneur. Aucun impact : frapper en crochet sans encadrement expose le poignet et l’épaule.',
    joints: ['thoracique', 'epaule', 'coude', 'hanche', 'cheville'],
    muscles: ['obliques', 'deltoides', 'pectoraux', 'coiffe-rotateurs', 'abdominaux'],
    principles: ['rotation-axiale', 'chaine-cinetique', 'stabilite-proximale'],
    skills: ['action-circulaire', 'spe-boxe'],
    risks: 'Poignet et épaule exposés si le geste est frappé sans encadrement ; bas du dos sollicité si la rotation est forcée.',
    transfers: [
      { to: 'muay-thai', note: 'Le crochet existe aussi en muay-thaï ; la même rotation du buste sert aux coups de coude, à n’aborder qu’avec un enseignant.', reliability: 'plausible' }
    ],
    sources: [SOURCE_IA],
    sequence: 'crochet',
    editorial: draft()
  },
  {
    id: 'coup-pied-face-bas',
    title: 'Le coup de pied de face bas à vide (équilibre)',
    family: 'techniques-enchainements',
    disciplines: ['transversal'],
    origin: 'transversal',
    level: 2,
    objective: 'Travailler l’équilibre sur une jambe en levant le genou puis en dépliant doucement la jambe vers l’avant, à faible hauteur.',
    context: 'Geste présent dans de nombreuses disciplines, sous des formes variées. Ici, uniquement comme exercice d’équilibre et de contrôle, à vide, à hauteur basse.',
    prerequisites: ['repartition-poids', 'mobilite-hanches'],
    steps: [
      'Partir de la garde, près d’un mur ou d’un appui si besoin.',
      'Porter le poids sur la jambe d’appui, genou d’appui légèrement souple.',
      'Monter le genou de l’autre jambe devant soi, à une hauteur confortable.',
      'Déplier doucement la jambe vers l’avant, à hauteur basse, sans verrouiller le genou.',
      'Replier la jambe, reposer le pied et retrouver sa garde.'
    ],
    errors: [
      'Se pencher fortement en arrière pour monter la jambe.',
      'Verrouiller le genou en fin de mouvement.',
      'Bloquer le genou de la jambe d’appui.',
      'Chercher la hauteur au détriment de l’équilibre.',
      'Baisser les mains.'
    ],
    exercises: ['equilibre-unipodal', 'hanches-90-90', 'fente-basse-flechisseurs'],
    variants: [
      'Monter seulement le genou et tenir l’équilibre, sans déplier la jambe.',
      'Faire le geste en se tenant légèrement à un mur.'
    ],
    limits: 'La surface de contact du pied, la hauteur et l’usage réel du coup de pied dépendent de la discipline et ne sont pas traités. Aucun impact, aucune cible. Un enseignant doit adapter la hauteur et la forme du geste.',
    joints: ['hanche', 'genou', 'cheville'],
    muscles: ['flechisseurs-hanche', 'quadriceps', 'fessiers', 'mollets', 'abdominaux'],
    principles: ['base-sustentation', 'centre-masse', 'alignement'],
    skills: ['action-pied', 'corps-equilibre'],
    risks: 'Chute si l’équilibre manque ; genou en hyperextension si on le verrouille ; arrière de la cuisse qui tire si l’on cherche la hauteur.',
    transfers: [
      { to: 'muay-thai', note: 'Le teep du muay-thaï part de la même montée du genou, puis pousse avec la plante du pied.', reliability: 'plausible' },
      { to: 'karate', note: 'Le mae-geri du karaté part aussi d’une montée du genou ; le retour de la jambe y est très travaillé.', reliability: 'plausible' }
    ],
    sources: [SOURCE_IA],
    sequence: 'coup-pied-avant',
    editorial: draft()
  },
  {
    id: 'enchainement-direct-direct-retrait',
    title: 'Enchaînement : direct avant, direct arrière, retrait',
    family: 'techniques-enchainements',
    disciplines: ['boxe anglaise'],
    origin: 'boxe',
    level: 2,
    objective: 'Relier trois éléments connus en gardant sa garde et son équilibre entre chacun.',
    context: 'Premier enchaînement court, à vide, seul. L’objectif est la propreté du lien, pas la vitesse.',
    prerequisites: ['direct-avant', 'direct-arriere', 'retrait-pas-arriere'],
    steps: [
      'Partir de la garde.',
      'Direct avant à vide, retour de la main.',
      'Direct arrière à vide, retour de la main et des hanches.',
      'Petit pas arrière, regard devant soi.',
      'Retrouver sa garde, faire une pause, vérifier sa position.'
    ],
    errors: [
      'Accélérer et perdre la forme des gestes.',
      'Reculer avant d’avoir ramené la main.',
      'Finir pieds joints ou déséquilibré.',
      'Baisser les mains pendant le retrait.'
    ],
    exercises: ['shadow-leger', 'deplacements-en-garde', 'rotations-thoraciques'],
    variants: [
      'Faire une pause entre chaque élément, puis réduire peu à peu les pauses.',
      'Remplacer le retrait par un pas latéral (à faire valider par un enseignant).'
    ],
    limits: 'Enchaînement d’apprentissage, à vide, sans partenaire ni cible. Il ne prépare pas à un échange réel. Le rythme et les choix d’enchaînement sont à travailler avec un enseignant.',
    joints: ['epaule', 'coude', 'hanche', 'genou', 'cheville'],
    muscles: ['deltoides', 'triceps', 'obliques', 'mollets', 'quadriceps'],
    principles: ['chaine-cinetique', 'transfert-poids', 'base-sustentation', 'relachement'],
    skills: ['action-enchainement', 'defense-retrait', 'spe-boxe'],
    risks: 'Accélérer trop tôt dégrade la forme ; coude verrouillé ; perte d’équilibre en reculant si l’espace n’est pas dégagé.',
    transfers: [
      { to: 'karate', note: 'Enchaîner une technique puis une sortie de distance est aussi travaillé en karaté de compétition, avec d’autres règles de touche.', reliability: 'plausible' }
    ],
    sources: [SOURCE_IA],
    sequence: null,
    editorial: draft()
  },

  // ——— Défenses ———
  {
    id: 'esquive-laterale',
    title: 'L’esquive latérale (rotation du buste)',
    family: 'defenses',
    disciplines: ['boxe anglaise'],
    origin: 'boxe',
    level: 2,
    objective: 'Déplacer légèrement la tête sur le côté par une petite flexion des jambes et une rotation du buste, en restant en équilibre.',
    context: 'Mouvement défensif travaillé ici seul, à vide, sans personne qui envoie de coup.',
    prerequisites: ['garde', 'repartition-poids'],
    steps: [
      'Partir de la garde.',
      'Plier légèrement les genoux et tourner un peu le buste pour déplacer la tête sur le côté, d’une petite distance.',
      'Garder les mains en place et le regard devant soi.',
      'Revenir au centre par le même chemin.',
      'Recommencer de l’autre côté.'
    ],
    errors: [
      'Se pencher seulement avec le cou.',
      'Pencher le buste très loin sur le côté et perdre l’équilibre.',
      'Fermer les yeux ou détourner le regard.',
      'Baisser les mains.'
    ],
    exercises: ['rotations-thoraciques', 'gainage-planche', 'reaction-signal'],
    variants: [
      'Esquiver au signal visuel d’une autre personne (main levée à gauche ou à droite, sans geste vers vous).',
      'Enchaîner une esquive puis un retour en garde avec un petit pas.'
    ],
    limits: 'Aucune personne n’envoie de coup dans cette fiche. Esquiver face à un partenaire réel demande un encadrement, une progression et un équipement adaptés. L’amplitude du mouvement est à ajuster avec un enseignant.',
    joints: ['thoracique', 'lombaires', 'genou', 'cou'],
    muscles: ['obliques', 'abdominaux', 'quadriceps', 'erecteurs'],
    principles: ['rotation-axiale', 'centre-masse', 'base-sustentation'],
    skills: ['defense-esquive', 'defense-sortie-ligne', 'spe-boxe'],
    risks: 'Nuque sollicitée si l’on se penche avec le cou ; perte d’équilibre si l’on penche trop loin.',
    transfers: [
      { to: 'muay-thai', note: 'Les esquives du buste existent en muay-thaï, mais les coups de pied et de genou rendent souvent les grands mouvements de tête plus risqués.', reliability: 'plausible' }
    ],
    sources: [SOURCE_IA],
    sequence: 'esquive-laterale',
    editorial: draft()
  },
  {
    id: 'parade-couvert',
    title: 'La parade et le blocage couvert (découverte)',
    family: 'defenses',
    disciplines: ['boxe anglaise'],
    origin: 'boxe',
    level: 2,
    objective: 'Découvrir, à vide, la position des bras quand on se couvre, et un petit mouvement de main pour dévier.',
    context: 'Fiche de découverte, travail seul devant un miroir. Aucun coup reçu.',
    prerequisites: ['garde'],
    steps: [
      'Partir de la garde.',
      'Couvert : remonter les avant-bras près du visage, coudes proches du corps, menton rentré, sans crisper.',
      'Revenir en garde normale.',
      'Parade : avec la main arrière, faire un petit mouvement court vers l’intérieur devant le visage, puis revenir.',
      'Garder le regard devant soi pendant tout le mouvement.'
    ],
    errors: [
      'Se cacher derrière les bras en fermant les yeux.',
      'Faire de grands gestes de bras qui ouvrent la garde.',
      'Crisper fortement les épaules.',
      'Reculer le buste au lieu de rester stable.'
    ],
    exercises: ['shadow-leger', 'reaction-signal', 'gainage-planche'],
    variants: [
      'Passer en couvert au signal visuel d’une autre personne, sans aucun contact.',
      'Alterner couvert et retour en garde avec un petit pas arrière.'
    ],
    limits: 'Brouillon de découverte. Ni la parade ni le couvert ne sont présentés comme des protections suffisantes. Recevoir des coups, même légers, demande un encadrement et un équipement adaptés. Les formes exactes varient selon les disciplines et doivent être enseignées.',
    joints: ['epaule', 'coude', 'poignet', 'cou'],
    muscles: ['deltoides', 'avant-bras', 'trapezes', 'coiffe-rotateurs'],
    principles: ['relachement', 'vitesse-precision', 'stabilite-proximale'],
    skills: ['defense-parade', 'defense-garde', 'spe-boxe'],
    risks: 'Épaules et nuque crispées ; faux sentiment de protection : rien ici ne prépare à recevoir des coups.',
    transfers: [
      { to: 'escrime', note: 'La parade d’escrime dévie aussi l’attaque par un petit mouvement, mais avec la lame, et elle est suivie d’une riposte.', reliability: 'plausible' }
    ],
    sources: [SOURCE_IA],
    sequence: null,
    editorial: draft()
  },

  // ——— Notions tactiques et pédagogiques ———
  {
    id: 'apprendre-lentement',
    title: 'Apprendre lentement, puis accélérer',
    family: 'notions-tactiques-pedagogiques',
    disciplines: ['transversal'],
    origin: 'transversal',
    level: 1,
    objective: 'Comprendre pourquoi on découvre un geste lentement, et comment augmenter la vitesse sans perdre la forme.',
    context: 'Principe pédagogique courant, utile pour toutes les fiches techniques de la bibliothèque.',
    prerequisites: [],
    steps: [
      'Découvrir le geste très lentement, en pouvant s’arrêter à tout moment.',
      'Vérifier les points d’attention de la fiche (miroir, vidéo, ou avis d’un enseignant).',
      'Répéter à la même vitesse lente jusqu’à ce que la forme reste stable.',
      'Augmenter un peu la vitesse, en gardant la même forme.',
      'Revenir à une vitesse plus lente dès que la forme se dégrade ou que la fatigue apparaît.'
    ],
    errors: [
      'Aller vite trop tôt et répéter un geste approximatif.',
      'Ne jamais accélérer et rester bloqué sur une forme figée.',
      'Continuer à répéter alors que la fatigue déforme le geste.'
    ],
    exercises: ['shadow-leger', 'marche-sur-place'],
    variants: [
      'Décomposer un geste en étapes, puis les relier.',
      'Utiliser la lecture lente du moteur de mouvement de l’application pour observer un geste.'
    ],
    limits: 'Principe général, pas une méthode complète. Il ne fixe ni vitesse, ni nombre de répétitions. Un enseignant reste le mieux placé pour dire quand passer à l’étape suivante.',
    joints: [],
    muscles: [],
    principles: ['vitesse-precision', 'relachement'],
    skills: ['corps-coordination', 'trans-transfert'],
    risks: 'Aucun risque propre. La fatigue déforme le geste : s’arrêter quand la forme se dégrade.',
    transfers: [
      { to: 'transversal', note: 'Principe pédagogique courant dans toutes les disciplines ; il s’applique à chaque fiche de la bibliothèque.', reliability: 'plausible' }
    ],
    sources: [SOURCE_IA],
    sequence: null,
    editorial: draft()
  },
  {
    id: 'rythme-feinte',
    title: 'Rythme et feinte (notion)',
    family: 'notions-tactiques-pedagogiques',
    disciplines: ['transversal'],
    origin: 'transversal',
    level: 3,
    objective: 'Comprendre qu’on peut varier le rythme de ses gestes et faire mine de commencer un mouvement, et l’explorer seul, à vide.',
    context: 'Notion tactique présentée sans contact et sans adversaire. Exploration seulement.',
    prerequisites: ['gestion-distance', 'direct-avant', 'apprendre-lentement'],
    steps: [
      'En garde, faire quelques pas glissés à un rythme régulier.',
      'Changer le rythme : une pause, puis deux pas rapprochés, puis une pause.',
      'Faire mine de commencer un direct avant (petite amorce de l’épaule ou de la main), puis revenir en garde sans terminer le geste.',
      'Enchaîner une amorce puis un vrai direct avant à vide, lentement.',
      'Observer, en se filmant, si l’amorce et le vrai geste se ressemblent au début.'
    ],
    errors: [
      'Faire des amorces si grandes qu’elles ouvrent la garde.',
      'Garder un rythme toujours identique.',
      'Oublier ses appuis en se concentrant sur la feinte.'
    ],
    exercises: ['shadow-leger', 'deplacements-en-garde', 'reaction-signal'],
    variants: [
      'Varier le rythme au signal visuel d’une autre personne, sans contact.',
      'Feinte avec les pieds (petit appui sans déplacement).'
    ],
    limits: 'Exploration à vide uniquement. L’effet réel d’une feinte dépend de la personne en face et ne peut pas être évalué ici. L’usage tactique est à travailler avec un enseignant.',
    joints: ['epaule', 'cheville'],
    muscles: ['deltoides', 'mollets'],
    principles: ['vitesse-precision', 'relachement'],
    skills: ['lecture-rythme', 'lecture-anticipation', 'lecture-timing'],
    risks: 'Faible à vide. Amorces trop grandes qui ouvrent la garde.',
    transfers: [
      { to: 'escrime', note: 'La feinte est un élément central de l’escrime, où elle sert à provoquer une parade pour attaquer ailleurs.', reliability: 'plausible' }
    ],
    sources: [SOURCE_IA],
    sequence: null,
    editorial: draft()
  },

  // ——— Préparation associée ———
  {
    id: 'mobilite-hanches',
    title: 'Mobilité des hanches pour les coups de pied',
    family: 'preparation-associee',
    disciplines: ['transversal'],
    origin: 'transversal',
    level: 1,
    objective: 'Préparer les hanches à monter le genou et à bouger la jambe avec plus d’aisance, par des mouvements doux.',
    context: 'Travail complémentaire courant avant les fiches de coups de pied. Seul, sans matériel ou avec un tapis.',
    prerequisites: [],
    steps: [
      'Commencer par quelques minutes de marche sur place pour se réchauffer.',
      'Faire des cercles de hanches lents, dans les deux sens.',
      'Monter le genou devant soi, en se tenant à un appui si besoin, puis le reposer.',
      'Ouvrir doucement le genou sur le côté, puis le ramener.',
      'Finir par des étirements doux des hanches, sans à-coups et sans douleur.'
    ],
    errors: [
      'Chercher l’amplitude maximale dès le début.',
      'Faire des mouvements brusques ou des rebonds.',
      'Continuer malgré une douleur.',
      'Bloquer la respiration.'
    ],
    exercises: ['marche-sur-place', 'hanches-90-90', 'fente-basse-flechisseurs', 'fente-arriere'],
    variants: [
      'Version au sol sur un tapis.',
      'Version debout avec un appui au mur.'
    ],
    limits: 'Préparation générale, pas un programme de souplesse. En cas de gêne ou de douleur persistante, arrêter et demander conseil à un professionnel de santé. Un enseignant peut adapter les mouvements à sa discipline.',
    joints: ['hanche', 'lombaires'],
    muscles: ['flechisseurs-hanche', 'adducteurs', 'fessiers', 'ischios'],
    principles: ['relachement', 'alignement'],
    skills: ['corps-mobilite', 'corps-souplesse'],
    risks: 'Aine ou bas du dos douloureux si l’on force l’amplitude ou si l’on fait des rebonds.',
    transfers: [
      { to: 'muay-thai', note: 'Des hanches mobiles facilitent la montée du genou pour le teep et le blocage avec le tibia.', reliability: 'plausible' },
      { to: 'jjb', note: 'La mobilité des hanches est très sollicitée au sol, par exemple dans l’échappement de hanche.', reliability: 'plausible' }
    ],
    sources: [SOURCE_IA],
    sequence: null,
    editorial: draft()
  },
  {
    id: 'gainage-rotation',
    title: 'Gainage et rotation du buste',
    family: 'preparation-associee',
    disciplines: ['transversal'],
    origin: 'transversal',
    level: 1,
    objective: 'Associer un tronc tenu (gainage) et une rotation contrôlée du buste, utilisés dans les directs, les crochets et les esquives.',
    context: 'Travail complémentaire courant. Seul, sans matériel ou avec un tapis.',
    prerequisites: [],
    steps: [
      'Gainage : tenir une planche courte, corps aligné, en respirant.',
      'Se relever, pieds à largeur de bassin, genoux souples.',
      'Rotation : tourner lentement le buste d’un côté puis de l’autre, bassin stable, bras croisés ou en garde.',
      'Puis laisser les hanches et les pieds participer, comme pour un direct arrière, lentement.',
      'Finir par quelques respirations calmes.'
    ],
    errors: [
      'Laisser le bassin s’affaisser ou monter en planche.',
      'Bloquer la respiration.',
      'Tourner brusquement ou forcer en fin de rotation.',
      'Tourner seulement la tête.'
    ],
    exercises: ['gainage-planche', 'rotations-thoraciques', 'shadow-leger'],
    variants: [
      'Planche sur les genoux, plus simple.',
      'Rotation en position de garde, avec un petit transfert de poids.'
    ],
    limits: 'Préparation générale, sans durée ni nombre de répétitions imposés. En cas de gêne au dos, arrêter et demander conseil à un professionnel de santé. Un enseignant peut adapter le travail à sa discipline.',
    joints: ['lombaires', 'thoracique', 'hanche'],
    muscles: ['abdominaux', 'obliques', 'erecteurs', 'fessiers'],
    principles: ['stabilite-proximale', 'rotation-axiale'],
    skills: ['corps-gainage', 'corps-coordination'],
    risks: 'Bas du dos sollicité si le bassin s’affaisse en planche ou si l’on force la rotation.',
    transfers: [
      { to: 'karate', note: 'Le gyaku-zuki demande la même association d’un tronc tenu et d’une rotation des hanches.', reliability: 'plausible' },
      { to: 'lutte', note: 'Un tronc tenu protège le dos pendant le changement de niveau et le sprawl.', reliability: 'plausible' }
    ],
    sources: [SOURCE_IA],
    sequence: null,
    editorial: draft()
  },

  // ════════════ Fiches ajoutées au modèle v2 (autres disciplines) ════════════

  // ——— Escrime ———
  {
    id: 'escrime-garde',
    title: 'La garde d’escrime (en garde)',
    family: 'gardes-postures-appuis',
    disciplines: ['escrime'],
    origin: 'escrime',
    level: 1,
    objective: 'Prendre la position de départ de l’escrime : de profil, genoux fléchis, bras armé devant, poids réparti entre les deux pieds.',
    context: 'Fiche de découverte, seul et sans arme : on se place, on tient la position, on vérifie au miroir. Le maniement de l’arme et l’assaut se font en club, avec un maître d’armes et l’équipement complet.',
    prerequisites: [],
    steps: [
      'Debout, talons proches, pieds en équerre : le pied avant pointe vers l’avant, le pied arrière est tourné sur le côté.',
      'Avancer le pied avant d’un pas modéré, en restant sur la ligne du talon arrière.',
      'Plier les deux genoux : le genou avant reste au-dessus du pied avant, le genou arrière s’ouvre dans l’axe du pied arrière.',
      'Garder le buste droit et de profil, le poids réparti entre les deux pieds.',
      'Bras armé devant, coude légèrement fléchi, main à peu près à hauteur de poitrine ; l’autre bras relevé en arrière, détendu.'
    ],
    errors: [
      'Genou avant qui dépasse nettement le pied ou part vers l’intérieur.',
      'Genou arrière qui rentre vers l’intérieur au lieu de suivre le pied.',
      'Buste penché en avant ou tourné de face.',
      'Épaule du bras armé remontée et crispée.',
      'Garde si basse qu’on ne peut plus bouger.'
    ],
    exercises: ['chaise-murale', 'chevilles-genou-mur', 'equilibre-unipodal'],
    variants: [
      'Prendre la garde, la tenir quelques respirations, se redresser, recommencer.',
      'Garde de l’autre côté, pour découvrir la latéralité.'
    ],
    limits: 'Description générale. La largeur et la hauteur de la garde, l’angle du pied arrière et la place du bras varient selon l’arme (fleuret, épée, sabre) et l’école : un maître d’armes doit les régler. Les pratiques ne sont pas unanimes sur l’angle du pied arrière : la revue de Chen et al. (2017) rapporte une étude où un pied arrière perpendiculaire donnait la fente la plus rapide et la plus puissante, mais d’autres placements sont enseignés. Aucun maniement d’arme ici.',
    joints: ['cheville', 'genou', 'hanche', 'epaule'],
    muscles: ['quadriceps', 'fessiers', 'adducteurs', 'mollets', 'deltoides'],
    principles: ['base-sustentation', 'centre-masse', 'alignement', 'relachement'],
    skills: ['appuis-posture', 'defense-garde', 'spe-escrime'],
    risks: 'Genoux sollicités si la garde est trop basse ou si les genoux ne suivent pas l’axe des pieds. Ne jamais manier une arme, même d’entraînement, sans masque, veste, gant et encadrement.',
    transfers: [
      { to: 'boxe', note: 'De profil et genoux fléchis comme en boxe, mais la garde d’escrime est plus de profil et plus basse, et le bras avant tient l’arme au lieu de protéger le visage.', reliability: 'plausible' },
      { to: 'karate', note: 'Comme dans les postures longues du karaté, les genoux doivent rester dans l’axe des pieds ; rapprochement supposé, non étudié.', reliability: 'experimental' }
    ],
    sources: [S.chen2017, S.nwFencing],
    sequence: 'escrime-garde',
    editorial: nouvelle('sourcee')
  },
  {
    id: 'escrime-marche-retraite',
    title: 'La marche et la retraite (escrime)',
    family: 'deplacements-distance',
    disciplines: ['escrime'],
    origin: 'escrime',
    level: 1,
    objective: 'Avancer et reculer en garde en gardant le même écart entre les pieds, pour régler la distance.',
    context: 'Déplacements de base de l’escrime, travaillés seul, sans arme, sur une ligne droite (une piste tracée au sol suffit).',
    prerequisites: ['escrime-garde'],
    steps: [
      'Partir de la garde d’escrime.',
      'Marche : avancer d’abord le pied avant d’un petit pas, en le posant talon puis plante, puis faire suivre le pied arrière de la même distance.',
      'Retraite : reculer d’abord le pied arrière, puis faire suivre le pied avant de la même distance.',
      'Garder la même hauteur pendant tout le déplacement : la tête ne monte ni ne descend.',
      'Après chaque pas, vérifier que l’on a retrouvé sa garde et son écart de pieds.'
    ],
    errors: [
      'Croiser ou rapprocher les pieds.',
      'Sautiller ou remonter à chaque pas.',
      'Pencher le buste pour aller plus vite.',
      'Pas du pied suiveur plus long ou plus court que le premier.'
    ],
    exercises: ['deplacements-en-garde', 'echelle-au-sol', 'chevilles-genou-mur'],
    variants: [
      'Deux marches, une retraite, en changeant de rythme.',
      'Au signal visuel d’une autre personne : marche ou retraite, sans contact.'
    ],
    limits: 'Ni vitesse ni arme. Les autres déplacements (bond avant, marche croisée, flèche) ne sont pas traités. Un maître d’armes doit corriger la longueur des pas et la hauteur de garde.',
    joints: ['cheville', 'genou', 'hanche'],
    muscles: ['mollets', 'quadriceps', 'fessiers', 'adducteurs'],
    principles: ['base-sustentation', 'centre-masse', 'transfert-poids'],
    skills: ['appuis-pas', 'appuis-distance', 'spe-escrime'],
    risks: 'Chevilles, mollets et genoux sollicités par la répétition sur sol dur ; la revue de Chen et al. (2017) signale des douleurs du tendon d’Achille et de la rotule fréquentes chez les escrimeurs : augmenter le volume progressivement.',
    transfers: [
      { to: 'boxe', note: 'Même règle que le pas glissé de boxe : en avançant, le pied avant part en premier ; en reculant, le pied arrière part en premier.', reliability: 'plausible' }
    ],
    sources: [S.nwFencing, S.chen2017],
    sequence: 'escrime-garde',
    editorial: nouvelle('sourcee')
  },
  {
    id: 'escrime-fente',
    title: 'La fente (escrime, à vide)',
    family: 'techniques-enchainements',
    disciplines: ['escrime'],
    origin: 'escrime',
    level: 2,
    objective: 'Découvrir la fente : le bras s’allonge d’abord, puis la jambe avant part pendant que la jambe arrière pousse, et l’on revient en garde.',
    context: 'Action d’attaque de base de l’escrime, travaillée seul, sans arme, lentement et à faible amplitude. La fente complète charge beaucoup le genou avant : progresser par petites fentes.',
    prerequisites: ['escrime-marche-retraite'],
    steps: [
      'Partir de la garde d’escrime.',
      'Allonger d’abord le bras avant vers une cible imaginaire, sans raidir l’épaule.',
      'Lancer le pied avant vers l’avant, près du sol, pendant que la jambe arrière pousse et se tend.',
      'Se recevoir sur le talon avant, genou avant au-dessus de la cheville et non au-delà, buste droit.',
      'Revenir en garde : plier d’abord le genou arrière, puis repousser avec la jambe avant.'
    ],
    errors: [
      'Partir avec le pied ou le buste avant d’allonger le bras.',
      'Genou avant qui dépasse la pointe du pied ou part vers l’intérieur.',
      'Buste penché en avant.',
      'Pied arrière qui roule sur le côté ou décolle.',
      'Fente trop longue pour pouvoir revenir en garde.'
    ],
    exercises: ['fente-arriere', 'squat-poids-corps', 'fente-basse-flechisseurs'],
    variants: [
      'Seulement l’allongement du bras, puis une toute petite fente.',
      'Marche puis fente (marche-fente), lentement.'
    ],
    limits: 'Initiation à vide : ni arme, ni cible, ni adversaire. La longueur de fente, le moment du départ et la position de la main dépendent de l’arme et du maître d’armes. Les études portent surtout sur des escrimeurs confirmés : selon la revue de Chen et al. (2017), ceux-ci allongent le bras avant que le pied avant ne parte, alors que les débutants le font plus tard ; c’est cohérent avec la consigne du guide de club cité.',
    joints: ['cheville', 'genou', 'hanche', 'epaule', 'coude'],
    muscles: ['quadriceps', 'fessiers', 'ischios', 'mollets', 'deltoides', 'triceps'],
    principles: ['chaine-cinetique', 'transfert-poids', 'base-sustentation', 'vitesse-precision'],
    skills: ['action-direct', 'action-entree', 'appuis-distance', 'spe-escrime'],
    risks: 'Genou avant et tendon d’Achille très sollicités par la réception ; douleurs de rotule fréquentes chez les escrimeurs selon la revue de Chen et al. (2017). Sol non glissant, chaussures qui amortissent, petites fentes au début. Aucune arme sans équipement complet ni encadrement.',
    transfers: [
      { to: 'boxe', note: 'Comme le direct, la fente allonge le bras avant d’engager tout le corps, mais elle couvre une distance bien plus grande grâce à la poussée de la jambe arrière.', reliability: 'plausible' },
      { to: 'karate', note: 'La poussée de la jambe arrière rappelle les entrées en ligne droite du karaté de compétition ; transfert supposé, non étudié.', reliability: 'experimental' }
    ],
    sources: [S.chen2017, S.nwFencing],
    sequence: 'escrime-fente',
    editorial: nouvelle('sourcee')
  },
  {
    id: 'escrime-parade-riposte',
    title: 'Parade et riposte simples (escrime, à vide)',
    family: 'defenses',
    disciplines: ['escrime'],
    origin: 'escrime',
    level: 2,
    objective: 'Découvrir le principe de la parade (dévier par un petit mouvement latéral de la main) suivie aussitôt d’une riposte (allongement du bras).',
    context: 'Découverte seul et sans arme, ou avec un partenaire coopératif qui donne seulement un signal de la main, sans contact. Le vrai travail de lame se fait en club, masqué et équipé.',
    prerequisites: ['escrime-fente'],
    steps: [
      'Partir de la garde, bras avant légèrement fléchi.',
      'Parade : déplacer la main d’un petit mouvement latéral, d’une position pouce en haut (sixte) à une position main tournée paume vers le bas (quarte), sans écarter le coude.',
      'S’arrêter un instant et vérifier que la main est restée devant soi.',
      'Riposte : allonger aussitôt le bras vers une cible imaginaire, d’abord sans bouger les pieds.',
      'Revenir en garde. Plus tard, ajouter une petite fente à la riposte.'
    ],
    errors: [
      'Grand geste de bras qui ouvre la garde.',
      'Coude qui s’écarte du corps.',
      'Riposte en retard, après une pause.',
      'Regarder sa main au lieu de regarder devant soi.'
    ],
    exercises: ['reaction-signal', 'shadow-leger', 'balle-contre-mur'],
    variants: [
      'Au signal visuel d’un partenaire (main levée d’un côté), parer du bon côté puis riposter dans le vide.',
      'Parer en reculant d’un pas, puis riposter.'
    ],
    limits: 'Seules deux positions de main sont abordées. Le nom et le nombre des parades varient selon l’arme ; le sabre utilise d’autres parades. Aucun travail de lame : il exige masque, veste, gant, arme d’entraînement et maître d’armes.',
    joints: ['epaule', 'coude', 'poignet'],
    muscles: ['avant-bras', 'deltoides', 'coiffe-rotateurs', 'triceps'],
    principles: ['vitesse-precision', 'relachement', 'stabilite-proximale'],
    skills: ['defense-parade', 'lecture-timing', 'spe-escrime'],
    risks: 'Faible à vide. Avec une arme : blessure par la lame sans équipement complet ; poignet et coude sollicités par la répétition.',
    transfers: [
      { to: 'boxe', note: 'La parade de boxe dévie aussi par un petit geste de main, sans lame ; l’idée « dévier puis répondre aussitôt » se retrouve.', reliability: 'plausible' }
    ],
    sources: [S.nwFencing],
    sequence: 'escrime-parade-riposte',
    editorial: nouvelle('sourcee')
  },

  // ——— Judo ———
  {
    id: 'judo-chute-arriere',
    title: 'La chute arrière (ushiro ukemi) — sur tapis, avec un enseignant',
    family: 'chutes-controles',
    disciplines: ['judo'],
    origin: 'judo',
    level: 2,
    objective: 'Apprendre à tomber en arrière sans que la tête touche le sol, en arrondissant le dos et en frappant le tapis avec les bras.',
    context: 'Premier apprentissage du judo. Uniquement sur un tapis adapté (tatami), sous la surveillance d’un enseignant qualifié, en commençant au sol. Jamais sur un sol dur, jamais à la suite d’une projection sans encadrement.',
    prerequisites: [],
    steps: [
      'Allongé sur le dos sur le tapis : rentrer le menton vers la poitrine, regarder la ceinture, frapper le tapis des deux mains, paumes à plat, bras écartés du corps en biais.',
      'Assis, bras croisés devant la poitrine : rouler doucement en arrière en berceau, dos arrondi, menton rentré, puis revenir.',
      'Assis : rouler en arrière et frapper le tapis des deux mains quand le dos le touche, tête toujours décollée.',
      'Accroupi : poser les fesses près des talons, rouler en arrière en gardant les genoux au-dessus du ventre, frapper des deux mains.',
      'Debout, seulement quand l’enseignant le valide : s’accroupir, puis rouler en arrière de la même façon.'
    ],
    errors: [
      'Tête qui part en arrière et touche le tapis.',
      'Mains posées derrière soi pour amortir (poignets, coudes, épaules en danger).',
      'Dos plat qui tape d’un coup au lieu de rouler.',
      'Jambes croisées.',
      'Corps trop relâché au lieu d’un tonus suffisant.'
    ],
    exercises: ['dead-bug', 'chat-vache', 'gainage-planche'],
    variants: [
      'Rester au berceau (assis, bras croisés) tant que la tête n’est pas parfaitement contrôlée.',
      'Chute sur le côté (yoko ukemi), à découvrir ensuite avec l’enseignant.'
    ],
    limits: 'Cette fiche aide à comprendre et à préparer la chute ; elle ne remplace pas l’apprentissage en club. Le guide de Judo Québec date de 1995 (révisé en 2000) et l’étude de Murayama et al. (2020) ne porte que sur deux experts : les consignes concordent (tête qui ne touche pas le tapis), mais l’enseignant reste la référence. Aucune projection, même lente, sans enseignant ni partenaire formé.',
    joints: ['cou', 'thoracique', 'lombaires', 'epaule', 'hanche'],
    muscles: ['abdominaux', 'flechisseurs-hanche', 'trapezes', 'dorsaux', 'triceps'],
    principles: ['centre-masse', 'alignement', 'stabilite-proximale'],
    skills: ['defense-chute', 'corps-gainage', 'spe-judo'],
    risks: 'Choc à la tête et blessure de la nuque si la tête n’est pas tenue ; poignet, coude ou épaule si l’on pose les mains derrière soi. Uniquement sur tapis adapté, avec un enseignant qualifié, en progressant depuis le sol. Pas de chute depuis la position debout seul à la maison.',
    transfers: [
      { to: 'jjb', note: 'Le jiu-jitsu brésilien enseigne aussi des chutes arrière ; savoir tomber protège dans toutes les disciplines de saisie.', reliability: 'plausible' },
      { to: 'lutte', note: 'La lutte comporte des projections : tenir la tête et ne pas amortir avec les mains tendues y est aussi utile, avec d’autres formes de réception.', reliability: 'plausible' },
      { to: 'transversal', note: 'Rentrer le menton et ne pas amortir avec les bras tendus pourrait aussi servir lors de chutes de la vie courante ; transfert supposé, non étudié ici.', reliability: 'experimental' }
    ],
    sources: [S.judoQuebec, S.murayama2020],
    sequence: 'chute-arriere',
    editorial: nouvelle('sourcee')
  },
  {
    id: 'judo-chute-avant-roulee',
    title: 'La chute avant roulée (mae mawari ukemi) — précautions fortes',
    family: 'chutes-controles',
    disciplines: ['judo'],
    origin: 'judo',
    level: 3,
    objective: 'Comprendre comment rouler vers l’avant sur une épaule et le long du dos, sans que la tête ni la nuque touchent le sol, puis frapper le tapis.',
    context: 'Chute plus délicate que la chute arrière. Uniquement sur tapis épais, avec un enseignant qui guide chaque étape. Ne pas l’essayer seul à la maison, même sur un matelas : une roulade ratée peut charger la nuque.',
    prerequisites: ['judo-chute-arriere'],
    steps: [
      'Maîtriser d’abord la chute arrière et la frappe des deux mains (étape validée par l’enseignant).',
      'À genoux sur le tapis : glisser un bras vers le genou opposé et rouler sur l’épaule de ce bras, menton rentré.',
      'Rouler en arc de cercle, de l’épaule le long du dos, menton près de la poitrine, regard vers l’arrière.',
      'En fin de roulade, frapper le tapis avec la main libre, jambe arrière allongée.',
      'Passer à la version accroupie puis debout seulement quand l’enseignant le décide.'
    ],
    errors: [
      'Rouler sur le sommet de la tête ou sur la nuque.',
      'Menton relevé.',
      'Bras d’appui qui plie d’un coup et laisse tomber l’épaule.',
      'Amortir avec la main tendue.',
      'Rouler vite avant d’avoir le contrôle.'
    ],
    exercises: ['chat-vache', 'gainage-planche', 'mobilisation-articulaire'],
    variants: [
      'Rester à la version à genoux tant que la tête et la nuque ne sont pas parfaitement contrôlées.',
      'Roulade avec un ballon sous le bras, si l’enseignant utilise ce support (proposé dans le guide de Judo Québec).'
    ],
    limits: 'Fiche de compréhension, pas d’auto-apprentissage. Le trajet exact du roulé se décrit de plusieurs façons : le guide de Judo Québec parle d’une bande de contact de la nuque au bas du dos le long de la colonne, alors que l’on entend aussi « de l’épaule à la hanche opposée » ; cette seconde formulation n’a pas été vérifiée dans une source. Suivre la consigne de son enseignant.',
    joints: ['cou', 'thoracique', 'lombaires', 'epaule', 'hanche'],
    muscles: ['abdominaux', 'obliques', 'deltoides', 'trapezes', 'dorsaux'],
    principles: ['centre-masse', 'alignement', 'stabilite-proximale'],
    skills: ['defense-chute', 'corps-coordination', 'spe-judo'],
    risks: 'Risque sérieux pour la nuque et la tête si la roulade est mal dirigée ; épaule et clavicule si l’on tombe sur l’épaule sans rouler. Uniquement sur tapis épais, avec un enseignant qualifié, après la chute arrière. Jamais seul, jamais sur un sol dur, jamais par-dessus un obstacle.',
    transfers: [
      { to: 'jjb', note: 'Des roulades avant et arrière font partie des exercices de base de nombreux clubs de jiu-jitsu brésilien.', reliability: 'plausible' },
      { to: 'transversal', note: 'La roulade développe l’orientation du corps dans l’espace ; transfert supposé vers les autres disciplines, non étudié ici.', reliability: 'experimental' }
    ],
    sources: [S.judoQuebec],
    sequence: null,
    editorial: nouvelle('sourcee')
  },
  {
    id: 'judo-kumikata',
    title: 'La saisie de base du judo (kumikata), avec partenaire coopératif',
    family: 'chutes-controles',
    disciplines: ['judo'],
    origin: 'judo',
    level: 2,
    objective: 'Découvrir la saisie classique manche et revers, une posture droite, et sentir le partenaire par les mains, sans tirer ni projeter.',
    context: 'Avec un partenaire coopératif, en kimono (judogi), de préférence sur un tapis et en présence d’un enseignant. Aucune projection, aucun déséquilibre fort : on saisit, on se tient droit, on se déplace ensemble.',
    prerequisites: ['posture-basse-haute'],
    steps: [
      'Face au partenaire, debout, posture droite, genoux souples.',
      'Pour un droitier : main droite au revers du partenaire, à peu près à hauteur de poitrine ; main gauche sur la manche, vers le coude.',
      'Tenir fermement sans serrer de toutes ses forces, poignets dans l’axe des avant-bras.',
      'Se déplacer ensemble à petits pas, sans croiser les pieds, en gardant la saisie et la posture.',
      'Lâcher en douceur, saluer, puis changer de rôle.'
    ],
    errors: [
      'Se pencher en avant et bloquer les bras tendus (posture défensive).',
      'Serrer très fort et crisper les épaules.',
      'Tordre les poignets ou les doigts.',
      'Tirer brusquement le partenaire.'
    ],
    exercises: ['suspension-barre', 'rowing-elastique', 'tirage-allonge-ventre'],
    variants: [
      'Saisie face à un partenaire de l’autre latéralité (gaucher face à droitier) pour sentir la différence.',
      'Fermer les yeux quelques secondes pour sentir les déplacements du partenaire par les mains (lentement, partenaire coopératif).'
    ],
    limits: 'Seule la saisie classique est décrite ; les autres saisies et la lutte pour la saisie ne sont pas traitées. Les règles de compétition encadrent la saisie (par exemple, selon les règles IJF 2026 traduites par France Judo, rompre la saisie adverse à deux mains sans garder soi-même une saisie est pénalisé) : ce sont des règles, pas une méthode d’apprentissage. Aucune source vérifiée ne décrit ici le geste pas à pas.',
    joints: ['poignet', 'coude', 'epaule', 'lombaires'],
    muscles: ['avant-bras', 'biceps', 'dorsaux', 'trapezes', 'erecteurs'],
    principles: ['stabilite-proximale', 'alignement', 'relachement', 'base-sustentation'],
    skills: ['action-saisie', 'defense-saisie', 'spe-judo'],
    risks: 'Doigts et poignets (entorses) si l’on serre en tordant ou si le partenaire arrache la saisie ; dos si l’on se penche en tirant. Ongles courts, partenaire coopératif, aucune projection, enseignant présent.',
    transfers: [
      { to: 'lutte', note: 'La lutte utilise aussi le contrôle par les mains, mais sans kimono : nuque, bras, poignets.', reliability: 'plausible' },
      { to: 'jjb', note: 'Les saisies manche et revers existent aussi en jiu-jitsu brésilien en kimono, debout comme au sol.', reliability: 'plausible' }
    ],
    sources: [S.ffjudoRegles, SOURCE_IA],
    sequence: null,
    editorial: nouvelle('brouillon')
  },

  // ——— Lutte ———
  {
    id: 'lutte-changement-niveau',
    title: 'Le changement de niveau (lutte)',
    family: 'gardes-postures-appuis',
    disciplines: ['lutte'],
    origin: 'lutte',
    level: 2,
    objective: 'Descendre rapidement les hanches en pliant les genoux, dos droit et tête haute, sans se pencher en avant, puis remonter en garde.',
    context: 'Compétence de base de la lutte, que USA Wrestling range parmi les gestes fondamentaux. Travail seul, à vide, sans entrée sur un partenaire.',
    prerequisites: ['posture-basse-haute'],
    steps: [
      'Se mettre en garde de lutte : pieds un peu plus larges que les épaules, genoux fléchis, buste légèrement incliné, mains devant soi, coudes près du corps.',
      'Descendre les hanches en pliant les genoux, comme pour s’asseoir un peu, en gardant le dos droit et la tête haute, regard devant.',
      'Garder les mains devant et les coudes rentrés pendant la descente.',
      'Tenir un instant, puis remonter en garde en poussant dans le sol.',
      'Recommencer en changeant de pied avant.'
    ],
    errors: [
      'Se pencher en avant avec le buste au lieu de plier les genoux.',
      'Baisser la tête et regarder le sol.',
      'Genoux qui rentrent vers l’intérieur.',
      'Mains qui tombent.',
      'Descendre plus bas que ce que les genoux tolèrent.'
    ],
    exercises: ['squat-poids-corps', 'charniere-hanche', 'fente-arriere'],
    variants: [
      'Changement de niveau suivi d’un petit pas en avant, sans poser le genou (à faire valider par un enseignant).',
      'Au signal visuel d’une autre personne, descendre puis remonter.'
    ],
    limits: 'Le pas de pénétration (entrée avec un genou au sol) et les attaques aux jambes ne sont pas traités : ils demandent un tapis, un partenaire formé et un entraîneur. La garde varie selon les styles (lutte libre, gréco-romaine) ; la source citée distingue une garde pieds alignés et une garde pieds décalés.',
    joints: ['cheville', 'genou', 'hanche', 'lombaires'],
    muscles: ['quadriceps', 'fessiers', 'ischios', 'erecteurs', 'abdominaux'],
    principles: ['centre-masse', 'base-sustentation', 'alignement', 'stabilite-proximale'],
    skills: ['appuis-niveau', 'action-entree', 'spe-lutte'],
    risks: 'Genoux et bas du dos sollicités par les descentes répétées, surtout si le dos s’arrondit. Pas d’entrée avec un genou au sol sans tapis.',
    transfers: [
      { to: 'jjb', note: 'Le changement de niveau sert aussi aux amenées au sol debout en jiu-jitsu brésilien.', reliability: 'plausible' },
      { to: 'boxe', note: 'Plier les genoux plutôt que le dos rappelle la flexion de jambes utilisée pour esquiver en boxe ; rapprochement supposé.', reliability: 'experimental' }
    ],
    sources: [S.usaw2001],
    sequence: 'changement-niveau',
    editorial: nouvelle('sourcee')
  },
  {
    id: 'lutte-sprawl',
    title: 'Le sprawl (défense contre une attaque aux jambes), à vide',
    family: 'defenses',
    disciplines: ['lutte'],
    origin: 'lutte',
    level: 2,
    objective: 'Découvrir la défense qui consiste à lancer les jambes en arrière et à abaisser les hanches vers le sol pour ne pas se faire saisir les jambes.',
    context: 'Contre-attaque de base de la lutte. Ici seulement à vide, seul, sur un tapis, lentement. Le travail face à une vraie attaque se fait avec un entraîneur.',
    prerequisites: ['lutte-changement-niveau'],
    steps: [
      'Partir de la garde de lutte, sur un tapis.',
      'Lancer les deux jambes vers l’arrière, écartées, en se recevant sur l’avant des pieds, et poser les mains au sol devant soi.',
      'Abaisser les hanches vers le tapis, buste relevé, tête haute : le poids pèse vers l’avant.',
      'Ramener les jambes sous soi et revenir rapidement en garde.',
      'Recommencer lentement, en contrôlant chaque phase.'
    ],
    errors: [
      'Lancer les jambes sans abaisser les hanches (fesses en l’air).',
      'Tomber à plat ventre en se cognant le menton ou les genoux.',
      'Jambes trop serrées.',
      'Rester au sol au lieu de revenir en garde.',
      'Cambrer fortement le bas du dos.'
    ],
    exercises: ['grimpeur-lent', 'gainage-planche', 'fente-basse-flechisseurs'],
    variants: [
      'Version décomposée : mains au sol (position de pompe), puis jambes en arrière, puis hanches vers le sol.',
      'Sprawl au signal visuel d’une autre personne, sans contact.'
    ],
    limits: 'USA Wrestling présente le sprawl comme une contre-attaque de base ; la suite (contrôle, contournement du partenaire) n’est pas traitée. La façon de placer les hanches (plutôt vers le sol ou plutôt contre l’attaquant) varie selon les entraîneurs : à préciser avec le sien. Aucune défense face à un partenaire sans encadrement.',
    joints: ['hanche', 'lombaires', 'epaule', 'coude', 'genou', 'cheville'],
    muscles: ['fessiers', 'abdominaux', 'erecteurs', 'pectoraux', 'triceps', 'flechisseurs-hanche'],
    principles: ['centre-masse', 'transfert-poids', 'base-sustentation'],
    skills: ['defense-saisie', 'appuis-niveau', 'lecture-timing', 'spe-lutte'],
    risks: 'Poignets, coudes et genoux si l’on tombe lourdement ; bas du dos si l’on cambre. Uniquement sur tapis, échauffé, lentement au début.',
    transfers: [
      { to: 'jjb', note: 'Le sprawl est très utilisé en jiu-jitsu brésilien et en combat libre pour éviter une amenée au sol.', reliability: 'plausible' }
    ],
    sources: [S.usaw2001],
    sequence: 'sprawl',
    editorial: nouvelle('sourcee')
  },

  // ——— Karaté ———
  {
    id: 'karate-zenkutsu-dachi',
    title: 'La posture avant du karaté (zenkutsu-dachi)',
    family: 'gardes-postures-appuis',
    disciplines: ['karaté'],
    origin: 'karate',
    level: 1,
    objective: 'Prendre la posture avant longue du karaté : genou avant fléchi au-dessus du pied, jambe arrière tendue sans verrouiller, hanches basses et stables.',
    context: 'Posture de base du karaté traditionnel (kihon, kata). Travail seul, lent, sans charge.',
    prerequisites: ['posture-basse-haute'],
    steps: [
      'Debout, pieds à largeur de hanches.',
      'Faire un grand pas en avant : les pieds gardent un écart sur le côté, ils ne sont pas sur une même ligne.',
      'Plier le genou avant jusqu’à ce qu’il soit au-dessus du pied avant, dans l’axe des orteils.',
      'Tendre la jambe arrière sans verrouiller le genou, pied arrière tourné légèrement vers l’extérieur, talon au sol.',
      'Garder le buste droit, le bassin stable, avec un peu plus de poids sur la jambe avant.'
    ],
    errors: [
      'Genou avant qui dépasse les orteils ou rentre vers l’intérieur.',
      'Pieds sur une même ligne (équilibre fragile sur le côté).',
      'Talon arrière qui décolle.',
      'Buste penché en avant.',
      'Genou arrière verrouillé en force.'
    ],
    exercises: ['fente-arriere', 'chevilles-genou-mur', 'hanches-90-90'],
    variants: [
      'Posture plus courte et plus haute pour commencer.',
      'Avancer d’une posture à l’autre lentement, en passant le pied arrière près du pied d’appui.'
    ],
    limits: 'La longueur, la largeur et la hauteur de la posture varient selon les styles et le niveau : un enseignant doit les ajuster. La répartition du poids souvent enseignée (plus de poids devant) est présentée comme une description « courante » dans le résumé de Loczi (1985) ; les résultats de mesure de cette étude n’ont pas pu être lus ici, la consigne n’est donc pas confirmée.',
    joints: ['cheville', 'genou', 'hanche', 'lombaires'],
    muscles: ['quadriceps', 'fessiers', 'adducteurs', 'mollets', 'ischios'],
    principles: ['base-sustentation', 'centre-masse', 'alignement'],
    skills: ['appuis-posture', 'appuis-poids', 'spe-karate'],
    risks: 'Genoux sollicités par une posture longue et fléchie, surtout si le genou avant rentre ou dépasse les orteils ; bas du dos si le buste se cambre. Raccourcir la posture en cas de gêne.',
    transfers: [
      { to: 'escrime', note: 'Comme la fente d’escrime, la posture avant demande un genou avant aligné avec le pied et une jambe arrière allongée ; mais la posture est tenue, alors que la fente est un mouvement.', reliability: 'plausible' },
      { to: 'boxe', note: 'Bien plus longue et basse que la garde de boxe : peu de transfert pour la mobilité, mais utile pour sentir la poussée de la jambe arrière.', reliability: 'experimental' }
    ],
    sources: [S.loczi1985],
    sequence: 'gyaku-zuki',
    editorial: nouvelle('sourcee')
  },
  {
    id: 'karate-gyaku-zuki',
    title: 'Le coup de poing inversé à vide (gyaku-zuki)',
    family: 'techniques-enchainements',
    disciplines: ['karaté'],
    origin: 'karate',
    level: 2,
    objective: 'Découvrir le coup de poing du bras arrière en posture avant, porté par la rotation des hanches, lentement et sans cible.',
    context: 'Technique de base du karaté. Travail seul, à vide, sans impact.',
    prerequisites: ['karate-zenkutsu-dachi'],
    steps: [
      'Partir en posture avant (zenkutsu-dachi), bras avant devant soi, poing arrière à la hanche.',
      'Faire tourner les hanches vers l’avant en gardant la posture et le talon arrière au sol.',
      'Pendant la rotation, pousser le poing arrière en ligne droite vers l’avant, en tournant l’avant-bras pour finir paume vers le bas, sans verrouiller le coude.',
      'Ramener en même temps l’autre poing à la hanche.',
      'Revenir lentement : hanches et bras à la position de départ.'
    ],
    errors: [
      'Lancer le bras sans faire tourner les hanches.',
      'Pencher le buste en avant.',
      'Talon arrière qui décolle.',
      'Verrouiller le coude.',
      'Monter l’épaule du bras qui frappe.'
    ],
    exercises: ['rotations-thoraciques', 'gainage-planche', 'shadow-leger'],
    variants: [
      'Rotation des hanches seule, mains sur les hanches.',
      'Gyaku-zuki depuis une garde de combat plus courte (kumite), à faire montrer par un enseignant.'
    ],
    limits: 'Ni impact ni cible. Le placement du poing et le moment de la rotation varient selon les styles. Une étude sur neuf athlètes élites (Suwarganda et al., 2009) trouve deux façons d’organiser l’épaule et le coude, l’une plus simultanée, l’autre plus successive : il n’y a donc pas une seule bonne coordination, ce qui nuance l’idée, souvent enseignée, d’une chaîne toujours successive des hanches vers le poing.',
    joints: ['cheville', 'genou', 'hanche', 'thoracique', 'epaule', 'coude', 'poignet'],
    muscles: ['fessiers', 'obliques', 'pectoraux', 'deltoides', 'triceps', 'abdominaux'],
    principles: ['rotation-axiale', 'chaine-cinetique', 'stabilite-proximale', 'alignement'],
    skills: ['action-direct', 'spe-karate'],
    risks: 'Coude si on le verrouille à vide ; bas du dos si la rotation est forcée ; genou arrière si le pied ne suit pas. Aucun impact sans encadrement ni matériel adapté.',
    transfers: [
      { to: 'boxe', note: 'Proche du direct arrière : rotation des hanches et bras qui part en ligne droite ; mais le karaté traditionnel part de la hanche, depuis une posture plus longue.', reliability: 'plausible' }
    ],
    sources: [S.suwarganda2009],
    sequence: 'gyaku-zuki',
    editorial: nouvelle('sourcee')
  },

  // ——— Muay-thaï ———
  {
    id: 'muay-thai-garde-pas',
    title: 'La garde et le pas de muay-thaï',
    family: 'gardes-postures-appuis',
    disciplines: ['muay-thaï'],
    origin: 'muay-thai',
    level: 1,
    objective: 'Découvrir une garde de muay-thaï : buste plus de face, mains hautes, poids plutôt sur la jambe arrière pour libérer la jambe avant, petits pas réguliers.',
    context: 'Fiche de découverte, seul, sans partenaire ni sac.',
    prerequisites: ['repartition-poids'],
    steps: [
      'Pieds décalés, à peu près à largeur d’épaules, buste plus de face qu’en boxe.',
      'Mains hautes, au niveau du front ou des tempes, coudes plutôt serrés, menton rentré.',
      'Porter un peu plus de poids sur la jambe arrière : la jambe avant reste légère, prête à se lever.',
      'Avancer et reculer à petits pas sans croiser les pieds, en gardant la même hauteur.',
      'Lever brièvement le genou avant puis le reposer, sans perdre l’équilibre.'
    ],
    errors: [
      'Tout le poids sur la jambe avant (jambe impossible à lever).',
      'Mains qui descendent.',
      'Croiser les pieds.',
      'Sautiller fort et se fatiguer.'
    ],
    exercises: ['deplacements-en-garde', 'equilibre-unipodal', 'chevilles-genou-mur'],
    variants: [
      'Alterner garde de boxe et garde de muay-thaï pour sentir la différence.',
      'Rythme de pas lent et régulier, puis plus irrégulier.'
    ],
    limits: 'Les gardes de muay-thaï varient beaucoup selon les clubs et les styles ; aucune source vérifiée ne décrit ici une garde de référence. Le blocage avec le tibia, le corps-à-corps (clinch), les genoux et les coudes ne sont pas traités et demandent un encadrement.',
    joints: ['cheville', 'genou', 'hanche', 'epaule', 'cou'],
    muscles: ['mollets', 'quadriceps', 'fessiers', 'deltoides', 'trapezes', 'abdominaux'],
    principles: ['base-sustentation', 'transfert-poids', 'centre-masse', 'relachement'],
    skills: ['appuis-posture', 'appuis-poids', 'defense-garde', 'spe-muay-thai'],
    risks: 'Épaules et nuque crispées si la garde haute est tenue longtemps ; chute si l’on lève le genou sans équilibre.',
    transfers: [
      { to: 'boxe', note: 'Plus de face et plus haute que la garde de boxe, parce que les coups de pied et les coudes existent ; moins adaptée aux esquives de tête.', reliability: 'plausible' }
    ],
    sources: [SOURCE_IA],
    sequence: 'garde',
    editorial: nouvelle('brouillon')
  },
  {
    id: 'muay-thai-teep',
    title: 'Le teep à vide (coup de pied poussé du muay-thaï)',
    family: 'techniques-enchainements',
    disciplines: ['muay-thaï'],
    origin: 'muay-thai',
    level: 2,
    objective: 'Découvrir le teep : monter le genou, puis pousser vers l’avant avec la plante du pied en avançant légèrement la hanche, à faible hauteur et lentement.',
    context: 'Coup de pied de distance du muay-thaï, souvent comparé à un « direct avec la jambe ». Seul, à vide, à hauteur basse, près d’un mur pour l’équilibre si besoin.',
    prerequisites: ['muay-thai-garde-pas', 'coup-pied-face-bas'],
    steps: [
      'Partir de la garde de muay-thaï, poids un peu plus sur la jambe arrière.',
      'Monter le genou avant devant soi, mains hautes.',
      'Pousser le pied vers l’avant, à hauteur basse, comme pour repousser une porte avec la plante du pied, en avançant un peu la hanche, sans verrouiller le genou.',
      'Replier la jambe aussitôt et reposer le pied en garde.',
      'Vérifier l’équilibre et la garde avant de recommencer.'
    ],
    errors: [
      'Se pencher très en arrière.',
      'Lancer la jambe sans monter le genou d’abord.',
      'Verrouiller le genou en fin de geste.',
      'Baisser les mains.',
      'Chercher la hauteur au détriment de l’équilibre.'
    ],
    exercises: ['equilibre-unipodal', 'balancier-jambes', 'pont-fessier'],
    variants: [
      'Seulement monter le genou et tenir, puis ajouter la poussée.',
      'Teep de la jambe arrière, à découvrir avec un enseignant.'
    ],
    limits: 'Ni impact ni cible : pousser un sac ou un partenaire demande un encadrement. Aucune source vérifiée ne décrit ici le geste ; les études trouvées portent sur le coup de pied circulaire ou sur un seul athlète.',
    joints: ['hanche', 'genou', 'cheville'],
    muscles: ['flechisseurs-hanche', 'quadriceps', 'fessiers', 'mollets', 'abdominaux'],
    principles: ['base-sustentation', 'centre-masse', 'transfert-poids'],
    skills: ['action-pied', 'appuis-distance', 'spe-muay-thai'],
    risks: 'Chute si l’équilibre manque ; genou en hyperextension si on le verrouille ; cheville d’appui sollicitée sur sol glissant.',
    transfers: [
      { to: 'karate', note: 'Proche du mae-geri, mais le teep pousse davantage avec la hanche et la plante du pied pour repousser et gérer la distance.', reliability: 'plausible' },
      { to: 'boxe', note: 'Il joue un rôle de gestion de distance comparable au direct avant ; c’est un transfert de rôle tactique, pas de geste.', reliability: 'plausible' }
    ],
    sources: [SOURCE_IA],
    sequence: 'teep',
    editorial: nouvelle('brouillon')
  },

  // ——— Jiu-jitsu brésilien ———
  {
    id: 'jjb-echappement-hanche',
    title: 'L’échappement de hanche (« shrimp »)',
    family: 'chutes-controles',
    disciplines: ['jiu-jitsu brésilien'],
    origin: 'jjb',
    level: 1,
    objective: 'Apprendre à éloigner ses hanches sur le côté en étant allongé sur le dos, en poussant avec un pied, pour recréer de l’espace.',
    context: 'Mouvement de base du jiu-jitsu brésilien, souvent enseigné dès le premier cours. Seul, sur un tapis, sans partenaire.',
    prerequisites: [],
    steps: [
      'Allongé sur le dos sur un tapis, genoux pliés, pieds au sol, mains devant la poitrine.',
      'Tourner légèrement sur le côté, sur une épaule.',
      'Pousser avec le pied du côté opposé à cette épaule pour envoyer les hanches en arrière, loin du point de départ.',
      'Les mains poussent dans le vide devant soi, comme pour garder une distance.',
      'Revenir sur le dos, puis recommencer de l’autre côté, en avançant le long du tapis.'
    ],
    errors: [
      'Rester à plat sur le dos au lieu de se tourner sur le côté.',
      'Pousser avec les deux pieds en même temps.',
      'Relever la tête brusquement.',
      'Un seul grand mouvement explosif au lieu de plusieurs petits.'
    ],
    exercises: ['pont-fessier', 'dead-bug', 'gainage-lateral'],
    variants: [
      'Échappements de hanche sur toute la longueur du tapis, en alternant les côtés.',
      'Pont (lever les hanches) puis échappement de hanche.'
    ],
    limits: 'Aucune source vérifiée (fédération ou étude) n’a été trouvée pour cette fiche ; les descriptions consultées viennent de sites commerciaux ou de blogs. Les usages réels (sortir d’un contrôle, revenir en garde) se travaillent avec un partenaire et un enseignant.',
    joints: ['hanche', 'lombaires', 'epaule', 'cou'],
    muscles: ['fessiers', 'obliques', 'abdominaux', 'ischios', 'adducteurs'],
    principles: ['centre-masse', 'base-sustentation', 'stabilite-proximale'],
    skills: ['defense-sortie-ligne', 'corps-coordination', 'spe-jjb'],
    risks: 'Nuque sollicitée si la tête est relevée en force ; frottements et brûlures sur tapis rugueux. Sur tapis seulement.',
    transfers: [
      { to: 'judo', note: 'Les sorties d’immobilisation du judo au sol (ne-waza) utilisent aussi le déplacement des hanches.', reliability: 'plausible' },
      { to: 'lutte', note: 'Le travail au sol de la lutte utilise d’autres sorties, mais l’idée de recréer de l’espace avec les hanches se retrouve ; rapprochement supposé.', reliability: 'experimental' }
    ],
    sources: [SOURCE_IA],
    sequence: null,
    editorial: nouvelle('brouillon')
  },
  {
    id: 'jjb-releve-technique',
    title: 'Le relevé technique (« technical stand-up »)',
    family: 'chutes-controles',
    disciplines: ['jiu-jitsu brésilien'],
    origin: 'jjb',
    level: 2,
    objective: 'Se relever du sol en gardant une base stable et un bras devant soi pour se protéger, et se retrouver debout, en garde, à distance.',
    context: 'Geste de base du jiu-jitsu brésilien, utile aussi en self-défense. Seul, lentement, sur un tapis ou un sol propre.',
    prerequisites: ['repartition-poids'],
    steps: [
      'Assis au sol : poser une main au sol derrière soi (par exemple la droite) et le pied opposé (le gauche) à plat, genou plié.',
      'L’autre bras devant soi, coude fléchi, pour protéger la tête et garder la distance.',
      'Pousser sur la main et le pied posés pour soulever les hanches.',
      'Faire passer la jambe libre en arrière, sous soi, entre la main et le pied d’appui, pour retrouver une position large et stable.',
      'Se redresser en garde, en reculant si besoin, regard devant soi.'
    ],
    errors: [
      'Se relever en ramenant les pieds l’un contre l’autre (base instable).',
      'Baisser le bras de protection.',
      'Se relever vers l’avant, tête la première.',
      'Regarder le sol.'
    ],
    exercises: ['fente-arriere', 'gainage-lateral', 'equilibre-unipodal'],
    variants: [
      'Version « trois quarts » : poser le genou au lieu du pied pendant le passage de la jambe, plus facile si la mobilité manque.',
      'Enchaîner un échappement de hanche puis un relevé technique.'
    ],
    limits: 'La source consultée est un site d’enseignant (Kesting, 2022), ni fédération ni étude. La fiche ne traite pas du relevé face à une personne qui pousse ou frappe : cela demande un encadrement.',
    joints: ['poignet', 'coude', 'epaule', 'hanche', 'genou', 'cheville'],
    muscles: ['triceps', 'deltoides', 'fessiers', 'quadriceps', 'obliques', 'abdominaux'],
    principles: ['base-sustentation', 'centre-masse', 'transfert-poids', 'stabilite-proximale'],
    skills: ['appuis-niveau', 'defense-garde', 'corps-equilibre', 'spe-jjb'],
    risks: 'Poignet de la main d’appui si l’on pousse bras tendu sur un sol dur ; genou si l’on tourne sur le pied posé. Commencer sur tapis, lentement.',
    transfers: [
      { to: 'lutte', note: 'Se relever avec une base large, sans rapprocher les pieds, est aussi recherché en lutte quand on revient debout.', reliability: 'plausible' },
      { to: 'transversal', note: 'Se relever du sol en gardant l’équilibre et un bras devant soi peut servir hors de toute discipline ; transfert supposé, non étudié.', reliability: 'experimental' }
    ],
    sources: [S.kesting2022],
    sequence: null,
    editorial: nouvelle('sourcee')
  }
];
