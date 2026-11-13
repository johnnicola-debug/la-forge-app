// Atelier de création martiale : construire une méthode personnelle par la réflexion ET la pratique.
// Aucun score, aucune certification d'efficacité : l'atelier consigne des choix, des essais et leur évolution.
import {entries} from '../data/library.js';
import {entryById} from './library.js';
import {uid, validMethod} from '../store.js';
import {exercises} from '../data/exercises.js';
import {sequences} from '../data/sequences.js';
import {levels, sessionElements} from '../engine/method.js';
import {compose} from '../engine/compose.js';
import * as gesture from './gesture.js';
import {$, esc, page, fmtDate, notify} from '../ui.js';

const EL_STATUS = {'a-explorer': 'À explorer', 'en-travail': 'En travail', retenu: 'Retenu', ecarte: 'Écarté'};
const now = () => new Date().toISOString();
const exById = Object.fromEntries(exercises.map(e => [e.id, e]));
let extra = [];   // « Mes mouvements » (modèle commun) : utilisables dans les enchaînements de toutes les méthodes
const seqName = (id, m) => sequences.find(s => s.id === id)?.name ?? m?.gestures?.find(g => g.id === id)?.name ?? extra.find(x => x.id === id)?.name ?? id;
const motions = m => [...sequences, ...(m.gestures ?? []), ...extra];
const ORIGIN = m => m.origin.type === 'hybride' ? `Style hybride : ${m.origin.discipline}` : m.origin.type === 'adaptation' ? `Adaptation de ${m.origin.discipline || 'une discipline'}` : 'Création progressive';

export function render(ctx, app, [id, sub, gid]) {
  extra = ctx.state.movements ?? [];
  const m = ctx.state.workshop.methods.find(x => x.id === id);
  if (m && sub === 'geste') return gesture.render(ctx, app, gesture.methodTarget(m), gid);
  return m ? method(ctx, app, m) : list(ctx, app);
}

function list(ctx, app) {
  const methods = ctx.state.workshop.methods;
  app.innerHTML = page('Atelier de création', `
  <section class="hero"><span class="kicker">Atelier de création</span><h1>Forger sa méthode<span class="dot">.</span></h1>
  <p class="intro">Une méthode personnelle se construit par l’entraînement : on choisit des intentions, on travaille des fondamentaux, on compose, on essaie, on garde ou on écarte.
  L’atelier consigne ce cheminement ; il ne juge ni ne certifie l’efficacité de ce que vous assemblez.</p></section>
  <div class="split">
    <section class="panel"><h2>Mes méthodes</h2>${methods.length ? methods.map(m => `<p><a href="#atelier/${m.id}"><strong>${esc(m.name)}</strong></a><br>
      <small>${esc(ORIGIN(m))} · ${m.elements.length} éléments · ${m.sequences.length} séquences · ${m.trials.length} essais · depuis le ${fmtDate(m.createdAt)}</small></p>`).join('')
      : '<p class="empty">Aucune méthode pour l’instant. <a href="#forge/creer">Forger un style</a> ou commencez ci-contre.</p>'}
      <label class="file-in">Importer une méthode (fichier .json reçu ou exporté)<input type="file" id="import" accept="application/json,.json"></label></section>
    <form id="new" class="panel"><h2>Commencer une méthode</h2>
      <label>Nom provisoire<input name="name" maxlength="100" required placeholder="ex. Méthode du héron"></label>
      <fieldset><legend>Point de départ</legend>
        <label class="check"><input type="radio" name="type" value="creation" checked> Créer progressivement à partir de fondamentaux</label>
        <label class="check"><input type="radio" name="type" value="adaptation"> Adapter une discipline que je pratique ou comprends</label></fieldset>
      <label>Discipline de départ (si adaptation)<input name="discipline" maxlength="100" placeholder="ex. karaté shotokan"></label>
      <button class="primary">Créer</button></form>
  </div>
  <section class="panel"><h2>Comment l’atelier s’articule avec l’entraînement</h2>
    <ol class="steps"><li><strong>Intentions et contexte</strong> : ce que vous cherchez (self-défense, expression, condition, compétition amicale…) et où vous pratiquez.</li>
    <li><strong>Éléments</strong> : fiches de la bibliothèque ou principes personnels, avec leur statut (à explorer → en travail → retenu / écarté).</li>
    <li><strong>Séquences</strong> : enchaîner des éléments, noter les transitions qui posent problème.</li>
    <li><strong>Essais</strong> : après une pratique réelle, consigner ce qui a marché ou non. Les choix évoluent à partir de ces traces.</li>
    <li><strong>Décisions</strong> : garder une trace datée de ce que vous changez et pourquoi.</li></ol>
    <p class="subtle">Chaque méthode a son propre arbre (éléments en chaînes), une séance tirée des éléments en travail, et des enchaînements animés en 3D.</p></section>`);
  $('#import').onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    try {
      const o = JSON.parse(await f.text()), m = o?.kind === 'la-forge-methode' ? o.method : null;
      if (!validMethod(m)) throw new Error('format');
      ctx.state.workshop.methods.unshift({...m, id: uid(), decisions: [{date: now(), text: `Méthode importée depuis le fichier « ${f.name.slice(0, 80)} ».`}, ...m.decisions].slice(0, 500)});
      ctx.save(); notify('Méthode importée.'); ctx.go('atelier/' + ctx.state.workshop.methods[0].id);
    } catch { notify('Fichier non reconnu : il faut un export de méthode LA FORGE (.json).'); }
  };
  $('#new').onsubmit = e => {
    e.preventDefault();
    const d = new FormData(e.target);
    const m = {id: uid(), name: String(d.get('name')).trim().slice(0, 100), createdAt: now(),
      origin: {type: d.get('type'), discipline: String(d.get('discipline')).trim().slice(0, 100)},
      intentions: '', context: '', elements: [], sequences: [], trials: [], decisions: [{date: now(), text: 'Création de la méthode.'}]};
    if (!m.name) return;
    ctx.state.workshop.methods.unshift(m); ctx.save(); ctx.go('atelier/' + m.id);
  };
}

