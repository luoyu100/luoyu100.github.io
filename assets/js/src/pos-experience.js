import {exampleFrames, measure, worldDistance} from "./pos-metrics.js";

const root = document.querySelector("[data-pos-project]");
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const experience = root && JSON.parse(root.querySelector("[data-pos-experience]").textContent);
const format = value => value.toFixed(2);
const write = (host, selector, value) => { host.querySelector(selector).textContent = value; };

function animate(element, frames, duration = 650) {
  if (!reduced.matches) return element.animate(frames, {duration, easing: "cubic-bezier(.22,.75,.25,1)"});
}

function tabs(buttons, selected) {
  buttons.forEach(button => {
    const active = button === selected;
    button.setAttribute("aria-selected", String(active)); button.tabIndex = active ? 0 : -1;
  });
}

function playback(host, length, duration, render, initial = 0) {
  const controls = host.querySelector(".pos-exhibit-controls");
  const play = controls.querySelector("[data-exhibit-play]");
  const range = controls.querySelector("[data-exhibit-range]");
  const previous = controls.querySelector("[data-exhibit-prev]");
  const next = controls.querySelector("[data-exhibit-next]");
  let index = initial, intended = false, seen = false, startedOnce = false, timer = 0, started = 0, remaining = duration;
  function buttons() {
    host.classList.toggle("is-playing", intended && seen && !document.hidden);
    play.setAttribute("aria-pressed", String(intended));
    play.setAttribute("aria-label", intended ? "Pause demonstration" : "Play demonstration");
    play.title = intended ? "Pause" : "Play";
    play.firstElementChild.className = "fas " + (intended ? "fa-pause" : "fa-play");
    range.value = index; previous.disabled = index === 0; next.disabled = index === length - 1;
  }
  function suspend() {
    host.classList.remove("is-playing");
    if (timer) remaining = Math.max(0, remaining - (performance.now() - started));
    clearTimeout(timer); timer = 0;
  }
  function queue() {
    buttons();
    if (!intended || !seen || document.hidden || timer) return;
    started = performance.now();
    timer = setTimeout(() => { timer = 0; remaining = duration; show(index + 1); queue(); }, remaining);
  }
  function show(value, reset = false) {
    index = Math.max(0, Math.min(length - 1, value));
    host.dataset.frame = index;
    render(index, reset);
    if (index === length - 1) { intended = false; suspend(); }
    buttons();
  }
  function pause() { intended = false; suspend(); buttons(); }
  function seek(value, reset = false) { startedOnce = true; pause(); remaining = duration; show(value, reset); }
  function start(reset = false) {
    startedOnce = true;
    if (reset || index === length - 1) { suspend(); remaining = duration; show(0, true); }
    intended = true; buttons(); queue();
  }
  previous.addEventListener("click", () => seek(index - 1));
  next.addEventListener("click", () => seek(index + 1));
  range.addEventListener("input", () => seek(Number(range.value)));
  play.addEventListener("click", () => intended ? pause() : start());
  controls.querySelector("[data-exhibit-replay]").addEventListener("click", () => start(true));
  new IntersectionObserver(entries => {
    seen = entries[0].isIntersecting;
    if (!seen) suspend();
    else if (!startedOnce && !reduced.matches) start(true);
    else queue();
  }, {threshold: .15}).observe(host);
  document.addEventListener("visibilitychange", () => { if (document.hidden) suspend(); else queue(); });
  reduced.addEventListener("change", () => { if (reduced.matches) pause(); });
  const controller = {seek, pause, start, refresh: () => show(index, true), get index() {return index;}, get playing() {return intended;}};
  host._posPlayback = controller;
  show(initial, true);
  return controller;
}

