// Entraînement : objectif → capacités → programme → séance guidée → bilan.
import {goals, programs} from '../data/programs.js';
import {exercises} from '../data/exercises.js';
import {capacities} from '../data/assessments.js';
import {EQUIPMENT, uid, pushLimited} from '../store.js';
import {fitTemplate, buildSteps, startRun, play, pause, next, previous, remaining, stepElapsed, activeElapsed, isOver, summarize, nextTemplate, programWeek, estimateSeconds} from '../engine/coach.js';
import {$, esc, page, fmtDate, fmtClock, notify, landscape} from '../ui.js';
import {still} from './movement.js';
import {progressBoard} from './charts.js';

export const byId = Object.fromEntries(exercises.map(e => [e.id, e]));
const KIND = {preparation: 'Préparation', travail: 'Exercice', repos: 'Repos', 'retour-au-calme': 'Retour au calme'};

export function render(ctx, app, [sub, arg]) {
  if (sub === 'seance') return runner(ctx, app);
  if (sub === 'exercice') return exercisePage(ctx, app, arg);
  overview(ctx, app, arg);
}

function overview(ctx, app, chosenGoal) {
  const s = ctx.state, p = s.profile;
  const active = s.program && programs.find(x => x.id === s.program.id);
  const goal = goals.find(g => g.id === chosenGoal) ?? (active && goals.find(g => g.id === active.goalId)) ?? goals.find(g => p.goals.includes(g.id)) ?? goals[0];
  const prog = programs.find(x => x.id === goal.programId);
  const template = active?.id === prog.id ? nextTemplate(prog, s.sessions) : prog.sessions[0];
  const fit = fitTemplate(template, p.minutes);
  const built = buildSteps(fit.template, byId, p.equipment);
  app.innerHTML = page('Entraînement', `
  <section class="hero">${landscape()}<span class="kicker">Coaching</span><h1>S’entraîner pour pratiquer<span class="dot">.</span></h1>
  <p class="intro">Choisissez ce que vous voulez développer. LA FORGE explique quelles capacités sont travaillées, pourquoi, et comment s’y prendre.</p></section>
  ${progressBoard(s.sessions)}
  <div class="train-quick"><a class="tile" href="#reaction"><b>◎</b><span>Arène de réaction</span><small>3 niveaux · leurres</small></a>
    <a class="tile" href="#inventer"><b>✧</b><span>Le Creuset</span><small>inventer une technique</small></a>${s.activeSession ? `<a class="tile hot" href="#entrainement/seance"><b>▶</b><span>Reprendre</span><small>séance en cours</small></a>` : ''}</div>
  ${s.activeSession ? `<div class="notice jade"><strong>Une séance est en cours :</strong> ${esc(s.activeSession.title)}. <a href="#entrainement/seance">Reprendre la séance</a></div>` : ''}
  <div class="tabs" role="tablist">${goals.map(g => `<button role="tab" aria-selected="${g.id === goal.id}" data-goal="${g.id}">${esc(g.name)}${active?.goalId === g.id ? ' ●' : ''}</button>`).join('')}</div>
  <div class="split">
    <section class="panel"><div class="head"><h2>${esc(goal.name)}</h2>${active?.id === prog.id ? '<span class="pill jade">Programme suivi</span>' : ''}</div>
      <p>${esc(goal.description)}</p>
      <h3>Capacités travaillées et pourquoi</h3>
      <dl class="kv">${goal.capacities.map(c => `<dt>${esc(capacities[c.id] ?? c.id)}</dt><dd>${esc(c.why)}</dd>`).join('')}</dl>
      <p class="subtle">Ces liens sont des choix courants de préparation physique, présentés comme des propositions : ils ne garantissent aucun résultat en combat.</p>
      <h3>${esc(prog.name)} · ${prog.weeks} semaines · ${prog.sessions.length} séances en alternance</h3>
      <p>${esc(prog.explanation)}</p>
      <details><summary>Comment progresser</summary><p>${esc(prog.progression)}</p></details>
      <details><summary>Les séances du programme</summary>${prog.sessions.map(t => `<p><strong>Séance ${esc(t.id)} — ${esc(t.title)}</strong> · ${esc(t.focus)}<br>
        <small>${t.main.map(b => esc(byId[b.exerciseId]?.name ?? b.exerciseId)).join(' · ')} · ≈ ${Math.round(estimateSeconds(t) / 60)} min</small></p>`).join('')}</details>
      <div class="actions">${active?.id === prog.id
        ? `<span class="subtle">Commencé le ${fmtDate(s.program.startedAt)} · semaine ${programWeek(prog, s.program.startedAt, Date.now())} / ${prog.weeks}</span><button id="leave">Quitter ce programme</button>`
        : `<button class="primary" id="follow">Suivre ce programme</button>`}</div>
    </section>
    <section class="panel ink"><h2>Prochaine séance</h2>
      <p class="serif">${esc(prog.name)} · Séance ${esc(template.id)} — ${esc(template.title)}</p>
      <p><strong>≈ ${Math.round(fit.seconds / 60)} min</strong> <small>(estimation, ${p.minutes} min disponibles)</small></p>
      ${fit.over ? '<p class="notice">Cette séance dépasse votre temps disponible même raccourcie : faites-la plus tard ou choisissez une autre séance.</p>' : ''}
      ${fit.changes.length ? `<p class="subtle">Adaptée à votre temps : ${esc(fit.changes.join(' ; '))}.</p>` : ''}
      ${built.notes.length ? `<p class="subtle">Adaptée à votre matériel : ${esc(built.notes.join(' ; '))}.</p>` : ''}
      <ol class="steps">${[...fit.template.warmup.map(w => ['Préparation', w.exerciseId, `${Math.round(w.durationSec / 60 * 10) / 10} min`]),
        ...fit.template.main.map(b => ['Exercice', b.exerciseId, `${b.sets} × ${b.reps ? b.reps + ' rép.' : b.durationSec + ' s'} · repos ${b.restSec} s`]),
        ...fit.template.cooldown.map(c => ['Retour au calme', c.exerciseId, `${Math.round(c.durationSec / 60 * 10) / 10} min`])]
        .map(([k, id, d]) => `<li><small>${k}</small> <a href="#entrainement/exercice/${id}">${esc(byId[id]?.name ?? id)}</a> <small>${esc(d)}</small></li>`).join('')}</ol>
      ${p.adult ? `<button class="primary" id="start" ${s.activeSession ? 'disabled' : ''}>Commencer la séance</button>`
        : `<p><a href="#profil">Complétez votre profil et la déclaration de pratique</a> pour commencer.</p>`}
    </section>
  </div>
  <div class="notice">Commencez en dessous de vos possibilités, dans un espace dégagé. Arrêtez en cas de douleur, de vertige ou de malaise ; une douleur thoracique ou un essoufflement inhabituel demande une aide médicale. Ces séances ne remplacent pas un accompagnement individuel.</div>
  <section class="panel"><h2>Historique</h2>${history(s)}</section>`);
  app.querySelectorAll('[data-goal]').forEach(b => b.onclick = () => ctx.go('entrainement/' + b.dataset.goal));
  $('#follow')?.addEventListener('click', () => { s.program = {id: prog.id, startedAt: new Date().toISOString()}; ctx.save(); notify('Programme suivi.'); ctx.render(); });
  $('#leave')?.addEventListener('click', () => { if (confirm('Quitter ce programme ? L’historique est conservé.')) { s.program = null; ctx.save(); ctx.render(); } });
  $('#start')?.addEventListener('click', () => {
    s.activeSession = startRun({id: uid(), title: `${prog.name} · Séance ${template.id}`, programId: active?.id === prog.id ? prog.id : null,
      templateId: template.id, steps: built.steps, plannedMin: Math.round(fit.seconds / 60), notes: [...fit.changes, ...built.notes]}, Date.now());
    ctx.save(); ctx.go('entrainement/seance');
  });
}

