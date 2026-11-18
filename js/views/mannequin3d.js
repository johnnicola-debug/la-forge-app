// Corps d'ombre 3D (Three.js, chargé seulement à la demande) : silhouette sombre éclairée en contre-jour,
// aux proportions du pratiquant (taille et envergure de « Mon reflet »), animée par le moteur 3D (engine/body3d.js).
// Lecture image par image, squelette et second mouvement en comparaison : pilotables après le montage (fonctions renvoyées).
// Caméra libre (souris ou doigt), vues fixes, vue à la première personne et vue de l'adversaire.
// Les poses sont des illustrations choisies à l'œil ; le centre de masse est une approximation segmentaire.
import {samplePose, keyPositions, sequenceDuration} from '../engine/skeleton.js';
import {bodyDims, joints3d, extrasOf, sample3d, centerOfMass3d, supportPolygon, insideMargin} from '../engine/body3d.js';
import {HANDLES, dragPlane, solve} from '../engine/posing.js';
import {sequenceById} from '../data/sequences.js';
import {$, esc} from '../ui.js';

// Muscles de la fiche → parties du corps à faire luire.
const MUSCLE_SEG = {deltoides: ['upperArm'], pectoraux: ['chest'], dorsaux: ['chest'], trapezes: ['neck', 'chest'], biceps: ['upperArm'], triceps: ['upperArm'],
  'avant-bras': ['forearm'], abdominaux: ['torso'], obliques: ['torso'], erecteurs: ['torso', 'pelvis'], fessiers: ['pelvis'], quadriceps: ['thigh'],
  ischios: ['thigh'], adducteurs: ['thigh'], mollets: ['shin'], 'flechisseurs-hanche': ['pelvis', 'thigh'], 'coiffe-rotateurs': ['upperArm']};
// Catégories de données de « Mon reflet » → parties du corps.
export const CAT_SEG = {force: ['upperArm', 'forearm', 'chest'], endurance: ['torso'], puissance: ['thigh', 'shin'], mobilite: ['pelvis'],
  equilibre: ['foot'], reaction: ['head'], recuperation: ['neck'], morpho: []};

