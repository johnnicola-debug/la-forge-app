// Espace CRÉER : trois façons de faire naître un mouvement (une idée, une vidéo, le mannequin) qui mènent au même éditeur,
// puis « Mes mouvements » : tout ce qui a été créé, gardé ou adapté, prêt à être revu en 3D, modifié ou assemblé.
import {DIMENSIONS, MOVE_ORIGINS, LIMITS, removeMovement} from '../engine/movement.js';
import * as gesture from './gesture.js';
import {thumb} from './visualiser.js';
import {esc, page} from '../ui.js';

const card = m => `<div class="mv-card mine"><a href="#visualiser/${encodeURIComponent(m.id)}" title="Voir en 3D">${thumb(m)}<b>${esc(m.name)}</b><small>${esc(DIMENSIONS[m.dimension])} · ${esc(MOVE_ORIGINS[m.origin.type])}</small></a>
  <span class="mv-acts"><a class="button small" href="#creer/poser/${encodeURIComponent(m.id)}">✎ Modifier</a><button class="small danger" data-del="${esc(m.id)}" aria-label="Supprimer ${esc(m.name)}">✕</button></span></div>`;

export function render(ctx, app, [sub, id, baseId]) {
  // Éditeur de poses : #creer/poser/nouveau, #creer/poser/nouveau/<geste à adapter> ou #creer/poser/<mouvement à modifier>.
  if (sub === 'poser') return gesture.render(ctx, app, gesture.libraryTarget(ctx.state), id && id !== 'nouveau' ? id : undefined, baseId);
  const s = ctx.state, mine = s.movements ?? [], older = s.workshop.methods.reduce((n, m) => n + (m.gestures?.length ?? 0), 0);
  app.innerHTML = page('Créer', `
  <section class="hero compact"><h1>Créer<span class="dot">.</span></h1>
    <p class="intro">Trois façons de faire naître un mouvement. Toutes mènent au même mannequin, et ce que vous gardez se retrouve dans « Mes mouvements ».</p></section>
  <div class="doors">
    <a class="door" href="#inventer"><span class="door-ico" aria-hidden="true">✧</span><b>Depuis une idée</b><small>Le Creuset recombine et transforme des gestes réels. La description en texte libre arrivera ensuite.</small></a>
    <a class="door" href="#analyser"><span class="door-ico" aria-hidden="true">▣</span><b>Depuis une vidéo</b><small>Extraire un mouvement d’un combat filmé.</small><em class="soon">bientôt</em></a>
    <a class="door" href="#creer/poser/nouveau"><span class="door-ico" aria-hidden="true">◐</span><b>En posant le mannequin</b><small>Pose après pose : le logiciel relie les poses entre elles.</small></a>
  </div>
  <section class="panel"><div class="head"><h2>Mes mouvements</h2><span class="subtle">${mine.length} / ${LIMITS.movements}</span></div>
    ${mine.length ? `<div class="mv-grid">${[...mine].reverse().map(card).join('')}</div>`
      : '<p class="empty">Rien pour l’instant. Créez un mouvement, gardez une invention du Creuset, ou adaptez un geste depuis Visualiser.</p>'}
    <p class="subtle">${older ? `${older} geste(s) plus ancien(s) restent rangés dans vos méthodes. ` : ''}<a href="#atelier">Assembler en méthodes et enchaînements →</a></p></section>`);
  app.querySelectorAll('[data-del]').forEach(b => b.onclick = () => {
    const m = mine.find(x => x.id === b.dataset.del);
    if (!m || !confirm(`Supprimer le mouvement « ${m.name} » ? Il sera aussi retiré de vos enchaînements.`)) return;
    removeMovement(s, m.id); ctx.save(); ctx.render();
  });
}
