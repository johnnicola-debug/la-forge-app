// Graphe des prérequis (arbre de compétences). Un lien = « à aborder avant »,
// jamais un verrou de niveau ni une preuve de compétence.

// nodes : [{id, prerequisites: [ids]}]
export function checkGraph(nodes) {
  const ids = new Set(nodes.map(n => n.id)), missing = [], duplicates = [];
  const seen = new Set();
  for (const n of nodes) { if (seen.has(n.id)) duplicates.push(n.id); seen.add(n.id); }
  for (const n of nodes) for (const p of n.prerequisites ?? []) if (!ids.has(p)) missing.push(`${n.id} → ${p}`);
  const byId = Object.fromEntries(nodes.map(n => [n.id, n])), state = {}, cycles = [];
  const visit = (id, path) => {
    if (state[id] === 2 || !byId[id]) return;
    if (state[id] === 1) { cycles.push([...path.slice(path.indexOf(id)), id].join(' → ')); return; }
    state[id] = 1;
    for (const p of byId[id].prerequisites ?? []) visit(p, [...path, id]);
    state[id] = 2;
  };
  for (const n of nodes) visit(n.id, []);
  return {missing, duplicates, cycles, ok: !missing.length && !duplicates.length && !cycles.length};
}

// Profondeur = plus long chemin depuis une racine (suppose un graphe sans cycle).
export function depths(nodes) {
  const byId = Object.fromEntries(nodes.map(n => [n.id, n])), memo = {};
  const d = (id, guard = 0) => {
    if (memo[id] !== undefined) return memo[id];
    if (guard > nodes.length) return 0;
    const pre = (byId[id]?.prerequisites ?? []).filter(p => byId[p]);
    return memo[id] = pre.length ? 1 + Math.max(...pre.map(p => d(p, guard + 1))) : 0;
  };
  return Object.fromEntries(nodes.map(n => [n.id, d(n.id)]));
}

// Parcours de lecture ordonné jusqu'à une fiche cible (prérequis d'abord).
export function pathTo(nodes, target) {
  const byId = Object.fromEntries(nodes.map(n => [n.id, n])), out = [], seen = new Set();
  const walk = id => { if (seen.has(id) || !byId[id]) return; seen.add(id); (byId[id].prerequisites ?? []).forEach(walk); out.push(id); };
  walk(target);
  return out;
}

export function layout(nodes, {colW = 210, rowH = 64, padX = 20, padY = 30} = {}) {
  const dep = depths(nodes), cols = {};
  for (const n of nodes) (cols[dep[n.id]] ??= []).push(n);
  const pos = {};
  for (const [c, list] of Object.entries(cols)) list.forEach((n, i) => pos[n.id] = {x: padX + c * colW, y: padY + i * rowH});
  const w = padX * 2 + (Math.max(0, ...Object.keys(cols).map(Number)) + 1) * colW;
  const h = padY * 2 + Math.max(...Object.values(cols).map(l => l.length)) * rowH;
  return {pos, width: w, height: h};
}
