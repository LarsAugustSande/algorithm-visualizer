import { gale, LECTURE_SIDES } from "../src/algs/matching.js";
import { bfs, dfs, bipartite, topo, binarySearch, twoSum } from "../src/algs/search.js";
import { coins, schedule, partition, depthOf, lateness } from "../src/algs/greedy.js";
import { dijkstra, prim, kruskal, bellman, heapFrames, makeUF } from "../src/algs/spans.js";
import { sortFrames, karatsuba, closest, master } from "../src/algs/divide.js";
import { sanskrit, weighted, knapsack, editValue, segments, fitLine } from "../src/algs/dp.js";
import { maxFlow, bipartiteMatching, assignment } from "../src/algs/flow.js";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function last(frames) {
  return frames[frames.length - 1];
}

function stable(matchL, left, right) {
  const matchR = {};
  for (const p of left) {
    assert(matchL[p.id], `${p.id} er umatchet`);
    matchR[matchL[p.id]] = p.id;
  }
  const rank = (agent, other) => agent.prefs.indexOf(other);
  for (const p of left) {
    for (const r of right) {
      if (matchL[p.id] === r.id) continue;
      const pWants = rank(p, r.id) < rank(p, matchL[p.id]);
      const rWants = rank(r, p.id) < rank(r, matchR[r.id]);
      if (pWants && rWants) return false;
    }
  }
  return true;
}

const { students, hospitals } = LECTURE_SIDES;
const studentRun = last(gale(students, hospitals)).matchL;
const hospitalRun = last(gale(hospitals, students)).matchL;
assert(stable(studentRun, students, hospitals), "student-søk er ustabil");
assert(stable(hospitalRun, hospitals, students), "sykehus-søk er ustabil");
assert(studentRun.s1 === "h1" && studentRun.s2 === "h2", "student-optimal skulle være M1");
assert(hospitalRun.h1 === "s2" && hospitalRun.h2 === "s1", "sykehus-optimal skulle være M2");

const searchNodes = ["s", "a", "b", "c", "d", "e", "f"];
const searchEdges = [
  { u: "s", v: "a" },
  { u: "s", v: "b" },
  { u: "a", v: "c" },
  { u: "a", v: "d" },
  { u: "b", v: "d" },
  { u: "b", v: "e" },
  { u: "c", v: "f" },
  { u: "d", v: "f" },
  { u: "e", v: "f" },
];
const bfsEnd = last(bfs(searchNodes, searchEdges, "s"));
assert(bfsEnd.dist.s === 0 && bfsEnd.dist.a === 1 && bfsEnd.dist.f === 3, "BFS-avstander");
assert(dfs(searchNodes, searchEdges, "s").some((f) => f.kind === "ut"), "DFS backtrack");

const odd = bipartite(["a", "b", "c"], [
  { u: "a", v: "b" },
  { u: "b", v: "c" },
  { u: "c", v: "a" },
]);
assert(last(odd).conflict, "trekant skal feile");
const even = bipartite(["a", "b", "c", "d"], [
  { u: "a", v: "b" },
  { u: "b", v: "c" },
  { u: "c", v: "d" },
  { u: "d", v: "a" },
]);
assert(!last(even).conflict, "C4 er bipartitt");

const topoNodes = ["mat", "disk", "algo", "graf", "dp", "flyt"];
const topoEdges = [
  { u: "mat", v: "disk" },
  { u: "mat", v: "algo" },
  { u: "disk", v: "algo" },
  { u: "disk", v: "graf" },
  { u: "algo", v: "graf" },
  { u: "algo", v: "dp" },
  { u: "graf", v: "flyt" },
  { u: "dp", v: "flyt" },
];
const order = last(topo(topoNodes, topoEdges)).order;
assert(order.length === topoNodes.length, "topo mangler noder");
for (const e of topoEdges) assert(order.indexOf(e.u) < order.indexOf(e.v), "topo kant bakover");
const cyclic = last(topo(topoNodes, topoEdges.concat([{ u: "flyt", v: "mat" }])));
assert(cyclic.order.length < topoNodes.length, "sykel skulle stoppet topo");

const sorted = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
assert(last(binarySearch(sorted, 23)).found === 5, "binærsøk");
assert(last(binarySearch(sorted, 7)).found == null, "binærsøk bom");
assert(last(twoSum([1, 3, 4, 7, 9, 12], 16)).found.join() === "2,5" || last(twoSum([1, 3, 4, 7, 9, 12], 16)).found.join() === "3,4", "two sum");

