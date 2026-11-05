import { useMemo, useState } from "react";
import { closest, karatsuba, master, sortFrames } from "../algs/divide.js";
import { Page, Player } from "../ui.jsx";

const SORT_ARR = [38, 27, 43, 3, 9, 82, 10];
const INV_ARR = [4, 3, 1, 2, 6, 5];

export function Merge() {
  const frames = useMemo(() => sortFrames(SORT_ARR, false), []);
  return (
    <Page
      kicker="Forelesning 10"
      title="Mergesort"
      thm="T(n) = 2T(n/2) + O(n) = O(n log n)."
      lede="Del på midten til du har ett element. Flettingen er to pekere og tar lineær tid. Det er den som dominerer, ikke delingen."
    >
      <Player frames={frames} resetKey="merge" render={(frame) => <SortView frame={frame} />} />
    </Page>
  );
}

export function Inversions() {
  const frames = useMemo(() => sortFrames(INV_ARR, true), []);
  return (
    <Page
      kicker="Forelesning 11"
      title="Telle inversjoner"
      thm="Antall par som står i feil rekkefølge, O(n log n) ved å telle under flettingen."
      lede="Et tall fra høyre halvdel som tas før noen i venstre, hopper foran alle de gjenværende. De er inversjoner. Arrayen her har noen åpenbare."
    >
      <Player frames={frames} resetKey="inv" render={(frame) => <SortView frame={frame} showInv />} />
    </Page>
  );
}

function SortView({ frame, showInv }) {
  return (
    <>
      <div className="cells">
        {frame.a.map((v, idx) => {
          const inside = frame.lo != null && idx >= frame.lo && idx < frame.hi;
          const mid = frame.mid != null && idx === frame.mid;
          let cls = "cell";
          if (frame.phase === "done") cls += " hit";
          else if (mid) cls += " on";
          else if (inside) cls += " lo";
          else cls += " dim";
          return <div key={idx} className={cls}>{v}</div>;
        })}
      </div>
      {frame.tmp ? <p className="mono">flettes: {frame.tmp.join("  ")}</p> : <p className="mono">flettes: –</p>}
      {showInv ? <p className="mono">inversjoner så langt: {frame.inv}</p> : null}
    </>
  );
}

const PRESETS = [
  { id: "merge", label: "mergesort", a: 2, b: 2, d: 1 },
  { id: "bin", label: "binærsøk", a: 1, b: 2, d: 0 },
  { id: "med", label: "median", a: 1, b: 2, d: 1 },
  { id: "kara", label: "Karatsuba", a: 3, b: 2, d: 1 },
  { id: "str", label: "Strassen", a: 7, b: 2, d: 2 },
  { id: "mm", label: "8 submatriser", a: 8, b: 2, d: 2 },
];

export function Master() {
  const [a, setA] = useState(2);
  const [b, setB] = useState(2);
  const [d, setD] = useState(1);
  const res = master(Number(a), Number(b), Number(d));
  const ratio = Number(a) / Number(b) ** Number(d);
  return (
    <Page
      kicker="Forelesning 11"
      title="Masterteoremet"
      thm="T(n) = a T(n/b) + O(n^d)."
      lede="Sammenlign a med b^d. Synker kostnaden nedover treet, er den lik på hvert nivå, eller vokser den. Eksemplene er de fra slidene, Strassen inkludert."
    >
      <div className="choice">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={a === p.a && b === p.b && d === p.d ? "on" : ""}
            onClick={() => { setA(p.a); setB(p.b); setD(p.d); }}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="slider">
        <span className="mono">a</span>
        <input type="number" min="1" value={a} onChange={(e) => setA(Number(e.target.value))} />
        <span className="mono">b</span>
        <input type="number" min="2" value={b} onChange={(e) => setB(Number(e.target.value))} />
        <span className="mono">d</span>
        <input type="number" min="0" step="1" value={d} onChange={(e) => setD(Number(e.target.value))} />
      </div>
      <p className="thm">{res.bound}</p>
      <p className="lede">{res.why} Forholdet mellom nivåene er a / b^d = {Number.isFinite(ratio) ? ratio.toFixed(3) : "–"}.</p>
      <LevelTree a={Number(a)} b={Number(b)} d={Number(d)} />
    </Page>
  );
}

function LevelTree({ a, b, d }) {
  if (!(a > 0) || !(b > 1) || !(d >= 0)) return null;
  const levels = 4;
  const w = 680;
  const h = 210;
  const boxes = [];
  for (let j = 0; j < levels; j++) {
    const count = Math.min(a ** j, 8);
    const cost = (a / b ** d) ** j;
    for (let k = 0; k < count; k++) {
      const x = ((k + 0.5) / count) * (w - 40) + 20;
      boxes.push({ x, y: 24 + j * 48, label: j === 0 ? "n^d" : cost.toFixed(2), more: k === 7 && a ** j > 8 });
    }
  }
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="graph">
      {boxes.map((box, i) => (
        <g key={i}>
          <rect x={box.x - 28} y={box.y} width="56" height="26" fill="#fffdf8" stroke="#1c1916" />
          <text x={box.x} y={box.y + 17} textAnchor="middle" className="tick" fill="#1c1916">{box.more ? "…" : box.label}</text>
        </g>
      ))}
    </svg>
  );
}

