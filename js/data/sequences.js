// Mouvements du moteur — VERSION 2 (17/11/2026). Garde « pied gauche devant » ; repère : x vers la cible, z vers le côté avant.
// Corrigés d'après un audit chiffré de la version 1 (tools/realisme.mjs) et des repères de biomécanique (docs/MOUVEMENTS_V2.md) :
// chaque pose est construite à partir de ce qui compte (pieds et mains au sol, bassin, centre de masse) et les angles des
// membres s'en déduisent (engine/build.js) ; un pied posé reste où il est, le poids passe au-dessus du pied d'appui avant de
// lever l'autre jambe, les rotations partent des hanches, les durées sont celles d'un geste réel (le lecteur ralentit à volonté).
// La version 1 est conservée telle quelle dans data/sequences-v1.js. Ce sont des illustrations plausibles, pas des gestes
// validés : relecture par un pratiquant qualifié recommandée, indispensable pour la chute, le sprawl et le coup de pied retourné.
import {FOOT_FLAT} from '../engine/body3d.js';
import {move, over, hands, foot, at, cm} from '../engine/build.js';

const GUARD = {torso: 8, neck: -6, leadShoulder: 26, leadElbow: 128, rearShoulder: 8, rearElbow: 146,
  leadHip: 18, leadKnee: 22, leadAnkle: 0, rearHip: -22, rearKnee: 6, rearAnkle: 0};
const pose = (over = {}, x = 0, lift = 0) => ({x, lift, angles: {...GUARD, ...over}});
const FENCE = {torso: 0, neck: 0, leadShoulder: 52, leadElbow: 22, rearShoulder: -100, rearElbow: -80,
  leadHip: 30, leadKnee: 40, leadAnkle: 10, rearHip: -20, rearKnee: 0, rearAnkle: 20};
const KARA = {torso: 0, neck: 0, leadShoulder: 70, leadElbow: 10, rearShoulder: -28, rearElbow: 112,
  leadHip: 40, leadKnee: 46, leadAnkle: 6, rearHip: -28, rearKnee: 0, rearAnkle: 28};
const withAngles = (p, angles) => ({...p, angles: {...p.angles, ...angles}});
const rad = Math.PI / 180;

// ——— Bases ———
const G0 = move('boxe', pose(), {drop: 0.02, d3: {rearLegRot: 30, leadPronation: 30, rearPronation: 30}});   // garde de boxe : genoux souples (le genou arrière suit son pied), talon arrière levé, poings un peu tournés (articulations vers l'avant)
// Garde d'escrime : genoux fléchis (le genou arrière plie au-dessus du pied arrière, tourné), pied arrière à plat.
const F0 = move('escrime', {x: 0, lift: 0, angles: {...FENCE}}, {drop: 0.06, d3: {rearLegRot: 75}, feet: {rear: {pitch: FOOT_FLAT}}});
// Posture avant de karaté (zenkutsu-dachi) en hanmi : hanches à 45°, pied arrière à plat, poing arrière à la hanche.
const K0 = move('karate', {x: 0, lift: 0, angles: {...KARA}}, {d3: {turn: 45, leadPronation: 78, rearPronation: -78}, feet: {rear: {pitch: FOOT_FLAT, on: 'Heel'}}});

// ——— Coups de pied de face : poids sur la jambe arrière (talon posé), puis jambe avant libre ———
// Le bassin passe d'abord au-dessus de l'avant-pied arrière (genou levé), puis le talon d'appui se pose (rot : genou d'appui
// tourné comme son pied) et le centre de masse se centre sur le pied ; l'extension garde le centre de masse au-dessus de lui.
const kick = (style, ref, chamber, extend, rot) => {
  const shift = over(style, move(style, ref, {drop: 0.02, feet: {lead: {on: 'Toe', pitch: 66}}}), 'rear', {aim: 0.8, part: 0.4});   // transfert partiel : talon avant levé, genoux un peu fléchis
  const onBall = over(style, withAngles(shift, chamber), 'rear', {free: ['lead'], aim: 0.8});
  const armed = over(style, move(style, onBall, {feet: {rear: {pitch: FOOT_FLAT, on: 'Toe'}}, d3: {rearLegRot: rot}, free: ['lead']}), 'rear', {free: ['lead']});
  return {shift, armed, out: over(style, withAngles(armed, extend), 'rear', {free: ['lead']})};
};
const FK = kick('boxe', G0, {torso: 2, leadHip: 82, leadKnee: 100, leadAnkle: -10}, {torso: -6, leadHip: 66, leadKnee: 6, leadAnkle: -35}, 35);
const T0 = move('carre', pose({torso: 2, rearHip: -20, rearKnee: 10}));   // recalée au sol (pied en deux segments)
const TK = kick('carre', T0, {torso: -6, leadHip: 86, leadKnee: 106, leadAnkle: 4}, {torso: -18, leadHip: 82, leadKnee: 4, leadAnkle: 6}, 22);

