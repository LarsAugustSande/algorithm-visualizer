import { useMemo, useRef, useState } from "react";
import { bellman, dijkstra, heapFrames, kruskal, makeUF, prim } from "../algs/spans.js";
import { Choice, Graph, Page, Player, finite } from "../ui.jsx";

const DIJ = {
  width: 640,
  height: 300,
  directed: true,
  nodes: [
    { id: "s", x: 60, y: 150 },
    { id: "a", x: 210, y: 55 },
    { id: "b", x: 210, y: 245 },
    { id: "c", x: 400, y: 150 },
    { id: "t", x: 570, y: 150 },
  ],
  edges: [
    { u: "s", v: "a", w: 2 },
    { u: "s", v: "b", w: 5 },
    { u: "a", v: "b", w: 1 },
    { u: "a", v: "c", w: 4 },
    { u: "b", v: "c", w: 1 },
    { u: "c", v: "t", w: 3 },
    { u: "b", v: "t", w: 8 },
  ],
};

export function Dijkstra() {
  const frames = useMemo(() => dijkstra(DIJ.nodes.map((n) => n.id), DIJ.edges, "s"), []);
  return (
    <Page
      kicker="Forelesning 8"
      title="Dijkstra"
      thm="Korteste vei fra én node, ikke-negative vekter, O((n + m) log n) med binærhaug."
      lede="Figuren leter etter minste d[v] ved å se gjennom alle. Det er O(n²). Haugen under gjør det samme valget raskere, uten å endre hvilke kanter som slakkes."
    >
      <Player
        frames={frames}
        resetKey="dij"
        render={(frame) => <DistGraph layout={DIJ} frame={frame} doneKey="settled" />}
      />
      <p className="see">Haugen som gir log n: <a href="#haug">binærhaug</a>.</p>
    </Page>
  );
}

function DistGraph({ layout, frame, doneKey }) {
  const done = new Set(frame[doneKey] || []);
  const nodes = layout.nodes.map((n) => {
    let fill = "#fffdf8";
    let ink = "#1c1916";
    if (done.has(n.id)) {
      fill = "#1d4e89";
      ink = "#fffdf8";
    }
    if (n.id === frame.current) {
      fill = "#f3d36b";
      ink = "#1c1916";
    }
    const raw = frame.dist ? frame.dist[n.id] : frame.key?.[n.id];
    const shown = finite(raw);
    return {
      ...n,
      fill,
      ink,
      label: shown || n.id,
      tag: shown ? n.id : "",
    };
  });
  const edges = layout.edges.map((e) => {
    const hot = frame.edge && ((frame.edge.u === e.u && frame.edge.v === e.v) || (frame.edge.u === e.v && frame.edge.v === e.u));
    const tree = frame.prev && (frame.prev[e.v] === e.u || frame.prev[e.u] === e.v);
    return {
      ...e,
      label: String(e.w),
      color: hot ? "#9d2c24" : tree ? "#1d4e89" : "#1c1916",
      width: hot || tree ? 2.5 : 1.4,
      plain: !layout.directed && !e.directed,
    };
  });
  return <Graph width={layout.width} height={layout.height} nodes={nodes} edges={edges} />;
}

export function Heap() {
  const frames = useMemo(() => heapFrames([5, 3, 8, 1, 6, 2]), []);
  return (
    <Page
      kicker="Forelesning 8"
      title="Binærhaug"
      thm="Sett inn og ta ut minste i O(log n). Forelder på ⌊i/2⌋, barn på 2i og 2i+1."
      lede="Min-haug: forelderen er alltid mindre eller lik barna. Det er denne som ligger under Dijkstra og Prim når vi ikke vil scanne alle nøkler."
    >
      <Player frames={frames} resetKey="heap" render={(frame) => <HeapFig frame={frame} />} />
    </Page>
  );
}

function HeapFig({ frame }) {
  const a = frame.heap;
  const n = a.length;
  const nodes = a.map((v, idx) => {
    const i = idx + 1;
    const level = Math.floor(Math.log2(i));
    const index = i - 2 ** level;
    const count = 2 ** level;
    const x = ((index + 0.5) / count) * 520 + 40;
    const y = 40 + level * 78;
    const hot = frame.hi.includes(i);
    return {
      id: String(i),
      x,
      y,
      label: String(v),
      tag: String(i),
      fill: hot ? "#f3d36b" : "#fffdf8",
    };
  });
  const edges = [];
  for (let i = 2; i <= n; i++) {
    edges.push({ u: String(i >> 1), v: String(i), plain: true });
  }
  const height = 40 + Math.floor(Math.log2(Math.max(n, 1))) * 78 + 50;
  return (
    <>
      <Graph width={600} height={Math.max(120, height)} nodes={nodes} edges={edges} />
      <div className="cells">
        {a.map((v, idx) => (
          <div key={idx} className={frame.hi.includes(idx + 1) ? "cell on" : "cell"}>{v}</div>
        ))}
      </div>
      <p className="small">arrayen er 1-indeksert i treet. Tallet over sirkelen er plassen.</p>
    </>
  );
}

