import { useMemo, useState } from "react";
import { callTree, editDistance, knapsack, sanskrit, segments, weighted } from "../algs/dp.js";
import { Choice, Gantt, Page, Player } from "../ui.jsx";

export function Sanskrit() {
  const [n, setN] = useState(6);
  const data = useMemo(() => sanskrit(n), [n]);
  const tree = n <= 6 ? callTree(n) : null;
  const maxCalls = Math.max(data.naive, 1);
  return (
    <Page
      kicker="Forelesning 12"
      title="Sanskrit-rekurrensen"
      thm="P(n) = P(n−1) + P(n−2). Uten hukommelse er det eksponentielt mange kall."
      lede="En frase av lengde n bygges av kort (1) og lang (2) stavelse. get_P(n) kaller seg selv på nesten de samme tallene om igjen. Memoisering, eller bare en array nedenfra, gjør det lineært."
    >
      <div className="slider">
        <span className="mono">n = {n}</span>
        <input type="range" min="1" max="14" value={n} onChange={(e) => setN(Number(e.target.value))} />
      </div>
      <div className="bars">
        <div className="barwrap">
          <div className="bar" style={{ height: `${(data.naive / maxCalls) * 100}%` }} />
          <span className="small">uten memo {data.naive}</span>
        </div>
        <div className="barwrap">
          <div className="bar memo" style={{ height: `${Math.max(6, (data.memoCalls / maxCalls) * 100)}%` }} />
          <span className="small">med memo {data.memoCalls}</span>
        </div>
      </div>
      <div className="cells">
        {data.P.map((v, i) => (
          <div key={i} className={i === n ? "cell on" : "cell"} title={`P(${i})`}>
            {v}
          </div>
        ))}
      </div>
      <p className="small">P(0) … P({n}). P({n}) = {data.value}.</p>
      {data.patterns ? (
        <p className="mono">
          {data.patterns.map((p) => p.map((s) => (s === "k" ? "kort" : "lang")).join("·")).join("   ")}
        </p>
      ) : <p className="small">For n &gt; 8 blir lista lang. Tallet stemmer fortsatt.</p>}
      {tree ? <CallTree root={tree} /> : null}
    </Page>
  );
}