const kr = last(coins(57, [1, 5, 10, 20]));
assert(kr.taken.join() === "20,20,10,5,1,1", "57 kr");
assert(kr.optimum === 6, "57 optimum");
const badCoins = last(coins(15, [1, 5, 10, 12]));
assert(badCoins.taken.length > badCoins.optimum, "grådig mynt skal feile");

const jobs = [
  { id: "a", s: 0, f: 10 },
  { id: "b", s: 1, f: 3 },
  { id: "c", s: 3, f: 5 },
  { id: "d", s: 5, f: 8 },
  { id: "e", s: 2, f: 6 },
];
function bruteSchedule(list) {
  let best = 0;
  const n = list.length;
  for (let mask = 0; mask < 1 << n; mask++) {
    const take = list.filter((_, i) => mask & (1 << i));
    let ok = true;
    for (let i = 0; i < take.length; i++) {
      for (let j = i + 1; j < take.length; j++) {
        if (take[i].s < take[j].f && take[j].s < take[i].f) ok = false;
      }
    }
    if (ok) best = Math.max(best, take.length);
  }
  return best;
}
assert(last(schedule(jobs, "finish")).chosen.length === bruteSchedule(jobs), "tidligst ferdig");
assert(last(schedule(jobs, "start")).chosen.length < bruteSchedule(jobs), "tidligst start skal tape");

const partJobs = [
  { id: "a", s: 0, f: 4 },
  { id: "b", s: 1, f: 3 },
  { id: "c", s: 2, f: 6 },
  { id: "d", s: 5, f: 8 },
  { id: "e", s: 7, f: 9 },
];
const part = last(partition(partJobs));
assert(part.machines.length === depthOf(partJobs), "partisjon vs dybde");

const lateJobs = [
  { id: "a", t: 4, d: 4 },
  { id: "b", t: 1, d: 100 },
  { id: "c", t: 2, d: 8 },
];
function bruteLate(list) {
  let best = Infinity;
  const n = list.length;
  const perm = [...list];
  function rec(i) {
    if (i === n) {
      let time = 0;
      let maxL = 0;
      for (const job of perm) {
        time += job.t;
        maxL = Math.max(maxL, time - job.d, 0);
      }
      best = Math.min(best, maxL);
      return;
    }
    for (let k = i; k < n; k++) {
      [perm[i], perm[k]] = [perm[k], perm[i]];
      rec(i + 1);
      [perm[i], perm[k]] = [perm[k], perm[i]];
    }
  }
  rec(0);
  return best;
}
assert(last(lateness(lateJobs, "deadline")).maxL === bruteLate(lateJobs), "EDF");
assert(last(lateness(lateJobs, "short")).maxL > bruteLate(lateJobs), "kortest først taper");

const dNodes = ["s", "a", "b", "c", "t"];
const dEdges = [
  { u: "s", v: "a", w: 2 },
  { u: "s", v: "b", w: 5 },
  { u: "a", v: "b", w: 1 },
  { u: "a", v: "c", w: 4 },
  { u: "b", v: "c", w: 1 },
  { u: "c", v: "t", w: 3 },
  { u: "b", v: "t", w: 8 },
];
const d = last(dijkstra(dNodes, dEdges, "s")).dist;
assert(d.a === 2 && d.b === 3 && d.c === 4 && d.t === 7, `dijkstra ${JSON.stringify(d)}`);
const bf = last(bellman(dNodes, dEdges, "s"));
assert(!bf.negative && bf.dist.t === 7, "bellman på ikke-negativ");

const negEdges = [
  { u: "s", v: "a", w: 4 },
  { u: "s", v: "b", w: 5 },
  { u: "a", v: "c", w: 3 },
  { u: "b", v: "a", w: -2 },
  { u: "b", v: "c", w: 4 },
];
const neg = last(bellman(["s", "a", "b", "c"], negEdges, "s"));
assert(!neg.negative && neg.dist.a === 3 && neg.dist.c === 6, `negativ kant ${JSON.stringify(neg.dist)}`);
const dijWrong = last(dijkstra(["s", "a", "b", "c"], negEdges, "s")).dist;
assert(dijWrong.a === 4 && dijWrong.a !== neg.dist.a, "dijkstra skal ta feil her");
const cyc = last(
  bellman(
    ["s", "a", "b", "c"],
    negEdges.concat([{ u: "c", v: "b", w: -5 }]),
    "s"
  )
);
assert(cyc.negative, "negativ sykel");

