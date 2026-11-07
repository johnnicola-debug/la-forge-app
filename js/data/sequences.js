// Séquences illustratives du moteur de mouvement (garde « pied gauche devant », vue de profil).
// Les angles sont choisis à l'œil pour la lisibilité : ce ne sont ni des mesures,
// ni des recommandations articulaires. Statut : illustration non validée.

const GUARD = {torso: 8, neck: -6, leadShoulder: 26, leadElbow: 128, rearShoulder: 8, rearElbow: 146,
  leadHip: 18, leadKnee: 22, leadAnkle: 0, rearHip: -22, rearKnee: 6, rearAnkle: 0};
const pose = (over = {}, x = 0, lift = 0) => ({x, lift, angles: {...GUARD, ...over}});
// Garde d'escrime vue de profil : buste droit, pied arrière à plat. Le genou arrière s'ouvre sur le côté dans la réalité :
// vu de profil, le tibia arrière paraît presque vertical (limite d'une vue 2D, voir la vue 3D).
const FENCE = {torso: 0, neck: 0, leadShoulder: 52, leadElbow: 22, rearShoulder: -100, rearElbow: -80,
  leadHip: 30, leadKnee: 40, leadAnkle: 10, rearHip: -20, rearKnee: 0, rearAnkle: 20};
const fence = (over = {}, x = 0) => ({x, lift: 0, angles: {...FENCE, ...over}});
// Posture avant de karaté (zenkutsu-dachi) vue de profil ; poing arrière à la hanche (hikite).
const KARA = {torso: 0, neck: 0, leadShoulder: 70, leadElbow: 10, rearShoulder: -28, rearElbow: 112,
  leadHip: 40, leadKnee: 46, leadAnkle: 6, rearHip: -28, rearKnee: 0, rearAnkle: 28};
const kara = (over = {}, x = 0) => ({x, lift: 0, angles: {...KARA, ...over}});

