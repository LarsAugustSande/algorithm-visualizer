import { useMemo, useState } from "react";
import { assignment, bipartiteMatching, maxFlow } from "../algs/flow.js";
import { Choice, Graph, Page, Player } from "../ui.jsx";

const FLOW_A = {
  id: "angre",
  width: 560,
  height: 280,
  s: "s",
  t: "t",
  nodes: [
    { id: "s", x: 70, y: 140 },
    { id: "a", x: 250, y: 50 },
    { id: "b", x: 250, y: 230 },
    { id: "t", x: 460, y: 140 },
  ],
  edges: [
    { u: "s", v: "a", c: 4 },
    { u: "s", v: "b", c: 2 },
    { u: "a", v: "b", c: 3 },
    { u: "a", v: "t", c: 2 },
    { u: "b", v: "t", c: 4 },
  ],
};

const FLOW_B = {
  id: "enhet",
  width: 560,
  height: 280,
  s: "s",
  t: "t",
  nodes: [
    { id: "s", x: 70, y: 140 },
    { id: "a", x: 230, y: 50 },
    { id: "b", x: 230, y: 230 },
    { id: "t", x: 430, y: 140 },
  ],
  edges: [
    { u: "s", v: "a", c: 1 },
    { u: "s", v: "b", c: 1 },
    { u: "a", v: "b", c: 1 },
    { u: "a", v: "t", c: 1 },
    { u: "b", v: "t", c: 1 },
  ],
};

export function Flow() {
  const [net, setNet] = useState("angre");
  const [mode, setMode] = useState("dfs");
  const spec = net === "angre" ? FLOW_A : FLOW_B;
  const frames = useMemo(() => maxFlow(spec.edges, spec.s, spec.t, mode), [net, mode, spec]);
  return (
    <Page
      kicker="Forelesning 16–20"
      title="Ford–Fulkerson"
      thm="Maks flyt = min kutt. Med DFS er tiden O(mF). Edmonds–Karp, korteste sti, er O(nm²)."
      lede="Første nettverket tvinger algoritmen til å angre. DFS går s→a→b→t og metter a→b. Senere må noe av den flyten sendes tilbake, ellers når du ikke 6. BFS velger en kortere sti først. Enhetskapasitet er kant-disjunkte stier, og Menger sier at antallet er likt minste kutt."
    >
      <Choice
        value={net}
        onChange={setNet}
        options={[
          { id: "angre", label: "må angre" },
          { id: "enhet", label: "enhetskapasitet" },
        ]}
      />
      <Choice
        value={mode}
        onChange={setMode}
        options={[
          { id: "dfs", label: "DFS, Ford–Fulkerson" },
          { id: "bfs", label: "korteste sti, Edmonds–Karp" },
        ]}
      />
      <pre className="code">{`f(e) ← 0
mens det finnes en s–t-sti i residualnettet:
    send så mye som flaskehalsen tillater
når det ikke gjør det: nodene du fortsatt når fra s, er s-siden av et min-kutt`}</pre>
      <Player
        frames={frames}
        resetKey={`${net}-${mode}`}
        render={(frame) => <FlowGraph spec={spec} frame={frame} />}
      />
    </Page>
  );
}

function FlowGraph({ spec, frame }) {
  const cut = new Set(frame.cut || []);
  const path = frame.pathEdges || [];
  const nodes = spec.nodes.map((n) => {
    let fill = "#fffdf8";
    let ink = "#1c1916";
    if (cut.size && cut.has(n.id)) {
      fill = "#d5e3f5";
    }
    if (frame.path && frame.path.includes(n.id)) {
      fill = "#f3d36b";
    }
    return { ...n, fill, ink };
  });
  const edges = [];
  for (const e of spec.edges) {
    const k = `${e.u}>${e.v}`;
    const flow = frame.flow[k] || 0;
    const onPath = path.some((p) => p.u === e.u && p.v === e.v && !p.reverse);
    edges.push({
      u: e.u,
      v: e.v,
      label: `${flow}/${e.c}`,
      color: onPath ? "#9d2c24" : flow > 0 ? "#1d4e89" : "#1c1916",
      width: onPath ? 2.8 : 1.5,
    });
    const back = frame.res[`${e.v}>${e.u}`] || 0;
    if (back > 0) {
      const undo = path.some((p) => p.u === e.v && p.v === e.u && p.reverse);
      edges.push({
        u: e.v,
        v: e.u,
        label: undo ? `angre ${back}` : String(back),
        dashed: true,
        color: undo ? "#9d2c24" : "#8a8175",
        width: undo ? 2.4 : 1.2,
      });
    }
  }
  return (
    <>
      <Graph width={spec.width} height={spec.height} nodes={nodes} edges={edges} />
      <p className="mono">flytverdi {frame.value}{frame.cutCap != null ? ` · kutt ${frame.cutCap}` : ""}</p>
    </>
  );
}