export function webglAvailable() {
  try { const c = document.createElement('canvas'); return Boolean(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}

// Dernière taille et envergure connues (centimètres), sinon proportions moyennes.
export function dimsFromState(state) {
  const last = t => state.measurements.filter(m => m.test === t && typeof m.value === 'number').sort((a, b) => String(b.date).localeCompare(String(a.date)))[0]?.value ?? null;
  const height = last('taille'), span = last('envergure');
  return {...bodyDims({height: height ?? 175, span}), known: {height, span}};
}

const VIEWS = {'Trois-quarts': [2.2, 1.35, 2.2], Profil: [0.25, 1.05, 3.1], Face: [3.1, 1.15, 0.05], Dessus: [0.25, 3.8, 0.3], Pieds: null, 'Première personne': null, Adversaire: null};

// `seqId` : identifiant d'une séquence du moteur, ou séquence composée (objet avec keys). `d3` : réglages 3D imposés (garde hybride).
// `edit` : atelier de mouvement ({onSelect, onPart, onChange, onCommit}) ; l'étape montrée se modifie en attrapant ses poignées.
export async function mount3d(host, seqId, {muscles = [], glow = [], dims = bodyDims(), compact = false, d3 = null, transparent = false, height = null, loop = false, minimal = false, opponent = false, autoplay = false, edit = null} = {}) {
  const THREE = await import('../../vendor/three/three.module.min.js');
  const {OrbitControls} = await import('../../vendor/three/OrbitControls.js');
  let seq = typeof seqId === 'object' ? seqId : sequenceById(seqId), keys = keyPositions(seq);
  const H = dims.H, steps = () => `${seq.keys.map((k, i) => `<button data-key="${i}" aria-pressed="${i === 0}">${esc(k.label)}</button>`).join('')}<span class="bar"></span>`;
  // Vues et options d'affichage : repliées sous « Affichage » dans le lecteur complet, inchangées dans la vue épurée.
  const viewBtns = `<span class="views">${Object.keys(VIEWS).map(v => `<button data-view="${v}" aria-pressed="${v === 'Trois-quarts'}">${v}</button>`).join('')}</span>`;
  const toggles = `<label><input type="checkbox" data-act="skeleton"> Squelette</label><label><input type="checkbox" data-act="ghosts" checked> Fantômes</label><label><input type="checkbox" data-act="com" checked> Centre de masse</label>
    <label><input type="checkbox" data-act="zones" ${muscles.length ? 'checked' : ''}> Zones sollicitées</label>
    <label><input type="checkbox" data-act="contacts"> Appuis</label><label><input type="checkbox" data-act="trails"> Trajectoires</label><label><input type="checkbox" data-act="axes"> Axes</label>`;
  host.innerHTML = `<div class="m3d ${compact ? 'compact' : ''} ${minimal ? 'minimal' : ''} ${edit ? 'edit' : ''}"><div class="m3d-canvas"></div>
    ${compact ? '' : `<div class="timeline">${steps()}</div>
    <div class="controls"><button data-act="prev" title="Étape précédente" aria-label="Étape précédente">«</button><button data-act="back" title="Image précédente" aria-label="Image précédente">‹</button><button data-act="play">${loop || autoplay ? 'Pause' : 'Lire'}</button><button data-act="fwd" title="Image suivante" aria-label="Image suivante">›</button><button data-act="next" title="Étape suivante" aria-label="Étape suivante">»</button>
      <label>Vitesse <select data-act="speed"><option value="0.1">× 0,1</option><option value="0.25">× 0,25</option><option value="0.5" selected>× 0,5</option><option value="1">× 1</option></select></label>
      <input type="range" min="0" max="1000" value="0" data-act="scrub" aria-label="Position dans le mouvement"><output class="m3d-time"></output>
      ${minimal ? viewBtns + toggles : `<details class="m3d-more"><summary>Affichage</summary><div class="m3d-opts">${viewBtns}${toggles}</div></details>`}</div>
    <p class="subtle cue"></p>
    <p class="subtle m3d-note">Faites glisser pour tourner autour, molette ou pincement pour zoomer. Corps aux proportions ${dims.known?.height ? `de votre taille (${dims.known.height} cm)${dims.known.span ? ` et envergure (${dims.known.span} cm)` : ''}` : 'moyennes (renseignez taille et envergure dans Mon reflet)'}.</p>`}</div>`;
  const box = $('.m3d-canvas', host), size = () => { const W = box.clientWidth || 640; return [W, height ?? Math.round(compact ? Math.min(420, W * 1.15) : Math.min(edit ? 540 : 480, W * (edit ? 0.7 : 0.64)))]; };
  const [w, h] = size();
  const renderer = new THREE.WebGLRenderer({antialias: true, alpha: transparent});
  renderer.setPixelRatio(Math.min(2, devicePixelRatio)); renderer.setSize(w, h); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  box.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); if (!transparent) { scene.background = new THREE.Color('#0b1113'); scene.fog = new THREE.Fog('#0b1113', 5, 13); }
  const camera = new THREE.PerspectiveCamera(compact ? 28 : 34, w / h, 0.03, 60);
  const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.target.set(0.15, 0.95, 0); controls.maxPolarAngle = Math.PI * 0.495;
  controls.minDistance = 0.6; controls.maxDistance = 9;

  // Lumières : faible ambiance, lumière de face chaude qui porte l'ombre, deux contre-jours qui dessinent la silhouette.
  scene.add(new THREE.HemisphereLight('#3a4a52', '#0a0c0d', 0.9));
  const key = new THREE.DirectionalLight('#ffe2bf', 1.1); key.position.set(2.4, 4.2, 2.2); key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, {left: -2.2, right: 2.2, top: 2.4, bottom: -1}); key.shadow.radius = 4; scene.add(key);
  const rimA = new THREE.DirectionalLight('#9fd6c6', 3.2); rimA.position.set(-3, 2.2, -2.5); scene.add(rimA);
  const rimB = new THREE.DirectionalLight('#e8b56a', 2.4); rimB.position.set(-1.5, 1.6, 3.2); scene.add(rimB);

  // Sol : flaque de lumière (dégradé radial) pour que l'ombre portée se lise sur fond sombre.
  const cv = document.createElement('canvas'); cv.width = cv.height = 256;
  const g2 = cv.getContext('2d'), grad = g2.createRadialGradient(128, 128, 8, 128, 128, 128);
  grad.addColorStop(0, '#3b3830'); grad.addColorStop(0.45, '#1b1d1b'); grad.addColorStop(1, '#0b1113'); g2.fillStyle = grad; g2.fillRect(0, 0, 256, 256);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(4.2, 64), new THREE.MeshStandardMaterial({map: new THREE.CanvasTexture(cv), roughness: 1}));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true;
  if (transparent) floor.material = new THREE.ShadowMaterial({opacity: 0.55});
  scene.add(floor);
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.55, 1.565, 96), new THREE.MeshBasicMaterial({color: '#c9a95c', transparent: true, opacity: 0.35}));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.002; if (!transparent) scene.add(ring);

  const matBody = new THREE.MeshPhysicalMaterial({color: '#000000', roughness: 0.85, metalness: 0, specularIntensity: 0.35, sheen: 1, sheenColor: new THREE.Color('#7fa3a8'), sheenRoughness: 0.35});
  const matZone = new THREE.MeshPhysicalMaterial({color: '#1a0d0a', roughness: 0.55, emissive: new THREE.Color('#d0452a'), emissiveIntensity: 0.9, sheen: 1, sheenColor: new THREE.Color('#ff9a7a')});
  const matGhost = new THREE.MeshStandardMaterial({color: '#7f9599', transparent: true, opacity: 0.1, depthWrite: false});
  const zoneParts = new Set([...muscles.flatMap(m => MUSCLE_SEG[m] ?? []), ...glow.flatMap(c => CAT_SEG[c] ?? [])]);
  const showZones = { on: zoneParts.size > 0 };

  // Silhouette : segments coniques + sphères aux articulations (formes continues), tronc tourné, tête, poings, pieds.
  const r = f => f * H;
  // Membres : cylindres coniques entre articulations ; l'avant-bras s'arrête au poignet anatomique, la main est dessinée à part.
  const LIMBS = [['Shoulder', 'Elbow', r(.034), r(.028), 'upperArm'], ['Elbow', 'Carpus', r(.027), r(.021), 'forearm'],
    ['Hip', 'Knee', r(.055), r(.035), 'thigh'], ['Knee', 'Ankle', r(.034), r(.022), 'shin']];
  const JOINT_R = {Shoulder: r(.036), Elbow: r(.027), Carpus: r(.02), Hip: r(.05), Knee: r(.035), Ankle: r(.022)};
  const JOINT_PART = {Shoulder: 'upperArm', Elbow: 'forearm', Carpus: 'forearm', Hip: 'pelvis', Knee: 'thigh', Ankle: 'foot'};
  // Tronc en deux volumes qui suivent la colonne (squelette v3) : lombaires et abdomen (bassin → milieu du dos), thorax (→ base
  // du cou). Rayon en fraction de la taille, hauteur en fraction du tronc ; chacun a sa propre inclinaison et sa propre rotation.
  const PROFILE = [[0.001, -0.06], [0.098, -0.04], [0.104, 0.08], [0.088, 0.3], [0.08, 0.45], [0.094, 0.66], [0.0954, 0.68], [0.104, 0.8], [0.106, 0.9], [0.07, 0.99], [0.03, 1.02]];
  const latheOf = (a, b, base, len) => new THREE.LatheGeometry(PROFILE.filter(([, h]) => h >= a - 1e-9 && h <= b + 1e-9).map(([x, h]) => new THREE.Vector2(x * H, (h - base) / len)), 28);
  const latheLow = latheOf(-0.06, 0.68, 0, 0.68), latheHigh = latheOf(0.68, 1.02, 0.68, 0.32);
  const sph = new THREE.SphereGeometry(1, 28, 18), boxGeo = new THREE.BoxGeometry(1, 1, 1), stick = new THREE.CylinderGeometry(1, 1, 1, 14), cone = new THREE.ConeGeometry(1, 1, 14), up = new THREE.Vector3(0, 1, 0);
  const SHARED = new Set([sph, boxGeo, stick, cone, latheLow, latheHigh]);
  function makeFigure(mat, ghost) {
    const g = new THREE.Group(), parts = {limbs: [], joints: [], vols: {}, hands: {}};
    const mk = (geo, part) => { const m = new THREE.Mesh(geo, ghost ? mat : showZones.on && zoneParts.has(part) ? matZone : mat); m.castShadow = !ghost; m.userData.part = part; g.add(m); return m; };
    for (const side of ['lead', 'rear']) {
      for (const [a, b, ra, rb, part] of LIMBS) parts.limbs.push([mk(new THREE.CylinderGeometry(rb, ra, 1, 22), part), side + a, side + b]);
      for (const [jn, rad] of Object.entries(JOINT_R)) { const m = mk(sph, JOINT_PART[jn]); m.scale.setScalar(rad); parts.joints.push([m, side + jn]); }
      parts.hands[side] = {palm: mk(boxGeo, 'forearm'), fingers: mk(boxGeo, 'forearm'), thumb: mk(stick, 'forearm')};   // paume, doigts, pouce
      parts.vols[side + 'Foot'] = mk(sph, 'foot'); parts.vols[side + 'Toes'] = mk(sph, 'foot'); parts.vols[side + 'Clav'] = mk(stick, 'chest');
    }
    parts.vols.torsoLow = mk(latheLow, 'torso'); parts.vols.torsoHigh = mk(latheHigh, 'torso'); parts.vols.chest = mk(sph, 'chest'); parts.vols.pelvis = mk(sph, 'pelvis');
    parts.vols.neck = mk(new THREE.CylinderGeometry(r(.026), r(.03), 1, 16), 'neck'); parts.vols.head = mk(sph, 'head'); parts.vols.nose = mk(cone, 'head');
    g.userData = parts; scene.add(g); return g;
  }
  const V = p => new THREE.Vector3(p[0], p[1], p[2]);
  const qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), mtx = new THREE.Matrix4(), X1 = new THREE.Vector3(1, 0, 0);
  // Orientation d'après un repère : x le long de `x`, y vers `y` (rendu perpendiculaire), z = x × y.
  const basis = (q, x, y) => { const A = x.clone().normalize(), C = new THREE.Vector3().crossVectors(A, y).normalize(), B = new THREE.Vector3().crossVectors(C, A); mtx.makeBasis(A, B, C); return q.setFromRotationMatrix(mtx); };
  const segmentQ = (q, axis, yawDeg) => { qa.setFromUnitVectors(up, axis.clone().normalize()); qb.setFromAxisAngle(up, (yawDeg - 90) * Math.PI / 180); return q.copy(qa).multiply(qb); };
  const stretch = (m, A, B, rad) => { const d = B.clone().sub(A), len = d.length() || 1e-6; m.position.copy(A).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(up, d.normalize()); m.scale.set(rad, len, rad); };
  function pose(fig, j, e) {
    const {limbs, joints, vols, hands} = fig.userData, F = j.frames;
    for (const [m, a, b] of limbs) { const A = V(j[a]), B = V(j[b]), d = B.clone().sub(A), len = d.length(); m.position.copy(A).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(up, d.normalize()); m.scale.set(1, len, 1); }
    for (const [m, k] of joints) m.position.copy(V(j[k]));
    // Tronc : chaque volume suit son segment de colonne (la torsion se répartit au lieu de tourner d'un bloc).
    const pel = V(j.pelvis), mid = V(j.spineMid), nb = V(j.neckBase);
    vols.torsoLow.position.copy(pel); segmentQ(vols.torsoLow.quaternion, mid.clone().sub(pel), (F.spine[0].yaw + F.spine[1].yaw) / 2); vols.torsoLow.scale.set(1, mid.distanceTo(pel), 0.58);
    vols.torsoHigh.position.copy(mid); segmentQ(vols.torsoHigh.quaternion, nb.clone().sub(mid), F.spine[2].yaw); vols.torsoHigh.scale.set(1, nb.distanceTo(mid), 0.58);
    vols.chest.position.copy(mid.clone().lerp(nb, 0.2)); vols.chest.quaternion.copy(vols.torsoHigh.quaternion); vols.chest.scale.set(r(.088), r(.075), r(.062));
    // Bassin : large le long de l'axe des hanches (rotation et inclinaison), dressé selon les lombaires (bascule).
    vols.pelvis.position.copy(pel); basis(vols.pelvis.quaternion, V(j.leadHip).sub(V(j.rearHip)), V(F.pelvis.up)); vols.pelvis.scale.set(r(.09), r(.06), r(.062));
    const hd = V(j.head), nk = hd.clone().sub(nb), nl = nk.length() * 0.55;
    vols.neck.position.copy(nb).addScaledVector(nk.clone().normalize(), nl / 2); vols.neck.quaternion.setFromUnitVectors(up, nk.normalize()); vols.neck.scale.set(1, nl, 1);
    // Tête : orientée par le regard ; le nez montre où elle regarde ; inclinaison autour de l'axe du regard.
    const hf = V(F.head.fwd), hu = V(F.head.up);
    basis(vols.head.quaternion, hf, hu); if (F.head.tilt) vols.head.quaternion.multiply(qa.setFromAxisAngle(X1, F.head.tilt * Math.PI / 180));
    vols.head.position.copy(hd); vols.head.scale.set(r(.06), r(.068), r(.056));
    vols.nose.position.copy(hd).addScaledVector(hf, r(.06)).addScaledVector(hu, -r(.01)); vols.nose.quaternion.setFromUnitVectors(up, hf); vols.nose.scale.set(r(.011), r(.03), r(.011));
    for (const s of ['lead', 'rear']) {
      const sg = s === 'lead' ? 1 : -1;
      stretch(vols[s + 'Clav'], nb.clone().addScaledVector(V(F.spine[2].up), -r(.03)), V(j[s + 'Shoulder']), r(.024));   // clavicule et trapèze
      // Main : paume et doigts orientés par la pronation et le poignet ; poing (doigts repliés) ou main ouverte ; pouce côté radial.
      const h = F[s + 'Hand'], fw = V(h.fwd), pa = V(h.palm), wr = V(j[s + 'Carpus']), fist = V(j[s + 'Wrist']), thumbDir = new THREE.Vector3().crossVectors(fw, pa).multiplyScalar(sg), {palm, fingers, thumb} = hands[s];
      basis(palm.quaternion, fw, pa.clone().negate()); fingers.quaternion.copy(palm.quaternion);
      if (h.open > 0.5) {
        palm.position.copy(wr).addScaledVector(fw, r(.03)); palm.scale.set(r(.06), r(.016), r(.05));
        fingers.position.copy(wr).addScaledVector(fw, r(.085)); fingers.scale.set(r(.052), r(.012), r(.046));
        stretch(thumb, wr.clone().addScaledVector(thumbDir, r(.02)), wr.clone().addScaledVector(thumbDir, r(.045)).addScaledVector(fw, r(.035)), r(.008));
      } else {
        palm.position.copy(fist).addScaledVector(pa, -r(.006)); palm.scale.set(r(.05), r(.028), r(.05));
        fingers.position.copy(fist).addScaledVector(fw, r(.014)).addScaledVector(pa, r(.012)); fingers.scale.set(r(.03), r(.028), r(.05));
        stretch(thumb, wr.clone().addScaledVector(thumbDir, r(.02)).addScaledVector(fw, r(.012)), fist.clone().addScaledVector(thumbDir, r(.022)).addScaledVector(pa, r(.012)), r(.009));
      }
      // Pied : arrière-pied du talon aux têtes des métatarsiens, orteils articulés (à plat au sol quand l'avant-pied porte).
      const ft = F[s + 'Foot'], sole = V(ft.S), heel = V(j[s + 'Heel']), ball = V(j[s + 'Toe']), fd = ball.clone().sub(heel);
      vols[s + 'Foot'].position.copy(heel).addScaledVector(fd, 0.5).addScaledVector(sole, -r(.022)); basis(vols[s + 'Foot'].quaternion, fd, sole.clone().negate()); vols[s + 'Foot'].scale.set(fd.length() / 2 + r(.012), r(.024), r(.03));
      const td = V(ft.toeDir), base = V(j[s + 'Mtp1']).lerp(V(j[s + 'Mtp5']), 0.45);
      vols[s + 'Toes'].position.copy(base).addScaledVector(td, r(.02)).addScaledVector(sole, -r(.01)); basis(vols[s + 'Toes'].quaternion, td, sole.clone().negate()); vols[s + 'Toes'].scale.set(r(.024), r(.011), r(.028));
    }
  }
  const main = makeFigure(matBody, false);
  // ——— Analyse (« Affichage ») : repères d'appui de chaque pied (vert : posé à moins de 1,2 cm du sol), trajectoires
  // (avant-pieds et talons, bassin, centre de masse estimé) et axes (bassin, thorax, regard). Absents des vues compactes.
  const CONTACT_PTS = ['Heel', 'Mtp1', 'Mtp5', 'Hallux', 'Toes'], markers = [], contactGroup = new THREE.Group(), trailGroup = new THREE.Group(), axesGroup = new THREE.Group();
  const markGeo = new THREE.CircleGeometry(r(.011), 16);
  if (!compact) for (const s of ['lead', 'rear']) for (const k of CONTACT_PTS) {
    const m = new THREE.Mesh(markGeo, new THREE.MeshBasicMaterial({color: '#5fc39b', transparent: true, opacity: 0.95, depthTest: false}));
    m.rotation.x = -Math.PI / 2; m.renderOrder = 11; markers.push([m, s + k]); contactGroup.add(m);
  }
  const arrows = compact ? [] : [['pelvis', 'x'], ['pelvis', 'y'], ['chest', 'x'], ['chest', 'y'], ['head', 'x'], ['head', 'y']].map(([at, ax]) => {
    const a = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), r(.12), ax === 'x' ? '#e0674c' : '#5fc39b', r(.025), r(.015)); a.userData = {at, ax}; axesGroup.add(a); return a; });
  for (const g of [contactGroup, trailGroup, axesGroup]) { g.visible = false; scene.add(g); }
  function buildTrails() {
    if (compact) return;
    trailGroup.children.slice().forEach(c => { trailGroup.remove(c); c.geometry.dispose(); });
    const n = Math.max(30, Math.round(sequenceDuration(seq) / 1000 * 60)), P = {leadToe: [], rearToe: [], leadHeel: [], rearHeel: [], pelvis: [], com: []};
    for (let i = 0; i <= n; i++) { const s3 = sample3d(seq, i / n, samplePose), jj = joints3d(s3.pose, dims, s3.extras), c = centerOfMass3d(jj);
      for (const k of ['leadToe', 'rearToe', 'leadHeel', 'rearHeel', 'pelvis']) P[k].push(V(jj[k])); P.com.push(new THREE.Vector3(c[0], c[1], c[2])); }
    const COLORS = {leadToe: '#e2c27a', rearToe: '#c98b4f', leadHeel: '#a89060', rearHeel: '#8d6a44', pelvis: '#7fb8e0', com: '#f0d78a'};
    for (const [k, pts] of Object.entries(P)) trailGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({color: COLORS[k], transparent: true, opacity: 0.85, depthTest: k !== 'com'})));
  }
  function poseAnalysis(j) {
    for (const [m, k] of markers) { const p = j[k]; m.position.set(p[0], 0.004, p[2]); m.visible = p[1] < 0.08; m.material.color.set(p[1] <= 0.012 ? '#5fc39b' : '#7a8288'); }
    const F = j.frames, ref = {pelvis: [j.pelvis, V(j.leadHip).sub(V(j.rearHip)), F.pelvis.up], chest: [j.chest, V(j.leadShoulder).sub(V(j.rearShoulder)), F.spine[2].up], head: [j.head, F.head.fwd, F.head.up]};
    for (const a of arrows) { const [at, x, y] = ref[a.userData.at]; a.position.copy(V(at)); a.setDirection((a.userData.ax === 'x' ? (x.isVector3 ? x : V(x)) : V(y)).clone().normalize()); }
  }
  // Fantômes : une silhouette par pose clé (seize au plus, pour que les longs mouvements restent lisibles et fluides).
  const makeGhosts = (only = null) => { if (compact) return []; const n = seq.keys.length, every = Math.ceil(n / 16);
    return seq.keys.filter((_, i) => only ? only.includes(i) : i % every === 0 || i === n - 1).map(k => { const g = makeFigure(matGhost, true), e = extrasOf(seq, k.pose); pose(g, joints3d(k.pose, dims, e), e); return g; }); };
  let ghosts = makeGhosts(), second = null, skelOn = false;

  if (minimal) ghosts.forEach(g => { g.visible = false; });
  if (opponent) {   // adversaire-cible : garde de boxe, face au pratiquant, à 1,6 m devant le point de départ
    const guard = sequenceById('garde').keys[0].pose, op = {...guard, x: 1.6 / dims.unit, d3: {face: 180}};
    pose(makeFigure(new THREE.MeshStandardMaterial({color: '#8a6a5e', transparent: true, opacity: 0.28, depthWrite: false}), true), joints3d(op, dims, extrasOf({}, op)), extrasOf({}, op));
  }   // vue épurée (Creuset) : le geste seul, avec son équilibre
  // Squelette : segments et articulations tracés par-dessus le corps rendu translucide, pour lire les angles et les appuis.
  const BONES = [['pelvis', 'chest'], ['chest', 'neckBase'], ['neckBase', 'head'], ['leadShoulder', 'rearShoulder'], ['leadHip', 'rearHip'],
    ...['lead', 'rear'].flatMap(s => [['Shoulder', 'Elbow'], ['Elbow', 'Wrist'], ['Hip', 'Knee'], ['Knee', 'Ankle'], ['Ankle', 'Heel'], ['Heel', 'Toe']].map(([a, b]) => [s + a, s + b]))];
  const boneGeo = new THREE.CylinderGeometry(1, 1, 1, 8);
  function makeSkeleton(color, dot) {
    const g = new THREE.Group(), over = c => new THREE.MeshBasicMaterial({color: c, depthTest: false, transparent: true}), mb = over(color), mj = over(dot);
    const bones = BONES.map(([a, b]) => { const m = new THREE.Mesh(boneGeo, mb); m.renderOrder = 9; g.add(m); return [m, a, b]; });
    const dots = [...new Set(BONES.flat())].map(k => { const m = new THREE.Mesh(sph, mj); m.scale.setScalar(r(.011)); m.renderOrder = 10; g.add(m); return [m, k]; });
    g.userData = {bones, dots}; g.visible = false; scene.add(g); return g;
  }
  function poseSkeleton(g, j) {
    for (const [m, a, b] of g.userData.bones) { const A = V(j[a]), d = V(j[b]).sub(A), len = d.length(); m.position.copy(A).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(up, d.normalize()); m.scale.set(r(.005), len || 1e-6, r(.005)); }
    for (const [m, k] of g.userData.dots) m.position.copy(V(j[k]));
  }
  const skel = makeSkeleton('#8fe3c8', '#ffffff');
  // Poignées de l'atelier : dorées pour déplacer une extrémité (poing, pied, tête, buste, bassin), vertes pour faire tourner
  // un segment autour de son attache (coude, genou). Toujours visibles par-dessus le corps.
  const handles = edit ? Object.entries(HANDLES).map(([name, h]) => {
    const color = h.small ? '#5fc39b' : '#e2c27a', m = new THREE.Mesh(sph, new THREE.MeshBasicMaterial({color, depthTest: false, transparent: true, opacity: 0.95}));
    m.renderOrder = 12; m.visible = false; m.userData = {name, joint: h.joint, color, base: r(h.small ? 0.016 : 0.022)}; scene.add(m); return m;
  }) : [];
  function setSkeleton(on) {
    skelOn = Boolean(on); skel.visible = skelOn; if (second) second.skel.visible = skelOn && Boolean(second.seq);
    for (const m of [matBody, matZone, mat2]) { m.transparent = skelOn; m.opacity = skelOn ? 0.22 : 1; m.depthWrite = !skelOn; m.needsUpdate = true; }
    const cb = $('[data-act=skeleton]', host); if (cb) cb.checked = skelOn;
    update();
  }
  // Second mouvement (comparaison) : joué sur le même temps relatif, superposé (« sur »), à côté (« cote ») ou en face (« face »).
  const mat2 = new THREE.MeshStandardMaterial({color: '#2f6f8f', roughness: 0.6});
  function setSecond(next, place = 'sur') {
    if (compact) return;
    const wasFace = second?.place === 'face';
    if (next) {
      second ??= {fig: makeFigure(mat2, true), skel: makeSkeleton('#7fb8e0', '#dcefff')};
      second.seq = typeof next === 'object' ? next : sequenceById(next); second.place = place;
      const [x, z, turn] = place === 'face' ? [1.6, 0, Math.PI] : place === 'cote' ? [0, -0.9, 0] : [0, 0, 0];
      for (const g of [second.fig, second.skel]) { g.position.set(x, 0, z); g.rotation.y = turn; }
    } else if (second) second.seq = second.place = null;
    if (second) { second.fig.visible = Boolean(second.seq); second.skel.visible = skelOn && second.fig.visible; }
    if (wasFace !== (second?.place === 'face') && VIEWS[st.view]) setView(st.view);
    update();
  }
  // Changer de mouvement sans reconstruire la scène : étapes, fantômes et curseur repartent du début.
  function rebuildGhosts() {
    for (const g of ghosts) { scene.remove(g); g.traverse(o => { if (o.isMesh && !SHARED.has(o.geometry)) o.geometry.dispose(); }); }   // géométries partagées : gardées
    // Atelier : pendant qu'on modifie une étape, seulement l'étape d'avant et celle d'après (pelure d'oignon).
    ghosts = makeGhosts(st.edit !== null && !st.playing ? [st.edit - 1, st.edit + 1] : null);
    const cb = $('[data-act=ghosts]', host); if (minimal || (cb && !cb.checked)) ghosts.forEach(g => { g.visible = false; });
  }
  function load(next, play = true) {
    seq = typeof next === 'object' ? next : sequenceById(next); keys = keyPositions(seq); st.edit = null; rebuildGhosts(); if (trailGroup.visible) buildTrails(); else trailGroup.clear();
    const tl = $('.timeline', host); if (tl) tl.innerHTML = steps();
    st.u = 0; st.last = 0; st.playing = compact || loop || play; if (playBtn) playBtn.textContent = st.playing ? 'Pause' : 'Lire';
    update();
  }
  // Centre de masse : sphère dorée, fil à plomb, polygone d'appui au sol (vert si le centre est au-dessus, rouge sinon).
  const comBall = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 12), new THREE.MeshStandardMaterial({color: '#e2c27a', emissive: '#a07b2c', emissiveIntensity: 0.9}));
  const plumb = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineDashedMaterial({color: '#e2c27a', dashSize: 0.03, gapSize: 0.03}));
  const polyMat = new THREE.LineBasicMaterial({color: '#5fc39b'}), poly = new THREE.LineLoop(new THREE.BufferGeometry(), polyMat);
  const comGroup = new THREE.Group(); comGroup.add(comBall, plumb, poly); comGroup.visible = !compact; scene.add(comGroup);

  const st = {u: 0, speed: compact ? 0.35 : 0.5, playing: compact || loop || autoplay, last: 0, view: 'Trois-quarts', j: null, edit: null, part: null, hover: null, drag: null};
  const cue = $('.cue', host), scrub = $('[data-act=scrub]', host), playBtn = $('[data-act=play]', host), timeEl = $('.m3d-time', host);
  function update() {
    // Étape en cours de modification (atelier) : sa pose exacte, sans interpolation, avec ses poignées.
    const ek = st.edit !== null && !st.playing ? seq.keys[st.edit] : null;
    const s3 = ek ? {pose: ek.pose, phase: st.edit, extras: extrasOf(seq, ek.pose)} : sample3d(seq, st.u, samplePose);
    const p = s3.pose, phase = s3.phase, extras = d3 ? {...s3.extras, ...d3} : s3.extras, j = joints3d(p, dims, extras);
    st.j = j; st.face = extras.face ?? 0; pose(main, j, extras);
    if (!compact && (contactGroup.visible || axesGroup.visible)) poseAnalysis(j);
    for (const m of handles) {
      const {name, joint, base, color} = m.userData, sel = name === st.part; m.visible = Boolean(ek);
      if (ek) { m.position.copy(V(j[joint])); m.scale.setScalar(base * (sel ? 1.55 : name === st.hover ? 1.3 : 1)); m.material.color.set(sel ? '#ffffff' : color); }
    }
    if (skelOn) poseSkeleton(skel, j);
    if (second?.seq) { const s2 = sample3d(second.seq, st.u, samplePose), j2 = joints3d(s2.pose, dims, s2.extras); pose(second.fig, j2, s2.extras); if (skelOn) poseSkeleton(second.skel, j2); }
    const c = centerOfMass3d(j), pg = supportPolygon(j, dims);
    comBall.position.set(c[0], c[1], c[2]);
    plumb.geometry.setFromPoints([comBall.position.clone(), new THREE.Vector3(c[0], 0.003, c[2])]); plumb.computeLineDistances();
    // Le nombre de points d'appui change (pied levé, mains au sol) : nouvelle géométrie à chaque image.
    poly.geometry.dispose(); poly.geometry = new THREE.BufferGeometry().setFromPoints(pg.map(([x, z]) => new THREE.Vector3(x, 0.004, z)));
    polyMat.color.set(insideMargin(pg, [c[0], c[2]]) >= 0 ? '#5fc39b' : '#e0674c');
    if (compact) return;
    host.querySelectorAll('[data-key]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.key) === phase)));
    $('.bar', host).style.width = `${st.u * 100}%`; scrub.value = Math.round(st.u * 1000);
    timeEl.textContent = `${(st.u * sequenceDuration(seq) / 1000).toFixed(2).replace('.', ',')} s`;
    const ai = keys.findIndex((p, k) => k > 0 && p >= st.u - 1e-9), ph = seq.keys[ai > 0 ? ai : seq.keys.length - 1]?.phase;   // phase de la transition en cours (préparation, transfert…)
    cue.innerHTML = `${ph ? `<em class="m3d-phase">${esc(ph)}</em> · ` : ''}<strong>${esc(seq.keys[phase].label)}</strong> · ${esc(seq.keys[phase].cue ?? '')}`;
  }
  // Vues : fixes (caméra libre ensuite), première personne (depuis les yeux, vers la cible) et adversaire (face au pratiquant).
  function follow() {
    const j = st.j; if (!j) return;
    if (st.view === 'Première personne') {
      const hd = j.head, a = (st.face ?? 0) * Math.PI / 180, fx = Math.cos(a), fz = -Math.sin(a);
      camera.position.set(hd[0] + 0.1 * fx, hd[1] + 0.02, hd[2] + 0.1 * fz); camera.lookAt(hd[0] + 2 * fx, hd[1] - 0.45, hd[2] + 2 * fz);
    } else if (st.view === 'Adversaire') {
      camera.position.set(j.pelvis[0] + 2.3, 1.62 * H / 1.75, 0.15); camera.lookAt(j.pelvis[0], 1.05 * H / 1.75, 0);
    } else if (st.view === 'Pieds') {   // gros plan des appuis : la caméra vise surtout le pied posé (poids continu, pas de saut d'image)
      const mid = k => j[k + 'Heel'].map((v, i) => (v + j[k + 'Toe'][i]) / 2), w = k => Math.min(1, Math.max(0.05, 1 - Math.min(j[k + 'Heel'][1], j[k + 'Mtp1'][1], j[k + 'Mtp5'][1]) / 0.15));
      const A = mid('lead'), B = mid('rear'), wa = w('lead'), wb = w('rear'), cx = (A[0] * wa + B[0] * wb) / (wa + wb), cz = (A[2] * wa + B[2] * wb) / (wa + wb);
      const d = Math.max(0.65, 1.3 * Math.hypot(A[0] - B[0], A[2] - B[2]) * Math.min(wa, wb) / Math.max(wa, wb));
      camera.position.set(cx + 0.45 * d, 0.55 * d, cz + 0.8 * d); camera.lookAt(cx, 0.04, cz);
    }
  }
  const setView = v => {
    st.view = v; const fixed = VIEWS[v];
    controls.enabled = Boolean(fixed); main.userData.vols.head.visible = main.userData.vols.neck.visible = main.userData.vols.nose.visible = v !== 'Première personne';
    // Avec un adversaire, la caméra se recule et vise entre les deux corps.
    const wide = opponent || second?.place === 'face', cx = wide ? 0.8 : 0.15, k = wide ? 1.35 : 1;
    if (fixed) { camera.position.set(...fixed.map((x, i) => i === 1 ? x * H / 1.75 : i === 0 ? cx + (x - 0.15) * k : x * k)); controls.target.set(cx, 0.95 * H / 1.75, 0); controls.update(); } else follow();
    host.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === v)));
  };
  if (transparent) { camera.position.set(1.4, 1.1, 6.2); controls.target.set(0.45, 0.88 * H / 1.75, 0); controls.enabled = false; camera.lookAt(controls.target); }
  else if (compact) { camera.position.set(1.9, 1.25, 2.6); controls.target.set(0.05, 0.92 * H / 1.75, 0); controls.autoRotate = true; controls.autoRotateSpeed = 0.8; controls.enableZoom = false; controls.update(); }
  else setView('Trois-quarts');
  let raf = 0, alive = true;
  const frame = t => {
    if (!alive) return;
    if (st.playing) {
      const dt = st.last ? t - st.last : 0; st.u = st.u + dt * st.speed / sequenceDuration(seq);
      if (st.u >= 1) { if (compact || loop) st.u = 0; else { st.u = 1; st.playing = false; playBtn.textContent = 'Lire'; } }
      update();
    }
    st.last = t; if (controls.enabled) controls.update(); else if (!transparent) follow(); renderer.render(scene, camera); raf = requestAnimationFrame(frame);
  };
  host.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || !host.contains(b)) return;
    if (b.dataset.key) { st.playing = false; playBtn.textContent = 'Lire'; st.u = keys[Number(b.dataset.key)]; update(); }
    if (b.dataset.view) setView(b.dataset.view);
    const act = b.dataset.act;
    if (act === 'play') { if (st.playing) { st.playing = false; b.textContent = 'Lire'; } else { leaveEdit(); if (st.u >= 1) st.u = 0; st.playing = true; st.last = 0; b.textContent = 'Pause'; } }
    // Image par image : un pas vaut 1/30 de seconde du mouvement.
    if (act === 'back' || act === 'fwd') { leaveEdit(); st.playing = false; playBtn.textContent = 'Lire'; st.u = Math.min(1, Math.max(0, st.u + (act === 'fwd' ? 1 : -1) * (1000 / 30) / (sequenceDuration(seq) || 1))); update(); }
    if (act === 'prev' || act === 'next') { const ph = st.edit ?? samplePose(seq, st.u).phase, i = Math.max(0, Math.min(keys.length - 1, ph + (act === 'next' ? 1 : -1)));
      if (edit) { editKey(i); edit.onSelect?.(i); } else { st.u = keys[i]; update(); } }
  });
  const onInput = e => {
    const a = e.target.dataset.act;
    if (a === 'scrub') { leaveEdit(); st.playing = false; playBtn.textContent = 'Lire'; st.u = Number(e.target.value) / 1000; update(); }
    if (a === 'speed') st.speed = Number(e.target.value);
    if (a === 'ghosts') ghosts.forEach(g => g.visible = e.target.checked);
    if (a === 'skeleton') setSkeleton(e.target.checked);
    if (a === 'com') comGroup.visible = e.target.checked;
    if (a === 'contacts' || a === 'axes') { (a === 'axes' ? axesGroup : contactGroup).visible = e.target.checked; if (st.j) poseAnalysis(st.j); }
    if (a === 'trails') { if (e.target.checked && !trailGroup.children.length) buildTrails(); trailGroup.visible = e.target.checked; }
    if (a === 'zones') main.traverse(m => { if (m.isMesh) m.material = e.target.checked && zoneParts.has(m.userData.part) ? matZone : matBody; });
  };
  host.addEventListener('input', onInput); host.addEventListener('change', e => { if (e.target.type === 'checkbox') onInput(e); });
  // Atelier de mouvement : l'étape choisie est montrée telle quelle ; on attrape une poignée pour la modifier
  // (cinématique inverse : engine/posing.js). Un glissement qui ne part pas d'une poignée fait toujours tourner la caméra.
  function leaveEdit() { if (st.edit === null) return; st.edit = null; st.hover = null; rebuildGhosts(); update(); edit?.onSelect?.(null); }
  function editKey(i, rebuild = false) {
    if (!edit) return;
    const k = Math.max(0, Math.min(seq.keys.length - 1, i)), changed = st.edit !== k || st.playing;
    st.playing = false; if (playBtn) playBtn.textContent = 'Lire';
    keys = keyPositions(seq); st.edit = k; st.u = keys[k] ?? 0;
    if (changed || rebuild) rebuildGhosts();
    if (rebuild && trailGroup.visible) buildTrails();
    update();
  }
  function select(name) { st.part = name ?? null; update(); }
  const cvs = renderer.domElement, ray = new THREE.Raycaster(), hit = new THREE.Vector3();
  // Position d'une poignée à l'écran (pixels de la page) : pour l'attraper, et pour les essais automatiques.
  function screenOf(name) {
    const m = handles.find(h => h.userData.name === name); if (!m?.visible) return null;
    camera.updateMatrixWorld(); const q = m.position.clone().project(camera), b = cvs.getBoundingClientRect();
    return {x: b.left + (q.x + 1) / 2 * b.width, y: b.top + (1 - q.y) / 2 * b.height};
  }
  function pick(e) {
    if (st.edit === null || st.playing) return null;
    let best = null, bd = e.pointerType === 'touch' ? 34 : 22;
    for (const m of handles) { const q = screenOf(m.userData.name), d = q ? Math.hypot(q.x - e.clientX, q.y - e.clientY) : Infinity; if (d < bd) { bd = d; best = m.userData.name; } }
    return best;
  }
  function rayAt(e) {
    const b = cvs.getBoundingClientRect(); camera.updateMatrixWorld();
    ray.setFromCamera(new THREE.Vector2((e.clientX - b.left) / b.width * 2 - 1, -(e.clientY - b.top) / b.height * 2 + 1), camera); return ray.ray;
  }
  if (edit) {
    box.addEventListener('pointerdown', e => {
      if (!e.isPrimary || e.button > 0 || st.drag) return;
      const name = pick(e); if (!name) return;
      e.stopPropagation(); e.preventDefault();   // la caméra ne bouge pas : on tient une partie du corps
      const k = seq.keys[st.edit], ex = extrasOf(seq, k.pose), pl = dragPlane(name, k.pose, ex, dims), r0 = rayAt(e), n = V(pl.normal).normalize();
      // Plan vu par la tranche : plan face à la caméra (vertical pour le bassin, qui ne fait que glisser sur le sol).
      if (Math.abs(n.dot(r0.direction)) < 0.25) { camera.getWorldDirection(n); if (HANDLES[name].kind === 'pelvis') { n.y = 0; if (n.lengthSq() < 1e-6) n.set(1, 0, 0); n.normalize(); } }
      const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(n, V(pl.point));
      if (!r0.intersectPlane(plane, hit)) return;
      st.drag = {name, id: e.pointerId, start: JSON.parse(JSON.stringify(k.pose)), ex, plane, offset: V(pl.point).sub(hit), moved: false};
      controls.enabled = false; try { cvs.setPointerCapture(e.pointerId); } catch {} cvs.style.cursor = 'grabbing';
      st.part = name; edit.onPart?.(name); update();
    }, true);
    box.addEventListener('pointermove', e => {
      if (!st.drag) { if (e.pointerType === 'mouse') { const h = pick(e); if (h !== st.hover) { st.hover = h; cvs.style.cursor = h ? 'grab' : ''; update(); } } return; }
      if (e.pointerId !== st.drag.id) return;
      e.stopPropagation();
      if (!rayAt(e).intersectPlane(st.drag.plane, hit)) return;
      const t = hit.add(st.drag.offset);
      seq.keys[st.edit].pose = solve(st.drag.name, st.drag.start, st.drag.ex, dims, [t.x, t.y, t.z]);
      st.drag.moved = true; update(); edit.onChange?.(st.edit);
    }, true);
    const release = e => {
      if (!st.drag || e.pointerId !== st.drag.id) return;
      e.stopPropagation(); const moved = st.drag.moved; st.drag = null;
      controls.enabled = Boolean(VIEWS[st.view]); cvs.style.cursor = ''; try { cvs.releasePointerCapture(e.pointerId); } catch {}
      if (moved) { edit.onCommit?.(st.edit); if (trailGroup.visible) buildTrails(); }
    };
    box.addEventListener('pointerup', release, true); box.addEventListener('pointercancel', release, true);
  }
  const ro = new ResizeObserver(() => { const [W, Hh] = size(); renderer.setSize(W, Hh); camera.aspect = W / Hh; camera.updateProjectionMatrix(); });
  ro.observe(box);
  update(); raf = requestAnimationFrame(frame);
  const stop = () => { alive = false; cancelAnimationFrame(raf); ro.disconnect(); controls.dispose(); renderer.dispose(); scene.traverse(o => { o.geometry?.dispose?.(); }); };
  // Le lecteur reste pilotable après le montage (Visualiser, atelier de mouvement) ; il est aussi rangé sur son conteneur.
  const api = Object.assign(stop, {setSequence: load, setSecond, setSkeleton, editKey, select, screenOf, redraw: update});
  host.m3d = api;
  return api;
}
