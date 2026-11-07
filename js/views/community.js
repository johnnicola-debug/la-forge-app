// Guildes et échanges : conception et préférences de partage. Aucun serveur : rien n'est publié.
import {SHARE_KEYS, SHARE_LEVELS} from '../store.js';
import {$, esc, page, notify} from '../ui.js';

export function render(ctx, app) {
  const sh = ctx.state.sharing;
  app.innerHTML = page('Guildes et échanges', `
  <section class="hero"><span class="kicker">Dimension sociale</span><h1>Pratiquer ensemble<span class="dot">.</span></h1>
  <p class="intro">LA FORGE prévoit des échanges entre pratiquants et des guildes martiales autour d’intérêts communs. Cette version locale n’a ni comptes ni serveur :
  <strong>aucun échange réel n’est possible et rien n’est publié</strong>. Cette page prépare les règles de partage.</p></section>
  <div class="split">
    <form id="share" class="panel"><h2>Mes préférences de partage</h2>
      <p class="subtle">Enregistrées dès maintenant pour la future version en ligne. Par défaut tout est privé ; les performances physiques ne deviennent jamais publiques automatiquement.</p>
      <table><thead><tr><th>Donnée</th>${Object.values(SHARE_LEVELS).map(l => `<th>${l}</th>`).join('')}</tr></thead><tbody>
      ${Object.entries(SHARE_KEYS).map(([k, l]) => `<tr><td>${esc(l)}</td>${Object.keys(SHARE_LEVELS).map(v => `<td><input type="radio" name="${k}" value="${v}" ${sh[k] === v ? 'checked' : ''} aria-label="${esc(l)} : ${SHARE_LEVELS[v]}"></td>`).join('')}</tr>`).join('')}
      </tbody></table><div class="actions"><button class="primary">Enregistrer</button></div></form>
    <section class="panel ink"><h2>Ce que seront les guildes</h2>
      <ul><li>Une présentation, des membres, des espaces de discussion et des objectifs communs (ex. « appuis et déplacements », « reprise après 40 ans »).</li>
      <li>Invitations ou demandes d’adhésion validées par les responsables de la guilde.</li>
      <li>Partage choisi d’observations, de séances et de créations de l’atelier.</li>
      <li>Blocage d’une personne, signalement d’un contenu, modération par la guilde puis par LA FORGE.</li>
      <li>Les connaissances communautaires restent séparées des fiches relues de la bibliothèque, avec un marquage visible.</li></ul>
      <p class="subtle">Choix d’hébergement, de comptes et de coût : à étudier plus tard (voir docs/SOCIAL.md).</p></section>
  </div>`);
  $('#share').onsubmit = e => {
    e.preventDefault(); const d = new FormData(e.target);
    for (const k of Object.keys(SHARE_KEYS)) if (d.get(k) in SHARE_LEVELS) ctx.state.sharing[k] = d.get(k);
    ctx.save(); notify('Préférences enregistrées (localement).');
  };
}
