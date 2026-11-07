// Arbre de compétences de LA FORGE.
// Organisation : du général au spécifique (fondations physiques → appuis → actions / défense → lecture du jeu →
// spécialisations). Ce choix suit le principe pédagogique courant « fondamentaux transversaux avant spécialisation »
// (proposition LA FORGE, à faire relire par des enseignants). Chaque nœud dit pourquoi il compte et comment
// il peut être étayé : fiches (étudier), exercices (pratiquer), tests (mesurer), critères (évaluer).
// Les critères de niveau sont des observables à faire constater par une personne qualifiée, pas des seuils chiffrés.

export const branches = [
  {id: 'corps', name: 'Corps', color: 'jade', angle: 200, summary: 'Les capacités physiques qui rendent la pratique possible et durable.'},
  {id: 'appuis', name: 'Appuis', color: 'mineral', angle: 255, summary: 'Se placer, se déplacer, gérer la distance : le socle de toute technique.'},
  {id: 'action', name: 'Actions', color: 'vermillon', angle: 310, summary: 'Frapper, entrer, saisir, projeter : agir sur l’autre.'},
  {id: 'defense', name: 'Défense', color: 'encre', angle: 20, summary: 'Se protéger, éviter, chuter sans se blesser, contrôler une saisie.'},
  {id: 'lecture', name: 'Lecture', color: 'or', angle: 75, summary: 'Percevoir, anticiper, choisir le moment : la dimension tactique.'},
  {id: 'spe', name: 'Spécialisations', color: 'or', angle: null, summary: 'Les disciplines, vues comme des combinaisons particulières des fondations.'},
  {id: 'trans', name: 'Transversal', color: 'jade', angle: null, summary: 'Réutiliser une expérience d’une discipline dans une autre.'}
];

const L = (a, b, c) => [{level: 1, label: 'Initié', criterion: a}, {level: 2, label: 'Confirmé', criterion: b}, {level: 3, label: 'Avancé', criterion: c}];
const PHYS = L('Pratique régulière depuis au moins un mois, exécution correcte constatée.',
  'Progression mesurée sur plusieurs tests datés, technique stable sous fatigue modérée.',
  'Capacité entretenue sur la durée et adaptée aux exigences de sa discipline, constatée par un préparateur.');