// ——— Coup de pied retourné (version 3, nuit du 17 au 18/11/2026) : tour complet sur l'avant-pied avant, posé au même endroit ———
// Référence retenue (docs/SQUELETTE_V3.md, § 3) : coup de pied retourné en arrière (ushiro geri, dwi chagi) à vide, garde
// « pied gauche devant », jambe arrière, hauteur moyenne, frappe du talon ; le tour se finit dans la garde de départ.
// Le pied d'appui pivote sur l'avant-pied (talon levé qui tourne autour de lui) et son genou le suit ; la tête part la première
// et garde la cible en vue, les épaules suivent, puis le bassin (décalages `timing`) ; le bassin tourne en arc autour de
// l'avant-pied (`pivot`) ; le talon d'appui se pose à la frappe, puis se relève pour finir le tour.
const PIV = at('boxe', G0).leadToe;
const spin = (face, {angles = {}, d3 = {}, pitch = 62, aim = 0.92, drop = 0} = {}) => {
  const c = Math.cos(face * rad), s = Math.sin(face * rad), rx = -PIV[0], rz = -PIV[2];   // bassin tourné autour de l'avant-pied
  const p = move('boxe', withAngles(G0, angles), {x: cm((PIV[0] + rx * c + rz * s) * 100), z: cm((PIV[2] - rx * s + rz * c) * 100), drop,
    d3: {face, ...d3}, feet: {lead: {on: 'Toe', pitch}}, free: ['rear']});
  return over('boxe', p, 'lead', {aim, free: ['rear']});
};
// Armé, poussée, frappe : le talon arrière va en ligne droite de l'armé à la cible (poussée placée au milieu de la ligne).
const ARME = spin(160, {angles: {torso: 30, neck: -12, rearHip: 65, rearKnee: 135, rearAnkle: 10}, d3: {turn: 6, chestTurn: 42, headTurn: 126, leadFootOut: 2, leadLegRot: -2, rearFootOut: 0, rearLegRot: 0}});
const FRAPPE = spin(180, {pitch: FOOT_FLAT, aim: 0.8, drop: 0.03, angles: {torso: 62, neck: -25, rearHip: -91, rearKnee: 3, rearAnkle: 8}, d3: {turn: 0, chestTurn: 40, headTurn: 118, leadFootOut: 0, leadLegRot: 0, rearFootOut: 0, rearLegRot: 0}});
const LINE = [at('boxe', ARME).rearHeel, at('boxe', FRAPPE).rearHeel];
const POUSSEE = foot('boxe', spin(172, {pitch: 72, aim: 0.75, drop: 0.015, angles: {torso: 48, neck: -18, rearHip: -30, rearKnee: 70, rearAnkle: 9}, d3: {turn: 3, chestTurn: 41, headTurn: 123, leadFootOut: 1, leadLegRot: -1, rearFootOut: 0, rearLegRot: 0}}),
  'rear', LINE[0].map((v, i) => (v + LINE[1][i]) / 2));

// ——— Chute arrière : debout, accroupi, assis près des talons, roulé sur le haut du dos (bras qui frappent le sol) ———
const D0 = move('carre', pose({torso: 4, leadHip: 6, leadKnee: 8, rearHip: -6, rearKnee: 8, leadShoulder: 30, rearShoulder: 30, leadElbow: 30, rearElbow: 30}),
  {drop: 0.02, feet: {lead: {pitch: FOOT_FLAT, on: 'Toe'}, rear: {pitch: FOOT_FLAT, on: 'Toe'}}});   // genoux souples : les deux pieds à plat au sol
const D1 = over('carre', move('carre', D0, {drop: 0.42, angles: {torso: 36, neck: 30, leadShoulder: 64, rearShoulder: 64, leadElbow: 8, rearElbow: 8},
  d3: {leadLegRot: 14, rearLegRot: 26}, feet: {lead: {on: 'Toe', pitch: 55}, rear: {on: 'Toe', pitch: 55}}}), 'both', {aim: 1});   // accroupi en équilibre sur les avant-pieds
const jD0 = at('carre', D0), heelX = (jD0.leadHeel[0] + jD0.rearHeel[0]) / 2;
const D2 = move('carre', D1, {x: cm((heelX - 0.32) * 100), drop: at('carre', D1).pelvis[1] - 0.115, angles: {torso: 6, neck: 42, leadShoulder: 70, rearShoulder: 70},
  feet: {lead: {on: 'Toe', pitch: FOOT_FLAT}, rear: {on: 'Toe', pitch: FOOT_FLAT}}});
