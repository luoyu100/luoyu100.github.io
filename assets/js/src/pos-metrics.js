// Aligned symbolic records keep the mechanism examples reproducible.
function jaccard(a, b) {
  const left = new Set(a), right = new Set(b);
  const union = /* @__PURE__ */ new Set([...left, ...right]);
  if (!union.size) return 0;
  let intersection = 0;
  left.forEach((value) => {
    if (right.has(value)) intersection++;
  });
  return 1 - intersection / union.size;
}
function worldDistance(a, b) {
  return ["entities", "states", "relations"].reduce((sum, key) => sum + jaccard(a[key], b[key]), 0) / 3;
}
function diagnosticChange(previous, current) {
  const ids = /* @__PURE__ */ new Set([...Object.keys(previous), ...Object.keys(current)]);
  let total = 0;
  ids.forEach((id) => {
    total += Math.abs((current[id] || 0) - (previous[id] || 0));
  });
  return total / 2;
}
function persistence(gapSets) {
  const first = new Set(gapSets[0]);
  if (!first.size) return 0;
  const remaining = [...first].filter((id) => gapSets.every((gaps) => gaps.includes(id)));
  return remaining.length / first.size;
}
function health(p, s, r) {
  return 1 - p * Math.max(s, r);
}
function recurrence(worlds, maxLag = 4, threshold = 0.15) {
  const comparisons = [];
  for (let lag = 1; lag <= Math.min(maxLag, worlds.length - 1); lag++) {
    const pairs = worlds.slice(lag).map((world, i) => {
      const distance = worldDistance(world, worlds[i]);
      return { from: i, to: i + lag, distance, repeated: distance <= threshold };
    });
    comparisons.push({ lag, pairs, rate: pairs.filter((pair) => pair.repeated).length / pairs.length });
  }
  const best = comparisons.reduce((winner, item) => item.rate > winner.rate ? item : winner, { lag: 1, rate: 0, pairs: [] });
  return { value: best.rate, lag: best.lag, comparisons };
}
function measure(frames, count, mode, windowSize = 8) {
  const end = Math.max(0, Math.min(count, frames.length - 1));
  const start = Math.max(1, end - windowSize + 1);
  const transitions = frames.slice(start, end + 1).map((frame, i) => {
    const change = diagnosticChange(frames[start + i - 1].confidence, frame.confidence);
    return { index: start + i, change, progress: mode === "diagnosis" ? Number(change > 0.3) : frame.executionProgress };
  });
  // Historical worlds share the current gap's projection in these examples.
  const window = frames.slice(start, end + 1);
  if (!window.length) return { ready: false, transitions, pE: 0, pA: 0, p: 0, s: 0, r: 0, h: null, recurrence: { comparisons: [] } };
  const pE = persistence(window.map((frame) => frame.epistemic));
  const pA = persistence(window.map((frame) => frame.achievement));
  const p = Math.max(pE, pA);
  const s = 1 - transitions.reduce((sum, transition) => sum + transition.progress, 0) / transitions.length;
  const repeated = recurrence(window.map((frame) => frame.projection));
  return { ready: transitions.length === windowSize, transitions, pE, pA, p, s, r: repeated.value, h: health(p, s, repeated.value), recurrence: repeated };
}
function exampleFrames(kind, mode) {
  return Array.from({ length: 9 }, (_, i) => {
    const stage = kind === "cycle" ? i % 2 : kind === "static" || kind === "drift" ? 0 : i;
    const advancing = kind === "advancing" || kind === "cycle";
    const token = advancing ? `supported-state-${stage}` : kind === "stagnant" ? `weak-clue-${stage}` : "unchanged-state";
    const confidence = { [token]: advancing ? 0.8 : 0.1 };
    const label = kind === "cycle" ? stage ? "B" : "A" : kind === "static" || kind === "drift" ? "A" : String.fromCharCode(65 + i);
    return {
      label,
      confidence,
      epistemic: mode === "diagnosis" ? ["distinguish-causes"] : [],
      achievement: mode === "execution" ? ["fulfill-goal"] : [],
      projection: { entities: ["task-entity"], states: [token], relations: [`supports:${token}`] },
      executionProgress: Number(advancing),
      record: kind === "drift" ? `Unrelated record ${i + 1}` : kind === "stagnant" ? `Weak clue ${i + 1}` : kind === "static" ? "Same observation" : kind === "cycle" ? `Supported interpretation ${label}` : `Supported milestone ${i + 1}`
    };
  });
}
function workedFrames(mode) {
  const diagnostic = mode === "diagnosis";
  const confidence = [{ database: 0.6, jvm: 0.4 }, { database: 0.55, jvm: 0.45 }, { database: 0.5, jvm: 0.5 }, { database: 0.2, jvm: 0.85 }, { database: 0.15, jvm: 0.9 }];
  const locations = ["counter", "held", "held", "microwave", "microwave"];
  const doors = ["closed", "closed", "open", "open", "closed"];
  const actions = diagnostic ? ["Read the incident alert", "Locate the slow service", "Inspect garbage collection", "Compare CPU and GC activity", "Check the same log interval"] : ["Inspect the mug", "Take the mug", "Open the microwave", "Place the mug inside", "Close the microwave"];
  const observations = diagnostic ? ["Inventory requests are slow.", "The delay is concentrated in inventory.", "GC activity coincides with the delay.", "CPU and GC evidence strengthen JVM-side processing.", "More delay messages leave the diagnostic distinction open."] : ["The mug is cold and on the counter.", "The mug is held by the agent.", "The microwave door is open.", "The mug is inside the microwave, still cold.", "The door is closed; the mug is still cold."];
  return Array.from({ length: 17 }, (_, i) => {
    const stage = Math.min(i, 4);
    const projection = diagnostic ? { entities: ["inventory", "database", "JVM"], states: [["requests slow"], ["inventory slow"], ["inventory slow", "GC high"], ["GC high", "CPU high"], ["GC high", "CPU high"]][stage], relations: ["investigate:inventory"] } : { entities: ["mug", "microwave"], states: ["mug cold", `door ${doors[stage]}`], relations: [`mug:${locations[stage]}`] };
    return {
      label: String.fromCharCode(65 + (diagnostic ? Math.min(stage, 3) : stage)),
      confidence: diagnostic ? confidence[stage] : {},
      epistemic: diagnostic ? i < 3 ? ["locate-delay", "distinguish-causes"] : ["distinguish-causes"] : [],
      achievement: diagnostic ? [] : i < 3 ? ["place-mug", "heat-mug"] : ["heat-mug"],
      projection,
      executionProgress: Number(i > 0 && i <= 4),
      action: i > 4 ? diagnostic ? "Search another log interval" : "Inspect the microwave again" : actions[stage],
      observation: observations[stage],
      record: i > 4 ? "Same relevant state" : actions[stage]
    };
  });
}
function recoveryFrames(frames, mode, resolved) {
  const previous = frames[frames.length - 1];
  const diagnostic = mode === "diagnosis";
  const frame = {
    ...previous,
    label: "New",
    executionProgress: 1,
    confidence: diagnostic ? { database: 0.05, jvm: 0.95 } : {},
    epistemic: resolved && diagnostic ? ["identify-final-type"] : previous.epistemic,
    achievement: resolved && !diagnostic ? [] : previous.achievement,
    projection: diagnostic ? { entities: ["inventory", "database", "JVM"], states: ["GC high", "CPU high", resolved ? "JVM processing distinguished" : "CPU sample acquired"], relations: ["investigate:inventory", "sample:JVM"] } : { entities: ["mug", "microwave"], states: [resolved ? "mug hot" : "heating started", "door closed"], relations: ["mug:microwave"] },
    action: diagnostic ? "Inspect CPU samples" : "Heat the mug",
    observation: diagnostic ? resolved ? "CPU samples distinguish JVM processing from database waiting." : "A CPU sample adds relevant evidence; the distinction still needs validation." : resolved ? "The environment reports that the mug is hot." : "Heating starts. The mug's temperature is not yet confirmed."
  };
  return [...frames, frame];
}
export {
  diagnosticChange,
  exampleFrames,
  health,
  jaccard,
  measure,
  persistence,
  recoveryFrames,
  recurrence,
  workedFrames,
  worldDistance
};