function CallTree({ root }) {
  const pos = {};
  function place(node, depth, left) {
    if (!node.children.length) {
      pos[node.id] = { x: left, y: depth, k: node.k };
      return left + 1;
    }
    let x = left;
    for (const c of node.children) x = place(c, depth + 1, x);
    const xs = node.children.map((c) => pos[c.id].x);
    pos[node.id] = { x: (xs[0] + xs[xs.length - 1]) / 2, y: depth, k: node.k };
    return x;
  }
  const widthUnits = place(root, 0, 0);
  const edges = [];
  function walk(node) {
    for (const c of node.children) {
      edges.push([node.id, c.id]);
      walk(c);
    }
  }
  walk(root);
  const X = (u) => 20 + u * 36;
  const Y = (d) => 18 + d * 36;
  const w = Math.max(200, 40 + widthUnits * 36);
  const h = 36 + Math.max(...Object.values(pos).map((p) => p.y)) * 36;
  return (
    <div className="treebox">
      <p className="small">Kalltreet uten memo, for denne n. Hver sirkel er ett kall.</p>
      <svg viewBox={`0 0 ${w} ${h}`} className="graph" style={{ minWidth: w }}>
        {edges.map(([a, b], i) => (
          <line key={i} x1={X(pos[a].x)} y1={Y(pos[a].y)} x2={X(pos[b].x)} y2={Y(pos[b].y)} stroke="#8a8175" />
        ))}
        {Object.entries(pos).map(([id, p]) => (
          <g key={id}>
            <circle cx={X(p.x)} cy={Y(p.y)} r="11" fill="#fffdf8" stroke="#1c1916" />
            <text x={X(p.x)} y={Y(p.y) + 4} textAnchor="middle" className="tick" fill="#1c1916">{p.k}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

const WJOBS = [
  { id: "a", s: 0, f: 3, v: 2 },
  { id: "b", s: 1, f: 5, v: 6 },
  { id: "c", s: 4, f: 7, v: 5 },
  { id: "d", s: 3, f: 8, v: 7 },
  { id: "e", s: 6, f: 10, v: 4 },
  { id: "f", s: 8, f: 11, v: 3 },
];

export function Weighted() {
  const frames = useMemo(() => weighted(WJOBS), []);
  return (
    <Page
      kicker="Forelesning 13"
      title="Vektet intervallplanlegging"
      thm="OPT(j) = max(vⱼ + OPT(p(j)), OPT(j−1)). Med sortering og binærsøk på p(j): O(n log n)."
      lede="Tidligst ferdig bryr seg ikke om verdien. Her kan en kort billig jobb stenge en som er verdt mer. p(j) er siste jobb som er ferdig før j starter."
    >
      <Player
        frames={frames}
        resetKey="vekt"
        render={(frame) => {
          const chosen = new Set(frame.chosen);
          const jobs = frame.jobs;
          return (
            <>
              <Gantt
                t0={0}
                t1={11}
                rows={[{
                  bars: jobs.map((j, idx) => {
                    const on = chosen.has(j.id) || (frame.take && frame.j === idx + 1);
                    return {
                      s: j.s,
                      f: j.f,
                      text: `${j.id}:${j.v}`,
                      fill: frame.j === idx + 1 ? "#f3d36b" : on ? "#1d4e89" : "#fffdf8",
                      ink: on && frame.j !== idx + 1 ? "#fffdf8" : "#1c1916",
                    };
                  }),
                }]}
              />
              <div className="cells">
                {frame.opt.map((v, i) => (
                  <div key={i} className={i === frame.j ? "cell on" : "cell"}>{v}</div>
                ))}
              </div>
              <p className="small">
                OPT(0)…OPT({frame.opt.length - 1}). p = [{frame.p.join(", ")}], 1-indeksert mot OPT.
              </p>
            </>
          );
        }}
      />
    </Page>
  );
}

const SEGS = [
  { x: 1, y: 1.1 },
  { x: 2, y: 2.0 },
  { x: 3, y: 2.9 },
  { x: 4, y: 4.2 },
  { x: 5, y: 6.4 },
  { x: 6, y: 5.5 },
  { x: 7, y: 4.6 },
  { x: 8, y: 3.4 },
];
const SEG_INK = ["#1d4e89", "#9d2c24", "#2c6b45", "#a56b12"];

export function Segment() {
  const [C, setC] = useState(1.5);
  const res = useMemo(() => segments(SEGS, C), [C]);
  const w = 640;
  const h = 300;
  const pad = 28;
  const X = (x) => pad + ((x - 0.6) / 8) * (w - 2 * pad);
  const Y = (y) => h - pad - ((y - 0.4) / 6.6) * (h - 2 * pad);
  return (
    <Page
      kicker="Forelesning 13"
      title="Segmentert minste kvadrat"
      thm="OPT(j) = minᵢ (feil(i…j) + C + OPT(i−1))."
      lede="Én linje er for grov, ett segment per punkt er juks. C er straffen for å åpne et nytt segment. Dra den opp, så slår algoritmen sammen."
    >
      <div className="slider">
        <span className="mono">C = {C.toFixed(1)}</span>
        <input type="range" min="0" max="8" step="0.5" value={C} onChange={(e) => setC(Number(e.target.value))} />
        <span className="mono">kost {res.opt.at(-1).toFixed(2)} · {res.segs.length} linjer</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="graph">
        {res.segs.map((s, i) => {
          const x1 = SEGS[s.i - 1].x;
          const x2 = SEGS[s.j - 1].x;
          return (
            <line
              key={i}
              x1={X(x1)}
              y1={Y(s.a * x1 + s.b)}
              x2={X(x2)}
              y2={Y(s.a * x2 + s.b)}
              stroke={SEG_INK[i % SEG_INK.length]}
              strokeWidth="2"
            />
          );
        })}
        {SEGS.map((p, i) => (
          <circle key={i} cx={X(p.x)} cy={Y(p.y)} r="4.5" fill="#1c1916" />
        ))}
      </svg>
    </Page>
  );
}

const ITEMS = [
  { id: "a", v: 5, w: 2 },
  { id: "b", v: 6, w: 3 },
  { id: "c", v: 8, w: 4 },
  { id: "d", v: 10, w: 5 },
];

export function Knapsack() {
  const W = 8;
  const frames = useMemo(() => knapsack(ITEMS, W), []);
  return (
    <Page
      kicker="Forelesning 14"
      title="Knapsack"
      thm="OPT(j, w) fylles i O(nW). Ikke polynom i lengden på tallet W."
      lede="Verdi per vekt tar a og b først og står igjen med 11. Sekken har plass til b og d, verdi 16. Derfor må vekten være med i delproblemet, ikke bare hvor mange gjenstander vi har sett."
    >
      <p className="small">
        {ITEMS.map((it) => `${it.id}: verdi ${it.v}, vekt ${it.w}`).join(" · ")} · grense {W}
      </p>
      <Player
        frames={frames}
        resetKey="sack"
        speed={420}
        render={(frame) => (
          <div className="scroll">
            <table className="dp">
              <thead>
                <tr>
                  <th></th>
                  {frame.dp[0].map((_, w) => <th key={w}>{w}</th>)}
                </tr>
              </thead>
              <tbody>
                {frame.dp.map((row, i) => (
                  <tr key={i}>
                    <th>{i === 0 ? "–" : ITEMS[i - 1].id}</th>
                    {row.map((val, w) => {
                      const cur = i === frame.i && w === frame.w && frame.chosen == null;
                      const known = frame.chosen != null || i === 0 || i < frame.i || (i === frame.i && w <= frame.w);
                      return <td key={w} className={cur ? "cur" : known ? "" : "wait"}>{known ? val : ""}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      />
    </Page>
  );
}

export function Edit() {
  const [preset, setPreset] = useState("dag");
  const pair = preset === "dag" ? ["lørdag", "søndag"] : ["occurence", "ocurance"];
  const frames = useMemo(() => editDistance(pair[0], pair[1]), [preset, pair]);
  return (
    <Page
      kicker="Forelesning 14–15"
      title="Edit distance"
      thm="Avstanden kan regnes i O(nm). Én rad av gangen holder til tallet, O(n + m) minne."
      lede="Sett inn, slett eller bytt, kostnad 1. Like bokstaver er en gratis diagonal. occurence mot ocurance er eksempelet fra slidene, avstand 2."
    >
      <Choice
        value={preset}
        onChange={setPreset}
        options={[
          { id: "dag", label: "lørdag / søndag" },
          { id: "slide", label: "occurence / ocurance" },
        ]}
      />
      <Player
        frames={frames}
        resetKey={preset}
        speed={preset === "slide" ? 140 : 520}
        render={(frame) => <Matrix S={pair[0]} T={pair[1]} frame={frame} />}
      />
    </Page>
  );
}

function Matrix({ S, T, frame }) {
  return (
    <div className="scroll">
      <table className="dp">
        <thead>
          <tr>
            <th></th>
            <th>ε</th>
            {T.split("").map((ch, j) => <th key={j}>{ch}</th>)}
          </tr>
        </thead>
        <tbody>
          {frame.dp.map((row, i) => (
            <tr key={i}>
              <th>{i === 0 ? "ε" : S[i - 1]}</th>
              {row.map((val, j) => (
                <td key={j} className={i === frame.i && j === frame.j ? "cur" : val == null ? "wait" : ""}>
                  {val == null ? "" : val}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
