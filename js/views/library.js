// Bibliothèque martiale v2 : fiches structurées (anatomie, principes, risques, transferts, sources et fiabilité),
// accès par discipline, famille, compétence, principe ou muscle ; planche d'étude 2D ou mannequin 3D.
// Consulté ≠ travaillé ≠ évalué : l'évaluation se fait dans l'arbre, par une personne qualifiée.
import {ROLES} from '../engine/generator.js';
import {families, entries} from '../data/library.js';
import {skillById} from '../data/skills.js';
import {byId as exById} from './training.js';
import {mountViewer} from './movement.js';
import {uid, pushLimited} from '../store.js';
import {addTrace} from '../engine/progress.js';
import {$, esc, page, fmtDate, notify, options} from '../ui.js';

export const entryById = Object.fromEntries(entries.map(e => [e.id, e]));
export const STATUS = {brouillon: 'Brouillon IA — non relu', sourcee: 'Synthèse sourcée — non relue', relue: 'Relue'};
const LEVEL = {1: 'Découverte', 2: 'Fondamental', 3: 'Intermédiaire', 4: 'Avancé'};
const DISC = {boxe: 'Boxe anglaise', escrime: 'Escrime', lutte: 'Lutte', judo: 'Judo', karate: 'Karaté', 'muay-thai': 'Muay-thaï', jjb: 'Jiu-jitsu brésilien', transversal: 'Transversal'};
const REL = {etabli: 'Établi', plausible: 'Plausible', experimental: 'Expérimental'};
const SRC = {federation: 'Fédération', academique: 'Recherche', pedagogique: 'Pédagogique', ia: 'Rédaction IA'};
const JOINTS = {cheville: 'Cheville', genou: 'Genou', hanche: 'Hanche', lombaires: 'Lombaires', thoracique: 'Colonne thoracique', cou: 'Cou', epaule: 'Épaule', coude: 'Coude', poignet: 'Poignet'};
const MUSCLES = {deltoides: 'Deltoïdes', pectoraux: 'Pectoraux', dorsaux: 'Dorsaux', trapezes: 'Trapèzes', biceps: 'Biceps', triceps: 'Triceps', 'avant-bras': 'Avant-bras', abdominaux: 'Abdominaux',
  obliques: 'Obliques', erecteurs: 'Érecteurs du rachis', fessiers: 'Fessiers', quadriceps: 'Quadriceps', ischios: 'Ischio-jambiers', adducteurs: 'Adducteurs', mollets: 'Mollets',
  'flechisseurs-hanche': 'Fléchisseurs de hanche', 'coiffe-rotateurs': 'Coiffe des rotateurs'};
// Principes biomécaniques : définitions générales (notions de base de la biomécanique du sport).
export const PRINCIPLES = {
  'base-sustentation': ['Base de sustentation', 'Surface délimitée par les appuis : plus elle est large dans une direction, plus on est stable dans cette direction.'],
  'centre-masse': ['Centre de masse', 'Point moyen de la masse du corps ; l’équilibre statique demande que sa projection reste au-dessus de la base d’appui.'],
  'chaine-cinetique': ['Chaîne cinétique', 'Enchaînement des segments (appuis, hanches, tronc, bras) qui contribuent successivement ou ensemble à un geste.'],
  'transfert-poids': ['Transfert du poids', 'Déplacement du centre de masse d’un appui vers l’autre, qui prépare ou accompagne une action.'],
  'rotation-axiale': ['Rotation axiale', 'Rotation du bassin et du tronc autour de l’axe vertical, utilisée dans de nombreuses frappes et esquives.'],
  'stabilite-proximale': ['Stabilité proximale', 'Un tronc et des ceintures stables permettent aux membres d’agir avec contrôle.'],
  'vitesse-precision': ['Compromis vitesse-précision', 'Aller plus vite dégrade souvent la précision ; l’apprentissage commence lentement.'],
  'etirement-detente': ['Étirement-détente', 'Un muscle brièvement étiré juste avant de se contracter produit généralement plus de force (cycle étirement-détente).'],
  alignement: ['Alignement', 'Articulations orientées dans l’axe de la force pour la transmettre sans contrainte inutile.'],
  relachement: ['Relâchement', 'Ne contracter que ce qui est utile : plus de vitesse, moins de fatigue.']
};

