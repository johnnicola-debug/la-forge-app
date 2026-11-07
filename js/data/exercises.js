// Bibliothèque d’exercices de LA FORGE (version 0.2).
// Contenu rédigé par une IA (Claude Code) : statut 'brouillon', non relu par un entraîneur ni un professionnel de santé.
// Contrat : voir docs/PLAN_V0.2.md, section « Contrats de données ».

const VIGILANCE_GENERALE = 'Arrêtez l’exercice en cas de douleur, de vertige, d’essoufflement inhabituel ou de malaise, et reprenez seulement si tout est revenu à la normale. En cas de doute sur votre état de santé, demandez l’avis d’un professionnel.';

export const exercises = [
  // ───────────── Préparation / échauffement ─────────────
  {
    id: 'mobilisation-articulaire',
    name: 'Mobilisation articulaire de la tête aux pieds',
    capacities: ['mobilite'],
    equipment: [],
    mode: 'time',
    execution: [
      'Debout, pieds largeur de hanches.',
      'Faites lentement quelques cercles de la tête (petite amplitude), puis des épaules.',
      'Enchaînez avec des cercles des coudes, des poignets, puis du bassin.',
      'Terminez par des cercles des genoux (mains sur les cuisses) et des chevilles, un pied après l’autre.',
      'Environ 5 à 8 mouvements par articulation, dans chaque sens.'
    ],
    cues: ['Mouvements lents et ronds, sans forcer en fin d’amplitude.', 'Respirez calmement.'],
    errors: ['Aller trop vite.', 'Chercher l’amplitude maximale dès le début.'],
    vigilance: 'Restez dans une amplitude confortable. ' + VIGILANCE_GENERALE,
    easier: 'Faire les cercles assis sur une chaise.',
    harder: 'Ajouter des cercles plus amples une fois le corps chaud.',
    alternatives: [],
    martialLink: 'Préparer les articulations avant l’effort est un travail complémentaire courant en préparation physique des sports de combat.',
    status: 'brouillon'
  },
  {
    id: 'marche-sur-place',
    name: 'Marche active sur place',
    capacities: ['endurance', 'coordination'],
    equipment: [],
    mode: 'time',
    execution: [
      'Marchez sur place en balançant naturellement les bras.',
      'Montez un peu les genoux après la première minute.',
      'Vous pouvez aussi marcher dans la pièce ou dehors.'
    ],
    cues: ['Respiration aisée : vous devez pouvoir parler.', 'Posez le pied en douceur.'],
    errors: ['Accélérer trop tôt.'],
    vigilance: VIGILANCE_GENERALE,
    easier: 'Marcher plus lentement, sans monter les genoux.',
    harder: 'Marcher plus vite en montant davantage les genoux.',
    alternatives: [],
    martialLink: 'Faire monter doucement le rythme cardiaque est une étape courante de l’échauffement avant une séance de sport de combat.',
    status: 'brouillon'
  },
  {
    id: 'montee-progressive',
    name: 'Montée progressive en intensité',
    capacities: ['endurance', 'coordination', 'appuis'],
    equipment: [],
    mode: 'time',
    execution: [
      'Commencez par 30 secondes de marche active.',
      'Passez à des pas chassés légers à droite puis à gauche.',
      'Ajoutez des montées de genoux en marchant, puis en trottinant sur place si c’est confortable.',
      'Terminez par quelques rotations du buste, bras relâchés.'
    ],
    cues: ['L’intensité monte petit à petit, jamais d’un coup.', 'Restez léger sur les appuis.'],
    errors: ['Transformer l’échauffement en effort intense.', 'Sauter alors que les chevilles ne sont pas prêtes.'],
    vigilance: 'Restez sans sauts si les sauts vous gênent. ' + VIGILANCE_GENERALE,
    easier: 'Tout faire en marchant, sans trottiner.',
    harder: 'Ajouter de petits sauts sur place en fin d’échauffement.',
    alternatives: [],
    martialLink: 'Monter en intensité progressivement est une pratique courante avant le travail technique ou les rounds.',
    status: 'brouillon'
  },
  {
    id: 'cercles-bras-epaules',
    name: 'Cercles de bras et ouverture des épaules',
    capacities: ['mobilite'],
    equipment: [],
    mode: 'time',
    execution: [
      'Debout, bras le long du corps.',
      'Faites de petits cercles avec les bras tendus sur les côtés, puis agrandissez-les.',
      'Changez de sens.',
      'Croisez puis ouvrez les bras devant la poitrine plusieurs fois.'
    ],
    cues: ['Épaules basses, loin des oreilles.', 'Amplitude progressive.'],
    errors: ['Lancer les bras avec élan.'],
    vigilance: 'Diminuez l’amplitude si l’épaule tire ou accroche. ' + VIGILANCE_GENERALE,
    easier: 'Faire des cercles d’épaules seulement, bras le long du corps.',
    harder: 'Faire les cercles un bras après l’autre, plus lentement et plus amples.',
    alternatives: [],
    martialLink: 'Échauffer les épaules avant de frapper ou de saisir est un travail complémentaire courant.',
    status: 'brouillon'
  },
  {
    id: 'balancier-jambes',
    name: 'Balanciers de jambes contrôlés',
    capacities: ['mobilite', 'equilibre'],
    equipment: [],
    mode: 'time',
    execution: [
      'Debout, une main posée sur un mur ou un dossier de chaise si besoin.',
      'Balancez une jambe d’avant en arrière, petite amplitude au début.',
      'Agrandissez progressivement, sans à-coup.',
      'Faites aussi des balanciers sur le côté, devant le corps.',
      'Changez de jambe à mi-temps.'
    ],
    cues: ['Le buste reste à peu près droit.', 'Le mouvement est contrôlé, pas lancé.'],
    errors: ['Lancer la jambe le plus haut possible.', 'Cambrer le bas du dos.'],
    vigilance: 'Pas de mouvement brusque : arrêtez si l’arrière de la cuisse ou l’aine tire fortement. ' + VIGILANCE_GENERALE,
    easier: 'Réduire l’amplitude et garder un appui à la main.',
    harder: 'Faire les balanciers sans appui, en gardant l’équilibre.',
    alternatives: [],
    martialLink: 'Préparer les hanches avant le travail de jambes est un travail complémentaire courant dans les disciplines qui utilisent des coups de pied.',
    status: 'brouillon'
  },

  // ───────────── Force ─────────────
  {
    id: 'squat-poids-corps',
    name: 'Squat au poids du corps',
    capacities: ['force', 'mobilite'],
    equipment: [],
    mode: 'reps',
    execution: [
      'Debout, pieds un peu plus larges que les hanches, pointes légèrement ouvertes.',
      'Descendez en poussant les hanches vers l’arrière et en pliant les genoux, comme pour vous asseoir.',
      'Descendez aussi bas que possible en gardant le dos droit et les talons au sol.',
      'Remontez en poussant dans le sol.'
    ],
    cues: ['Genoux dans l’axe des pieds.', 'Poids réparti sur tout le pied.', 'Buste gainé.'],
    errors: ['Genoux qui rentrent vers l’intérieur.', 'Talons qui décollent.', 'Dos qui s’arrondit en bas.'],
    vigilance: 'Réduisez la profondeur si un genou ou une hanche gêne. ' + VIGILANCE_GENERALE,
    easier: 'Squat vers une chaise : s’asseoir légèrement puis se relever.',
    harder: 'Marquer une pause de 2 secondes en bas, ou passer au squat avec une charge tenue contre la poitrine.',
    alternatives: [],
    martialLink: 'Le renforcement des jambes est un travail complémentaire courant en préparation physique des sports de combat.',
    status: 'brouillon'
  },
  {
    id: 'squat-goblet',
    name: 'Squat gobelet (haltère ou kettlebell)',
    capacities: ['force'],
    equipment: ['halteres'],
    mode: 'reps',
    execution: [
      'Tenez un haltère (ou une kettlebell) verticalement contre la poitrine, coudes vers le bas.',
      'Pieds un peu plus larges que les hanches.',
      'Descendez en gardant la charge contre vous et le buste redressé.',
      'Remontez en poussant dans le sol.'
    ],
    cues: ['La charge reste collée à la poitrine.', 'Genoux dans l’axe des pieds.'],
    errors: ['Charge trop lourde qui fait pencher le buste.', 'Descente non contrôlée.'],
    vigilance: 'Choisissez une charge qui permet de garder une bonne technique sur toutes les répétitions. ' + VIGILANCE_GENERALE,
    easier: 'Squat au poids du corps.',
    harder: 'Descente lente sur 3 secondes, ou charge un peu plus lourde.',
    alternatives: ['squat-poids-corps'],
    martialLink: 'Renforcer les jambes avec une charge modérée est un travail complémentaire courant en préparation physique des sports de combat.',
    status: 'brouillon'
  },
  {
    id: 'fente-arriere',
    name: 'Fente arrière alternée',
    capacities: ['force', 'equilibre'],
    equipment: [],
    mode: 'reps',
    execution: [
      'Debout, pieds largeur de hanches.',
      'Reculez une jambe d’un grand pas et descendez jusqu’à ce que le genou arrière approche du sol.',
      'Revenez en poussant sur le pied avant.',
      'Alternez les jambes. Le nombre de répétitions s’entend par jambe.'
    ],
    cues: ['Buste droit.', 'Genou avant au-dessus du pied, dans son axe.'],
    errors: ['Pas trop court.', 'Genou avant qui part vers l’intérieur.', 'Perdre l’équilibre en revenant.'],
    vigilance: 'Gardez une main sur un mur si l’équilibre est difficile. ' + VIGILANCE_GENERALE,
    easier: 'Fente sur place, une main en appui sur un mur, avec une descente partielle.',
    harder: 'Tenir des haltères, ou marquer une pause en bas.',
    alternatives: [],
    martialLink: 'Le travail sur une jambe est un complément courant en préparation physique des sports de combat, où les appuis sont souvent décalés.',
    status: 'brouillon'
  },
  {
    id: 'pompes',
    name: 'Pompes',
    capacities: ['force', 'endurance-musculaire'],
    equipment: [],
    mode: 'reps',
    execution: [
      'Mains au sol un peu plus larges que les épaules, corps aligné de la tête aux talons.',
      'Descendez la poitrine vers le sol en gardant les coudes à environ 45° du corps.',
      'Remontez en poussant le sol.'
    ],
    cues: ['Corps gainé comme une planche.', 'Mouvement complet et contrôlé.'],
    errors: ['Hanches qui s’affaissent.', 'Coudes très écartés.', 'Demi-répétitions.'],
    vigilance: 'Passez à une variante plus simple si les poignets ou les épaules gênent. ' + VIGILANCE_GENERALE,
    easier: 'Pompes sur les genoux ou mains contre un mur.',
    harder: 'Pompes avec descente lente sur 3 secondes, ou pieds légèrement surélevés.',
    alternatives: ['pompes-genoux', 'pompes-mur'],
    martialLink: 'Les pompes sont un travail complémentaire courant en préparation physique des sports de combat pour renforcer le haut du corps.',
    status: 'brouillon'
  },
  {
    id: 'pompes-genoux',
    name: 'Pompes sur les genoux',
    capacities: ['force', 'endurance-musculaire'],
    equipment: [],
    mode: 'reps',
    execution: [
      'Mains au sol un peu plus larges que les épaules, genoux posés au sol.',
      'Corps aligné des genoux à la tête.',
      'Descendez la poitrine vers le sol puis remontez.'
    ],
    cues: ['Bassin aligné, pas cassé.', 'Amplitude complète.'],
    errors: ['Fesses en l’air.', 'Tête qui tombe vers le sol.'],
    vigilance: 'Placez un coussin ou un tapis sous les genoux si le sol est dur. ' + VIGILANCE_GENERALE,
    easier: 'Pompes contre un mur.',
    harder: 'Pompes classiques.',
    alternatives: ['pompes-mur'],
    martialLink: 'Variante d’entrée des pompes, travail complémentaire courant pour construire la force du haut du corps.',
    status: 'brouillon'
  },
  {
    id: 'pompes-mur',
    name: 'Pompes contre un mur',
    capacities: ['force'],
    equipment: ['mur'],
    mode: 'reps',
    execution: [
      'Debout face à un mur, à un grand pas de distance.',
      'Mains sur le mur à hauteur d’épaules.',
      'Pliez les coudes pour approcher la poitrine du mur, puis repoussez.'
    ],
    cues: ['Corps droit et gainé.', 'Plus les pieds sont loin du mur, plus c’est difficile.'],
    errors: ['Creuser le dos.', 'Mouvement trop rapide.'],
    vigilance: VIGILANCE_GENERALE,
    easier: 'Se rapprocher du mur.',
    harder: 'Mains sur une table stable ou un plan de travail, puis pompes sur les genoux.',
    alternatives: [],
    martialLink: 'Point d’entrée simple pour construire la force de poussée, travail complémentaire courant.',
    status: 'brouillon'
  },
  {
    id: 'tractions',
    name: 'Tractions à la barre',
    capacities: ['force'],
    equipment: ['barre-traction'],
    mode: 'reps',
    execution: [
      'Suspendu à la barre, mains un peu plus larges que les épaules.',
      'Abaissez d’abord les épaules (éloignez-les des oreilles).',
      'Tirez jusqu’à amener le menton au-dessus de la barre.',
      'Redescendez en contrôlant jusqu’aux bras presque tendus.'
    ],
    cues: ['Pas d’élan avec les jambes.', 'Descente contrôlée.'],
    errors: ['Balancer le corps.', 'Remonter seulement à moitié.', 'Se laisser tomber en bas.'],
    vigilance: 'Utilisez une barre bien fixée. Arrêtez si une épaule ou un coude fait mal. ' + VIGILANCE_GENERALE,
    easier: 'Tractions avec un élastique d’assistance, ou seulement la descente lente (sauter en haut puis descendre en 3 à 5 secondes).',
    harder: 'Marquer une pause en haut, ou ralentir la descente.',
    alternatives: ['tirage-allonge-ventre'],
    martialLink: 'Le renforcement du dos et des bras est un travail complémentaire courant dans les disciplines où l’on saisit et tire.',
    status: 'brouillon'
  },
  {
    id: 'suspension-barre',
    name: 'Suspension à la barre',
    capacities: ['force', 'endurance-musculaire'],
    equipment: ['barre-traction'],
    mode: 'time',
    execution: [
      'Attrapez la barre, mains largeur d’épaules.',
      'Laissez-vous pendre, pieds décollés ou légèrement en appui au sol pour alléger.',
      'Gardez les épaules un peu engagées (pas complètement relâchées).',
      'Tenez la durée prévue puis lâchez en reposant les pieds.'
    ],
    cues: ['Respirez normalement.', 'Prise ferme mais sans crispation du visage.'],
    errors: ['Lâcher brusquement en sautant.', 'Rester complètement relâché si les épaules tirent.'],
    vigilance: 'Diminuez la durée ou gardez les pieds en appui si les mains, coudes ou épaules gênent. ' + VIGILANCE_GENERALE,
    easier: 'Garder les pieds au sol pour porter une partie du poids.',
    harder: 'Tenir plus longtemps, ou avec une serviette enroulée autour de la barre.',
    alternatives: ['gainage-planche'],
    martialLink: 'Travailler la tenue de la prise est un complément courant dans les disciplines de saisie (judo, lutte, grappling).',
    status: 'brouillon'
  },
  {
    id: 'tirage-allonge-ventre',
    name: 'Tirage allongé sur le ventre (sans matériel)',
    capacities: ['force', 'endurance-musculaire'],
    equipment: [],
    mode: 'reps',
    execution: [
      'Allongé sur le ventre, bras tendus devant, front proche du sol.',
      'Décollez légèrement les bras et la poitrine.',
      'Ramenez les coudes vers les côtes en serrant les omoplates, comme pour tirer une barre.',
      'Retendez les bras devant sans poser, puis recommencez.'
    ],
    cues: ['Regard vers le sol, nuque longue.', 'Serrez les omoplates à chaque tirage.'],
    errors: ['Relever la tête et cambrer fort.', 'Aller trop vite.'],
    vigilance: 'Réduisez la hauteur si le bas du dos gêne. ' + VIGILANCE_GENERALE,
    easier: 'Garder la poitrine au sol et ne décoller que les bras.',
    harder: 'Tenir 2 secondes coudes serrés à chaque répétition.',
    alternatives: [],
    martialLink: 'Renforcer le haut du dos sans matériel est un travail complémentaire courant, utile pour équilibrer le travail de poussée.',
    status: 'brouillon'
  },
  {
    id: 'rowing-elastique',
    name: 'Rowing à l’élastique',
    capacities: ['force', 'endurance-musculaire'],
    equipment: ['elastique'],
    mode: 'reps',
    execution: [
      'Fixez l’élastique à hauteur de poitrine (porte fermée, poteau) ou passez-le sous les pieds, assis jambes tendues.',
      'Bras tendus devant, tirez les coudes vers l’arrière le long du corps.',
      'Serrez les omoplates en fin de mouvement.',
      'Revenez lentement.'
    ],
    cues: ['Épaules basses.', 'Retour contrôlé, l’élastique ne doit pas tirer d’un coup.'],
    errors: ['Hausser les épaules.', 'Se pencher en arrière pour tirer.'],
    vigilance: 'Vérifiez l’état de l’élastique et sa fixation avant chaque séance. ' + VIGILANCE_GENERALE,
    easier: 'Se rapprocher du point d’attache pour diminuer la tension.',
    harder: 'S’éloigner du point d’attache ou utiliser un élastique plus résistant.',
    alternatives: ['tirage-allonge-ventre'],
    martialLink: 'Le tirage est un travail complémentaire courant dans les disciplines où l’on saisit et tire.',
    status: 'brouillon'
  },
  {
    id: 'rowing-haltere',
    name: 'Rowing unilatéral à l’haltère',
    capacities: ['force'],
    equipment: ['halteres'],
    mode: 'reps',
    execution: [
      'Une main et un genou en appui sur une chaise ou un banc, dos plat.',
      'L’autre main tient l’haltère, bras tendu vers le sol.',
      'Tirez le coude vers la hanche, puis redescendez lentement.',
      'Le nombre de répétitions s’entend par bras.'
    ],
    cues: ['Dos plat et immobile.', 'Le coude passe près du corps.'],
    errors: ['Tourner le buste pour tirer.', 'Charge trop lourde.'],
    vigilance: 'Choisissez une charge qui permet un mouvement propre. ' + VIGILANCE_GENERALE,
    easier: 'Charge plus légère, ou tirage allongé sur le ventre.',
    harder: 'Pause de 1 seconde en haut, descente sur 3 secondes.',
    alternatives: ['tirage-allonge-ventre'],
    martialLink: 'Le renforcement du dos est un travail complémentaire courant dans les disciplines de saisie.',
    status: 'brouillon'
  },
  {
    id: 'dips-chaise',
    name: 'Dips sur chaise',
    capacities: ['force'],
    equipment: ['chaise'],
    mode: 'reps',
    execution: [
      'Chaise stable calée contre un mur. Mains sur le bord de l’assise, doigts vers l’avant.',
      'Pieds au sol devant vous, genoux pliés.',
      'Pliez les coudes pour descendre le bassin, sans aller trop bas.',
      'Remontez en poussant sur les mains.'
    ],
    cues: ['Épaules loin des oreilles.', 'Dos proche de la chaise.'],
    errors: ['Descendre trop bas.', 'Écarter les coudes sur les côtés.'],
    vigilance: 'Limitez la profondeur et arrêtez si l’avant de l’épaule gêne. ' + VIGILANCE_GENERALE,
    easier: 'Descente partielle, pieds plus proches.',
    harder: 'Jambes plus tendues.',
    alternatives: ['pompes-genoux', 'pompes'],
    martialLink: 'Le renforcement des bras est un travail complémentaire courant en préparation physique des sports de combat.',
    status: 'brouillon'
  },
  {
    id: 'charniere-hanche',
    name: 'Charnière de hanche au poids du corps',
    capacities: ['force', 'souplesse'],
    equipment: [],
    mode: 'reps',
    execution: [
      'Debout, pieds largeur de hanches, genoux légèrement fléchis.',
      'Mains sur les hanches ou croisées sur la poitrine.',
      'Poussez les hanches loin vers l’arrière en penchant le buste, dos droit.',
      'Arrêtez quand l’arrière des cuisses tire légèrement, puis revenez en poussant les hanches vers l’avant.'
    ],
    cues: ['Dos plat du début à la fin.', 'Le mouvement vient des hanches, pas du dos.'],
    errors: ['Arrondir le dos.', 'Plier trop les genoux (cela devient un squat).'],
    vigilance: 'Restez dans une amplitude où le dos reste droit. ' + VIGILANCE_GENERALE,
    easier: 'Fesses vers un mur placé derrière vous, pour guider le mouvement.',
    harder: 'Version sur une jambe, avec une main en appui sur un mur.',
    alternatives: [],
    martialLink: 'Apprendre à plier les hanches dos droit est un geste de base courant en préparation physique, utile pour soulever et se baisser.',
    status: 'brouillon'
  },
  {
    id: 'souleve-roumain-halteres',
    name: 'Soulevé de terre roumain aux haltères',
    capacities: ['force'],
    equipment: ['halteres'],
    mode: 'reps',
    execution: [
      'Debout, un haltère dans chaque main devant les cuisses.',
      'Genoux légèrement fléchis, poussez les hanches vers l’arrière.',
      'Les haltères glissent le long des cuisses vers les tibias, dos droit.',
      'Remontez en poussant les hanches vers l’avant.'
    ],
    cues: ['Haltères proches des jambes.', 'Dos plat, regard un peu devant.'],
    errors: ['Arrondir le dos pour descendre plus bas.', 'Charges éloignées du corps.'],
    vigilance: 'Descendez seulement tant que le dos reste droit. Charge modérée. ' + VIGILANCE_GENERALE,
    easier: 'Charnière de hanche au poids du corps.',
    harder: 'Descente lente sur 3 secondes, ou version sur une jambe.',
    alternatives: ['charniere-hanche', 'pont-fessier'],
    martialLink: 'Le renforcement de l’arrière des jambes et du dos est un travail complémentaire courant en préparation physique des sports de combat.',
    status: 'brouillon'
  },
  {
    id: 'souleve-roumain-kettlebell',
    name: 'Soulevé de terre roumain à la kettlebell',
    capacities: ['force'],
    equipment: ['kettlebell'],
    mode: 'reps',
    execution: [
      'Debout, la kettlebell tenue à deux mains devant les cuisses.',
      'Genoux légèrement fléchis, poussez les hanches vers l’arrière.',
      'Descendez la kettlebell le long des jambes, dos droit.',
      'Remontez en poussant les hanches vers l’avant.'
    ],
    cues: ['Bras relâchés, ce sont les hanches qui travaillent.', 'Dos plat.'],
    errors: ['Tirer avec les bras.', 'Arrondir le dos.'],
    vigilance: 'Descendez seulement tant que le dos reste droit. Charge modérée. ' + VIGILANCE_GENERALE,
    easier: 'Charnière de hanche au poids du corps.',
    harder: 'Descente lente, ou kettlebell un peu plus lourde.',
    alternatives: ['charniere-hanche', 'pont-fessier'],
    martialLink: 'Le renforcement de l’arrière des jambes et du dos est un travail complémentaire courant en préparation physique des sports de combat.',
    status: 'brouillon'
  },
  {
    id: 'pont-fessier',
    name: 'Pont fessier',
    capacities: ['force', 'endurance-musculaire'],
    equipment: [],
    mode: 'reps',
    execution: [
      'Allongé sur le dos, genoux pliés, pieds à plat au sol.',
      'Poussez dans les talons pour monter le bassin jusqu’à aligner épaules, hanches et genoux.',
      'Serrez les fessiers une seconde en haut.',
      'Redescendez lentement.'
    ],
    cues: ['Les fessiers poussent, pas le bas du dos.', 'Côtes basses.'],
    errors: ['Cambrer fort en haut.', 'Pieds trop loin des fesses.'],
    vigilance: VIGILANCE_GENERALE,
    easier: 'Monter moins haut.',
    harder: 'Pont sur une jambe.',
    alternatives: [],
    martialLink: 'Le renforcement des hanches est un travail complémentaire courant en préparation physique des sports de combat.',
    status: 'brouillon'
  },
  {
    id: 'gainage-planche',
    name: 'Gainage en planche',
    capacities: ['force', 'endurance-musculaire'],
    equipment: [],
    mode: 'time',
    execution: [
      'En appui sur les avant-bras et les pointes de pieds.',
      'Corps aligné de la tête aux talons.',
      'Tenez la position en respirant normalement.'
    ],
    cues: ['Serrez légèrement les fessiers et rentrez le ventre.', 'Nuque dans le prolongement du dos.'],
    errors: ['Bassin qui s’affaisse.', 'Fesses trop hautes.', 'Bloquer la respiration.'],
    vigilance: 'Arrêtez dès que la position se dégrade ou que le bas du dos gêne. ' + VIGILANCE_GENERALE,
    easier: 'Planche sur les genoux.',
    harder: 'Décoller un pied quelques secondes en alternance.',
    alternatives: [],
    martialLink: 'Le gainage est un travail complémentaire très courant en préparation physique des sports de combat.',
    status: 'brouillon'
  },
  {
    id: 'gainage-lateral',
    name: 'Gainage latéral',
    capacities: ['force', 'endurance-musculaire', 'equilibre'],
    equipment: [],
    mode: 'time',
    execution: [
      'Sur le côté, en appui sur un avant-bras (coude sous l’épaule) et le côté du pied.',
      'Montez le bassin pour aligner tête, bassin et pieds.',
      'Tenez la moitié du temps d’un côté, puis changez.'
    ],
    cues: ['Bassin haut.', 'Épaule d’appui active, pas écrasée.'],
    errors: ['Bassin qui tombe.', 'Corps qui bascule vers l’avant.'],
    vigilance: 'Arrêtez si l’épaule d’appui gêne. ' + VIGILANCE_GENERALE,
    easier: 'Genoux pliés au sol.',
    harder: 'Lever la jambe du dessus.',
    alternatives: [],
    martialLink: 'Le gainage latéral est un complément courant, en lien avec les rotations du buste présentes dans de nombreuses techniques.',
    status: 'brouillon'
  },
  {
    id: 'dead-bug',
    name: 'Dead bug (insecte sur le dos)',
    capacities: ['force', 'coordination'],
    equipment: [],
    mode: 'reps',
    execution: [
      'Allongé sur le dos, bras tendus vers le plafond, hanches et genoux pliés à 90°.',
      'Plaquez doucement le bas du dos vers le sol.',
      'Allongez lentement un bras derrière la tête et la jambe opposée vers l’avant.',
      'Revenez et changez de côté. Une répétition = un côté.'
    ],
    cues: ['Le bas du dos reste proche du sol.', 'Mouvements lents, expiration pendant l’allongement.'],
    errors: ['Cambrer.', 'Aller vite.'],
    vigilance: VIGILANCE_GENERALE,
    easier: 'Bouger seulement les jambes, ou seulement les bras.',
    harder: 'Tenir 2 secondes en position allongée.',
    alternatives: [],
    martialLink: 'Coordonner bras et jambes opposés en gardant le tronc stable est un travail complémentaire courant.',
    status: 'brouillon'
  },

  // ───────────── Endurance musculaire ─────────────
  {
    id: 'chaise-murale',
    name: 'Chaise contre le mur',
    capacities: ['endurance-musculaire', 'force'],
    equipment: ['mur'],
    mode: 'time',
    execution: [
      'Dos contre un mur, avancez les pieds d’un grand pas.',
      'Glissez vers le bas jusqu’à une hauteur confortable (au plus, cuisses parallèles au sol).',
      'Tenez la position en respirant.'
    ],
    cues: ['Genoux au-dessus des chevilles.', 'Dos bien collé au mur.'],
    errors: ['Descendre trop bas d’emblée.', 'Bloquer la respiration.'],
    vigilance: 'Remontez un peu si un genou gêne. ' + VIGILANCE_GENERALE,
    easier: 'Position plus haute.',
    harder: 'Position plus basse, ou durée plus longue.',
    alternatives: ['squat-poids-corps'],
    martialLink: 'Tenir une position fléchie est un travail complémentaire courant, en lien avec les positions basses de nombreuses disciplines.',
    status: 'brouillon'
  },
  {
    id: 'grimpeur-lent',
    name: 'Grimpeur lent (mountain climber contrôlé)',
    capacities: ['endurance-musculaire', 'endurance', 'coordination'],
    equipment: [],
    mode: 'time',
    execution: [
      'En position de pompe, bras tendus.',
      'Ramenez un genou vers la poitrine, reposez le pied, puis l’autre.',
      'Gardez un rythme régulier et modéré.'
    ],
    cues: ['Bassin stable, à hauteur des épaules.', 'Respiration régulière.'],
    errors: ['Fesses qui montent.', 'Accélérer au point de perdre la position.'],
    vigilance: 'Ralentissez si les poignets gênent ou si le souffle devient difficile. ' + VIGILANCE_GENERALE,
    easier: 'Mains surélevées sur une chaise stable ou contre un mur.',
    harder: 'Rythme un peu plus soutenu, tout en gardant la position.',
    alternatives: [],
    martialLink: 'Travail complémentaire courant pour enchaîner gainage et mouvement des jambes sur la durée.',
    status: 'brouillon'
  },

  // ───────────── Endurance générale ─────────────
  {
    id: 'marche-rapide',
    name: 'Marche rapide',
    capacities: ['endurance', 'recuperation'],
    equipment: [],
    mode: 'time',
    execution: [
      'Marchez d’un pas vif, dehors ou dans un grand espace.',
      'Balancez les bras.',
      'Trouvez un rythme où la respiration s’accélère mais où vous pouvez encore parler par phrases.'
    ],
    cues: ['Rythme soutenu mais tenable.', 'Posture droite.'],
    errors: ['Partir trop vite et devoir s’arrêter.'],
    vigilance: VIGILANCE_GENERALE,
    easier: 'Marche à allure normale.',
    harder: 'Marche en légère montée, ou plus longue.',
    alternatives: [],
    martialLink: 'Construire une base d’endurance à faible intensité est un travail complémentaire courant en préparation physique des sports de combat.',
    status: 'brouillon'
  },
  {
    id: 'corde-a-sauter',
    name: 'Corde à sauter',
    capacities: ['endurance', 'coordination', 'appuis'],
    equipment: ['corde-a-sauter'],
    mode: 'time',
    execution: [
      'Corde réglée : poignées à hauteur des aisselles quand vous êtes debout sur le milieu de la corde.',
      'Petits sauts sur l’avant du pied, poignets qui tournent, coudes près du corps.',
      'Commencez par des séquences courtes avec de courtes pauses si besoin.'
    ],
    cues: ['Sauts bas et légers.', 'Atterrissage souple.'],
    errors: ['Sauter trop haut.', 'Tourner la corde avec les épaules.'],
    vigilance: 'Préférez un sol souple. Arrêtez si les chevilles, les mollets ou les tibias font mal. ' + VIGILANCE_GENERALE,
    easier: 'Faire tourner la corde d’une seule main sur le côté en sautillant, ou sans corde.',
    harder: 'Alterner les pieds comme en courant.',
    alternatives: ['shadow-leger', 'montee-progressive'],
    martialLink: 'La corde à sauter est un exercice complémentaire très répandu en boxe et dans d’autres sports de combat.',
    status: 'brouillon'
  },
  {
    id: 'shadow-leger',
    name: 'Shadow léger sans impact',
    capacities: ['endurance', 'coordination', 'appuis'],
    equipment: [],
    mode: 'time',
    execution: [
      'En garde, face à un espace libre.',
      'Déplacez-vous légèrement (avant, arrière, côtés) et lancez des techniques simples dans le vide, sans force.',
      'Gardez un rythme régulier.'
    ],
    cues: ['Techniques relâchées, sans verrouiller les coudes ni les genoux.', 'Revenez toujours en garde.'],
    errors: ['Frapper fort dans le vide (articulations en extension brutale).', 'Oublier la garde.'],
    vigilance: 'Pas d’extension brusque des coudes ou des genoux. ' + VIGILANCE_GENERALE,
    easier: 'Seulement les déplacements, sans techniques.',
    harder: 'Rythme un peu plus soutenu ou durée plus longue.',
    alternatives: [],
    martialLink: 'Le shadow est un exercice courant dans de nombreuses disciplines de frappe ; ici il sert de travail d’endurance léger.',
    status: 'brouillon'
  },
  {
    id: 'intervalles-doux',
    name: 'Intervalles doux',
    capacities: ['endurance'],
    equipment: [],
    mode: 'time',
    execution: [
      'Alternez 30 secondes d’effort un peu plus soutenu (marche très rapide, montées de genoux, shadow) et 30 secondes de marche calme.',
      'Répétez sur toute la durée prévue.'
    ],
    cues: ['L’effort soutenu reste maîtrisé : jamais à fond.', 'La récupération est active (on continue de marcher).'],
    errors: ['Faire les phases d’effort au maximum.'],
    vigilance: 'L’effort doit rester confortablement difficile, pas maximal. ' + VIGILANCE_GENERALE,
    easier: 'Effort de 20 secondes, récupération de 40 secondes.',
    harder: 'Effort de 40 secondes, récupération de 20 secondes.',
    alternatives: [],
    martialLink: 'Alterner effort et récupération rappelle le rythme des rounds ; c’est un travail complémentaire courant en préparation physique des sports de combat.',
    status: 'brouillon'
  },

  // ───────────── Mobilité / souplesse ─────────────
  {
    id: 'hanches-90-90',
    name: 'Mobilité des hanches en 90-90',
    capacities: ['mobilite', 'souplesse'],
    equipment: [],
    mode: 'time',
    execution: [
      'Assis au sol, une jambe pliée devant (genou à 90°), l’autre pliée sur le côté (genou à 90°).',
      'Redressez le buste au-dessus de la jambe avant, tenez quelques respirations.',
      'Faites pivoter les deux genoux de l’autre côté, mains au sol derrière si besoin.',
      'Alternez lentement.'
    ],
    cues: ['Buste long.', 'Rotation lente, sans forcer.'],
    errors: ['Forcer sur les genoux.', 'Faire des rebonds.'],
    vigilance: 'Aucun rebond. Arrêtez si un genou fait mal. ' + VIGILANCE_GENERALE,
    easier: 'Mains au sol derrière, amplitude réduite.',
    harder: 'Sans les mains, buste droit.',
    alternatives: [],
    martialLink: 'Entretenir la mobilité des hanches est un travail complémentaire courant dans les disciplines qui utilisent des coups de pied ou le travail au sol.',
    status: 'brouillon'
  },
  {
    id: 'fente-basse-flechisseurs',
    name: 'Fente basse pour l’avant des hanches',
    capacities: ['souplesse', 'mobilite'],
    equipment: [],
    mode: 'time',
    execution: [
      'Un genou au sol (coussin si besoin), l’autre pied devant, genou plié.',
      'Rentrez légèrement le bassin, puis avancez doucement les hanches.',
      'Sentez l’étirement à l’avant de la hanche arrière.',
      'Changez de côté à mi-temps.'
    ],
    cues: ['Bassin rentré, pas de cambrure.', 'Respiration lente.'],
    errors: ['Cambrer le dos.', 'Pousser par à-coups.'],
    vigilance: 'Étirement doux, sans rebond ni douleur. ' + VIGILANCE_GENERALE,
    easier: 'Avancer moins les hanches.',
    harder: 'Lever le bras du côté du genou au sol.',
    alternatives: [],
    martialLink: 'Étirer l’avant des hanches est un travail complémentaire courant, notamment chez les pratiquants qui donnent des coups de pied.',
    status: 'brouillon'
  },
  {
    id: 'papillon-adducteurs',
    name: 'Papillon (intérieur des cuisses)',
    capacities: ['souplesse'],
    equipment: [],
    mode: 'time',
    execution: [
      'Assis, plantes de pieds l’une contre l’autre, genoux ouverts.',
      'Tenez les chevilles, dos long.',
      'Penchez doucement le buste vers l’avant en gardant le dos droit.'
    ],
    cues: ['Laissez les genoux descendre seuls, sans les pousser.', 'Expirez lentement.'],
    errors: ['Faire battre les genoux.', 'Arrondir fort le dos.'],
    vigilance: 'Aucun rebond, aucune pression sur les genoux. ' + VIGILANCE_GENERALE,
    easier: 'Pieds plus loin du bassin, dos contre un mur.',
    harder: 'Pieds plus proches du bassin.',
    alternatives: [],
    martialLink: 'La souplesse de l’intérieur des cuisses est couramment travaillée dans les disciplines de jambes et de sol.',
    status: 'brouillon'
  },
  {
    id: 'ischios-allonge',
    name: 'Étirement de l’arrière des cuisses allongé',
    capacities: ['souplesse'],
    equipment: [],
    mode: 'time',
    execution: [
      'Allongé sur le dos, une ceinture ou une serviette autour d’un pied.',
      'Montez la jambe tendue (ou presque) jusqu’à sentir un étirement doux.',
      'Tenez en respirant, l’autre jambe reste au sol.',
      'Changez de jambe à mi-temps.'
    ],
    cues: ['Le bassin reste au sol.', 'Genou très légèrement fléchi si besoin.'],
    errors: ['Tirer fort sur la serviette.', 'Faire des rebonds.'],
    vigilance: 'Étirement doux, sans rebond. Arrêtez en cas de picotement ou de douleur dans la jambe. ' + VIGILANCE_GENERALE,
    easier: 'Plier davantage le genou.',
    harder: 'Tendre davantage la jambe, toujours sans forcer.',
    alternatives: [],
    martialLink: 'Entretenir la souplesse de l’arrière des cuisses est un travail complémentaire courant, notamment pour les coups de pied.',
    status: 'brouillon'
  },
  {
    id: 'chevilles-genou-mur',
    name: 'Mobilité des chevilles genou vers le mur',
    capacities: ['mobilite', 'appuis'],
    equipment: ['mur'],
    mode: 'reps',
    execution: [
      'Face à un mur, un pied à environ une main du mur.',
      'Avancez le genou vers le mur sans décoller le talon.',
      'Revenez, puis recommencez. Les répétitions s’entendent par cheville.',
      'Reculez un peu le pied si le genou touche facilement.'
    ],
    cues: ['Talon au sol.', 'Genou dans l’axe du deuxième orteil.'],
    errors: ['Décoller le talon.', 'Genou qui rentre vers l’intérieur.'],
    vigilance: 'Mouvement doux. Arrêtez si une gêne apparaît à l’avant de la cheville. ' + VIGILANCE_GENERALE,
    easier: 'Pied plus près du mur.',
    harder: 'Pied plus loin du mur.',
    alternatives: [],
    martialLink: 'La mobilité des chevilles est un travail complémentaire courant pour les appuis et les positions fléchies.',
    status: 'brouillon'
  },
  {
    id: 'rotations-thoraciques',
    name: 'Rotations du haut du dos (livre ouvert)',
    capacities: ['mobilite'],
    equipment: [],
    mode: 'reps',
    execution: [
      'Allongé sur le côté, genoux pliés à hauteur de hanches, bras tendus devant l’un sur l’autre.',
      'Ouvrez le bras du dessus en arc de cercle vers l’autre côté, en suivant la main des yeux.',
      'Laissez le haut du dos tourner, genoux toujours collés.',
      'Revenez. Les répétitions s’entendent par côté.'
    ],
    cues: ['Genoux immobiles.', 'Expirez pendant l’ouverture.'],
    errors: ['Forcer l’épaule vers le sol.', 'Laisser les genoux se séparer.'],
    vigilance: 'Restez dans une amplitude sans douleur. ' + VIGILANCE_GENERALE,
    easier: 'Amplitude réduite.',
    harder: 'Tenir 2 respirations en fin d’ouverture.',
    alternatives: [],
    martialLink: 'La mobilité du haut du dos est couramment entretenue, en lien avec les rotations du buste des techniques.',
    status: 'brouillon'
  },
  {
    id: 'chat-vache',
    name: 'Dos rond, dos creux (chat-vache)',
    capacities: ['mobilite', 'recuperation'],
    equipment: [],
    mode: 'reps',
    execution: [
      'À quatre pattes, mains sous les épaules, genoux sous les hanches.',
      'Arrondissez lentement le dos en rentrant le menton (expiration).',
      'Puis creusez doucement en levant le regard (inspiration).'
    ],
    cues: ['Mouvement lent, vertèbre par vertèbre.', 'Suivez votre respiration.'],
    errors: ['Aller vite.', 'Creuser fort.'],
    vigilance: 'Amplitude confortable seulement. ' + VIGILANCE_GENERALE,
    easier: 'Assis sur une chaise, mains sur les genoux.',
    harder: 'Ralentir encore.',
    alternatives: [],
    martialLink: 'Mobiliser la colonne en douceur est une pratique courante d’échauffement et de retour au calme.',
    status: 'brouillon'
  },

  // ───────────── Coordination / équilibre / appuis ─────────────
  {
    id: 'equilibre-unipodal',
    name: 'Équilibre sur une jambe',
    capacities: ['equilibre', 'appuis'],
    equipment: [],
    mode: 'time',
    execution: [
      'Debout près d’un mur ou d’un dossier de chaise pour vous rattraper.',
      'Levez un pied, genou d’appui légèrement fléchi.',
      'Tenez la moitié du temps puis changez de jambe.'
    ],
    cues: ['Regard fixe devant.', 'Pied d’appui bien étalé au sol.'],
    errors: ['Verrouiller le genou d’appui.', 'Retenir sa respiration.'],
    vigilance: 'Restez à portée d’un appui pour éviter les chutes. ' + VIGILANCE_GENERALE,
    easier: 'Garder un doigt sur le mur.',
    harder: 'Fermer les yeux quelques secondes, ou bouger lentement les bras.',
    alternatives: [],
    martialLink: 'L’équilibre sur une jambe est un travail complémentaire courant, notamment dans les disciplines qui utilisent des coups de pied.',
    status: 'brouillon'
  },
  {
    id: 'pas-croises',
    name: 'Pas croisés latéraux',
    capacities: ['coordination', 'appuis'],
    equipment: [],
    mode: 'time',
    execution: [
      'Déplacez-vous sur le côté en croisant un pied devant l’autre, puis derrière (pas de « vigne »).',
      'Faites quelques pas d’un côté puis revenez de l’autre.',
      'Accélérez légèrement quand le mouvement devient fluide.'
    ],
    cues: ['Restez léger sur l’avant des pieds.', 'Hanches souples.'],
    errors: ['Regarder ses pieds en permanence.', 'Accélérer avant d’être à l’aise.'],
    vigilance: 'Espace dégagé, sol non glissant. ' + VIGILANCE_GENERALE,
    easier: 'Pas chassés simples, sans croiser.',
    harder: 'Rythme plus rapide, ou ajouter un changement de direction au signal.',
    alternatives: [],
    martialLink: 'Varier les appuis est un travail de coordination courant en préparation des sports de combat.',
    status: 'brouillon'
  },
  {
    id: 'echelle-au-sol',
    name: 'Échelle d’appuis tracée au sol',
    capacities: ['coordination', 'appuis'],
    equipment: [],
    mode: 'time',
    execution: [
      'Tracez une échelle au sol (ruban adhésif, craie, ou objets plats) : 6 à 8 cases d’environ 40 cm.',
      'Parcourez-la : un pied par case, puis deux pieds par case, puis en pas latéraux.',
      'Revenez en marchant et recommencez avec un autre motif.'
    ],
    cues: ['Précision avant vitesse.', 'Petits pas rapides et légers.'],
    errors: ['Marcher sur les objets (risque de glisser).', 'Aller trop vite et perdre la précision.'],
    vigilance: 'N’utilisez que des marquages plats et non glissants. ' + VIGILANCE_GENERALE,
    easier: 'Parcourir lentement en marchant.',
    harder: 'Motifs plus complexes (entrée-sortie de case), rythme plus vif.',
    alternatives: [],
    martialLink: 'Le travail d’appuis rapides et précis est un complément courant en préparation physique des sports de combat.',
    status: 'brouillon'
  },
  {
    id: 'deplacements-en-garde',
    name: 'Déplacements en garde',
    capacities: ['appuis', 'coordination', 'endurance'],
    equipment: [],
    mode: 'time',
    execution: [
      'En garde, pieds décalés, genoux légèrement fléchis.',
      'Avancez par petits pas glissés (pied avant puis pied arrière), reculez de même.',
      'Ajoutez des déplacements sur les côtés.',
      'Gardez toujours le même écart entre les pieds.'
    ],
    cues: ['Les pieds ne se croisent pas.', 'Restez à la même hauteur, sans sautiller fort.'],
    errors: ['Rapprocher ou croiser les pieds.', 'Se redresser en se déplaçant.'],
    vigilance: 'Espace dégagé. ' + VIGILANCE_GENERALE,
    easier: 'Seulement avant et arrière, lentement.',
    harder: 'Changer de direction au signal (partenaire ou application).',
    alternatives: [],
    martialLink: 'Le déplacement en garde est un exercice de base répandu dans de nombreuses disciplines de frappe.',
    status: 'brouillon'
  },

  // ───────────── Réaction ─────────────
  {
    id: 'reaction-signal',
    name: 'Réaction à un signal',
    capacities: ['reaction', 'appuis'],
    equipment: [],
    mode: 'time',
    execution: [
      'En garde, dans un espace dégagé.',
      'Un partenaire (ou l’application) donne un signal visuel ou sonore à intervalles irréguliers.',
      'À chaque signal, faites une action simple convenue : un pas en arrière, un pas de côté, ou lever la garde.',
      'Revenez en position et attendez le signal suivant.'
    ],
    cues: ['Restez détendu en attendant.', 'Action courte et nette.'],
    errors: ['Anticiper le signal.', 'Se crisper.'],
    vigilance: 'Actions simples et sans contact. ' + VIGILANCE_GENERALE,
    easier: 'Signal régulier et une seule action possible.',
    harder: 'Deux signaux différents, deux actions différentes (ou « aller / ne pas aller »).',
    alternatives: [],
    martialLink: 'Réagir à un signal est un exercice complémentaire courant ; le lien direct avec la réaction en combat reste limité.',
    status: 'brouillon'
  },
  {
    id: 'balle-contre-mur',
    name: 'Balle contre un mur',
    capacities: ['reaction', 'coordination'],
    equipment: ['mur'],
    mode: 'time',
    execution: [
      'Prenez une balle qui rebondit (balle de tennis par exemple), à un ou deux mètres d’un mur sans fenêtre.',
      'Lancez la balle contre le mur et rattrapez-la, d’une main puis de l’autre.',
      'Variez la hauteur et la force du lancer.'
    ],
    cues: ['Genoux souples, prêt à bouger.', 'Suivez la balle des yeux.'],
    errors: ['Lancer trop fort.', 'Rester raide.'],
    vigilance: 'Vérifiez qu’il n’y a rien de fragile autour. ' + VIGILANCE_GENERALE,
    easier: 'Lancer à deux mains, plus près du mur.',
    harder: 'Se rapprocher du mur, ou faire rebondir la balle au sol avant le mur.',
    alternatives: ['reaction-signal'],
    martialLink: 'Les jeux de balle sont couramment utilisés pour travailler la coordination œil-main, en complément de la pratique.',
    status: 'brouillon'
  },

  // ───────────── Retour au calme / récupération ─────────────
  {
    id: 'respiration-lente',
    name: 'Respiration lente',
    capacities: ['recuperation'],
    equipment: [],
    mode: 'time',
    execution: [
      'Assis ou allongé confortablement.',
      'Inspirez par le nez pendant environ 4 secondes en laissant le ventre se gonfler.',
      'Expirez lentement pendant environ 6 secondes.',
      'Continuez sur la durée prévue, sans forcer.'
    ],
    cues: ['Expiration plus longue que l’inspiration.', 'Épaules relâchées.'],
    errors: ['Forcer l’inspiration.', 'Retenir son souffle.'],
    vigilance: 'Reprenez une respiration normale si la tête tourne. ' + VIGILANCE_GENERALE,
    easier: 'Inspiration 3 secondes, expiration 4 secondes.',
    harder: 'Allonger doucement l’expiration.',
    alternatives: [],
    martialLink: 'Le travail de respiration est présent dans de nombreuses pratiques martiales et sert couramment au retour au calme.',
    status: 'brouillon'
  },
  {
    id: 'marche-retour-calme',
    name: 'Marche de retour au calme',
    capacities: ['recuperation'],
    equipment: [],
    mode: 'time',
    execution: [
      'Marchez lentement, sur place ou dans la pièce.',
      'Laissez la respiration et le cœur ralentir.',
      'Relâchez les épaules et secouez doucement les bras.'
    ],
    cues: ['Allure de plus en plus lente.'],
    errors: ['S’arrêter net après un effort soutenu.'],
    vigilance: VIGILANCE_GENERALE,
    easier: 'Marche très lente.',
    harder: 'Prolonger un peu la durée.',
    alternatives: [],
    martialLink: 'Revenir progressivement au calme après l’effort est une pratique courante en fin de séance.',
    status: 'brouillon'
  },
  {
    id: 'etirements-doux',
    name: 'Étirements doux de fin de séance',
    capacities: ['recuperation', 'souplesse'],
    equipment: [],
    mode: 'time',
    execution: [
      'Enchaînez quelques positions tenues 20 à 30 secondes chacune :',
      'mollets (mains au mur, une jambe tendue derrière), avant des cuisses (debout, talon vers la fesse, appui au mur), épaules (bras croisé devant la poitrine), dos (assis, buste penché en avant).',
      'Respirez lentement dans chaque position.'
    ],
    cues: ['Tension légère, jamais douloureuse.', 'Aucun rebond.'],
    errors: ['Chercher l’amplitude maximale après l’effort.', 'Faire des à-coups.'],
    vigilance: 'Étirements doux uniquement, sans rebond. ' + VIGILANCE_GENERALE,
    easier: 'Moins de positions, tenues plus courtes.',
    harder: 'Ajouter le papillon ou l’étirement de l’arrière des cuisses.',
    alternatives: [],
    martialLink: 'Des étirements doux en fin de séance sont une habitude courante dans de nombreuses salles d’arts martiaux.',
    status: 'brouillon'
  }
];
