function coinOptimum(amount, denoms) {
  const dp = Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let x = 1; x <= amount; x++) {
    for (const c of denoms) {
      if (c <= x) dp[x] = Math.min(dp[x], dp[x - c] + 1);
    }
  }
  return dp[amount];
}

export function coins(amount, denoms) {
  const desc = denoms.slice().sort((a, b) => b - a);
  const taken = [];
  let left = amount;
  const frames = [];
  const opt = coinOptimum(amount, denoms);
  frames.push({
    left,
    taken: [],
    picked: null,
    note: `Skal veksle ${amount} kr. Ta største mynten som ikke er for stor.`,
  });
  let guard = 0;
  while (left > 0 && guard++ < 100) {
    const c = desc.find((d) => d <= left);
    if (c == null) break;
    taken.push(c);
    left -= c;
    frames.push({
      left,
      taken: taken.slice(),
      picked: c,
      note:
        left === 0
          ? `Tar ${c}. Ferdig, ${taken.length} mynter.`
          : `Tar ${c}. ${left} kr igjen.`,
    });
  }
  const last = frames[frames.length - 1];
  if (taken.length > opt) {
    last.note = `Grådig brukte ${taken.length} mynter. Færrest mulig er ${opt}. Største-først er ikke optimalt for dette myntsettet.`;
  } else {
    last.note = `${taken.length} mynter. For {${desc.join(", ")}} treffer grådig optimum, som er ${opt}.`;
  }
  last.optimum = opt;
  return frames;
}

function byFinish(jobs) {
  return jobs.slice().sort((a, b) => a.f - b.f || a.s - b.s);
}

function byStart(jobs) {
  return jobs.slice().sort((a, b) => a.s - b.s || a.f - b.f);
}

export function schedule(jobs, rule) {
  const ordered = rule === "start" ? byStart(jobs) : byFinish(jobs);
  const chosen = [];
  let last = -Infinity;
  const frames = [];
  const name = rule === "start" ? "tidligst start" : "tidligst ferdig";
  frames.push({
    chosen: [],
    current: null,
    rejected: [],
    note: `Sortert etter ${name}. Gå gjennom jobbene i den rekkefølgen.`,
  });
  const rejected = [];
  for (const job of ordered) {
    if (job.s >= last) {
      chosen.push(job.id);
      last = job.f;
      frames.push({
        chosen: chosen.slice(),
        current: job.id,
        rejected: rejected.slice(),
        note: `Tar ${job.id} (${job.s}–${job.f}). Neste må starte tidligst ved ${job.f}.`,
      });
    } else {
      rejected.push(job.id);
      frames.push({
        chosen: chosen.slice(),
        current: job.id,
        rejected: rejected.slice(),
        note: `${job.id} (${job.s}–${job.f}) overlapper forrige valgte, som slutter ${last}. Hopper over.`,
      });
    }
  }
  frames.push({
    chosen,
    current: null,
    rejected,
    note: `Valgte ${chosen.length}: ${chosen.join(", ") || "ingen"}.`,
  });
  return frames;
}

// Dobbel-grådig, som på slidene: fyll én maskin med tidligst-ferdig, gjenta på resten.
export function partition(jobs) {
  let rest = jobs.slice();
  const machines = [];
  const frames = [];
  frames.push({
    machines: [],
    rest: rest.map((j) => j.id),
    current: null,
    note: "Fyll maskin 1 med tidligst-ferdig på alle jobbene. Så maskin 2 på det som er igjen.",
  });
  let guard = 0;
  while (rest.length && guard++ < jobs.length + 1) {
    const ordered = byFinish(rest);
    const take = [];
    let last = -Infinity;
    for (const job of ordered) {
      if (job.s >= last) {
        take.push(job);
        last = job.f;
        frames.push({
          machines: machines.map((m) => m.slice()),
          rest: rest.map((j) => j.id),
          current: job.id,
          tentative: take.map((j) => j.id),
          note: `${job.id} får plass på maskinen som fylles nå.`,
        });
      } else {
        frames.push({
          machines: machines.map((m) => m.slice()),
          rest: rest.map((j) => j.id),
          current: job.id,
          tentative: take.map((j) => j.id),
          note: `${job.id} overlapper her, og blir igjen til neste maskin.`,
        });
      }
    }
    const ids = new Set(take.map((j) => j.id));
    machines.push(take.map((j) => j.id));
    rest = rest.filter((j) => !ids.has(j.id));
    frames.push({
      machines: machines.map((m) => m.slice()),
      rest: rest.map((j) => j.id),
      current: null,
      note: `Maskin ${machines.length}: ${take.map((j) => j.id).join(", ")}. ${rest.length} jobber igjen.`,
    });
  }
  return frames;
}

export function depthOf(jobs) {
  const times = [];
  for (const j of jobs) {
    times.push(j.s, j.f);
  }
  let best = 0;
  for (const t of times) {
    let k = 0;
    for (const j of jobs) if (j.s <= t && t < j.f) k += 1;
    // also check just inside
    best = Math.max(best, k);
  }
  // sweep a bit more carefully at every start
  for (const j of jobs) {
    let k = 0;
    for (const o of jobs) if (o.s <= j.s && j.s < o.f) k += 1;
    best = Math.max(best, k);
  }
  return best;
}

export function lateness(jobs, rule) {
  const ordered =
    rule === "short"
      ? jobs.slice().sort((a, b) => a.t - b.t || a.d - b.d)
      : jobs.slice().sort((a, b) => a.d - b.d || a.t - b.t);
  const name = rule === "short" ? "kortest jobb først" : "tidligst frist";
  let time = 0;
  const plan = [];
  const frames = [];
  frames.push({
    plan: [],
    time: 0,
    maxL: 0,
    note: `Rekkefølge etter ${name}: ${ordered.map((j) => j.id).join(", ")}. Ingen opphold.`,
  });
  let maxL = 0;
  for (const job of ordered) {
    const start = time;
    time += job.t;
    const late = Math.max(0, time - job.d);
    maxL = Math.max(maxL, late);
    plan.push({ id: job.id, start, end: time, d: job.d, late });
    frames.push({
      plan: plan.map((p) => ({ ...p })),
      time,
      maxL,
      current: job.id,
      note:
        late > 0
          ? `${job.id} ferdig ved ${time}, frist ${job.d}, forsinkelse ${late}. Verste så langt: ${maxL}.`
          : `${job.id} ferdig ved ${time}, frist ${job.d}, i rute. Verste så langt: ${maxL}.`,
    });
  }
  frames.push({
    plan,
    time,
    maxL,
    current: null,
    note: `Maks forsinkelse er ${maxL}.`,
  });
  return frames;
}
