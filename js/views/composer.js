// Composer ses séances : choisir des exercices illustrés, régler séries, répétitions ou durée, repos ; enregistrer
// et lancer la séance guidée (avec animations et mode mains libres). Les zones douloureuses déclarées sont signalées.
import {exercises} from '../data/exercises.js';
import {capacities} from '../data/assessments.js';
import {motionFor, zonesOf} from '../data/motions.js';
import {soreness, ZONES} from '../engine/body.js';
import {customTemplate} from '../engine/adapt.js';
import {buildSteps, startRun, estimateSeconds} from '../engine/coach.js';
import {stillInk} from './inkloop.js';
import {uid} from '../store.js';
import {$, esc, page, notify} from '../ui.js';

const byId = Object.fromEntries(exercises.map(e => [e.id, e]));
// Exercices tenus dans le temps plutôt que comptés en répétitions.
const TIMED = /planche|gainage|chaise|suspension|equilibre|respiration|etirement|marche|course|corde|intervalles|shadow|deplacements|echelle|mobilisation|montee|cercles|balle|reaction|ischios|papillon|90-90|fente-basse|chevilles|rotations|chat-vache/;
const thumb = id => { const m = motionFor(id); return m ? stillInk(m.seq) : '<svg viewBox="0 0 10 10"></svg>'; };
export const defaultBlock = id => TIMED.test(id) ? {exerciseId: id, sets: 2, durationSec: 30, restSec: 45} : {exerciseId: id, sets: 3, reps: 10, restSec: 60};

