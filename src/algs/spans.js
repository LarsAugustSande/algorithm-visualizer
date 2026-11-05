import { num } from "../format.js";

function weightAdj(nodes, edges, undirected) {
  const adj = {};
  for (const n of nodes) adj[n] = [];
  for (const e of edges) {
    adj[e.u].push({ v: e.v, w: e.w });
    if (undirected) adj[e.v].push({ v: e.u, w: e.w });
  }
  return adj;
}

export function dijkstra(nodes, edges, source) {
  const adj = weightAdj(nodes, edges, false);
  const dist = {};
  const prev = {};
  for (const n of nodes) dist[n] = Infinity;
  dist[source] = 0;
  const settled = new Set();
  const frames = [];
  const snap = (note, current, edge) =>
    frames.push({
      note,
      current,
      edge,
      dist: { ...dist },
      prev: { ...prev },
      settled: [...settled],
    });

  snap(`${source} starter på 0. Ingen noder er ferdige.`, source, null);

  while (settled.size < nodes.length) {
    let u = null;
    let best = Infinity;
    for (const n of nodes) {
      if (!settled.has(n) && dist[n] < best) {
        best = dist[n];
        u = n;
      }
    }
    if (u == null || best === Infinity) break;
    settled.add(u);
    snap(`Velg ${u}. Den uferdige med minst d, så d(${u}) = ${num(best)} er endelig.`, u, null);
    for (const { v, w } of adj[u]) {
      if (settled.has(v)) continue;
      const nd = dist[u] + w;
      if (nd < dist[v]) {
        dist[v] = nd;
        prev[v] = u;
        snap(`Kanten ${u}→${v} (vekt ${w}) gir d(${v}) = ${num(nd)}.`, u, { u, v });
      } else if (dist[v] !== Infinity) {
        snap(`Kanten ${u}→${v} forbedrer ikke d(${v}) = ${num(dist[v])}.`, u, { u, v, weak: true });
      }
    }
  }
  snap("Ferdig. Med ikke-negative vekter er en node riktig idet den velges.", null, null);
  return frames;
}

export function prim(nodes, edges, source) {
  const adj = weightAdj(nodes, edges, true);
  const key = {};
  const prev = {};
  for (const n of nodes) key[n] = Infinity;
  key[source] = 0;
  const inTree = new Set();
  const frames = [];
  const snap = (note, current, edge) =>
    frames.push({
      note,
      current,
      edge,
      key: { ...key },
      prev: { ...prev },
      tree: [...inTree],
    });

  snap(`Treet starter i ${source}. Nøkkelen er billigste kant inn til treet.`, source, null);

  while (inTree.size < nodes.length) {
    let u = null;
    let best = Infinity;
    for (const n of nodes) {
      if (!inTree.has(n) && key[n] < best) {
        best = key[n];
        u = n;
      }
    }
    if (u == null || best === Infinity) break;
    inTree.add(u);
    const via = prev[u] ? `${prev[u]}–${u}` : null;
    snap(
      via
        ? `Ta med ${u} langs ${via}, vekt ${num(best)}.`
        : `Startnoden ${u} er med.`,
      u,
      via ? { u: prev[u], v: u } : null
    );
    for (const { v, w } of adj[u]) {
      if (inTree.has(v)) continue;
      if (w < key[v]) {
        key[v] = w;
        prev[v] = u;
        snap(`Billigste kant inn til ${v} er nå ${u}–${v} med vekt ${w}.`, u, { u, v });
      }
    }
  }
  const weight = [...inTree].reduce((s, n) => s + (n === source ? 0 : key[n]), 0);
  snap(`Spenntreet veier ${num(weight)}.`, null, null);
  frames[frames.length - 1].weight = weight;
  return frames;
}

export function kruskal(nodes, edges) {
  const parent = {};
  for (const n of nodes) parent[n] = n;
  const find = (x) => {
    while (parent[x] !== x) x = parent[x];
    return x;
  };
  const sorted = edges
    .slice()
    .map((e, i) => ({ ...e, i }))
    .sort((a, b) => a.w - b.w || a.i - b.i);
  const taken = [];
  const skipped = [];
  const frames = [];
  let weight = 0;

  const snap = (note, current) =>
    frames.push({
      note,
      current,
      taken: taken.map((e) => ({ u: e.u, v: e.v, w: e.w })),
      skipped: skipped.slice(),
      weight,
      parent: { ...parent },
      sorted: sorted.map((e) => `${e.u}–${e.v}:${e.w}`),
    });

  snap(`Kantene sortert: ${sorted.map((e) => `${e.u}–${e.v} (${e.w})`).join(", ")}.`, null);

  for (const e of sorted) {
    const a = find(e.u);
    const b = find(e.v);
    if (a === b) {
      skipped.push(`${e.u}–${e.v}`);
      snap(`${e.u} og ${e.v} har samme rot ${a}. Kanten ${e.u}–${e.v} lager en sykel.`, `${e.u}–${e.v}`);
    } else {
      parent[b] = a;
      taken.push(e);
      weight += e.w;
      snap(`Ta ${e.u}–${e.v} med vekt ${e.w}. Union av ${a} og ${b}. Vekt så langt ${weight}.`, `${e.u}–${e.v}`);
    }
  }
  snap(`Ferdig. ${taken.length} kanter, vekt ${weight}.`, null);
  frames[frames.length - 1].weight = weight;
  return frames;
}