function method(ctx, app, m) {
  const label = el => el.ref ? entryById[el.ref]?.title ?? el.label : el.label;
  const stepLabel = id => entryById[id]?.title ?? m.elements.find(e => e.id === id)?.label ?? id;
  app.innerHTML = page('Atelier de création', `
  <section class="hero"><span class="kicker"><a href="#atelier">Atelier</a></span><h1>${esc(m.name)}<span class="dot">.</span></h1>
  <p class="intro">${esc(ORIGIN(m))} · commencée le ${fmtDate(m.createdAt)}</p></section>
  ${treeHtml(m, label)}
  ${sessionHtml(m, label)}
  <div class="split even">
    <form id="intent" class="panel"><h2>Intentions et contexte</h2>
      <label>Ce que je cherche à développer<textarea name="intentions" rows="4" maxlength="2000" placeholder="ex. rester mobile et précis, privilégier les déplacements et le contrôle de la distance">${esc(m.intentions)}</textarea></label>
      <label>Mon contexte de pratique<textarea name="context" rows="3" maxlength="2000" placeholder="ex. seul à la maison, 3 × 30 min par semaine ; club de boxe le samedi">${esc(m.context)}</textarea></label>
      <button>Enregistrer</button></form>
    <section class="panel"><h2>Éléments de la méthode</h2>
      ${m.elements.length ? m.elements.map(el => `<div class="method-el"><span>${el.ref ? `<a href="#bibliotheque/${el.ref}">${esc(label(el))}</a>` : esc(label(el))}${el.note ? `<br><small>${esc(el.note)}</small>` : ''}</span>
        <select data-status="${el.id}" aria-label="Statut">${Object.entries(EL_STATUS).map(([k, v]) => `<option value="${k}" ${k === el.status ? 'selected' : ''}>${v}</option>`).join('')}</select>
        <button class="ghost" data-del-el="${el.id}" aria-label="Retirer">✕</button></div>`).join('') : '<p class="empty">Ajoutez des fiches ou vos propres principes.</p>'}
      <form id="add-el"><div class="row"><label>Depuis la bibliothèque<select name="ref"><option value="">— principe personnel —</option>${entries.map(e => `<option value="${e.id}">${esc(e.title)}</option>`).join('')}</select></label>
        <label>Ou un principe à vous<input name="label" maxlength="120" placeholder="ex. toujours sortir de la ligne après une attaque"></label></div>
        <label>Pourquoi cet élément ?<input name="note" maxlength="300"></label><button>Ajouter</button></form>
    </section>
  </div>
  <section class="panel"><h2>Séquences et enchaînements animés</h2>
    ${m.sequences.length ? m.sequences.map(q => `<div class="method-el"><span><strong>${esc(q.name)}</strong><span class="seq-steps">${(q.anim?.length ? q.anim.map(a => seqName(a, m)) : q.steps.map(stepLabel)).map((t, i) => `${i ? '→' : ''}<span class="pill">${esc(t)}</span>`).join('')}</span>${q.anim?.length ? `<button class="small" data-play="${q.id}">Voir en 3D</button>` : ''}${q.note ? `<small>${esc(q.note)}</small>` : ''}</span><span></span><button class="ghost" data-del-seq="${q.id}" aria-label="Supprimer">✕</button></div>`).join('')
      : '<p class="empty">Composez une séquence à partir des éléments retenus ou en travail.</p>'}
    <form id="add-seq"><div class="row"><label>Nom<input name="name" maxlength="100" required></label><label>Transitions à surveiller, difficultés<input name="note" maxlength="300"></label></div>
      <fieldset><legend>Étapes, dans l’ordre de sélection</legend><div class="chips" id="seq-pick">${m.elements.filter(e => e.status !== 'ecarte').map(e =>
        `<label><input type="checkbox" value="${esc(e.ref ?? e.id)}">${esc(label(e))}</label>`).join('') || '<span class="subtle">Aucun élément disponible.</span>'}</div>
      <p class="subtle" id="seq-order"></p></fieldset><button>Ajouter la séquence</button></form>
    <div id="anim-view"></div>
    <div class="gestures"><h3>Mes gestes</h3>${(m.gestures ?? []).length ? (m.gestures ?? []).map(g => `<a class="chip" href="#atelier/${m.id}/geste/${g.id}">✎ ${esc(g.name)} <small>(${g.keys.length} clés)</small></a>`).join(' ') : '<span class="subtle">Aucun geste personnel pour l’instant.</span>'}
      <a class="button" href="#atelier/${m.id}/geste/nouveau">Créer un geste (éditeur de poses)</a></div>
    <form id="add-anim"><h3>Composer un enchaînement animé</h3><p class="subtle">Cochez les gestes dans l’ordre : le corps d’ombre les enchaîne en 3D, chaque geste partant de là où le précédent s’arrête.</p>
      <div class="chips" id="anim-pick">${motions(m).map(s => `<label><input type="checkbox" value="${s.id}">${esc(s.name)}${s.keys && !sequences.includes(s) ? ' ✎' : ''}</label>`).join('')}</div>
      <p class="subtle" id="anim-order"></p><div class="row"><label>Nom<input name="name" maxlength="100" placeholder="ex. Fente puis retrait"></label></div>
      <div class="actions"><button type="button" id="anim-preview">Aperçu 3D</button><button>Enregistrer l’enchaînement</button></div></form>
  </section>
  <div class="split even">
    <form id="trial" class="panel"><h2>Journal d’essais</h2><p class="subtle">Après une pratique réelle : ce qui a été essayé, comment, ce que vous en retenez.</p>
      <label>Essai<textarea name="text" rows="3" maxlength="2000" required></textarea></label><button>Consigner l’essai</button>
      ${m.trials.slice(0, 10).map(t => `<p><small>${fmtDate(t.date)}</small><br>${esc(t.text)}</p>`).join('')}</form>
    <form id="decision" class="panel"><h2>Décisions</h2><p class="subtle">Ce que vous changez dans la méthode, et pourquoi.</p>
      <label>Décision<input name="text" maxlength="1000" required></label><button>Consigner</button>
      ${m.decisions.slice(0, 10).map(d => `<p><small>${fmtDate(d.date)}</small> ${esc(d.text)}</p>`).join('')}</form>
  </div>
  <div class="notice">Cette méthode est une construction personnelle. Sa cohérence, sa sécurité et son efficacité ne peuvent pas être établies par l’application : faites-la éprouver avec un enseignant qualifié, sans contact dangereux.</div>
  <div class="actions"><button id="export-json">Exporter (fichier à partager ou réimporter)</button><button id="export">Exporter en texte</button><button id="delete" class="danger">Supprimer la méthode</button></div>`);
  const save = msg => { ctx.save(); if (msg) notify(msg); ctx.render(); };
  $('#intent').onsubmit = e => { e.preventDefault(); const d = new FormData(e.target); m.intentions = String(d.get('intentions')).slice(0, 2000); m.context = String(d.get('context')).slice(0, 2000); save('Enregistré.'); };
  $('#add-el').onsubmit = e => {
    e.preventDefault(); const d = new FormData(e.target), ref = d.get('ref') || null, text = String(d.get('label')).trim();
    if (!ref && !text) { notify('Choisissez une fiche ou écrivez un principe.'); return; }
    m.elements.push({id: uid(), ref, label: (ref ? entryById[ref].title : text).slice(0, 120), note: String(d.get('note')).trim().slice(0, 300), status: 'a-explorer'}); save();
  };
  app.querySelectorAll('[data-status]').forEach(sel => sel.onchange = () => {
    const el = m.elements.find(x => x.id === sel.dataset.status); el.status = sel.value;
    m.decisions.unshift({date: now(), text: `« ${label(el)} » passe à : ${EL_STATUS[sel.value]}.`}); save();
  });
  app.querySelectorAll('[data-del-el]').forEach(b => b.onclick = () => { m.elements = m.elements.filter(x => x.id !== b.dataset.delEl); save(); });
  app.querySelectorAll('[data-del-seq]').forEach(b => b.onclick = () => { m.sequences = m.sequences.filter(x => x.id !== b.dataset.delSeq); save(); });
  app.querySelectorAll('[data-after]').forEach(sel => sel.onchange = () => {
    const el = m.elements.find(x => x.id === sel.dataset.after); el.after = sel.value ? [sel.value] : [];
    m.decisions.unshift({date: now(), text: sel.value ? `« ${label(el)} » vient après « ${label(m.elements.find(x => x.id === sel.value))} ».` : `« ${label(el)} » devient un point de départ.`}); save();
  });
  app.querySelectorAll('[data-practice]').forEach(b => b.onclick = () => {
    const el = m.elements.find(x => x.id === b.dataset.practice); el.practice = [now(), ...(el.practice ?? [])].slice(0, 500);
    if (el.status === 'a-explorer') el.status = 'en-travail';
    save(`« ${label(el)} » : pratique notée.`);
  });
  const animOrder = [], view3d = async seq => {
    const host = $('#anim-view'), mod = await import('./mannequin3d.js');
    if (!mod.webglAvailable()) { host.innerHTML = '<p class="subtle">La 3D n’est pas disponible sur cet appareil.</p>'; return; }
    host.innerHTML = ''; const stop = await mod.mount3d(host, seq, {dims: mod.dimsFromState(ctx.state)});
    if (host.isConnected) ctx.cleanup.push(stop); else stop();
    host.scrollIntoView({behavior: 'smooth', block: 'center'});
  };
  $('#anim-pick').onchange = e => { const v = e.target.value; if (e.target.checked) animOrder.push(v); else animOrder.splice(animOrder.indexOf(v), 1); $('#anim-order').textContent = animOrder.map(a => seqName(a, m)).join(' → '); };
  $('#anim-preview').onclick = () => { if (!animOrder.length) return notify('Cochez au moins un geste.'); view3d(compose(animOrder, motions(m), 'Aperçu')); };
  $('#add-anim').onsubmit = e => {
    e.preventDefault(); if (animOrder.length < 2) return notify('Cochez au moins deux gestes.');
    const name = String(new FormData(e.target).get('name')).trim() || animOrder.map(a => seqName(a, m)).join(' → ');
    m.sequences.push({id: uid(), name: name.slice(0, 100), steps: [], anim: [...animOrder], note: ''}); save('Enchaînement enregistré.');
  };
  app.querySelectorAll('[data-play]').forEach(b => b.onclick = () => { const q = m.sequences.find(x => x.id === b.dataset.play); view3d(compose(q.anim, motions(m), q.name)); });
  $('#export-json').onclick = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify({kind: 'la-forge-methode', version: 1, exportedAt: now(), method: m}, null, 2)], {type: 'application/json'}));
    const a = document.createElement('a'); a.href = url; a.download = `${m.name.replace(/[^\p{L}\p{N}]+/gu, '-')}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const order = [];
  $('#seq-pick').onchange = e => {
    const v = e.target.value; if (e.target.checked) order.push(v); else order.splice(order.indexOf(v), 1);
    $('#seq-order').textContent = order.map(stepLabel).join(' → ');
  };
  $('#add-seq').onsubmit = e => {
    e.preventDefault(); if (order.length < 2) { notify('Choisissez au moins deux étapes.'); return; }
    const d = new FormData(e.target); m.sequences.push({id: uid(), name: String(d.get('name')).trim().slice(0, 100), steps: [...order], note: String(d.get('note')).trim().slice(0, 300)}); save();
  };
  $('#trial').onsubmit = e => { e.preventDefault(); m.trials.unshift({date: now(), text: String(new FormData(e.target).get('text')).trim().slice(0, 2000)}); save('Essai consigné.'); };
  $('#decision').onsubmit = e => { e.preventDefault(); m.decisions.unshift({date: now(), text: String(new FormData(e.target).get('text')).trim().slice(0, 1000)}); save(); };
  $('#delete').onclick = () => { if (confirm(`Supprimer « ${m.name} » ? Exportez-la avant si besoin.`)) { ctx.backup('Avant suppression d’une méthode'); ctx.state.workshop.methods = ctx.state.workshop.methods.filter(x => x !== m); ctx.save(); ctx.go('atelier'); } };
  $('#export').onclick = () => {
    const txt = [`# ${m.name}`, '', m.origin.type === 'adaptation' ? `Adaptation de : ${m.origin.discipline}` : 'Création progressive', '', '## Intentions', m.intentions, '', '## Contexte', m.context, '',
      '## Éléments', ...m.elements.map(e => `- ${label(e)} — ${EL_STATUS[e.status]}${e.note ? ` (${e.note})` : ''}`), '', '## Séquences', ...m.sequences.map(q => `- ${q.name} : ${q.steps.map(stepLabel).join(' → ')}${q.note ? ` — ${q.note}` : ''}`),
      '', '## Essais', ...m.trials.map(t => `- ${t.date.slice(0, 10)} : ${t.text}`), '', '## Décisions', ...m.decisions.map(d => `- ${d.date.slice(0, 10)} : ${d.text}`), '',
      'Méthode personnelle, non évaluée. Exportée depuis LA FORGE.'].join('\n');
    const url = URL.createObjectURL(new Blob([txt], {type: 'text/markdown'}));
    const a = document.createElement('a'); a.href = url; a.download = `${m.name.replace(/[^\p{L}\p{N}]+/gu, '-')}.md`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
}

