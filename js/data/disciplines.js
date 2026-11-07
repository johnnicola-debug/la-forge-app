// Disciplines de LA FORGE et leurs facettes (version 0.3).
// Schéma : docs/PLAN_NUIT_2026-10-31.md, section « Disciplines et transfert ».
//
// Ce qui est sourcé : les règles (rubrique `rules`), vérifiées dans les règlements officiels cités.
// Ce qui est estimé : les notes 0–3 (`distances`, `movement`, `guard.handsHigh`, `skills`) sont une
// estimation rédigée par une IA (Claude Code, 31/10/2026) à partir de ces règles et de manuels
// d’entraînement. Elles servent au calcul du transfert, pas à juger une discipline. Fiabilité : expérimentale
// tant qu’un enseignant de chaque discipline ne les a pas relues (champ `ratingsReliability`).

// ——— Sources réelles, vérifiées en ligne le 31/10/2026 (réutilisées par transfers.js) ———
export const sourceRefs = {
  fie: {
    label: 'FIE — Règlement technique (édition d’août 2026) : piste t.18, corps à corps t.25, esquive t.27, main non armée t.29, cibles t.77 (fleuret), t.91 (épée), t.97 (sabre), marche croisée au sabre t.101',
    url: 'https://static.fie.org/uploads/40/204126-Technical%20rules%20August%202026%20ang.pdf',
    type: 'federation', reliability: 'etabli'
  },
  ofspoEscrime: {
    label: 'mobilesport.ch (Office fédéral du sport, Suisse) — « Escrime : travail des jambes », d’après da Silva Souza et Wyrsch, Escrime : comprendre et enseigner (2016)',
    url: 'https://assets01.sdd1.ch/assets/lbwp-cdn/mobilesport/files/1677772854/mobilesport-escrime-travail-des-jambes.pdf',
    type: 'pedagogique', reliability: 'etabli'
  },
  chen2017: {
    label: 'Chen et al. (2017), « Biomechanics of fencing sport: A scoping review », PLoS One 12(2) — 37 études, qualité jugée « moyenne » par les auteurs',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5302478/',
    type: 'academique', reliability: 'plausible'
  },
  borysiuk2010: {
    label: 'Borysiuk et Cynarski (2010), « Psychomotor aspects of talent identification: a new approach in the case of fencing », Archives of Budo 6(2)',
    url: 'https://archbudo.com/view/abstract/id/10641',
    type: 'academique', reliability: 'plausible'
  },
  ebRules: {
    label: 'England Boxing — Technical & Competition Rules 2026 (fautes 12.1, casque et durée des rounds : tableau des catégories)',
    url: 'https://www.englandboxing.org/wp-content/uploads/2026/01/EB-RB-26.2.pdf',
    type: 'federation', reliability: 'etabli'
  },
  ebHandbook: {
    label: 'England Boxing — Coaching Handbook Level 2 (garde, appuis, principes de défense)',
    url: 'https://www.englandboxing.org/wp-content/uploads/2022/03/Level-2-Coaching-Handbook-compressed.pdf',
    type: 'pedagogique', reliability: 'etabli'
  },
  bsFootwork: {
    label: 'Boxing Scotland — Footwork (boîte à outils des entraîneurs)',
    url: 'https://www.boxingscotlandtoolkit.org/session-delivery/footwork/',
    type: 'pedagogique', reliability: 'etabli'
  },
  bbbofc: {
    label: 'British Boxing Board of Control — How to score (règle 3.31 : coup valable, zone de frappe, ceinture ; boxe professionnelle)',
    url: 'https://bbbofc.com/how-to-score',
    type: 'federation', reliability: 'etabli'
  },
  liu2022: {
    label: 'Liu et al. (2022), « Biomechanics of the lead straight punch of different level boxers », Frontiers in Physiology 13 — 16 boxeurs',
    url: 'https://www.frontiersin.org/articles/10.3389/fphys.2022.1015154/full',
    type: 'academique', reliability: 'plausible'
  },
  uww: {
    label: 'United World Wrestling — International Wrestling Rules (version publiée en janvier 2026)',
    url: 'https://cdn.uww.org/2026-01/wrestling_rules.pdf',
    type: 'federation', reliability: 'etabli'
  },
  ijf: {
    label: 'IJF — Detailed Explanation of the IJF Judo Refereeing Rules, section « Leg grabbing » (mise à jour du 25/03/2023 ; cycle 2025-2028 à revérifier)',
    url: 'https://rules.ijf.org/page-19',
    type: 'federation', reliability: 'etabli'
  },
  wkf: {
    label: 'WKF — Kumite Competition Rules 2024 (articles 1, 5, 8, 10 ; copie hébergée par la fédération finlandaise de karaté)',
    url: 'https://karateliitto.fi/app/uploads/2024/02/WKF_Kumite_Competition_Rules_2024.pdf',
    type: 'federation', reliability: 'etabli'
  },
  ifma: {
    label: 'IFMA — Rules and Regulations v3.057 (mai 2026) : équipement 15.3, attribution des points 29.1',
    url: 'https://muaythai.sport/wp-content/uploads/2026/05/IFMA-Rules-and-Regulations-v3.057_110526.pdf',
    type: 'federation', reliability: 'etabli'
  },
  ibjjf: {
    label: 'IBJJF — Rule Book v6.0 (juin 2024), page officielle de téléchargement (points : article 4)',
    url: 'https://ibjjf.com/books-videos',
    type: 'federation', reliability: 'etabli'
  },
  quel2019: {
    label: 'Martínez de Quel et Bennett (2019), « Perceptual-cognitive expertise in combat sports: a narrative review and a model of perception-action », RICYDE 15(58)',
    url: 'https://www.redalyc.org/journal/710/71065391002/71065391002.pdf',
    type: 'academique', reliability: 'plausible'
  },
  mann2007: {
    label: 'Mann, Williams, Ward et Janelle (2007), « Perceptual-cognitive expertise in sport: a meta-analysis », Journal of Sport & Exercise Psychology',
    url: 'https://pubmed.ncbi.nlm.nih.gov/17968048/',
    type: 'academique', reliability: 'etabli'
  },
  issurin2013: {
    label: 'Issurin (2013), « Training transfer: scientific background and insights for practical application », Sports Medicine 43(8)',
    url: 'https://pubmed.ncbi.nlm.nih.gov/23633165/',
    type: 'academique', reliability: 'etabli'
  },
  rosalie2012: {
    label: 'Rosalie et Müller (2012), « A model for the transfer of perceptual-motor skill learning in human behaviors », Research Quarterly for Exercise and Sport 83(3) — modèle théorique',
    url: 'https://pubmed.ncbi.nlm.nih.gov/22978191/',
    type: 'academique', reliability: 'plausible'
  },
  rosalie2014: {
    label: 'Rosalie et Müller (2014), « Expertise facilitates the transfer of anticipation skill across domains », Quarterly Journal of Experimental Psychology 67(2)',
    url: 'https://pubmed.ncbi.nlm.nih.gov/24456409/',
    type: 'academique', reliability: 'plausible'
  },
  abernethy2005: {
    label: 'Abernethy, Baker et Côté (2005), « Transfer of pattern recall skills may contribute to the development of sport expertise », Applied Cognitive Psychology 19(6)',
    url: 'https://qspace.library.queensu.ca/items/7b6f34e4-421d-444c-9d8e-89ae53de873f',
    type: 'academique', reliability: 'plausible'
  },
  guo2025: {
    label: 'Guo et al. (2025), revue systématique et méta-analyse sur l’entraînement visuel numérique (33 essais), Frontiers in Physiology',
    url: 'https://www.frontiersin.org/articles/10.3389/fphys.2025.1664572/full',
    type: 'academique', reliability: 'plausible'
  },
  ia: {
    label: 'Raisonnement LA FORGE (IA) à partir des règlements, sans étude dédiée — à relire par un enseignant',
    url: null,
    type: 'ia', reliability: 'experimental'
  }
};

