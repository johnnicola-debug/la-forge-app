// Notes de transfert entre disciplines (LA FORGE 0.3).
// Schéma : docs/PLAN_NUIT_2026-10-31.md. Elles complètent le calcul automatique fait à partir des facettes.
//
// Rédaction : Claude Code (IA), 31/10/2026, à partir des sources citées (vérifiées en ligne le même jour).
// Principe de prudence : en science du mouvement, le transfert d’une discipline à l’autre est le plus souvent
// faible et spécifique (voir docs/RECHERCHE_TRANSFERT.md). Aucune étude ne mesure directement le passage
// escrime → boxe : chaque note dit si elle repose sur un consensus, sur un raisonnement cohérent ou sur une hypothèse.
//
// kind : 'transfert' (ce qui peut servir tel quel ou presque), 'adaptation' (ce qu’il faut réapprendre),
//        'risque' (une habitude qui peut nuire dans la discipline d’arrivée).
// reliability : 'etabli' | 'plausible' | 'experimental' (voir le plan).
// drills : ids d’exercices (exercises.js) ou de fiches (library.js) utiles pour travailler le point.

import { sourceRefs as S } from './disciplines.js';

export const transferNotes = [
  // ═══════════════ Escrime → boxe ═══════════════
  // — Ce qui peut se transférer (à nuancer) —
  {
    id: 'escrime-boxe-distance',
    from: 'escrime', to: 'boxe', skill: 'appuis-distance', kind: 'transfert',
    text: 'L’escrimeur a l’habitude de gérer la distance en permanence : avancer, rompre, attirer l’adversaire. Cette attention à la distance devrait servir en boxe, mais les repères chiffrés ne passent pas : la lame allonge beaucoup la portée, et la bonne distance dépend de la longueur de bras et de la technique utilisée. Il faut donc réétalonner entièrement ses distances avec les poings.',
    reliability: 'plausible',
    sources: [S.quel2019, S.ofspoEscrime, S.bsFootwork],
    drills: ['gestion-distance', 'deplacements-en-garde', 'pas-glisse']
  },
  {
    id: 'escrime-boxe-timing',
    from: 'escrime', to: 'boxe', skill: 'lecture-timing', kind: 'transfert',
    text: 'Attaquer au moment où l’adversaire prépare, ou le toucher pendant qu’il avance, sont des idées centrales en escrime et existent aussi en boxe (contre, coup d’arrêt). Le principe se transfère probablement, mais les signaux qui déclenchent l’action sont différents (bras et lame contre épaules, hanches et poings). Aucune étude ne mesure ce transfert précis.',
    reliability: 'plausible',
    sources: [S.quel2019, S.rosalie2012],
    drills: ['rythme-feinte', 'enchainement-direct-direct-retrait']
  },
  {
    id: 'escrime-boxe-explosivite',
    from: 'escrime', to: 'boxe', skill: 'corps-puissance', kind: 'transfert',
    text: 'En fente, la poussée vient surtout de la jambe arrière (extension du genou et de la cheville), et les escrimeurs experts produisent cette poussée bien plus vite que les débutants. Cette qualité de jambes est utile pour entrer vite à distance en boxe. En revanche, chez les boxeurs, ce qui distingue l’élite dans le direct avant est plutôt la force de la jambe avant : la qualité physique se transfère sans doute en partie, le geste beaucoup moins.',
    reliability: 'plausible',
    sources: [S.chen2017, S.liu2022, S.issurin2013],
    drills: ['pas-glisse', 'direct-avant', 'squat-poids-corps']
  },
  {
    id: 'escrime-boxe-anticipation',
    from: 'escrime', to: 'boxe', skill: 'lecture-anticipation', kind: 'transfert',
    text: 'Il est établi que les experts d’un sport de combat anticipent mieux les attaques que les débutants, dans leur propre sport. Une étude a montré que des karatékas experts anticipaient presque aussi bien que des spécialistes des coups de pied de taekwondo : l’anticipation peut donc passer d’un sport proche à l’autre chez les experts. Pour l’escrime vers la boxe, ce transfert reste plausible mais n’a jamais été mesuré, et il sera plus faible chez un escrimeur débutant.',
    reliability: 'plausible',
    sources: [S.mann2007, S.quel2019, S.rosalie2014],
    drills: ['rythme-feinte']
  },
  {
    id: 'escrime-boxe-intentions',
    from: 'escrime', to: 'boxe', skill: 'lecture-decision', kind: 'transfert',
    text: 'L’escrime entraîne à choisir vite entre plusieurs réponses face aux feintes ; chez les escrimeurs, le temps de réaction de choix et l’anticipation sont cités comme les meilleurs indicateurs de niveau. L’habitude de ne pas « mordre » à la première feinte devrait aider en boxe. Mais lire les intentions demande de connaître les actions typiques du nouveau sport : cette lecture se reconstruit en grande partie avec l’expérience de la boxe.',
    reliability: 'plausible',
    sources: [S.borysiuk2010, S.quel2019, S.abernethy2005],
    drills: ['rythme-feinte', 'apprendre-lentement']
  },
  {
    id: 'escrime-boxe-rythme',
    from: 'escrime', to: 'boxe', skill: 'lecture-rythme', kind: 'transfert',
    text: 'En escrime, les changements de distance vont souvent avec des changements de rythme des jambes, et ce point est travaillé dès la formation des jeunes. Casser le rythme, accélérer d’un coup après une phase lente, sert aussi en boxe. C’est un des transferts les plus vraisemblables, car il concerne une idée tactique et non un geste précis ; il reste cependant non mesuré.',
    reliability: 'plausible',
    sources: [S.ofspoEscrime, S.quel2019],
    drills: ['rythme-feinte', 'deplacements-en-garde']
  },
  {
    id: 'escrime-boxe-coordination',
    from: 'escrime', to: 'boxe', skill: 'corps-coordination', kind: 'transfert',
    text: 'La précision de l’escrimeur se joue avec les doigts et la pointe, sur une cible souvent petite. Elle ne se transforme pas automatiquement en précision du poing : les entraînements « généraux » de l’œil ou de la coordination s’améliorent surtout sur des tâches proches de celles qu’on a pratiquées, et leur effet sur la performance réelle n’est pas démontré. Hypothèse : le goût de la précision et l’habitude de corriger finement un geste aideront à apprendre, sans dispenser du travail spécifique.',
    reliability: 'experimental',
    sources: [S.guo2025, S.issurin2013],
    drills: ['shadow-leger', 'direct-avant', 'apprendre-lentement']
  },
  {
    id: 'escrime-boxe-reaction',
    from: 'escrime', to: 'boxe', skill: 'corps-reaction', kind: 'transfert',
    text: 'Il ne faut pas compter sur un « temps de réaction » plus rapide : dans les sports de combat, le temps de réaction simple ne prédit pas de façon fiable le niveau, et les différences entre experts et débutants apparaissent surtout dans des tâches complexes et propres au sport. Ce qui peut se transférer, c’est la prise de décision et l’anticipation, pas la vitesse brute de réaction.',
    reliability: 'etabli',
    sources: [S.quel2019, S.mann2007],
    drills: ['reaction-signal', 'rythme-feinte']
  },
  // — Ce qu’il faut adapter —
  {
    id: 'escrime-boxe-garde',
    from: 'escrime', to: 'boxe', skill: 'defense-garde', kind: 'adaptation',
    text: 'La garde d’escrime est de profil, le pied arrière ouvert et les talons sur une même ligne, la main armée devant. En boxe, les pieds sont décalés et orientés à environ 45 degrés, le talon arrière légèrement levé, et les deux mains protègent le visage. Avoir les pieds sur une même ligne est même cité comme une erreur courante par England Boxing : la garde doit être reconstruite.',
    reliability: 'etabli',
    sources: [S.ofspoEscrime, S.ebHandbook],
    drills: ['garde', 'repartition-poids']
  },
  {
    id: 'escrime-boxe-poids',
    from: 'escrime', to: 'boxe', skill: 'appuis-poids', kind: 'adaptation',
    text: 'Nuance sur l’hypothèse de départ : en garde d’escrime, le poids est réparti également sur les deux pieds, ce qui ressemble à la boxe. Ce qui change vraiment, c’est la forme de la base : très étroite sur le côté en escrime, plus large et décalée en boxe pour résister aux poussées et aux coups dans toutes les directions. Le travail porte donc sur la géométrie des appuis plus que sur le poids lui-même.',
    reliability: 'plausible',
    sources: [S.ofspoEscrime, S.ebHandbook, S.bsFootwork],
    drills: ['repartition-poids', 'posture-basse-haute', 'equilibre-unipodal']
  },
  {
    id: 'escrime-boxe-lateral',
    from: 'escrime', to: 'boxe', skill: 'appuis-lateral', kind: 'adaptation',
    text: 'La piste d’escrime ne mesure que 1,50 m de large et la sortie sur le côté est pénalisée : l’escrimeur n’a presque jamais appris à se déplacer latéralement. En boxe, sortir de la ligne d’attaque par un pas de côté ou un pivot est une base de la défense. C’est une compétence à construire presque de zéro.',
    reliability: 'etabli',
    sources: [S.fie, S.ebHandbook, S.bsFootwork],
    drills: ['pivot', 'esquive-laterale', 'deplacements-en-garde']
  },
  {
    id: 'escrime-boxe-apres-attaque',
    from: 'escrime', to: 'boxe', skill: 'defense-sortie-ligne', kind: 'adaptation',
    text: 'En escrime, l’arbitre arrête l’assaut dès qu’une touche est donnée, et l’attaque se termine souvent par un retour en garde en arrière. En boxe, rien ne s’arrête après un coup : il faut ramener la main en garde, enchaîner ou sortir de l’axe, car l’adversaire peut répondre immédiatement avec ses deux mains.',
    reliability: 'plausible',
    sources: [S.fie, S.ebHandbook],
    drills: ['enchainement-direct-direct-retrait', 'retrait-pas-arriere', 'pivot']
  },
  {
    id: 'escrime-boxe-tete',
    from: 'escrime', to: 'boxe', skill: 'defense-esquive', kind: 'adaptation',
    text: 'En escrime, le masque protège la tête et une touche au visage n’a pas de conséquence physique ; l’escrimeur n’a donc pas l’habitude de garder le menton baissé et les mains près du visage. En boxe, ces deux réflexes sont la base de la garde, avec les esquives du buste et les changements de niveau. Ils demandent un long travail progressif, d’abord sans contact.',
    reliability: 'etabli',
    sources: [S.ebHandbook, S.fie],
    drills: ['garde', 'parade-couvert', 'esquive-laterale']
  },
  {
    id: 'escrime-boxe-frappe-appuis',
    from: 'escrime', to: 'boxe', skill: 'action-direct', kind: 'adaptation',
    text: 'Chez l’escrimeur expert, le bras armé s’allonge avant que le pied avant ne parte (c’est aussi une question de priorité au fleuret et au sabre). En boxe, les sources consultées disent plutôt que « les coups suivent les pieds » et que la force vient du sol et d’un quart de rotation des hanches. Les deux coordinations se contredisent en partie ; certains entraîneurs de boxe enseignent toutefois le direct avant qui part juste avant le pas, point non vérifié ici.',
    reliability: 'plausible',
    sources: [S.chen2017, S.bsFootwork, S.ebHandbook],
    drills: ['direct-avant', 'direct-arriere', 'pas-glisse']
  },
  {
    id: 'escrime-boxe-distances-courtes',
    from: 'escrime', to: 'boxe', skill: 'action-circulaire', kind: 'adaptation',
    text: 'Le corps à corps volontaire est interdit en escrime et la distance courte y est rare : l’escrimeur n’a aucun répertoire à cette distance. La boxe se joue aussi de près, avec crochets, uppercuts et travail du buste. Il faut apprendre ces techniques et la manière de rester en équilibre au contact.',
    reliability: 'etabli',
    sources: [S.fie, S.ebRules],
    drills: ['crochet-a-vide', 'gestion-distance', 'gainage-rotation']
  },
  {
    id: 'escrime-boxe-regard',
    from: 'escrime', to: 'boxe', skill: 'lecture-indices', kind: 'adaptation',
    text: 'Les études d’oculométrie montrent que le regard des experts dépend du sport : des épéistes regardent surtout le bas du tronc et l’arme adverse, des boxeurs (boxe française) surtout la tête et le tronc. L’escrimeur devra donc probablement déplacer son point de regard et apprendre de nouveaux indices. Ces études portent sur de petits groupes.',
    reliability: 'plausible',
    sources: [S.quel2019],
    drills: ['shadow-leger']
  },
  {
    id: 'escrime-boxe-deux-mains',
    from: 'escrime', to: 'boxe', skill: 'action-enchainement', kind: 'adaptation',
    text: 'L’escrime est un sport asymétrique : un seul bras porte l’arme et l’autre main n’a pas le droit de servir. La boxe demande d’attaquer et de défendre avec les deux mains, et de savoir enchaîner gauche et droite. Le bras non armé de l’escrimeur part souvent de zéro en coordination et en force de frappe.',
    reliability: 'plausible',
    sources: [S.chen2017, S.fie, S.ebHandbook],
    drills: ['direct-arriere', 'enchainement-direct-direct-retrait', 'shadow-leger']
  },
  {
    id: 'escrime-boxe-impacts',
    from: 'escrime', to: 'boxe', skill: null, kind: 'adaptation',
    text: 'Hypothèse : un escrimeur n’a jamais appris à garder les yeux ouverts et à rester organisé quand il reçoit un coup réel. Cette tolérance se construit lentement, par une mise de gants progressive et encadrée ; England Boxing insiste sur un sparring contrôlé et adapté au niveau. Ne jamais brûler cette étape.',
    reliability: 'experimental',
    sources: [S.ebHandbook, S.ia],
    drills: ['apprendre-lentement', 'parade-couvert']
  },
  // — Les risques —
  {
    id: 'escrime-boxe-risque-posture',
    from: 'escrime', to: 'boxe', skill: 'appuis-posture', kind: 'risque',
    text: 'Garder la garde de profil, pieds alignés, réduit la base d’appui et éloigne la main arrière, qui devient peu utile pour frapper ou protéger le menton. Le bras avant tendu « en ligne », utile en escrime, laisse en boxe le visage moins couvert. Surveiller ces habitudes dès les premières séances, en se filmant.',
    reliability: 'plausible',
    sources: [S.ebHandbook, S.ofspoEscrime],
    drills: ['garde', 'repartition-poids']
  },
  {
    id: 'escrime-boxe-risque-lineaire',
    from: 'escrime', to: 'boxe', skill: 'appuis-lateral', kind: 'risque',
    text: 'Le risque le plus probable est de se déplacer seulement en avant et en arrière, de façon prévisible. England Boxing recommande au contraire de sortir de la ligne d’attaque plutôt que de toujours reculer droit. Un boxeur qui ne fait que rompre finit dans les cordes.',
    reliability: 'plausible',
    sources: [S.ebHandbook, S.fie],
    drills: ['pivot', 'esquive-laterale']
  },
  {
    id: 'escrime-boxe-risque-fente',
    from: 'escrime', to: 'boxe', skill: 'action-entree', kind: 'risque',
    text: 'La fente est un automatisme très entraîné : grand pas engagé, poids loin vers l’avant, puis retour en garde. Reproduite en boxe, elle risque de laisser le corps en déséquilibre et à portée de la riposte, sans possibilité d’enchaîner. Il faut apprendre à entrer par des pas courts qui gardent la base, et ralentir le geste au début pour défaire l’automatisme.',
    reliability: 'plausible',
    sources: [S.chen2017, S.bsFootwork, S.issurin2013],
    drills: ['pas-glisse', 'enchainement-direct-direct-retrait', 'apprendre-lentement']
  },
  {
    id: 'escrime-boxe-risque-entree',
    from: 'escrime', to: 'boxe', skill: 'appuis-distance', kind: 'risque',
    text: 'Plus la distance se réduit, moins il reste de temps pour réagir ; à courte distance, ce temps peut être inférieur à un temps de réaction simple. En escrime, l’action s’arrête souvent dès la touche ; en boxe, on reste à portée après l’entrée. Le moment de franchir la distance est donc le plus exposé : y entrer avec la garde haute et un plan de sortie.',
    reliability: 'plausible',
    sources: [S.quel2019, S.ebHandbook],
    drills: ['gestion-distance', 'parade-couvert', 'retrait-pas-arriere']
  },
  {
    id: 'escrime-boxe-risque-effort',
    from: 'escrime', to: 'boxe', skill: 'corps-endurance', kind: 'risque',
    text: 'L’effort en escrime est coupé à chaque touche par l’arrêt de l’arbitre ; un round de boxe dure 2 à 3 minutes sans pause. Un escrimeur bien préparé peut donc se fatiguer plus vite que prévu en boxe, et la fatigue dégrade la garde. Construire progressivement l’endurance sur des durées de round.',
    reliability: 'plausible',
    sources: [S.fie, S.ebRules, S.issurin2013],
    drills: ['intervalles-doux', 'corde-a-sauter', 'shadow-leger']
  },

  // ═══════════════ Boxe → escrime ═══════════════
  {
    id: 'boxe-escrime-distance',
    from: 'boxe', to: 'escrime', skill: 'appuis-distance', kind: 'transfert',
    text: 'Le boxeur a déjà l’habitude d’entrer et de sortir de distance. L’idée se transfère, mais la distance d’escrime est beaucoup plus longue à cause de la lame et de la fente : les repères de la boxe sont trop courts et doivent être réétalonnés.',
    reliability: 'plausible',
    sources: [S.quel2019, S.ofspoEscrime],
    drills: ['deplacements-en-garde', 'gestion-distance']
  },
  {
    id: 'boxe-escrime-timing',
    from: 'boxe', to: 'escrime', skill: 'lecture-timing', kind: 'transfert',
    text: 'Le sens du contre (frapper quand l’adversaire avance) se retrouve dans le coup d’arrêt de l’escrime. Attention : au fleuret et au sabre, une règle de priorité décide quelle touche compte, et un contre lancé dans une attaque correcte est en général donné perdant. À l’épée, sans priorité, ce réflexe est plus directement utilisable.',
    reliability: 'plausible',
    sources: [S.fie, S.quel2019],
    drills: ['rythme-feinte']
  },
  {
    id: 'boxe-escrime-anticipation',
    from: 'boxe', to: 'escrime', skill: 'lecture-anticipation', kind: 'transfert',
    text: 'Comme dans l’autre sens, l’anticipation d’un expert peut passer en partie vers un sport de combat proche, mais les indices à lire changent : l’arme et le bras armé deviennent essentiels. Le transfert est plausible chez un boxeur expérimenté et faible chez un débutant ; il n’a pas été mesuré.',
    reliability: 'plausible',
    sources: [S.rosalie2014, S.quel2019],
    drills: []
  },
  {
    id: 'boxe-escrime-rythme',
    from: 'boxe', to: 'escrime', skill: 'lecture-rythme', kind: 'transfert',
    text: 'Feintes, changements de cadence et préparation d’attaque sont communs aux deux sports. Le boxeur habitué à feinter pour provoquer une réaction devrait comprendre vite le rôle des préparations en escrime. Le geste de la feinte, lui, est entièrement nouveau (avec la pointe).',
    reliability: 'plausible',
    sources: [S.ofspoEscrime, S.quel2019],
    drills: ['rythme-feinte']
  },
  {
    id: 'boxe-escrime-pas',
    from: 'boxe', to: 'escrime', skill: 'appuis-pas', kind: 'transfert',
    text: 'Le pas glissé de la boxe, où le pied suiveur parcourt la même distance que le pied avant sans croiser, ressemble à la marche et à la retraite de l’escrime. C’est probablement un des meilleurs points de départ. Il faut cependant le refaire en garde de profil, talons sur une même ligne.',
    reliability: 'plausible',
    sources: [S.bsFootwork, S.ofspoEscrime],
    drills: ['pas-glisse', 'deplacements-en-garde']
  },
  {
    id: 'boxe-escrime-physique',
    from: 'boxe', to: 'escrime', skill: 'corps-endurance', kind: 'transfert',
    text: 'La base d’endurance du boxeur est largement suffisante pour l’escrime, dont l’effort est coupé après chaque touche. En revanche, l’escrime demande des fentes répétées, très exigeantes pour les jambes, et les blessures les plus fréquentes touchent le genou, la cuisse et la cheville. La force des jambes et la tolérance des genoux sont à préparer.',
    reliability: 'plausible',
    sources: [S.chen2017, S.issurin2013],
    drills: ['fente-arriere', 'chevilles-genou-mur', 'squat-poids-corps']
  },
  {
    id: 'boxe-escrime-garde',
    from: 'boxe', to: 'escrime', skill: 'appuis-posture', kind: 'adaptation',
    text: 'Il faut passer d’une garde de trois-quarts, pieds décalés, à une garde de profil avec le pied avant vers l’adversaire, le pied arrière ouvert et les talons sur une même ligne. Ce changement retire au boxeur sa base large habituelle et demande un travail d’équilibre spécifique.',
    reliability: 'etabli',
    sources: [S.ofspoEscrime, S.ebHandbook],
    drills: ['equilibre-unipodal', 'deplacements-en-garde']
  },
  {
    id: 'boxe-escrime-lateral',
    from: 'boxe', to: 'escrime', skill: 'appuis-lateral', kind: 'adaptation',
    text: 'Les sorties de ligne par le côté, essentielles en boxe, sont presque impossibles sur une piste de 1,50 m, et sortir sur le côté fait perdre du terrain. Le boxeur doit transférer son mouvement vers l’avant-arrière et défendre surtout par la distance et la parade.',
    reliability: 'etabli',
    sources: [S.fie],
    drills: ['deplacements-en-garde', 'retrait-pas-arriere']
  },
  {
    id: 'boxe-escrime-fente',
    from: 'boxe', to: 'escrime', skill: 'action-entree', kind: 'adaptation',
    text: 'La fente n’existe pas en boxe : c’est un geste nouveau, où la jambe arrière pousse fort pendant que le bras s’allonge en premier. Chez les experts, l’allongement du bras précède le départ du pied avant, à l’inverse de beaucoup d’habitudes de boxe. L’apprendre lentement, avec un enseignant.',
    reliability: 'etabli',
    sources: [S.chen2017, S.ofspoEscrime],
    drills: ['fente-arriere', 'apprendre-lentement']
  },
  {
    id: 'boxe-escrime-cible',
    from: 'boxe', to: 'escrime', skill: 'action-direct', kind: 'adaptation',
    text: 'La cible change selon l’arme : le tronc seulement au fleuret, tout le corps à l’épée (y compris la main et le pied avancés), le haut du corps au sabre. Le boxeur doit apprendre que la main et l’avant-bras adverses, à l’épée, sont souvent la cible la plus proche.',
    reliability: 'etabli',
    sources: [S.fie],
    drills: []
  },
  {
    id: 'boxe-escrime-risque-main',
    from: 'boxe', to: 'escrime', skill: 'defense-parade', kind: 'risque',
    text: 'Le réflexe de boxe de bloquer ou parer avec la main arrière est interdit en escrime : utiliser le bras ou la main non armés pour attaquer ou se défendre annule la touche et vaut un carton rouge. Couvrir la cible avec une partie non valable est aussi sanctionné. C’est un automatisme à surveiller dès les premiers assauts.',
    reliability: 'etabli',
    sources: [S.fie],
    drills: []
  },
  {
    id: 'boxe-escrime-risque-corps',
    from: 'boxe', to: 'escrime', skill: 'action-entree', kind: 'risque',
    text: 'Le boxeur a l’habitude de raccourcir la distance pour frapper de près. En escrime, provoquer volontairement le corps à corps est interdit, et au sabre la flèche et la marche avant en croisant les jambes le sont aussi. Rentrer « au contact » coûte des pénalités et fait perdre l’avantage de la lame.',
    reliability: 'etabli',
    sources: [S.fie],
    drills: ['gestion-distance']
  },
  {
    id: 'boxe-escrime-risque-esquive',
    from: 'boxe', to: 'escrime', skill: 'defense-esquive', kind: 'risque',
    text: 'Les esquives du buste et les changements de niveau sont permis en escrime, mais à l’épée tout le corps est une cible : baisser la tête ou pencher le buste peut simplement présenter une autre zone valable à la pointe. Hypothèse prudente : réduire les esquives de boxe au profit de la distance et de la parade, puis les réintroduire avec un enseignant.',
    reliability: 'plausible',
    sources: [S.fie, S.ia],
    drills: []
  },

  // ═══════════════ Judo → lutte ═══════════════
  {
    id: 'judo-lutte-projection',
    from: 'judo', to: 'lutte', skill: 'action-projection', kind: 'transfert',
    text: 'Le judoka sait déséquilibrer, se battre pour la saisie et projeter avec le haut du corps et les hanches. Ces compétences sont proches de la lutte, surtout de la gréco-romaine, où l’on ne peut attaquer que par le haut du corps. La disparition de la veste change cependant toutes les saisies : le transfert est partiel.',
    reliability: 'plausible',
    sources: [S.ijf, S.uww, S.abernethy2005],
    drills: []
  },
  {
    id: 'judo-lutte-jambes',
    from: 'judo', to: 'lutte', skill: 'defense-saisie', kind: 'risque',
    text: 'Saisir les jambes avec les mains est sanctionné en judo, si bien que le judoka actuel s’entraîne peu à attaquer les jambes ou à s’en défendre. En lutte libre, les attaques aux jambes sont autorisées et fréquentes : la défense contre ces attaques, en abaissant les hanches, est à construire.',
    reliability: 'plausible',
    sources: [S.ijf, S.uww],
    drills: ['posture-basse-haute']
  },
  {
    id: 'judo-lutte-saisies',
    from: 'judo', to: 'lutte', skill: 'action-saisie', kind: 'adaptation',
    text: 'Sans veste, il faut saisir directement le corps : nuque, bras, poignets, ceinture scapulaire. Les habitudes de saisie sur le revers et la manche ne servent plus. La posture de lutte, plus basse et de face, est aussi différente de celle du judo.',
    reliability: 'plausible',
    sources: [S.uww, S.ijf],
    drills: ['posture-basse-haute', 'repartition-poids']
  },

  // ═══════════════ Karaté → boxe ═══════════════
  {
    id: 'karate-boxe-enchainement',
    from: 'karate', to: 'boxe', skill: 'action-enchainement', kind: 'risque',
    text: 'En kumite WKF, seule la première technique d’un échange marque, sauf combinaison, et l’arbitre arrête après chaque point. Le karatéka peut donc avoir l’habitude de frapper une fois puis de s’arrêter. En boxe, l’échange continue : il faut apprendre à enchaîner et à se protéger après le coup.',
    reliability: 'plausible',
    sources: [S.wkf, S.ebHandbook],
    drills: ['enchainement-direct-direct-retrait', 'shadow-leger']
  },
  {
    id: 'karate-boxe-controle',
    from: 'karate', to: 'boxe', skill: 'action-direct', kind: 'adaptation',
    text: 'Au visage, le karaté sportif demande d’arrêter le poing à 2 cm ou de toucher à peine la peau. En boxe, on frappe à travers la cible avec les gants : le geste de fin de coup, la tenue du poignet et le transfert du poids sont à réapprendre.',
    reliability: 'plausible',
    sources: [S.wkf, S.ebHandbook],
    drills: ['direct-avant', 'direct-arriere']
  },
  {
    id: 'karate-boxe-timing',
    from: 'karate', to: 'boxe', skill: 'lecture-timing', kind: 'transfert',
    text: 'Le karaté de compétition récompense le bon timing et la bonne distance, et les karatékas experts ont montré qu’ils pouvaient transférer une partie de leur anticipation vers un autre sport de percussion. Le sens de l’entrée explosive à longue distance devrait être utile en boxe, à condition d’apprendre à travailler aussi de près.',
    reliability: 'plausible',
    sources: [S.wkf, S.rosalie2014],
    drills: ['gestion-distance', 'crochet-a-vide']
  },

  // ═══════════════ Boxe → muay-thaï ═══════════════
  {
    id: 'boxe-muay-thai-jambe',
    from: 'boxe', to: 'muay-thai', skill: 'appuis-poids', kind: 'risque',
    text: 'En muay-thaï, les jambes sont des cibles. Une garde de boxe de trois-quarts, avec du poids sur la jambe avant, expose cette jambe aux coups de pied bas et rend difficile de la lever pour bloquer. Il faut une garde plus de face et un poids plus disponible sur la jambe arrière (habitude d’entraînement courante, non fixée par le règlement).',
    reliability: 'plausible',
    sources: [S.ifma, S.ia],
    drills: ['repartition-poids', 'equilibre-unipodal', 'coup-pied-face-bas']
  },
  {
    id: 'boxe-muay-thai-clinch',
    from: 'boxe', to: 'muay-thai', skill: 'action-saisie', kind: 'adaptation',
    text: 'Tenir l’adversaire est une faute en boxe ; en muay-thaï, la saisie debout (clinch) est une partie du combat, avec des coups de genou et des déséquilibres. Le boxeur doit apprendre à saisir, à se dégager et à se protéger des genoux au contact.',
    reliability: 'etabli',
    sources: [S.ebRules, S.ifma],
    drills: []
  },
  {
    id: 'boxe-muay-thai-poings',
    from: 'boxe', to: 'muay-thai', skill: 'defense-esquive', kind: 'adaptation',
    text: 'La technique des poings et le jeu de jambes de la boxe restent utiles. Mais les esquives basses et les changements de niveau, très efficaces en boxe, peuvent amener la tête près d’un genou ou d’un coup de pied haut : elles sont à utiliser avec plus de prudence.',
    reliability: 'plausible',
    sources: [S.ifma, S.ebHandbook],
    drills: ['parade-couvert', 'garde']
  }
];
