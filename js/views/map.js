// Carte du monde : naviguer dans LA FORGE comme dans un domaine à explorer. Chaque lieu mène à un espace ;
// les indications (« 3 compétences engagées », « 1 méthode ») viennent des données réelles, rien n'est inventé.
import {skills} from '../data/skills.js';
import {computeAll} from '../engine/progress.js';
import {index} from './tree.js';
import {esc, page} from '../ui.js';

// Lieux : position sur la carte (repère 1000 × 640), glyphe, espace visé.
const PLACES = [
  {id: 'seuil', name: 'Le Seuil', href: '#accueil', x: 500, y: 560, glyph: 'torii', text: 'La porte du domaine'},
  {id: 'reflet', name: 'Le Bassin du reflet', href: '#avatar', x: 250, y: 470, glyph: 'pool', text: 'Votre personnage et vos mesures'},
  {id: 'cour', name: 'La Cour d’entraînement', href: '#entrainement', x: 735, y: 455, glyph: 'court', text: 'Séances guidées'},
  {id: 'pavillon', name: 'Le Pavillon des gestes', href: '#bibliotheque', x: 330, y: 300, glyph: 'pavilion', text: 'La bibliothèque et les corps d’ombre'},
  {id: 'arbre', name: 'Le Grand Arbre', href: '#arbre', x: 525, y: 245, glyph: 'tree', text: 'Vos compétences'},
  {id: 'forge', name: 'La Forge', href: '#forge', x: 735, y: 270, glyph: 'forge', text: 'Mélanger, transférer, créer un style'},
  {id: 'atelier', name: 'L’Atelier', href: '#atelier', x: 870, y: 360, glyph: 'workshop', text: 'Vos méthodes et vos gestes'},
  {id: 'temple', name: 'Le Temple des voies', href: '#voies', x: 520, y: 95, glyph: 'temple', text: 'Foudre, Racine, Vent'},
  {id: 'oracle', name: 'L’Oracle', href: '#orientation', x: 175, y: 175, glyph: 'oracle', text: 'Découvrir vos penchants'},
  {id: 'village', name: 'Le Village des guildes', href: '#guildes', x: 120, y: 360, glyph: 'village', text: 'Pratiquer ensemble (à venir)'},
  {id: 'creuset', name: 'Le Creuset', href: '#inventer', x: 655, y: 150, glyph: 'crucible', text: 'Inventer des techniques'},
  {id: 'archives', name: 'Les Archives', href: '#donnees', x: 880, y: 545, glyph: 'archive', text: 'Sauvegarder, exporter'}
];
const PATHS = [['seuil', 'reflet'], ['seuil', 'cour'], ['seuil', 'archives'], ['reflet', 'pavillon'], ['reflet', 'village'], ['cour', 'forge'], ['cour', 'atelier'],
  ['pavillon', 'arbre'], ['arbre', 'forge'], ['forge', 'atelier'], ['arbre', 'temple'], ['pavillon', 'oracle'], ['oracle', 'temple'], ['village', 'oracle'], ['forge', 'creuset'], ['creuset', 'temple']];

// Petits glyphes à l'encre, dessinés autour de (0, 0).
const G = {
  torii: '<path d="M-34 -30h68M-28 -20h56M-20 -30v44M20 -30v44"/>',
  pool: '<ellipse rx="34" ry="12"/><path d="M-18 -2q18 -8 36 0"/>',
  court: '<rect x="-34" y="-16" width="68" height="32" rx="2"/><circle r="8"/><path d="M0 -16v32"/>',
  pavilion: '<path d="M-40 -6l40 -26 40 26M-30 -6v24M30 -6v24M-36 18h72M-34 -14q34 -10 68 0"/>',
  tree: '<path d="M0 22v-30M0 -2l-14 -12M0 -8l12 -10"/><circle cx="0" cy="-24" r="20"/><circle cx="-18" cy="-12" r="12"/><circle cx="18" cy="-14" r="13"/>',
  forge: '<path d="M-26 18h52M-18 18v-14h36v14M-24 4h48"/><path d="M-8 -6q8 -20 4 -30q16 12 8 30z"/>',
  workshop: '<path d="M-30 18v-26l30 -18 30 18v26z"/><path d="M-10 18v-16h20v16"/>',
  temple: '<path d="M-44 -2l44 -24 44 24M-36 -2v24M-12 -2v24M12 -2v24M36 -2v24M-46 22h92"/><path d="M-30 -14q30 -12 60 0"/>',
  oracle: '<circle r="18"/><circle r="6"/><path d="M-30 0h-8M30 0h8M0 -30v-8M0 30v8"/>',
  village: '<path d="M-36 16v-14l12 -10 12 10v14zM-6 16v-20l14 -12 14 12v20zM24 16v-10l8 -8 8 8v10z"/>',
  crucible: '<path d="M-26 -14h52l-8 30h-36z"/><path d="M-8 -22q4 -10 0 -18M6 -22q4 -8 0 -14"/><circle cx="0" cy="2" r="5"/>',
  archive: '<rect x="-24" y="-20" width="48" height="40" rx="3"/><path d="M-24 -6h48M-24 8h48M-6 -13h12M-6 1h12M-6 15h12"/>'
};