const S = sourceRefs;

// ——— Définitions lisibles des facettes ———
export const facets = {
  weapon: {
    name: 'Arme', type: 'enum',
    values: ['aucune', 'epee'],
    labels: { aucune: 'Aucune (mains nues)', epee: 'Arme blanche sportive (fleuret, épée ou sabre)' }
  },
  contact: {
    name: 'Nature du contact', type: 'enum',
    values: ['percussion', 'saisie', 'mixte', 'touche-arme'],
    labels: {
      percussion: 'Frappes (poings, pieds…)',
      saisie: 'Saisies, projections, contrôles',
      mixte: 'Frappes et saisies',
      'touche-arme': 'Touche avec une arme'
    }
  },
  distances: {
    name: 'Distances de combat utilisées', type: 'scale', min: 0, max: 3,
    keys: ['longue', 'moyenne', 'courte', 'corps'],
    labels: {
      longue: 'Longue (il faut un déplacement pour toucher)',
      moyenne: 'Moyenne (on touche en s’engageant d’un pas)',
      courte: 'Courte (on touche sans se déplacer)',
      corps: 'Corps à corps (contact, saisie, clinch)'
    },
    scaleLabels: ['absente ou interdite', 'secondaire', 'importante', 'centrale']
  },
  'guard.orientation': {
    name: 'Orientation de la garde', type: 'enum',
    values: ['profil', 'trois-quarts', 'face'],
    labels: { profil: 'De profil (épaules dans l’axe)', 'trois-quarts': 'De trois-quarts', face: 'De face' }
  },
  'guard.width': {
    name: 'Largeur latérale de la base d’appui', type: 'enum',
    values: ['etroite', 'moyenne', 'large'],
    labels: { etroite: 'Étroite (pieds presque sur une même ligne)', moyenne: 'Moyenne', large: 'Large' }
  },
  'guard.weight': {
    name: 'Répartition habituelle du poids', type: 'enum',
    values: ['avant', 'centre', 'arriere', 'variable'],
    labels: { avant: 'Vers l’avant', centre: 'Au centre', arriere: 'Sur la jambe arrière', variable: 'Variable selon la situation' }
  },
  'guard.handsHigh': {
    name: 'Hauteur des mains en garde', type: 'scale', min: 0, max: 3,
    scaleLabels: ['basses', 'mi-hauteur', 'hautes', 'au visage en permanence']
  },
  movement: {
    name: 'Types de déplacement', type: 'scale', min: 0, max: 3,
    keys: ['lineaire', 'lateral', 'circulaire', 'niveau'],
    labels: {
      lineaire: 'Avant-arrière',
      lateral: 'Latéral (sortir de l’axe)',
      circulaire: 'Tourner autour de l’adversaire',
      niveau: 'Changer de niveau (se baisser, se relever)'
    },
    scaleLabels: ['absent ou impossible', 'rare', 'fréquent', 'essentiel']
  },
  tools: {
    name: 'Outils de touche ou de contrôle', type: 'enum', multiple: true,
    values: ['poings', 'pieds', 'genoux', 'coudes', 'saisies', 'lame'],
    labels: { poings: 'Poings', pieds: 'Pieds et tibias', genoux: 'Genoux', coudes: 'Coudes', saisies: 'Saisies', lame: 'Lame' }
  },
  targets: {
    name: 'Zones visées (frappe, touche ou saisie)', type: 'enum', multiple: true,
    values: ['tete', 'tronc', 'bras', 'jambes'],
    labels: { tete: 'Tête et cou', tronc: 'Tronc', bras: 'Bras et mains', jambes: 'Jambes' }
  },
  skills: {
    name: 'Compétences de l’arbre sollicitées', type: 'scale', min: 0, max: 3,
    scaleLabels: ['non sollicitée', 'secondaire', 'importante', 'centrale']
  }
};