function perception() {
  const host = root.querySelector("[data-pos-perception]");
  let mode = "execution", frames = experience.perception;
  let previousIndex = -1, selectedFact = null;
  const locations = {counter: "On the counter", held: "Held by the agent", microwave: "Inside Microwave 1"};
  function source(frame) {
    const box = host.querySelector("[data-perception-source]");
    box.hidden = !selectedFact;
    if (!selectedFact) return;
    const i = frame.sources[selectedFact];
    box.textContent = "Observation " + String(i + 1).padStart(2, "0") + ": " + frames[i].observation;
  }
  const controller = playback(host, frames.length, 4200, (index, reset) => {
    const frame = frames[index];
    const diagnostic = mode === "diagnosis";
    host.dataset.mode = mode;
    host.querySelector("[data-perception-stage]").hidden = diagnostic;
    host.querySelector("[data-perception-diagnosis]").hidden = !diagnostic;
    write(host, "[data-perception-location-kind]", diagnostic ? "INTERPRETATION" : "RELATION");
    write(host, "[data-perception-location-entity]", diagnostic ? "Delay" : "Mug 3");
    write(host, "[data-perception-temperature-entity]", diagnostic ? "Inventory" : "Mug 3");
    write(host, "[data-perception-door-entity]", diagnostic ? "JVM evidence" : "Microwave 1");
    write(host, "[data-perception-temperature]", diagnostic ? frame.temperature : "Not hot");
    write(host, "[data-perception-gap]", diagnostic ? "Database waiting or JVM-side processing?" : "Make Mug 3 hot.");
    host.querySelector(".pos-perception-gap").classList.toggle("is-addressed", diagnostic && index >= 5);
    write(host, "[data-perception-gap-status]", diagnostic && index >= 5 ? " / Distinction supported" : " / Unresolved");
    write(host, "[data-perception-gap-note]", diagnostic ? index >= 5 ? "The combined evidence favors JVM processing. The final failure type requires further reasoning." : "The symptom is known. The alternatives still need discriminating evidence." : "The place is known. The temperature requirement is still unmet.");
    host.querySelector("[data-perception-gc]").classList.toggle("is-supported", diagnostic && index >= 2);
    host.querySelector("[data-perception-cpu]").classList.toggle("is-supported", diagnostic && index >= 5);
    write(host, "[data-perception-db]", index >= 5 ? "Less supported" : "Waiting?");
    write(host, "[data-perception-jvm]", index >= 5 ? "More supported" : "Processing?");
    write(host, "[data-perception-combination]", index >= 5 ? "CPU + GC inform a supported revision." : "Two possible explanations. Evidence must distinguish them.");
    host.querySelector("[data-perception-diagnosis]").dataset.revised = diagnostic && index >= 5;
    const list = host.querySelector("[data-perception-history]");
    list.replaceChildren();
    frames.slice(0, index + 1).forEach((item, i) => {
      const li = document.createElement("li"), number = document.createElement("span"), body = document.createElement("div");
      number.textContent = String(i + 1).padStart(2, "0");
      const action = document.createElement("strong"), observation = document.createElement("p");
      action.textContent = item.action; observation.textContent = item.observation;
      body.append(action, observation); li.append(number, body);
      if (i === index) li.setAttribute("aria-current", "step");
      else li.classList.add("is-historical");
      list.append(li);
    });
    list.scrollTop = list.scrollHeight;
    host.dataset.motion = frame.changed.length ? "updated" : "unchanged";
    write(host, "[data-perception-count]", String(index + 1).padStart(2, "0"));
    write(host, "[data-perception-number]", String(index + 1).padStart(2, "0") + " / 07");
    write(host, "[data-perception-phase]", frame.phase);
    write(host, "[data-perception-title]", frame.title);
    write(host, "[data-perception-caption]", frame.caption);
    write(host, "[data-perception-observation]", frame.observation);
    write(host, "[data-perception-location]", diagnostic ? frame.location : locations[frame.location]);
    write(host, "[data-perception-door]", diagnostic ? frame.door : frame.door === "open" ? "Open" : "Closed");
    write(host, "[data-perception-fallback]", "Mug 3 / " + locations[frame.location] + " / not hot");
    host.querySelector("[data-perception-stage]").setAttribute("aria-label", frame.observation);
    host.querySelectorAll("[data-perception-fact]").forEach(fact => {
      const key = fact.dataset.perceptionFact;
      fact.classList.toggle("is-updated", frame.changed.includes(key));
      write(host, `[data-perception-${key}-source]`, "Observation " + String(frame.sources[key] + 1).padStart(2, "0"));
      fact.getAnimations().forEach(animation => animation.cancel());
      if (!reset && frame.changed.includes(key)) animate(fact, [{backgroundColor: "#dceee6", transform: "translateX(5px)"}, {backgroundColor: "#ffffff", transform: "translateX(0)"}], 1400);
    });
    host.querySelectorAll(".pos-evidence-flight").forEach(item => { item.getAnimations().forEach(a => a.cancel()); item.remove(); });
    if (!reset && index === previousIndex + 1) {
      animate(list.lastElementChild, [{opacity: 0, transform: "translateY(15px)"}, {opacity: 1, transform: "translateY(0)"}], 750);
      if (frame.changed.length && !reduced.matches) {
        const spread = host.querySelector(".pos-perception-spread"), bounds = spread.getBoundingClientRect();
        const a = list.lastElementChild.getBoundingClientRect(), b = host.querySelector(".pos-perception-observation").getBoundingClientRect();
        const c = host.querySelector(`[data-perception-fact="${frame.changed[0]}"]`).getBoundingClientRect();
        const packet = document.createElement("span"); packet.className = "pos-evidence-flight"; packet.innerHTML = '<i class="fas fa-file-alt" aria-hidden="true"></i>'; packet.setAttribute("aria-hidden", "true"); spread.append(packet);
        const pos = rect => `translate(${rect.left - bounds.left + rect.width / 2 - 12}px,${rect.top - bounds.top + rect.height / 2 - 12}px)`;
        const animation = packet.animate([{transform: pos(a), opacity: 0}, {transform: pos(b), opacity: 1, offset: .5}, {transform: pos(c), opacity: 0}], {duration: 1400, easing: "ease-in-out"});
        animation.onfinish = () => packet.remove();
      }
    }
    source(frame);
    host._posPerceptionFrame = {frame, mode, reset: reset || Math.abs(index - previousIndex) !== 1};
    root.dispatchEvent(new CustomEvent("pos:perception", {detail: host._posPerceptionFrame}));
    previousIndex = index;
  });
  host.querySelectorAll("[data-perception-fact]").forEach(button => button.addEventListener("click", () => {
    controller.pause();
    selectedFact = selectedFact === button.dataset.perceptionFact ? null : button.dataset.perceptionFact;
    host.querySelectorAll("[data-perception-fact]").forEach(item => item.setAttribute("aria-pressed", String(item.dataset.perceptionFact === selectedFact)));
    source(frames[controller.index]);
  }));
  host.querySelectorAll("[data-perception-mode]").forEach(button => button.addEventListener("click", () => {
    mode = button.dataset.perceptionMode;
    frames = mode === "diagnosis" ? experience.diagnostic_perception : experience.perception;
    selectedFact = null; previousIndex = -1;
    host.querySelectorAll("[data-perception-fact]").forEach(item => item.setAttribute("aria-pressed", "false"));
    tabs(host.querySelectorAll("[data-perception-mode]"), button);
    host.querySelector("#pos-perception-panel").setAttribute("aria-labelledby", button.id);
    controller.seek(0, true);
  }));
}

