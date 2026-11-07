// Tables de normes publiées, utilisées pour les rangs F à S (engine/grades.js).
// Règle : chaque valeur vient d'une source citée et consultée (recherche du 07/11/2026) ; aucune table n'est reconstruite de mémoire.
// Une norme n'est retenue que si son protocole correspond à celui de LA FORGE. Écartées pour cette raison :
//  - détente verticale (normes canadiennes mesurées sur plateforme de force, LA FORGE mesure au mur) ;
//  - souplesse (le test de LA FORGE est un choix, pas une mesure en cm) ;
//  - temps de réaction (aucune table de centiles publiée trouvée ; résultats d'écran non comparables entre appareils) ;
//  - pompes chez les femmes (la norme CSEP porte sur des pompes sur les genoux).
// Valeurs relevées par lecture des sources ; celles de Dodds et de Topend Sports ont été extraites du texte de la page :
// à recouper avec les tableaux originaux lors d'une relecture.

// Préhension : centiles par âge exact ; chaque âge couvre ± 2 ans.
const GRIP = {
  h: {20: [30, 35, 40, 46, 52], 25: [36, 41, 48, 55, 61], 30: [38, 44, 51, 58, 64], 35: [39, 45, 51, 58, 64], 40: [38, 44, 50, 57, 63],
    45: [36, 42, 49, 56, 61], 50: [35, 41, 48, 54, 60], 55: [34, 40, 47, 53, 59], 60: [33, 39, 45, 51, 56]},
  f: {20: [21, 24, 28, 32, 36], 25: [23, 26, 30, 35, 38], 30: [24, 27, 31, 35, 39], 35: [23, 27, 31, 35, 39], 40: [23, 27, 31, 35, 39],
    45: [22, 26, 30, 34, 38], 50: [21, 25, 29, 33, 37], 55: [19, 23, 28, 32, 35], 60: [18, 22, 27, 31, 34]}
};
const gripBands = Object.entries(GRIP).flatMap(([sex, byAge]) => Object.entries(byAge).map(([age, v]) => ({
  sex, ageMin: Number(age) - 2, ageMax: Number(age) + 2, points: [10, 25, 50, 75, 90].map((c, i) => [c, v[i]])})));

export const norms = [
  {test: 'grip', name: 'Force de préhension', kind: 'centiles', higherIsBetter: true,
    population: 'Population générale britannique, 49 964 personnes (12 études, 1990–2012) ; meilleur essai, une main ou l’autre ; 18 à 62 ans',
    source: {label: 'Dodds et al. (2014), « Grip strength across the life course: normative data from twelve British studies », PLoS One 9(12), tableau 2',
      url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4256164/', reliability: 'etabli'},
    bands: gripBands},
  {test: 'perf:pushup', name: 'Pompes (répétitions jusqu’à l’épuisement, sans limite de temps)', kind: 'categories', higherIsBetter: true,
    population: 'Hommes de 15 à 69 ans, pompes classiques (poitrine jusqu’au poing) ; catégories « à améliorer » à « excellent »',
    source: {label: 'CSEP (2019), CSEP-PATH Resource Manual, 2e éd., reproduit par l’American Council on Exercise (Push-up Assessment Protocol)',
      url: 'https://contentcdn.eacefitness.com/assets/certification/ace-answers/forms/pt/36_Push-up_Assessment_Protocol.pdf', reliability: 'etabli'},
    bands: [[15, 19, [18, 23, 29, 39]], [20, 29, [17, 22, 29, 36]], [30, 39, [12, 17, 22, 30]], [40, 49, [10, 13, 17, 25]], [50, 59, [7, 10, 13, 21]], [60, 69, [5, 8, 11, 18]]]
      .map(([ageMin, ageMax, cuts]) => ({sex: 'h', ageMin, ageMax, cuts}))},
  {test: 'cooper', name: 'Test de Cooper (distance en 12 minutes)', kind: 'categories', higherIsBetter: true,
    population: 'Adultes de 20 ans et plus, catégories « faible » à « excellent » ; tranche hommes 30–39 ans écartée (catégories qui se chevauchent sur la page source)',
    source: {label: 'Topend Sports, Cooper 12-minute run norms (citant Cooper, JAMA 1968 ; source primaire non consultée)',
      url: 'https://www.topendsports.com/testing/norms/cooper-12minute.htm', reliability: 'plausible'},
    bands: [['h', 20, 29, [1600, 2200, 2400, 2801]], ['h', 40, 49, [1400, 1700, 2100, 2501]], ['h', 50, 99, [1300, 1600, 2000, 2401]],
      ['f', 20, 29, [1500, 1800, 2200, 2701]], ['f', 30, 39, [1400, 1700, 2000, 2501]], ['f', 40, 49, [1200, 1500, 1900, 2301]], ['f', 50, 99, [1100, 1400, 1700, 2201]]]
      .map(([sex, ageMin, ageMax, cuts]) => ({sex, ageMin, ageMax, cuts}))},
  {test: 'broadjump', name: 'Saut en longueur sans élan', kind: 'categories', higherIsBetter: true,
    population: 'Adultes japonais de 20 à 64 ans, barème en 10 points par sexe (sans distinction d’âge) ; meilleur de 2 sauts',
    source: {label: 'Ministère japonais de l’Éducation (MEXT), 新体力テスト実施要項 (20–64 ans), barème par épreuve p. 10',
      url: 'https://www.mext.go.jp/a_menu/sports/stamina/05030101/003.pdf', reliability: 'etabli'},
    bands: [{sex: 'h', ageMin: 20, ageMax: 64, cuts: [143, 162, 180, 195, 210, 223, 236, 248, 260]},
      {sex: 'f', ageMin: 20, ageMax: 64, cuts: [98, 113, 128, 143, 158, 170, 180, 191, 202]}]}
];
