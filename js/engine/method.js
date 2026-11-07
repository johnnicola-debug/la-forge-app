// Arbre propre à une méthode : chaque élément peut suivre d'autres éléments (« à aborder après »).
// Les niveaux se calculent par la plus longue chaîne de prérequis ; une boucle éventuelle est coupée.

export function levels(elements) {
  const byId = Object.fromEntries(elements.map(e => [e.id, e])), depth = {};
  const visit = (id, stack) => {
    if (depth[id] !== undefined) return depth[id];
    if (stack.has(id)) return 0;                       // boucle : on la coupe
    stack.add(id);
    const parents = (byId[id]?.after ?? []).filter(p => byId[p]);
    const d = parents.length ? 1 + Math.max(...parents.map(p => visit(p, stack))) : 0;
    stack.delete(id);
    return (depth[id] = d);
  };
  elements.forEach(e => visit(e.id, new Set()));
  const cols = [];
  for (const e of elements) (cols[depth[e.id]] ??= []).push(e);
  return {depth, cols: cols.map(c => c ?? [])};
}

// Éléments à travailler dans une séance de la méthode : ceux « en travail », sinon les premiers « à explorer »
// dont les prérequis sont déjà retenus ou en travail, les gestes de la bibliothèque passant avant les points de réflexion.
export function sessionElements(elements, max = 4) {
  const active = elements.filter(e => e.status === 'en-travail');
  if (active.length) return active.slice(0, max);
  const ok = new Set(elements.filter(e => ['retenu', 'en-travail'].includes(e.status)).map(e => e.id));
  const {depth} = levels(elements);
  return elements.filter(e => e.status === 'a-explorer' && (e.after ?? []).every(p => ok.has(p) || !elements.some(x => x.id === p)))
    .sort((a, b) => (a.ref ? 0 : 1) - (b.ref ? 0 : 1) || depth[a.id] - depth[b.id]).slice(0, max);   // d'abord les gestes (fiches), puis les réflexions
}
