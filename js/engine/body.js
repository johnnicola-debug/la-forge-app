// Carte du corps : courbatures déclarées après chaque séance (0 rien, 1 légère, 2 forte, 3 douleur) et charge
// d'entraînement. Charge d'une séance = effort déclaré (1–10) × minutes actives mesurées : méthode « session-RPE »
// (Foster et al., 2001, « A new approach to monitoring exercise training », J Strength Cond Res 15(1):109–115).
// La carte montre ce que la personne a déclaré ; elle ne pose aucun diagnostic.

export const ZONES = {
  nuque: 'Nuque', epaules: 'Épaules', bras: 'Bras', poignets: 'Poignets et mains', poitrine: 'Poitrine', abdos: 'Abdominaux',
  'haut-dos': 'Haut du dos', 'bas-dos': 'Bas du dos', hanches: 'Hanches', fessiers: 'Fessiers', 'cuisses-avant': 'Avant des cuisses',
  'cuisses-arriere': 'Arrière des cuisses', genoux: 'Genoux', mollets: 'Mollets', chevilles: 'Chevilles et pieds'
};
export const LEVELS = ['rien', 'courbature légère', 'courbature forte', 'douleur'];
export const validBody = b => b === undefined || (b && typeof b === 'object' && !Array.isArray(b)
  && Object.entries(b).every(([z, v]) => z in ZONES && [1, 2, 3].includes(v)));

const DAY = 864e5;
const real = sessions => sessions.filter(s => s.status !== 'importee-v1' && s.startedAt);

// Zones sur les 28 derniers jours : nombre de déclarations, niveau maximal, niveau le plus récent, et un indice
// d'intensité (somme des niveaux, les plus récents comptant davantage) borné à 0–1 pour la couleur.
export function soreness(sessions, now = Date.now(), days = 28) {
  const out = {};
  for (const s of real(sessions)) {
    const age = (now - Date.parse(s.startedAt)) / DAY;
    if (age < 0 || age > days || !s.body) continue;
    for (const [z, v] of Object.entries(s.body)) {
      const o = out[z] ??= {count: 0, max: 0, last: null, lastAge: Infinity, heat: 0};
      o.count++; o.max = Math.max(o.max, v); o.heat += v * (1 - age / (days + 1));
      if (age < o.lastAge) { o.lastAge = age; o.last = v; }
    }
  }
  for (const o of Object.values(out)) o.heat = Math.min(1, o.heat / 6);
  return out;
}

// Douleurs (niveau 3) déclarées ces 7 derniers jours.
export const recentPain = (sessions, now = Date.now()) =>
  Object.entries(soreness(sessions, now, 7)).filter(([, o]) => o.max === 3).map(([z]) => z);

// Charge hebdomadaire (effort × minutes), les plus anciennes d'abord.
export function weeklyLoad(sessions, now = Date.now(), weeks = 8) {
  const d = new Date(now); d.setHours(0, 0, 0, 0);
  const w0 = d.getTime() - ((d.getDay() + 6) % 7) * DAY - (weeks - 1) * 7 * DAY;
  const out = Array.from({length: weeks}, (_, i) => ({start: w0 + i * 7 * DAY, load: 0}));
  for (const s of real(sessions)) {
    if (!s.effort) continue;
    const i = Math.floor((Date.parse(s.startedAt) - w0) / (7 * DAY));
    if (i >= 0 && i < weeks) out[i].load += s.effort * Math.round((s.activeSec ?? 0) / 60);
  }
  return out;
}
