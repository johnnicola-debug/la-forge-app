// Carte du corps (face et dos) : saisie des courbatures au bilan de séance, et vue des 4 dernières semaines.
import {ZONES, LEVELS, soreness, recentPain, weeklyLoad} from '../engine/body.js';
import {esc} from '../ui.js';

// Zones dessinées (repère 300 × 330 : face à gauche, dos à droite décalé de 160).
const SHAPES = {
  epaules: [[40, 64, 14, 9], [100, 64, 14, 9]], bras: [[26, 110, 8, 30], [114, 110, 8, 30]], poignets: [[26, 182, 8, 9], [114, 182, 8, 9]],
  poitrine: [[70, 88, 28, 16]], abdos: [[70, 138, 22, 26]], hanches: [[48, 184, 12, 10], [92, 184, 12, 10]], 'cuisses-avant': [[53, 228, 12, 26], [87, 228, 12, 26]],
  genoux: [[53, 266, 10, 9], [87, 266, 10, 9]], chevilles: [[53, 307, 9, 8], [87, 307, 9, 8]],
  nuque: [[230, 48, 9, 7]], 'haut-dos': [[230, 92, 30, 22]], 'bas-dos': [[230, 150, 22, 16]], fessiers: [[215, 186, 15, 13], [245, 186, 15, 13]],
  'cuisses-arriere': [[213, 232, 12, 24], [247, 232, 12, 24]], mollets: [[213, 283, 10, 18], [247, 283, 10, 18]]
};
const LEVEL_COLOR = ['transparent', 'rgba(216,178,94,.6)', 'rgba(224,138,76,.8)', 'rgba(224,80,60,.95)'];

function silhouette(dx) {
  return `<g class="bm-base" transform="translate(${dx} 0)"><circle cx="70" cy="28" r="17"/><rect x="62" y="42" width="16" height="14" rx="4"/>
    <path d="M36 58 Q70 48 104 58 L108 140 Q104 176 100 200 L40 200 Q36 176 32 140 Z"/>
    <rect x="17" y="60" width="18" height="128" rx="9"/><rect x="105" y="60" width="18" height="128" rx="9"/><circle cx="26" cy="196" r="9"/><circle cx="114" cy="196" r="9"/>
    <rect x="40" y="196" width="27" height="116" rx="12"/><rect x="73" y="196" width="27" height="116" rx="12"/><ellipse cx="53" cy="318" rx="14" ry="6"/><ellipse cx="87" cy="318" rx="14" ry="6"/></g>`;
}

// levels : {zone: 1..3} (saisie) ; heat : {zone: 0..1} (4 semaines). interactive : zones cliquables.
export function bodyMapSvg({levels = {}, heat = null, interactive = false, label = 'Carte du corps'} = {}) {
  const fill = z => heat ? (heat[z] ? `rgba(224,90,64,${(0.18 + heat[z] * 0.75).toFixed(2)})` : 'transparent') : LEVEL_COLOR[levels[z] ?? 0];
  return `<svg class="bodymap ${interactive ? 'interactive' : ''}" viewBox="0 0 300 330" role="${interactive ? 'group' : 'img'}" aria-label="${esc(label)}">
    ${silhouette(0)}${silhouette(160)}<text class="bm-cap" x="70" y="12">Face</text><text class="bm-cap" x="230" y="12">Dos</text>
    ${Object.entries(SHAPES).map(([z, list]) => `<g class="bm-zone lvl-${levels[z] ?? 0}" data-zone="${z}" ${interactive ? `tabindex="0" role="button" aria-label="${esc(ZONES[z])} : ${LEVELS[levels[z] ?? 0]}"` : ''}>
      <title>${esc(ZONES[z])}${heat ? '' : ` : ${LEVELS[levels[z] ?? 0]}`}</title>${list.map(([cx, cy, rx, ry]) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill(z)}"/>`).join('')}</g>`).join('')}</svg>`;
}

// Saisie au bilan : chaque toucher fait passer la zone au niveau suivant (rien → légère → forte → douleur → rien).
export function wireBodyInput(host, levels, onChange) {
  const cycle = z => { levels[z] = ((levels[z] ?? 0) + 1) % 4; if (!levels[z]) delete levels[z]; host.innerHTML = bodyMapSvg({levels, interactive: true}); wire(); onChange?.(levels); };
  const wire = () => host.querySelectorAll('[data-zone]').forEach(g => {
    g.addEventListener('click', () => cycle(g.dataset.zone));
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cycle(g.dataset.zone); } });
  });
  host.innerHTML = bodyMapSvg({levels, interactive: true}); wire();
}

const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const dm = t => { const d = new Date(t); return `${d.getDate()} ${MONTHS[d.getMonth()]}`; };

// Tableau « corps et charge » : carte des 4 semaines, charge par semaine, douleurs récentes.
export function bodyBoard(sessions, now = Date.now()) {
  const sore = soreness(sessions, now), heat = Object.fromEntries(Object.entries(sore).map(([z, o]) => [z, o.heat])), pain = recentPain(sessions, now);
  const load = weeklyLoad(sessions, now), max = Math.max(100, ...load.map(w => w.load)), W = 420, H = 150, bw = W / load.length;
  const top = Object.entries(sore).sort((a, b) => b[1].heat - a[1].heat).slice(0, 4);
  return `<section class="panel ink body-board">
    <div class="bb-map"><figure><figcaption>◍ Carte du corps · 4 semaines</figcaption>${bodyMapSvg({heat, label: 'Courbatures déclarées sur 4 semaines'})}</figure>
      ${top.length ? `<ul class="bb-top">${top.map(([z, o]) => `<li><i style="background:rgba(224,90,64,${(0.25 + o.heat * 0.7).toFixed(2)})"></i>${esc(ZONES[z])}<small>${o.count}×</small></li>`).join('')}</ul>` : '<p class="subtle">Signalez vos courbatures au bilan de séance : la carte se colorera.</p>'}</div>
    <figure class="bb-load"><figcaption>⚖ Charge par semaine (effort × minutes)</figcaption>
      <svg class="chart" viewBox="0 0 ${W} ${H + 22}" role="img" aria-label="Charge d’entraînement par semaine">
        ${load.map((w, i) => { const h = w.load / max * H * 0.9; return `<rect class="bar ${i === load.length - 1 ? 'now' : ''}" x="${i * bw + 5}" y="${H - h}" width="${bw - 10}" height="${Math.max(h, w.load ? 2 : 0)}" rx="3"><title>${dm(w.start)} : ${w.load}</title></rect>
          ${i % 2 === 1 || i === load.length - 1 ? `<text class="ax" x="${i * bw + bw / 2}" y="${H + 16}" text-anchor="middle">${i === load.length - 1 ? 'cette sem.' : dm(w.start)}</text>` : ''}`; }).join('')}
        <line class="base" x1="0" x2="${W}" y1="${H}" y2="${H}"/></svg>
      ${pain.length ? `<p class="bb-pain">⚠ Douleur signalée cette semaine : ${pain.map(z => esc(ZONES[z])).join(', ')}. Une douleur n’est pas une courbature : ménagez la zone, et demandez un avis médical si elle persiste.</p>` : ''}
      <p class="subtle">Méthode « session-RPE » (Foster, 2001) : un repère pour voir les semaines chargées, pas une norme.</p></figure></section>`;
}
