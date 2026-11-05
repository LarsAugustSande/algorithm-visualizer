export function sanskrit(n) {
  const P = [1, 1];
  while (P.length <= n) P.push(P[P.length - 1] + P[P.length - 2]);
  let naive = 0;
  (function f(k) {
    naive += 1;
    if (k <= 1) return 1;
    return f(k - 1) + f(k - 2);
  })(n);
  let memoCalls = 0;
  const seen = {};
  (function f(k) {
    memoCalls += 1;
    if (k <= 1) return 1;
    if (k in seen) return seen[k];
    seen[k] = f(k - 1) + f(k - 2);
    return seen[k];
  })(n);

  const pats = [[[]]];
  if (n >= 1) pats[1] = [["k"]];
  for (let i = 2; i <= Math.min(n, 8); i++) {
    pats[i] = [];
    for (const p of pats[i - 1]) pats[i].push(p.concat("k"));
    for (const p of pats[i - 2]) pats[i].push(p.concat("l"));
  }
  return {
    P: P.slice(0, n + 1),
    value: P[n],
    naive,
    memoCalls,
    patterns: n <= 8 ? pats[n] : null,
  };
}

export function callTree(n) {
  let id = 0;
  function f(k) {
    const node = { id: id++, k, children: [] };
    if (k > 1) node.children = [f(k - 1), f(k - 2)];
    return node;
  }
  return f(n);
}

function predIndex(jobs) {
  const p = [0];
  for (let j = 1; j < jobs.length; j++) {
    let i = j - 1;
    while (i >= 0 && jobs[i].f > jobs[j].s) i -= 1;
    p.push(i + 1);
  }
  return p;
}

export function weighted(jobsIn) {
  const jobs = jobsIn.slice().sort((a, b) => a.f - b.f || a.s - b.s);
  const p = predIndex(jobs);
  const opt = [0];
  const take = [false];
  const frames = [];
  frames.push({
    jobs,
    p,
    opt: [0],
    j: 0,
    take: null,
    chosen: [],
    note: "Jobbene er sortert på sluttid. OPT(0) = 0. p(j) er siste jobb som ikke overlapper j.",
  });
  for (let j = 1; j <= jobs.length; j++) {
    const job = jobs[j - 1];
    const withJob = job.v + opt[p[j - 1]];
    const without = opt[j - 1];
    const yes = withJob > without;
    opt[j] = yes ? withJob : without;
    take[j] = yes;
    frames.push({
      jobs,
      p,
      opt: opt.slice(),
      j,
      take: yes,
      withJob,
      without,
      chosen: [],
      note: yes
        ? `OPT(${j}): ta ${job.id} (verdi ${job.v} + OPT(${p[j - 1]}) = ${withJob}) fremfor å hoppe over (${without}).`
        : `OPT(${j}): hopp over ${job.id}. ${without} slår ${withJob}.`,
    });
  }
  const chosen = [];
  let j = jobs.length;
  while (j > 0) {
    if (take[j]) {
      chosen.push(jobs[j - 1].id);
      j = p[j - 1];
    } else j -= 1;
  }
  chosen.reverse();
  frames.push({
    jobs,
    p,
    opt: opt.slice(),
    j: jobs.length,
    take: null,
    chosen,
    note: `OPT(${jobs.length}) = ${opt[jobs.length]}. En optimal mengde er ${chosen.join(", ") || "tom"}.`,
  });
  return frames;
}

export function fitLine(points) {
  const n = points.length;
  if (n === 0) return { err: 0, a: 0, b: 0 };
  let sx = 0;
  let sy = 0;
  let sxx = 0;
  let sxy = 0;
  for (const p of points) {
    sx += p.x;
    sy += p.y;
    sxx += p.x * p.x;
    sxy += p.x * p.y;
  }
  const denom = n * sxx - sx * sx;
  let a = 0;
  let b = sy / n;
  if (Math.abs(denom) > 1e-9) {
    a = (n * sxy - sx * sy) / denom;
    b = (sy - a * sx) / n;
  }
  let err = 0;
  for (const p of points) {
    const d = p.y - (a * p.x + b);
    err += d * d;
  }
  return { err, a, b };
}

export function segments(points, C) {
  const n = points.length;
  const E = Array.from({ length: n }, () => Array(n).fill(0));
  const line = Array.from({ length: n }, () => Array(n).fill(null));
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      const fit = fitLine(points.slice(i, j + 1));
      E[i][j] = fit.err;
      line[i][j] = fit;
    }
  }
  const opt = [0];
  const choice = [0];
  for (let j = 1; j <= n; j++) {
    let best = Infinity;
    let arg = 1;
    for (let i = 1; i <= j; i++) {
      const cost = E[i - 1][j - 1] + C + opt[i - 1];
      if (cost < best) {
        best = cost;
        arg = i;
      }
    }
    opt[j] = best;
    choice[j] = arg;
  }
  const segs = [];
  let j = n;
  while (j > 0) {
    const i = choice[j];
    segs.push({ i, j, ...line[i - 1][j - 1] });
    j = i - 1;
  }
  segs.reverse();
  return { opt, choice, segs, E };
}

