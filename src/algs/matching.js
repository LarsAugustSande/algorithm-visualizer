// Gale–Shapley. Venstre side søker, høyre side holder på den de liker best så langt.
// Lavere indeks i prefs er bedre.

export const LECTURE_SIDES = {
  students: [
    { id: "s1", prefs: ["h1", "h2", "h3"] },
    { id: "s2", prefs: ["h2", "h1", "h3"] },
    { id: "s3", prefs: ["h1", "h2", "h3"] },
  ],
  hospitals: [
    { id: "h1", prefs: ["s2", "s1", "s3"] },
    { id: "h2", prefs: ["s1", "s2", "s3"] },
    { id: "h3", prefs: ["s1", "s2", "s3"] },
  ],
};

export function gale(left, right) {
  const rankR = {};
  for (const r of right) {
    rankR[r.id] = {};
    r.prefs.forEach((id, i) => {
      rankR[r.id][id] = i;
    });
  }

  const matchL = {};
  const matchR = {};
  const next = {};
  for (const p of left) {
    matchL[p.id] = null;
    next[p.id] = 0;
  }
  for (const r of right) matchR[r.id] = null;

  const frames = [];
  const snap = (note, proposal) => {
    frames.push({
      note,
      proposal: proposal || null,
      matchL: { ...matchL },
      next: { ...next },
    });
  };

  snap("Ingen er matchet. Den som står til venstre søker, i den rekkefølgen de selv har satt opp.");

  const free = () => left.find((p) => matchL[p.id] == null && next[p.id] < p.prefs.length);

  let guard = 0;
  while (guard++ < left.length * right.length + 2) {
    const p = free();
    if (!p) break;
    const rId = p.prefs[next[p.id]];
    next[p.id] += 1;
    const current = matchR[rId];
    if (current == null) {
      matchR[rId] = p.id;
      matchL[p.id] = rId;
      snap(`${p.id} søker ${rId}. ${rId} er ledig og sier ja.`, {
        l: p.id,
        r: rId,
        outcome: "ja",
      });
    } else if (rankR[rId][p.id] < rankR[rId][current]) {
      matchL[current] = null;
      matchR[rId] = p.id;
      matchL[p.id] = rId;
      snap(
        `${p.id} søker ${rId}. ${rId} foretrekker ${p.id} fremfor ${current}, så ${current} blir ledig igjen.`,
        { l: p.id, r: rId, outcome: "bytte", dropped: current }
      );
    } else {
      snap(`${p.id} søker ${rId}. ${rId} holder på ${current}, og ${p.id} får nei.`, {
        l: p.id,
        r: rId,
        outcome: "nei",
      });
    }
  }

  snap("Ingen ledige søkere med flere igjen på lista. Matchingen er perfekt og stabil.", null);
  return frames;
}
