// Repères non chiffrés en score : chaque protocole donne une donnée brute, comparable seulement à soi-même.
// Protocoles d'observation proposés par LA FORGE (brouillon), non étalonnés et non validés.

export const capacities = {
  force: 'Force', 'endurance-musculaire': 'Endurance musculaire', endurance: 'Endurance générale', mobilite: 'Mobilité',
  souplesse: 'Souplesse', morphologie: 'Morphologie', puissance: 'Explosivité', reaction: 'Réaction', coordination: 'Coordination', equilibre: 'Équilibre', appuis: 'Appuis', recuperation: 'Récupération'
};

export const assessments = [
  {id: 'equilibre-unipodal', capacity: 'equilibre', name: 'Équilibre sur un pied', unit: 's', input: 'number', max: 600,
    protocol: 'Près d’un appui stable, pieds nus, yeux ouverts. Lever un pied et tenir sans toucher l’appui. Arrêter à 60 s. Noter le côté.',
    safety: 'Toujours à portée d’un mur ou d’une chaise.'},
  {id: 'marche-continue', capacity: 'endurance', name: 'Marche ou course continue confortable', unit: 'min', input: 'number', max: 600,
    protocol: 'Durée que vous pouvez tenir à allure confortable, en pouvant encore parler. Une donnée connue suffit : inutile de la tester exprès.',
    safety: 'Ne pas chercher l’épuisement.'},
  {id: 'squat-profond', capacity: 'mobilite', name: 'Squat profond talons au sol', unit: '', input: 'choice', choices: ['Oui, confortable', 'Partiellement', 'Pas encore', 'Je ne sais pas'],
    protocol: 'Descendre lentement, pieds à largeur confortable, en se tenant si besoin. Noter seulement ce qui est confortable.',
    safety: 'Ne pas forcer en cas de gêne aux genoux ou aux hanches.'},
  {id: 'flexion-avant', capacity: 'souplesse', name: 'Flexion avant debout', unit: '', input: 'choice', choices: ['Paumes au sol', 'Doigts au sol', 'Chevilles', 'Tibias', 'Genoux', 'Je ne sais pas'],
    protocol: 'Genoux tendus sans les verrouiller, descendre lentement sans rebond. Noter le point atteint confortablement.',
    safety: 'Sans élan ni rebond.'},
  {id: 'pas-croises', capacity: 'coordination', name: 'Pas croisés sur une ligne (10 passages)', unit: 'erreurs', input: 'number', max: 100,
    protocol: 'Tracer une ligne au sol. Faire 10 pas croisés lents en restant sur la ligne. Compter les sorties de ligne.',
    safety: 'Espace dégagé, sans vitesse.'},
  {id: 'taille', capacity: 'morphologie', name: 'Taille', unit: 'cm', input: 'number', max: 250,
    protocol: 'Debout pieds nus, dos et talons contre un mur, regard horizontal ; marque au sommet du crâne avec une équerre, mesure au mètre ruban.'},
  {id: 'envergure', capacity: 'morphologie', name: 'Envergure (bras écartés)', unit: 'cm', input: 'number', max: 260,
    protocol: 'Dos au mur, bras écartés à l’horizontale, paumes vers l’avant : distance entre le bout des deux majeurs. Une deuxième personne aide à mesurer.'},
  {id: 'masse', capacity: 'morphologie', name: 'Masse corporelle', unit: 'kg', input: 'number', max: 300,
    protocol: 'Le matin, à jeun, après être passé aux toilettes, sur la même balance.'},
  {id: 'grip', capacity: 'force', name: 'Force de préhension (dynamomètre)', unit: 'kg', input: 'number', max: 150,
    protocol: 'Avec un dynamomètre à main, debout, bras le long du corps. Meilleur de 2 essais par main, en notant la main.',
    safety: 'Sans à-coup. Ne pas tester avec une douleur au poignet ou à la main.'},
  {id: 'cmj', capacity: 'puissance', name: 'Détente verticale', unit: 'cm', input: 'number', max: 120,
    protocol: 'Saut vertical avec élan des bras, mesuré au mur (différence entre la marque bras tendu et la marque au sommet du saut) ou avec une application validée. Meilleur de 3 essais.',
    safety: 'Après un échauffement, sur sol non glissant ; réception souple.'},
  {id: 'broadjump', capacity: 'puissance', name: 'Saut en longueur sans élan', unit: 'cm', input: 'number', max: 400,
    protocol: 'Pieds joints derrière une ligne, sauter le plus loin possible, mesurer au talon le plus proche. Meilleur de 3 essais.',
    safety: 'Échauffement préalable, réception stable ; à éviter en cas de douleur aux genoux.'},
  {id: 'sprint20', capacity: 'puissance', name: 'Sprint 20 m', unit: 's', input: 'number', max: 30,
    protocol: 'Départ arrêté, chronométré par une autre personne ou des cellules. Meilleur de 2 essais, récupération complète.',
    safety: 'Échauffement progressif obligatoire ; risque de blessure musculaire si l’on sprinte à froid.'},
  {id: 'run5k', capacity: 'endurance', name: 'Course de 5 km', unit: 'min', input: 'number', max: 120,
    protocol: 'Temps sur 5 km (course, application GPS ou piste). Un résultat récent déjà connu suffit.',
    safety: 'À allure maîtrisée si vous n’êtes pas entraîné à la course.'},
  {id: 'cooper', capacity: 'endurance', name: 'Test de Cooper (12 min)', unit: 'm', input: 'number', max: 6000,
    protocol: 'Distance maximale parcourue en 12 minutes sur une piste. Test exigeant : seulement si la course vous est familière.',
    safety: 'Déconseillé sans pratique régulière de la course ou en cas de doute sur sa santé.'},
  {id: 'rythme-calme', capacity: 'recuperation', name: 'Ressenti de récupération le matin', unit: '/5', input: 'choice', choices: ['1 — très fatigué', '2', '3', '4', '5 — très reposé'],
    protocol: 'Un ressenti, noté à la même heure. Ce n’est pas une mesure physiologique.', safety: ''}
];