// ——— Disciplines ———
export const disciplines = [
  {
    id: 'boxe',
    name: 'Boxe anglaise',
    summary: 'Sport de percussion aux poings seulement, sur ring, en rounds courts. Tout repose sur la distance, la garde haute, les déplacements dans toutes les directions et l’enchaînement des coups avec les deux mains.',
    weapon: 'aucune',
    contact: 'percussion',
    distances: { longue: 2, moyenne: 3, courte: 3, corps: 1 },
    guard: { orientation: 'trois-quarts', width: 'moyenne', weight: 'centre', handsHigh: 3 },
    movement: { lineaire: 3, lateral: 3, circulaire: 3, niveau: 2 },
    tools: ['poings'],
    targets: ['tete', 'tronc'],
    rhythm: 'Effort continu sur des rounds de 2 à 3 minutes (3 × 3 minutes en élite chez England Boxing), alternant échanges brefs et très intenses et phases de déplacement.',
    rules: 'Seuls les coups portés avec la partie « jointures » du gant sur l’avant ou les côtés de la tête et du tronc, au-dessus de la ceinture, sont valables. Sont des fautes : frapper sous la ceinture, tenir, tenir et frapper, lutter ou projeter dans le corps à corps, utiliser la tête, l’épaule, l’avant-bras ou le coude, se baisser sous la ceinture adverse, se défendre de façon entièrement passive. En amateur (England Boxing 2026), le casque est obligatoire dans toutes les catégories sauf les seniors hommes. Conséquence pour la pratique : garde haute, menton baissé, défense par les mains, le buste et les pieds, et pas de travail au sol ni de saisie.',
    skills: {
      'corps-force': 2, 'corps-endurance-musculaire': 2, 'corps-endurance': 3, 'corps-puissance': 3, 'corps-mobilite': 2, 'corps-souplesse': 1,
      'corps-gainage': 3, 'corps-equilibre': 2, 'corps-coordination': 3, 'corps-reaction': 2, 'corps-recuperation': 2,
      'appuis-posture': 3, 'appuis-poids': 3, 'appuis-pas': 3, 'appuis-pivot': 3, 'appuis-lateral': 3, 'appuis-distance': 3, 'appuis-niveau': 2,
      'action-direct': 3, 'action-circulaire': 3, 'action-pied': 0, 'action-enchainement': 3, 'action-entree': 3, 'action-saisie': 0, 'action-projection': 0,
      'defense-garde': 3, 'defense-esquive': 3, 'defense-parade': 3, 'defense-retrait': 3, 'defense-chute': 0, 'defense-sortie-ligne': 3, 'defense-saisie': 0,
      'lecture-indices': 3, 'lecture-timing': 3, 'lecture-rythme': 3, 'lecture-anticipation': 3, 'lecture-decision': 3, 'lecture-adaptation': 3,
      'spe-boxe': 3, 'spe-escrime': 0, 'spe-lutte': 0, 'spe-judo': 0, 'spe-karate': 0, 'spe-muay-thai': 0, 'spe-jjb': 0,
      'trans-transfert': 0
    },
    ratingsReliability: 'experimental',
    sources: [S.ebRules, S.bbbofc, S.ebHandbook, S.bsFootwork]
  },
  {
    id: 'escrime',
    name: 'Escrime (fleuret, épée, sabre)',
    summary: 'Sport de touche avec une arme sur une piste longue et étroite. Le combat se joue presque entièrement en avant-arrière : prise de distance, préparation, attaque en fente ou en flèche, parade et riposte.',
    weapon: 'epee',
    contact: 'touche-arme',
    distances: { longue: 3, moyenne: 3, courte: 1, corps: 0 },
    guard: { orientation: 'profil', width: 'etroite', weight: 'centre', handsHigh: 1 },
    movement: { lineaire: 3, lateral: 0, circulaire: 0, niveau: 1 },
    tools: ['lame'],
    targets: ['tete', 'tronc', 'bras', 'jambes'],
    rhythm: 'Effort intermittent : actions explosives de quelques secondes, arrêt de l’assaut après chaque touche, puis remise en garde au centre de la piste.',
    rules: 'La piste mesure 14 m de long et 1,50 m de large ; sortir latéralement fait perdre un mètre, sortir par l’arrière avec les deux pieds donne la touche à l’adversaire. Au fleuret et à l’épée on ne touche qu’avec la pointe ; au sabre, la pointe et le tranchant comptent. Cible : le tronc au fleuret (ni tête ni membres), tout le corps à l’épée, tout le corps au-dessus d’une ligne horizontale passant par le haut des os du bassin au sabre (tête et bras compris). Le corps à corps volontaire est interdit dans les trois armes ; au sabre, la flèche et la marche avant en croisant les jambes sont interdites. Au fleuret et au sabre, une règle de priorité (convention) décide quelle touche compte quand les deux tireurs touchent. Conséquence pour la pratique : déplacements surtout linéaires, garde de profil, distance longue, aucune frappe à mains nues.',
    skills: {
      'corps-force': 1, 'corps-endurance-musculaire': 2, 'corps-endurance': 2, 'corps-puissance': 3, 'corps-mobilite': 2, 'corps-souplesse': 2,
      'corps-gainage': 2, 'corps-equilibre': 3, 'corps-coordination': 3, 'corps-reaction': 3, 'corps-recuperation': 2,
      'appuis-posture': 3, 'appuis-poids': 2, 'appuis-pas': 3, 'appuis-pivot': 0, 'appuis-lateral': 0, 'appuis-distance': 3, 'appuis-niveau': 1,
      'action-direct': 3, 'action-circulaire': 1, 'action-pied': 0, 'action-enchainement': 2, 'action-entree': 3, 'action-saisie': 0, 'action-projection': 0,
      'defense-garde': 2, 'defense-esquive': 1, 'defense-parade': 3, 'defense-retrait': 3, 'defense-chute': 0, 'defense-sortie-ligne': 0, 'defense-saisie': 0,
      'lecture-indices': 3, 'lecture-timing': 3, 'lecture-rythme': 3, 'lecture-anticipation': 3, 'lecture-decision': 3, 'lecture-adaptation': 3,
      'spe-boxe': 0, 'spe-escrime': 3, 'spe-lutte': 0, 'spe-judo': 0, 'spe-karate': 0, 'spe-muay-thai': 0, 'spe-jjb': 0,
      'trans-transfert': 0
    },
    ratingsReliability: 'experimental',
    sources: [S.fie, S.ofspoEscrime, S.chen2017]
  },
  {
    id: 'lutte',
    name: 'Lutte olympique (libre et gréco-romaine)',
    summary: 'Sport de saisie debout et au sol, sans frappe ni kimono. On cherche à amener l’adversaire au sol, à le contrôler et à l’exposer dos au tapis ; en gréco-romaine, seulement par le haut du corps.',
    weapon: 'aucune',
    contact: 'saisie',
    distances: { longue: 1, moyenne: 2, courte: 3, corps: 3 },
    guard: { orientation: 'face', width: 'large', weight: 'avant', handsHigh: 1 },
    movement: { lineaire: 2, lateral: 2, circulaire: 3, niveau: 3 },
    tools: ['saisies'],
    targets: ['tete', 'tronc', 'bras', 'jambes'],
    rhythm: 'Deux périodes de 3 minutes chez les seniors (UWW), avec des efforts de force et de vitesse presque continus ; la passivité est sanctionnée.',
    rules: 'Tapis circulaire de 9 m de diamètre avec une zone de passivité. En lutte libre, les attaques aux jambes sont autorisées ; en gréco-romaine, il est strictement interdit de saisir l’adversaire sous la ceinture ou de faire un croche-pied. La passivité est pénalisée. Conséquence pour la pratique : posture basse de face, changements de niveau fréquents en libre, travail du haut du corps et des projections par les bras en gréco-romaine.',
    skills: {
      'corps-force': 3, 'corps-endurance-musculaire': 3, 'corps-endurance': 3, 'corps-puissance': 3, 'corps-mobilite': 2, 'corps-souplesse': 2,
      'corps-gainage': 3, 'corps-equilibre': 3, 'corps-coordination': 2, 'corps-reaction': 2, 'corps-recuperation': 2,
      'appuis-posture': 3, 'appuis-poids': 3, 'appuis-pas': 2, 'appuis-pivot': 2, 'appuis-lateral': 2, 'appuis-distance': 2, 'appuis-niveau': 3,
      'action-direct': 0, 'action-circulaire': 0, 'action-pied': 0, 'action-enchainement': 2, 'action-entree': 3, 'action-saisie': 3, 'action-projection': 3,
      'defense-garde': 2, 'defense-esquive': 1, 'defense-parade': 1, 'defense-retrait': 1, 'defense-chute': 2, 'defense-sortie-ligne': 2, 'defense-saisie': 3,
      'lecture-indices': 2, 'lecture-timing': 3, 'lecture-rythme': 2, 'lecture-anticipation': 2, 'lecture-decision': 3, 'lecture-adaptation': 3,
      'spe-boxe': 0, 'spe-escrime': 0, 'spe-lutte': 3, 'spe-judo': 0, 'spe-karate': 0, 'spe-muay-thai': 0, 'spe-jjb': 0,
      'trans-transfert': 0
    },
    ratingsReliability: 'experimental',
    sources: [S.uww]
  },
  {
    id: 'judo',
    name: 'Judo',
    summary: 'Sport de saisie en kimono : on se dispute les saisies sur la veste, on déséquilibre et on projette, puis on peut contrôler, étrangler ou faire une clé au sol.',
    weapon: 'aucune',
    contact: 'saisie',
    distances: { longue: 0, moyenne: 1, courte: 3, corps: 3 },
    guard: { orientation: 'trois-quarts', width: 'moyenne', weight: 'centre', handsHigh: 1 },
    movement: { lineaire: 2, lateral: 2, circulaire: 3, niveau: 2 },
    tools: ['saisies'],
    targets: ['tronc', 'bras', 'jambes'],
    rhythm: 'Combat court et intense, découpé par les interventions de l’arbitre ; alternance de lutte pour la saisie, d’attaques explosives et de phases au sol.',
    rules: 'Saisir les jambes ou le pantalon avec les mains est sanctionné d’un shido à chaque fois ; trois shido entraînent le hansoku-make (disqualification). Les jambes ne sont donc atteintes qu’avec les pieds (balayages, fauchages). Le combat se décide par waza-ari ou ippon (projection maîtrisée, immobilisation, étranglement ou clé de bras). Conséquence pour la pratique : garde par les saisies sur la veste, projections par le haut du corps et les hanches, chutes (ukemi) indispensables. Ces règles datent de la mise à jour IJF du 25/03/2023 ; le cycle 2025-2028 est à revérifier.',
    skills: {
      'corps-force': 3, 'corps-endurance-musculaire': 3, 'corps-endurance': 2, 'corps-puissance': 3, 'corps-mobilite': 2, 'corps-souplesse': 2,
      'corps-gainage': 3, 'corps-equilibre': 3, 'corps-coordination': 3, 'corps-reaction': 2, 'corps-recuperation': 2,
      'appuis-posture': 3, 'appuis-poids': 3, 'appuis-pas': 2, 'appuis-pivot': 3, 'appuis-lateral': 2, 'appuis-distance': 1, 'appuis-niveau': 2,
      'action-direct': 0, 'action-circulaire': 0, 'action-pied': 1, 'action-enchainement': 2, 'action-entree': 3, 'action-saisie': 3, 'action-projection': 3,
      'defense-garde': 2, 'defense-esquive': 2, 'defense-parade': 1, 'defense-retrait': 1, 'defense-chute': 3, 'defense-sortie-ligne': 2, 'defense-saisie': 3,
      'lecture-indices': 2, 'lecture-timing': 3, 'lecture-rythme': 2, 'lecture-anticipation': 2, 'lecture-decision': 3, 'lecture-adaptation': 3,
      'spe-boxe': 0, 'spe-escrime': 0, 'spe-lutte': 0, 'spe-judo': 3, 'spe-karate': 0, 'spe-muay-thai': 0, 'spe-jjb': 0,
      'trans-transfert': 0
    },
    ratingsReliability: 'experimental',
    sources: [S.ijf]
  },
  {
    id: 'karate',
    name: 'Karaté (combat sportif, kumite WKF)',
    summary: 'Combat de percussion aux poings et aux pieds, avec contrôle des coups au visage. On marque par une technique nette, au bon moment et à la bonne distance, souvent depuis une distance longue.',
    weapon: 'aucune',
    contact: 'percussion',
    distances: { longue: 3, moyenne: 3, courte: 1, corps: 1 },
    guard: { orientation: 'trois-quarts', width: 'moyenne', weight: 'variable', handsHigh: 2 },
    movement: { lineaire: 3, lateral: 2, circulaire: 2, niveau: 1 },
    tools: ['poings', 'pieds', 'saisies'],
    targets: ['tete', 'tronc'],
    rhythm: 'Combat de 3 minutes de temps effectif (WKF), fait d’attentes mobiles et d’attaques très brèves ; l’arbitre arrête l’échange après chaque point.',
    rules: 'Aire carrée de 8 m de côté. Points : yuko (1) pour un coup de poing, waza-ari (2) pour un coup de pied au tronc, ippon (3) pour un coup de pied à la tête ou une technique sur un adversaire au sol. Une technique marque si elle a une bonne forme, une attitude sportive, de la vigueur, de la vigilance après le coup, un bon timing et une distance correcte ; seule la première technique d’un échange compte, sauf combinaison. Au visage, la technique doit s’arrêter à 2 cm (poing) ou 5 cm (pied), avec au plus un « contact peau » à partir de 16 ans ; aucun contact à la gorge. Saisir à deux mains ou saisir les jambes pour projeter est interdit, sauf exceptions prévues. Conséquence pour la pratique : distance longue, attaques uniques et explosives, contrôle des coups.',
    skills: {
      'corps-force': 1, 'corps-endurance-musculaire': 2, 'corps-endurance': 2, 'corps-puissance': 3, 'corps-mobilite': 3, 'corps-souplesse': 3,
      'corps-gainage': 2, 'corps-equilibre': 3, 'corps-coordination': 3, 'corps-reaction': 3, 'corps-recuperation': 2,
      'appuis-posture': 3, 'appuis-poids': 2, 'appuis-pas': 3, 'appuis-pivot': 2, 'appuis-lateral': 2, 'appuis-distance': 3, 'appuis-niveau': 1,
      'action-direct': 3, 'action-circulaire': 2, 'action-pied': 3, 'action-enchainement': 2, 'action-entree': 3, 'action-saisie': 1, 'action-projection': 1,
      'defense-garde': 2, 'defense-esquive': 2, 'defense-parade': 2, 'defense-retrait': 3, 'defense-chute': 1, 'defense-sortie-ligne': 2, 'defense-saisie': 1,
      'lecture-indices': 3, 'lecture-timing': 3, 'lecture-rythme': 3, 'lecture-anticipation': 3, 'lecture-decision': 3, 'lecture-adaptation': 2,
      'spe-boxe': 0, 'spe-escrime': 0, 'spe-lutte': 0, 'spe-judo': 0, 'spe-karate': 3, 'spe-muay-thai': 0, 'spe-jjb': 0,
      'trans-transfert': 0
    },
    ratingsReliability: 'experimental',
    sources: [S.wkf]
  },
  {
    id: 'muay-thai',
    name: 'Muay-thaï',
    summary: 'Sport de percussion qui utilise poings, pieds, genoux et coudes, avec un travail de saisie debout (clinch). Les jambes sont des cibles, ce qui impose une garde de face et des appuis capables de bloquer les coups de pied.',
    weapon: 'aucune',
    contact: 'mixte',
    distances: { longue: 3, moyenne: 3, courte: 3, corps: 3 },
    guard: { orientation: 'face', width: 'moyenne', weight: 'arriere', handsHigh: 3 },
    movement: { lineaire: 3, lateral: 2, circulaire: 2, niveau: 1 },
    tools: ['poings', 'pieds', 'genoux', 'coudes', 'saisies'],
    targets: ['tete', 'tronc', 'bras', 'jambes'],
    rhythm: 'Rounds de quelques minutes, effort continu, échanges longs et phases de clinch épuisantes.',
    rules: 'Une technique marquante est un coup de poing, de pied, de genou ou de coude porté avec force sur une cible sans être bloqué. Tout le corps est une cible sauf l’aine et l’arrière du cou ; les gants, avant-bras, pieds et tibias ne sont pas des cibles qui marquent. En compétition IFMA, casque, protège-tibias et protège-coudes sont obligatoires, et l’arbitre sépare les combattants au clinch quand il le faut. Conséquence pour la pratique : garde de face, poids souvent sur la jambe arrière pour lever la jambe avant et bloquer (habitude d’entraînement courante, non fixée par le règlement), travail au clinch.',
    skills: {
      'corps-force': 2, 'corps-endurance-musculaire': 3, 'corps-endurance': 3, 'corps-puissance': 3, 'corps-mobilite': 2, 'corps-souplesse': 2,
      'corps-gainage': 3, 'corps-equilibre': 3, 'corps-coordination': 3, 'corps-reaction': 2, 'corps-recuperation': 2,
      'appuis-posture': 3, 'appuis-poids': 3, 'appuis-pas': 2, 'appuis-pivot': 3, 'appuis-lateral': 2, 'appuis-distance': 3, 'appuis-niveau': 1,
      'action-direct': 3, 'action-circulaire': 3, 'action-pied': 3, 'action-enchainement': 3, 'action-entree': 2, 'action-saisie': 3, 'action-projection': 1,
      'defense-garde': 3, 'defense-esquive': 2, 'defense-parade': 3, 'defense-retrait': 2, 'defense-chute': 1, 'defense-sortie-ligne': 2, 'defense-saisie': 3,
      'lecture-indices': 3, 'lecture-timing': 3, 'lecture-rythme': 3, 'lecture-anticipation': 3, 'lecture-decision': 3, 'lecture-adaptation': 3,
      'spe-boxe': 0, 'spe-escrime': 0, 'spe-lutte': 0, 'spe-judo': 0, 'spe-karate': 0, 'spe-muay-thai': 3, 'spe-jjb': 0,
      'trans-transfert': 0
    },
    ratingsReliability: 'experimental',
    sources: [S.ifma]
  },
  {
    id: 'jjb',
    name: 'Jiu-jitsu brésilien',
    summary: 'Sport de saisie surtout pratiqué au sol : amener au sol ou tirer la garde, passer la garde, prendre une position dominante et finir par un étranglement ou une clé.',
    weapon: 'aucune',
    contact: 'saisie',
    distances: { longue: 0, moyenne: 1, courte: 2, corps: 3 },
    guard: { orientation: 'face', width: 'large', weight: 'variable', handsHigh: 1 },
    movement: { lineaire: 1, lateral: 1, circulaire: 2, niveau: 3 },
    tools: ['saisies'],
    targets: ['tete', 'tronc', 'bras', 'jambes'],
    rhythm: 'Effort long et souvent isométrique, plusieurs minutes de contrôle et de lutte au sol ; la puissance explosive compte moins que l’endurance de force.',
    rules: 'Barème IBJJF : amenée au sol 2 points, renversement 2, genou sur le ventre 2, passage de garde 3, montée ou montée dans le dos 4, contrôle du dos 4 ; une position ne marque que si elle est tenue 3 secondes. La soumission (abandon) termine le combat. Certaines clés sont réservées aux ceintures avancées. Conséquence pour la pratique : l’essentiel du temps se passe au sol, au contact.',
    skills: {
      'corps-force': 2, 'corps-endurance-musculaire': 3, 'corps-endurance': 3, 'corps-puissance': 1, 'corps-mobilite': 3, 'corps-souplesse': 3,
      'corps-gainage': 3, 'corps-equilibre': 2, 'corps-coordination': 2, 'corps-reaction': 1, 'corps-recuperation': 2,
      'appuis-posture': 2, 'appuis-poids': 3, 'appuis-pas': 1, 'appuis-pivot': 1, 'appuis-lateral': 1, 'appuis-distance': 1, 'appuis-niveau': 2,
      'action-direct': 0, 'action-circulaire': 0, 'action-pied': 0, 'action-enchainement': 3, 'action-entree': 2, 'action-saisie': 3, 'action-projection': 2,
      'defense-garde': 2, 'defense-esquive': 1, 'defense-parade': 1, 'defense-retrait': 1, 'defense-chute': 2, 'defense-sortie-ligne': 1, 'defense-saisie': 3,
      'lecture-indices': 2, 'lecture-timing': 2, 'lecture-rythme': 1, 'lecture-anticipation': 2, 'lecture-decision': 3, 'lecture-adaptation': 3,
      'spe-boxe': 0, 'spe-escrime': 0, 'spe-lutte': 0, 'spe-judo': 0, 'spe-karate': 0, 'spe-muay-thai': 0, 'spe-jjb': 3,
      'trans-transfert': 0
    },
    ratingsReliability: 'experimental',
    sources: [S.ibjjf]
  }
];
