// Onglet « Profil, réaction et carnet » de Mon reflet. Les performances se saisissent dans l'onglet Personnage (une seule saisie).
import {EXPERIENCE, EQUIPMENT, validMeasurement, uid, pushLimited} from '../store.js';
import {goals} from '../data/programs.js';
import {assessments, capacities} from '../data/assessments.js';
import {MODES, plan, classify, summary, LIMITS} from '../engine/reaction.js';
import {$, esc, page, chips, options, fmtDate, notify, numOrNull} from '../ui.js';
import {refletTabs} from './avatar.js';

export function render(ctx, app) {
  const s = ctx.state, p = s.profile;
  app.innerHTML = page('Mon reflet', `${refletTabs('profil')}
  <section class="hero"><span class="kicker">Mon reflet</span><h1>Profil, réaction et carnet<span class="dot">.</span></h1>
  <p class="intro">Des informations concrètes plutôt que des curseurs : ce que vous savez déjà faire, dans quel contexte. Ce qui est inconnu peut le rester.
  Aucune donnée n’est transformée en score global ni en niveau martial.</p></section>
  <div class="split even">
    <form id="profile" class="panel"><h2>Profil et intentions</h2>
      <label>Prénom ou pseudonyme<input name="name" maxlength="80" value="${esc(p.name)}"></label>
      <fieldset><legend>Ce que vous souhaitez développer</legend>${chips('goals', Object.fromEntries(goals.map(g => [g.id, g.name])), p.goals)}</fieldset>
      <div class="row"><label>Expérience martiale<select name="experience">${options(EXPERIENCE, p.experience)}</select></label>
      <label>Disciplines pratiquées<input name="disciplines" maxlength="300" placeholder="ex. boxe anglaise 2, judo" value="${esc(p.disciplines.map(d => d.name + (d.years !== null ? ' ' + d.years : '')).join(', '))}"></label></div>
      <div class="row"><label>Temps par séance<select name="minutes">${options({20: '20 min', 30: '30 min', 45: '45 min', 60: '60 min'}, p.minutes)}</select></label>
      <label>Séances par semaine<input name="perWeek" type="number" min="1" max="6" value="${p.perWeek}"></label></div>
      <div class="row"><label>Sexe (seulement pour comparer aux normes publiées)<select name="sex">${options({'': 'Non précisé', f: 'Femme', h: 'Homme'}, p.sex ?? '')}</select></label>
      <label>Année de naissance (facultatif)<input name="birthYear" type="number" min="1920" max="${new Date().getFullYear() - 10}" value="${p.birthYear ?? ''}"></label></div>
      <p class="subtle">Ces deux champs servent uniquement à situer vos mesures dans les tables de normes citées (rang F à S). Vides, aucun rang n’est calculé.</p>
      <fieldset><legend>Matériel disponible</legend>${chips('equipment', EQUIPMENT, p.equipment)}</fieldset>
      <label>Contraintes à garder en tête (facultatif, reste privé)<textarea name="constraints" rows="2" maxlength="1000" placeholder="ex. genou droit sensible en flexion profonde, pas de saut à la maison">${esc(p.constraints)}</textarea></label>
      <p class="subtle">Les contraintes sont un rappel pour vous : l’application ne pose aucun diagnostic et n’adapte pas médicalement les séances.</p>
      <label class="check"><input type="checkbox" name="adult" ${p.adult ? 'checked' : ''}>Je suis adulte et je peux pratiquer une activité physique. En cas de doute (douleur, traitement, reprise après blessure), je demande d’abord un avis adapté.</label>
      <div class="actions"><button class="primary">Enregistrer le profil</button></div>
    </form>
    <section class="panel"><h2>Mes performances et mesures</h2><p>Charges, tractions, endurance, mobilité : tout se saisit et se consulte dans l’onglet <a href="#avatar">Personnage et données</a>, avec la date et l’origine de chaque valeur.</p></section>
  </div>
  <div class="split even">
    <section class="panel" id="reaction"><h2>Test de réaction</h2><p><a class="button primary" href="#reaction">◎ Entrer dans l’arène de réaction (3 niveaux, 4 directions, leurres)</a></p>
      <div class="row"><label>Type<select id="rx-mode">${options(Object.fromEntries(Object.entries(MODES).map(([k, v]) => [k, v.name])), 'simple')}</select></label></div>
      <div class="reaction-pad" id="rx-pad" tabindex="0" role="button" aria-label="Zone de réaction : cliquez ou appuyez sur Espace"><div><div class="disc"></div><p id="rx-msg">Cliquez ici pour commencer une série.</p></div></div>
      <p id="rx-res" role="status" class="subtle"></p>
      <details><summary>Limites de ce test</summary><ul>${LIMITS.map(l => `<li>${esc(l)}</li>`).join('')}</ul>
      <p>Les anticipations (appui avant le signal ou en moins de 100 ms) et les réponses de plus de 1,5 s sont écartées. La médiane et l’écart interquartile ne sont calculés que sur les essais valides.</p></details>
      ${reactionHistory(s)}
    </section>
    <section class="panel"><h2>Repères d’observation</h2>
      <p class="subtle">Protocoles simples proposés par LA FORGE (brouillon, non étalonnés). Le résultat ne se compare qu’à vos propres repères.</p>
      ${assessments.map(a => `<details><summary>${esc(a.name)} <span class="pill">${esc(capacities[a.capacity])}</span></summary>
        <p>${esc(a.protocol)}</p>${a.safety ? `<p class="subtle">${esc(a.safety)}</p>` : ''}
        <form class="assess" data-id="${a.id}"><div class="row">${a.input === 'number' ? `<label>Résultat (${esc(a.unit)})<input name="value" inputmode="decimal" required></label>`
          : `<label>Résultat<select name="choice">${a.choices.map(c => `<option>${esc(c)}</option>`).join('')}</select></label>`}
          <label>Contexte<input name="context" maxlength="300" placeholder="ex. côté gauche, le matin"></label></div><button>Consigner</button></form>
        ${lastOf(s, a.id)}</details>`).join('')}
    </section>
  </div>
  <form id="obs" class="panel"><h2>Carnet de pratique</h2><p class="subtle">Sensations, difficultés, idées. Ces notes restent distinctes des mesures.</p>
    <label>Observation<textarea name="text" rows="3" maxlength="1000" required></textarea></label><button>Consigner</button>
    ${s.observations.slice(0, 5).map(o => `<p><small>${fmtDate(o.date)}</small><br>${esc(o.text)}</p>`).join('')}</form>
  ${s.legacy?.declaredFeelings ? `<section class="panel"><h2>Ressenti déclaré en version 0.1</h2><p class="subtle">Conservé tel quel, à titre historique. Il n’est plus utilisé : les capacités reposent désormais sur des données concrètes.</p>
    <p>${Object.entries(s.legacy.declaredFeelings).map(([k, v]) => `${esc(k)} : ${esc(v.value)}/5`).join(' · ')}</p></section>` : ''}
  `);

  $('#profile').onsubmit = e => {
    e.preventDefault();
    const d = new FormData(e.target);
    const disciplines = String(d.get('disciplines')).split(',').map(x => x.trim()).filter(Boolean).slice(0, 20).map(x => {
      const m = x.match(/^(.*?)(?:\s+(\d+(?:[.,]\d+)?))?$/);
      return {name: m[1].slice(0, 80), years: m[2] ? Math.min(80, Number(m[2].replace(',', '.'))) : null};
    });
    s.profile = {name: String(d.get('name')).trim().slice(0, 80), goals: d.getAll('goals'), experience: d.get('experience'), disciplines,
      minutes: Number(d.get('minutes')), perWeek: Math.min(6, Math.max(1, Number(d.get('perWeek')) || 2)), equipment: d.getAll('equipment'),
      constraints: String(d.get('constraints')).slice(0, 1000), adult: d.has('adult'),
      sex: ['f', 'h'].includes(d.get('sex')) ? d.get('sex') : '', birthYear: (y => Number.isInteger(y) && y >= 1920 && y <= 2100 ? y : null)(Number(d.get('birthYear')) || NaN)};
    ctx.save(); notify('Profil enregistré.'); ctx.render();
  };
  app.querySelectorAll('form.assess').forEach(f => f.onsubmit = e => {
    e.preventDefault();
    const a = assessments.find(x => x.id === f.dataset.id), d = new FormData(f);
    const m = {id: uid(), test: a.id, value: a.input === 'number' ? numOrNull(d.get('value')) : null, unit: a.unit, origin: 'declaree',
      date: new Date().toISOString(), context: String(d.get('context')).trim(), details: a.input === 'choice' ? {choice: d.get('choice')} : {}};
    if (!validMeasurement(m) || (a.input === 'number' && (m.value === null || m.value < 0 || m.value > a.max))) { notify('Valeur invalide.'); return; }
    pushLimited(s.measurements, m); ctx.save(); notify('Repère consigné.'); ctx.render();
  });
  $('#obs').onsubmit = e => {
    e.preventDefault();
    const text = String(new FormData(e.target).get('text')).trim();
    if (!text) return;
    pushLimited(s.observations, {id: uid(), date: new Date().toISOString(), text: text.slice(0, 1000)}); ctx.save(); notify('Observation consignée.'); ctx.render();
  };
  mountReaction(ctx);
}

