// Les trois voies : les orientations Impact / Contrôle / Distance (décision du 07/11/2026 : les voies de cultivation sont supprimées).
// La voie ne change que l'ambiance et l'emblème du personnage ; elle n'impose aucun parcours.
import {VOIES, VOIE_IDS, NAME_PROPOSALS} from '../data/orientation.js';
import {skillById} from '../data/skills.js';
import {sigil} from './orientation.js';
import {esc, page} from '../ui.js';

const DISC = {boxe: 'Boxe anglaise', escrime: 'Escrime', lutte: 'Lutte', judo: 'Judo', karate: 'Karaté', 'muay-thai': 'Muay-thaï', jjb: 'Jiu-jitsu brésilien'};

export function render(ctx, app) {
  const o = ctx.state.orientation;
  app.innerHTML = page('Les trois voies', `
  <section class="hero"><span class="kicker">Univers de LA FORGE</span><h1>Les trois voies<span class="dot">.</span></h1>
  <p class="intro">Trois façons d’aborder l’affrontement : par l’impact, par le contrôle ou par la distance. L’orientation mesure vos penchants ;
  la voie colore votre personnage et son emblème, sans jamais vous enfermer : toutes les compétences restent ouvertes.</p>
  ${o ? '' : '<a class="button primary" href="#orientation">Découvrir mes penchants</a>'}</section>
  <div class="grid">${VOIE_IDS.map(v => { const w = VOIES[v];
    return `<section class="panel way">${sigil(v, 96, o ? Math.max(.25, o.affinities[v]) : .8)}<h2>${esc(w.name)}</h2><p class="serif">${esc(w.essence)}</p>
    ${o ? `<p><span class="pill">${Math.round(o.affinities[v] * 100)} % de vos penchants</span>${o.primary === v ? ' <span class="pill jade">votre voie principale</span>' : ''}</p>` : ''}
    <p>${esc(w.summary)}</p>
    <h3>Forces</h3><ul>${w.strengths.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
    <h3>Limites</h3><ul>${w.limits.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
    <h3>Compétences clés</h3><p>${w.keySkills.map(id => `<a class="pill" href="#arbre/${id}">${esc(skillById[id]?.name ?? id)}</a>`).join(' ')}</p>
    <p class="subtle">Disciplines proches : ${w.disciplines.map(d => esc(DISC[d] ?? d)).join(', ')}.</p></section>`; }).join('')}</div>
  <section class="panel"><h2>Les noms ne sont pas encore choisis</h2><p>${esc(NAME_PROPOSALS)}</p>
    <p class="subtle">Le vocabulaire des voies appartient à l’univers du projet : ce n’est ni une affirmation médicale ni une classification scientifique.</p></section>`);
}
