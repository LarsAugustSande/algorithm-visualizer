import { useMemo, useState } from "react";
import { gale, LECTURE_SIDES } from "../algs/matching.js";
import { Choice, Page, Player } from "../ui.jsx";

export function Gale() {
  const [who, setWho] = useState("student");
  const left = who === "student" ? LECTURE_SIDES.students : LECTURE_SIDES.hospitals;
  const right = who === "student" ? LECTURE_SIDES.hospitals : LECTURE_SIDES.students;
  const frames = useMemo(() => gale(left, right), [who, left, right]);
  const studentM = useMemo(() => gale(LECTURE_SIDES.students, LECTURE_SIDES.hospitals).at(-1).matchL, []);
  const hospitalM = useMemo(() => gale(LECTURE_SIDES.hospitals, LECTURE_SIDES.students).at(-1).matchL, []);

  return (
    <Page
      kicker="Forelesning 1–2"
      title="Gale–Shapley"
      thm="Stabil matching i O(n²). Søkeren får sitt beste gyldige utfall, den andre siden sitt verste."
      lede="Preferansene er de fra slidene. Det finnes to stabile matchinger. Hvem som søker, avgjør hvilken du får."
    >
      <Choice
        value={who}
        onChange={setWho}
        options={[
          { id: "student", label: "studentene søker" },
          { id: "hospital", label: "sykehusene søker" },
        ]}
      />
      <pre className="code">{`så lenge en søker s er ledig og har flere igjen:
    h ← neste på lista til s
    hvis h er ledig, eller liker s bedre enn den de har:
        match s med h`}</pre>
      <Player
        frames={frames}
        resetKey={who}
        render={(frame) => <Board left={left} right={right} frame={frame} />}
      />
      <p className="small">
        Studenter søker: {Object.entries(studentM).map(([s, h]) => `${s}–${h}`).join(", ")}.
        Sykehus søker: {Object.entries(hospitalM).map(([h, s]) => `${h}–${s}`).join(", ")}.
      </p>
    </Page>
  );
}

function Board({ left, right, frame }) {
  const n = Math.max(left.length, right.length);
  const y = (i) => 46 + i * 78;
  const h = 36 + n * 78;
  return (
    <svg viewBox={`0 0 640 ${h}`} className="graph">
      <text x="36" y="22" className="tick" fill="#6f655b">søker</text>
      <text x="430" y="22" className="tick" fill="#6f655b">blir spurt</text>
      {left.map((p, i) => {
        const m = frame.matchL[p.id];
        if (!m) return null;
        const j = right.findIndex((r) => r.id === m);
        return <line key={p.id} x1="210" y1={y(i)} x2="400" y2={y(j)} stroke="#1d4e89" strokeWidth="2" />;
      })}
      {frame.proposal ? (
        <line
          x1="210"
          y1={y(left.findIndex((p) => p.id === frame.proposal.l))}
          x2="400"
          y2={y(right.findIndex((r) => r.id === frame.proposal.r))}
          stroke="#9d2c24"
          strokeDasharray="4 3"
          strokeWidth="1.5"
        />
      ) : null}
      {left.map((p, i) => (
        <g key={p.id}>
          <text x="28" y={y(i) + 5} className="nlabel" fill="#1c1916">{p.id}</text>
          <text x="70" y={y(i) + 5} className="tick">
            {p.prefs.map((id, k) => {
              const tried = k < frame.next[p.id];
              const got = frame.matchL[p.id] === id;
              return (
                <tspan
                  key={id}
                  dx={k ? 10 : 0}
                  fill={got ? "#1d4e89" : tried ? "#a89880" : "#1c1916"}
                  textDecoration={tried && !got ? "line-through" : undefined}
                >
                  {id}
                </tspan>
              );
            })}
          </text>
        </g>
      ))}
      {right.map((r, i) => {
        const held = Object.entries(frame.matchL).find(([, id]) => id === r.id)?.[0];
        return (
          <g key={r.id}>
            <text x="430" y={y(i) + 5} className="nlabel" fill="#1c1916">{r.id}</text>
            <text x="478" y={y(i) + 5} className="tick" fill="#6f655b">{r.prefs.join("  ")}</text>
            {held ? <text x="575" y={y(i) + 5} className="tick" fill="#1d4e89">{held}</text> : null}
          </g>
        );
      })}
    </svg>
  );
}
