function key(u, v) {
  return `${u}>${v}`;
}

export function maxFlow(edges, s, t, mode = "dfs") {
  const cap = new Map();
  const orig = new Set();
  const out = {};
  const touch = (u) => {
    if (!out[u]) out[u] = [];
  };
  for (const e of edges) {
    touch(e.u);
    touch(e.v);
    const k = key(e.u, e.v);
    cap.set(k, (cap.get(k) || 0) + e.c);
    orig.add(k);
    if (!out[e.u].includes(e.v)) out[e.u].push(e.v);
    if (!out[e.v].includes(e.u)) out[e.v].push(e.u);
  }
  const res = new Map(cap);
  for (const e of edges) {
    const rev = key(e.v, e.u);
    if (!res.has(rev)) res.set(rev, 0);
  }

  const flowOf = () => {
    const flow = {};
    for (const k of orig) flow[k] = cap.get(k) - res.get(k);
    return flow;
  };
  const valueOf = (flow) => {
    let v = 0;
    for (const e of edges) {
      const f = flow[key(e.u, e.v)] || 0;
      if (e.u === s) v += f;
      if (e.v === s) v -= f;
    }
    return v;
  };
  const dumpRes = () => Object.fromEntries(res);

  function reconstruct(prev) {
    const nodes = [t];
    const pathEdges = [];
    let v = t;
    while (v !== s) {
      const u = prev[v];
      nodes.push(u);
      pathEdges.push({ u, v, reverse: !orig.has(key(u, v)) });
      v = u;
    }
    nodes.reverse();
    pathEdges.reverse();
    return { nodes, pathEdges };
  }

  function findDfs() {
    const prev = {};
    const seen = new Set();
    function go(u) {
      seen.add(u);
      if (u === t) return true;
      for (const v of out[u] || []) {
        if (res.get(key(u, v)) > 0 && !seen.has(v)) {
          prev[v] = u;
          if (go(v)) return true;
        }
      }
      return false;
    }
    if (!go(s)) return null;
    return reconstruct(prev);
  }

  function findBfs() {
    const prev = { [s]: null };
    const seen = new Set([s]);
    const q = [s];
    while (q.length) {
      const u = q.shift();
      for (const v of out[u] || []) {
        if (res.get(key(u, v)) > 0 && !seen.has(v)) {
          seen.add(v);
          prev[v] = u;
          if (v === t) return reconstruct(prev);
          q.push(v);
        }
      }
    }
    return null;
  }

  const frames = [];
  const snap = (note, path) => {
    const flow = flowOf();
    frames.push({
      note,
      flow,
      res: dumpRes(),
      path: path ? path.nodes : null,
      pathEdges: path ? path.pathEdges : null,
      bottleneck: path ? path.bottleneck : null,
      value: valueOf(flow),
      cut: null,
      cutCap: null,
    });
  };

  snap("Flyten starter på 0. Se etter en sti fra s til t i residualnettet.", null);
  let guard = 0;
  while (guard++ < 50) {
    const found = mode === "bfs" ? findBfs() : findDfs();
    if (!found) break;
    let b = Infinity;
    for (const e of found.pathEdges) b = Math.min(b, res.get(key(e.u, e.v)));
    found.bottleneck = b;
    const via = found.nodes.join(" → ");
    const undone = found.pathEdges.filter((e) => e.reverse).map((e) => `${e.v}→${e.u}`);
    snap(
      undone.length
        ? `Sti ${via}, flaskehals ${b}. Baklengs over ${undone.join(", ")}: vi angrer flyt som allerede er sendt.`
        : `Sti ${via}, flaskehals ${b}. Send ${b} langs hele stien.`,
      found
    );
    for (const e of found.pathEdges) {
      const fwd = key(e.u, e.v);
      const rev = key(e.v, e.u);
      res.set(fwd, res.get(fwd) - b);
      res.set(rev, (res.get(rev) || 0) + b);
    }
    snap(`Flyten økte med ${b}.`, null);
  }

  const reach = new Set();
  const stack = [s];
  while (stack.length) {
    const u = stack.pop();
    if (reach.has(u)) continue;
    reach.add(u);
    for (const v of out[u] || []) {
      if (res.get(key(u, v)) > 0) stack.push(v);
    }
  }
  let cutCap = 0;
  for (const e of edges) {
    if (reach.has(e.u) && !reach.has(e.v)) cutCap += e.c;
  }
  const flow = flowOf();
  const value = valueOf(flow);
  frames.push({
    note: `Ingen utvidende sti. Noder som fortsatt kan nås fra s: ${[...reach].join(", ")}. Det er et minimumskutt med kapasitet ${cutCap}, lik flytverdien ${value}.`,
    flow,
    res: dumpRes(),
    path: null,
    pathEdges: null,
    bottleneck: null,
    value,
    cut: [...reach],
    cutCap,
  });
  return frames;
}

