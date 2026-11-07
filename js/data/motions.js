// Mouvements types des exercices d'entraînement (animations en boucle pendant la séance et sur la fiche exercice).
// Mêmes conventions que sequences.js (angles du profil, réglages 3D) ; corps de face (« carre »). Ce sont des
// illustrations du mouvement type, réglées à l'œil : l'exécution détaillée reste celle décrite dans l'exercice.
// `ground: true` : travail au sol ou avec un appui (mains, dos, genoux, mur ou barre, non dessinés).
import {sequences} from './sequences.js';

const STAND = {torso: 0, neck: 0, leadShoulder: 8, leadElbow: 12, rearShoulder: 8, rearElbow: 12, leadHip: 2, leadKnee: 4, leadAnkle: 0, rearHip: -2, rearKnee: 4, rearAnkle: 0};
const FACE = {turn: 0, chestTurn: 0, leadAbd: 6, rearAbd: 6, leadFootOut: 10, rearFootOut: 10, leadArmAbd: 10, rearArmAbd: 10};
const st = (over = {}, d3 = {}, x = 0, lift = 0) => ({x, lift, angles: {...STAND, ...over}, d3: {...FACE, ...d3}});
// Planche haute : corps gainé et incliné des mains (sous les épaules) aux pointes de pied, bras tendus.
const PLANK = {torso: 66, neck: -10, leadShoulder: -66, leadElbow: 0, rearShoulder: -66, rearElbow: 0, leadHip: -66, leadKnee: 0, leadAnkle: 0, rearHip: -66, rearKnee: 0, rearAnkle: 0};
const pl = (over = {}, d3 = {}) => ({x: 0, lift: 0, angles: {...PLANK, ...over}, d3: {...FACE, ...d3}});
// Allongé sur le dos (tête vers l'arrière), genoux pliés, pieds au sol.
const BACK = {torso: -90, neck: 20, leadShoulder: 180, leadElbow: 0, rearShoulder: 180, rearElbow: 0, leadHip: 135, leadKnee: 115, leadAnkle: -20, rearHip: 135, rearKnee: 115, rearAnkle: -20};
const bk = (over = {}, d3 = {}) => ({x: 0, lift: 0, angles: {...BACK, ...over}, d3: {...FACE, ...d3}});
const K = (label, ms, pose) => ms ? {label, ms, pose} : {label, pose};