export function Karatsuba() {
  const [a, setA] = useState(1234);
  const [b, setB] = useState(5678);
  const frames = useMemo(() => karatsuba(clamp(a), clamp(b)), [a, b]);
  return (
    <Page
      kicker="Forelesning 11"
      title="Karatsuba"
      thm="To n-sifrede tall kan ganges i O(n^log₂ 3) ≈ O(n^1.585)."
      lede="Skolemultiplikasjon deler i fire produkter. (A1+A0)(B1+B0) − z2 − z0 gir kryssleddet, så tre rekursive kall holder."
    >
      <div className="slider">
        <input type="number" min="1" max="999999" value={a} onChange={(e) => setA(Number(e.target.value))} />
        <span>×</span>
        <input type="number" min="1" max="999999" value={b} onChange={(e) => setB(Number(e.target.value))} />
      </div>
      <Player
        frames={frames}
        resetKey={`${clamp(a)}-${clamp(b)}`}
        speed={900}
        render={(frame) => (
          <div>
            <p className="mono">{frame.path.map((p) => `${p.x}·${p.y}`).join("  /  ")}</p>
            {frame.kind === "split" ? (
              <p>
                {frame.x} = {frame.A1}·10^{frame.m} + {frame.A0}<br />
                {frame.y} = {frame.B1}·10^{frame.m} + {frame.B0}
              </p>
            ) : null}
            {frame.kind === "combine" ? (
              <p className="mono">
                z2={frame.z2} &nbsp; z0={frame.z0} &nbsp; z1={frame.z1}<br />
                = {frame.result}
              </p>
            ) : null}
            {frame.kind === "base" ? <p className="amount">{frame.result}</p> : null}
          </div>
        )}
      />
    </Page>
  );
}

function clamp(n) {
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(999999, Math.floor(n));
}

const POINTS = [
  { id: "a", x: 0, y: 1 },
  { id: "b", x: 1.2, y: 4.5 },
  { id: "c", x: 2.1, y: 0.5 },
  { id: "d", x: 2.8, y: 3 },
  { id: "e", x: 3.6, y: 4 },
  { id: "g", x: 4.05, y: 5.2 },
  { id: "f", x: 4.2, y: 4.2 },
  { id: "h", x: 5.5, y: 1 },
  { id: "i", x: 7, y: 5 },
  { id: "j", x: 8.2, y: 2 },
  { id: "k", x: 10, y: 4 },
];

export function Closest() {
  const frames = useMemo(() => closest(POINTS), []);
  return (
    <Page
      kicker="Forelesning 12"
      title="Nærmeste par"
      thm="T(n) = 2T(n/2) + O(n) = O(n log n), etter at stripen bare sjekker noen naboer i y-rekkefølge."
      lede="Del på x. Beste avstand inni en halvdel sier hvor bred stripen rundt delelinjen trenger å være. Paret som vinner her krysser linjen."
    >
      <Player frames={frames} resetKey="par" render={(frame) => <Plane frame={frame} />} />
    </Page>
  );
}

function Plane({ frame }) {
  const X = (x) => 36 + x * 56;
  const Y = (y) => 300 - y * 46;
  const active = new Set(frame.active || []);
  const pair = new Set(frame.pair || []);
  const strip = new Set(frame.strip || []);
  return (
    <svg viewBox="0 0 640 320" className="graph">
      {frame.midx != null ? (
        <line x1={X(frame.midx)} y1={20} x2={X(frame.midx)} y2={300} stroke="#9d2c24" strokeDasharray="4 3" />
      ) : null}
      {frame.pair ? (
        <line
          x1={X(POINTS.find((p) => p.id === frame.pair[0]).x)}
          y1={Y(POINTS.find((p) => p.id === frame.pair[0]).y)}
          x2={X(POINTS.find((p) => p.id === frame.pair[1]).x)}
          y2={Y(POINTS.find((p) => p.id === frame.pair[1]).y)}
          stroke="#9d2c24"
          strokeWidth="2"
        />
      ) : null}
      {POINTS.map((p) => (
        <g key={p.id} opacity={active.size && !active.has(p.id) ? 0.25 : 1}>
          <circle
            cx={X(p.x)}
            cy={Y(p.y)}
            r={pair.has(p.id) ? 7 : 5}
            fill={strip.has(p.id) ? "#f3d36b" : pair.has(p.id) ? "#9d2c24" : "#1d4e89"}
            stroke="#1c1916"
          />
          <text x={X(p.x) + 8} y={Y(p.y) - 8} className="tick" fill="#1c1916">{p.id}</text>
        </g>
      ))}
    </svg>
  );
}