// Arbre de la méthode : colonnes « étapes » calculées depuis les liens « à aborder après ».
function treeHtml(m, label) {
  if (!m.elements.length) return '';
  const {cols} = levels(m.elements);
  const opts = el => m.elements.filter(x => x.id !== el.id).map(x => `<option value="${x.id}" ${(el.after ?? [])[0] === x.id ? 'selected' : ''}>${esc(label(x))}</option>`).join('');
  return `<section class="panel ink"><div class="head"><h2>L’arbre de ma méthode</h2><span class="subtle">${m.elements.length} éléments · ${cols.length} étape(s)</span></div>
    <div class="mtree">${cols.map((col, i) => `<div class="mcol"><h3>${i ? `Étape ${i + 1}` : 'Points de départ'}</h3>${col.map(el => `<div class="mnode st-${el.status}">
      <span>${el.ref ? `<a href="#bibliotheque/${el.ref}">${esc(label(el))}</a>` : esc(label(el))}</span>
      <small>${EL_STATUS[el.status]}${el.practice?.length ? ` · pratiqué ${el.practice.length} fois` : ''}</small>
      <label class="after">Après <select data-after="${el.id}"><option value="">— point de départ —</option>${opts(el)}</select></label></div>`).join('')}</div>`).join('')}</div>
    <p class="subtle">Choisissez pour chaque élément ce qui doit venir avant : l’arbre se réorganise en chaînes (ex. coup de pied → coup de pied retourné).</p></section>`;
}

