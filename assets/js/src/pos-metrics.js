// The examples supply aligned symbolic records, so every displayed value is reproducible.
export function jaccard(a, b) {
  const left = new Set(a), right = new Set(b);
  const union = new Set([...left, ...right]);
  if (!union.size) return 0;
  let intersection = 0;
  left.forEach(value => { if (right.has(value)) intersection++; });
  return 1 - intersection / union.size;
}

export function worldDistance(a, b) {
  return ["entities", "states", "relations"].reduce((sum, key) => sum + jaccard(a[key], b[key]), 0) / 3;
}

export function diagnosticChange(previous, current) {
  const ids = new Set([...Object.keys(previous), ...Object.keys(current)]);
  let total = 0;
  ids.forEach(id => { total += Math.abs((current[id] || 0) - (previous[id] || 0)); });
  return total / 2;
}

export function persistence(gapSets) {
  const first = new Set(gapSets[0]);
  if (!first.size) return 0;
  const remaining = [...first].filter(id => gapSets.every(gaps => gaps.includes(id)));
  return remaining.length / first.size;
}

export function health(p, s, r) { return 1 - p * Math.max(s, r); }

export function recurrence(worlds, maxLag = 4, threshold = .15) {
  const comparisons = [];
  for (let lag = 1; lag <= Math.min(maxLag, worlds.length - 1); lag++) {
    const pairs = worlds.slice(lag).map((world, i) => {
      const distance = worldDistance(world, worlds[i]);
      return {from: i, to: i + lag, distance, repeated: distance <= threshold};
    });
    comparisons.push({lag, pairs, rate: pairs.filter(pair => pair.repeated).length / pairs.length});
  }
  const best = comparisons.reduce((winner, item) => item.rate > winner.rate ? item : winner, {lag: 1, rate: 0, pairs: []});
  return {value: best.rate, lag: best.lag, comparisons};
}

export function measure(frames, count, mode, windowSize = 8) {
  const end = Math.max(0, Math.min(count, frames.length - 1));
  const start = Math.max(1, end - windowSize + 1);
  const transitions = frames.slice(start, end + 1).map((frame, i) => {
    const change = diagnosticChange(frames[start + i - 1].confidence, frame.confidence);
    return {index: start + i, change, progress: mode === "diagnosis" ? Number(change > .30) : frame.executionProgress};
  });
  // The current gap's projection is supplied for every historical frame in this example.
  const window = frames.slice(start, end + 1);
  if (!window.length) return {ready: false, transitions, pE: 0, pA: 0, p: 0, s: 0, r: 0, h: null, recurrence: {comparisons: []}};
  const pE = persistence(window.map(frame => frame.epistemic));
  const pA = persistence(window.map(frame => frame.achievement));
  const p = Math.max(pE, pA);
  const s = 1 - transitions.reduce((sum, transition) => sum + transition.progress, 0) / transitions.length;
  const repeated = recurrence(window.map(frame => frame.projection));
  return {ready: transitions.length === windowSize, transitions, pE, pA, p, s, r: repeated.value, h: health(p, s, repeated.value), recurrence: repeated};
}

export function exampleFrames(kind, mode) {
  return Array.from({length: 9}, (_, i) => {
    const stage = kind === "cycle" ? i % 2 : kind === "static" || kind === "drift" ? 0 : i;
    const advancing = kind === "advancing" || kind === "cycle";
    const token = advancing ? `supported-state-${stage}` : kind === "stagnant" ? `weak-clue-${stage}` : "unchanged-state";
    const confidence = {[token]: advancing ? .8 : .1};
    const label = kind === "cycle" ? stage ? "B" : "A" : kind === "static" || kind === "drift" ? "A" : String.fromCharCode(65 + i);
    return {
      label, confidence,
      epistemic: mode === "diagnosis" ? ["distinguish-causes"] : [],
      achievement: mode === "execution" ? ["fulfill-goal"] : [],
      projection: {entities: ["task-entity"], states: [token], relations: [`supports:${token}`]},
      executionProgress: Number(advancing),
      record: kind === "drift" ? `Unrelated record ${i + 1}` : kind === "stagnant" ? `Weak clue ${i + 1}` : kind === "static" ? "Same observation" : kind === "cycle" ? `Supported interpretation ${label}` : `Supported milestone ${i + 1}`
    };
  });
}
