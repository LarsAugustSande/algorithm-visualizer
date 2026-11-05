import { adjOf } from "../format.js";

export function bfs(nodes, edges, start) {
  const adj = adjOf(nodes, edges, true);
  const dist = {};
  const parent = {};
  for (const n of nodes) dist[n] = Infinity;
  dist[start] = 0;
  const seen = new Set([start]);
  const q = [start];
  const order = [];
  const frames = [];
  const snap = (note, current) =>
    frames.push({
      note,
      current,
      dist: { ...dist },
      parent: { ...parent },
      queue: q.slice(),
      order: order.slice(),
    });

  snap(`Køen starter med ${start}. Avstand 0, alle andre er uendelig.`, start);

  while (q.length) {
    const u = q.shift();
    order.push(u);
    snap(`Tar ${u} ut av køen. Naboer som ikke er sett, legges bakerst.`, u);
    for (const v of adj[u]) {
      if (seen.has(v)) continue;
      seen.add(v);
      dist[v] = dist[u] + 1;
      parent[v] = u;
      q.push(v);
      snap(`${v} oppdages via ${u}. Avstand ${dist[v]}. Inn i køen.`, v);
    }
  }

  snap("Køen er tom. Lag i er nøyaktig nodene med avstand i fra start.", null);
  return frames;
}

export function dfs(nodes, edges, start) {
  const adj = adjOf(nodes, edges, true);
  const seen = new Set();
  const parent = {};
  const stack = [];
  const enter = [];
  const frames = [];

  function snap(note, current, kind) {
    frames.push({
      note,
      current,
      kind,
      parent: { ...parent },
      stack: stack.slice(),
      seen: [...seen],
      enter: enter.slice(),
    });
  }

  function walk(u) {
    seen.add(u);
    stack.push(u);
    enter.push(u);
    snap(`Går inn i ${u}. Stakken er ${stack.join(" → ")}.`, u, "inn");
    for (const v of adj[u]) {
      if (!seen.has(v)) {
        parent[v] = u;
        walk(v);
      }
    }
    stack.pop();
    snap(
      stack.length
        ? `Ferdig med ${u}. Tilbake til ${stack[stack.length - 1]}.`
        : `Ferdig med ${u}. Stakken er tom.`,
      u,
      "ut"
    );
  }

  walk(start);
  return frames;
}

export function components(nodes, edges) {
  const adj = adjOf(nodes, edges, true);
  const color = {};
  const frames = [];
  let c = 0;
  const names = "abcdef";

  function snap(note, current) {
    frames.push({ note, current, color: { ...color } });
  }

  function walk(u, id) {
    color[u] = id;
    snap(`${u} legges i komponent ${id}.`, u);
    for (const v of adj[u]) {
      if (color[v] == null) walk(v, id);
    }
  }

  for (const n of nodes) {
    if (color[n] != null) continue;
    c += 1;
    const id = names[c - 1] || String(c);
    snap(`Ny komponent fra ${n}, ingen kant hit fra de forrige.`, n);
    walk(n, id);
  }
  snap(`${c} komponenter. DFS fra hver node som ikke er sett.`, null);
  return frames;
}

export function bipartite(nodes, edges) {
  const adj = adjOf(nodes, edges, true);
  const color = {};
  const frames = [];
  let conflict = null;

  function snap(note, current) {
    frames.push({
      note,
      current,
      color: { ...color },
      conflict,
    });
  }

  function walk(u, c) {
    color[u] = c;
    snap(`${u} får farge ${c === 0 ? "blå" : "rød"}.`, u);
    for (const v of adj[u]) {
      if (color[v] == null) {
        if (walk(v, 1 - c) === false) return false;
      } else if (color[v] === c) {
        conflict = [u, v];
        snap(`${u} og ${v} er naboer og har samme farge. Det er en odde sykel.`, u);
        return false;
      }
    }
    return true;
  }

  for (const n of nodes) {
    if (color[n] != null) continue;
    if (walk(n, 0) === false) return frames;
  }
  snap("Fargeleggingen holdt hele veien. Grafen er bipartitt.", null);
  return frames;
}