function history(s) {
  if (!s.sessions.length) return '<p class="empty">Vos séances apparaîtront ici après le bilan.</p>';
  return `<div class="scroll"><table><thead><tr><th>Date</th><th>Séance</th><th>Temps actif mesuré</th><th>Prévu</th><th>Séries faites</th><th>Effort déclaré</th><th>Statut</th></tr></thead><tbody>
  ${s.sessions.slice(0, 50).map(h => { const sets = h.blocks.flatMap(b => b.sets), done = sets.filter(x => x.done).length;
    return `<tr><td>${fmtDate(h.startedAt)}</td><td>${esc(h.title)}</td><td>${h.activeSec !== null ? fmtClock(h.activeSec) : '<span class="subtle">non mesuré</span>'}</td>
    <td>${h.plannedMin ?? '—'} min</td><td>${sets.length ? `${done} / ${sets.length}` : '—'}</td><td>${h.effort ?? '—'}${h.effort ? ' / 10' : ''}</td>
    <td>${{terminee: 'Terminée', arretee: 'Arrêtée', 'importee-v1': 'Reprise v0.1'}[h.status]}</td></tr>`; }).join('')}</tbody></table></div>`;
}

// ——— Séance guidée ———
let audio;
function beep(freq = 660, ms = 160) {
  try { audio ??= new AudioContext(); const o = audio.createOscillator(), g = audio.createGain(); o.frequency.value = freq; g.gain.value = 0.06;
    o.connect(g).connect(audio.destination); o.start(); o.stop(audio.currentTime + ms / 1000); } catch {}
}