export const sequences = [
  {id: 'garde', name: 'Garde et répartition du poids', track: ['head', 'pelvis'],
    note: 'Pose quasi statique : on illustre une légère respiration des appuis.',
    keys: [
      {label: 'Garde', pose: pose(), cue: 'Appuis décalés, genoux souples, mains hautes.'},
      {label: 'Poids vers l’avant', ms: 900, pose: pose({torso: 12, leadKnee: 28, rearHip: -26}, 4), cue: 'Le poids glisse légèrement vers le pied avant.'},
      {label: 'Poids vers l’arrière', ms: 1100, pose: pose({torso: 4, leadKnee: 16, rearKnee: 18, rearHip: -20}, -4), cue: 'Puis vers le pied arrière, sans se redresser.'},
      {label: 'Retour', ms: 900, pose: pose(), cue: 'Retour à une répartition confortable.'}]},
  {id: 'pas-glisse', name: 'Pas glissé avant', track: ['leadToe', 'pelvis'],
    note: 'Le pied avant part, le pied arrière suit ; l’écart est retrouvé.',
    keys: [
      {label: 'Garde', pose: pose(), cue: 'Partir d’une garde stable.'},
      {label: 'Pied avant', ms: 500, pose: pose({leadHip: 30, leadKnee: 16, rearHip: -30, rearKnee: 8}, 16), cue: 'Le pied avant glisse un peu vers l’avant.'},
      {label: 'Pied arrière suit', ms: 500, pose: pose({leadHip: 20, rearHip: -18, rearKnee: 18}, 38), cue: 'Le pied arrière suit sans croiser.'},
      {label: 'Garde retrouvée', ms: 400, pose: pose({}, 40), cue: 'Même écart qu’au départ.'}]},
  {id: 'pas-arriere', name: 'Pas arrière (retrait)', track: ['rearToe', 'pelvis'],
    note: 'Le pied arrière recule en premier, le pied avant suit.',
    keys: [
      {label: 'Garde', pose: pose({}, 40), cue: 'Garde stable.'},
      {label: 'Pied arrière recule', ms: 500, pose: pose({rearHip: -34, rearKnee: 8, leadHip: 26}, 24), cue: 'Le pied arrière recule d’abord.'},
      {label: 'Pied avant suit', ms: 500, pose: pose({leadHip: 12, leadKnee: 26, rearHip: -22}, 4), cue: 'Le pied avant revient.'},
      {label: 'Garde retrouvée', ms: 400, pose: pose({}, 0), cue: 'Écart retrouvé, mains hautes.'}]},
  {id: 'direct-avant', name: 'Direct avant à vide', track: ['leadWrist', 'head'],
    note: 'Aller-retour de la main avant, sans cible ni impact.',
    keys: [
      {label: 'Garde', pose: pose(), cue: 'Garde relâchée.'},
      {label: 'Départ', ms: 220, pose: pose({torso: 11, leadShoulder: 52, leadElbow: 88}, 3), cue: 'La main part en ligne, le coude reste bas.'},
      {label: 'Extension', ms: 220, pose: pose({torso: 14, neck: -10, leadShoulder: 84, leadElbow: 8, rearElbow: 150, leadKnee: 26}, 6), cue: 'Bras étendu sans verrouiller le coude ; l’autre main protège le visage.'},
      {label: 'Retour', ms: 320, pose: pose(), cue: 'La main revient par le même chemin, garde retrouvée.'}]},
  {id: 'esquive-laterale', name: 'Esquive (rotation et flexion)', track: ['head'],
    note: 'Vue de profil : la tête sort de la ligne par flexion des jambes et inclinaison du buste.',
    keys: [
      {label: 'Garde', pose: pose(), cue: 'Garde stable.'},
      {label: 'Esquive', ms: 350, pose: pose({torso: 26, neck: -18, leadKnee: 38, rearKnee: 26, rearHip: -28, leadHip: 24}, 2), cue: 'Fléchir les genoux, la tête sort de la ligne ; le regard reste devant.'},
      {label: 'Retour', ms: 400, pose: pose(), cue: 'Retrouver la garde sans se relever d’un coup.'}]},
  {id: 'coup-pied-avant', name: 'Coup de pied de face bas, à vide', track: ['leadToe', 'head'],
    note: 'Lent et bas : l’objectif est l’équilibre, pas la hauteur.',
    keys: [
      {label: 'Garde', pose: pose(), cue: 'Garde stable, poids sur la jambe arrière.'},
      {label: 'Armé', ms: 450, pose: pose({torso: -2, leadHip: 72, leadKnee: 96, rearHip: 8, rearKnee: 14, rearAnkle: -6}, -16), cue: 'Monter le genou devant soi, la jambe d’appui reste souple.'},
      {label: 'Extension basse', ms: 350, pose: pose({torso: -6, leadHip: 66, leadKnee: 8, leadAnkle: -20, rearHip: 8, rearKnee: 14, rearAnkle: -6}, -16), cue: 'Étendre la jambe à faible hauteur, sans claquer le genou.'},
      {label: 'Ré-armé', ms: 350, pose: pose({torso: -2, leadHip: 72, leadKnee: 96, rearHip: 8, rearKnee: 14, rearAnkle: -6}, -16), cue: 'Ramener le genou.'},
      {label: 'Garde', ms: 450, pose: pose(), cue: 'Reposer le pied et retrouver la garde.'}]}
,
  {id: 'escrime-garde', style: 'escrime', name: 'Garde d’escrime et marche', track: ['pelvis', 'leadWrist'],
    note: 'Garde de profil, bras armé devant ; la marche avance le pied avant puis ramène le pied arrière.',
    keys: [
      {label: 'En garde', pose: fence(), cue: 'De profil, genoux fléchis, bras armé devant, bras arrière relevé.'},
      {label: 'Pied avant', ms: 420, pose: fence({leadHip: 44, leadKnee: 34}, 14), cue: 'Le pied avant part, talon en premier.'},
      {label: 'Pied arrière', ms: 420, pose: fence({}, 34), cue: 'Le pied arrière suit, même écart, sans se redresser.'}]},
  {id: 'escrime-fente', style: 'escrime', name: 'Fente d’escrime (à vide)', track: ['leadWrist', 'pelvis'],
    note: 'Le bras s’allonge d’abord, puis la jambe avant part ; la jambe arrière pousse et se tend.',
    keys: [
      {label: 'En garde', pose: fence(), cue: 'Garde stable.'},
      {label: 'Bras allongé', ms: 260, pose: fence({leadShoulder: 84, leadElbow: 4}), cue: 'Le bras armé s’allonge en premier.'},
      {label: 'Fente', ms: 380, pose: fence({torso: 6, leadShoulder: 88, leadElbow: 0, rearShoulder: -50, rearElbow: 0, leadHip: 76, leadKnee: 78, leadAnkle: 4,
        rearHip: -52, rearKnee: 0, rearAnkle: 52}, 58), cue: 'Genou avant au-dessus du pied, jambe arrière tendue, pied arrière à plat.'},
      {label: 'Retour en garde', ms: 520, pose: fence({}, 0), cue: 'La jambe arrière se replie et ramène le corps en garde.'}]}
,
  {id: 'direct-arriere', name: 'Direct arrière à vide', track: ['rearWrist', 'head'],
    note: 'Le talon arrière pivote, la hanche accompagne, la main arrière part en ligne puis revient.',
    keys: [
      {label: 'Garde', pose: pose(), cue: 'Garde relâchée, poids réparti.'},
      {label: 'Rotation', ms: 220, pose: pose({torso: 12, rearShoulder: 46, rearElbow: 96, rearHip: -18, rearKnee: 4, rearAnkle: 14}, 3), cue: 'Le talon arrière se lève et pivote, la hanche tourne.'},
      {label: 'Extension', ms: 220, pose: pose({torso: 16, neck: -10, rearShoulder: 82, rearElbow: 6, leadElbow: 140, rearHip: -16, rearKnee: 2, rearAnkle: 18, leadKnee: 28}, 6), cue: 'Bras arrière tendu sans verrouiller, l’autre main protège le menton.'},
      {label: 'Retour', ms: 320, pose: pose(), cue: 'Retour par le même chemin, garde retrouvée.'}]},
  {id: 'changement-niveau', style: 'carre', name: 'Changement de niveau', track: ['head', 'pelvis'],
    note: 'Descendre par les jambes, dos long, regard devant : base d’une entrée en saisie.',
    keys: [
      {label: 'Garde haute', pose: pose({leadShoulder: 40, leadElbow: 100, rearShoulder: 30, rearElbow: 110})},
      {label: 'Niveau bas', ms: 500, pose: pose({torso: 26, neck: -24, leadShoulder: 50, leadElbow: 90, rearShoulder: 40, rearElbow: 100,
        leadHip: 58, leadKnee: 84, leadAnkle: 6, rearHip: 6, rearKnee: 70, rearAnkle: 48}, 6), cue: 'Les genoux plient, les hanches descendent, le dos reste long.'},
      {label: 'Remontée', ms: 500, pose: pose({leadShoulder: 40, leadElbow: 100, rearShoulder: 30, rearElbow: 110}), cue: 'Remonter en poussant dans le sol, garde conservée.'}]},
  {id: 'teep', style: 'carre', name: 'Teep (coup de pied poussé), à vide', track: ['leadToe', 'head'],
    note: 'Armé du genou, poussée de la plante du pied vers l’avant, retour en garde. Lent et bas pour l’équilibre.',
    keys: [
      {label: 'Garde', pose: pose({torso: 2, rearHip: -20, rearKnee: 10}), cue: 'Garde droite, poids légèrement sur la jambe arrière.'},
      {label: 'Armé', ms: 420, pose: pose({torso: -8, leadHip: 82, leadKnee: 100, rearHip: 8, rearKnee: 16, rearAnkle: -6}, -14), cue: 'Monter le genou devant soi, le poids passe au-dessus du pied d’appui.'},
      {label: 'Poussée', ms: 320, pose: pose({torso: -16, leadHip: 78, leadKnee: 6, leadAnkle: -40, rearHip: 8, rearKnee: 14, rearAnkle: -6}, -10), cue: 'Pousser avec la plante du pied, hanche vers l’avant.'},
      {label: 'Retour', ms: 520, pose: pose({torso: 2, rearHip: -20, rearKnee: 10}), cue: 'Ramener le genou puis poser le pied en garde.'}]},
  {id: 'gyaku-zuki', style: 'karate', name: 'Gyaku-zuki (coup de poing opposé), à vide', track: ['rearWrist', 'pelvis'],
    note: 'Posture avant longue (zenkutsu-dachi) ; la main arrière part de la hanche pendant que l’autre revient.',
    keys: [
      {label: 'Posture avant', pose: kara({}), cue: 'Jambe avant fléchie, jambe arrière tendue, pied arrière à plat.'},
      {label: 'Départ', ms: 260, pose: kara({rearShoulder: 30, rearElbow: 90, leadShoulder: 40, leadElbow: 50}), cue: 'Le poing arrière quitte la hanche, l’avant commence à revenir.'},
      {label: 'Impact à vide', ms: 220, pose: kara({rearShoulder: 86, rearElbow: 4, leadShoulder: -28, leadElbow: 112}), cue: 'Bras tendu à hauteur de plexus, poing avant ramené à la hanche.'},
      {label: 'Retour', ms: 420, pose: kara({}), cue: 'Revenir lentement en posture.'}]},
  // ——— Ajouts du 07/11 : rotation complète (face) et travail au sol (appui par tout le corps) ———
  {id: 'crochet', name: 'Crochet avant, à vide', track: ['leadWrist', 'head'],
    note: 'Bras en arc à hauteur d’épaule ; la rotation des hanches et du buste porte le coup (illustration 3D : le bras s’écarte sur le côté).',
    keys: [
      {label: 'Garde', pose: pose(), cue: 'Garde haute, coude avant près du corps.'},
      {label: 'Charge', ms: 300, pose: {...pose({torso: 10}), d3: {chestTurn: 18}}, cue: 'Le buste se charge légèrement vers l’arrière.'},
      {label: 'Crochet', ms: 240, pose: {...pose({torso: 8, leadShoulder: -8, leadElbow: 95}), d3: {leadArmAbd: 85, chestTurn: -24, turn: 14, leadFootOut: 34}}, cue: 'Le pied avant pivote, la hanche tourne, le bras en arc reste plié.'},
      {label: 'Retour', ms: 420, pose: pose(), cue: 'Ramener le bras en garde, menton protégé.'}]},
  {id: 'coup-pied-retourne', name: 'Coup de pied retourné, à vide', track: ['rearToe', 'head'],
    note: 'Volte sur le pied avant, regard par-dessus l’épaule, jambe arrière poussée vers la cible. Geste avancé : lentement, à vide, sur sol sûr.',
    keys: [
      {label: 'Garde', pose: pose(), cue: 'Garde stable.'},
      {label: 'Volte', ms: 420, pose: {...pose({torso: 18, leadKnee: 26}), d3: {face: 110}}, cue: 'Pivoter sur l’avant du pied avant, regarder par-dessus l’épaule.'},
      {label: 'Armé', ms: 320, pose: {...pose({torso: 40, leadKnee: 24, rearHip: 34, rearKnee: 110, rearAnkle: 20}), d3: {face: 180, leadAbd: -6, turn: 60}}, cue: 'Dos à la cible, genou arrière ramené.'},
      {label: 'Frappe', ms: 280, pose: {...pose({torso: 64, neck: -34, leadHip: 12, leadKnee: 22, rearHip: -70, rearKnee: 4, rearAnkle: 26}), d3: {face: 180, leadAbd: -6, turn: 60}}, cue: 'Talon poussé vers la cible, buste en contrepoids.'},
      {label: 'Reprise', ms: 380, pose: {...pose({torso: 22, rearHip: 10, rearKnee: 60}), d3: {face: 270}}, cue: 'Ramener la jambe en finissant le tour.'},
      {label: 'Garde', ms: 420, pose: {...pose(), d3: {face: 360}}, cue: 'Retour en garde face à la cible.'}]},
  {id: 'escrime-parade-riposte', style: 'escrime', name: 'Parade et riposte (escrime, à vide)', track: ['leadWrist', 'pelvis'],
    keys: [
      {label: 'En garde', pose: fence(), cue: 'Garde d’escrime, bras armé souple.'},
      {label: 'Parade', ms: 220, pose: {...fence({leadShoulder: 44, leadElbow: 38}), d3: {leadArmAbd: 26}}, cue: 'Petit déplacement de la main : la lame écarte l’attaque.'},
      {label: 'Riposte', ms: 260, pose: fence({torso: 4, leadShoulder: 86, leadElbow: 2}), cue: 'Le bras s’allonge aussitôt vers la cible.'},
      {label: 'En garde', ms: 420, pose: fence(), cue: 'Retour en garde.'}]},
  {id: 'chute-arriere', style: 'carre', ground: true, name: 'Chute arrière amortie (ukemi), au sol', track: ['head', 'pelvis'],
    note: 'Descendre près du sol, rouler sur le dos menton rentré, frapper le sol des deux bras. À apprendre sur tapis avec un enseignant.',
    keys: [
      {label: 'Debout', pose: pose({torso: 4, leadHip: 6, leadKnee: 8, rearHip: -6, rearKnee: 8, leadShoulder: 30, rearShoulder: 30, leadElbow: 30, rearElbow: 30}), cue: 'Debout, détendu.'},
      {label: 'Accroupi', ms: 600, pose: pose({torso: 48, neck: 30, leadHip: 108, leadKnee: 140, leadAnkle: 22, rearHip: 104, rearKnee: 140, rearAnkle: 26, leadShoulder: 62, rearShoulder: 62, leadElbow: 0, rearElbow: 0}), cue: 'Descendre près du sol, bras devant.'},
      {label: 'Roulé', ms: 520, pose: pose({torso: -70, neck: 52, leadHip: 150, leadKnee: 90, leadAnkle: 10, rearHip: 146, rearKnee: 90, rearAnkle: 10, leadShoulder: 150, rearShoulder: 150, leadElbow: 20, rearElbow: 20}), cue: 'S’asseoir près des talons et rouler, menton rentré.'},
      {label: 'Frappe du sol', ms: 320, pose: {...pose({torso: -84, neck: 55, leadHip: 140, leadKnee: 50, leadAnkle: 10, rearHip: 136, rearKnee: 50, rearAnkle: 10, leadShoulder: 129, rearShoulder: 129, leadElbow: 0, rearElbow: 0}), d3: {leadArmAbd: 88, rearArmAbd: 88}}, cue: 'Les bras frappent le sol à 45°, la tête ne touche pas.'},
      {label: 'Retour assis', ms: 700, pose: pose({torso: -70, neck: 52, leadHip: 150, leadKnee: 90, leadAnkle: 10, rearHip: 146, rearKnee: 90, rearAnkle: 10, leadShoulder: 150, rearShoulder: 150, leadElbow: 20, rearElbow: 20}), cue: 'Rouler vers l’avant.'},
      {label: 'Accroupi', ms: 600, pose: pose({torso: 48, neck: 30, leadHip: 108, leadKnee: 140, leadAnkle: 22, rearHip: 104, rearKnee: 140, rearAnkle: 26, leadShoulder: 62, rearShoulder: 62, leadElbow: 0, rearElbow: 0}), cue: 'Revenir sur les pieds, accroupi.'}]},
  {id: 'sprawl', style: 'carre', ground: true, name: 'Sprawl (défense des jambes), au sol', track: ['pelvis', 'leadToe'],
    note: 'Les jambes partent en arrière, les hanches écrasent vers le sol, les mains se posent : on évite la saisie des jambes.',
    keys: [
      {label: 'Garde', pose: pose({torso: 12, leadKnee: 28}), cue: 'Garde basse, prête.'},
      {label: 'Bascule', ms: 260, pose: pose({torso: 40, neck: -16, leadHip: 34, leadKnee: 64, rearHip: 4, rearKnee: 54, leadShoulder: -40, rearShoulder: -40, leadElbow: 0, rearElbow: 0}), cue: 'Le buste plonge, les mains descendent.'},
      {label: 'Sprawl', ms: 300, pose: pose({torso: 78, neck: -36, leadHip: -52, leadKnee: 0, leadAnkle: 48, rearHip: -56, rearKnee: 0, rearAnkle: 48, leadShoulder: -66, rearShoulder: -66, leadElbow: 10, rearElbow: 10}), cue: 'Jambes projetées en arrière, hanches vers le sol, tête haute.'},
      {label: 'Remontée', ms: 520, pose: pose({torso: 40, neck: -16, leadHip: 34, leadKnee: 64, rearHip: 4, rearKnee: 54, leadShoulder: -40, rearShoulder: -40, leadElbow: 0, rearElbow: 0}), cue: 'Ramener les pieds sous soi.'},
      {label: 'Garde', ms: 420, pose: pose({torso: 12, leadKnee: 28}), cue: 'Retour en garde basse.'}]}
];

export const sequenceById = id => sequences.find(s => s.id === id);