export function makeUF(ids) {
  const parent = {};
  const size = {};
  for (const id of ids) {
    parent[id] = id;
    size[id] = 1;
  }
  const snap = () => ({
    parent: { ...parent },
    size: { ...size },
  });

  function find(x, compress) {
    if (parent[x] === x) return x;
    const r = find(parent[x], compress);
    if (compress) parent[x] = r;
    return r;
  }

  function union(a, b, variant) {
    const before = snap();
    const compress = variant === "compress";
    let ra = find(a, compress);
    let rb = find(b, compress);
    let note;
    if (ra === rb) {
      note = `${a} og ${b} har samme rot ${ra}. Ingenting å slå sammen.`;
    } else if (variant === "naive") {
      parent[rb] = ra;
      size[ra] += size[rb];
      note = `Naivt: heng roten ${rb} under ${ra}, uansett størrelse.`;
    } else {
      if (size[ra] < size[rb]) [ra, rb] = [rb, ra];
      parent[rb] = ra;
      size[ra] += size[rb];
      note = `Heng det minste treet, rot ${rb}, under ${ra}.`;
    }
    const after = snap();
    const flattened = Object.keys(parent).filter((id) => before.parent[id] !== after.parent[id] && id !== rb);
    if (compress && flattened.length) {
      note += ` Sti-kompresjon pekte ${flattened.join(", ")} rett på roten.`;
    }
    return { note, before, after, a, b };
  }

  return { union, snap };
}

export function heapFrames(values) {
  const a = [null];
  const frames = [];
  const snap = (note, hi) =>
    frames.push({ note, heap: a.slice(1), hi: hi || [] });

  function up(i) {
    while (i > 1) {
      const p = i >> 1;
      if (a[i] < a[p]) {
        const child = a[i];
        const par = a[p];
        [a[i], a[p]] = [a[p], a[i]];
        snap(`${child} er mindre enn ${par}. Byttet plass ${i} med ${p}.`, [i, p]);
        i = p;
      } else break;
    }
  }
  function down(i) {
    const n = a.length - 1;
    while (2 * i <= n) {
      let c = 2 * i;
      if (c + 1 <= n && a[c + 1] < a[c]) c += 1;
      if (a[c] < a[i]) {
        const child = a[c];
        const par = a[i];
        const from = i;
        [a[i], a[c]] = [a[c], a[i]];
        snap(`${child} er mindre enn ${par}. Byttet plass ${c} med ${from}.`, [from, c]);
        i = c;
      } else break;
    }
  }

  snap("Tom haug. Minste element skal ligge på plass 1.", []);
  for (const v of values) {
    a.push(v);
    snap(`Sett ${v} bakerst, på plass ${a.length - 1}.`, [a.length - 1]);
    up(a.length - 1);
    snap(`${v} har boblet ferdig.`, []);
  }
  const pulled = [];
  while (a.length > 1) {
    const min = a[1];
    pulled.push(min);
    if (a.length === 2) {
      a.pop();
      snap(`Ta ut ${min}. Haugen er tom.`, []);
    } else {
      const last = a.pop();
      a[1] = last;
      snap(`Ta ut ${min}. ${last}, som lå bakerst, settes i roten.`, [1]);
      down(1);
    }
  }
  snap(`Uttakene kom i rekkefølge ${pulled.join(", ")}.`, []);
  frames[frames.length - 1].pulled = pulled;
  return frames;
}

export function bellman(nodes, edges, source) {
  const dist = {};
  const prev = {};
  for (const n of nodes) dist[n] = Infinity;
  dist[source] = 0;
  const frames = [];
  const snap = (note, edge, round) =>
    frames.push({
      note,
      edge,
      round,
      dist: { ...dist },
      prev: { ...prev },
      negative: false,
    });

  snap("d(s) = 0. Vi slapper av alle kanter, n−1 runder.", null, 0);
  const n = nodes.length;
  for (let round = 1; round <= n - 1; round++) {
    let changed = false;
    for (const e of edges) {
      if (dist[e.u] === Infinity) continue;
      const nd = dist[e.u] + e.w;
      if (nd < dist[e.v]) {
        dist[e.v] = nd;
        prev[e.v] = e.u;
        changed = true;
        snap(
          `Runde ${round}: ${e.u}→${e.v} med vekt ${e.w} setter d(${e.v}) = ${num(nd)}.`,
          e,
          round
        );
      }
    }
    if (!changed) {
      snap(`Runde ${round} endret ingenting. Kan stoppe.`, null, round);
      break;
    }
  }
  let negative = false;
  let bad = null;
  for (const e of edges) {
    if (dist[e.u] === Infinity) continue;
    if (dist[e.u] + e.w < dist[e.v]) {
      negative = true;
      bad = e;
      break;
    }
  }
  frames.push({
    note: negative
      ? `Ekstra runde fikk fortsatt ned d(${bad.v}) via ${bad.u}→${bad.v}. Da finnes en negativ sykel som kan nås fra ${source}.`
      : "Ekstra runde endret ingenting. Ingen negativ sykel på vei fra start.",
    edge: bad,
    round: n,
    dist: { ...dist },
    prev: { ...prev },
    negative,
  });
  return frames;
}
