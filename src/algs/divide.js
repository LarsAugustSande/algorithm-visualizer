export function sortFrames(input, countInv = false) {
  const a = input.slice();
  const frames = [];
  let inv = 0;

  function snap(extra, note) {
    frames.push({ a: a.slice(), inv, ...extra, note });
  }

  function sort(lo, hi) {
    if (hi - lo <= 1) return;
    const mid = (lo + hi) >> 1;
    snap(
      { lo, hi, mid, phase: "split" },
      `Del indeks ${lo}–${hi - 1} i ${lo}–${mid - 1} og ${mid}–${hi - 1}.`
    );
    sort(lo, mid);
    sort(mid, hi);
    const tmp = [];
    let i = lo;
    let j = mid;
    while (i < mid || j < hi) {
      if (j >= hi || (i < mid && a[i] <= a[j])) {
        const take = a[i];
        tmp.push(take);
        i += 1;
        snap(
          { lo, hi, mid, phase: "merge", tmp: tmp.slice(), i, j, take: "left" },
          `Flett: ta ${take} fra venstre halvdel.`
        );
      } else {
        const take = a[j];
        const jumped = mid - i;
        tmp.push(take);
        if (countInv) inv += jumped;
        j += 1;
        snap(
          { lo, hi, mid, phase: "merge", tmp: tmp.slice(), i, j, take: "right", jumped },
          countInv
            ? `${take} fra høyre står foran ${jumped} tall i venstre. ${jumped} inversjoner, sum ${inv}.`
            : `Flett: ta ${take} fra høyre halvdel.`
        );
      }
    }
    for (let k = 0; k < tmp.length; k++) a[lo + k] = tmp[k];
    snap(
      { lo, hi, mid, phase: "write", tmp: tmp.slice() },
      `Skriv ${tmp.join(" ")} tilbake på plass ${lo}–${hi - 1}.`
    );
  }

  sort(0, a.length);
  snap(
    { phase: "done", lo: 0, hi: a.length },
    countInv ? `Sortert. Antall inversjoner er ${inv}.` : `Sortert: ${a.join(" ")}.`
  );
  return frames;
}

export function karatsuba(a, b) {
  const frames = [];
  function rec(x, y, depth, path) {
    const here = path.concat([{ x, y }]);
    const xs = String(Math.abs(x));
    const ys = String(Math.abs(y));
    const n = Math.max(xs.length, ys.length);
    if (n <= 2) {
      const result = x * y;
      frames.push({
        kind: "base",
        depth,
        path: here,
        x,
        y,
        result,
        note: `${x} · ${y} er kort nok. Regn det rett ut: ${result}.`,
      });
      return result;
    }
    const m = Math.ceil(n / 2);
    const p = 10 ** m;
    const A1 = Math.floor(x / p);
    const A0 = x % p;
    const B1 = Math.floor(y / p);
    const B0 = y % p;
    frames.push({
      kind: "split",
      depth,
      path: here,
      x,
      y,
      m,
      A1,
      A0,
      B1,
      B0,
      note: `Del ${x} og ${y} ved 10^${m}. ${x} = ${A1}·10^${m} + ${A0}, ${y} = ${B1}·10^${m} + ${B0}. Tre kall, ikke fire.`,
    });
    const z2 = rec(A1, B1, depth + 1, here);
    const z0 = rec(A0, B0, depth + 1, here);
    const z1raw = rec(A1 + A0, B1 + B0, depth + 1, here);
    const z1 = z1raw - z2 - z0;
    const result = z2 * 10 ** (2 * m) + z1 * 10 ** m + z0;
    frames.push({
      kind: "combine",
      depth,
      path: here,
      x,
      y,
      m,
      z2,
      z0,
      z1,
      z1raw,
      result,
      note: `z2 = ${z2}, z0 = ${z0}, z1 = ${z1raw} − ${z2} − ${z0} = ${z1}. ${x}·${y} = ${z2}·10^${2 * m} + ${z1}·10^${m} + ${z0} = ${result}.`,
    });
    return result;
  }
  const result = rec(a, b, 0, []);
  frames[frames.length - 1].final = true;
  frames.result = result;
  return frames;
}

