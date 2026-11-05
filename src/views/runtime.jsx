import { useMemo, useState } from "react";
import { binarySearch, twoSum } from "../algs/search.js";
import { Choice, Page, Player } from "../ui.jsx";

const FNS = [
  { id: "log", label: "log₂ n", color: "#1d4e89", f: (n) => Math.log2(n) },
  { id: "n", label: "n", color: "#2c6b45", f: (n) => n },
  { id: "nlog", label: "n log₂ n", color: "#a56b12", f: (n) => n * Math.log2(Math.max(n, 2)) },
  { id: "n2", label: "n²", color: "#9d2c24", f: (n) => n * n },
  { id: "n3", label: "n³", color: "#5c3d6e", f: (n) => n ** 3 },
  { id: "exp", label: "2ⁿ", color: "#1c1916", f: (n) => 2 ** n },
];

function fmtTime(ops) {
  const s = ops / 1e6;
  if (s < 1e-3) return `${(s * 1e6).toFixed(0)} µs`;
  if (s < 1) return `${(s * 1000).toFixed(s < 0.01 ? 2 : 0)} ms`;
  if (s < 60) return `${s.toFixed(s < 10 ? 1 : 0)} s`;
  if (s < 3600) return `${(s / 60).toFixed(1)} min`;
  if (s < 86400) return `${(s / 3600).toFixed(1)} t`;
  if (s < 86400 * 60) return `${(s / 86400).toFixed(1)} dager`;
  const years = s / (86400 * 365.25);
  if (years < 10000) return `${years.toFixed(years < 10 ? 1 : 0)} år`;
  return `${years.toExponential(1)} år`;
}

export function Asymp() {
  const [on, setOn] = useState(() => Object.fromEntries(FNS.map((f) => [f.id, true])));
  const ns = [];
  for (let n = 1; n <= 40; n++) ns.push(n);
  const active = FNS.filter((f) => on[f.id]);
  const w = 680;
  const h = 320;
  const left = 48;
  const bottom = 28;
  const maxLog = Math.log10(active.reduce((m, f) => Math.max(m, f.f(40)), 2));
  const X = (n) => left + ((n - 1) / 39) * (w - left - 12);
  const Y = (v) => 16 + (1 - Math.log10(Math.max(v, 1)) / maxLog) * (h - bottom - 16);

  return (
    <Page
      kicker="Forelesning 3–4"
      title="O, Ω og Θ"
      thm="f = O(g) hvis f(n) ≤ c·g(n) fra et n₀ av. Ω er den andre veien. Θ er begge."
      lede="Konstantene kaster vi. Det som teller er hvordan antall primitive steg vokser med n. Tabellen antar 10⁶ steg i sekundet, som på slidene."
    >
      <div className="choice">
        {FNS.map((f) => (
          <button key={f.id} type="button" className={on[f.id] ? "on" : ""} onClick={() => setOn((s) => ({ ...s, [f.id]: !s[f.id] }))}>
            {f.label}
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="graph">
        {[1, 2, 4, 8, 12].map((p) => {
          const y = Y(10 ** ((p / 12) * maxLog));
          return <line key={p} x1={left} y1={y} x2={w - 8} y2={y} stroke="#eadfce" />;
        })}
        <line x1={left} y1={16} x2={left} y2={h - bottom} stroke="#1c1916" />
        <line x1={left} y1={h - bottom} x2={w - 8} y2={h - bottom} stroke="#1c1916" />
        {[1, 10, 20, 30, 40].map((n) => (
          <text key={n} x={X(n)} y={h - 10} textAnchor="middle" className="tick" fill="#6f655b">{n}</text>
        ))}
        <text x="14" y="20" className="tick" fill="#6f655b">log</text>
        {active.map((f) => {
          const d = ns.filter((n) => f.f(n) >= 1).map((n, i) => `${i ? "L" : "M"} ${X(n).toFixed(1)} ${Y(f.f(n)).toFixed(1)}`).join(" ");
          return <path key={f.id} d={d} fill="none" stroke={f.color} strokeWidth="2" />;
        })}
      </svg>
      <p className="legend">
        {active.map((f) => (
          <span key={f.id}><i style={{ background: f.color }} />{f.label}</span>
        ))}
      </p>
      <div className="scroll">
        <table className="dp">
          <thead>
            <tr>
              <th>n</th>
              {FNS.map((f) => <th key={f.id}>{f.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {[10, 20, 30, 40, 50].map((n) => (
              <tr key={n}>
                <th>{n}</th>
                {FNS.map((f) => <td key={f.id}>{fmtTime(f.f(n))}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="small">n² + 3n er O(n²): for c = 2 og n ≥ 3 er n² + 3n ≤ 2n². Likhetstegnet i «f = O(g)» er en misbruk, slik Kirill skriver det.</p>
    </Page>
  );
}

const ARR = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];

export function Binary() {
  const [target, setTarget] = useState(23);
  const frames = useMemo(() => binarySearch(ARR, target), [target]);
  return (
    <Page
      kicker="Forelesning 4"
      title="Binærsøk"
      thm="Oppslag i sortert array, O(log n)."
      lede="Sammenlign med midten. Halvparten av intervallet kan kastes, hver gang."
    >
      <Choice
        value={String(target)}
        onChange={(v) => setTarget(Number(v))}
        options={[23, 2, 91, 7].map((n) => ({ id: String(n), label: String(n) }))}
      />
      <Player
        frames={frames}
        resetKey={target}
        render={(frame) => (
          <div className="cells">
            {ARR.map((v, idx) => {
              const inside = frame.mid == null ? idx >= frame.lo && idx <= frame.hi : idx >= frame.lo && idx <= frame.hi;
              let cls = "cell";
              if (frame.found === idx) cls += " hit";
              else if (frame.mid === idx) cls += " on";
              else if (!inside || (frame.hi < frame.lo)) cls += " dim";
              else cls += " lo";
              return <div key={idx} className={cls}>{v}</div>;
            })}
          </div>
        )}
      />
    </Page>
  );
}

const SUM_ARR = [1, 3, 4, 7, 9, 12];

export function TwoSum() {
  const [target, setTarget] = useState(16);
  const frames = useMemo(() => twoSum(SUM_ARR, target), [target]);
  return (
    <Page
      kicker="Forelesning 4"
      title="Target sum"
      thm="To tall som summerer til T i en sortert array, O(n)."
      lede="For liten sum: flytt venstre. For stor: flytt høyre. Hvert tall forlates én gang."
    >
      <Choice
        value={String(target)}
        onChange={(v) => setTarget(Number(v))}
        options={[16, 13, 8].map((n) => ({ id: String(n), label: `T = ${n}` }))}
      />
      <Player
        frames={frames}
        resetKey={target}
        render={(frame) => (
          <div className="cells">
            {SUM_ARR.map((v, idx) => {
              const hit = frame.found && (frame.found[0] === idx || frame.found[1] === idx);
              const ptr = idx === frame.i || idx === frame.j;
              let cls = "cell";
              if (hit) cls += " hit";
              else if (ptr) cls += " on";
              else if (idx < frame.i || idx > frame.j) cls += " dim";
              return <div key={idx} className={cls}>{v}</div>;
            })}
          </div>
        )}
      />
    </Page>
  );
}
