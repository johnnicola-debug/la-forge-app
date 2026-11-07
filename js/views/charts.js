// Graphiques de progression (SVG, couleurs du thème). Ils ne montrent que des séances réellement enregistrées ;
// sans données, ils affichent un cadre vide qui dit ce qui apparaîtra.
import {weekly, heat, effortSeries, streak} from '../engine/stats.js';
import {esc} from '../ui.js';

const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const dm = t => { const d = new Date(t); return `${d.getDate()} ${MONTHS[d.getMonth()]}`; };

// Minutes actives par semaine : barres, la semaine en cours mise en avant.
export function weeklyBars(sessions, now = Date.now()) {
  const w = weekly(sessions, now), max = Math.max(30, ...w.map(x => x.minutes)), W = 600, H = 170, bw = W / w.length;
  const nice = Math.ceil(max / 30) * 30;
  return `<svg class="chart" viewBox="0 0 ${W} ${H + 26}" role="img" aria-label="Minutes actives par semaine, 12 dernières semaines">
    ${[0.5, 1].map(f => `<line class="grid" x1="0" x2="${W}" y1="${H - H * f * 0.9}" y2="${H - H * f * 0.9}"/><text class="ax" x="${W}" y="${H - H * f * 0.9 - 4}" text-anchor="end">${Math.round(nice * f)} min</text>`).join('')}
    ${w.map((x, i) => { const h = x.minutes / nice * H * 0.9; return `<g><rect class="bar ${i === w.length - 1 ? 'now' : ''}" x="${i * bw + 6}" y="${H - h}" width="${bw - 12}" height="${Math.max(h, x.minutes ? 2 : 0)}" rx="3"><title>${dm(x.start)} : ${x.minutes} min, ${x.sessions} séance(s)</title></rect>
      ${i % 3 === 0 || i === w.length - 1 ? `<text class="ax" x="${i * bw + bw / 2}" y="${H + 18}" text-anchor="middle">${i === w.length - 1 ? 'cette sem.' : dm(x.start)}</text>` : ''}</g>`; }).join('')}
    <line class="base" x1="0" x2="${W}" y1="${H}" y2="${H}"/></svg>`;
}

// Régularité : un carré par jour, plus il est lumineux plus la séance a été longue.
export function heatGrid(sessions, now = Date.now()) {
  const {grid, today} = heat(sessions, now), c = 16, g = 4, W = grid.length * (c + g) + 22, H = 7 * (c + g);
  const lvl = m => m === 0 ? 0 : m < 15 ? 1 : m < 30 ? 2 : m < 50 ? 3 : 4;
  return `<svg class="chart heat" viewBox="0 0 ${W} ${H}" role="img" aria-label="Régularité : un carré par jour sur 12 semaines">
    ${['L', '', 'M', '', 'V', '', 'D'].map((l, d) => l ? `<text class="ax" x="0" y="${d * (c + g) + 12}">${l}</text>` : '').join('')}
    ${grid.map((wk, i) => wk.map((m, d) => { const idx = i * 7 + d; return idx > today ? '' : `<rect class="cell l${lvl(m)} ${idx === today ? 'today' : ''}" x="${22 + i * (c + g)}" y="${d * (c + g)}" width="${c}" height="${c}" rx="3"><title>${m} min</title></rect>`; }).join('')).join('')}</svg>`;
}

// Effort déclaré (points) et part des séries faites (barres fines), séance par séance.
export function effortLine(sessions) {
  const e = effortSeries(sessions), W = 600, H = 150;
  if (e.length < 2) return '';
  const x = i => 20 + i * (W - 40) / (e.length - 1), y = v => H - 10 - (v - 1) / 9 * (H - 30);
  return `<svg class="chart" viewBox="0 0 ${W} ${H + 20}" role="img" aria-label="Effort déclaré, séance par séance">
    ${[1, 5, 10].map(v => `<line class="grid" x1="20" x2="${W - 20}" y1="${y(v)}" y2="${y(v)}"/><text class="ax" x="0" y="${y(v) + 4}">${v}</text>`).join('')}
    ${e.map((p, i) => p.done === null ? '' : `<rect class="donebar" x="${x(i) - 3}" y="${H - 10 - p.done * 30}" width="6" height="${p.done * 30}" rx="2"><title>${Math.round(p.done * 100)} % des séries faites</title></rect>`).join('')}
    <polyline class="line" points="${e.map((p, i) => `${x(i)},${y(p.effort)}`).join(' ')}"/>
    ${e.map((p, i) => `<circle class="pt" cx="${x(i)}" cy="${y(p.effort)}" r="5"><title>${dm(p.date)} : effort ${p.effort}/10, ${p.minutes} min</title></circle>`).join('')}
    <text class="ax" x="${x(0)}" y="${H + 16}">${dm(e[0].date)}</text><text class="ax" x="${x(e.length - 1)}" y="${H + 16}" text-anchor="end">${dm(e.at(-1).date)}</text></svg>`;
}

// Bandeau : chiffres clés en grand, puis les graphiques.
export function progressBoard(sessions, now = Date.now()) {
  const w = weekly(sessions, now), mins = w.reduce((t, x) => t + x.minutes, 0), n = w.reduce((t, x) => t + x.sessions, 0), st = streak(sessions, now);
  const empty = !n;
  return `<section class="panel ink progress-board ${empty ? 'empty-board' : ''}">
    <div class="kpis"><div><b>${n}</b><span>séances<br>12 semaines</span></div><div><b>${mins}</b><span>minutes actives<br>mesurées</span></div>
      <div><b>${st}</b><span>jour${st > 1 ? 's' : ''} d’affilée</span></div><div><b>${w.at(-1).minutes}</b><span>min<br>cette semaine</span></div></div>
    <div class="charts"><figure><figcaption>⏱ Minutes par semaine</figcaption>${weeklyBars(sessions, now)}</figure>
      <figure><figcaption>▦ Régularité</figcaption>${heatGrid(sessions, now)}</figure>
      ${effortLine(sessions) ? `<figure class="wide"><figcaption>◉ Effort ressenti · ▮ séries faites</figcaption>${effortLine(sessions)}</figure>` : ''}</div>
    ${empty ? `<p class="subtle">${esc('Vos séances terminées dessineront ces graphiques : rien n’est inventé à votre place.')}</p>` : ''}</section>`;
}