function runner(ctx, app) {
  const s = ctx.state;
  if (!s.activeSession) { ctx.go('entrainement'); return; }
  // Après un rechargement, la séance reprend en pause au dernier instant enregistré.
  if (s.activeSession.running && !ctx.liveRun) s.activeSession = pause(s.activeSession, s.activeSession.savedAt ?? s.activeSession.runSince);
  ctx.liveRun = true;
  let r = s.activeSession, tick = 0, lastSave = 0;
  const persist = () => { s.activeSession = {...r, savedAt: Date.now()}; ctx.save(); lastSave = Date.now(); };
  const set = nr => { r = nr; persist(); draw(); };
  const draw = () => {
    if (isOver(r)) { exitTatami(); return bilan(ctx, app, r); }
    const step = r.steps[r.index], ex = byId[step.exerciseId], rem = remaining(r, Date.now());
    announce(step, ex);
    if (ctx.tatami) return drawTatami(step, ex, rem);
    const doneCount = r.log.filter(Boolean).length;
    app.innerHTML = page('Séance en cours', `
    <div class="runner"><section class="panel">
      <div class="head"><span class="kind">${KIND[step.kind]}${step.kind === 'travail' ? ` · série ${step.set} / ${step.sets}` : ''}</span><span class="subtle">${esc(r.title)} · étape ${r.index + 1} / ${r.steps.length}</span></div>
      <h1>${step.kind === 'repos' ? 'Repos' : esc(ex?.name ?? step.exerciseId)}</h1>
      ${step.kind === 'repos' ? `<p>Respirez, marchez tranquillement. Ensuite : <strong>${esc(byId[r.steps[r.index + 1]?.exerciseId]?.name ?? '')}</strong>.</p>`
        : `<p class="intro">${step.reps ? `<strong>${step.reps} répétitions</strong>` : ''}${step.durationSec && step.kind === 'travail' ? `<strong>${step.durationSec} secondes</strong>` : ''}</p>`}
      <div class="clock ${step.kind === 'repos' ? 'rest' : ''}" id="clock">${rem !== null ? fmtClock(rem) : fmtClock(Math.floor(stepElapsed(r, Date.now()) / 1000))}</div>
      <div class="ring"><i id="bar"></i></div>
      ${rem === null ? '<p class="subtle">Exercice en répétitions : prenez votre temps, le chronomètre indique seulement la durée écoulée.</p>' : ''}
      <div class="actions">
        <button id="play" class="primary">${r.running ? 'Pause' : r.stepMs || r.activeMs ? 'Reprendre' : 'Démarrer'}</button>
        ${step.kind === 'travail' && step.reps ? `<label>Répétitions faites <input id="reps" type="number" min="0" max="1000" value="${step.reps}" class="inline"></label>` : ''}
        <button id="done">${step.kind === 'repos' ? 'Passer le repos' : step.kind === 'travail' ? 'Série faite' : 'Étape suivante'}</button>
        ${step.kind === 'travail' ? '<button id="skip">Série non faite</button>' : ''}
        <button id="back" ${r.index ? '' : 'disabled'}>◀ Étape précédente</button>
        <button id="stop" class="danger">Arrêter la séance</button>
        <button id="tatami" class="tatami-btn">⛶ Mode mains libres</button>
      </div>
      ${ex && step.kind !== 'repos' ? `<details open><summary>Exécution</summary><ol class="steps">${ex.execution.map(x => `<li>${esc(x)}</li>`).join('')}</ol></details>
        <details><summary>Points d’attention et erreurs fréquentes</summary><ul>${[...ex.cues, ...ex.errors].map(x => `<li>${esc(x)}</li>`).join('')}</ul><p class="subtle">${esc(ex.vigilance)}</p></details>
        <details><summary>Variantes</summary><p>Plus simple : ${esc(ex.easier)}</p><p>Plus exigeant : ${esc(ex.harder)}</p></details>` : ''}
      <p class="subtle">Temps actif mesuré : <span id="active">${fmtClock(Math.floor(activeElapsed(r, Date.now()) / 1000))}</span> · ${doneCount} étapes consignées. La séance est sauvegardée : vous pouvez fermer la page et la reprendre.</p>
    </section>
    <aside class="panel"><h3>Déroulé</h3><ol class="steplist">${r.steps.map((st, i) => `<li class="${i === r.index ? 'now' : r.log[i] ? 'done' : ''}">${KIND[st.kind]}${st.kind !== 'repos' ? ' · ' + esc(byId[st.exerciseId]?.name ?? '') : ` ${st.durationSec} s`}${st.kind === 'travail' ? ` (${st.set}/${st.sets})` : ''}</li>`).join('')}</ol>
      ${r.notes.length ? `<p class="subtle">${esc(r.notes.join(' ; '))}</p>` : ''}</aside></div>`);
    $('.steplist .now')?.scrollIntoView({block: 'nearest'});
    $('#play').onclick = () => set(r.running ? pause(r, Date.now()) : play(r, Date.now()));
    $('#done').onclick = () => set(next(r, Date.now(), {done: true, reps: $('#reps') ? Number($('#reps').value) : null}));
    $('#skip')?.addEventListener('click', () => set(next(r, Date.now(), {done: false})));
    $('#back').onclick = () => set(previous(r, Date.now()));
    $('#stop').onclick = () => {
      if (!confirm('Arrêter la séance ? Vous pourrez enregistrer ce qui a été fait ou tout abandonner.')) return;
      bilan(ctx, app, pause(r, Date.now()), true);
    };
    $('#tatami').onclick = () => { ctx.tatami = true; keepAwake(); draw(); };
    updateClock();
  };
  // ——— Mode mains libres (« tatami ») : lisible à 3 m, grandes zones tactiles, clavier, voix et écran gardé allumé ———
  let spoken = -1, lock = null;
  const say = text => { if (ctx.tatamiVoice === false || !('speechSynthesis' in window)) return; try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'fr-FR'; u.rate = 1.02; speechSynthesis.speak(u); } catch { /* voix indisponible */ } };
  function announce(step, ex) {
    if (!ctx.tatami || spoken === r.index) return;
    spoken = r.index;
    say(step.kind === 'repos' ? `Repos. Ensuite : ${byId[r.steps[r.index + 1]?.exerciseId]?.name ?? 'fin'}.` : `${ex?.name ?? ''}. ${step.kind === 'travail' ? `Série ${step.set} sur ${step.sets}. ` : ''}${step.reps ? `${step.reps} répétitions.` : step.durationSec ? `${step.durationSec} secondes.` : ''}`);
  }
  const keepAwake = async () => { try { lock = await navigator.wakeLock?.request('screen'); } catch { lock = null; } };
  const exitTatami = () => { ctx.tatami = false; spoken = -1; try { lock?.release(); speechSynthesis?.cancel(); } catch { /* rien à libérer */ } lock = null; };
  function drawTatami(step, ex, rem) {
    const total = step.durationSec ?? null, upcoming = r.steps[r.index + 1];
    const icon = {preparation: '↑', travail: '●', repos: '◌', 'retour-au-calme': '↓'}[step.kind];
    app.innerHTML = `<div class="tatami ${step.kind}" id="tatami-view">
      <div class="tt-top"><span>${icon} ${KIND[step.kind]}</span><span>${r.index + 1} / ${r.steps.length}</span>
        <span><button id="tt-voice" aria-pressed="${ctx.tatamiVoice !== false}">♪ Voix</button><button id="tt-exit" aria-label="Quitter le mode mains libres">✕</button></span></div>
      <h1 class="tt-name">${step.kind === 'repos' ? 'Repos' : esc(ex?.name ?? step.exerciseId)}</h1>
      ${step.kind === 'travail' ? `<div class="tt-sets">${Array.from({length: step.sets}, (_, i) => `<i class="${i < step.set - 1 ? 'done' : i === step.set - 1 ? 'now' : ''}"></i>`).join('')}</div>` : '<div class="tt-sets"></div>'}
      <div class="tt-clock"><svg viewBox="0 0 200 200" aria-hidden="true"><circle class="tt-track" cx="100" cy="100" r="88"/><circle class="tt-ring" id="ttring" cx="100" cy="100" r="88" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${total && rem !== null ? 1 - rem / total : 1}"/></svg>
        <div id="clock" class="tt-time">${rem !== null ? fmtClock(rem) : fmtClock(Math.floor(stepElapsed(r, Date.now()) / 1000))}</div></div>
      <div class="tt-target">${step.reps ? `${step.reps} rép.` : total && step.kind === 'travail' ? `${total} s` : ''}</div>
      <div class="tt-next">${upcoming ? `Ensuite · ${upcoming.kind === 'repos' ? 'repos' : esc(byId[upcoming.exerciseId]?.name ?? '')}` : 'Dernière étape'}</div>
      <div class="tt-zones"><button id="tt-back" ${r.index ? '' : 'disabled'} aria-label="Étape précédente">◀</button>
        <button id="tt-play" class="${r.running ? 'on' : ''}" aria-label="${r.running ? 'Pause' : 'Démarrer'}">${r.running ? '❚❚' : '▶'}</button>
        <button id="tt-done" aria-label="${step.kind === 'travail' ? 'Série faite' : 'Étape suivante'}">✓</button></div>
      <span id="active" hidden></span><i id="bar" hidden></i>
    </div>`;
    $('#tt-play').onclick = () => set(r.running ? pause(r, Date.now()) : play(r, Date.now()));
    $('#tt-done').onclick = () => set(next0());
    $('#tt-back').onclick = () => set(previous(r, Date.now()));
    $('#tt-exit').onclick = () => { exitTatami(); draw(); };
    $('#tt-voice').onclick = () => { ctx.tatamiVoice = ctx.tatamiVoice === false; draw(); };
    updateClock();
  }
  const next0 = () => next(r, Date.now(), {done: true, reps: r.steps[r.index].reps ?? null});
  const onKey = e => {
    if (!ctx.tatami || isOver(r)) return;
    const k = e.code;
    if (k === 'Space') { e.preventDefault(); set(r.running ? pause(r, Date.now()) : play(r, Date.now())); }
    else if (k === 'Enter' || k === 'ArrowRight') { e.preventDefault(); set(next0()); }
    else if (k === 'ArrowLeft') { e.preventDefault(); set(previous(r, Date.now())); }
    else if (k === 'Escape') { exitTatami(); draw(); }
  };
  addEventListener('keydown', onKey);
  ctx.cleanup.push(() => { removeEventListener('keydown', onKey); exitTatami(); });
  const updateClock = () => {
    if (isOver(r) || !$('#clock')) return;
    const now = Date.now(), step = r.steps[r.index], rem = remaining(r, now);
    $('#clock').textContent = rem !== null ? fmtClock(rem) : fmtClock(Math.floor(stepElapsed(r, now) / 1000));
    $('#bar').style.width = rem !== null && step.durationSec ? `${100 * (1 - rem / step.durationSec)}%` : '0%';
    $('#ttring')?.setAttribute('stroke-dashoffset', rem !== null && step.durationSec ? String(1 - rem / step.durationSec) : '1');
    $('#active').textContent = fmtClock(Math.floor(activeElapsed(r, now) / 1000));
    if (r.running && rem === 0) { beep(step.kind === 'repos' ? 880 : 520); set(next(r, now, {done: true})); return; }
    if (r.running && rem !== null && rem <= 3 && rem > 0 && rem !== tick) { tick = rem; beep(440, 80); if (ctx.tatami) say(String(rem)); }
    if (r.running && now - lastSave > 5000) persist();
  };
  const iv = setInterval(updateClock, 250);
  ctx.cleanup.push(() => { clearInterval(iv); if (s.activeSession) { r = pause(r, Date.now()); s.activeSession = r; ctx.save(); } ctx.liveRun = false; });
  ctx.onHide.push(() => { if (r.running) set(pause(r, Date.now())); });
  draw();
}