export const motions = [
  {id: 'mvt-squat', name: 'Squat', keys: [K('Debout', 0, st()), K('Descente', 900, st({torso: 34, leadHip: 100, leadKnee: 118, leadAnkle: 28, rearHip: 96, rearKnee: 118, rearAnkle: 32, leadShoulder: 56, rearShoulder: 56, leadElbow: 0, rearElbow: 0})), K('Remontée', 800, st())]},
  {id: 'mvt-fente', name: 'Fente arrière', keys: [K('Debout', 0, st()), K('Fente', 900, st({torso: 4, leadHip: 82, leadKnee: 92, leadAnkle: 10, rearHip: -30, rearKnee: 104, rearAnkle: 64, leadShoulder: 10, rearShoulder: 10}, {leadAbd: 4, rearAbd: 4})), K('Retour', 800, st())]},
  {id: 'mvt-pompe', name: 'Pompe', ground: true, keys: [K('Bras tendus', 0, pl()), K('Descente', 900, pl({torso: 80, leadHip: -80, rearHip: -80, leadShoulder: -122, rearShoulder: -122, leadElbow: 42, rearElbow: 42})), K('Poussée', 800, pl())]},
  {id: 'mvt-pompe-mur', name: 'Pompe contre un mur', ground: true, keys: [K('Bras tendus', 0, st({torso: 24, leadShoulder: 66, rearShoulder: 66, leadElbow: 0, rearElbow: 0, leadAnkle: -20, rearAnkle: -20})),
    K('Flexion', 900, st({torso: 34, leadShoulder: 20, rearShoulder: 20, leadElbow: 100, rearElbow: 100, leadAnkle: -28, rearAnkle: -28})), K('Poussée', 800, st({torso: 24, leadShoulder: 66, rearShoulder: 66, leadElbow: 0, rearElbow: 0, leadAnkle: -20, rearAnkle: -20}))]},
  {id: 'mvt-traction', name: 'Traction', ground: true, keys: [K('Suspendu', 0, st({leadShoulder: 176, rearShoulder: 176, leadElbow: 0, rearElbow: 0, leadKnee: 30, rearKnee: 30}, {leadArmAbd: 20, rearArmAbd: 20}, 0, 40)),
    K('Tirage', 1000, st({leadShoulder: 140, rearShoulder: 140, leadElbow: 120, rearElbow: 120, leadKnee: 30, rearKnee: 30, neck: -10}, {leadArmAbd: 40, rearArmAbd: 40}, 0, 82)),
    K('Descente', 1100, st({leadShoulder: 176, rearShoulder: 176, leadElbow: 0, rearElbow: 0, leadKnee: 30, rearKnee: 30}, {leadArmAbd: 20, rearArmAbd: 20}, 0, 40))]},
  {id: 'mvt-suspension', name: 'Suspension', ground: true, keys: [K('Suspendu', 0, st({leadShoulder: 176, rearShoulder: 176, leadElbow: 0, rearElbow: 0, leadKnee: 20, rearKnee: 20}, {leadArmAbd: 20, rearArmAbd: 20}, 0, 40)),
    K('Gainé', 1600, st({leadShoulder: 172, rearShoulder: 172, leadElbow: 0, rearElbow: 0, leadKnee: 10, rearKnee: 10, torso: -4}, {leadArmAbd: 20, rearArmAbd: 20}, 0, 40)),
    K('Suspendu', 1600, st({leadShoulder: 176, rearShoulder: 176, leadElbow: 0, rearElbow: 0, leadKnee: 20, rearKnee: 20}, {leadArmAbd: 20, rearArmAbd: 20}, 0, 40))]},
  {id: 'mvt-rowing', name: 'Tirage buste penché', keys: [K('Bras tendus', 0, st({torso: 50, leadShoulder: -50, rearShoulder: -50, leadElbow: 0, rearElbow: 0, leadHip: 24, leadKnee: 30, rearHip: 20, rearKnee: 30})),
    K('Tirage', 800, st({torso: 50, leadShoulder: -104, rearShoulder: -104, leadElbow: 96, rearElbow: 96, leadHip: 24, leadKnee: 30, rearHip: 20, rearKnee: 30})), K('Retour', 900, st({torso: 50, leadShoulder: -50, rearShoulder: -50, leadElbow: 0, rearElbow: 0, leadHip: 24, leadKnee: 30, rearHip: 20, rearKnee: 30}))]},
  {id: 'mvt-tirage-ventre', name: 'Tirage allongé sur le ventre', ground: true, keys: [K('Bras devant', 0, pl({torso: 90, leadHip: -90, rearHip: -90, neck: -24, leadShoulder: 0, rearShoulder: 0, leadElbow: 0, rearElbow: 0})),
    K('Tirage', 900, pl({torso: 90, leadHip: -90, rearHip: -90, neck: -30, leadShoulder: -170, rearShoulder: -170, leadElbow: 160, rearElbow: 160}, {leadArmAbd: 70, rearArmAbd: 70})), K('Retour', 900, pl({torso: 90, leadHip: -90, rearHip: -90, neck: -24, leadShoulder: 0, rearShoulder: 0, leadElbow: 0, rearElbow: 0}))]},
  {id: 'mvt-dips', name: 'Dips sur chaise', ground: true, keys: [K('Bras tendus', 0, st({torso: 6, leadShoulder: -40, rearShoulder: -40, leadElbow: 0, rearElbow: 0, leadHip: 84, leadKnee: 70, rearHip: 84, rearKnee: 70}, {}, 0, 34)),
    K('Descente', 900, st({torso: 10, leadShoulder: -80, rearShoulder: -80, leadElbow: -80, rearElbow: -80, leadHip: 84, leadKnee: 80, rearHip: 84, rearKnee: 80}, {}, 0, 6)),
    K('Poussée', 800, st({torso: 6, leadShoulder: -40, rearShoulder: -40, leadElbow: 0, rearElbow: 0, leadHip: 84, leadKnee: 70, rearHip: 84, rearKnee: 70}, {}, 0, 34))]},
  {id: 'mvt-charniere', name: 'Charnière de hanche', keys: [K('Debout', 0, st()), K('Bascule', 1000, st({torso: 72, neck: -20, leadShoulder: -72, rearShoulder: -72, leadElbow: 0, rearElbow: 0, leadHip: -8, rearHip: -10, leadKnee: 14, rearKnee: 14})), K('Redressé', 900, st())]},
  {id: 'mvt-pont', name: 'Pont fessier', ground: true, keys: [K('Au sol', 0, bk()), K('Bassin haut', 900, bk({torso: -116, leadHip: 102, leadKnee: 96, leadAnkle: -6, rearHip: 102, rearKnee: 96, rearAnkle: -6})), K('Descente', 900, bk())]},
  {id: 'mvt-planche', name: 'Gainage sur les avant-bras', ground: true, keys: [K('Gainage', 0, pl({torso: 77, leadHip: -77, rearHip: -77, leadShoulder: -77, rearShoulder: -77, leadElbow: 90, rearElbow: 90})),
    K('Respiration', 1500, pl({torso: 75, leadHip: -75, rearHip: -75, leadShoulder: -75, rearShoulder: -75, leadElbow: 90, rearElbow: 90})), K('Gainage', 1500, pl({torso: 77, leadHip: -77, rearHip: -77, leadShoulder: -77, rearShoulder: -77, leadElbow: 90, rearElbow: 90}))]},
  {id: 'mvt-dead-bug', name: 'Dead bug', ground: true, keys: [K('Table', 0, bk({leadShoulder: 270, rearShoulder: 270, leadHip: 180, leadKnee: 90, rearHip: 180, rearKnee: 90, leadAnkle: 0, rearAnkle: 0})),
    K('Bras et jambe opposés', 1000, bk({leadShoulder: 340, rearShoulder: 270, leadHip: 180, leadKnee: 90, rearHip: 100, rearKnee: 0, leadAnkle: 0, rearAnkle: 0})),
    K('Table', 900, bk({leadShoulder: 270, rearShoulder: 270, leadHip: 180, leadKnee: 90, rearHip: 180, rearKnee: 90, leadAnkle: 0, rearAnkle: 0})),
    K('Autre côté', 1000, bk({leadShoulder: 270, rearShoulder: 340, leadHip: 100, leadKnee: 0, rearHip: 180, rearKnee: 90, leadAnkle: 0, rearAnkle: 0})),
    K('Table', 900, bk({leadShoulder: 270, rearShoulder: 270, leadHip: 180, leadKnee: 90, rearHip: 180, rearKnee: 90, leadAnkle: 0, rearAnkle: 0}))]},
  {id: 'mvt-chaise', name: 'Chaise contre le mur', ground: true, keys: [K('Chaise', 0, st({leadHip: 90, leadKnee: 90, leadAnkle: 0, rearHip: 90, rearKnee: 90, rearAnkle: 0, leadShoulder: 0, rearShoulder: 0, leadElbow: 0, rearElbow: 0})),
    K('Tenir', 1500, st({leadHip: 88, leadKnee: 88, leadAnkle: 0, rearHip: 88, rearKnee: 88, rearAnkle: 0, leadShoulder: 0, rearShoulder: 0, leadElbow: 0, rearElbow: 0})),
    K('Chaise', 1500, st({leadHip: 90, leadKnee: 90, leadAnkle: 0, rearHip: 90, rearKnee: 90, rearAnkle: 0, leadShoulder: 0, rearShoulder: 0, leadElbow: 0, rearElbow: 0}))]},
  {id: 'mvt-grimpeur', name: 'Grimpeur', ground: true, keys: [K('Planche', 0, pl()), K('Genou avant', 700, pl({leadHip: 6, leadKnee: 96, leadAnkle: 10})), K('Planche', 600, pl()), K('Genou arrière', 700, pl({rearHip: 6, rearKnee: 96, rearAnkle: 10})), K('Planche', 600, pl())]},
  {id: 'mvt-marche', name: 'Marche sur place', keys: [K('Pas', 0, st()), K('Genou gauche', 450, st({leadHip: 46, leadKnee: 64, leadAnkle: -10, rearShoulder: 30, leadShoulder: -14})), K('Pas', 400, st()),
    K('Genou droit', 450, st({rearHip: 46, rearKnee: 64, rearAnkle: -10, leadShoulder: 30, rearShoulder: -14})), K('Pas', 400, st())]},
  {id: 'mvt-course', name: 'Course sur place', keys: [K('Appui', 0, st({torso: 6, leadElbow: 90, rearElbow: 90})), K('Genou gauche', 260, st({torso: 6, leadHip: 70, leadKnee: 90, rearShoulder: 40, leadShoulder: -30, leadElbow: 90, rearElbow: 90}, {}, 0, 6)),
    K('Appui', 220, st({torso: 6, leadElbow: 90, rearElbow: 90})), K('Genou droit', 260, st({torso: 6, rearHip: 70, rearKnee: 90, leadShoulder: 40, rearShoulder: -30, leadElbow: 90, rearElbow: 90}, {}, 0, 6)), K('Appui', 220, st({torso: 6, leadElbow: 90, rearElbow: 90}))]},
  {id: 'mvt-saut', name: 'Petits sauts (corde)', keys: [K('Appui', 0, st({leadShoulder: -10, rearShoulder: -10, leadElbow: 60, rearElbow: 60, leadKnee: 10, rearKnee: 10, leadAnkle: 10, rearAnkle: 10}, {leadArmAbd: 30, rearArmAbd: 30})),
    K('En l’air', 220, st({leadShoulder: -14, rearShoulder: -14, leadElbow: 70, rearElbow: 70, leadAnkle: 30, rearAnkle: 30}, {leadArmAbd: 30, rearArmAbd: 30}, 0, 9)),
    K('Appui', 220, st({leadShoulder: -10, rearShoulder: -10, leadElbow: 60, rearElbow: 60, leadKnee: 10, rearKnee: 10, leadAnkle: 10, rearAnkle: 10}, {leadArmAbd: 30, rearArmAbd: 30}))]},
  {id: 'mvt-cercles-bras', name: 'Cercles de bras', keys: [K('Bas', 0, st({leadShoulder: 0, rearShoulder: 0, leadElbow: 0, rearElbow: 0})), K('Avant', 500, st({leadShoulder: 90, rearShoulder: 90, leadElbow: 0, rearElbow: 0})),
    K('Haut', 500, st({leadShoulder: 180, rearShoulder: 180, leadElbow: 0, rearElbow: 0})), K('Arrière', 500, st({leadShoulder: 270, rearShoulder: 270, leadElbow: 0, rearElbow: 0})), K('Bas', 500, st({leadShoulder: 360, rearShoulder: 360, leadElbow: 0, rearElbow: 0}))]},
  {id: 'mvt-balancier', name: 'Balancier de jambe', keys: [K('Debout', 0, st({leadShoulder: 0, rearShoulder: 0}, {leadArmAbd: 70, rearArmAbd: 70})), K('Arrière', 600, st({leadHip: -30, leadKnee: 10, leadShoulder: 0, rearShoulder: 0}, {leadArmAbd: 70, rearArmAbd: 70})),
    K('Avant', 700, st({leadHip: 60, leadKnee: 6, leadShoulder: 0, rearShoulder: 0}, {leadArmAbd: 70, rearArmAbd: 70})), K('Arrière', 700, st({leadHip: -30, leadKnee: 10, leadShoulder: 0, rearShoulder: 0}, {leadArmAbd: 70, rearArmAbd: 70})), K('Debout', 600, st({leadShoulder: 0, rearShoulder: 0}, {leadArmAbd: 70, rearArmAbd: 70}))]},
  {id: 'mvt-assis-ouverture', name: 'Assis, ouverture des hanches', ground: true, keys: [K('Assis', 0, st({torso: 10, leadHip: 80, leadKnee: 110, leadAnkle: 30, rearHip: 80, rearKnee: 110, rearAnkle: 30, leadShoulder: 30, rearShoulder: 30, leadElbow: 40, rearElbow: 40}, {leadAbd: 20, rearAbd: 20})),
    K('Ouverture', 1500, st({torso: 24, leadHip: 80, leadKnee: 110, leadAnkle: 30, rearHip: 80, rearKnee: 110, rearAnkle: 30, leadShoulder: 30, rearShoulder: 30, leadElbow: 40, rearElbow: 40}, {leadAbd: 55, rearAbd: 55})),
    K('Assis', 1500, st({torso: 10, leadHip: 80, leadKnee: 110, leadAnkle: 30, rearHip: 80, rearKnee: 110, rearAnkle: 30, leadShoulder: 30, rearShoulder: 30, leadElbow: 40, rearElbow: 40}, {leadAbd: 20, rearAbd: 20}))]},
  {id: 'mvt-fente-basse', name: 'Fente basse (étirement)', ground: true, keys: [K('Fente basse', 0, st({torso: 0, leadHip: 76, leadKnee: 96, leadAnkle: 14, rearHip: -40, rearKnee: 50, rearAnkle: -60, leadShoulder: 0, rearShoulder: 0})),
    K('Bassin vers l’avant', 1600, st({torso: -6, leadHip: 70, leadKnee: 104, leadAnkle: 20, rearHip: -50, rearKnee: 40, rearAnkle: -60, leadShoulder: 0, rearShoulder: 0}, {}, 6)),
    K('Fente basse', 1600, st({torso: 0, leadHip: 76, leadKnee: 96, leadAnkle: 14, rearHip: -40, rearKnee: 50, rearAnkle: -60, leadShoulder: 0, rearShoulder: 0}))]},
  {id: 'mvt-ischios', name: 'Jambe levée (arrière des cuisses)', ground: true, keys: [K('Allongé', 0, bk({leadHip: 100, leadKnee: 0, leadAnkle: 0, rearHip: 90, rearKnee: 0, rearAnkle: 0})),
    K('Jambe levée', 1500, bk({leadHip: 170, leadKnee: 4, leadAnkle: 0, rearHip: 90, rearKnee: 0, rearAnkle: 0})),
    K('Allongé', 1500, bk({leadHip: 100, leadKnee: 0, leadAnkle: 0, rearHip: 90, rearKnee: 0, rearAnkle: 0}))]},
  {id: 'mvt-chevilles', name: 'Genou vers l’avant (chevilles)', ground: true, keys: [K('Départ', 0, st({leadHip: 20, leadKnee: 30, leadAnkle: -14, rearHip: -26, rearKnee: 20, rearAnkle: 10, torso: 6, leadShoulder: 50, rearShoulder: 50, leadElbow: 20, rearElbow: 20})),
    K('Genou en avant', 1000, st({leadHip: 30, leadKnee: 70, leadAnkle: -40, rearHip: -26, rearKnee: 24, rearAnkle: 10, torso: 8, leadShoulder: 54, rearShoulder: 54, leadElbow: 20, rearElbow: 20})),
    K('Retour', 900, st({leadHip: 20, leadKnee: 30, leadAnkle: -14, rearHip: -26, rearKnee: 20, rearAnkle: 10, torso: 6, leadShoulder: 50, rearShoulder: 50, leadElbow: 20, rearElbow: 20}))]},
  {id: 'mvt-rotations', name: 'Rotations du haut du dos', keys: [K('Centre', 0, st({leadShoulder: 0, rearShoulder: 0, leadElbow: 0, rearElbow: 0}, {leadArmAbd: 80, rearArmAbd: 80})),
    K('Rotation gauche', 1000, st({leadShoulder: 0, rearShoulder: 0, leadElbow: 0, rearElbow: 0}, {leadArmAbd: 80, rearArmAbd: 80, chestTurn: 55})), K('Centre', 800, st({leadShoulder: 0, rearShoulder: 0, leadElbow: 0, rearElbow: 0}, {leadArmAbd: 80, rearArmAbd: 80})),
    K('Rotation droite', 1000, st({leadShoulder: 0, rearShoulder: 0, leadElbow: 0, rearElbow: 0}, {leadArmAbd: 80, rearArmAbd: 80, chestTurn: -55})), K('Centre', 800, st({leadShoulder: 0, rearShoulder: 0, leadElbow: 0, rearElbow: 0}, {leadArmAbd: 80, rearArmAbd: 80}))]},
  {id: 'mvt-chat-vache', name: 'Dos rond, dos creux', ground: true, keys: [K('Quatre pattes', 0, pl({torso: 90, leadShoulder: -90, rearShoulder: -90, neck: 0, leadHip: 0, leadKnee: 90, leadAnkle: -80, rearHip: 0, rearKnee: 90, rearAnkle: -80})),
    K('Dos rond', 1200, pl({torso: 82, leadShoulder: -82, rearShoulder: -82, neck: 50, leadHip: 4, leadKnee: 90, leadAnkle: -80, rearHip: 4, rearKnee: 90, rearAnkle: -80})),
    K('Dos creux', 1400, pl({torso: 96, leadShoulder: -96, rearShoulder: -96, neck: -40, leadHip: -4, leadKnee: 90, leadAnkle: -80, rearHip: -4, rearKnee: 90, rearAnkle: -80})),
    K('Quatre pattes', 1200, pl({torso: 90, leadShoulder: -90, rearShoulder: -90, neck: 0, leadHip: 0, leadKnee: 90, leadAnkle: -80, rearHip: 0, rearKnee: 90, rearAnkle: -80}))]},
  {id: 'mvt-equilibre', name: 'Équilibre sur une jambe', keys: [K('Debout', 0, st({leadShoulder: 0, rearShoulder: 0, leadElbow: 0, rearElbow: 0}, {leadArmAbd: 60, rearArmAbd: 60})),
    K('Genou levé', 900, st({leadHip: 70, leadKnee: 90, leadAnkle: 10, leadShoulder: 0, rearShoulder: 0, leadElbow: 0, rearElbow: 0}, {leadArmAbd: 70, rearArmAbd: 70, rearAbd: 0})),
    K('Tenir', 1600, st({leadHip: 72, leadKnee: 90, leadAnkle: 10, leadShoulder: 0, rearShoulder: 0, leadElbow: 0, rearElbow: 0, torso: 2}, {leadArmAbd: 66, rearArmAbd: 74, rearAbd: 0})),
    K('Retour', 800, st({leadShoulder: 0, rearShoulder: 0, leadElbow: 0, rearElbow: 0}, {leadArmAbd: 60, rearArmAbd: 60}))]},
  {id: 'mvt-respiration', name: 'Respiration lente', keys: [K('Expiré', 0, st({leadShoulder: 0, rearShoulder: 0, leadElbow: 10, rearElbow: 10})), K('Inspiration', 3000, st({leadShoulder: 120, rearShoulder: 120, leadElbow: 10, rearElbow: 10, neck: -8}, {leadArmAbd: 30, rearArmAbd: 30})),
    K('Expiration', 4000, st({leadShoulder: 0, rearShoulder: 0, leadElbow: 10, rearElbow: 10}))]},
  {id: 'mvt-etirement', name: 'Étirement en flexion avant', keys: [K('Debout', 0, st({leadShoulder: 170, rearShoulder: 170, leadElbow: 0, rearElbow: 0})),
    K('Flexion avant', 1800, st({torso: 84, neck: 30, leadShoulder: -80, rearShoulder: -80, leadElbow: 0, rearElbow: 0, leadHip: -10, rearHip: -12, leadKnee: 16, rearKnee: 16})), K('Redressé', 1800, st({leadShoulder: 170, rearShoulder: 170, leadElbow: 0, rearElbow: 0}))]}
].map(m => ({...m, style: 'carre', track: []}));