const mNodes = ["a", "b", "c", "d", "e", "f"];
const mEdges = [
  { u: "a", v: "b", w: 7 },
  { u: "a", v: "c", w: 2 },
  { u: "b", v: "c", w: 5 },
  { u: "b", v: "d", w: 6 },
  { u: "c", v: "d", w: 3 },
  { u: "c", v: "e", w: 8 },
  { u: "d", v: "e", w: 4 },
  { u: "d", v: "f", w: 9 },
  { u: "e", v: "f", w: 1 },
];
assert(last(prim(mNodes, mEdges, "a")).weight === 15, "prim");
assert(last(kruskal(mNodes, mEdges)).weight === 15, "kruskal");

const heap = last(heapFrames([5, 3, 8, 1, 6, 2]));
assert(heap.pulled.join() === "1,2,3,5,6,8", "haug");

const uf = makeUF(["a", "b", "c", "d", "e"]);
uf.union("a", "b", "size");
uf.union("b", "c", "compress");
const after = uf.snap();
assert(after.parent.a === after.parent.b && after.parent.b === after.parent.c, "union-find");

const arr = [4, 3, 1, 2];
assert(last(sortFrames(arr, false)).a.join() === "1,2,3,4", "mergesort");
let inv = 0;
for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) if (arr[i] > arr[j]) inv++;
assert(last(sortFrames(arr, true)).inv === inv, "inversjoner");

for (const [x, y] of [
  [1234, 5678],
  [47, 63],
  [999, 999],
  [7, 8],
]) {
  const frames = karatsuba(x, y);
  assert(last(frames).result === x * y, `karatsuba ${x}*${y}`);
}