const MST = {
  width: 640,
  height: 360,
  nodes: [
    { id: "a", x: 80, y: 70 },
    { id: "b", x: 250, y: 40 },
    { id: "c", x: 170, y: 180 },
    { id: "d", x: 370, y: 160 },
    { id: "e", x: 280, y: 300 },
    { id: "f", x: 500, y: 280 },
  ],
  edges: [
    { u: "a", v: "b", w: 7 },
    { u: "a", v: "c", w: 2 },
    { u: "b", v: "c", w: 5 },
    { u: "b", v: "d", w: 6 },
    { u: "c", v: "d", w: 3 },
    { u: "c", v: "e", w: 8 },
    { u: "d", v: "e", w: 4 },
    { u: "d", v: "f", w: 9 },
    { u: "e", v: "f", w: 1 },
  ],
};

export function Prim() {
  const frames = useMemo(() => prim(MST.nodes.map((n) => n.id), MST.edges, "a"), []);
  return (
    <Page
      kicker="Forelesning 9"
      title="Prim"
      thm="Minimalt spenntre i O((n + m) log n)."
      lede="Samme idé som Dijkstra, men nøkkelen er billigste kant inn til treet, ikke avstand fra start. Vektene her er unike, så treet er entydig og likt Kruskal sitt."
    >
      <Player
        frames={frames}
        resetKey="prim"
        render={(frame) => <DistGraph layout={MST} frame={{ ...frame, settled: frame.tree, dist: frame.key }} doneKey="settled" />}
      />
    </Page>
  );
}

export function Kruskal() {
  const frames = useMemo(() => kruskal(MST.nodes.map((n) => n.id), MST.edges), []);
  return (
    <Page
      kicker="Forelesning 9"
      title="Kruskal"
      thm="Sorter kantene. Ta med en kant hvis endepunktene ligger i ulike komponenter."
      lede="Union-Find holder styr på komponentene. Uten den ville «samme komponent?» kostet for mye. Optimaliseringene av den ligger på neste side."
    >
      <Player
        frames={frames}
        resetKey="kruskal"
        render={(frame) => {
          const taken = new Set(frame.taken.map((e) => [e.u, e.v].sort().join()));
          const skipped = new Set(frame.skipped);
          const nodes = MST.nodes.map((n) => ({ ...n, sub: frame.parent[n.id] === n.id ? "" : frame.parent[n.id] }));
          const edges = MST.edges.map((e) => {
            const id = [e.u, e.v].sort().join();
            const name = `${e.u}–${e.v}`;
            const isTaken = taken.has(id);
            const isSkip = skipped.has(name);
            const hot = frame.current === name;
            return {
              ...e,
              label: String(e.w),
              plain: true,
              color: isSkip ? "#c4b8a8" : isTaken ? "#1d4e89" : "#1c1916",
              width: hot ? 3 : isTaken ? 2.4 : 1.2,
              dashed: isSkip,
            };
          });
          return (
            <>
              <Graph width={MST.width} height={MST.height} nodes={nodes} edges={edges} />
              <p className="mono">vekt {frame.weight}</p>
            </>
          );
        }}
      />
      <p className="see">Strukturen under: <a href="#union">Union-Find</a>.</p>
    </Page>
  );
}

const UF_IDS = ["a", "b", "c", "d", "e", "f", "g", "h"];

export function Union() {
  const [variant, setVariant] = useState("size");
  const ref = useRef(null);
  if (!ref.current) ref.current = makeUF(UF_IDS);
  const [snap, setSnap] = useState(() => ref.current.snap());
  const [log, setLog] = useState("Klikk to noder.");
  const [pick, setPick] = useState(null);

  function reset(next = variant) {
    ref.current = makeUF(UF_IDS);
    setSnap(ref.current.snap());
    setPick(null);
    setLog("Klikk to noder.");
    setVariant(next);
  }

  function click(id) {
    if (!pick) {
      setPick(id);
      setLog(`${id} er valgt. Klikk den andre.`);
      return;
    }
    if (pick === id) {
      setPick(null);
      return;
    }
    const res = ref.current.union(pick, id, variant);
    setSnap(res.after);
    setLog(res.note);
    setPick(null);
  }

  const fig = forest(snap.parent, pick);
  return (
    <Page
      kicker="Forelesning 9"
      title="Union-Find"
      thm="Med størrelse og sti-kompresjon, amortisert nesten O(1) per operasjon."
      lede="Naiv lenking kan lage en lang sti. Heng alltid det minste treet under det største, og la find peke nodene rett på roten."
    >
      <Choice
        value={variant}
        onChange={reset}
        options={[
          { id: "naive", label: "naiv" },
          { id: "size", label: "etter størrelse" },
          { id: "compress", label: "sti-kompresjon" },
        ]}
      />
      <Graph width={fig.width} height={fig.height} nodes={fig.nodes} edges={fig.edges} onNode={click} />
      <p className="note">{log}</p>
      <div className="scroll">
        <table className="dp">
          <tbody>
            <tr>{UF_IDS.map((id) => <th key={id}>{id}</th>)}</tr>
            <tr>{UF_IDS.map((id) => <td key={id}>{snap.parent[id]}</td>)}</tr>
            <tr>{UF_IDS.map((id) => <td key={id}>{snap.size[id]}</td>)}</tr>
          </tbody>
        </table>
      </div>
      <p className="small">Andre rad er forelder, tredje er størrelse på roten. Størrelsen på de andre er bare et etterslep.</p>
      <div className="controls">
        <button type="button" onClick={() => reset(variant)}>nullstill</button>
      </div>
    </Page>
  );
}

