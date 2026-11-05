import { useMemo, useState } from "react";
import { coins, depthOf, lateness, partition, schedule } from "../algs/greedy.js";
import { Choice, Gantt, Page, Player } from "../ui.jsx";

const INK = ["#1d4e89", "#9d2c24", "#2c6b45", "#a56b12", "#5c3d6e"];

export function Coins() {
  const [mode, setMode] = useState("nok");
  const spec = mode === "nok"
    ? { amount: 57, denoms: [1, 5, 10, 20] }
    : { amount: 15, denoms: [1, 5, 10, 12] };
  const frames = useMemo(() => coins(spec.amount, spec.denoms), [mode, spec.amount, spec.denoms]);
  return (
    <Page
      kicker="Forelesning 7"
      title="Vekslepenger"
      thm="For 1, 5, 10 og 20 er største-mynt-først optimalt. Ikke for et vilkårlig myntsett."
      lede="57 kr er eksempelet fra timen. Det andre myntsettet ser uskyldig ut, men 12 + 1 + 1 + 1 taper for 10 + 5."
    >
      <Choice
        value={mode}
        onChange={setMode}
        options={[
          { id: "nok", label: "1, 5, 10, 20" },
          { id: "bad", label: "1, 5, 10, 12" },
        ]}
      />
      <Player
        frames={frames}
        resetKey={mode}
        render={(frame) => (
          <>
            <p className="amount">{frame.left} kr igjen</p>
            <div className="coins">
              {frame.taken.map((c, i) => (
                <span key={i} className={`coin k${c}`}>{c}</span>
              ))}
            </div>
          </>
        )}
      />
    </Page>
  );
}

const SCHED = [
  { id: "a", s: 0, f: 10 },
  { id: "b", s: 1, f: 3 },
  { id: "c", s: 3, f: 5 },
  { id: "d", s: 5, f: 8 },
  { id: "e", s: 2, f: 6 },
];

export function Interval() {
  const [rule, setRule] = useState("finish");
  const frames = useMemo(() => schedule(SCHED, rule), [rule]);
  return (
    <Page
      kicker="Forelesning 7"
      title="Intervallplanlegging"
      thm="Tidligst ferdig gir flest jobber som ikke overlapper."
      lede="Samme jobber, to regler. Tidligst start griper a, som dekker nesten hele dagen, og mister tre korte."
    >
      <Choice
        value={rule}
        onChange={setRule}
        options={[
          { id: "finish", label: "tidligst ferdig" },
          { id: "start", label: "tidligst start" },
        ]}
      />
      <Player
        frames={frames}
        resetKey={rule}
        render={(frame) => (
          <Gantt
            t0={0}
            t1={10}
            rows={[{
              bars: SCHED.map((j) => {
                const chosen = frame.chosen.includes(j.id);
                const cur = frame.current === j.id;
                return {
                  s: j.s,
                  f: j.f,
                  text: j.id,
                  fill: chosen ? "#1d4e89" : cur ? "#f3d36b" : "#fffdf8",
                  ink: chosen ? "#fffdf8" : "#1c1916",
                };
              }),
            }]}
          />
        )}
      />
    </Page>
  );
}

const PART = [
  { id: "a", s: 0, f: 4 },
  { id: "b", s: 1, f: 3 },
  { id: "c", s: 2, f: 6 },
  { id: "d", s: 5, f: 8 },
  { id: "e", s: 7, f: 9 },
];

export function Partition() {
  const frames = useMemo(() => partition(PART), []);
  const depth = depthOf(PART);
  return (
    <Page
      kicker="Forelesning 7"
      title="Intervallpartisjonering"
      thm="Like mange maskiner som dypden, altså flest jobber som pågår samtidig."
      lede={`Dobbelt grådig, som på slidene: fyll én maskin med tidligst-ferdig, og gjenta på resten. Her er dypden ${depth}.`}
    >
      <Player
        frames={frames}
        resetKey="part"
        render={(frame) => {
          const rows = [];
          frame.machines.forEach((ids, i) => {
            rows.push({
              bars: ids.map((id) => {
                const j = PART.find((x) => x.id === id);
                return { s: j.s, f: j.f, text: id, fill: INK[i % INK.length], ink: "#fffdf8" };
              }),
            });
          });
          const building = frame.tentative || [];
          if (building.length && frame.machines.every((m) => m.join() !== building.join())) {
            rows.push({
              bars: building.map((id) => {
                const j = PART.find((x) => x.id === id);
                return { s: j.s, f: j.f, text: id, fill: "#f3d36b" };
              }),
            });
          }
          const placed = new Set(frame.machines.flat().concat(building));
          const waiting = PART.filter((j) => !placed.has(j.id));
          if (waiting.length) {
            rows.push({
              bars: waiting.map((j) => ({
                s: j.s,
                f: j.f,
                text: j.id,
                fill: frame.current === j.id ? "#f3d36b" : "#fffdf8",
              })),
            });
          }
          return <Gantt t0={0} t1={9} rows={rows.length ? rows : [{ bars: [] }]} />;
        }}
      />
    </Page>
  );
}

const LATE = [
  { id: "a", t: 4, d: 4 },
  { id: "b", t: 1, d: 100 },
  { id: "c", t: 2, d: 8 },
];

export function Late() {
  const [rule, setRule] = useState("deadline");
  const frames = useMemo(() => lateness(LATE, rule), [rule]);
  const end = Math.max(...frames.map((f) => f.time || 0), 8);
  return (
    <Page
      kicker="Forelesning 7"
      title="Minimere forsinkelse"
      thm="Tidligst frist, uten opphold, minimerer maks forsinkelse."
      lede="Forsinkelse er hvor mye ferdig-tidspunktet ryker fristen, og vi bryr oss om den verste jobben. Kortest først ser lurt ut og bommer på a."
    >
      <Choice
        value={rule}
        onChange={setRule}
        options={[
          { id: "deadline", label: "tidligst frist" },
          { id: "short", label: "kortest først" },
        ]}
      />
      <Player
        frames={frames}
        resetKey={rule}
        render={(frame) => (
          <>
            <Gantt
              t0={0}
              t1={end}
              marks={LATE.filter((j) => j.d <= end).map((j) => ({ t: j.d }))}
              rows={[{
                bars: frame.plan.map((p) => ({
                  s: p.start,
                  f: p.end,
                  text: p.late ? `${p.id} +${p.late}` : p.id,
                  fill: p.late ? "#9d2c24" : "#1d4e89",
                  ink: "#fffdf8",
                })),
              }]}
            />
            <p className="mono">maks forsinkelse {frame.maxL}. Stiplede linjer er frister, a sin er ved 4.</p>
          </>
        )}
      />
    </Page>
  );
}
