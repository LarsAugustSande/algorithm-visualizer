import { useMemo, useState } from "react";
import { bfs, dfs, components, bipartite, topo, flood } from "../algs/search.js";
import { Choice, Graph, Legend, Page, Player } from "../ui.jsx";

const NET = {
  width: 600,
  height: 340,
  nodes: [
    { id: "s", x: 70, y: 170 },
    { id: "a", x: 210, y: 70 },
    { id: "b", x: 210, y: 270 },
    { id: "c", x: 370, y: 40 },
    { id: "d", x: 370, y: 170 },
    { id: "e", x: 370, y: 290 },
    { id: "f", x: 530, y: 170 },
  ],
  edges: [
    { u: "s", v: "a" },
    { u: "s", v: "b" },
    { u: "a", v: "c" },
    { u: "a", v: "d" },
    { u: "b", v: "d" },
    { u: "b", v: "e" },
    { u: "c", v: "f" },
    { u: "d", v: "f" },
    { u: "e", v: "f" },
  ],
};

const ids = NET.nodes.map((n) => n.id);

function treeEdge(parent, e) {
  if (!parent) return false;
  return parent[e.v] === e.u || parent[e.u] === e.v;
}

const BLOB = [
  "..........",
  "..####....",
  ".######...",
  ".######...",
  "..####....",
  "......##..",
  ".....###..",
  ".....##...",
  "..........",
  "..........",
];

export function Bfs() {
  const [mode, setMode] = useState("graf");
  const graphFrames = useMemo(() => bfs(ids, NET.edges, "s"), []);
  const pixFrames = useMemo(() => flood(BLOB, 2, 2), []);
  const frames = mode === "graf" ? graphFrames : pixFrames;
  return (
    <Page
      kicker="Forelesning 5–6"
      title="Bredde-først"
      thm="s–t-sammenheng og korteste sti i uvektet graf, O(n + m)."
      lede="Kø, ikke stakk. Da blir lag i nøyaktig nodene i avstand i. Bøtteverktøyet i et tegneprogram er samme søk, på piksler som deler side."
    >
      <Choice
        value={mode}
        onChange={setMode}
        options={[
          { id: "graf", label: "graf" },
          { id: "pix", label: "bøtte" },
        ]}
      />
      <Player
        frames={frames}
        resetKey={mode}
        speed={mode === "pix" ? 220 : 680}
        render={(frame) => mode === "graf" ? <BfsGraph frame={frame} /> : <Pixels frame={frame} />}
      />
    </Page>
  );
}

function BfsGraph({ frame }) {
  const nodes = NET.nodes.map((n) => {
    let fill = "#fffdf8";
    let ink = "#1c1916";
    if (frame.order.includes(n.id) && n.id !== frame.current) {
      fill = "#1d4e89";
      ink = "#fffdf8";
    }
    if (frame.queue.includes(n.id)) {
      fill = "#f6e7d4";
      ink = "#1c1916";
    }
    if (n.id === frame.current) {
      fill = "#f3d36b";
      ink = "#1c1916";
    }
    const d = frame.dist[n.id];
    const shown = Number.isFinite(d) ? String(d) : "";
    return { ...n, fill, ink, label: shown || n.id, tag: shown ? n.id : "" };
  });
  const edges = NET.edges.map((e) => {
    const used = treeEdge(frame.parent, e);
    return { ...e, plain: true, color: used ? "#1d4e89" : "#8a8175", width: used ? 2.6 : 1.3 };
  });
  return (
    <>
      <Graph width={NET.width} height={NET.height} nodes={nodes} edges={edges} />
      <p className="mono">kø: {frame.queue.join("  ") || "tom"}</p>
      <Legend items={[
        { color: "#f3d36b", label: "den vi ser på" },
        { color: "#f6e7d4", label: "i køen" },
        { color: "#1d4e89", label: "ferdig" },
      ]} />
    </>
  );
}

function Pixels({ frame }) {
  const cols = frame.grid[0].length;
  return (
    <div className="pixgrid" style={{ gridTemplateColumns: `repeat(${cols}, 22px)` }}>
      {frame.grid.flatMap((row, r) => row.split("").map((ch, c) => {
        const cur = frame.current && frame.current[0] === r && frame.current[1] === c;
        const cls = ch === "o" ? "o" : ch === "#" ? "h" : "e";
        return <div key={`${r}-${c}`} className={`pix ${cls}${cur ? " cur" : ""}`} />;
      }))}
    </div>
  );
}