// Jambes écartées (genoux ouverts) pour limiter leur contact en roulant ; réglage cherché par calcul (tools/realisme.mjs).
const D3up = {x: D2.x - cm(26), lift: 0, angles: {torso: -100, neck: 52, leadHip: 150, leadKnee: 90, leadAnkle: 10, rearHip: 147, rearKnee: 90, rearAnkle: 10,
  leadShoulder: 120, rearShoulder: 120, leadElbow: 0, rearElbow: 0}, d3: {leadArmAbd: 60, rearArmAbd: 60, leadAbd: -25, rearAbd: -25, leadLegRot: 40, rearLegRot: 40}};
const jD3 = at('carre', D3up);
const D3 = hands('carre', D3up, {lead: [jD3.leadShoulder[0] + 0.22, jD3.leadShoulder[2] + 0.42], rear: [jD3.rearShoulder[0] + 0.22, jD3.rearShoulder[2] - 0.42]});

// ——— Sprawl : mains posées devant, jambes projetées loin en arrière, hanches basses ———
const P0 = move('carre', pose({torso: 12, leadKnee: 28}), {drop: 0.02});   // genoux un peu fléchis : les deux pieds touchent le sol
const jP0 = at('carre', P0), handX = jP0.leadToe[0] + 0.16;
const S1 = hands('carre', move('carre', P0, {drop: 0.4, angles: {torso: 70, neck: -30}, d3: {leadLegRot: 14, rearLegRot: 26}, feet: {lead: {on: 'Toe', pitch: 60}, rear: {on: 'Toe', pitch: 60}}}), {lead: [handX, 0.21], rear: [handX, -0.21]});
const jS1 = at('carre', S1), hipX = handX - 0.42, toeX = hipX - 0.65;
const S2 = hands('carre', move('carre', S1, {x: S1.x + cm((hipX - jS1.pelvis[0]) * 100), drop: jS1.pelvis[1] - 0.28, angles: {torso: 58, neck: -36, leadShoulder: 0, rearShoulder: 0, leadElbow: 120, rearElbow: 120},
  feet: {lead: {on: 'Toe', pitch: 35, dx: toeX - jS1.leadToe[0]}, rear: {on: 'Toe', pitch: 35, dx: toeX - 0.04 - jS1.rearToe[0]}}}), {lead: [handX, 0.21], rear: [handX, -0.21]});