export function topo(nodes, edges) {
  const adj = adjOf(nodes, edges, false);
  const indeg = {};
  for (const n of nodes) indeg[n] = 0;
  for (const e of edges) indeg[e.v] += 1;

  const q = [];
  for (const n of nodes) if (indeg[n] === 0) q.push(n);
  const order = [];
  const frames = [];

  const snap = (note, current) =>
    frames.push({
      note,
      current,
      indeg: { ...indeg },
      queue: q.slice(),
      order: order.slice(),
    });

  snap(
    q.length
      ? `Kilder, inn-grad 0: ${q.join(", ")}. De kan stå først.`
      : "Ingen kilde. Da er det en sykel, og ingen topologisk rekkefølge.",
    null
  );

  let step = 0;
  while (q.length && step++ < nodes.length + 1) {
    const u = q.shift();
    order.push(u);
    snap(`Ta ${u} ut av køen og sett den på plass ${order.length}.`, u);
    for (const v of adj[u]) {
      indeg[v] -= 1;
      if (indeg[v] === 0) {
        q.push(v);
        snap(`Kanten ut av ${u} senker inn-graden til ${v} til 0. ${v} er ny kilde.`, v);
      }
    }
  }

  if (order.length < nodes.length) {
    snap("Køen tok slutt før alle nodene var med. Grafen har en rettet sykel.", null);
  } else {
    snap(`Rekkefølge: ${order.join(" → ")}. Hver kant peker fremover.`, null);
  }
  return frames;
}

export function binarySearch(arr, target) {
  const frames = [];
  let lo = 0;
  let hi = arr.length - 1;
  frames.push({
    lo,
    hi,
    mid: null,
    found: null,
    note: `Let etter ${target}. Intervallet er hele arrayen, fra ${lo} til ${hi}.`,
  });
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const value = arr[mid];
    if (value === target) {
      frames.push({
        lo,
        hi,
        mid,
        found: mid,
        note: `a[${mid}] = ${value}. Det er ${target}.`,
      });
      return frames;
    }
    if (value < target) {
      frames.push({
        lo,
        hi,
        mid,
        found: null,
        note: `a[${mid}] = ${value}, som er mindre enn ${target}. Alt til og med ${mid} kan droppes.`,
      });
      lo = mid + 1;
    } else {
      frames.push({
        lo,
        hi,
        mid,
        found: null,
        note: `a[${mid}] = ${value}, som er større enn ${target}. Alt fra ${mid} og opp kan droppes.`,
      });
      hi = mid - 1;
    }
  }
  frames.push({
    lo,
    hi,
    mid: null,
    found: null,
    note: `Intervallet er tomt. ${target} ligger ikke i arrayen.`,
  });
  return frames;
}

export function twoSum(arr, target) {
  const frames = [];
  let i = 0;
  let j = arr.length - 1;
  frames.push({
    i,
    j,
    found: null,
    note: `Sortert array, sum skal bli ${target}. Start ytterst: ${arr[i]} + ${arr[j]}.`,
  });
  while (i < j) {
    const s = arr[i] + arr[j];
    if (s === target) {
      frames.push({
        i,
        j,
        found: [i, j],
        note: `${arr[i]} + ${arr[j]} = ${target}.`,
      });
      return frames;
    }
    if (s < target) {
      frames.push({
        i,
        j,
        found: null,
        note: `${arr[i]} + ${arr[j]} = ${s}, for lite. Øk venstre peker.`,
      });
      i += 1;
    } else {
      frames.push({
        i,
        j,
        found: null,
        note: `${arr[i]} + ${arr[j]} = ${s}, for stort. Senk høyre peker.`,
      });
      j -= 1;
    }
  }
  frames.push({ i, j, found: null, note: `Pekerne møttes. Ingen par summerer til ${target}.` });
  return frames;
}

export function flood(rows, sr, sc) {
  const g = rows.map((row) => row.split(""));
  const h = g.length;
  const w = g[0].length;
  const frames = [];
  if (g[sr][sc] !== "#") {
    return [{ grid: g.map((r) => r.join("")), note: "Startpikselen er ikke fylt.", current: null, queue: [] }];
  }
  const q = [[sr, sc]];
  g[sr][sc] = "o";
  const snap = (note, current) =>
    frames.push({
      note,
      current,
      queue: q.map(([r, c]) => `${r},${c}`),
      grid: g.map((r) => r.join("")),
    });
  snap(`Bøtta starter i (${sr}, ${sc}). Kø, ikke rekursjon ned i ett hjørne først.`, [sr, sc]);
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  while (q.length) {
    const [r, c] = q.shift();
    snap(`Fyller (${r}, ${c}) og ser på de fire naboene.`, [r, c]);
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= h || nc >= w) continue;
      if (g[nr][nc] !== "#") continue;
      g[nr][nc] = "o";
      q.push([nr, nc]);
    }
  }
  snap("Køen er tom. Alt som hang sammen med startpikselen er fylt.", null);
  return frames;
}