function progress() {
  const host = root.querySelector("[data-pos-progress]");
  let mode = "execution", preset = "advancing", signal = "health", lag = null, selectedTransition = 8;
  let frames = exampleFrames(preset, mode), current = measure(frames, 8, mode);
  const presetDescriptions = {
    advancing: ["Progress before completion.", "The requirement is still open, but every validated transition records progress and earlier states do not recur."],
    stagnant: ["Different observations. No recorded progress.", "Weak clues change the state description, but no transition meets the progress criterion. Recurrence is absent; stagnation still reveals the trap."],
    cycle: ["Local changes can hide a loop.", "Transitions receive positive step labels, yet the active-gap state alternates A, B, A, B. The strongest recurrence occurs at lag 2."],
    drift: ["The record grows around an unchanged gap.", "Unrelated observations accumulate while the active-gap projection stays A. The projection repeats and the requirement remains unresolved."]
  };
  function working() {
    const container = host.querySelector("[data-signal-working]"); container.replaceChildren();
    host.querySelectorAll("[data-transition]").forEach(item => item.classList.remove("is-relevant"));
    const line = (label, value) => { const item = document.createElement("p"), name = document.createElement("span"), output = document.createElement("strong"); name.textContent = label; output.textContent = value; item.append(name, output); container.append(item); };
    const label = host.querySelector("#pos-signal-detail"); label.setAttribute("aria-labelledby", "pos-signal-" + signal);
    const headings = {
      p: ["PERSISTENCE / REQUIREMENTS", "Follow the same gap through the window.", "Count the gaps present at the beginning that remain unresolved at every point. Compute epistemic and achievement persistence separately, then take the larger value."],
      s: ["STAGNATION / STEP LABELS", "Count transitions without recorded progress.", mode === "diagnosis" ? "Each diagnostic label uses half the total absolute confidence change. Increases and decreases both contribute; the threshold is 0.30." : "The Sentinel marks a useful transition when it reduces the active gap, acquires needed information, or advances a plausible route toward the goal."],
      r: ["RECURRENCE / GAP-RELATIVE STATES", "Compare earlier states at different lags.", "All comparisons use the same active gap. R takes the highest repeat rate across lags 1 to 4. A repeat requires average Entity-State-Relation Jaccard distance at or below 0.15."],
      health: ["WHY COMBINE THESE SIGNALS?", presetDescriptions[preset][0], presetDescriptions[preset][1]]
    };
    write(host, "[data-signal-kicker]", headings[signal][0]); write(host, "[data-signal-title]", headings[signal][1]); write(host, "[data-signal-description]", headings[signal][2]);
    if (signal === "p") {
      line("Epistemic persistence", format(current.pE)); line("Achievement persistence", format(current.pA)); line("p = max(P E, P A)", format(current.p));
      line("Initial gap survives every transition", controller.index ? "Yes" : "Awaiting a transition");
    } else if (signal === "s") {
      const total = current.transitions.length, sum = current.transitions.reduce((a, b) => a + b.progress, 0);
      line("Recorded progress labels", current.transitions.map(item => item.progress).join(" "));
      line("S = 1 - mean(u)", total ? `1 - ${sum}/${total} = ${format(current.s)}` : "Awaiting a transition");
      if (mode === "diagnosis" && current.transitions.length) {
        const i = Math.min(Math.max(selectedTransition, 1), controller.index);
        const ids = new Set([...Object.keys(frames[i - 1].confidence), ...Object.keys(frames[i].confidence)]);
        ids.forEach(id => line(id, `${format(frames[i - 1].confidence[id] || 0)} → ${format(frames[i].confidence[id] || 0)}`));
        line(`Transition ${i} / d diag`, format(current.transitions.find(item => item.index === i).change));
      }
    } else if (signal === "r") {
      const lags = document.createElement("div"); lags.className = "pos-lag-tabs";
      const chosen = lag || current.recurrence.lag;
      current.recurrence.comparisons.forEach(item => {
        const button = document.createElement("button"); button.type = "button"; button.textContent = "Lag " + item.lag + " / " + format(item.rate);
        button.setAttribute("aria-pressed", String(item.lag === chosen)); button.addEventListener("click", () => { lag = item.lag; working(); }); lags.append(button);
      }); container.append(lags);
      const comparison = current.recurrence.comparisons.find(item => item.lag === chosen);
      if (comparison) {
        const pairs = document.createElement("div"); pairs.className = "pos-recurrence-pairs";
        comparison.pairs.forEach(pair => {
          const button = document.createElement("button"); button.type = "button"; button.className = pair.repeated ? "is-repeat" : "";
          const windowStart = Math.max(1, controller.index - 7);
          const a = frames[windowStart + pair.from], b = frames[windowStart + pair.to];
          button.textContent = `${a.label} ↔ ${b.label}`; button.title = `World distance ${format(pair.distance)}`;
          button.addEventListener("click", () => {
            host.querySelectorAll("[data-transition]").forEach(item => item.classList.remove("is-relevant"));
            const start = Math.max(1, controller.index - 7);
            [start + pair.from, start + pair.to].forEach(i => host.querySelector('[data-transition="' + i + '"]')?.classList.add("is-relevant"));
            controller.pause();
            container.querySelector(".pos-pair-detail")?.remove();
            const detail = document.createElement("p"); detail.className = "pos-pair-detail";
            detail.textContent = `Entities: ${a.projection.entities.join(", ")} / ${b.projection.entities.join(", ")}. States: ${a.projection.states.join(", ")} / ${b.projection.states.join(", ")}. Relations: ${a.projection.relations.join(", ")} / ${b.projection.relations.join(", ")}. dW = ${format(worldDistance(a.projection, b.projection))}.`;
            container.append(detail);
          }); pairs.append(button);
        }); container.append(pairs);
      }
      line("Highest recurrence rate / R", format(current.r));
    } else {
      line("Persistent requirements / p", format(current.p)); line("Stronger signal / max(S, R)", format(Math.max(current.s, current.r)));
      line("Detection threshold", "H ≤ 0.25");
      line("Assessment", current.ready ? current.h <= .25 ? "Trapping detected" : "Progress continues" : "Wait for 8 transitions");
    }
  }
  let controller;
  function render(count, reset) {
    current = measure(frames, count, mode);
    host.dataset.assessment = !current.ready ? "pending" : current.h <= .25 ? "trapped" : "healthy";
    write(host, "[data-progress-status]", current.ready ? "Window ready" : `Collecting ${count} / 8 transitions`);
    write(host, "[data-progress-gap]", mode === "diagnosis" ? "Distinguish the remaining explanations." : "Fulfill the remaining goal requirement.");
    const strip = host.querySelector("[data-progress-transitions]"); strip.replaceChildren();
    for (let i = 1; i <= 8; i++) {
      const item = document.createElement("button"); item.type = "button"; item.dataset.transition = i;
      const transition = current.transitions.find(value => value.index === i);
      item.className = "pos-transition " + (!transition ? "is-pending" : transition.progress ? "is-progress" : "is-stagnant");
      item.disabled = !transition;
      const number = document.createElement("span"), states = document.createElement("strong"), tag = document.createElement("small"), record = document.createElement("b");
      number.textContent = "T" + String(i).padStart(2, "0"); states.textContent = frames[i - 1].label + " → " + frames[i].label;
      tag.textContent = transition ? "u = " + transition.progress : "Awaiting";
      record.textContent = frames[i].record;
      item.append(number, states, tag, record);
      item.setAttribute("aria-label", `Transition ${i}: ${states.textContent}, ${tag.textContent}`);
      item.addEventListener("click", () => { controller.pause(); selectedTransition = i; signal = "s"; selectSignal(); });
      strip.append(item);
      if (!reset && i === count) animate(item, [{opacity: 0, transform: "translateY(10px)"}, {opacity: 1, transform: "translateY(0)"}], 700);
    }
    ["p", "s", "r"].forEach(key => write(host, `[data-metric-${key}]`, count ? format(current[key]) : "--"));
    write(host, "[data-metric-h]", current.ready ? format(current.h) : "--");
    write(host, "[data-metric-verdict]", current.ready ? current.h <= .25 ? "Trapping detected" : "Progress continues" : "Awaiting full window");
    write(host, "[data-health-calculation]", current.ready ? `1 − ${format(current.p)} × max(${format(current.s)}, ${format(current.r)}) = ${format(current.h)}` : "Health estimation starts after 8 validated transitions.");
    const pointer = host.querySelector("[data-health-pointer]"); pointer.style.left = `${current.h * 100}%`; pointer.hidden = !current.ready;
    // Playback renders its initial frame before returning the controller.
    if (controller) working();
    host._posMetrics = current;
  }
  controller = playback(host, 9, 2500, render, 8);
  working();
  function selectSignal() {
    host.dataset.signal = signal;
    tabs(host.querySelectorAll("[data-progress-signal]"), host.querySelector(`[data-progress-signal="${signal}"]`)); working();
  }
  host.querySelectorAll("[data-progress-signal]").forEach(button => button.addEventListener("click", () => { controller.pause(); signal = button.dataset.progressSignal; selectSignal(); }));
  host.querySelectorAll("[data-progress-mode]").forEach(button => button.addEventListener("click", () => {
    mode = button.dataset.progressMode; tabs(host.querySelectorAll("[data-progress-mode]"), button);
    frames = exampleFrames(preset, mode); controller.seek(8, true); selectSignal();
  }));
  host.querySelectorAll("[data-progress-preset]").forEach(button => button.addEventListener("click", () => {
    preset = button.dataset.progressPreset; host.dataset.preset = preset; lag = null;
    tabs(host.querySelectorAll("[data-progress-preset]"), button);
    host.querySelector("#pos-progress-panel").setAttribute("aria-labelledby", button.id);
    frames = exampleFrames(preset, mode); controller.seek(8, true);
    animate(host.querySelector(".pos-transition-strip"), [{opacity: .4}, {opacity: 1}], 450);
  }));
}

