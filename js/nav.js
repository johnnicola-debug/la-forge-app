// Navigation : trois espaces principaux, tout le reste rangé dans « Plus ».
// Module sans dépendance, lu par app.js (menu, barre du bas, espace mis en évidence), par l'accueil et par les tests.
export const SPACES = [
  {id: 'visualiser', icon: '◉', label: 'Visualiser', hint: 'Observer un mouvement en 3D'},
  {id: 'analyser', icon: '▣', label: 'Analyser', hint: 'Décomposer un combat filmé', soon: true},
  {id: 'creer', icon: '✦', label: 'Créer', hint: 'Inventer, poser, assembler'}
];
// Rubriques rattachées à un espace (mis en évidence dans le menu) ; toutes les autres relèvent de « Plus ».
export const SPACE_OF = {visualiser: 'visualiser', bibliotheque: 'visualiser', analyser: 'analyser', creer: 'creer', inventer: 'creer', atelier: 'creer', forge: 'creer'};
export const spaceOf = route => route === 'accueil' ? '' : Object.hasOwn(SPACE_OF, route) ? SPACE_OF[route] : 'plus';
// Page « Plus » : [rubrique, pictogramme, nom, précision]. « sound » : le groupe qui porte les réglages de son.
export const PLUS = [
  {title: 'S’entraîner', items: [['entrainement', '⟡', 'Entraînement', 'Programmes, séances, mode mains libres'], ['reaction', '↯', 'Test de réaction', 'Réflexes et prise de décision'],
    ['arbre', '⋔', 'Arbre de compétences', 'Ce qui est travaillé, évalué, constaté']]},
  {title: 'Comprendre et composer', items: [['bibliotheque', '▤', 'Bibliothèque', 'Fiches des gestes et des principes'], ['forge', '⚒', 'Forge de style', 'Comparer deux disciplines'],
    ['atelier', '✎', 'Atelier de création', 'Méthodes, enchaînements, essais']]},
  {title: 'Mon profil', items: [['avatar', '◐', 'Mon reflet', 'Mesures, corps, progression'], ['orientation', '✦', 'Orientation', 'Questionnaire de départ'], ['voies', '◎', 'Les trois voies', 'Couleur et emblème']]},
  {title: 'Univers', items: [['carte', '⌖', 'Carte du monde', 'Les lieux de la forge'], ['guildes', '⛩', 'Guildes', 'Communauté']]},
  {title: 'Réglages et données', sound: true, items: [['donnees', '⇅', 'Données', 'Exporter, importer, sauvegarder']]}
];