export function render(ctx, app, [id]) {
  const s = ctx.state, e = entryById[id] ?? entryById[ctx.lastEntry] ?? entries[0];
  ctx.lastEntry = e.id;
  if (!s.library.consulted[e.id]) { s.library.consulted[e.id] = new Date().toISOString(); ctx.save(); }
  const practiced = s.library.practiced[e.id] ?? [];
  const f = ctx.libFilter ??= {q: '', disc: '', skill: '', principle: '', muscle: ''};
  const list = entries.filter(x => (!f.q || (x.title + ' ' + x.objective).toLowerCase().includes(f.q.toLowerCase()))
    && (!f.disc || x.origin === f.disc || x.disciplines.includes(f.disc)) && (!f.skill || x.skills?.includes(f.skill))
    && (!f.principle || x.principles?.includes(f.principle)) && (!f.muscle || x.muscles?.includes(f.muscle)));
  const view3d = ctx.lib3d ?? true;
  const related = entries.filter(x => x.id !== e.id && (x.prerequisites.includes(e.id) || (x.skills ?? []).some(k => (e.skills ?? []).includes(k) && !k.startsWith('spe-')))).slice(0, 6);
  app.innerHTML = page('Bibliothèque martiale', `
  <section class="hero compact"><span class="kicker">Bibliothèque martiale</span><h1>Décomposer pour comprendre<span class="dot">.</span></h1>
  <p class="intro">${entries.length} fiches, ${Object.keys(DISC).length - 1} disciplines. Chaque fiche relie un geste à ses articulations, ses muscles, ses principes, ses risques et ses transferts possibles. Lire une fiche n’est pas maîtriser un geste.</p></section>
  <div class="lib">
    <nav class="lib-list panel" aria-label="Fiches">
      <label>Rechercher<input id="q" value="${esc(f.q)}" placeholder="garde, fente, chute…"></label>
      <details ${f.disc || f.skill || f.principle || f.muscle ? 'open' : ''}><summary>Filtres</summary>
        <label>Discipline<select data-f="disc"><option value="">Toutes</option>${options(DISC, f.disc)}</select></label>
        <label>Compétence<select data-f="skill"><option value="">Toutes</option>${options(Object.fromEntries(Object.values(skillById).filter(k => k.branch !== 'spe').map(k => [k.id, k.name])), f.skill)}</select></label>
        <label>Principe<select data-f="principle"><option value="">Tous</option>${options(Object.fromEntries(Object.entries(PRINCIPLES).map(([k, v]) => [k, v[0]])), f.principle)}</select></label>
        <label>Muscle<select data-f="muscle"><option value="">Tous</option>${options(MUSCLES, f.muscle)}</select></label></details>
      ${families.map(fa => { const items = list.filter(x => x.family === fa.id); return items.length ? `<h3>${esc(fa.name)}</h3>${items.map(x =>
        `<button data-entry="${x.id}" aria-pressed="${x.id === e.id}">${esc(x.title)}<small>${esc(DISC[x.origin] ?? '')} · ${s.library.practiced[x.id]?.length ? 'travaillée' : s.library.consulted[x.id] ? 'consultée' : 'à découvrir'}${x.sequence ? ' · animée' : ''}</small></button>`).join('')}` : ''; }).join('') || '<p class="empty">Aucune fiche pour ces filtres.</p>'}
    </nav>
    <article class="stack">
      <section class="panel"><div class="head"><h2>${esc(e.title)}</h2><span><span class="pill status-${e.editorial.status}">${STATUS[e.editorial.status]}</span>
        <span class="pill">${esc(LEVEL[e.level] ?? '')}</span>${e.disciplines.map(d => `<span class="pill jade">${esc(DISC[d] ?? d)}</span>`).join('')}</span></div>
        <p class="intro">${esc(e.objective)}</p>
        ${e.sequence ? `<div class="view-switch" role="tablist"><button role="tab" data-v="2d" aria-selected="${!view3d}">Planche d’étude 2D</button><button role="tab" data-v="3d" aria-selected="${view3d}">Mannequin 3D</button></div><div id="viewer"></div>`
          : '<p class="empty">Pas encore d’illustration animée pour cette fiche.</p>'}
      </section>
      <section class="panel fiche-bar"><div class="chips">${(e.muscles ?? []).map(m => `<button class="chip" data-muscle="${m}">◉ ${esc(MUSCLES[m] ?? m)}</button>`).join('')}${(e.joints ?? []).map(j => `<span class="chip">⌾ ${esc(JOINTS[j] ?? j)}</span>`).join('')}</div>
        ${e.risks ? `<p class="fiche-risk">⚠ ${esc(String(e.risks).split(/(?<=\.)\s/)[0])}</p>` : ''}
        <div class="actions"><button class="primary" id="practiced">✓ Travaillée aujourd’hui</button>${ROLES[e.sequence]?.[0] === 'attack' ? `<a class="button" href="#inventer/${e.sequence}">✧ Inventer à partir de ce geste</a>` : ''}<a class="button" href="#atelier">Atelier</a>
          <small class="subtle">${practiced.length ? `travaillée ${practiced.length} fois` : ''}</small></div></section>
      <details class="fiche-more"><summary>Le détail écrit : contexte, étapes, erreurs, principes, risques, sources</summary>
        <p>${esc(e.context)}</p>
      <div class="split even">
        <section class="panel"><h2>Décomposition</h2><ol class="steps">${e.steps.map(x => `<li>${esc(x)}</li>`).join('')}</ol>
          <h3>Erreurs fréquentes</h3><ul>${e.errors.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
          ${e.variants?.length ? `<h3>Variantes et progressions</h3><ul>${e.variants.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}</section>
        <section class="panel"><h2>Le corps en jeu</h2>
          <h3>Articulations</h3><div class="chips">${(e.joints ?? []).map(j => `<span class="chip">${esc(JOINTS[j] ?? j)}</span>`).join('')}</div>
          <h3>Groupes musculaires principaux</h3><div class="chips">${(e.muscles ?? []).map(m => `<button class="chip" data-muscle="${m}">${esc(MUSCLES[m] ?? m)}</button>`).join('')}</div>
          <h3>Principes</h3><dl class="kv">${(e.principles ?? []).map(p => `<dt>${esc(PRINCIPLES[p]?.[0] ?? p)}</dt><dd>${esc(PRINCIPLES[p]?.[1] ?? '')}</dd>`).join('')}</dl>
          <p class="subtle">Description fonctionnelle générale, sans valeur de mesure. Les zones colorées du mannequin 3D sont indicatives.</p></section>
      </div>
      <div class="split even">
        <section class="panel"><h2>Pratiquer</h2>
          <h3>Prérequis</h3><p>${e.prerequisites.length ? e.prerequisites.map(p => `<a href="#bibliotheque/${p}">${esc(entryById[p]?.title ?? p)}</a>`).join(' · ') : 'Aucun : point de départ.'}</p>
          <h3>Exercices préparatoires</h3><p>${e.exercises.length ? e.exercises.map(x => `<a href="#entrainement/exercice/${x}">${esc(exById[x]?.name ?? x)}</a>`).join(' · ') : '—'}</p>
          <h3>Compétences de l’arbre</h3><div class="chips">${(e.skills ?? []).map(k => `<a class="chip" href="#arbre/${k}">${esc(skillById[k]?.name ?? k)}</a>`).join('')}</div>
          <h3>Mon rapport à cette fiche</h3>
          <dl class="kv"><dt>Consultée</dt><dd>${fmtDate(s.library.consulted[e.id])}</dd><dt>Travaillée</dt><dd>${practiced.length ? `${practiced.length} fois, dernière le ${fmtDate(practiced[0])}` : 'pas encore'}</dd>
          <dt>Évaluée</dt><dd><span class="subtle">Dans l’arbre, par une personne qualifiée.</span></dd></dl>
</section>
        <section class="panel"><h2>Risques et transferts</h2><div class="notice error"><strong>Risques et précautions.</strong> ${esc(e.risks ?? '')}</div>
          ${(e.transfers ?? []).length ? `<h3>Vers d’autres disciplines</h3><ul>${e.transfers.map(t => `<li><strong>${esc(DISC[t.to] ?? t.to)}</strong> <span class="rel r-${t.reliability}">${REL[t.reliability] ?? ''}</span> — ${esc(t.note)}</li>`).join('')}</ul>` : ''}
          ${related.length ? `<h3>Fiches liées</h3><p>${related.map(x => `<a href="#bibliotheque/${x.id}">${esc(x.title)}</a>`).join(' · ')}</p>` : ''}</section>
      </div>
      <section class="panel"><div class="notice"><strong>Limites.</strong> ${esc(e.limits)}</div>
        <h3>Sources et fiabilité</h3><ul class="sources">${e.sources.map(x => `<li><span class="pill">${esc(SRC[x.type] ?? x.type ?? '')}</span>${x.reliability ? `<span class="rel r-${x.reliability}">${REL[x.reliability]}</span> ` : ''}${x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noreferrer">${esc(x.label)}</a>` : esc(x.label)}</li>`).join('')}</ul>
        <details><summary>Historique éditorial · version ${esc(e.editorial.version)}</summary><dl class="kv"><dt>Auteur</dt><dd>${esc(e.editorial.author)}</dd>
          <dt>Relecture</dt><dd>${e.editorial.reviewedBy ? esc(e.editorial.reviewedBy) : 'aucune pour l’instant'}</dd></dl>
          <ul>${e.editorial.history.map(h => `<li>${esc(h.date)} — ${esc(h.change)}</li>`).join('')}</ul>
          <p class="subtle">Circuit prévu : brouillon → sources vérifiées → relecture technique par une personne identifiée → publication versionnée. Aucun contenu généré par IA n’est validé automatiquement.</p></details>
        <form id="correction"><label>Signaler une erreur ou proposer une correction (consignée dans votre carnet)<textarea name="text" rows="2" maxlength="800"></textarea></label><button>Consigner la proposition</button></form>
      </section>
      </details>
    </article>
  </div>`);
  if (e.sequence) mountView(ctx, e, view3d);
  app.querySelectorAll('[data-v]').forEach(b => b.onclick = () => { ctx.lib3d = b.dataset.v === '3d'; ctx.render(); });
  app.querySelectorAll('[data-entry]').forEach(b => b.onclick = () => ctx.go('bibliotheque/' + b.dataset.entry));
  app.querySelectorAll('[data-muscle]').forEach(b => b.onclick = () => { f.muscle = b.dataset.muscle; ctx.render(); });
  app.querySelectorAll('[data-f]').forEach(sel => sel.onchange = () => { f[sel.dataset.f] = sel.value; ctx.render(); });
  $('#q').oninput = ev => { f.q = ev.target.value; const pos = ev.target.selectionStart; ctx.render(); const q = $('#q'); q.focus(); q.setSelectionRange(pos, pos); };
  $('#practiced').onclick = () => {
    s.library.practiced[e.id] = [new Date().toISOString(), ...practiced].slice(0, 200);
    for (const k of e.skills ?? []) if (!k.startsWith('spe-')) s.skills = addTrace(s.skills, k, 'discover');
    ctx.save(); notify('Pratique consignée (elle compte aussi dans l’arbre).'); ctx.render();
  };
  $('#correction').onsubmit = ev => {
    ev.preventDefault(); const text = String(new FormData(ev.target).get('text')).trim(); if (!text) return;
    pushLimited(s.observations, {id: uid(), date: new Date().toISOString(), text: `[Correction proposée · ${e.title}] ${text}`.slice(0, 1000)});
    ctx.save(); ev.target.reset(); notify('Proposition consignée dans votre carnet.');
  };
}

async function mountView(ctx, e, view3d) {
  const host = $('#viewer');
  if (view3d) {
    const {webglAvailable, mount3d, dimsFromState} = await import('./mannequin3d.js');
    if (webglAvailable()) {
      host.innerHTML = '<p class="subtle">Chargement du mannequin 3D…</p>';
      try { const stop = await mount3d(host, e.sequence, {muscles: e.muscles ?? [], dims: dimsFromState(ctx.state)}); if (host.isConnected) ctx.cleanup.push(stop); else stop(); return; }
      catch (err) { console.error(err); notify('3D indisponible : retour à la planche 2D.'); }
    } else notify('WebGL indisponible sur cet appareil : planche 2D affichée.');
  }
  if (host.isConnected) ctx.cleanup.push(mountViewer(host, e.sequence, {id: 'lib'}));
}
