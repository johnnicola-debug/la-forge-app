// Parcours d'orientation : une question par « scène », adaptatif, puis révélation des voies avec leurs raisons.
import {questions, VOIES, VOIE_IDS, NAME_PROPOSALS} from '../data/orientation.js';
import {visible, score, toProfile, transferFrom} from '../engine/orientation.js';
import {recommend} from '../engine/assistant.js';
import {skills} from '../data/skills.js';
import {exercises} from '../data/exercises.js';
import {computeAll} from '../engine/progress.js';
import {index} from './tree.js';
import {$, esc, page, notify, swapView} from '../ui.js';

const COLORS = {verm: '#f0735a', jade: '#6db8a0', or: '#d8b25e'};

// Emblèmes géométriques des voies (création LA FORGE).
export function sigil(voie, size = 120, strength = 1) {
  const c = COLORS[VOIES[voie]?.color] ?? '#a9b5b0', o = 0.35 + 0.65 * strength;
  const inner = {
    foudre: `<path d="M64 18 44 62h16l-8 40 26-50H60z" fill="${c}" opacity="${o}"/>`,
    racine: `<path d="M60 26v40M60 66c-12 8-20 18-22 30M60 66c12 8 20 18 22 30M60 66v32M46 40c6 4 10 10 14 14M74 40c-6 4-10 10-14 14" stroke="${c}" stroke-width="5" stroke-linecap="round" fill="none" opacity="${o}"/><circle cx="60" cy="24" r="7" fill="${c}" opacity="${o}"/>`,
    vent: `<path d="M24 50c18-14 44-14 60 0M30 66c16-10 40-10 56 2M40 82c12-6 30-6 42 2" stroke="${c}" stroke-width="5" stroke-linecap="round" fill="none" opacity="${o}"/><circle cx="88" cy="48" r="5" fill="${c}" opacity="${o}"/>`
  }[voie] ?? `<circle cx="60" cy="60" r="10" fill="${c}"/>`;
  return `<svg class="sigil" viewBox="0 0 120 120" width="${size}" height="${size}" aria-hidden="true">
    <circle cx="60" cy="60" r="54" fill="none" stroke="${c}" stroke-opacity=".35" stroke-width="1.2"/>
    <circle cx="60" cy="60" r="46" fill="none" stroke="${c}" stroke-opacity=".18" stroke-dasharray="2 5"/>
    <path d="M60 2v10M60 108v10M2 60h10M108 60h10" stroke="${c}" stroke-opacity=".5"/>${inner}</svg>`;
}

export function render(ctx, app, [step]) {
  document.body.classList.add('scene');
  ctx.cleanup.push(() => document.body.classList.remove('scene'));
  const draft = ctx.orientationDraft ??= {answers: {...(ctx.state.orientation?.answers ?? {})}, i: 0};
  if (step === 'resultat' && ctx.state.orientation) return result(ctx, app);
  if (step === 'refaire') { ctx.orientationDraft = {answers: {}, i: 0}; ctx.go('orientation'); return; }
  if (ctx.state.orientation && step !== 'questions') return result(ctx, app);
  const qs = visible(draft.answers);
  draft.i = Math.min(draft.i, qs.length - 1);
  const q = qs[draft.i], val = [].concat(draft.answers[q.id] ?? []), live = score(draft.answers);
  app.innerHTML = page('Orientation', `
  <section class="orient">
    <div class="orient-progress" aria-label="Question ${draft.i + 1} sur ${qs.length}">${qs.map((x, i) => `<i class="${i < draft.i ? 'done' : i === draft.i ? 'now' : ''}"></i>`).join('')}</div>
    <div class="orient-card">
      <span class="kicker">${esc(q.scene)} · ${draft.i + 1} / ${qs.length}</span>
      <h1>${esc(q.title)}</h1>${q.help ? `<p class="subtle">${esc(q.help)}</p>` : ''}
      <div class="choices ${q.multi ? 'multi' : ''}" role="${q.multi ? 'group' : 'radiogroup'}">
        ${q.options.map(o => `<button class="choice" data-v="${esc(o.v)}" aria-pressed="${val.includes(o.v)}">${esc(o.label)}</button>`).join('')}
      </div>
      <div class="actions"><button id="back" ${draft.i ? '' : 'disabled'}>← Retour</button>
        ${q.multi ? `<button id="next" class="primary">${draft.i === qs.length - 1 ? 'Révéler mes voies' : 'Continuer'}</button>` : ''}
        <button id="skip" class="ghost">Passer</button></div>
    </div>
    <div class="orient-live" aria-hidden="true">${VOIE_IDS.map(v => `<div class="live-voie">${sigil(v, 54, live.aff[v])}<small>${VOIES[v].short}</small></div>`).join('')}</div>
    <p class="subtle center">Les voies décrivent des préférences, pas des aptitudes. Vous pourrez refaire ce parcours à tout moment.</p>
  </section>`);
  // Verrou : pendant la transition, l'ancienne question reste affichée ; on ignore les clics pour ne pas sauter de question.
  let busy = false;
  const advance = () => { if (busy) return; busy = true; const n = visible(draft.answers); if (draft.i >= n.length - 1) finish(ctx); else { draft.i++; transition(() => render(ctx, app, ['questions'])); } };
  app.querySelectorAll('.choice').forEach(b => b.onclick = () => {
    if (busy) return;
    if (q.multi) {
      const cur = new Set([].concat(draft.answers[q.id] ?? []));
      if (cur.has(b.dataset.v)) cur.delete(b.dataset.v); else if (cur.size < q.multi) cur.add(b.dataset.v); else return notify(`${q.multi} choix au plus.`);
      draft.answers[q.id] = [...cur]; render(ctx, app, ['questions']);
    } else { draft.answers[q.id] = b.dataset.v; advance(); }
  });
  $('#next')?.addEventListener('click', advance);
  $('#skip').onclick = () => { if (busy) return; delete draft.answers[q.id]; advance(); };
  $('#back').onclick = () => { if (busy) return; busy = true; draft.i = Math.max(0, draft.i - 1); transition(() => render(ctx, app, ['questions'])); };
}