// Exercice → mouvement type (ou geste martial du moteur). `approx` : l'animation ne montre qu'une idée du mouvement.
export const EXERCISE_MOTION = {
  'mobilisation-articulaire': ['mvt-cercles-bras', true], 'marche-sur-place': ['mvt-marche'], 'montee-progressive': ['mvt-course', true], 'cercles-bras-epaules': ['mvt-cercles-bras'],
  'balancier-jambes': ['mvt-balancier'], 'squat-poids-corps': ['mvt-squat'], 'squat-goblet': ['mvt-squat'], 'fente-arriere': ['mvt-fente'], pompes: ['mvt-pompe'], 'pompes-genoux': ['mvt-pompe', true],
  'pompes-mur': ['mvt-pompe-mur'], tractions: ['mvt-traction'], 'suspension-barre': ['mvt-suspension'], 'tirage-allonge-ventre': ['mvt-tirage-ventre'], 'rowing-elastique': ['mvt-rowing'],
  'rowing-haltere': ['mvt-rowing', true], 'dips-chaise': ['mvt-dips'], 'charniere-hanche': ['mvt-charniere'], 'souleve-roumain-halteres': ['mvt-charniere'], 'souleve-roumain-kettlebell': ['mvt-charniere'],
  'pont-fessier': ['mvt-pont'], 'gainage-planche': ['mvt-planche'], 'gainage-lateral': ['mvt-planche', true], 'dead-bug': ['mvt-dead-bug'], 'chaise-murale': ['mvt-chaise'], 'grimpeur-lent': ['mvt-grimpeur'],
  'marche-rapide': ['mvt-marche'], 'corde-a-sauter': ['mvt-saut'], 'shadow-leger': ['direct-avant'], 'intervalles-doux': ['mvt-course'], 'hanches-90-90': ['mvt-assis-ouverture', true],
  'fente-basse-flechisseurs': ['mvt-fente-basse'], 'papillon-adducteurs': ['mvt-assis-ouverture'], 'ischios-allonge': ['mvt-ischios'], 'chevilles-genou-mur': ['mvt-chevilles'],
  'rotations-thoraciques': ['mvt-rotations', true], 'chat-vache': ['mvt-chat-vache'], 'equilibre-unipodal': ['mvt-equilibre'], 'pas-croises': ['pas-glisse', true], 'echelle-au-sol': ['mvt-course', true],
  'deplacements-en-garde': ['pas-glisse'], 'reaction-signal': ['esquive-laterale', true], 'balle-contre-mur': ['direct-arriere', true], 'respiration-lente': ['mvt-respiration'],
  'marche-retour-calme': ['mvt-marche'], 'etirements-doux': ['mvt-etirement']
};

const all = () => [...motions, ...sequences];
export function motionFor(exerciseId) {
  const m = EXERCISE_MOTION[exerciseId];
  if (!m) return null;
  const seq = all().find(s => s.id === m[0]);
  return seq ? {seq, approx: Boolean(m[1])} : null;
}