function bilan(ctx, app, r, stopped = false) {
  const s = ctx.state;
  const work = r.steps.filter(x => x.kind === 'travail').length, done = r.steps.filter((x, i) => x.kind === 'travail' && r.log[i]?.done).length;
  app.innerHTML = page('Bilan', `<section class="hero"><span class="kicker">Bilan</span><h1>${stopped ? 'Séance arrêtée' : 'Séance terminée'}<span class="dot">.</span></h1>
  <p class="intro">${esc(r.title)} · temps actif mesuré ${fmtClock(Math.round(r.activeMs / 1000))} · ${done} séries faites sur ${work}.</p></section>
  <form id="bilan" class="panel"><h2>Comment s’est passée la séance ?</h2>
    <label>Effort ressenti (1 très facile — 10 maximal)<input type="number" name="effort" min="1" max="10" value="5" required></label>
    <label>Notes (sensations, difficultés, idées pour la suite)<textarea name="notes" rows="3" maxlength="1000"></textarea></label>
    <p class="subtle">Le temps actif est mesuré par le minuteur (pauses exclues) ; les séries cochées sont celles que vous avez validées.</p>
    <div class="actions"><button class="primary">Enregistrer dans l’historique</button><button type="button" id="discard" class="danger">Ne pas enregistrer</button></div></form>`);
  $('#bilan').onsubmit = e => {
    e.preventDefault();
    const d = new FormData(e.target);
    pushLimited(s.sessions, summarize(r, Date.now(), {effort: Number(d.get('effort')), notes: String(d.get('notes')).slice(0, 1000), status: stopped ? 'arretee' : 'terminee'}));
    s.activeSession = null; ctx.save(); notify('Séance enregistrée.'); ctx.go('entrainement');
  };
  $('#discard').onclick = () => { if (confirm('Abandonner cette séance sans l’enregistrer ?')) { s.activeSession = null; ctx.save(); ctx.go('entrainement'); } };
}

