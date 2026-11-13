// Point d'entrée : état, persistance, routage, carte « moi » et navigation mobile. Chaque rubrique est un module de ./views/.
import {load, save as persist, backup} from './store.js';
import {$, $$, esc, notify, swapView} from './ui.js';
import {VOIES} from './data/orientation.js';
import * as home from './views/home.js';
import * as orientation from './views/orientation.js';
import * as avatar from './views/avatar.js';
import * as profile from './views/profile.js';
import * as training from './views/training.js';
import * as library from './views/library.js';
import * as tree from './views/tree.js';
import * as forge from './views/forge.js';
import * as workshop from './views/workshop.js';
import * as ways from './views/ways.js';
import * as community from './views/community.js';
import * as data from './views/data.js';
import * as map from './views/map.js';
import * as inventer from './views/inventer.js';
import * as arena from './views/arena.js';
import * as visualiser from './views/visualiser.js';
import * as analyser from './views/analyser.js';
import * as creer from './views/creer.js';
import * as plus from './views/plus.js';
import {SPACES, spaceOf} from './nav.js';
import * as sound from './engine/sound.js';

// La politique de sécurité (style-src 'self') bloque l'attribut style : un gabarit écrit data-css="propriété:valeur", posé ici par le CSSOM.
const applyCss = n => {
  if (n.nodeType !== 1) return;
  for (const e of [n, ...n.querySelectorAll('[data-css]')]) { const d = e.dataset?.css, i = d?.indexOf(':') ?? -1; if (i > 0) e.style.setProperty(d.slice(0, i), d.slice(i + 1)); }
};
new MutationObserver(list => list.forEach(m => m.addedNodes.forEach(applyCss))).observe($('#app'), {childList: true, subtree: true});

const routes = {visualiser, analyser, creer, plus, carte: map, inventer, reaction: arena, accueil: home, orientation, avatar, profil: profile, entrainement: training, bibliotheque: library, arbre: tree,
  forge, atelier: workshop, voies: ways, guildes: community, donnees: data};
// Menu : les trois espaces, puis « Plus » (tout le reste). Construit une fois, à partir de nav.js.
$('#mainnav').innerHTML = SPACES.map(d => `<a href="#${d.id}"><span class="ico">${d.icon}</span><span class="nav-text"><b>${d.label}${d.soon ? ' <em class="soon">bientôt</em>' : ''}</b><small>${d.hint}</small></span></a>`).join('')
  + '<a class="nav-plus" href="#plus"><span class="ico">⋯</span>Plus</a>';
$('.tabbar').innerHTML = SPACES.map(d => `<a href="#${d.id}"><span>${d.icon}</span>${d.label}</a>`).join('') + '<a href="#plus"><span>⋯</span>Plus</a>';

const loaded = load(localStorage);
const ctx = {
  state: loaded.state,
  issue: loaded.issue,
  cleanup: [],
  save() { const ok = persist(localStorage, ctx.state); if (!ok) notify('Sauvegarde impossible dans ce navigateur. Exportez vos données.'); refreshMe(); return ok; },
  backup(reason) { return backup(localStorage, JSON.stringify(ctx.state), reason); },
  render,
  go(hash) { if (location.hash === '#' + hash) render(); else location.hash = hash; }
};
if (loaded.issue === 'migre') ctx.save();

// Ambiance de la voie : la voie principale (ou l'emblème choisi) donne la teinte d'accent, rien d'autre.
export const accentVoie = s => ['foudre', 'racine', 'vent'].includes(s.avatar.emblem) ? s.avatar.emblem : s.orientation?.primary ?? null;

function refreshMe() {
  const s = ctx.state, o = s.orientation, me = $('#me'), v = accentVoie(s);
  for (const k of ['foudre', 'racine', 'vent']) document.body.classList.toggle('voie-' + k, v === k);
  if (!me) return;
  me.innerHTML = `${v ? orientation.sigil(v, 38, 1) : '<svg class="sigil" viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="none" stroke="currentColor" stroke-dasharray="3 4"/></svg>'}
    <span><b>${esc(s.profile.name || 'Mon reflet')}</b><small>${o?.primary ? esc(VOIES[o.primary].name) : 'Orientation à faire'}${s.avatar.title ? ' · ' + esc(s.avatar.title) : ''}</small></span>`;
}

function render() {
  for (const fn of ctx.cleanup.splice(0)) fn();
  ctx.onHide = [];
  const [route, ...params] = (location.hash.slice(1) || 'accueil').split('/');
  const key = Object.hasOwn(routes, route) ? route : 'accueil', nav = spaceOf(key);
  $$('#mainnav a, .tabbar a').forEach(a => a.setAttribute('aria-current', a.hash === '#' + nav ? 'page' : 'false'));
  routes[key].render(ctx, $('#app'), params.map(decodeURIComponent));
  paintSound();
  refreshMe();
}

let lastRoute = '';
window.addEventListener('hashchange', () => {
  const route = location.hash.slice(1).split('/')[0];
  const swap = () => { render(); if (route !== lastRoute) window.scrollTo(0, 0); lastRoute = route; };
  if (route !== lastRoute) { sound.tick(); swapView(swap); } else swap();
});
document.addEventListener('visibilitychange', () => { if (document.hidden) for (const fn of ctx.onHide ?? []) fn(); });
// Sons (coupés par défaut, synthétisés dans le navigateur).
const paintSound = () => document.querySelectorAll('[data-sound]').forEach(b => b.setAttribute('aria-pressed', String(sound.prefs[b.dataset.sound])));
// Les réglages de son vivent dans la page « Plus » : écoute déléguée, état repeint après chaque rendu.
document.addEventListener('click', e => { const b = e.target.closest?.('[data-sound]'); if (!b) return; sound.set(b.dataset.sound, !sound.prefs[b.dataset.sound]); paintSound(); });
paintSound();
if (sound.prefs.ambient) addEventListener('pointerdown', () => sound.startAmbient(), {once: true});   // le navigateur exige un premier geste
ctx.gong = sound.gong;
lastRoute = location.hash.slice(1).split('/')[0];
render();
if (loaded.issue === 'migre') notify('Vos données précédentes ont été reprises. Une copie de sécurité a été gardée.');

// Application installable et hors ligne : le service garde les fichiers de l'application sur l'appareil (jamais les données).
if ('serviceWorker' in navigator && window.isSecureContext) navigator.serviceWorker.register('sw.js').catch(() => {});