const transition = swapView;

function finish(ctx) {
  const a = ctx.orientationDraft.answers, sc = score(a);
  ctx.state.profile = {...toProfile(a, ctx.state.profile), adult: ctx.state.profile.adult};
  ctx.state.orientation = {completedAt: new Date().toISOString(), answers: a, affinities: sc.aff, primary: sc.primary, secondary: sc.secondary, mixed: sc.mixed, transfer: transferFrom(a)};
  ctx.save(); ctx.orientationDraft = null; ctx.go('orientation/resultat');
}

function result(ctx, app) {
  const o = ctx.state.orientation, sc = score(o.answers);
  const status = computeAll(skills, ctx.state, index), recs = recommend({state: ctx.state, status, skills, exercises}).slice(0, 4);
  const order = [...VOIE_IDS].sort((x, y) => sc.raw[y] - sc.raw[x]);
  app.innerHTML = page('Orientation', `
  <section class="hero reveal"><span class="kicker">Révélation</span>
    <h1>${o.primary ? `${o.mixed ? 'Entre ' + esc(VOIES[order[0]].short) + ' et ' + esc(VOIES[order[1]].short) : esc(VOIES[o.primary].name)}` : 'Votre voie reste ouverte'}<span class="dot">.</span></h1>
    <p class="intro">${o.primary ? esc(VOIES[o.primary].summary) : 'Vos réponses ne penchent vers aucune voie en particulier : explorez librement l’arbre et la bibliothèque.'}</p></section>
  <div class="voies-reveal">${order.map((v, i) => `<section class="panel voie-card ${i === 0 && o.primary ? 'main' : ''}">
    ${sigil(v, 110, sc.aff[v])}<h2>${esc(VOIES[v].name)}</h2><p class="subtle">${esc(VOIES[v].essence)}</p>
    <div class="aff" role="img" aria-label="Penchant relatif ${Math.round(sc.aff[v] * 100)} %"><i data-w="${sc.aff[v]}"></i></div>
    <details ${i === 0 ? 'open' : ''}><summary>Pourquoi</summary>${sc.reasons[v].length ? `<ul>${sc.reasons[v].map(r => `<li>${esc(r.answer)} <small>(${esc(r.question)})</small></li>`).join('')}</ul>` : '<p class="subtle">Aucune réponse n’y penche.</p>'}</details>
    <details><summary>Atouts et limites</summary><p><strong>Atouts</strong></p><ul>${VOIES[v].strengths.map(x => `<li>${esc(x)}</li>`).join('')}</ul><p><strong>Limites</strong></p><ul>${VOIES[v].limits.map(x => `<li>${esc(x)}</li>`).join('')}</ul></details>
  </section>`).join('')}</div>
  <section class="panel"><h2>Vos premiers pas</h2>${recs.map(r => `<div class="rec"><div><strong>${esc(r.title)}</strong><p class="subtle">${esc(r.why)}</p></div><a class="button" href="${r.href}">${esc(r.label)}</a></div>`).join('')}</section>
  <p class="subtle">La barre indique un penchant relatif tiré de vos réponses (la voie la plus marquée vaut 100 %), pas une mesure. ${esc(NAME_PROPOSALS)}</p>
  <div class="actions"><a class="button primary" href="#avatar">Créer ma fiche de personnage</a><a class="button" href="#arbre">Explorer mon arbre</a><a class="button" href="#orientation/refaire">Refaire le parcours</a></div>`);
  app.querySelectorAll('.aff i').forEach(i => requestAnimationFrame(() => i.style.width = `${Number(i.dataset.w) * 100}%`));
}
