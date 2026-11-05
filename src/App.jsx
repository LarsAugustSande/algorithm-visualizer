import { useEffect, useState } from "react";
import { groups } from "./catalog.js";
import { Assign, Flow, MatchFlow } from "./views/flow.jsx";
import { Bellman, Dijkstra, Heap, Kruskal, Prim, Union } from "./views/trees.jsx";
import { Closest, Inversions, Karatsuba, Master, Merge } from "./views/divide.jsx";
import { Edit, Knapsack, Sanskrit, Segment, Weighted } from "./views/dp.jsx";
import { Coins, Interval, Late, Partition } from "./views/greedy.jsx";
import { Bfs, Bipart, Dfs, Topo } from "./views/graphs.jsx";
import { Asymp, Binary, TwoSum } from "./views/runtime.jsx";
import { Gale } from "./views/matching.jsx";
import { Home } from "./views/home.jsx";

const views = {
  innhold: Home,
  gale: Gale,
  asymp: Asymp,
  binarsok: Binary,
  tosum: TwoSum,
  bfs: Bfs,
  dfs: Dfs,
  bipartitt: Bipart,
  topo: Topo,
  mynter: Coins,
  intervall: Interval,
  partisjon: Partition,
  lateness: Late,
  dijkstra: Dijkstra,
  haug: Heap,
  prim: Prim,
  kruskal: Kruskal,
  union: Union,
  merge: Merge,
  master: Master,
  karatsuba: Karatsuba,
  inv: Inversions,
  par: Closest,
  sanskrit: Sanskrit,
  vektet: Weighted,
  segment: Segment,
  knapsack: Knapsack,
  edit: Edit,
  bellman: Bellman,
  flyt: Flow,
  matchflyt: MatchFlow,
  tilordning: Assign,
};

export default function App() {
  const [id, setId] = useState(() => location.hash.replace("#", "") || "innhold");

  useEffect(() => {
    const sync = () => setId(location.hash.replace("#", "") || "innhold");
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const View = views[id] || Home;

  return (
    <div className="sheet">
      <span className="hole h1" />
      <span className="hole h2" />
      <span className="hole h3" />
      <span className="rule" />
      <aside className="toc">
        <a className="brand" href="#innhold">INF234</a>
        <p className="brand-sub">Algoritmer</p>
        {groups.map((g) => (
          <div key={g.label}>
            <div className="group">{g.label}</div>
            {g.items.map((it) => (
              <a key={it.id} className={it.id === id ? "item on" : "item"} href={`#${it.id}`}>
                {it.title}
              </a>
            ))}
          </div>
        ))}
      </aside>
      <main>
        <label className="jump">
          <span>hopp til</span>
          <select value={views[id] ? id : "innhold"} onChange={(e) => { location.hash = e.target.value; }}>
            {groups.map((g) => (
              <optgroup key={g.label} label={g.label}>
                {g.items.map((it) => (
                  <option key={it.id} value={it.id}>{it.title}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <View />
      </main>
    </div>
  );
}