const REVIEW = ' Relecture par un pratiquant qualifié indispensable avant de s’en servir comme modèle.';
export const sequences = [
  {id: 'garde', name: 'Garde et répartition du poids', track: ['head', 'pelvis'],
    note: 'Pose quasi statique : le bassin avance puis recule de 3 cm, les pieds restent posés.',
    keys: [
      {label: 'Garde', pose: G0, cue: 'Appuis décalés, genoux souples, mains hautes, talon arrière à peine levé.'},
      {label: 'Poids vers l’avant', ms: 900, pose: move('boxe', G0, {x: cm(3), angles: {torso: 11}}), cue: 'Le bassin avance de 3 cm : le genou avant plie un peu plus, les pieds ne bougent pas.'},
      {label: 'Poids vers l’arrière', ms: 1100, pose: move('boxe', G0, {x: cm(-3), angles: {torso: 5}}), cue: 'Puis recule vers le pied arrière, sans se redresser.'},
      {label: 'Retour', ms: 900, pose: G0, cue: 'Retour à une répartition confortable.'}]},
  {id: 'pas-glisse', name: 'Pas glissé avant', track: ['leadToe', 'pelvis'],
    note: 'Le pied avant glisse, le pied arrière suit d’autant : la garde est retrouvée 20 cm plus loin.',
    keys: [
      {label: 'Garde', pose: G0, cue: 'Partir d’une garde stable.'},
      {label: 'Pied avant', ms: 280, glisse: ['lead'], pose: move('boxe', G0, {x: cm(10), feet: {lead: {dx: 0.2}}}), cue: 'Le pied arrière pousse : le pied avant glisse de 20 cm en rasant le sol ; le bassin suit à moitié.'},
      {label: 'Pied arrière suit', ms: 260, glisse: ['rear'], pose: move('boxe', G0, {x: cm(20), feet: {lead: {dx: 0.2}, rear: {dx: 0.2}}}), cue: 'Le pied arrière glisse d’autant, sans croiser : même écart qu’au départ.'}]},
  {id: 'pas-arriere', name: 'Pas arrière (retrait)', track: ['rearToe', 'pelvis'],
    note: 'Le pied arrière recule en premier, le pied avant suit d’autant.',
    keys: [
      {label: 'Garde', pose: G0, cue: 'Garde stable.'},
      {label: 'Pied arrière recule', ms: 280, pose: move('boxe', G0, {x: cm(-10), feet: {rear: {dx: -0.2}}}), cue: 'Le pied avant pousse : le pied arrière recule de 20 cm, à peine levé.'},
      {label: 'Pied avant suit', ms: 260, pose: move('boxe', G0, {x: cm(-20), feet: {lead: {dx: -0.2}, rear: {dx: -0.2}}}), cue: 'Le pied avant revient d’autant ; l’écart est retrouvé, mains hautes.'}]},
  {id: 'direct-avant', name: 'Direct avant à vide', track: ['leadWrist', 'head'],
    note: 'Aller-retour de la main avant à vitesse réelle (environ 5 m/s au plus vite) ; ralentir le lecteur pour l’étudier.',
    keys: [
      {label: 'Garde', pose: G0, cue: 'Garde relâchée.'},
      {label: 'Extension', ms: 130, phase: 'Extension', pose: move('boxe', G0, {x: cm(2.5), angles: {torso: 12, neck: 4, leadShoulder: 78, leadElbow: 6}, d3: {turn: 33, chestTurn: 16, leadPronation: 75, leadArmRot: -15}}),
        cue: 'Le poing part en ligne droite à hauteur d’épaule ; le buste tourne un peu pour allonger l’épaule avant, menton baissé, coude non verrouillé ; l’autre main reste au visage.'},
      {label: 'Retour', ms: 170, phase: 'Retour', pose: G0, cue: 'Le poing revient par le même chemin, aussi vite qu’il est parti.'}]},
  {id: 'esquive-laterale', name: 'Esquive latérale (flexion et inclinaison)', track: ['head'],
    note: 'La tête sort de la ligne d’attaque : flexion des genoux, poids vers la jambe arrière, buste penché sur le côté.',
    keys: [
      {label: 'Garde', pose: G0, cue: 'Garde stable.'},
      {label: 'Esquive', ms: 220, pose: move('boxe', G0, {drop: 0.06, z: cm(-1), x: cm(1), angles: {torso: 14, neck: -6}, d3: {lean: -13, chestTurn: 16, rearLegRot: 35}, feet: {rear: {pitch: FOOT_FLAT, on: 'Toe'}}}),
        cue: 'Fléchir les genoux, glisser le poids vers la jambe arrière et pencher le buste : la tête sort de la ligne, le regard reste devant.'},
      {label: 'Retour', ms: 260, pose: G0, cue: 'Retrouver la garde sans se relever d’un coup.'}]},
  {id: 'coup-pied-avant', name: 'Coup de pied de face bas, à vide', track: ['leadToe', 'head'],
    note: 'Le poids passe d’abord sur la jambe d’appui ; bas et contrôlé : l’objectif est l’équilibre, pas la hauteur.',
    keys: [
      {label: 'Garde', pose: G0, cue: 'Garde stable.'},
      {label: 'Transfert', ms: 220, passe: true, pose: FK.shift, cue: 'Le poids passe sur la jambe arrière ; le talon avant se lève.'},
      {label: 'Armé', ms: 200, passe: true, pose: FK.armed, cue: 'Le genou avant monte devant soi, le talon d’appui se pose ; le centre de masse reste au-dessus du pied d’appui.'},
      {label: 'Extension basse', ms: 140, pose: FK.out, cue: 'La jambe s’étend à hauteur de ventre sans claquer le genou ; le buste recule un peu en contrepoids.'},
      {label: 'Ré-armé', ms: 150, passe: true, pose: FK.armed, cue: 'Ramener le genou.'},
      {label: 'Pied reposé', ms: 200, passe: true, pose: FK.shift, cue: 'Reposer l’avant-pied à sa place, le poids encore sur la jambe arrière.'},
      {label: 'Garde', ms: 220, pose: G0, cue: 'Le poids revient au centre : garde retrouvée.'}]},
  {id: 'escrime-garde', style: 'escrime', name: 'Garde d’escrime et marche', track: ['pelvis', 'leadWrist'],
    note: 'Garde de profil, genoux fléchis ; la marche avance le pied avant (talon d’abord) puis ramène le pied arrière.',
    keys: [
      {label: 'En garde', pose: F0, cue: 'De profil, genoux fléchis au-dessus des pieds, bras armé devant, bras arrière relevé.'},
      {label: 'Pied avant', ms: 220, pose: move('escrime', F0, {x: cm(8), feet: {lead: {dx: 0.3, pitch: 100, on: 'Heel'}}}), cue: 'La pointe se lève, le pied avant avance de 30 cm et se pose talon d’abord ; le pied arrière ne bouge pas.'},
      {label: 'Pointe posée', ms: 80, pose: move('escrime', F0, {x: cm(10), feet: {lead: {dx: 0.3}}}), cue: 'La pointe du pied avant se pose.'},
      {label: 'Pied arrière', ms: 220, pose: {...F0, x: cm(30)}, cue: 'Le pied arrière suit d’autant, à peine levé : même écart, sans se redresser.'}]},
  {id: 'escrime-fente', style: 'escrime', name: 'Fente d’escrime (à vide)', track: ['leadWrist', 'pelvis'],
    note: 'Le bras s’allonge d’abord, puis la jambe avant part tendue ; la jambe arrière pousse et se tend, pied à plat. Pied avant posé 70 cm plus loin, genou au-dessus du talon.',
    keys: [
      {label: 'En garde', pose: F0, cue: 'Garde stable.'},
      {label: 'Bras allongé', ms: 160, pose: move('escrime', F0, {angles: {leadShoulder: 86, leadElbow: 2}}), cue: 'Le bras armé s’allonge en premier ; les jambes n’ont pas encore bougé.'},
      {label: 'Envol', ms: 180, passe: true, pose: move('escrime', withAngles(F0, {leadShoulder: 88, leadElbow: 0, leadHip: 46, leadKnee: 10, leadAnkle: 4}), {x: cm(16), free: ['lead'], angles: {torso: 2, rearShoulder: -76, rearElbow: -40}, d3: {turn: 56}}),
        cue: 'La pointe du pied avant se lève, la jambe avant part presque tendue ; la jambe arrière pousse.'},
      {label: 'Fente', ms: 160, pose: move('escrime', F0, {x: cm(43), drop: 0.32, feet: {lead: {dx: 0.7}}, angles: {torso: 4, leadShoulder: 88, leadElbow: 0, rearShoulder: -50, rearElbow: 0}, d3: {turn: 45}}),
        cue: 'Le pied avant se pose, le genou freine au-dessus du talon ; la jambe arrière est tendue, son pied reste à plat ; le bras arrière descend.'},
      {label: 'Retour en garde', ms: 450, pose: F0, cue: 'La jambe avant repousse et revient : garde retrouvée, au même endroit.'}]},
  {id: 'direct-arriere', name: 'Direct arrière à vide', track: ['rearWrist', 'head'],
    note: 'La hanche arrière part la première, puis les épaules, puis le bras (des hanches vers le poing) ; le talon arrière pivote.',
    keys: [
      {label: 'Garde', pose: G0, cue: 'Garde relâchée, poids réparti.'},
      {label: 'Rotation', ms: 70, passe: true, phase: 'Déclenchement', timing: {bassin: [0, 0.8], tronc: [0.1, 1]}, pose: move('boxe', G0, {x: cm(1.5), angles: {torso: 10, rearShoulder: 38, rearElbow: 92}, d3: {turn: 16, chestTurn: -4, rearFootOut: 28, rearPronation: 45}, feet: {rear: {pitch: 58, on: 'Toe'}}}),
        cue: 'Le talon arrière se lève et pivote vers l’extérieur, la hanche arrière avance ; le bras commence à partir.'},
      {label: 'Extension', ms: 90, phase: 'Extension', pose: move('boxe', G0, {x: cm(4), angles: {torso: 14, neck: 4, rearShoulder: 76, rearElbow: 6, leadElbow: 140}, d3: {turn: 4, chestTurn: -22, rearFootOut: 12, rearArmAbd: 4, rearPronation: 78}, feet: {rear: {pitch: 50, on: 'Toe'}}}),
        cue: 'Les épaules finissent de tourner, le bras arrière s’allonge vers la cible sans verrouiller le coude ; la main avant reste au menton.'},
      {label: 'Retour', ms: 190, phase: 'Retour', pose: G0, cue: 'Retour par le même chemin, talon reposé, garde retrouvée.'}]},
  {id: 'changement-niveau', style: 'carre', name: 'Changement de niveau', track: ['head', 'pelvis'],
    note: 'Descendre par les jambes, genoux au-dessus des pieds, dos long, regard devant : base d’une entrée en saisie.',
    keys: [
      {label: 'Garde haute', pose: move('carre', pose({leadShoulder: 40, leadElbow: 100, rearShoulder: 30, rearElbow: 110})), cue: 'Garde haute, appuis écartés.'},
      {label: 'Niveau bas', ms: 360, pose: move('carre', pose({leadShoulder: 40, leadElbow: 100, rearShoulder: 30, rearElbow: 110}), {drop: 0.24, x: cm(-3),
        angles: {torso: 26, neck: -24, leadShoulder: 52, leadElbow: 88, rearShoulder: 42, rearElbow: 98}, d3: {leadLegRot: 12, rearLegRot: 25}}), cue: 'Les genoux plient au-dessus des pieds, les hanches descendent de 24 cm, le dos reste long, la tête haute.'},
      {label: 'Remontée', ms: 420, pose: move('carre', pose({leadShoulder: 40, leadElbow: 100, rearShoulder: 30, rearElbow: 110})), cue: 'Remonter en poussant dans le sol, garde conservée.'}]},
  {id: 'teep', style: 'carre', name: 'Teep (coup de pied poussé), à vide', track: ['leadToe', 'head'],
    note: 'Poids d’abord sur la jambe d’appui, armé du genou, poussée de la plante du pied (pied fléchi), retour en garde.',
    keys: [
      {label: 'Garde', pose: T0, cue: 'Garde droite.'},
      {label: 'Transfert', ms: 220, passe: true, pose: TK.shift, cue: 'Le poids passe sur la jambe arrière ; le talon avant se lève.'},
      {label: 'Armé', ms: 200, passe: true, pose: TK.armed, cue: 'Le genou monte devant soi, pied fléchi ; le talon d’appui se pose.'},
      {label: 'Poussée', ms: 160, pose: TK.out, cue: 'Pousser avec la plante du pied, semelle vers la cible, hanche vers l’avant, buste en arrière en contrepoids.'},
      {label: 'Ré-armé', ms: 170, passe: true, pose: TK.armed, cue: 'Ramener le genou.'},
      {label: 'Pied reposé', ms: 200, passe: true, pose: TK.shift, cue: 'Reposer l’avant-pied à sa place, le poids encore sur la jambe arrière.'},
      {label: 'Garde', ms: 220, pose: T0, cue: 'Le poids revient : garde retrouvée.'}]},
  {id: 'gyaku-zuki', style: 'karate', name: 'Gyaku-zuki (coup de poing opposé), à vide', track: ['rearWrist', 'pelvis'],
    note: 'Posture avant longue, hanches à 45° ; les hanches tournent de face pendant que le poing arrière part de la hanche et que l’autre y revient.',
    keys: [
      {label: 'Posture avant', pose: K0, cue: 'Jambe avant fléchie, jambe arrière tendue, pied arrière à plat ; hanches à 45°, poing arrière à la hanche.'},
      {label: 'Départ', ms: 90, passe: true, phase: 'Déclenchement', timing: {bassin: [0, 1], bras: [0.15, 1]}, pose: move('karate', K0, {angles: {rearShoulder: 24, rearElbow: 96, leadShoulder: 30, leadElbow: 70}, d3: {turn: 26, rearPronation: -70, leadPronation: 70}}),
        cue: 'Les hanches commencent à tourner ; le poing arrière quitte la hanche, l’avant commence à revenir.'},
      {label: 'Impact à vide', ms: 110, phase: 'Extension', pose: move('karate', K0, {angles: {rearShoulder: 86, rearElbow: 4, leadShoulder: -28, leadElbow: 112}, d3: {turn: 0, rearArmAbd: 2, rearPronation: 78, leadPronation: -78, rearArmRot: -12}}),
        cue: 'Hanches de face, bras tendu à hauteur de plexus, poing tourné paume vers le bas à la fin ; l’autre poing revient à la hanche, paume vers le haut.'},
      {label: 'Retour', ms: 420, phase: 'Retour', pose: K0, cue: 'Revenir lentement en posture.'}]},
  {id: 'crochet', name: 'Crochet avant, à vide', track: ['leadWrist', 'head'],
    note: 'Le talon avant pivote, les hanches puis les épaules tournent vers l’intérieur et portent le bras plié en arc à hauteur de menton.',
    keys: [
      {label: 'Garde', pose: G0, cue: 'Garde haute, coude avant près du corps.'},
      {label: 'Départ', ms: 70, passe: true, phase: 'Déclenchement', timing: {jambes: [0, 0.8], bassin: [0.05, 1], tronc: [0.1, 1]}, pose: move('boxe', G0, {x: cm(1), angles: {torso: 10, leadShoulder: 6, leadElbow: 100}, d3: {leadArmAbd: 70, turn: 34, chestTurn: 10, leadPronation: 60}, feet: {lead: {pitch: 75, on: 'Toe'}}}),
        cue: 'Le talon avant se lève, la hanche avant commence à tourner, le coude monte à hauteur d’épaule.'},
      {label: 'Crochet', ms: 110, pose: move('boxe', G0, {x: cm(2), angles: {torso: 10, neck: 4, leadShoulder: 42, leadElbow: 95, rearShoulder: 60, rearElbow: 110}, d3: {leadArmAbd: 85, rearArmAbd: 50, turn: 58, chestTurn: 0, leadFootOut: -12, leadLegRot: -6, leadPronation: 78}, feet: {lead: {pitch: 70, on: 'Toe'}}}),
        cue: 'Le pied avant pivote sur l’avant-pied, hanches et épaules tournent : le bras plié balaie à hauteur de menton.'},
      {label: 'Retour', ms: 180, pose: move('boxe', G0, {feet: {lead: {pitch: 70, on: 'Toe'}}}), cue: 'Les hanches reviennent, le bras retrouve la garde, menton protégé.'},
      {label: 'Garde', ms: 70, pose: G0, cue: 'Le talon avant se repose.'}]},
  {id: 'coup-pied-retourne', name: 'Coup de pied retourné, à vide', track: ['rearToe', 'head'],
    note: 'Tour complet sur l’avant-pied avant, posé au même endroit : la tête part la première et garde la cible en vue, puis les épaules et le bassin ; le talon d’appui se pose à la frappe, le talon arrière part en ligne droite vers la cible ; le tour se finit en garde. Geste avancé : lentement, à vide, sur sol sûr.' + REVIEW,
    keys: [
      {label: 'Garde', pose: G0, cue: 'Garde stable.'},
      {label: 'Regard', ms: 190, passe: true, phase: 'Préparation et transfert', timing: {tete: [0, 0.7], tronc: [0.1, 1], bassin: [0, 1], bras: [0.15, 1]},
        pose: over('boxe', move('boxe', G0, {drop: 0.06, angles: {torso: 10}, d3: {turn: 40, chestTurn: 16, headTurn: 45}, feet: {lead: {on: 'Toe', pitch: 66}}}), 'lead', {aim: 0.85, part: 0.7}),
        cue: 'La tête tourne la première vers l’épaule arrière ; le poids passe sur l’avant-pied avant, puis le pied arrière quitte le sol.'},
      {label: 'Pivot', ms: 210, passe: true, pivot: 'lead', phase: 'Déclenchement', timing: {tete: [0, 0.7], tronc: [0, 0.9], bassin: [0.15, 1], bras: [0.05, 0.95]},
        pose: spin(90, {angles: {torso: 18, rearHip: 40, rearKnee: 105, rearAnkle: -5}, d3: {turn: 25, chestTurn: 28, headTurn: 110, leadFootOut: 8, leadLegRot: -4, rearFootOut: 10, rearLegRot: 5}}),
        cue: 'Pivot sur l’avant-pied avant : le talon tourne autour ; le pied arrière décolle et se replie sous le corps, la tête cherche déjà la cible.'},
      {label: 'Armé', ms: 140, passe: true, pivot: 'lead', phase: 'Accélération', timing: {tete: [0, 0.6], tronc: [0, 0.9]},
        pose: ARME,
        cue: 'Dos à la cible, genou arrière ramené haut, talon vers la cible ; la cible se voit par-dessus l’épaule arrière.'},
      {label: 'Poussée', ms: 95, passe: true, pivot: 'lead', phase: 'Extension', pose: POUSSEE, cue: 'Le talon part en ligne droite vers la cible, la jambe se déplie.'},
      {label: 'Frappe', ms: 125, pivot: 'lead', phase: 'Contact', timing: {bassin: [0, 0.6]}, pose: FRAPPE,
        cue: 'Talon poussé en ligne droite vers la cible, buste penché en contrepoids ; le talon d’appui se pose.'},
      {label: 'Re-armé', ms: 230, passe: true, phase: 'Freinage', timing: {bassin: [0, 0.6], tronc: [0.15, 1], tete: [0.25, 1]},
        pose: spin(180, {pitch: 64, angles: {torso: 30, neck: -10, rearHip: 60, rearKnee: 130, rearAnkle: 5}, d3: {turn: 0, chestTurn: 40, headTurn: 118, leadFootOut: 0, rearFootOut: 0, rearLegRot: 0}}),
        cue: 'La jambe se replie aussitôt, le buste se redresse ; le talon d’appui se relève pour finir le tour.'},
      {label: 'Fin du tour', ms: 230, passe: true, pivot: 'lead', phase: 'Récupération', timing: {tete: [0.25, 1], tronc: [0.1, 1], bassin: [0, 0.95]},
        pose: spin(310, {angles: {torso: 12, rearHip: 8, rearKnee: 70, rearAnkle: 12}, d3: {turn: 18, chestTurn: 12, headTurn: 46, leadFootOut: 10, rearFootOut: 35, rearLegRot: 20}}),
        cue: 'Le corps finit de tourner sous la tête, qui garde la cible ; la jambe arrière redescend.'},
      {label: 'Pied reposé', ms: 220, pivot: 'lead', phase: 'Retour', timing: {tete: [0.2, 1], bassin: [0, 0.85]},
        pose: over('boxe', move('boxe', G0, {d3: {face: 360}, feet: {lead: {on: 'Toe', pitch: 64}}}), 'lead', {aim: 0.85, part: 0.8}), cue: 'Le pied arrière se repose à sa place, face à la cible ; le poids est encore sur l’avant-pied avant.'},
      {label: 'Poids réparti', ms: 140, phase: 'Retour', pose: move('boxe', G0, {d3: {face: 360}, feet: {lead: {on: 'Toe', pitch: 64}}}), cue: 'Le poids revient entre les deux pieds ; le talon avant est encore levé.'},
      {label: 'Garde', ms: 110, phase: 'Retour', pose: {...G0, d3: {...G0.d3, face: 360}}, cue: 'Le talon avant se repose : garde retrouvée.'}]},
  {id: 'escrime-parade-riposte', style: 'escrime', name: 'Parade et riposte (escrime, à vide)', track: ['leadWrist', 'pelvis'],
    note: 'Seuls le bras et la main travaillent ; les jambes restent en garde.',
    keys: [
      {label: 'En garde', pose: F0, cue: 'Garde d’escrime, bras armé souple.'},
      {label: 'Parade', ms: 180, pose: {...move('escrime', F0, {angles: {leadShoulder: 44, leadElbow: 38}}), d3: {...F0.d3, leadArmAbd: 26}}, cue: 'Petit déplacement de la main : la lame écarte l’attaque.'},
      {label: 'Riposte', ms: 200, pose: move('escrime', F0, {angles: {torso: 4, leadShoulder: 86, leadElbow: 2}}), cue: 'Le bras s’allonge aussitôt vers la cible.'},
      {label: 'En garde', ms: 380, pose: F0, cue: 'Retour en garde.'}]},
  {id: 'chute-arriere', style: 'carre', ground: true, name: 'Chute arrière amortie (ukemi), au sol', track: ['head', 'pelvis'],
    note: 'S’accroupir, s’asseoir près des talons, rouler sur le haut du dos menton rentré, frapper le sol des deux bras ; la tête ne touche pas. À apprendre sur tapis avec un enseignant.' + REVIEW,
    keys: [
      {label: 'Debout', pose: D0, cue: 'Debout, détendu, pieds à plat.'},
      {label: 'Accroupi', ms: 600, pose: D1, cue: 'Descendre en pliant les genoux au-dessus des pieds, talons levés, bras devant, menton rentré.'},
      {label: 'Assis', ms: 380, passe: true, pose: D2, cue: 'S’asseoir juste derrière les talons, dos arrondi.'},
      {label: 'Roulé, frappe du sol', ms: 420, pose: D3, cue: 'Rouler sur le haut du dos, jambes repliées ; les deux bras frappent le sol, écartés du corps ; la tête reste décollée.'},
      {label: 'Retour assis', ms: 520, passe: true, pose: D2, cue: 'Rouler vers l’avant jusqu’à s’asseoir.'},
      {label: 'Accroupi', ms: 520, pose: D1, cue: 'Revenir sur les pieds, accroupi.'}]},
  {id: 'sprawl', style: 'carre', ground: true, name: 'Sprawl (défense des jambes), au sol', track: ['pelvis', 'leadToe'],
    note: 'Les mains se posent, les jambes partent loin en arrière, les hanches descendent près du sol : on soustrait ses jambes à la saisie.' + REVIEW,
    keys: [
      {label: 'Garde', pose: P0, cue: 'Garde basse, prête.'},
      {label: 'Mains au sol', ms: 260, pose: S1, cue: 'Le buste plonge, les mains se posent devant les pieds.'},
      {label: 'Sprawl', ms: 240, pose: S2, cue: 'Les deux pieds sautent loin en arrière et se reposent sur l’avant-pied ; les hanches descendent près du sol, tête haute.'},
      {label: 'Remontée', ms: 360, pose: S1, cue: 'Ramener les pieds sous soi d’un saut.'},
      {label: 'Garde', ms: 300, pose: P0, cue: 'Retour en garde basse.'}]}
];

export const sequenceById = id => sequences.find(s => s.id === id);

// Dimension de chaque séquence dans « Mon style » (modèle de mouvement commun : engine/movement.js).
export const SEQUENCE_DIMENSION = {garde: 'garde', 'escrime-garde': 'garde', 'pas-glisse': 'deplacement', 'pas-arriere': 'deplacement',
  'direct-avant': 'attaque', 'direct-arriere': 'attaque', crochet: 'attaque', 'gyaku-zuki': 'attaque', 'coup-pied-avant': 'attaque', teep: 'attaque',
  'coup-pied-retourne': 'attaque', 'escrime-fente': 'attaque', 'esquive-laterale': 'defense', 'escrime-parade-riposte': 'defense', sprawl: 'defense',
  'chute-arriere': 'defense', 'changement-niveau': 'transition'};
