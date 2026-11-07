// Objectifs martiaux et programmes de 4 semaines de LA FORGE (version 0.2).
// Proposition éditoriale rédigée par une IA (Claude Code), non validée par un entraîneur.
// Contrat : voir docs/PLAN_V0.2.md, section « Contrats de données ».
// Tous les exerciseId renvoient à public/js/data/exercises.js.

const NOTE_EDITORIALE = 'Ce programme est une proposition éditoriale rédigée par une IA, non validée par un entraîneur ni par un professionnel de santé. Adaptez-le à vos sensations et arrêtez en cas de douleur, de vertige ou de malaise.';

const PROGRESSION_GENERALE = 'Double progression : quand toutes les séries d’un exercice sont faites proprement avec de la marge (vous auriez pu faire encore 2 ou 3 répétitions), ajoutez 1 répétition par série à la séance suivante. Quand vous atteignez le haut de la fourchette (environ +4 répétitions), passez à une variante un peu plus difficile et revenez au nombre de départ. Pour les exercices en durée, ajoutez 5 secondes par série de la même façon. Ne cherchez jamais l’échec ni un maximum. La semaine 4 est plus légère : gardez les mêmes exercices avec une série de moins pour récupérer.';

const WARMUP_STANDARD = [
  { exerciseId: 'mobilisation-articulaire', durationSec: 120 },
  { exerciseId: 'montee-progressive', durationSec: 180 },
  { exerciseId: 'cercles-bras-epaules', durationSec: 60 }
];

const COOLDOWN_STANDARD = [
  { exerciseId: 'marche-retour-calme', durationSec: 60 },
  { exerciseId: 'etirements-doux', durationSec: 150 },
  { exerciseId: 'respiration-lente', durationSec: 90 }
];