export function render(ctx, app) {
  document.body.classList.add('scene');
  ctx.cleanup.push(() => document.body.classList.remove('scene'));
  const s = ctx.state, st = computeAll(skills, s, index);
  const engaged = skills.filter(k => ['pratique', 'evalue', 'maitrise'].includes(st[k.id].stage)).length;
  const known = s.measurements.length + s.performances.length, methods = s.workshop.methods.length;
  const hint = {arbre: `${engaged} / ${skills.length} compétences engagées`, atelier: methods ? `${methods} méthode(s)` : 'Aucune méthode',
    reflet: known ? `${known} mesure(s) consignée(s)` : 'Aucune mesure', oracle: s.orientation ? 'Orientation faite' : 'À consulter',
    creuset: ctx.creuset?.history?.length ? `${ctx.creuset.history.length} invention(s) cette visite` : 'Inventer des techniques',
    cour: s.activeSession ? 'Une séance en cours' : `${s.sessions.length} séance(s)`};
  const P = Object.fromEntries(PLACES.map(p => [p.id, p]));
  app.innerHTML = page('Carte du monde', `
  <section class="hero compact"><span class="kicker">Le domaine de LA FORGE</span><h1>Carte du monde<span class="dot">.</span></h1>
    <p class="intro">Chaque lieu est un espace de l’application. Choisissez où aller ; le menu reste disponible à tout moment.</p></section>
  <div class="worldmap panel ink">
    <svg viewBox="0 0 1000 640" role="img" aria-labelledby="map-t"><title id="map-t">Carte du domaine : ${PLACES.map(p => esc(p.name)).join(', ')}</title>
      <defs><radialGradient id="wm-moon"><stop offset="0" stop-color="#ecc4aa" stop-opacity=".5"/><stop offset="1" stop-color="#ecc4aa" stop-opacity="0"/></radialGradient>
        <linearGradient id="wm-fog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fb7b0" stop-opacity="0"/><stop offset="1" stop-color="#9fb7b0" stop-opacity=".16"/></linearGradient></defs>
      <circle cx="840" cy="90" r="140" fill="url(#wm-moon)"/><circle cx="840" cy="90" r="34" fill="#e3b9a2" opacity=".55"/>
      <path class="wm-mount" d="M0 210 L120 120 L210 170 L330 70 L440 150 L540 40 L650 140 L760 90 L880 160 L1000 110 V640 H0Z"/>
      <path class="wm-mount2" d="M0 330 L160 250 L300 300 L470 220 L620 290 L790 230 L1000 300 V640 H0Z"/>
      <rect class="wm-fog" y="230" width="1000" height="160" fill="url(#wm-fog)"/>
      <path class="wm-river" d="M60 640 C 200 560, 160 470, 250 470 S 380 520, 420 600 S 520 640, 560 640"/>
      ${PATHS.map(([a, b]) => `<path class="wm-path" d="M${P[a].x} ${P[a].y} Q ${(P[a].x + P[b].x) / 2 + (P[a].y - P[b].y) * 0.12} ${(P[a].y + P[b].y) / 2 + (P[b].x - P[a].x) * 0.08} ${P[b].x} ${P[b].y}"/>`).join('')}
      ${PLACES.map(p => `<a href="${p.href}" class="wm-place" data-place="${p.id}" aria-label="${esc(p.name)} : ${esc(p.text)}">
        <circle class="wm-halo" cx="${p.x}" cy="${p.y}" r="52"/>
        <g class="wm-glyph" transform="translate(${p.x} ${p.y - 6})">${G[p.glyph]}</g>
        <text class="wm-name" x="${p.x}" y="${p.y + 42}">${esc(p.name)}</text>
        <text class="wm-hint" x="${p.x}" y="${p.y + 60}">${esc(hint[p.id] ?? p.text)}</text></a>`).join('')}
    </svg>
  </div>
  <p class="subtle">Les indications sous chaque lieu viennent de vos données ; aucune n’est un niveau ni un score.</p>`);
}