const LEFT = ["a", "b", "c", "d"];
const RIGHT = ["1", "2", "3", "4"];
const MATCH_EDGES = [
  { u: "a", v: "1" },
  { u: "a", v: "2" },
  { u: "b", v: "1" },
  { u: "c", v: "2" },
  { u: "c", v: "3" },
  { u: "d", v: "3" },
  { u: "d", v: "4" },
];

export function MatchFlow() {
  const frames = useMemo(() => bipartiteMatching(LEFT, RIGHT, MATCH_EDGES), []);
  const nodes = [
    ...LEFT.map((id, i) => ({ id, x: 90, y: 40 + i * 70 })),
    ...RIGHT.map((id, i) => ({ id, x: 420, y: 40 + i * 70 })),
  ];
  return (
    <Page
      kicker="Forelesning 18–19"
      title="Bipartitt matching"
      thm="Maks matching = minste vertex cover. O(nm) via flyt."
      lede="Samme algoritme som Ford–Fulkerson: kapasitet 1 fra s til venstre, 1 fra høyre til t, og uendelig mellom. Her tegnes bare L og R. En utvidende sti bytter ledige og brukte kanter. Til slutt er coveret like stort som matchingen. Det er Kőnig, og det sprekker så fort grafen ikke er todelt."
    >
      <Player
        frames={frames}
        resetKey="match"
        render={(frame) => {
          const paired = new Set(frame.pairs.map(([u, v]) => `${u}>${v}`));
          const hopping = new Set((frame.path || []).map(([u, v]) => `${u}>${v}`));
          const cover = new Set(frame.cover || []);
          const drawnNodes = nodes.map((n) => ({
            ...n,
            fill: cover.has(n.id) ? "#1d4e89" : "#fffdf8",
            ink: cover.has(n.id) ? "#fffdf8" : "#1c1916",
          }));
          const edges = MATCH_EDGES.map((e) => {
            const k = `${e.u}>${e.v}`;
            const used = paired.has(k);
            const hot = hopping.has(k);
            return {
              ...e,
              plain: true,
              color: hot ? "#9d2c24" : used ? "#1d4e89" : "#c4b8a8",
              width: used || hot ? 2.6 : 1.2,
            };
          });
          return <Graph width={520} height={320} nodes={drawnNodes} edges={edges} />;
        }}
      />
    </Page>
  );
}

const COST = [
  [1, 2, 9],
  [2, 4, 1],
  [3, 8, 2],
];
const WORKERS = ["A", "B", "C"];
const JOBS = ["1", "2", "3"];

export function Assign() {
  const frames = useMemo(() => assignment(WORKERS, JOBS, COST), []);
  return (
    <Page
      kicker="Forelesning 20"
      title="Min-cost tilordning"
      thm="Billigste perfekte matching. Suksessive korteste stier, O(n) augmenteringer."
      lede="Billigste kant først gir A–1, B–3, C–2, sum 10. Optimum er 6. Den tredje stien angrer A–1 og legger A på jobb 2, fordi returkanten har negativ kostnad. Bellman–Ford tåler det. Dijkstra gjør det ikke, med mindre du holder potensialer."
    >
      <div className="scroll">
        <table className="dp">
          <thead>
            <tr>
              <th></th>
              {JOBS.map((j) => <th key={j}>{j}</th>)}
            </tr>
          </thead>
          <tbody>
            {WORKERS.map((w, i) => (
              <tr key={w}>
                <th>{w}</th>
                {COST[i].map((c, k) => <td key={k}>{c}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Player
        frames={frames}
        resetKey="assign"
        speed={900}
        render={(frame) => <AssignGraph frame={frame} />}
      />
    </Page>
  );
}

function AssignGraph({ frame }) {
  const nodes = [
    ...WORKERS.map((id, i) => ({ id, x: 80, y: 50 + i * 80 })),
    ...JOBS.map((id, i) => ({ id, x: 420, y: 50 + i * 80 })),
  ];
  const used = new Set(frame.pairs.map(([u, v]) => `${u}>${v}`));
  const hops = new Set((frame.hops || []).map((h) => `${h.u}>${h.v}`));
  const edges = [];
  WORKERS.forEach((w, i) => {
    JOBS.forEach((j, k) => {
      const key = `${w}>${j}`;
      const hot = hops.has(key);
      const on = used.has(key);
      const undo = (frame.hops || []).some((h) => h.u === w && h.v === j && h.undo);
      edges.push({
        u: w,
        v: j,
        label: on || hot ? String(COST[i][k]) : "",
        plain: true,
        color: hot ? "#9d2c24" : on ? "#1d4e89" : "#d9cbb6",
        width: on || hot ? 2.6 : 1,
        dashed: undo,
        dim: !on && !hot,
      });
    });
  });
  return (
    <>
      <Graph width={520} height={280} nodes={nodes} edges={edges} />
      <p className="mono">kostnad {frame.total}</p>
    </>
  );
}
