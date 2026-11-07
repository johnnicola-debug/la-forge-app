// Statistiques d'entraînement pour les graphiques : uniquement à partir des séances réellement enregistrées
// (temps actif mesuré par le minuteur, effort déclaré, séries cochées). Aucune estimation.

const DAY = 864e5;
const startOfDay = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
// Lundi de la semaine contenant t.
const startOfWeek = t => { const d = new Date(startOfDay(t)); return d.getTime() - ((d.getDay() + 6) % 7) * DAY; };
const real = sessions => sessions.filter(s => s.status !== 'importee-v1' && s.startedAt);

// Minutes actives par semaine (les plus anciennes d'abord).
export function weekly(sessions, now = Date.now(), weeks = 12) {
  const w0 = startOfWeek(now) - (weeks - 1) * 7 * DAY;
  const out = Array.from({length: weeks}, (_, i) => ({start: w0 + i * 7 * DAY, minutes: 0, sessions: 0}));
  for (const s of real(sessions)) {
    const i = Math.floor((startOfWeek(Date.parse(s.startedAt)) - w0) / (7 * DAY));
    if (i >= 0 && i < weeks) { out[i].minutes += Math.round((s.activeSec ?? 0) / 60); out[i].sessions++; }
  }
  return out;
}

// Calendrier de régularité : semaines × 7 jours, minutes actives par jour.
export function heat(sessions, now = Date.now(), weeks = 12) {
  const d0 = startOfWeek(now) - (weeks - 1) * 7 * DAY, grid = Array.from({length: weeks}, () => Array(7).fill(0));
  for (const s of real(sessions)) {
    const i = Math.floor((startOfDay(Date.parse(s.startedAt)) - d0) / DAY);
    if (i >= 0 && i < weeks * 7) grid[Math.floor(i / 7)][i % 7] += Math.round((s.activeSec ?? 0) / 60);
  }
  return {start: d0, grid, today: Math.floor((startOfDay(now) - d0) / DAY)};
}

// Effort déclaré et part des séries faites, séance par séance (les plus anciennes d'abord).
export function effortSeries(sessions, n = 20) {
  return real(sessions).filter(s => s.effort).sort((a, b) => a.startedAt.localeCompare(b.startedAt)).slice(-n).map(s => {
    const sets = (s.blocks ?? []).flatMap(b => b.sets ?? []);
    return {date: s.startedAt, effort: s.effort, minutes: Math.round((s.activeSec ?? 0) / 60), done: sets.length ? sets.filter(x => x.done).length / sets.length : null};
  });
}

// Série de jours d'affilée avec au moins une séance (jusqu'à aujourd'hui ou hier).
export function streak(sessions, now = Date.now()) {
  const days = new Set(real(sessions).map(s => startOfDay(Date.parse(s.startedAt))));
  let d = startOfDay(now), n = 0;
  if (!days.has(d)) d -= DAY;
  while (days.has(d)) { n++; d -= DAY; }
  return n;
}