export function render(ctx, app, editId) {
  document.body.classList.add('scene');
  ctx.cleanup.push(() => document.body.classList.remove('scene'));
  const s = ctx.state; s.custom ??= [];
  const saved = s.custom.find(c => c.id === editId);
  if (!ctx.draft || ctx.draft.editId !== (editId ?? null)) ctx.draft = {editId: editId ?? null, filter: '', mine: true, c: saved ? JSON.parse(JSON.stringify(saved)) : {id: uid(), name: 'Ma séance', blocks: [], createdAt: new Date().toISOString()}};
  const D = ctx.draft, c = D.c;
  const sore = soreness(s.sessions, Date.now(), 7), flagged = Object.keys(sore).filter(z => sore[z].max >= 2);
  const warn = id => zonesOf(id).filter(z => flagged.includes(z));
  const list = exercises.filter(e => (!D.filter || e.capacities.includes(D.filter)) && (!D.mine || e.equipment.every(q => s.profile.equipment.includes(q))));
  const minutes = c.blocks.length ? Math.round(estimateSeconds(customTemplate(c)) / 60) : 0;
  app.innerHTML = page('Composer une séance', `
  <section class="composer">
    <div class="cp-head"><input id="cp-name" maxlength="80" value="${esc(c.name)}" aria-label="Nom de la séance"><span class="cp-time"><b>${minutes}</b> min</span>
      <span class="cp-actions"><button class="primary" id="cp-start" ${c.blocks.length && s.profile.adult && !s.activeSession ? '' : 'disabled'}>▶ Commencer</button><button id="cp-save" ${c.blocks.length ? '' : 'disabled'}>♥ Enregistrer</button></span></div>
    ${s.profile.adult ? '' : '<p class="notice"><a href="#profil">Complétez la déclaration de pratique</a> pour lancer une séance.</p>'}
    ${s.activeSession ? `<p class="notice">Une séance est déjà en cours : <a href="#entrainement/seance">▶ la reprendre</a> ou l’arrêter avant d’en lancer une autre.</p>` : ''}
    <ol class="cp-blocks">${c.blocks.map((b, i) => `<li class="cp-block">
      <span class="cp-thumb">${thumb(b.exerciseId)}</span><span class="cp-name">${esc(byId[b.exerciseId]?.name ?? b.exerciseId)}${warn(b.exerciseId).length ? `<small class="cp-warn">⚠ ${warn(b.exerciseId).map(z => esc(ZONES[z].toLowerCase())).join(', ')}</small>` : ''}</span>
      <span class="cp-dose"><button data-step="${i}:sets:-1" aria-label="Une série de moins">−</button><b>${b.sets}</b><small>séries</small><button data-step="${i}:sets:1" aria-label="Une série de plus">+</button></span>
      <span class="cp-dose">${b.reps ? `<button data-step="${i}:reps:-1" aria-label="Moins de répétitions">−</button><b>${b.reps}</b><small>rép.</small><button data-step="${i}:reps:1" aria-label="Plus de répétitions">+</button>`
        : `<button data-step="${i}:durationSec:-5" aria-label="Moins de temps">−</button><b>${b.durationSec}</b><small>s</small><button data-step="${i}:durationSec:5" aria-label="Plus de temps">+</button>`}</span>
      <span class="cp-dose"><button data-step="${i}:restSec:-15" aria-label="Moins de repos">−</button><b>${b.restSec}</b><small>s repos</small><button data-step="${i}:restSec:15" aria-label="Plus de repos">+</button></span>
      <span class="cp-move"><button data-move="${i}:-1" ${i ? '' : 'disabled'} aria-label="Monter">▲</button><button data-move="${i}:1" ${i < c.blocks.length - 1 ? '' : 'disabled'} aria-label="Descendre">▼</button><button data-del="${i}" aria-label="Retirer">✕</button></span></li>`).join('')
      || '<li class="cp-empty">Touchez des exercices ci-dessous pour composer la séance.</li>'}</ol>
    <div class="cp-filters"><button class="chip" data-filter="" aria-pressed="${!D.filter}">Tout</button>${Object.entries(capacities).map(([k, v]) => `<button class="chip" data-filter="${k}" aria-pressed="${D.filter === k}">${esc(v)}</button>`).join('')}
      <label class="check"><input type="checkbox" id="cp-mine" ${D.mine ? 'checked' : ''}> avec mon matériel</label></div>
    <div class="cp-grid">${list.map(e => `<button class="cp-card" data-add="${e.id}" title="Ajouter ${esc(e.name)}">${thumb(e.id)}<span>${esc(e.name)}</span>${warn(e.id).length ? '<small class="cp-warn">⚠</small>' : ''}</button>`).join('')}</div>
    ${s.custom.length ? `<h2>Mes séances</h2><div class="cp-saved">${s.custom.map(x => `<div class="cp-saved-item"><span><b>${esc(x.name)}</b><small>${x.blocks.length} exercices · ≈ ${Math.round(estimateSeconds(customTemplate(x)) / 60)} min</small></span>
      <span><button data-run="${x.id}" ${s.profile.adult && !s.activeSession ? '' : 'disabled'}>▶</button><a class="button" href="#entrainement/composer/${x.id}">✎</a><button data-rm="${x.id}" aria-label="Supprimer">✕</button></span></div>`).join('')}</div>` : ''}
  </section>`);

  const redraw = () => ctx.render();
  $('#cp-name').onchange = e => { c.name = e.target.value.trim().slice(0, 80) || 'Ma séance'; };
  app.querySelectorAll('[data-add]').forEach(b => b.onclick = () => { if (c.blocks.length >= 20) return notify('20 exercices au plus.'); c.blocks.push(defaultBlock(b.dataset.add)); redraw(); });
  app.querySelectorAll('[data-step]').forEach(b => b.onclick = () => {
    const [i, k, d] = b.dataset.step.split(':'), x = c.blocks[Number(i)], lim = {sets: [1, 10], reps: [1, 200], durationSec: [5, 1800], restSec: [0, 600]}[k];
    x[k] = Math.max(lim[0], Math.min(lim[1], x[k] + Number(d))); redraw();
  });
  app.querySelectorAll('[data-move]').forEach(b => b.onclick = () => { const [i, d] = b.dataset.move.split(':').map(Number); [c.blocks[i], c.blocks[i + d]] = [c.blocks[i + d], c.blocks[i]]; redraw(); });
  app.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { c.blocks.splice(Number(b.dataset.del), 1); redraw(); });
  app.querySelectorAll('[data-filter]').forEach(b => b.onclick = () => { D.filter = b.dataset.filter; redraw(); });
  $('#cp-mine').onchange = e => { D.mine = e.target.checked; redraw(); };
  const save = () => { c.name = ($('#cp-name').value.trim() || 'Ma séance').slice(0, 80); s.custom = [...s.custom.filter(x => x.id !== c.id), JSON.parse(JSON.stringify(c))].slice(-30); ctx.save(); };
  $('#cp-save').onclick = () => { save(); ctx.gong?.(); notify('Séance enregistrée dans « Mes séances ».'); redraw(); };
  const run = x => {
    const built = buildSteps(customTemplate(x), byId, s.profile.equipment);
    s.activeSession = startRun({id: uid(), title: x.name, programId: null, templateId: 'libre', steps: built.steps, plannedMin: Math.round(estimateSeconds(customTemplate(x)) / 60), notes: built.notes}, Date.now());
    ctx.draft = null; ctx.save(); ctx.go('entrainement/seance');
  };
  $('#cp-start').onclick = () => { save(); run(c); };
  app.querySelectorAll('[data-run]').forEach(b => b.onclick = () => run(s.custom.find(x => x.id === b.dataset.run)));
  app.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { if (!confirm('Supprimer cette séance composée ?')) return; s.custom = s.custom.filter(x => x.id !== b.dataset.rm); ctx.save(); redraw(); });
}