export function bipartiteMatching(left, right, edges) {
  const adj = {};
  for (const u of left) adj[u] = [];
  for (const e of edges) adj[e.u].push(e.v);
  const matchL = {};
  const matchR = {};
  for (const u of left) matchL[u] = null;
  for (const v of right) matchR[v] = null;
  const frames = [];

  function matchingList() {
    return left.filter((u) => matchL[u]).map((u) => [u, matchL[u]]);
  }

  function snap(note, path, cover) {
    frames.push({
      note,
      pairs: matchingList(),
      path: path || null,
      cover: cover || null,
    });
  }

  function dfs(u, seen, path) {
    for (const v of adj[u]) {
      if (seen.has(v)) continue;
      seen.add(v);
      path.push([u, v]);
      if (matchR[v] == null || dfs(matchR[v], seen, path)) {
        matchL[u] = v;
        matchR[v] = u;
        return true;
      }
      path.pop();
    }
    return false;
  }

  snap("Tom matching. En utvidende sti starter i en ledig node til venstre og bytter mellom umatchede og matchede kanter.", null, null);

  for (const u of left) {
    if (matchL[u] != null) continue;
    const seen = new Set();
    const path = [];
    if (dfs(u, seen, path)) {
      const text = path.map(([a, b]) => `${a}–${b}`).join(", ");
      snap(`Fant sti fra ${u}: ${text}. Kantene bytter status, og matchingen vokser med 1.`, path, null);
    } else {
      snap(`Ingen utvidende sti fra ${u}.`, null, null);
    }
  }

  const seenL = new Set();
  const seenR = new Set();
  const stack = left.filter((u) => matchL[u] == null);
  while (stack.length) {
    const u = stack.pop();
    if (seenL.has(u)) continue;
    seenL.add(u);
    for (const v of adj[u]) {
      if (matchL[u] === v) continue;
      if (seenR.has(v)) continue;
      seenR.add(v);
      if (matchR[v] != null) stack.push(matchR[v]);
    }
  }
  const cover = [...left.filter((u) => !seenL.has(u)), ...right.filter((v) => seenR.has(v))];
  const pairs = matchingList();
  snap(
    `Maks matching har ${pairs.length} kanter. Et minste vertex cover er {${cover.join(", ")}}, like stort. Det er Kőnig, og det gjelder ikke utenfor bipartitte grafer.`,
    null,
    cover
  );
  return frames;
}

function permCost(cost, perm) {
  let s = 0;
  for (let i = 0; i < perm.length; i++) s += cost[i][perm[i]];
  return s;
}

export function assignment(workers, jobs, cost) {
  const n = workers.length;
  const S = "s";
  const T = "t";
  const res = [];
  const revOf = new Map();

  function addEdge(u, v, cap, c, kind, wi, ji) {
    const e = { u, v, cap, cost: c, kind, wi, ji };
    const r = { u: v, v: u, cap: 0, cost: -c, kind: "rev", wi, ji };
    e.back = r;
    r.back = e;
    res.push(e, r);
    revOf.set(e, r);
    revOf.set(r, e);
  }

  workers.forEach((w, i) => addEdge(S, w, 1, 0, "src", i, null));
  jobs.forEach((j, k) => addEdge(j, T, 1, 0, "sink", null, k));
  workers.forEach((w, i) => {
    jobs.forEach((j, k) => addEdge(w, j, 1, cost[i][k], "job", i, k));
  });

  const nodes = [S, ...workers, ...jobs, T];

  function shortest() {
    const dist = {};
    const prev = {};
    const preve = {};
    for (const node of nodes) dist[node] = Infinity;
    dist[S] = 0;
    for (let r = 0; r < nodes.length - 1; r++) {
      let changed = false;
      for (const e of res) {
        if (e.cap <= 0 || dist[e.u] === Infinity) continue;
        const nd = dist[e.u] + e.cost;
        if (nd < dist[e.v] - 1e-9) {
          dist[e.v] = nd;
          prev[e.v] = e.u;
          preve[e.v] = e;
          changed = true;
        }
      }
      if (!changed) break;
    }
    if (dist[T] === Infinity) return null;
    const path = [];
    let v = T;
    while (v !== S) {
      path.push(preve[v]);
      v = prev[v];
    }
    path.reverse();
    return { path, cost: dist[T] };
  }

  function pairs() {
    const out = [];
    for (const e of res) {
      if (e.kind === "job" && e.cap === 0) out.push([workers[e.wi], jobs[e.ji], e.cost]);
    }
    return out;
  }

  const frames = [];
  const snap = (note, path) => {
    const ps = pairs();
    const hops = path
      ? path
          .filter((e) => e.kind === "job" || e.kind === "rev")
          .map((e) => ({
            u: e.kind === "rev" ? e.back.u : e.u,
            v: e.kind === "rev" ? e.back.v : e.v,
            undo: e.kind === "rev",
            cost: Math.abs(e.cost),
          }))
      : null;
    frames.push({
      note,
      pairs: ps,
      hops,
      total: ps.reduce((s, p) => s + p[2], 0),
    });
  };

  snap("Nullflyt har verdi 0 og kostnad 0. Hver utvidelse går langs billigste sti i residualnettet, der returkanter har negativ kostnad.", null);

  let guard = 0;
  while (guard++ < n + 2) {
    const found = shortest();
    if (!found) break;
    const labels = found.path.map((e) => {
      if (e.kind === "rev") return `${e.u}→${e.v} (angre, kostnad ${e.cost})`;
      if (e.kind === "job") return `${e.u}→${e.v} (kostnad ${e.cost})`;
      return `${e.u}→${e.v}`;
    });
    snap(`Billigste sti koster ${found.cost}: ${labels.join(", ")}.`, found.path);
    for (const e of found.path) {
      e.cap -= 1;
      e.back.cap += 1;
    }
    const ps = pairs();
    snap(
      `Matching nå: ${ps.map((p) => `${p[0]}–${p[1]} (${p[2]})`).join(", ") || "tom"}. Sum ${ps.reduce((s, p) => s + p[2], 0)}.`,
      null
    );
  }
  frames.bruteHint = permCost;
  return frames;
}