const COMP = {
  width: 600,
  height: 250,
  nodes: [
    { id: "a", x: 70, y: 80 },
    { id: "b", x: 180, y: 170 },
    { id: "c", x: 70, y: 170 },
    { id: "d", x: 360, y: 80 },
    { id: "e", x: 480, y: 80 },
    { id: "f", x: 420, y: 180 },
  ],
  edges: [
    { u: "a", v: "b" },
    { u: "b", v: "c" },
    { u: "a", v: "c" },
    { u: "d", v: "e" },
    { u: "e", v: "f" },
    { u: "d", v: "f" },
  ],
};
const compColor = { a: "#d5e3f5", b: "#f3d4cf", c: "#d7eadc" };

export function Dfs() {
  const [mode, setMode] = useState("dfs");
  const frames = useMemo(
    () => (mode === "dfs" ? dfs(ids, NET.edges, "s") : components(COMP.nodes.map((n) => n.id), COMP.edges)),
    [mode]
  );
  return (
    <Page
      kicker="Forelesning 6"
      title="Dybde-først"
      thm="Sammenhengende komponenter i O(n + m), samme tid som BFS."
      lede="Gå så langt du kommer, og rygg tilbake når en node er tom for nye naboer. Samme graf som BFS, så rekkefølgen kan sammenlignes. Den andre knappen er to komponenter."
    >
      <Choice
        value={mode}
        onChange={setMode}
        options={[
          { id: "dfs", label: "én komponent" },
          { id: "comp", label: "to komponenter" },
        ]}
      />
      <Player
        frames={frames}
        resetKey={mode}
        render={(frame) => mode === "dfs" ? <DfsGraph frame={frame} /> : <CompGraph frame={frame} />}
      />
    </Page>
  );
}

function DfsGraph({ frame }) {
  const nodes = NET.nodes.map((n) => {
    let fill = "#fffdf8";
    let ink = "#1c1916";
    if (frame.stack.includes(n.id)) {
      fill = "#1d4e89";
      ink = "#fffdf8";
    }
    if (n.id === frame.current && frame.kind === "inn") {
      fill = "#f3d36b";
      ink = "#1c1916";
    }
    if (n.id === frame.current && frame.kind === "ut") {
      fill = "#f0d0cb";
      ink = "#1c1916";
    }
    return { ...n, fill, ink };
  });
  const edges = NET.edges.map((e) => {
    const used = treeEdge(frame.parent, e);
    return { ...e, plain: true, color: used ? "#1d4e89" : "#8a8175", width: used ? 2.6 : 1.3 };
  });
  return (
    <>
      <Graph width={NET.width} height={NET.height} nodes={nodes} edges={edges} />
      <p className="mono">stakk: {frame.stack.join(" → ") || "tom"}</p>
    </>
  );
}

function CompGraph({ frame }) {
  const nodes = COMP.nodes.map((n) => ({
    ...n,
    fill: compColor[frame.color[n.id]] || "#fffdf8",
    stroke: n.id === frame.current ? "#9d2c24" : "#1c1916",
    sw: n.id === frame.current ? 3 : 1.6,
  }));
  const edges = COMP.edges.map((e) => ({ ...e, plain: true }));
  return <Graph width={COMP.width} height={COMP.height} nodes={nodes} edges={edges} />;
}

const BI = {
  width: 520,
  height: 300,
  nodes: [
    { id: "a", x: 90, y: 50 },
    { id: "c", x: 90, y: 150 },
    { id: "e", x: 90, y: 250 },
    { id: "b", x: 400, y: 90 },
    { id: "d", x: 400, y: 210 },
  ],
};
const BI_OK = [
  { u: "a", v: "b" },
  { u: "a", v: "d" },
  { u: "c", v: "b" },
  { u: "c", v: "d" },
  { u: "e", v: "d" },
];
const BI_BAD = BI_OK.concat([{ u: "a", v: "c" }]);