export const goals = [
  {
    id: 'bases',
    name: 'Base physique générale pour la pratique',
    description: 'Construire une base simple de force, de gainage, d’endurance et d’équilibre, utile quelle que soit la discipline.',
    capacities: [
      { id: 'force', why: 'Un minimum de force générale (jambes, poussée, tirage) est couramment recherché pour aborder l’entraînement martial dans de bonnes conditions.' },
      { id: 'endurance-musculaire', why: 'Le gainage et les répétitions modérées aident à garder une posture correcte quand la fatigue arrive.' },
      { id: 'endurance', why: 'Une base d’endurance permet de suivre plus confortablement un cours complet.' },
      { id: 'equilibre', why: 'L’équilibre est sollicité dans les déplacements et sur une jambe ; il est souvent travaillé en complément.' }
    ],
    programId: 'programme-bases'
  },
  {
    id: 'appuis',
    name: 'Appuis, équilibre et déplacements',
    description: 'Travailler la stabilité, la coordination des pieds et l’aisance dans les déplacements en garde.',
    capacities: [
      { id: 'appuis', why: 'Des appuis précis et légers sont un objectif courant de la préparation dans les sports de combat.' },
      { id: 'equilibre', why: 'Rester stable sur une jambe ou en mouvement est sollicité dans de nombreuses techniques.' },
      { id: 'coordination', why: 'Coordonner les pieds et le haut du corps rend les déplacements plus fluides ; c’est un travail complémentaire répandu.' },
      { id: 'force', why: 'Des jambes plus fortes aident à tenir les positions fléchies ; le lien avec les appuis est plausible mais indirect.' }
    ],
    programId: 'programme-appuis'
  },
  {
    id: 'hanches',
    name: 'Mobilité des hanches et souplesse',
    description: 'Entretenir la mobilité des hanches, de l’arrière des cuisses et des chevilles, souvent recherchée pour les coups de pied.',
    capacities: [
      { id: 'mobilite', why: 'Une bonne mobilité des hanches est couramment travaillée par les pratiquants qui donnent des coups de pied.' },
      { id: 'souplesse', why: 'La souplesse de l’arrière et de l’intérieur des cuisses facilite certaines positions ; elle se construit lentement.' },
      { id: 'force', why: 'Renforcer les hanches dans l’amplitude gagnée aide à mieux contrôler cette amplitude.' },
      { id: 'equilibre', why: 'Les coups de pied se donnent sur une jambe : l’équilibre est un complément logique.' }
    ],
    programId: 'programme-hanches'
  },
  {
    id: 'condition',
    name: 'Tenir l’effort sur des rounds ou des randoris',
    description: 'Améliorer la capacité à enchaîner des efforts et à récupérer entre eux, avec des intensités maîtrisées.',
    capacities: [
      { id: 'endurance', why: 'Une base d’endurance aide à récupérer entre les rounds ; c’est un objectif classique de la préparation physique.' },
      { id: 'endurance-musculaire', why: 'Répéter des efforts musculaires modérés aide à garder une posture et une garde correctes en fin de round.' },
      { id: 'appuis', why: 'Garder des appuis actifs quand la fatigue arrive est un travail complémentaire courant.' }
    ],
    programId: 'programme-condition'
  },
  {
    id: 'force',
    name: 'Force générale et saisies',
    description: 'Développer une force générale du corps entier et la tenue de la prise, utiles dans les disciplines de saisie.',
    capacities: [
      { id: 'force', why: 'La force générale (tirer, pousser, se baisser) est couramment travaillée en complément des disciplines de saisie.' },
      { id: 'endurance-musculaire', why: 'Tenir une prise ou une position dans la durée est sollicité dans les échanges au corps à corps.' },
      { id: 'equilibre', why: 'Le travail sur une jambe complète la force générale et la stabilité.' }
    ],
    programId: 'programme-force'
  },
  {
    id: 'reaction',
    name: 'Réaction et prise d’information',
    description: 'S’entraîner à réagir à un signal et à coordonner les yeux, les mains et les pieds.',
    capacities: [
      { id: 'reaction', why: 'Réagir à un signal simple est un exercice complémentaire courant ; son transfert direct au combat est discuté et reste limité.' },
      { id: 'coordination', why: 'La coordination œil-main et œil-pied se travaille couramment avec des jeux de balle et des signaux.' },
      { id: 'appuis', why: 'Être prêt à bouger dépend aussi de la position des appuis.' }
    ],
    programId: 'programme-reaction'
  },
  {
    id: 'recuperation',
    name: 'Récupérer et entretenir',
    description: 'Des séances douces pour bouger, entretenir la mobilité et récupérer entre des entraînements plus intenses.',
    capacities: [
      { id: 'recuperation', why: 'Une activité douce et la respiration lente sont des habitudes courantes pour récupérer entre deux séances.' },
      { id: 'mobilite', why: 'Entretenir la mobilité sans intensité aide à garder des amplitudes confortables.' },
      { id: 'endurance', why: 'La marche à allure modérée entretient la base d’endurance sans fatigue importante.' }
    ],
    programId: 'programme-recuperation'
  }
];