function lastOf(s, test) {
  const list = s.measurements.filter(m => m.test === test).slice(0, 3);
  return list.length ? `<p class="subtle">Derniers repères : ${list.map(m => `${fmtDate(m.date)} — ${esc(m.value ?? m.details?.choice)}${m.value !== null ? ' ' + esc(m.unit) : ''}${m.context ? ` (${esc(m.context)})` : ''}`).join(' · ')}</p>` : '';
}

function reactionHistory(s) {
  const list = s.measurements.filter(m => m.test.startsWith('reaction-')).slice(0, 6);
  return list.length ? `<h3>Mes séries</h3><table><thead><tr><th>Date</th><th>Type</th><th>Médiane</th><th>Écart IQ</th><th>Valides</th></tr></thead><tbody>${list.map(m =>
    `<tr><td>${fmtDate(m.date)}</td><td>${m.test === 'reaction-choix' ? 'À choix' : 'Simple'}</td><td>${m.value ?? '—'} ms</td><td>${m.details?.spread ?? '—'}</td><td>${m.details?.valid ?? '—'}</td></tr>`).join('')}</tbody></table>` : '';
}

// Test de réaction : série complète, faux départs détectés, leurres en mode « à choix ».
export function mountReaction(ctx, {onDone} = {}) {
  const pad = $('#rx-pad'), msg = $('#rx-msg'), res = $('#rx-res'), modeSel = $('#rx-mode');
  if (!pad) return;
  let run = null, timer = 0;
  const reset = text => { clearTimeout(timer); run = null; pad.className = 'reaction-pad'; msg.textContent = text; };
  const arm = () => {
    const t = run.trials[run.i];
    pad.className = 'reaction-pad'; msg.textContent = `Essai ${run.i + 1}/${run.trials.length} — attendez le signal…`;
    run.phase = 'wait';
    timer = setTimeout(() => {
      run.phase = 'signal'; run.shown = performance.now(); pad.classList.add(t.go ? 'go' : 'lure');
      msg.textContent = t.go ? 'Maintenant !' : 'Leurre : ne bougez pas';
      timer = setTimeout(() => record(null), t.go ? 1500 : 1300);
    }, t.delay);
  };
  const finish = () => {
    const sum = summary(run.results), mode = run.mode;
    reset('Série terminée. Cliquez pour recommencer.');
    if (sum.reliable) {
      pushLimited(ctx.state.measurements, {id: uid(), test: 'reaction-' + mode, value: sum.median, unit: 'ms', origin: 'mesuree', date: new Date().toISOString(),
        context: 'Écran, matériel non étalonné', details: {valid: sum.valid, spread: sum.spread, anticipations: sum.anticipations, lureErrors: sum.lureErrors, lureHeld: sum.lureHeld}});
      ctx.save();
    }
    res.textContent = sum.reliable
      ? `Médiane ${sum.median} ms sur ${sum.valid} essais valides${sum.spread !== null ? `, écart interquartile ${sum.spread} ms` : ''}. Anticipations : ${sum.anticipations}.${mode === 'choix' ? ` Leurres ignorés : ${sum.lureHeld}, réponses sur leurre : ${sum.lureErrors}.` : ''} Consigné.`
      : `Moins de 4 essais valides (${sum.valid}) : série non consignée. Réessayez au calme.`;
    onDone?.(sum);
  };
  const advance = () => {
    run.i++;
    if (run.i >= run.trials.length) { finish(); return; }
    run.phase = 'pause'; pad.className = 'reaction-pad'; msg.textContent = 'Essai suivant…'; timer = setTimeout(arm, 1000);
  };
  const record = (rt, early = false) => {
    clearTimeout(timer);
    const t = run.trials[run.i], kind = classify(t, rt, early);
    run.results.push({go: t.go, rt, kind});
    res.textContent = {valide: `${Math.round(rt)} ms`, anticipation: 'Anticipation : essai écarté', lent: 'Trop lent : essai écarté', manque: 'Pas de réponse',
      retenue: 'Leurre bien ignoré', 'erreur-leurre': 'Réponse sur un leurre'}[kind];
    advance();
  };
  const press = () => {
    if (!run) { const mode = modeSel?.value ?? 'simple'; run = {mode, trials: plan(mode), i: 0, results: []}; res.textContent = MODES[mode].help; arm(); return; }
    if (run.phase === 'wait') record(null, true);
    else if (run.phase === "signal") record(Math.round(performance.now() - run.shown));
  };
  pad.addEventListener('pointerdown', e => { e.preventDefault(); press(); });
  pad.addEventListener('keydown', e => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); if (!e.repeat) press(); } });
  ctx.cleanup.push(() => clearTimeout(timer));
  (ctx.onHide ??= []).push(() => { if (run) reset('Série interrompue (onglet masqué). Cliquez pour recommencer.'); });
}
