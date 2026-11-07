// Parcours et données : observations, sauvegarde, import, copies de sécurité, effacement.
import {initial, parseImport, backups, VERSION} from '../store.js';
import {$, esc, page, fmtDate, notify} from '../ui.js';

export function render(ctx, app) {
  const s = ctx.state, copies = backups(localStorage);
  app.innerHTML = page('Parcours et données', `
  <section class="hero"><span class="kicker">Vos traces</span><h1>Des traces, pas des promesses<span class="dot">.</span></h1>
  <p class="intro">Tout est stocké dans ce navigateur, à cette adresse (http://127.0.0.1:8788). Rien n’est envoyé. Exportez régulièrement.</p></section>
  ${ctx.issue === 'illisible' ? '<div class="notice error">La sauvegarde enregistrée n’a pas pu être lue. Elle n’a pas été effacée : une copie de sécurité est prise avant toute nouvelle écriture.</div>' : ''}
  <div class="grid">
    <section class="panel"><h2>En bref</h2><dl class="kv"><dt>Séances</dt><dd>${s.sessions.length}</dd><dt>Performances</dt><dd>${s.performances.length}</dd>
      <dt>Repères et tests</dt><dd>${s.measurements.length}</dd><dt>Observations</dt><dd>${s.observations.length}</dd>
      <dt>Fiches consultées</dt><dd>${Object.keys(s.library.consulted).length}</dd><dt>Méthodes</dt><dd>${s.workshop.methods.length}</dd></dl>
      <p class="subtle">Aucun score global n’est calculé.</p></section>
    <section class="panel"><h2>Sauvegarde</h2><p>Format JSON, version ${VERSION}. Les sauvegardes de la version 0.1 sont acceptées et converties.</p>
      <div class="actions"><button id="export" class="primary">Exporter</button><label class="button">Importer<input id="import" type="file" accept="application/json,.json" hidden></label></div>
      <p class="subtle">L’export contient vos données personnelles en clair.</p></section>
    <section class="panel"><h2>Copies de sécurité</h2><p class="subtle">Prises automatiquement avant une migration, un import ou un effacement (5 dernières, dans ce navigateur).</p>
      ${copies.length ? copies.map((c, i) => `<p>${fmtDate(c.date)} · ${esc(c.reason)} <button class="ghost" data-copy="${i}">Télécharger</button></p>`).join('') : '<p class="empty">Aucune copie.</p>'}</section>
  </div>
  <section class="panel"><h2>Observations</h2>${s.observations.length ? s.observations.slice(0, 50).map(o => `<p><small>${fmtDate(o.date)}</small><br>${esc(o.text)}</p>`).join('') : '<p class="empty">Aucune observation.</p>'}</section>
  <section class="panel"><h2>Effacer</h2><p>Efface toutes les données de LA FORGE dans ce navigateur (une copie de sécurité est gardée).</p><button id="reset" class="danger">Effacer mes données</button></section>`);
  const download = (text, name) => { const url = URL.createObjectURL(new Blob([text], {type: 'application/json'})); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); };
  $('#export').onclick = () => download(JSON.stringify(s, null, 2), `la-forge-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`);
  app.querySelectorAll('[data-copy]').forEach(b => b.onclick = () => download(copies[Number(b.dataset.copy)].raw, `la-forge-copie-${copies[Number(b.dataset.copy)].date.slice(0, 10)}.json`));
  $('#import').onchange = async e => {
    try {
      const f = e.target.files[0]; if (!f || f.size > 5e6) throw Error();
      const next = parseImport(await f.text());
      if (!confirm('Remplacer vos données actuelles par cette sauvegarde ? Une copie de sécurité des données actuelles sera gardée.')) return;
      ctx.backup('Avant import'); ctx.state = next; ctx.issue = null; ctx.save(); notify('Sauvegarde importée.'); ctx.render();
    } catch { notify('Fichier invalide ou trop volumineux. Vos données actuelles sont conservées.'); }
  };
  $('#reset').onclick = () => { if (confirm('Effacer tout votre parcours dans ce navigateur ?')) { ctx.backup('Avant effacement'); ctx.state = initial(); ctx.issue = null; ctx.save(); notify('Données effacées.'); ctx.render(); } };
}