const pts = [
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
let bestD = Infinity;
let bestP = null;
for (let i = 0; i < pts.length; i++) {
  for (let j = i + 1; j < pts.length; j++) {
    const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
    if (d < bestD) {
      bestD = d;
      bestP = [pts[i].id, pts[j].id].sort().join();
    }
  }
}
const got = last(closest(pts));
assert(Math.abs(got.best - bestD) < 1e-9, "nærmeste avstand");
assert(got.pair.slice().sort().join() === bestP, `nærmeste par ${got.pair} vs ${bestP}`);

assert(master(2, 2, 1).bound === "O(n log n)", "master mergesort");
assert(master(3, 2, 1).bound.startsWith("O(n^1.58"), "master karatsuba");
assert(master(1, 2, 0).bound === "O(log n)", "master binærsøk");
assert(master(7, 2, 2).bound.startsWith("O(n^2.80"), "master strassen");
assert(master(1, 2, 1).bound === "O(n)", "master median");

const san = sanskrit(6);
assert(san.value === 13 && san.naive > san.memoCalls, "sanskrit");

const wjobs = [
  { id: "a", s: 0, f: 3, v: 2 },
  { id: "b", s: 1, f: 5, v: 6 },
  { id: "c", s: 4, f: 7, v: 5 },
  { id: "d", s: 3, f: 8, v: 7 },
  { id: "e", s: 6, f: 10, v: 4 },
  { id: "f", s: 8, f: 11, v: 3 },
];
function bruteWeighted(list) {
  let best = 0;
  const n = list.length;
  for (let mask = 0; mask < 1 << n; mask++) {
    const take = list.filter((_, i) => mask & (1 << i));
    let ok = true;
    let val = 0;
    for (let i = 0; i < take.length; i++) {
      val += take[i].v;
      for (let j = i + 1; j < take.length; j++) {
        if (take[i].s < take[j].f && take[j].s < take[i].f) ok = false;
      }
    }
    if (ok) best = Math.max(best, val);
  }
  return best;
}
const w = last(weighted(wjobs));
assert(w.opt[w.opt.length - 1] === bruteWeighted(wjobs), `vektet ${w.opt.at(-1)} vs ${bruteWeighted(wjobs)}`);

const items = [
  { id: "a", v: 5, w: 2 },
  { id: "b", v: 6, w: 3 },
  { id: "c", v: 8, w: 4 },
  { id: "d", v: 10, w: 5 },
];
function bruteSack(list, W) {
  let best = 0;
  const n = list.length;
  for (let mask = 0; mask < 1 << n; mask++) {
    let v = 0;
    let wgt = 0;
    for (let i = 0; i < n; i++) if (mask & (1 << i)) {
      v += list[i].v;
      wgt += list[i].w;
    }
    if (wgt <= W) best = Math.max(best, v);
  }
  return best;
}
const sack = last(knapsack(items, 8));
assert(sack.dp[items.length][8] === bruteSack(items, 8), "knapsack");

assert(editValue("kitten", "sitting") === 3, "kitten");
assert(editValue("occurence", "ocurance") === 2, "forelesningens strenger");

const segPts = [
  { x: 1, y: 1.1 },
  { x: 2, y: 2.0 },
  { x: 3, y: 2.9 },
  { x: 4, y: 4.2 },
  { x: 5, y: 6.4 },
  { x: 6, y: 5.5 },
  { x: 7, y: 4.6 },
  { x: 8, y: 3.4 },
];
function bruteSeg(points, C) {
  const n = points.length;
  let best = Infinity;
  for (let mask = 0; mask < 1 << (n - 1); mask++) {
    let cost = 0;
    let start = 0;
    for (let i = 0; i < n; i++) {
      const cut = i === n - 1 || mask & (1 << i);
      if (cut) {
        cost += fitLine(points.slice(start, i + 1)).err + C;
        start = i + 1;
      }
    }
    best = Math.min(best, cost);
  }
  return best;
}
const seg = segments(segPts, 1.5);
assert(Math.abs(seg.opt[segPts.length] - bruteSeg(segPts, 1.5)) < 1e-6, "segmenter");

const flowEdges = [
  { u: "s", v: "a", c: 4 },
  { u: "s", v: "b", c: 2 },
  { u: "a", v: "b", c: 3 },
  { u: "a", v: "t", c: 2 },
  { u: "b", v: "t", c: 4 },
];
for (const mode of ["dfs", "bfs"]) {
  const f = last(maxFlow(flowEdges, "s", "t", mode));
  assert(f.value === 6 && f.cutCap === 6, `${mode} flyt ${f.value} kutt ${f.cutCap}`);
  const nodes = ["s", "a", "b", "t"];
  for (const node of nodes) {
    if (node === "s" || node === "t") continue;
    let inn = 0;
    let ut = 0;
    for (const e of flowEdges) {
      const fl = f.flow[`${e.u}>${e.v}`] || 0;
      if (e.v === node) inn += fl;
      if (e.u === node) ut += fl;
    }
    assert(Math.abs(inn - ut) < 1e-9, `konservasjon ${node} ${mode}`);
  }
}
assert(maxFlow(flowEdges, "s", "t", "dfs").some((f) => f.pathEdges && f.pathEdges.some((e) => e.reverse)), "DFS skal angre en kant");

const match = last(
  bipartiteMatching(
    ["a", "b", "c", "d"],
    ["1", "2", "3", "4"],
    [
      { u: "a", v: "1" },
      { u: "a", v: "2" },
      { u: "b", v: "1" },
      { u: "c", v: "2" },
      { u: "c", v: "3" },
      { u: "d", v: "3" },
      { u: "d", v: "4" },
    ]
  )
);
assert(match.pairs.length === match.cover.length, "Kőnig");
for (const e of [
  ["a", "1"],
  ["a", "2"],
  ["b", "1"],
  ["c", "2"],
  ["c", "3"],
  ["d", "3"],
  ["d", "4"],
]) {
  assert(match.cover.includes(e[0]) || match.cover.includes(e[1]), `cover mister ${e}`);
}

const cost = [
  [1, 2, 9],
  [2, 4, 1],
  [3, 8, 2],
];
function bruteAssign(matrix) {
  const n = matrix.length;
  let best = Infinity;
  const p = [...Array(n).keys()];
  function rec(i) {
    if (i === n) {
      let s = 0;
      for (let r = 0; r < n; r++) s += matrix[r][p[r]];
      best = Math.min(best, s);
      return;
    }
    for (let k = i; k < n; k++) {
      [p[i], p[k]] = [p[k], p[i]];
      rec(i + 1);
      [p[i], p[k]] = [p[k], p[i]];
    }
  }
  rec(0);
  return best;
}
const asg = last(assignment(["A", "B", "C"], ["1", "2", "3"], cost));
assert(asg.total === bruteAssign(cost), `tilordning ${asg.total} vs ${bruteAssign(cost)}`);

console.log("ok");