function exercisePage(ctx, app, id) {
  const ex = byId[id];
  if (!ex) { ctx.go('entrainement'); return; }
  app.innerHTML = page('Exercice', `<section class="hero"><span class="kicker"><a href="#entrainement">Entraînement</a></span><h1>${esc(ex.name)}<span class="dot">.</span></h1>
  <p>${ex.capacities.map(c => `<span class="pill jade">${esc(capacities[c] ?? c)}</span>`).join('')}<span class="pill status-${ex.status}">${ex.status === 'brouillon' ? 'Brouillon IA, à relire' : esc(ex.status)}</span>
  ${ex.equipment.length ? ex.equipment.map(e => `<span class="pill">${esc(EQUIPMENT[e] ?? e)}</span>`).join('') : '<span class="pill">Sans matériel</span>'}</p></section>
  <div class="split"><section class="panel"><h2>Exécution</h2><ol class="steps">${ex.execution.map(x => `<li>${esc(x)}</li>`).join('')}</ol>
    <h3>Points d’attention</h3><ul>${ex.cues.map(x => `<li>${esc(x)}</li>`).join('')}</ul><h3>Erreurs fréquentes</h3><ul>${ex.errors.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
    <div class="notice">${esc(ex.vigilance)}</div></section>
  <section class="panel"><h2>Pour la pratique martiale</h2><p>${esc(ex.martialLink)}</p><h3>Variantes</h3><p><strong>Plus simple :</strong> ${esc(ex.easier)}</p><p><strong>Plus exigeant :</strong> ${esc(ex.harder)}</p>
    ${ex.alternatives.length ? `<h3>Remplaçants</h3><p>${ex.alternatives.map(a => `<a href="#entrainement/exercice/${a}">${esc(byId[a]?.name ?? a)}</a>`).join(' · ')}</p>` : ''}</section></div>`);
}

