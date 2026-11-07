// Arène de réaction : quatre cibles autour du centre ; frapper la bonne direction (flèches du clavier ou toucher la cible),
// laisser passer les leurres (cibles vermillon). Visuel d'abord : les cibles s'allument, éclatent, la série et les
// résultats s'affichent en pastilles. Les séries fiables sont consignées dans « Mon reflet » (origine : mesurée, écran).
import {DIRS, KEYS, LEVELS, plan, judge, score} from '../engine/arena.js';
import {uid, pushLimited} from '../store.js';
import {$, esc, page, fmtDate, notify} from '../ui.js';

const ARROW = {haut: '▲', droite: '▶', bas: '▼', gauche: '◀'};
const KIND = {touche: ['hit', 'Touché'], 'mauvais-cote': ['bad', 'Mauvais côté'], 'trop-tard': ['late', 'Trop tard'], anticipation: ['bad', 'Anticipé'],
  'leurre-ignore': ['held', 'Leurre ignoré'], 'leurre-frappe': ['bad', 'Leurre frappé']};

function historyChart(s) {
  const pts = s.measurements.filter(m => m.test.startsWith('reaction-arene-') && typeof m.value === 'number').sort((a, b) => a.date.localeCompare(b.date)).slice(-24);
  if (pts.length < 2) return '<p class="subtle">Vos séries fiables dessineront ici votre courbe (temps médian par niveau).</p>';
  const W = 600, H = 150, vals = pts.map(p => p.value), lo = Math.min(...vals) - 20, hi = Math.max(...vals) + 20;
  const x = i => 20 + i * (W - 40) / (pts.length - 1), y = v => 10 + (v - lo) / (hi - lo) * (H - 20);   // plus bas = plus rapide
  const color = {1: '#6db8a0', 2: '#d8b25e', 3: '#f0735a'};
  return `<svg class="chart" viewBox="0 0 ${W} ${H + 18}" role="img" aria-label="Temps de réaction médian, série après série">
    <text class="ax" x="${W - 20}" y="12" text-anchor="end">lent ${Math.round(hi)} ms</text><text class="ax" x="${W - 20}" y="${H}" text-anchor="end">rapide ${Math.round(lo)} ms</text>
    <polyline class="line" points="${pts.map((p, i) => `${x(i)},${H - y(p.value) + 10}`).join(' ')}"/>
    ${pts.map((p, i) => `<circle cx="${x(i)}" cy="${H - y(p.value) + 10}" r="6" fill="${color[p.details?.level] ?? '#aaa'}"><title>${fmtDate(p.date)} · niveau ${p.details?.level} · ${p.value} ms · précision ${p.details?.accuracy} %</title></circle>`).join('')}</svg>`;
}