// Séance tirée de la méthode : éléments en travail (ou prochains à explorer) et exercices de leurs fiches.
function sessionHtml(m, label) {
  const list = sessionElements(m.elements);
  if (!list.length) return '';
  return `<section class="panel"><div class="head"><h2>Séance de ma méthode</h2><span class="subtle">${list.some(e => e.status === 'en-travail') ? 'éléments en travail' : 'prochains éléments à explorer'}</span></div>
    <ol class="msession"><li><strong>Échauffement</strong> : 8 à 10 minutes (articulations, déplacements en garde légers).</li>
    ${list.map(el => { const fiche = el.ref ? entryById[el.ref] : null, ex = (fiche?.exercises ?? []).map(id => exById[id]).filter(Boolean).slice(0, 2);
      return `<li><strong>${esc(label(el))}</strong> — 3 blocs de 2 minutes, lentement puis à vitesse moyenne.
        ${ex.length ? `<br><small>Exercices de la fiche : ${ex.map(x => `<a href="#entrainement/exercice/${x.id}">${esc(x.name)}</a>`).join(' · ')}</small>` : ''}
        <br><button class="small" data-practice="${el.id}">Pratiqué aujourd’hui</button>${el.practice?.length ? ` <small class="subtle">dernière fois le ${fmtDate(el.practice[0])}</small>` : ''}</li>`; }).join('')}
    <li><strong>Essai libre</strong> : enchaîner les éléments, puis consigner ce qui a marché dans le journal d’essais.</li></ol>
    <p class="subtle">Proposition simple, sans charge adaptée : arrêtez en cas de douleur.</p></section>`;
}