export function Bipart() {
  const [mode, setMode] = useState("ok");
  const edges = mode === "ok" ? BI_OK : BI_BAD;
  const frames = useMemo(() => bipartite(BI.nodes.map((n) => n.id), edges), [mode, edges]);
  return (
    <Page
      kicker="Forelesning 6"
      title="Bipartitt-test"
      thm="En graf er bipartitt hvis og bare hvis den ikke har en odde sykel. Testen tar O(n + m)."
      lede="Farg naboen motsatt. Samme farge i begge ender av en kant er beviset på at det ikke går."
    >
      <Choice
        value={mode}
        onChange={setMode}
        options={[
          { id: "ok", label: "todelt" },
          { id: "bad", label: "odde sykel" },
        ]}
      />
      <Player
        frames={frames}
        resetKey={mode}
        render={(frame) => {
          const nodes = BI.nodes.map((n) => {
            const c = frame.color[n.id];
            const bad = frame.conflict && frame.conflict.includes(n.id);
            return {
              ...n,
              fill: bad ? "#9d2c24" : c === 0 ? "#1d4e89" : c === 1 ? "#f3d4cf" : "#fffdf8",
              ink: c === 0 || bad ? "#fffdf8" : "#1c1916",
            };
          });
          const drawn = edges.map((e) => {
            const bad = frame.conflict && frame.conflict.includes(e.u) && frame.conflict.includes(e.v);
            return { ...e, plain: true, color: bad ? "#9d2c24" : "#1c1916", width: bad ? 3 : 1.5 };
          });
          return <Graph width={BI.width} height={BI.height} nodes={nodes} edges={drawn} />;
        }}
      />
    </Page>
  );
}

const TOPO = {
  width: 640,
  height: 300,
  nodes: [
    { id: "mat", x: 70, y: 150 },
    { id: "disk", x: 210, y: 60 },
    { id: "algo", x: 210, y: 230 },
    { id: "graf", x: 390, y: 60 },
    { id: "dp", x: 390, y: 230 },
    { id: "flyt", x: 550, y: 150 },
  ],
  edges: [
    { u: "mat", v: "disk" },
    { u: "mat", v: "algo" },
    { u: "disk", v: "algo" },
    { u: "disk", v: "graf" },
    { u: "algo", v: "graf" },
    { u: "algo", v: "dp" },
    { u: "graf", v: "flyt" },
    { u: "dp", v: "flyt" },
  ],
};

export function Topo() {
  const [cycle, setCycle] = useState(false);
  const edges = cycle ? TOPO.edges.concat([{ u: "flyt", v: "mat" }]) : TOPO.edges;
  const frames = useMemo(() => topo(TOPO.nodes.map((n) => n.id), edges), [cycle, edges]);
  return (
    <Page
      kicker="Forelesning 6"
      title="Topologisk rekkefølge"
      thm="Hver DAG har en, og den kan lages i O(n + m)."
      lede="En kilde har ingen kanter inn. Ta den ut, senk inn-graden til naboene, gjenta. Pilene er «må tas før». Med en sykel stopper køen for tidlig."
    >
      <Choice
        value={cycle ? "sykel" : "dag"}
        onChange={(v) => setCycle(v === "sykel")}
        options={[
          { id: "dag", label: "uten sykel" },
          { id: "sykel", label: "med sykel" },
        ]}
      />
      <pre className="code">{`for hver node med inn-grad 0: legg i kø
mens køen har noe:
    ta u, sett den neste i rekkefølgen
    for hver kant u → v:
        senk inn-graden til v, og legg v i køen hvis den ble 0`}</pre>
      <Player
        frames={frames}
        resetKey={cycle ? "sykel" : "dag"}
        render={(frame) => {
          const nodes = TOPO.nodes.map((n) => {
            const pos = frame.order.indexOf(n.id);
            let fill = "#fffdf8";
            let ink = "#1c1916";
            if (pos >= 0) {
              fill = "#1d4e89";
              ink = "#fffdf8";
            }
            if (frame.queue.includes(n.id)) {
              fill = "#f6e7d4";
              ink = "#1c1916";
            }
            if (n.id === frame.current) {
              fill = "#f3d36b";
              ink = "#1c1916";
            }
            return {
              ...n,
              fill,
              ink,
              sub: pos >= 0 ? String(pos + 1) : `inn ${frame.indeg[n.id]}`,
            };
          });
          return (
            <>
              <Graph width={TOPO.width} height={TOPO.height} nodes={nodes} edges={edges} />
              <p className="mono">
                rekkefølge: {frame.order.join(" → ") || "–"}
                {"   "}kø: {frame.queue.join(" ") || "tom"}
              </p>
            </>
          );
        }}
      />
    </Page>
  );
}