export function render(ctx, app) {
  document.body.classList.add('scene');
  ctx.cleanup.push(() => document.body.classList.remove('scene'));
  const s = ctx.state, A = ctx.arena ??= {level: 1, last: null};
  app.innerHTML = page('Arène de réaction', `
  <section class="arena-wrap">
    <div class="arena" id="arena" tabindex="0" aria-label="Arène : flèches du clavier ou toucher la cible allumée">
      ${DIRS.map(d => `<button class="pad pad-${d}" data-dir="${d}" aria-label="${d}"><span>${ARROW[d]}</span></button>`).join('')}
      <div class="core" id="core"><b id="big">▶</b><small id="msg">Toucher pour commencer</small></div>
      <div class="streak" id="streak"></div>
    </div>
    <div class="arena-side">
      <div class="levels">${Object.entries(LEVELS).map(([k, L]) => `<button data-level="${k}" aria-pressed="${A.level === Number(k)}"><b>${'●'.repeat(k)}${'○'.repeat(3 - k)}</b>${esc(L.name)}<small>${L.window} ms${L.lures ? ' · leurres' : ''}</small></button>`).join('')}</div>
      <div class="dots" id="dots"></div>
      <div id="result">${A.last ? resultHtml(A.last) : ''}</div>
      <figure><figcaption>⏱ Mes séries</figcaption>${historyChart(s)}</figure>
      <details class="cr-more"><summary>Règles et limites</summary><p>Jade : frapper la direction (flèches, ZQSD/WASD ou toucher). Vermillon : ne rien faire.
      Un appui avant la cible compte comme anticipation. Le délai de l’écran et du clavier s’ajoute au temps mesuré : comparez-vous seulement à vous-même, sur le même appareil.</p></details>
    </div>
  </section>`);

  const arena = $('#arena'), core = $('#core'), big = $('#big'), msg = $('#msg'), dots = $('#dots'), streakEl = $('#streak');
  let run = null, timer = 0;
  const light = (dir, cls) => { arena.querySelectorAll('.pad').forEach(p => p.classList.remove('go', 'lure', 'hit', 'bad')); if (dir) arena.querySelector(`.pad-${dir}`).classList.add(cls); };
  const arm = () => {
    const t = run.trials[run.i]; run.phase = 'wait'; light(null); big.textContent = '·'; msg.textContent = `${run.i + 1} / ${run.trials.length}`;
    timer = setTimeout(() => {
      run.phase = 'signal'; run.shown = performance.now(); light(t.dir, t.lure ? 'lure' : 'go'); big.textContent = t.lure ? '✕' : ARROW[t.dir];
      timer = setTimeout(() => record(null, null), LEVELS[run.level].window + (t.lure ? 150 : 0));
    }, t.delay);
  };
  const record = (answer, rt, early = false) => {
    clearTimeout(timer);
    const t = run.trials[run.i], kind = judge(t, answer, rt, run.level, early);
    run.results.push({kind, rt, lure: t.lure, dir: t.dir});
    const [cls, label] = KIND[kind];
    if (answer) arena.querySelector(`.pad-${answer}`)?.classList.add(cls === 'hit' ? 'hit' : 'bad');
    dots.insertAdjacentHTML('beforeend', `<i class="dot-${cls}" title="${label}${rt ? ` · ${Math.round(rt)} ms` : ''}"></i>`);
    big.textContent = kind === 'touche' ? Math.round(rt) : cls === 'held' ? '✓' : '✕'; msg.textContent = label;
    core.className = 'core ' + cls;
    const sc = score(run.results); streakEl.textContent = sc.bestStreak > 2 ? `série ${currentStreak(run.results)}` : '';
    if (kind === 'touche') ctx.gong?.();
    run.phase = 'pause'; run.i++;
    timer = setTimeout(() => { core.className = 'core'; if (run.i >= run.trials.length) finish(); else arm(); }, 650);
  };
  const currentStreak = rs => { let n = 0; for (let i = rs.length - 1; i >= 0 && ['touche', 'leurre-ignore'].includes(rs[i].kind); i--) n++; return n; };
  const finish = () => {
    const sc = {...score(run.results), level: run.level}; A.last = sc; light(null);
    if (sc.reliable) {
      pushLimited(s.measurements, {id: uid(), test: 'reaction-arene-' + run.level, value: sc.median, unit: 'ms', origin: 'mesuree', date: new Date().toISOString(),
        context: `Arène, niveau ${run.level} (${LEVELS[run.level].name}), écran non étalonné`, details: {level: run.level, accuracy: sc.accuracy, hits: sc.hits, targets: sc.targets, luresHeld: sc.luresHeld, lures: sc.lures, anticipations: sc.anticipations, bestStreak: sc.bestStreak}});
      ctx.save();
    }
    run = null; ctx.render();
  };
  const start = () => { dots.innerHTML = ''; run = {level: A.level, trials: plan(A.level), i: 0, results: []}; core.className = 'core'; arm(); };
  const press = dir => {
    if (!run) return start();
    if (run.phase === 'wait') return record(dir, null, true);
    if (run.phase === 'signal') record(dir, performance.now() - run.shown);
  };
  arena.querySelectorAll('.pad').forEach(p => p.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); press(p.dataset.dir); }));
  core.addEventListener('pointerdown', e => { e.preventDefault(); if (!run) start(); });
  const onKey = e => { const d = KEYS[e.code]; if (d) { e.preventDefault(); if (!e.repeat) press(d); } else if ((e.code === 'Space' || e.code === 'Enter') && !run) { e.preventDefault(); start(); } };
  addEventListener('keydown', onKey);
  app.querySelectorAll('[data-level]').forEach(b => b.onclick = () => { if (run) return; A.level = Number(b.dataset.level); ctx.render(); });
  ctx.cleanup.push(() => { clearTimeout(timer); removeEventListener('keydown', onKey); });
  (ctx.onHide ??= []).push(() => { if (run) { clearTimeout(timer); run = null; ctx.render(); notify('Série interrompue (onglet masqué).'); } });
}

function resultHtml(r) {
  return `<div class="arena-result"><div><b>${r.median ?? '—'}</b><span>ms médian</span></div><div><b>${r.accuracy}%</b><span>précision</span></div>
    <div><b>${r.bestStreak}</b><span>meilleure série</span></div>${r.lures ? `<div><b>${r.luresHeld}/${r.lures}</b><span>leurres évités</span></div>` : ''}</div>
    <p class="subtle">${r.reliable ? 'Série consignée dans Mon reflet.' : 'Moins de 6 touches : série non consignée.'}${r.anticipations ? ` ${r.anticipations} anticipation(s).` : ''}</p>`;
}
