// Page « Plus » : tout ce qui n'est pas l'un des trois espaces (entraînement, profil, univers, réglages), sans rien retirer.
// La carte « moi » (#me) est remplie par app.js après chaque rendu ; les boutons de son y sont écoutés par délégation.
import {PLUS} from '../nav.js';
import {esc, page} from '../ui.js';

const SOUND = `<div class="sound-ctl" role="group" aria-label="Sons"><button data-sound="ui" aria-pressed="false">♪ Sons</button><button data-sound="ambient" aria-pressed="false">≈ Ambiance</button></div>
  <p class="subtle">Sons de l’interface et ambiance : coupés par défaut.</p>`;

export function render(ctx, app) {
  app.innerHTML = page('Plus', `
  <section class="hero compact"><h1>Plus<span class="dot">.</span></h1><p class="intro">Tout ce qui accompagne l’atelier : entraînement, profil, univers, réglages.</p></section>
  <div class="plus"><a class="me" id="me" href="#avatar"></a>
    <div class="plus-grid">${PLUS.map(g => `<section class="panel plus-group"><h2>${esc(g.title)}</h2>
      ${g.items.map(([route, icon, label, hint]) => `<a href="#${route}"><span class="ico" aria-hidden="true">${icon}</span><span><b>${esc(label)}</b><small>${esc(hint)}</small></span></a>`).join('')}${g.sound ? SOUND : ''}</section>`).join('')}</div></div>`);
}