export function closest(points) {
  const pts = points.slice().sort((p, q) => p.x - q.x || p.y - q.y);
  const frames = [];

  function dist(p, q) {
    return Math.hypot(p.x - q.x, p.y - q.y);
  }

  function rec(px) {
    const ids = px.map((p) => p.id);
    if (px.length <= 3) {
      let best = Infinity;
      let pair = null;
      for (let i = 0; i < px.length; i++) {
        for (let j = i + 1; j < px.length; j++) {
          const d = dist(px[i], px[j]);
          if (d < best) {
            best = d;
            pair = [px[i].id, px[j].id];
          }
        }
      }
      frames.push({
        phase: "base",
        active: ids,
        best,
        pair,
        note:
          pair == null
            ? "Mindre enn to punkter her."
            : `Få punkter, sjekk alle par. Nærmest i denne biten: ${pair.join(" og ")} (${best.toFixed(2)}).`,
      });
      return { best, pair };
    }
    const mid = px.length >> 1;
    const L = px.slice(0, mid);
    const R = px.slice(mid);
    const midx = (px[mid - 1].x + px[mid].x) / 2;
    frames.push({
      phase: "split",
      active: ids,
      midx,
      best: null,
      pair: null,
      note: `Del på x = ${midx.toFixed(2)}. Venstre ${L.map((p) => p.id).join(" ")}, høyre ${R.map((p) => p.id).join(" ")}.`,
    });
    const left = rec(L);
    const right = rec(R);
    let best = left.best;
    let pair = left.pair;
    let from = "venstre";
    if (right.best < best) {
      best = right.best;
      pair = right.pair;
      from = "høyre";
    }
    const strip = px.filter((p) => Math.abs(p.x - midx) < best).sort((p, q) => p.y - q.y);
    frames.push({
      phase: "strip",
      active: ids,
      midx,
      strip: strip.map((p) => p.id),
      best,
      pair,
      checking: null,
      note: `Beste inni en halvdel er ${best.toFixed(2)} (${from}). Stripen har bare punkter nærmere delelinjen enn det: ${strip.map((p) => p.id).join(" ") || "ingen"}.`,
    });
    for (let i = 0; i < strip.length; i++) {
      for (let j = i + 1; j < strip.length && strip[j].y - strip[i].y < best; j++) {
        const d = dist(strip[i], strip[j]);
        if (d < best) {
          best = d;
          pair = [strip[i].id, strip[j].id];
          frames.push({
            phase: "strip",
            active: ids,
            midx,
            strip: strip.map((p) => p.id),
            best,
            pair,
            checking: pair,
            note: `${pair.join(" og ")} krysser delelinjen og er nærmere: ${d.toFixed(2)}.`,
          });
        }
      }
    }
    return { best, pair };
  }

  const ans = rec(pts);
  frames.push({
    phase: "done",
    active: pts.map((p) => p.id),
    best: ans.best,
    pair: ans.pair,
    note: `Nærmeste par er ${ans.pair.join(" og ")}, avstand ${ans.best.toFixed(2)}.`,
  });
  return frames;
}

export function master(a, b, d) {
  const bd = b ** d;
  const scale = Math.max(1, Math.abs(bd), Math.abs(a));
  const diff = a - bd;
  let cmp = 0;
  if (Math.abs(diff) > 1e-9 * scale) cmp = diff < 0 ? -1 : 1;
  const logba = Math.log(a) / Math.log(b);
  const pretty = (x) => {
    if (Math.abs(x - Math.round(x)) < 1e-9) return String(Math.round(x));
    return (Math.round(x * 1000) / 1000).toString();
  };
  if (cmp < 0) {
    const bound = d === 0 ? "O(1)" : d === 1 ? "O(n)" : `O(n^${pretty(d)})`;
    return { cmp, logba, bd, bound, name: "roten dominerer", why: "d > log_b(a), altså a < b^d. Kostnaden per nivå synker geometrisk." };
  }
  if (cmp === 0) {
    const bound = d === 0 ? "O(log n)" : d === 1 ? "O(n log n)" : `O(n^${pretty(d)} log n)`;
    return { cmp, logba, bd, bound, name: "like store nivåer", why: "d = log_b(a), altså a = b^d. Hvert nivå koster like mye, og det er log_b(n) nivåer." };
  }
  return {
    cmp,
    logba,
    bd,
    bound: `O(n^${pretty(logba)})`,
    name: "bladene dominerer",
    why: "d < log_b(a), altså a > b^d. Kostnaden vokser nedover treet.",
  };
}