export function knapsack(items, W) {
  const n = items.length;
  const dp = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0));
  const take = Array.from({ length: n + 1 }, () => Array(W + 1).fill(false));
  const frames = [];
  frames.push({
    dp: dp.map((row) => row.slice()),
    i: 0,
    w: 0,
    take: null,
    note: "Rad 0 er tom sekk. OPT(0, w) = 0 for alle vekter.",
  });
  for (let i = 1; i <= n; i++) {
    const it = items[i - 1];
    for (let w = 0; w <= W; w++) {
      const skip = dp[i - 1][w];
      let best = skip;
      let took = false;
      let withIt = null;
      if (it.w <= w) {
        withIt = it.v + dp[i - 1][w - it.w];
        if (withIt > skip) {
          best = withIt;
          took = true;
        }
      }
      dp[i][w] = best;
      take[i][w] = took;
      const note = took
        ? `OPT(${i}, ${w}): ta ${it.id} (vekt ${it.w}, verdi ${it.v}). ${it.v} + OPT(${i - 1}, ${w - it.w}) = ${withIt}, bedre enn ${skip}.`
        : it.w > w
          ? `OPT(${i}, ${w}): ${it.id} veier ${it.w}, for tungt. Behold ${skip}.`
          : `OPT(${i}, ${w}): la ${it.id} ligge. ${skip} slår ${withIt}.`;
      frames.push({
        dp: dp.map((row) => row.slice()),
        i,
        w,
        take: took,
        note,
      });
    }
  }
  const chosen = [];
  let w = W;
  for (let i = n; i >= 1; i--) {
    if (take[i][w]) {
      chosen.push(items[i - 1].id);
      w -= items[i - 1].w;
    }
  }
  chosen.reverse();
  frames.push({
    dp: dp.map((row) => row.slice()),
    i: n,
    w: W,
    take: null,
    chosen,
    note: `OPT(${n}, ${W}) = ${dp[n][W]}. Med: ${chosen.join(", ") || "ingenting"}.`,
  });
  return frames;
}

export function editDistance(S, T) {
  const n = S.length;
  const m = T.length;
  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(null));
  for (let i = 0; i <= n; i++) dp[i][0] = i;
  for (let j = 0; j <= m; j++) dp[0][j] = j;
  const frames = [];
  const clone = () => dp.map((row) => row.slice());
  frames.push({
    dp: clone(),
    i: 0,
    j: 0,
    op: "start",
    note: "Første rad og kolonne er rene innsettinger og slettinger. Tom mot tom koster 0.",
  });
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const si = S[i - 1];
      const tj = T[j - 1];
      let op;
      if (si === tj) {
        dp[i][j] = dp[i - 1][j - 1];
        op = "lik";
      } else {
        const sub = dp[i - 1][j - 1] + 1;
        const del = dp[i - 1][j] + 1;
        const ins = dp[i][j - 1] + 1;
        dp[i][j] = Math.min(sub, del, ins);
        if (dp[i][j] === sub) op = "bytt";
        else if (dp[i][j] === del) op = "slett";
        else op = "settinn";
      }
      const note =
        op === "lik"
          ? `${si} = ${tj}. Diagonalen er gratis, OPT = ${dp[i][j]}.`
          : op === "bytt"
            ? `Bytt ${si} mot ${tj}. Kostnad 1 + ${dp[i][j] - 1} = ${dp[i][j]}.`
            : op === "slett"
              ? `Slett ${si}. Kostnad 1 + raden over = ${dp[i][j]}.`
              : `Sett inn ${tj}. Kostnad 1 + cellen til venstre = ${dp[i][j]}.`;
      frames.push({ dp: clone(), i, j, op, note });
    }
  }

  let i = n;
  let j = m;
  const top = [];
  const bot = [];
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && S[i - 1] === T[j - 1] && dp[i][j] === dp[i - 1][j - 1]) {
      top.push(S[i - 1]);
      bot.push(T[j - 1]);
      i -= 1;
      j -= 1;
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      top.push(S[i - 1]);
      bot.push(T[j - 1]);
      i -= 1;
      j -= 1;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      top.push(S[i - 1]);
      bot.push("–");
      i -= 1;
    } else {
      top.push("–");
      bot.push(T[j - 1]);
      j -= 1;
    }
  }
  top.reverse();
  bot.reverse();
  const last = frames[frames.length - 1];
  last.align = [top.join(" "), bot.join(" ")];
  last.note = `Avstand ${dp[n][m]}. En justering: ${top.join(" ")}  mot  ${bot.join(" ")}.`;
  return frames;
}

export function editValue(S, T) {
  const frames = editDistance(S, T);
  const dp = frames[frames.length - 1].dp;
  return dp[S.length][T.length];
}
