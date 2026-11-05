export function num(d) {
  if (d == null || d === Infinity || d === -Infinity || Number.isNaN(d)) return "∞";
  if (typeof d === "number" && !Number.isInteger(d)) {
    return String(Math.round(d * 100) / 100);
  }
  return String(d);
}

export function adjOf(nodes, edges, undirected = true) {
  const adj = {};
  for (const n of nodes) adj[n] = [];
  for (const e of edges) {
    adj[e.u].push(e.v);
    if (undirected && e.u !== e.v) adj[e.v].push(e.u);
  }
  return adj;
}