export const programs = [
  // ───────────── Base physique générale ─────────────
  {
    id: 'programme-bases',
    name: 'Base physique générale',
    goalId: 'bases',
    weeks: 4,
    sessionsPerWeek: [2, 3],
    explanation: 'Trois séances complémentaires (A, B, C) à enchaîner dans l’ordre, avec au moins un jour de repos entre deux séances. Avec deux séances par semaine, continuez simplement la rotation A, B, C d’une semaine sur l’autre. Chaque séance commence par une préparation, propose 5 à 6 exercices simples, puis un retour au calme. ' + NOTE_EDITORIALE,
    progression: PROGRESSION_GENERALE,
    sessions: [
      {
        id: 'A',
        title: 'Jambes, poussée, tirage',
        focus: 'Force générale au poids du corps',
        warmup: WARMUP_STANDARD,
        main: [
          { exerciseId: 'squat-poids-corps', sets: 3, reps: 10, durationSec: null, restSec: 75, priority: 1 },
          { exerciseId: 'pompes', sets: 3, reps: 8, durationSec: null, restSec: 90, priority: 1 },
          { exerciseId: 'tirage-allonge-ventre', sets: 3, reps: 12, durationSec: null, restSec: 60, priority: 1 },
          { exerciseId: 'pont-fessier', sets: 3, reps: 12, durationSec: null, restSec: 60, priority: 2 },
          { exerciseId: 'gainage-planche', sets: 3, reps: null, durationSec: 30, restSec: 45, priority: 2 },
          { exerciseId: 'equilibre-unipodal', sets: 2, reps: null, durationSec: 40, restSec: 30, priority: 3 }
        ],
        cooldown: COOLDOWN_STANDARD
      },
      {
        id: 'B',
        title: 'Une jambe, dos et gainage',
        focus: 'Force et stabilité',
        warmup: WARMUP_STANDARD,
        main: [
          { exerciseId: 'fente-arriere', sets: 3, reps: 8, durationSec: null, restSec: 75, priority: 1 },
          { exerciseId: 'rowing-elastique', sets: 3, reps: 12, durationSec: null, restSec: 60, priority: 1 },
          { exerciseId: 'charniere-hanche', sets: 3, reps: 10, durationSec: null, restSec: 60, priority: 2 },
          { exerciseId: 'pompes-genoux', sets: 2, reps: 12, durationSec: null, restSec: 60, priority: 2 },
          { exerciseId: 'gainage-lateral', sets: 3, reps: null, durationSec: 40, restSec: 45, priority: 2 },
          { exerciseId: 'dead-bug', sets: 2, reps: 10, durationSec: null, restSec: 45, priority: 3 }
        ],
        cooldown: COOLDOWN_STANDARD
      },
      {
        id: 'C',
        title: 'Endurance et déplacements',
        focus: 'Endurance générale et coordination',
        warmup: WARMUP_STANDARD,
        main: [
          { exerciseId: 'intervalles-doux', sets: 1, reps: null, durationSec: 480, restSec: 0, priority: 1 },
          { exerciseId: 'deplacements-en-garde', sets: 3, reps: null, durationSec: 60, restSec: 45, priority: 1 },
          { exerciseId: 'squat-poids-corps', sets: 2, reps: 12, durationSec: null, restSec: 60, priority: 2 },
          { exerciseId: 'dead-bug', sets: 3, reps: 8, durationSec: null, restSec: 45, priority: 2 },
          { exerciseId: 'hanches-90-90', sets: 2, reps: null, durationSec: 60, restSec: 20, priority: 3 }
        ],
        cooldown: COOLDOWN_STANDARD
      }
    ]
  },

  // ───────────── Appuis, équilibre, déplacements ─────────────
  {
    id: 'programme-appuis',
    name: 'Appuis, équilibre et déplacements',
    goalId: 'appuis',
    weeks: 4,
    sessionsPerWeek: [2],
    explanation: 'Deux séances par semaine (A puis B), séparées d’au moins un jour. On travaille d’abord la précision et l’équilibre, quand on est frais, puis la force des jambes. La vitesse n’augmente que si la précision reste bonne. ' + NOTE_EDITORIALE,
    progression: 'Pour les exercices d’appuis et d’équilibre, augmentez d’abord la difficulté (motif d’échelle plus complexe, yeux fermés quelques secondes pour l’équilibre, changements de direction) avant la vitesse. Pour les exercices de force, double progression : ajoutez 1 répétition par série quand toutes les séries sont faites avec de la marge, puis passez à une variante plus difficile. Ne cherchez jamais l’échec ni un maximum. Semaine 4 plus légère : une série de moins partout.',
    sessions: [
      {
        id: 'A',
        title: 'Précision des appuis',
        focus: 'Échelle au sol, équilibre et déplacements en garde',
        warmup: [
          { exerciseId: 'mobilisation-articulaire', durationSec: 120 },
          { exerciseId: 'montee-progressive', durationSec: 150 },
          { exerciseId: 'chevilles-genou-mur', durationSec: 90 }
        ],
        main: [
          { exerciseId: 'echelle-au-sol', sets: 4, reps: null, durationSec: 45, restSec: 45, priority: 1 },
          { exerciseId: 'equilibre-unipodal', sets: 3, reps: null, durationSec: 40, restSec: 30, priority: 1 },
          { exerciseId: 'deplacements-en-garde', sets: 4, reps: null, durationSec: 60, restSec: 45, priority: 1 },
          { exerciseId: 'fente-arriere', sets: 3, reps: 8, durationSec: null, restSec: 75, priority: 2 },
          { exerciseId: 'pas-croises', sets: 3, reps: null, durationSec: 40, restSec: 30, priority: 2 },
          { exerciseId: 'gainage-lateral', sets: 2, reps: null, durationSec: 40, restSec: 45, priority: 3 }
        ],
        cooldown: COOLDOWN_STANDARD
      },
      {
        id: 'B',
        title: 'Légèreté et stabilité',
        focus: 'Corde à sauter, pas croisés et jambes',
        warmup: [
          { exerciseId: 'mobilisation-articulaire', durationSec: 120 },
          { exerciseId: 'montee-progressive', durationSec: 150 },
          { exerciseId: 'balancier-jambes', durationSec: 90 }
        ],
        main: [
          { exerciseId: 'corde-a-sauter', sets: 5, reps: null, durationSec: 60, restSec: 45, priority: 1 },
          { exerciseId: 'pas-croises', sets: 3, reps: null, durationSec: 45, restSec: 30, priority: 1 },
          { exerciseId: 'equilibre-unipodal', sets: 3, reps: null, durationSec: 40, restSec: 30, priority: 1 },
          { exerciseId: 'squat-poids-corps', sets: 3, reps: 10, durationSec: null, restSec: 60, priority: 2 },
          { exerciseId: 'chaise-murale', sets: 2, reps: null, durationSec: 40, restSec: 45, priority: 2 },
          { exerciseId: 'shadow-leger', sets: 3, reps: null, durationSec: 90, restSec: 45, priority: 3 }
        ],
        cooldown: COOLDOWN_STANDARD
      }
    ]
  },

  // ───────────── Hanches et souplesse ─────────────
  {
    id: 'programme-hanches',
    name: 'Mobilité des hanches et souplesse',
    goalId: 'hanches',
    weeks: 4,
    sessionsPerWeek: [2],
    explanation: 'Deux séances par semaine qui alternent mobilité active, étirements doux tenus sans rebond et renforcement dans l’amplitude. La souplesse progresse lentement : l’idée est la régularité, pas l’intensité. ' + NOTE_EDITORIALE,
    progression: 'Pour la mobilité et les étirements : tenez 10 secondes de plus par série quand la position est confortable, sans jamais forcer ni faire de rebonds. Pour les exercices de force : double progression (1 répétition de plus par série quand tout est fait avec de la marge, puis variante plus difficile). Ne cherchez jamais une amplitude maximale ni l’échec. Semaine 4 plus légère : une série de moins partout.',
    sessions: [
      {
        id: 'A',
        title: 'Hanches mobiles et fortes',
        focus: 'Rotation des hanches, avant des hanches, squat',
        warmup: [
          { exerciseId: 'mobilisation-articulaire', durationSec: 120 },
          { exerciseId: 'marche-sur-place', durationSec: 120 },
          { exerciseId: 'balancier-jambes', durationSec: 120 }
        ],
        main: [
          { exerciseId: 'hanches-90-90', sets: 3, reps: null, durationSec: 60, restSec: 20, priority: 1 },
          { exerciseId: 'fente-basse-flechisseurs', sets: 2, reps: null, durationSec: 60, restSec: 20, priority: 1 },
          { exerciseId: 'squat-poids-corps', sets: 3, reps: 10, durationSec: null, restSec: 60, priority: 1 },
          { exerciseId: 'pont-fessier', sets: 3, reps: 12, durationSec: null, restSec: 45, priority: 2 },
          { exerciseId: 'papillon-adducteurs', sets: 2, reps: null, durationSec: 60, restSec: 20, priority: 2 },
          { exerciseId: 'equilibre-unipodal', sets: 3, reps: null, durationSec: 40, restSec: 30, priority: 3 }
        ],
        cooldown: COOLDOWN_STANDARD
      },
      {
        id: 'B',
        title: 'Arrière des cuisses et chevilles',
        focus: 'Charnière de hanche, ischios, chevilles, haut du dos',
        warmup: [
          { exerciseId: 'mobilisation-articulaire', durationSec: 120 },
          { exerciseId: 'marche-sur-place', durationSec: 120 },
          { exerciseId: 'chat-vache', durationSec: 90 }
        ],
        main: [
          { exerciseId: 'charniere-hanche', sets: 3, reps: 10, durationSec: null, restSec: 60, priority: 1 },
          { exerciseId: 'ischios-allonge', sets: 2, reps: null, durationSec: 60, restSec: 20, priority: 1 },
          { exerciseId: 'fente-arriere', sets: 3, reps: 8, durationSec: null, restSec: 75, priority: 1 },
          { exerciseId: 'hanches-90-90', sets: 2, reps: null, durationSec: 90, restSec: 20, priority: 2 },
          { exerciseId: 'chevilles-genou-mur', sets: 2, reps: 10, durationSec: null, restSec: 30, priority: 2 },
          { exerciseId: 'rotations-thoraciques', sets: 2, reps: 8, durationSec: null, restSec: 30, priority: 3 }
        ],
        cooldown: COOLDOWN_STANDARD
      }
    ]
  },

  // ───────────── Condition (rounds / randoris) ─────────────
  {
    id: 'programme-condition',
    name: 'Tenir l’effort sur des rounds',
    goalId: 'condition',
    weeks: 4,
    sessionsPerWeek: [2, 3],
    explanation: 'Trois séances : A alterne des efforts musculaires et du shadow, B s’appuie sur la corde à sauter et des formats proches des rounds, C est une longue marche rapide pour construire la base. Avec deux séances par semaine, faites A et B, et ajoutez C quand c’est possible. L’intensité reste maîtrisée : on doit toujours pouvoir dire quelques mots. ' + NOTE_EDITORIALE,
    progression: 'Pour les blocs en durée : ajoutez 10 secondes par série, ou une série, quand vous terminez avec de la marge et une respiration qui revient vite au calme. Pour les exercices en répétitions : double progression (1 répétition de plus par série, puis variante plus difficile). Pour la marche rapide : ajoutez 2 à 3 minutes par semaine. Ne cherchez jamais l’effort maximal. Semaine 4 plus légère : une série de moins partout.',
    sessions: [
      {
        id: 'A',
        title: 'Circuit et shadow',
        focus: 'Endurance musculaire et rythme',
        warmup: WARMUP_STANDARD,
        main: [
          { exerciseId: 'shadow-leger', sets: 3, reps: null, durationSec: 120, restSec: 60, priority: 1 },
          { exerciseId: 'squat-poids-corps', sets: 3, reps: 15, durationSec: null, restSec: 45, priority: 1 },
          { exerciseId: 'pompes', sets: 3, reps: 10, durationSec: null, restSec: 60, priority: 1 },
          { exerciseId: 'grimpeur-lent', sets: 3, reps: null, durationSec: 30, restSec: 45, priority: 2 },
          { exerciseId: 'tirage-allonge-ventre', sets: 3, reps: 15, durationSec: null, restSec: 45, priority: 2 },
          { exerciseId: 'gainage-planche', sets: 2, reps: null, durationSec: 40, restSec: 45, priority: 3 }
        ],
        cooldown: COOLDOWN_STANDARD
      },
      {
        id: 'B',
        title: 'Rounds de corde et de déplacements',
        focus: 'Endurance générale en format rounds',
        warmup: WARMUP_STANDARD,
        main: [
          { exerciseId: 'corde-a-sauter', sets: 6, reps: null, durationSec: 90, restSec: 60, priority: 1 },
          { exerciseId: 'deplacements-en-garde', sets: 3, reps: null, durationSec: 90, restSec: 45, priority: 1 },
          { exerciseId: 'fente-arriere', sets: 3, reps: 10, durationSec: null, restSec: 60, priority: 2 },
          { exerciseId: 'chaise-murale', sets: 3, reps: null, durationSec: 40, restSec: 45, priority: 2 },
          { exerciseId: 'gainage-lateral', sets: 2, reps: null, durationSec: 40, restSec: 30, priority: 3 }
        ],
        cooldown: COOLDOWN_STANDARD
      },
      {
        id: 'C',
        title: 'Base d’endurance',
        focus: 'Longue marche rapide et entretien',
        warmup: [
          { exerciseId: 'mobilisation-articulaire', durationSec: 120 },
          { exerciseId: 'marche-sur-place', durationSec: 180 }
        ],
        main: [
          { exerciseId: 'marche-rapide', sets: 1, reps: null, durationSec: 1200, restSec: 0, priority: 1 },
          { exerciseId: 'pont-fessier', sets: 2, reps: 15, durationSec: null, restSec: 45, priority: 2 },
          { exerciseId: 'gainage-lateral', sets: 2, reps: null, durationSec: 40, restSec: 30, priority: 2 },
          { exerciseId: 'hanches-90-90', sets: 2, reps: null, durationSec: 60, restSec: 20, priority: 3 }
        ],
        cooldown: COOLDOWN_STANDARD
      }
    ]
  },

  // ───────────── Force et saisies ─────────────
  {
    id: 'programme-force',
    name: 'Force générale et saisies',
    goalId: 'force',
    weeks: 4,
    sessionsPerWeek: [2],
    explanation: 'Deux séances par semaine (A puis B), séparées d’au moins deux jours. Les repos sont plus longs que dans les autres programmes, car on cherche des répétitions de qualité avec une charge modérée. Sans haltères, kettlebell ou barre de traction, l’application propose des exercices de remplacement au poids du corps. ' + NOTE_EDITORIALE,
    progression: 'Double progression : quand toutes les séries d’un exercice sont faites proprement en gardant 2 ou 3 répétitions en réserve, ajoutez 1 répétition par série la fois suivante. Arrivé à environ +3 répétitions, augmentez légèrement la charge (ou passez à une variante plus difficile) et revenez au nombre de départ. Pour la suspension et le gainage, ajoutez 5 secondes par série. Ne cherchez jamais l’échec ni une charge maximale. Semaine 4 plus légère : une série de moins partout.',
    sessions: [
      {
        id: 'A',
        title: 'Squat, poussée, tirage',
        focus: 'Force générale avec charge modérée',
        warmup: [
          { exerciseId: 'mobilisation-articulaire', durationSec: 120 },
          { exerciseId: 'montee-progressive', durationSec: 150 },
          { exerciseId: 'cercles-bras-epaules', durationSec: 60 },
          { exerciseId: 'squat-poids-corps', durationSec: 60 }
        ],
        main: [
          { exerciseId: 'squat-goblet', sets: 4, reps: 8, durationSec: null, restSec: 90, priority: 1 },
          { exerciseId: 'pompes', sets: 4, reps: 8, durationSec: null, restSec: 90, priority: 1 },
          { exerciseId: 'rowing-haltere', sets: 3, reps: 10, durationSec: null, restSec: 75, priority: 1 },
          { exerciseId: 'souleve-roumain-halteres', sets: 3, reps: 10, durationSec: null, restSec: 90, priority: 2 },
          { exerciseId: 'gainage-planche', sets: 3, reps: null, durationSec: 40, restSec: 45, priority: 2 },
          { exerciseId: 'suspension-barre', sets: 2, reps: null, durationSec: 20, restSec: 60, priority: 3 }
        ],
        cooldown: COOLDOWN_STANDARD
      },
      {
        id: 'B',
        title: 'Tractions, une jambe, prise',
        focus: 'Tirage, jambes et tenue de la prise',
        warmup: [
          { exerciseId: 'mobilisation-articulaire', durationSec: 120 },
          { exerciseId: 'montee-progressive', durationSec: 150 },
          { exerciseId: 'cercles-bras-epaules', durationSec: 60 },
          { exerciseId: 'charniere-hanche', durationSec: 60 }
        ],
        main: [
          { exerciseId: 'tractions', sets: 4, reps: 5, durationSec: null, restSec: 120, priority: 1 },
          { exerciseId: 'fente-arriere', sets: 3, reps: 8, durationSec: null, restSec: 90, priority: 1 },
          { exerciseId: 'souleve-roumain-kettlebell', sets: 3, reps: 10, durationSec: null, restSec: 90, priority: 1 },
          { exerciseId: 'suspension-barre', sets: 3, reps: null, durationSec: 25, restSec: 60, priority: 2 },
          { exerciseId: 'dips-chaise', sets: 3, reps: 10, durationSec: null, restSec: 75, priority: 2 },
          { exerciseId: 'gainage-lateral', sets: 2, reps: null, durationSec: 40, restSec: 45, priority: 3 }
        ],
        cooldown: COOLDOWN_STANDARD
      }
    ]
  },

  // ───────────── Réaction ─────────────
  {
    id: 'programme-reaction',
    name: 'Réaction et prise d’information',
    goalId: 'reaction',
    weeks: 4,
    sessionsPerWeek: [2],
    explanation: 'Deux séances par semaine. Les exercices de réaction se font en début de séance, quand on est frais et attentif. Le signal peut venir d’un partenaire ou de l’application. Les progrès mesurés sur ces exercices ne garantissent pas une meilleure réaction en combat : c’est un travail complémentaire. ' + NOTE_EDITORIALE,
    progression: 'Augmentez la difficulté plutôt que la durée : signaux plus irréguliers, puis deux signaux différents (aller / ne pas aller), puis réponses plus variées. Pour la balle contre le mur : rapprochez-vous un peu ou changez de main. Pour les exercices de force : 1 répétition de plus par série quand tout est fait avec de la marge. Ne cherchez jamais un maximum. Semaine 4 plus légère : une série de moins partout.',
    sessions: [
      {
        id: 'A',
        title: 'Signal et réponse simple',
        focus: 'Réaction à un signal, coordination œil-main',
        warmup: WARMUP_STANDARD,
        main: [
          { exerciseId: 'reaction-signal', sets: 5, reps: null, durationSec: 60, restSec: 45, priority: 1 },
          { exerciseId: 'balle-contre-mur', sets: 4, reps: null, durationSec: 60, restSec: 45, priority: 1 },
          { exerciseId: 'deplacements-en-garde', sets: 3, reps: null, durationSec: 60, restSec: 45, priority: 2 },
          { exerciseId: 'echelle-au-sol', sets: 3, reps: null, durationSec: 45, restSec: 45, priority: 2 },
          { exerciseId: 'squat-poids-corps', sets: 3, reps: 10, durationSec: null, restSec: 60, priority: 3 },
          { exerciseId: 'equilibre-unipodal', sets: 2, reps: null, durationSec: 40, restSec: 30, priority: 3 }
        ],
        cooldown: COOLDOWN_STANDARD
      },
      {
        id: 'B',
        title: 'Choix et déplacements',
        focus: 'Réaction à choix, appuis variés',
        warmup: WARMUP_STANDARD,
        main: [
          { exerciseId: 'balle-contre-mur', sets: 4, reps: null, durationSec: 60, restSec: 45, priority: 1 },
          { exerciseId: 'reaction-signal', sets: 5, reps: null, durationSec: 60, restSec: 45, priority: 1 },
          { exerciseId: 'pas-croises', sets: 3, reps: null, durationSec: 45, restSec: 30, priority: 2 },
          { exerciseId: 'shadow-leger', sets: 3, reps: null, durationSec: 90, restSec: 45, priority: 2 },
          { exerciseId: 'gainage-planche', sets: 3, reps: null, durationSec: 30, restSec: 45, priority: 3 }
        ],
        cooldown: COOLDOWN_STANDARD
      }
    ]
  },

  // ───────────── Récupération / entretien ─────────────
  {
    id: 'programme-recuperation',
    name: 'Récupérer et entretenir',
    goalId: 'recuperation',
    weeks: 4,
    sessionsPerWeek: [2],
    explanation: 'Deux séances douces par semaine, à placer les jours sans entraînement intense. On bouge, on entretient la mobilité et on termine par une respiration lente. Aucune séance ne doit laisser fatigué. ' + NOTE_EDITORIALE,
    progression: 'Ici, pas de recherche de progression : gardez une intensité basse. Vous pouvez allonger la marche de quelques minutes ou tenir les positions de mobilité un peu plus longtemps si c’est agréable. Si vous vous sentez fatigué, raccourcissez la séance.',
    sessions: [
      {
        id: 'A',
        title: 'Marche et mobilité',
        focus: 'Marche rapide, colonne et hanches',
        warmup: [
          { exerciseId: 'mobilisation-articulaire', durationSec: 150 },
          { exerciseId: 'marche-sur-place', durationSec: 150 }
        ],
        main: [
          { exerciseId: 'marche-rapide', sets: 1, reps: null, durationSec: 900, restSec: 0, priority: 1 },
          { exerciseId: 'chat-vache', sets: 2, reps: 8, durationSec: null, restSec: 20, priority: 1 },
          { exerciseId: 'hanches-90-90', sets: 2, reps: null, durationSec: 60, restSec: 20, priority: 1 },
          { exerciseId: 'rotations-thoraciques', sets: 2, reps: 8, durationSec: null, restSec: 20, priority: 2 },
          { exerciseId: 'ischios-allonge', sets: 2, reps: null, durationSec: 60, restSec: 20, priority: 2 },
          { exerciseId: 'pont-fessier', sets: 2, reps: 12, durationSec: null, restSec: 45, priority: 3 }
        ],
        cooldown: [
          { exerciseId: 'etirements-doux', durationSec: 120 },
          { exerciseId: 'respiration-lente', durationSec: 180 }
        ]
      },
      {
        id: 'B',
        title: 'Équilibre et souplesse douce',
        focus: 'Équilibre, hanches et chevilles',
        warmup: [
          { exerciseId: 'mobilisation-articulaire', durationSec: 150 },
          { exerciseId: 'marche-sur-place', durationSec: 150 },
          { exerciseId: 'cercles-bras-epaules', durationSec: 60 }
        ],
        main: [
          { exerciseId: 'marche-rapide', sets: 1, reps: null, durationSec: 600, restSec: 0, priority: 1 },
          { exerciseId: 'fente-basse-flechisseurs', sets: 2, reps: null, durationSec: 60, restSec: 20, priority: 1 },
          { exerciseId: 'equilibre-unipodal', sets: 2, reps: null, durationSec: 40, restSec: 30, priority: 2 },
          { exerciseId: 'papillon-adducteurs', sets: 2, reps: null, durationSec: 60, restSec: 20, priority: 2 },
          { exerciseId: 'chevilles-genou-mur', sets: 2, reps: 10, durationSec: null, restSec: 30, priority: 2 },
          { exerciseId: 'gainage-planche', sets: 2, reps: null, durationSec: 30, restSec: 45, priority: 3 }
        ],
        cooldown: [
          { exerciseId: 'etirements-doux', durationSec: 120 },
          { exerciseId: 'respiration-lente', durationSec: 180 }
        ]
      }
    ]
  }
];