function forest(parent, pick) {
  const ids = Object.keys(parent);
  const kids = {};
  ids.forEach((id) => { kids[id] = []; });
  const roots = [];
  for (const id of ids) {
    if (parent[id] === id) roots.push(id);
    else kids[parent[id]].push(id);
  }
  const pos = {};
  function place(id, depth, left) {
    const ch = kids[id];
    if (!ch.length) {
      pos[id] = { x: left, y: depth };
      return left + 1;
    }
    let x = left;
    for (const c of ch) x = place(c, depth + 1, x);
    pos[id] = { x: (pos[ch[0]].x + pos[ch[ch.length - 1]].x) / 2, y: depth };
    return x;
  }
  let left = 0;
  for (const r of roots) left = place(r, 0, left);
  const nodes = ids.map((id) => ({
    id,
    x: 40 + pos[id].x * 62,
    y: 36 + pos[id].y * 76,
    label: id,
    fill: id === pick ? "#f3d36b" : parent[id] === id ? "#d5e3f5" : "#fffdf8",
  }));
  const edges = ids.filter((id) => parent[id] !== id).map((id) => ({ u: parent[id], v: id }));
  const depth = Math.max(...ids.map((id) => pos[id].y));
  return { nodes, edges, width: Math.max(360, 70 + left * 62), height: 70 + depth * 76 };
}

const NEG = {
  width: 560,
  height: 260,
  directed: true,
  nodes: [
    { id: "s", x: 60, y: 130 },
    { id: "a", x: 230, y: 50 },
    { id: "b", x: 230, y: 210 },
    { id: "c", x: 450, y: 130 },
  ],
  edges: [
    { u: "s", v: "a", w: 4 },
    { u: "s", v: "b", w: 5 },
    { u: "a", v: "c", w: 3 },
    { u: "b", v: "a", w: -2 },
    { u: "b", v: "c", w: 4 },
  ],
};

export function Bellman() {
  const [cycle, setCycle] = useState(false);
  const edges = cycle ? NEG.edges.concat([{ u: "c", v: "b", w: -5 }]) : NEG.edges;
  const layout = { ...NEG, edges };
  const frames = useMemo(() => bellman(NEG.nodes.map((n) => n.id), edges, "s"), [cycle, edges]);
  const wrong = useMemo(() => dijkstra(NEG.nodes.map((n) => n.id), NEG.edges, "s").at(-1).dist, []);
  return (
    <Page
      kicker="Forelesning 15–16"
      title="Bellman–Ford"
      thm="Korteste vei med negative kanter, uten negativ sykel, i O(nm). O(n) ekstra minne hvis du oppdaterer på stedet."
      lede="Dijkstra låser en node for tidlig. På denne grafen setter den d(a) = 4. Kanten b→a med vekt −2 kommer for sent. Riktig d(a) er 3, og d(c) blir 6."
    >
      <Choice
        value={cycle ? "sykel" : "kant"}
        onChange={(v) => setCycle(v === "sykel")}
        options={[
          { id: "kant", label: "negativ kant" },
          { id: "sykel", label: "negativ sykel" },
        ]}
      />
      {!cycle ? <p className="small">Dijkstra ville stoppet på d(a) = {wrong.a}, d(c) = {wrong.c}.</p> : null}
      <Player
        frames={frames}
        resetKey={cycle ? "sykel" : "kant"}
        render={(frame) => (
          <DistGraph
            layout={layout}
            frame={{ ...frame, settled: [], current: frame.edge?.v || null }}
            doneKey="settled"
          />
        )}
      />
      <p className="small">Valutakurs som gir gevinst rundt er en negativ sykel i −log(kurs). Da finnes ingen korteste vei.</p>
    </Page>
  );
}
