// Petits outils d'interface partagés par les vues.
export const $ = (s, root = document) => root.querySelector(s);
export const $$ = (s, root = document) => [...root.querySelectorAll(s)];
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
export const fmtDate = s => s ? new Date(s).toLocaleDateString('fr-FR', {day: 'numeric', month: 'short', year: 'numeric'}) : 'date inconnue';
export const fmtClock = sec => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
export const today = () => new Date().toISOString().slice(0, 10);

let msgTimer;
export function notify(text) {
  const m = $('#message');
  m.textContent = text; m.classList.add('on');
  clearTimeout(msgTimer); msgTimer = setTimeout(() => m.classList.remove('on'), 4000);
}

export const landscape = () => `<svg class="landscape" viewBox="0 0 560 190" aria-hidden="true" preserveAspectRatio="xMaxYMin slice">
<defs><linearGradient id="mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6f5f1" stop-opacity="0"/><stop offset="1" stop-color="#f6f5f1"/></linearGradient></defs>
<circle cx="420" cy="58" r="34" fill="#efd3cb" opacity=".7"/>
<path d="M120 150 L190 92 L222 112 L270 58 L318 104 L352 84 L398 120 L440 96 L500 128 L560 110 V190 H120Z" fill="#dcd9d0"/>
<path d="M60 170 L140 128 L200 150 L262 118 L330 150 L392 126 L470 156 L560 140 V190 H60Z" fill="#c9c6bb"/>
<path d="M300 190 V86 M520 190 V86 M286 86 H534 M292 98 H528" stroke="#b9b5aa" stroke-width="4" fill="none"/>
<rect x="0" y="120" width="560" height="70" fill="url(#mist)"/></svg>`;

export function page(title, body) {
  return `<div class="top"><span class="crumb">${esc(title)}</span><span>Version locale 0.5 · prototype</span></div>${body}
<footer>LA FORGE 0.5 · prototype local. Contenus et séances : propositions éditoriales non validées par un entraîneur, un médecin ou un biomécanicien.
Les animations sont des illustrations. Aucun niveau martial n’est certifié ; aucune donnée n’est envoyée.</footer>`;
}

// Liste de cases à cocher (chips).
export const chips = (name, options, selected) => `<div class="chips">${Object.entries(options).map(([v, l]) =>
  `<label><input type="checkbox" name="${name}" value="${esc(v)}" ${selected.includes(v) ? 'checked' : ''}>${esc(l)}</label>`).join('')}</div>`;
export const options = (opts, sel) => Object.entries(opts).map(([v, l]) => `<option value="${esc(v)}" ${String(v) === String(sel) ? 'selected' : ''}>${esc(l)}</option>`).join('');
export const numOrNull = v => v === null || v === undefined || String(v).trim() === '' ? null : Number(String(v).replace(',', '.'));

// Change l'affichage avec une transition douce si possible, sans jamais en dépendre :
// si le navigateur ne peint pas (onglet masqué), la mise à jour est faite quand même après 350 ms.
export function swapView(fn) {
  let done = false;
  const run = () => { if (!done) { done = true; fn(); } };
  if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches || document.hidden) return run();
  const t = document.startViewTransition(run);
  for (const pr of [t.ready, t.finished, t.updateCallbackDone]) pr.catch(() => {});
  setTimeout(run, 350);
}