export const skills = [
  // ——— Corps ———
  {id: 'corps-force', branch: 'corps', depth: 1, name: 'Force', prerequisites: [],
    why: 'Produire et contrôler de la force sert à se placer, frapper, saisir et résister ; elle participe aussi à la robustesse.',
    exercises: ['squat-poids-corps', 'pompes', 'tractions', 'charniere-hanche'], tests: ['perf:squat', 'perf:bench', 'perf:deadlift', 'perf:pullup', 'perf:dip', 'perf:pushup', 'test:grip'], library: [], levels: PHYS},
  {id: 'corps-endurance-musculaire', branch: 'corps', depth: 2, name: 'Endurance musculaire', prerequisites: ['corps-force'],
    why: 'Répéter des efforts (garde haute, déplacements, saisies) sans que la qualité du geste s’effondre.',
    exercises: ['pompes', 'chaise-murale', 'gainage-planche'], tests: ['perf:pushup', 'perf:pullup'], library: [], levels: PHYS},
  {id: 'corps-endurance', branch: 'corps', depth: 1, name: 'Endurance générale', prerequisites: [],
    why: 'Tenir la durée d’un entraînement ou d’un assaut et récupérer entre les efforts.',
    exercises: ['marche-rapide', 'intervalles-doux', 'corde-a-sauter'], tests: ['test:marche-continue', 'test:run5k', 'test:cooper'], library: [], levels: PHYS},
  {id: 'corps-puissance', branch: 'corps', depth: 2, name: 'Explosivité', prerequisites: ['corps-force'],
    why: 'Appliquer la force vite : entrées, départs, changements de direction. À développer après une base de force et d’appuis.',
    exercises: ['squat-poids-corps', 'corde-a-sauter'], tests: ['test:cmj', 'test:broadjump', 'test:sprint20'], library: [], levels: PHYS},
  {id: 'corps-mobilite', branch: 'corps', depth: 1, name: 'Mobilité', prerequisites: [],
    why: 'Disposer d’amplitudes contrôlées aux chevilles, hanches et épaules pour se placer sans compenser.',
    exercises: ['hanches-90-90', 'chevilles-genou-mur', 'rotations-thoraciques'], tests: ['test:squat-profond'], library: ['mobilite-hanches'], levels: PHYS},
  {id: 'corps-souplesse', branch: 'corps', depth: 2, name: 'Souplesse', prerequisites: ['corps-mobilite'],
    why: 'Utile aux coups de pied et à certaines gardes ; à travailler sans rebond ni douleur.',
    exercises: ['ischios-allonge', 'papillon-adducteurs', 'fente-basse-flechisseurs'], tests: ['test:flexion-avant'], library: [], levels: PHYS},
  {id: 'corps-gainage', branch: 'corps', depth: 1, name: 'Gainage et transmission', prerequisites: [],
    why: 'Stabiliser le tronc pour transmettre la force des appuis aux bras et résister aux déséquilibres.',
    exercises: ['gainage-planche', 'gainage-lateral', 'dead-bug'], tests: [], library: ['gainage-rotation'], levels: PHYS},
  {id: 'corps-equilibre', branch: 'corps', depth: 1, name: 'Équilibre', prerequisites: [],
    why: 'Rester stable sur un appui, récupérer un déséquilibre : indispensable aux coups de pied et aux saisies.',
    exercises: ['equilibre-unipodal'], tests: ['test:equilibre-unipodal'], library: ['repartition-poids'], levels: PHYS},
  {id: 'corps-coordination', branch: 'corps', depth: 2, name: 'Coordination', prerequisites: ['corps-equilibre'],
    why: 'Organiser bras, tronc et jambes dans le bon ordre et au bon moment.',
    exercises: ['pas-croises', 'echelle-au-sol', 'corde-a-sauter'], tests: ['test:pas-croises'], library: [], levels: PHYS},
  {id: 'corps-reaction', branch: 'corps', depth: 2, name: 'Temps de réaction', prerequisites: ['corps-coordination'],
    why: 'Répondre vite à un signal. Sur écran, on mesure un temps simple ou à choix, pas la lecture d’un adversaire.',
    exercises: ['reaction-signal', 'balle-contre-mur'], tests: ['test:reaction-simple', 'test:reaction-choix'], library: [], levels: PHYS},
  {id: 'corps-recuperation', branch: 'corps', depth: 1, name: 'Récupération', prerequisites: [],
    why: 'Alterner charge et repos permet de progresser et de limiter les blessures de surmenage.',
    exercises: ['respiration-lente', 'marche-retour-calme', 'etirements-doux'], tests: ['test:rythme-calme'], library: [], levels: PHYS},

  // ——— Appuis ———
  {id: 'appuis-posture', branch: 'appuis', depth: 1, name: 'Posture et garde de base', prerequisites: [],
    why: 'Une position de départ stable et disponible conditionne toutes les actions.', exercises: ['deplacements-en-garde'], tests: [],
    library: ['garde', 'posture-basse-haute'], levels: L('Garde stable et relâchée, tenue sans rappel.', 'Garde conservée pendant les déplacements et après une action.', 'Garde adaptée consciemment selon la distance et l’adversaire.')},
  {id: 'appuis-poids', branch: 'appuis', depth: 2, name: 'Répartition du poids', prerequisites: ['appuis-posture', 'corps-equilibre'],
    why: 'Savoir où est son poids, c’est savoir ce qu’on peut faire ensuite (avancer, reculer, frapper, esquiver).', exercises: ['equilibre-unipodal'], tests: [],
    library: ['repartition-poids'], levels: L('Transfert de poids lent et contrôlé.', 'Transfert intégré aux déplacements.', 'Transfert au service des techniques, sans se découvrir.')},
  {id: 'appuis-pas', branch: 'appuis', depth: 2, name: 'Pas glissés', prerequisites: ['appuis-posture'],
    why: 'Se déplacer sans croiser les pieds ni perdre sa base.', exercises: ['deplacements-en-garde'], tests: [],
    library: ['pas-glisse', 'retrait-pas-arriere'], levels: L('Pas avant / arrière sans croiser.', 'Pas dans les 4 directions, rythme varié.', 'Pas enchaînés avec des actions, sous contrainte.')},
  {id: 'appuis-pivot', branch: 'appuis', depth: 3, name: 'Pivots', prerequisites: ['appuis-pas'],
    why: 'Changer d’angle sans reculer : sortir de la ligne et retrouver une position favorable.', exercises: ['deplacements-en-garde'], tests: [],
    library: ['pivot'], levels: L('Pivot lent, garde conservée.', 'Pivot intégré après une action.', 'Pivot choisi au bon moment pour créer un angle.')},
  {id: 'appuis-lateral', branch: 'appuis', depth: 3, name: 'Mobilité latérale', prerequisites: ['appuis-pas'],
    why: 'Se déplacer de côté et en cercle plutôt qu’en ligne : essentiel en boxe, moins en escrime.', exercises: ['pas-croises', 'echelle-au-sol'], tests: [],
    library: ['pas-glisse'], levels: L('Pas latéraux réguliers.', 'Déplacements circulaires autour d’un repère.', 'Changement d’axe utilisé tactiquement.')},
  {id: 'appuis-distance', branch: 'appuis', depth: 3, name: 'Gestion de la distance', prerequisites: ['appuis-pas'],
    why: 'Être hors de portée ou à portée au bon moment : notion commune à presque toutes les disciplines.', exercises: ['deplacements-en-garde'], tests: [],
    library: ['gestion-distance'], levels: L('Reconnaît ses distances avec un repère.', 'Maintient une distance choisie face à un partenaire mobile.', 'Joue avec la distance pour provoquer et exploiter.')},
  {id: 'appuis-niveau', branch: 'appuis', depth: 3, name: 'Changement de niveau', prerequisites: ['appuis-poids', 'corps-force'],
    why: 'Abaisser son centre de gravité sans se pencher : base des entrées en saisie et de certaines esquives.', exercises: ['squat-poids-corps', 'fente-arriere'], tests: [],
    library: [], levels: L('Descente dos droit, appuis stables.', 'Descente rapide puis remontée contrôlée.', 'Intégré à une entrée ou une défense.')},

  // ——— Actions ———
  {id: 'action-direct', branch: 'action', depth: 2, name: 'Frappes directes', prerequisites: ['appuis-posture'],
    why: 'Le chemin le plus court vers la cible ; il structure la distance et le rythme.', exercises: ['shadow-leger'], tests: [],
    library: ['direct-avant', 'direct-arriere'], levels: L('Trajet aller-retour propre à vide.', 'Direct coordonné avec les appuis, garde conservée.', 'Directs placés et variés face à un partenaire, en sécurité.')},
  {id: 'action-circulaire', branch: 'action', depth: 3, name: 'Frappes circulaires', prerequisites: ['action-direct', 'corps-gainage'],
    why: 'Toucher sous un autre angle, en utilisant la rotation du tronc.', exercises: ['rotations-thoraciques', 'shadow-leger'], tests: [],
    library: ['crochet-a-vide'], levels: L('Rotation contrôlée à vide.', 'Crochet coordonné avec le pivot.', 'Intégré à des enchaînements.')},
  {id: 'action-pied', branch: 'action', depth: 3, name: 'Coups de pied', prerequisites: ['corps-equilibre', 'corps-mobilite'],
    why: 'Portée plus longue, exigeant équilibre et mobilité des hanches.', exercises: ['equilibre-unipodal', 'hanches-90-90'], tests: [],
    library: ['coup-pied-face-bas'], levels: L('Coup de pied bas lent, retour en garde stable.', 'Coup de pied à vitesse moyenne sans perte d’équilibre.', 'Coups de pied variés et placés.')},
  {id: 'action-enchainement', branch: 'action', depth: 4, name: 'Enchaînements', prerequisites: ['action-direct', 'appuis-pas'],
    why: 'Relier plusieurs actions sans rupture de garde ni d’équilibre.', exercises: ['shadow-leger'], tests: [],
    library: ['enchainement-direct-direct-retrait'], levels: L('Enchaînement simple à vide.', 'Enchaînement fluide avec déplacement de sortie.', 'Enchaînements adaptés aux réactions d’un partenaire.')},
  {id: 'action-entree', branch: 'action', depth: 4, name: 'Entrées', prerequisites: ['appuis-distance', 'corps-puissance'],
    why: 'Franchir la distance vite et au bon moment (fente, pas d’entrée, entrée en saisie).', exercises: ['deplacements-en-garde'], tests: [],
    library: [], levels: L('Entrée lente avec retour en garde.', 'Entrée explosive contrôlée.', 'Entrée choisie selon le timing de l’autre.')},
  {id: 'action-saisie', branch: 'action', depth: 3, name: 'Saisies', prerequisites: ['corps-force', 'appuis-poids'],
    why: 'Prendre et garder un contact utile (garde de saisie, contrôle des bras ou du haut du corps).', exercises: ['suspension-barre', 'rowing-elastique'], tests: ['test:grip'], library: [],
    levels: L('Saisies de base avec un partenaire coopératif.', 'Saisie conservée en mouvement.', 'Lutte de saisie face à une résistance progressive.')},
  {id: 'action-projection', branch: 'action', depth: 4, name: 'Projections', prerequisites: ['action-saisie', 'defense-chute'],
    why: 'Déséquilibrer puis amener au sol. Uniquement avec un enseignant, sur tapis, après avoir appris à chuter.', exercises: [], tests: [], library: [],
    levels: L('Déséquilibre et placement sans chute, avec un enseignant.', 'Projection coopérative sur tapis.', 'Projection en situation d’opposition encadrée.')},

  // ——— Défense ———
  {id: 'defense-garde', branch: 'defense', depth: 1, name: 'Garde protectrice', prerequisites: ['appuis-posture'],
    why: 'Mains et coudes placés pour protéger la tête et le corps sans se crisper.', exercises: [], tests: [],
    library: ['garde', 'parade-couvert'], levels: L('Mains hautes conservées à l’arrêt.', 'Garde conservée en mouvement et après une action.', 'Garde ajustée selon les menaces.')},
  {id: 'defense-esquive', branch: 'defense', depth: 3, name: 'Esquives', prerequisites: ['defense-garde', 'appuis-poids'],
    why: 'Sortir la tête de la ligne sans perdre l’équilibre ni le regard.', exercises: ['squat-poids-corps'], tests: [],
    library: ['esquive-laterale'], levels: L('Esquive lente, retour en garde.', 'Esquive sur signal d’un partenaire.', 'Esquive suivie d’une action.')},
  {id: 'defense-parade', branch: 'defense', depth: 2, name: 'Parades et blocages', prerequisites: ['defense-garde'],
    why: 'Dévier ou absorber une attaque avec les bras ou l’arme.', exercises: [], tests: [],
    library: ['parade-couvert'], levels: L('Parade lente à vide.', 'Parade sur attaque lente d’un partenaire.', 'Parade-riposte enchaînée.')},
  {id: 'defense-retrait', branch: 'defense', depth: 2, name: 'Retrait', prerequisites: ['appuis-pas'],
    why: 'Reprendre de la distance sans tourner le dos ni croiser les pieds.', exercises: ['deplacements-en-garde'], tests: [],
    library: ['retrait-pas-arriere'], levels: L('Pas arrière stable.', 'Retrait à la bonne distance face à un partenaire.', 'Retrait suivi d’une contre-attaque.')},
  {id: 'defense-chute', branch: 'defense', depth: 2, name: 'Chutes (ukemi)', prerequisites: ['corps-gainage', 'corps-mobilite'],
    why: 'Savoir tomber protège la tête et les articulations : préalable à toute projection. Avec un enseignant, sur tapis.', exercises: ['dead-bug'], tests: [], library: [],
    levels: L('Chute arrière depuis assis, menton rentré.', 'Chutes depuis accroupi puis debout.', 'Chutes sûres lors de projections encadrées.')},
  {id: 'defense-sortie-ligne', branch: 'defense', depth: 3, name: 'Sortie de ligne', prerequisites: ['appuis-pivot', 'appuis-lateral'],
    why: 'Quitter l’axe d’attaque pour se retrouver de côté plutôt que reculer tout droit.', exercises: ['pas-croises'], tests: [], library: ['pivot'],
    levels: L('Sortie de ligne lente.', 'Sortie sur attaque d’un partenaire.', 'Sortie suivie d’une action depuis l’angle créé.')},
  {id: 'defense-saisie', branch: 'defense', depth: 3, name: 'Défense contre les saisies', prerequisites: ['appuis-niveau', 'corps-gainage'],
    why: 'Empêcher ou casser une saisie (sprawl, cadrage, contrôle des bras).', exercises: ['gainage-planche'], tests: [], library: [],
    levels: L('Gestes de base à vide.', 'Réponse sur entrée lente d’un partenaire.', 'Réponse en opposition encadrée.')},

  // ——— Lecture ———
  {id: 'lecture-indices', branch: 'lecture', depth: 3, name: 'Prise d’indices', prerequisites: ['corps-reaction', 'appuis-distance'],
    why: 'Repérer ce qui annonce une action (épaules, appuis, distance). Différent du temps de réaction sur écran.', exercises: ['reaction-signal'], tests: [], library: ['gestion-distance'],
    levels: L('Nomme des indices observés chez un partenaire.', 'Réagit à des indices lors d’exercices codifiés.', 'Exploite les indices en situation libre encadrée.')},
  {id: 'lecture-timing', branch: 'lecture', depth: 4, name: 'Timing', prerequisites: ['lecture-indices', 'action-direct'],
    why: 'Agir au moment où l’autre ne peut pas répondre (pendant son déplacement, sa préparation).', exercises: [], tests: [], library: ['rythme-feinte'],
    levels: L('Agit sur un signal choisi.', 'Agit sur un moment d’un partenaire (pas, préparation).', 'Crée ses propres moments.')},
  {id: 'lecture-rythme', branch: 'lecture', depth: 4, name: 'Rythme et feintes', prerequisites: ['action-enchainement'],
    why: 'Varier la cadence et proposer de fausses informations pour créer des ouvertures.', exercises: ['shadow-leger'], tests: [], library: ['rythme-feinte'],
    levels: L('Varie son rythme en shadow.', 'Utilise une feinte simple en exercice.', 'Construit des séquences de rythme face à un partenaire.')},
  {id: 'lecture-anticipation', branch: 'lecture', depth: 5, name: 'Anticipation', prerequisites: ['lecture-indices', 'lecture-timing'],
    why: 'Prévoir une action probable à partir du contexte, sans se figer sur une seule hypothèse.', exercises: [], tests: [], library: [],
    levels: L('Décrit après coup ce qui était prévisible.', 'Anticipe dans des exercices codifiés.', 'Anticipe en situation libre encadrée.')},
  {id: 'lecture-decision', branch: 'lecture', depth: 5, name: 'Prise de décision', prerequisites: ['lecture-anticipation'],
    why: 'Choisir vite parmi plusieurs options selon la situation.', exercises: [], tests: [], library: ['apprendre-lentement'],
    levels: L('Choisit entre deux options données.', 'Choisit parmi plusieurs options en exercice.', 'Décide sous pression en situation libre encadrée.')},
  {id: 'lecture-adaptation', branch: 'lecture', depth: 6, name: 'Adaptation', prerequisites: ['lecture-decision'],
    why: 'Changer de plan quand l’adversaire, la distance ou la fatigue changent.', exercises: [], tests: [], library: [],
    levels: L('Identifie ce qui ne marche pas après un exercice.', 'Change de stratégie pendant un exercice.', 'S’adapte à différents types d’opposants.')},

  // ——— Spécialisations ———
  ...[
    ['spe-boxe', 'Boxe anglaise', ['action-direct', 'defense-garde', 'appuis-lateral', 'defense-esquive']],
    ['spe-escrime', 'Escrime', ['appuis-distance', 'action-entree', 'defense-parade', 'lecture-timing']],
    ['spe-lutte', 'Lutte', ['appuis-niveau', 'action-saisie', 'defense-saisie', 'corps-force']],
    ['spe-judo', 'Judo', ['defense-chute', 'action-saisie', 'action-projection', 'appuis-poids']],
    ['spe-karate', 'Karaté', ['action-direct', 'action-pied', 'appuis-distance', 'appuis-posture']],
    ['spe-muay-thai', 'Muay-thaï', ['action-pied', 'action-direct', 'action-saisie', 'corps-endurance']],
    ['spe-jjb', 'Jiu-jitsu brésilien', ['defense-chute', 'action-saisie', 'corps-mobilite', 'corps-gainage']]
  ].map(([id, name, pre]) => ({id, branch: 'spe', depth: 7, name, prerequisites: pre, discipline: id.slice(4),
    why: `La ${name.toLowerCase()} combine certaines fondations de façon particulière. Les nœuds reliés indiquent celles qui comptent le plus pour commencer.`,
    exercises: [], tests: [], library: [],
    levels: L('Pratique en club depuis quelques mois.', 'Grade ou niveau reconnu par un enseignant de la discipline.', 'Niveau avancé reconnu (grade, compétition, enseignement).')})),
  {id: 'trans-transfert', branch: 'trans', depth: 8, name: 'Transfert entre disciplines', prerequisites: ['lecture-adaptation'],
    why: 'Réutiliser consciemment ce qui sert d’une discipline à l’autre, adapter le reste, repérer les habitudes gênantes. Voir la Forge de style.',
    exercises: [], tests: [], library: [], levels: L('Sait décrire ce qui se transfère et ce qui doit changer.', 'A travaillé des exercices de transition.', 'Pratique la seconde discipline sans interférence gênante, constaté par un enseignant.')}
];

export const skillById = Object.fromEntries(skills.map(s => [s.id, s]));
// Correspondance capacités des exercices → nœuds « Corps ».
export const capacityToSkill = {force: 'corps-force', 'endurance-musculaire': 'corps-endurance-musculaire', endurance: 'corps-endurance', mobilite: 'corps-mobilite',
  souplesse: 'corps-souplesse', reaction: 'corps-reaction', coordination: 'corps-coordination', equilibre: 'corps-equilibre', appuis: 'appuis-pas', recuperation: 'corps-recuperation'};
