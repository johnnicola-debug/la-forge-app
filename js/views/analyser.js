// Espace ANALYSER : l'analyse vidéo n'existe pas encore (phase 3 de la refonte). La page le dit sans détour :
// aucun import, aucun résultat, aucune démonstration préenregistrée tant que la reconstruction n'est pas réelle et vérifiée.
import {page} from '../ui.js';

export function render(ctx, app) {
  app.innerHTML = page('Analyser', `
  <section class="hero compact"><h1>Analyser<span class="dot">.</span></h1>
    <p class="intro">Décomposer un combat filmé : importer une vidéo, reconstruire les deux combattants sur des mannequins 3D, puis en extraire un mouvement.</p></section>
  <p class="soon-note"><b>Pas encore disponible.</b> Tant que l’analyse n’est pas réelle et vérifiée, cet espace n’affiche ni import ni résultat : rien n’est simulé.</p>
  <div class="an-steps">
    <div class="an-step"><span>1</span><b>Importer</b><small>Une vidéo de deux personnes, lue sur votre ordinateur. Elle n’est envoyée nulle part.</small></div>
    <div class="an-step"><span>2</span><b>Reconstruire</b><small>Deux mannequins 3D suivent les combattants. Vidéo et 3D partagent le même curseur de temps ; la caméra 3D reste libre.</small></div>
    <div class="an-step"><span>3</span><b>Extraire</b><small>Une séquence choisie devient un mouvement découpé en étapes, à modifier dans Créer.</small></div>
  </div>
  <section class="panel"><h2>Ce que l’outil devra dire honnêtement</h2>
    <ul class="an-list"><li>Une vidéo filmée d’un seul angle ne permet pas une reconstruction exacte : chaque passage portera un indice de fiabilité.</li>
      <li>Les parties devinées (membre caché, image floue) seront signalées comme telles.</li>
      <li>Chaque pose pourra être corrigée à la main, et une reconstruction ratée pourra être écartée.</li></ul></section>
  <div class="actions"><a class="button primary" href="#visualiser">◉ Visualiser un mouvement</a><a class="button" href="#creer">✦ Créer un mouvement</a></div>`);
}