function recovery() {
  const host = root.querySelector("[data-pos-recovery]");
  let pattern = "static", gap = "epistemic";
  const phases = [
    ["TRAPPING DETECTED", "A persistent gap meets stalled belief dynamics.", "Once a full window is available, H at or below 0.25 triggers trapping diagnosis.", "fa-pause-circle"],
    ["FACTORIZED DIAGNOSIS", "Identify how the agent is stuck and what remains blocked.", "The pattern describes the unproductive dynamics. The gap type identifies the progress that recovery must restore.", "fa-crosshairs"],
    ["CONSTRAINTS COMPOSED", "Two constraints guide the next decision.", "The active gap stays fixed. The Task Agent chooses an action conditioned on both the escape constraint and the progress requirement.", "fa-code-branch"],
    ["AGENT-SELECTED ACTION", "Choose an investigation that addresses the gap.", "", "fa-arrow-right"],
    ["VALIDATED TRANSITION", "Check the new observation and revise the belief.", "", "fa-check-circle"],
    ["HEALTH REASSESSED", "Release constraints only when health recovers.", "Recompute H after every validated transition. If H remains at or below 0.25, update the diagnosis and constraints; if H exceeds 0.25, resume normal interaction.", "fa-sync-alt"]
  ];
  const controller = playback(host, 6, 4300, index => {
    const p = experience.recovery.patterns[pattern], g = experience.recovery.gaps[gap];
    host.dataset.phase = index;
    write(host, "[data-recovery-active-gap]", g.gap); write(host, "[data-recovery-pattern-description]", p.summary);
    write(host, "[data-recovery-state-middle]", pattern === "cycle" ? "B" : pattern === "drift" ? "A + notes" : "A");
    write(host, "[data-recovery-pattern-constraint]", p.constraint); write(host, "[data-recovery-gap-constraint]", g.constraint);
    write(host, "[data-recovery-constraint-status]", index < 2 ? "Constraints awaiting composition" : index === 5 ? "Reassess after each validated transition" : "Both constraints applied to action selection");
    write(host, "[data-recovery-kicker]", phases[index][0]);
    write(host, "[data-recovery-title]", index === 3 ? g.action : phases[index][1]);
    write(host, "[data-recovery-description]", index === 3 ? "This is one possible action selected by the agent; the constraints specify what it must resolve." : index === 4 ? g.observation + " " + g.revision : phases[index][2]);
    host.querySelector("[data-recovery-icon]").className = "fas " + phases[index][3];
    write(host, "[data-recovery-h-status]", index === 5 ? "H ≤ 0.25: update / H > 0.25: release" : "H ≤ 0.25 / recovery active");
    write(host, "[data-recovery-release]", index === 5 ? "Recovery is an ongoing loop. A new observation alone is not a reason to release the constraints." : "The active gap remains the target while the next action is redirected.");
    host.querySelectorAll("[data-recovery-milestone]").forEach((item, i) => { item.classList.toggle("is-active", i === index); item.classList.toggle("is-past", i < index); });
    animate(host.querySelector(".pos-recovery-outcome > div"), [{opacity: .25, transform: "translateY(6px)"}, {opacity: 1, transform: "translateY(0)"}], 700);
  });
  host.querySelectorAll("[data-recovery-pattern]").forEach(button => button.addEventListener("click", () => {
    pattern = button.dataset.recoveryPattern; host.dataset.pattern = pattern;
    tabs(host.querySelectorAll("[data-recovery-pattern]"), button);
    host.querySelector("#pos-recovery-panel").setAttribute("aria-labelledby", button.id); controller.seek(0, true);
  }));
  host.querySelectorAll("[data-recovery-gap]").forEach(button => button.addEventListener("click", () => {
    gap = button.dataset.recoveryGap; host.dataset.gap = gap;
    tabs(host.querySelectorAll("[data-recovery-gap]"), button); controller.seek(0, true);
  }));
}

if (root) { perception(); progress(); recovery(); }
