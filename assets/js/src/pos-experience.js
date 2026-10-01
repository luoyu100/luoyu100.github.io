import { exampleFrames, workedFrames, recoveryFrames, measure, worldDistance } from "./pos-metrics.js";
const root = document.querySelector("[data-pos-project]");
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const experience = root && JSON.parse(root.querySelector("[data-pos-experience]").textContent);
const format = (value) => value.toFixed(2);
const write = (host, selector, value) => {
  host.querySelector(selector).textContent = value;
};
function tabs(buttons, selected) {
  buttons.forEach((button) => {
    const active = button === selected;
    button.setAttribute("aria-selected", String(active));
    button.tabIndex = active ? 0 : -1;
  });
}
function playback(host, getLength, duration, render, initial = 0) {
  const controls = host.querySelector(".pos-exhibit-controls"), play = controls.querySelector("[data-exhibit-play]"), range = controls.querySelector("[data-exhibit-range]"), previous = controls.querySelector("[data-exhibit-prev]"), next = controls.querySelector("[data-exhibit-next]"), replay = controls.querySelector("[data-exhibit-replay]");
  let index = initial, intended = false, seen = false, timer = 0, started = 0, remaining = duration;
  function buttons() {
    const inactive = host.dataset.inactive === "true";
    host.classList.toggle("is-playing", intended && seen && !document.hidden);
    play.setAttribute("aria-pressed", String(intended));
    play.setAttribute("aria-label", intended ? "Pause demonstration" : "Play demonstration");
    play.title = intended ? "Pause" : "Play";
    play.firstElementChild.className = "fas " + (intended ? "fa-pause" : "fa-play");
    range.max = getLength() - 1;
    range.value = index;
    play.disabled = replay.disabled = range.disabled = inactive;
    previous.disabled = inactive || index === 0;
    next.disabled = inactive || index === getLength() - 1;
  }
  function suspend() {
    host.classList.remove("is-playing");
    if (timer) remaining = Math.max(0, remaining - (performance.now() - started));
    clearTimeout(timer);
    timer = 0;
  }
  function queue() {
    buttons();
    if (!intended || !seen || document.hidden || timer) return;
    started = performance.now();
    timer = setTimeout(() => {
      timer = 0;
      remaining = duration;
      show(index + 1);
      queue();
    }, remaining);
  }
  function show(value, reset = false) {
    index = Math.max(0, Math.min(getLength() - 1, value));
    host.dataset.frame = index;
    render(index, reset);
    if (index === getLength() - 1) {
      intended = false;
      suspend();
    }
    buttons();
  }
  function pause() {
    intended = false;
    suspend();
    buttons();
  }
  function seek(value, reset = false) {
    pause();
    remaining = duration;
    show(value, reset);
  }
  function start(reset = false) {
    if (host.dataset.inactive === "true") return;
    if (reset || index === getLength() - 1) {
      suspend();
      remaining = duration;
      show(0, true);
    }
    intended = true;
    buttons();
    queue();
  }
  previous.addEventListener("click", () => seek(index - 1));
  next.addEventListener("click", () => seek(index + 1));
  range.addEventListener("input", () => seek(Number(range.value)));
  play.addEventListener("click", () => intended ? pause() : start());
  replay.addEventListener("click", () => start(true));
  new IntersectionObserver((entries) => {
    seen = entries[0].isIntersecting;
    if (!seen) suspend();
    else queue();
  }, { threshold: 0.1 }).observe(host);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) suspend();
    else queue();
  });
  reduced.addEventListener("change", () => {
    if (reduced.matches) pause();
  });
  const controller = { seek, pause, start, refresh: () => show(index, true), get index() {
    return index;
  }, get playing() {
    return intended;
  } };
  host._posPlayback = controller;
  show(initial, true);
  return controller;
}
function progress() {
  const host = root.querySelector("[data-pos-progress]");
  let mode = "execution", preset = "worked", signal = "health", lag = null, selectedTransition = 3, count = 8, controller;
  let frames = workedFrames(mode), current = measure(frames, count, mode);
  const gap = () => mode === "diagnosis" ? "Distinguish database waiting from JVM-side processing." : "Make the mug hot.";
  const descriptions = {
    worked: ["A window can contain useful changes and repetition.", "Compare the early window with the later stall in the same task. The later window preserves the same active gap without further useful changes."],
    advancing: ["An open requirement can still be advancing.", "Every transition records progress, and earlier gap-relevant states do not recur."],
    static: ["Repeated activity leaves the relevant state unchanged.", "The requirement persists, useful changes are absent, and the gap-relevant state repeats."],
    cycle: ["Local changes can hide a loop.", "Transitions receive positive step labels, yet the gap-relevant state returns to A, B, A, B. Recurrence reveals the loop."],
    drift: ["New records accumulate around an unchanged gap.", "Unrelated observations enter the record while the projection relevant to the current requirement keeps repeating."]
  };
  const describe = (frame) => [...frame.projection.states, ...frame.projection.relations].join("; ");
  function transitionDetail() {
    const i = Math.min(Math.max(selectedTransition, 1), Math.max(1, count)), before = frames[i - 1], after = frames[i];
    write(host, "[data-transition-title]", "Transition " + i + ": " + (after.action || after.record));
    write(host, "[data-transition-before]", describe(before));
    write(host, "[data-transition-after]", describe(after));
    write(host, "[data-transition-observation]", after.observation || "Aligned symbolic state: " + after.record + ".");
    const t = measure(frames, i, mode).transitions.find((item) => item.index === i), values = /* @__PURE__ */ new Set([...Object.keys(before.confidence), ...Object.keys(after.confidence)]);
    const explanation = mode === "diagnosis" ? [...values].map((k) => k + ": " + format(before.confidence[k] || 0) + " → " + format(after.confidence[k] || 0)).join("; ") + ". Half the total absolute change = " + t.change.toFixed(3) + ". u = " + t.progress + " (threshold > 0.30)." : "u = " + t.progress + ". " + (t.progress ? "The validated transition advances a necessary step toward heating the mug." : "This observation does not record useful progress toward the active gap.");
    write(host, "[data-transition-progress]", explanation);
  }
  function working() {
    const container = host.querySelector("[data-signal-working]");
    container.replaceChildren();
    host.querySelectorAll("[data-transition]").forEach((item) => item.classList.remove("is-relevant"));
    const line = (label, value) => {
      const p = document.createElement("p"), s = document.createElement("span"), b = document.createElement("strong");
      s.textContent = label;
      b.textContent = value;
      p.append(s, b);
      container.append(p);
    };
    const headings = {
      p: ["PERSISTENCE / REQUIREMENTS", "Which initial requirements survived the whole window?", "Compute persistence for epistemic and achievement gaps separately, then take the larger value. A requirement resolved during the window is not persistent."],
      s: ["STAGNATION / TRANSITIONS", "Which actions produced a useful change?", mode === "diagnosis" ? "Each diagnostic label uses half the total absolute confidence change. Increases and decreases contribute; progress requires a change greater than 0.30." : "The Sentinel labels a transition as useful when it reduces the gap, acquires needed information, or advances a plausible route toward the goal."],
      r: ["RECURRENCE / ALIGNED STATES", "Are we returning to the same gap-relevant state?", "Compare historical states against the same current active gap. R is the highest repeat rate across lags 1–4."],
      health: ["THE COMBINED ASSESSMENT", descriptions[preset][0], descriptions[preset][1]]
    };
    const h = headings[signal];
    write(host, "[data-signal-kicker]", h[0]);
    write(host, "[data-signal-title]", h[1]);
    write(host, "[data-signal-description]", h[2]);
    host.querySelector("#pos-signal-detail").setAttribute("aria-labelledby", "pos-signal-" + signal);
    if (!count) {
      line("Validated transitions", "None yet");
      return;
    }
    if (signal === "p") {
      line("Epistemic persistence", format(current.pE));
      line("Achievement persistence", format(current.pA));
      line("p = max(PE, PA)", format(current.p));
      const first = frames[Math.max(1, count - 7)], last = frames[count];
      line("Initial requirements", String(first.epistemic.length + first.achievement.length));
      line("Requirements open now", String(last.epistemic.length + last.achievement.length));
    } else if (signal === "s") {
      const total = current.transitions.length, sum = current.transitions.reduce((a, b) => a + b.progress, 0);
      line("Progress labels", current.transitions.map((item) => item.progress).join(" "));
      line("S = 1 − mean(u)", total ? "1 − " + sum + "/" + total + " = " + format(current.s) : "Awaiting a transition");
      transitionDetail();
      const hint = document.createElement("button");
      hint.type = "button";
      hint.className = "pos-text-command";
      hint.textContent = "Inspect a transition";
      hint.addEventListener("click", () => {
        const d = host.querySelector(".pos-transition-detail");
        d.open = true;
        d.scrollIntoView({ block: "nearest", behavior: reduced.matches ? "instant" : "smooth" });
      });
      container.append(hint);
    } else if (signal === "r") {
      const chosen = lag || current.recurrence.lag, buttons = document.createElement("div");
      buttons.className = "pos-lag-tabs";
      current.recurrence.comparisons.forEach((item) => {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = "Lag " + item.lag + " / " + format(item.rate);
        b.setAttribute("aria-pressed", String(item.lag === chosen));
        b.addEventListener("click", () => {
          lag = item.lag;
          working();
        });
        buttons.append(b);
      });
      container.append(buttons);
      const comparison = current.recurrence.comparisons.find((item) => item.lag === chosen);
      if (comparison) {
        const pairs = document.createElement("div");
        pairs.className = "pos-recurrence-pairs";
        comparison.pairs.forEach((pair) => {
          const start = Math.max(1, count - 7), a = frames[start + pair.from], b = frames[start + pair.to], button = document.createElement("button");
          button.type = "button";
          button.className = pair.repeated ? "is-repeat" : "";
          button.textContent = a.label + " ↔ " + b.label;
          button.title = "World distance " + format(pair.distance);
          button.addEventListener("click", () => {
            controller.pause();
            host.querySelectorAll("[data-transition]").forEach((item) => item.classList.remove("is-relevant"));
            [start + pair.from, start + pair.to].forEach((i) => host.querySelector('[data-transition="' + i + '"]')?.classList.add("is-relevant"));
            container.querySelector(".pos-pair-detail")?.remove();
            const p = document.createElement("p");
            p.className = "pos-pair-detail";
            p.textContent = describe(a) + " / " + describe(b) + ". Average Entity–State–Relation distance = " + format(worldDistance(a.projection, b.projection)) + ".";
            container.append(p);
          });
          pairs.append(button);
        });
        container.append(pairs);
      }
      line("Highest repeat rate / R", format(current.r));
    } else {
      line("Persistent requirements / p", format(current.p));
      line("Stronger signal / max(S, R)", format(Math.max(current.s, current.r)));
      line("Detection threshold", "H ≤ 0.25");
      line("Assessment", current.ready ? current.h <= 0.25 ? "Trapping detected" : "No trapping detected" : "Wait for 8 transitions");
    }
  }
  // Recovery receives the exact task, gap and window currently being inspected.
  function publish() {
    const selection = { mode, preset, count, pattern: preset === "cycle" ? "cycle" : preset === "drift" ? "drift" : "static", gap: gap(), frames: frames.slice(0, count + 1), metrics: current };
    root._posProgressSelection = selection;
    root.dispatchEvent(new CustomEvent("pos:progress-selection", { detail: selection }));
  }
  function render(value) {
    count = value;
    host.querySelector(".pos-transition-detail").hidden = count === 0;
    current = measure(frames, count, mode);
    host.dataset.assessment = !current.ready ? "pending" : current.h <= 0.25 ? "trapped" : "healthy";
    write(host, "[data-progress-status]", current.ready ? "Window ready" : "Collecting " + count + " / 8 transitions");
    write(host, "[data-progress-gap]", gap());
    write(host, "[data-progress-gap-status]", count && current.p < 1 ? "Some initial requirements resolved" : "The same gap remains unresolved");
    write(host, "[data-progress-window]", "Validated transitions " + Math.max(1, count - 7) + "–" + Math.max(8, count));
    const strip = host.querySelector("[data-progress-transitions]");
    strip.replaceChildren();
    for (let offset = 0; offset < 8; offset++) {
      const i = Math.max(1, count - 7) + offset, item = document.createElement("button"), t = current.transitions.find((t2) => t2.index === i);
      item.type = "button";
      item.dataset.transition = i;
      item.disabled = !t;
      item.className = "pos-transition " + (!t ? "is-pending" : t.progress ? "is-progress" : "is-stagnant");
      const n = document.createElement("span"), s = document.createElement("strong"), u = document.createElement("small");
      n.textContent = "T" + String(i).padStart(2, "0");
      s.textContent = (frames[i - 1]?.label || "—") + " → " + (frames[i]?.label || "—");
      u.textContent = t ? "u = " + t.progress : "Awaiting";
      item.append(n, s, u);
      item.title = frames[i]?.action || frames[i]?.record || "Awaiting transition";
      item.addEventListener("click", () => {
        controller.pause();
        selectedTransition = i;
        signal = "s";
        selectSignal();
        const d = host.querySelector(".pos-transition-detail");
        d.open = true;
        transitionDetail();
        item.classList.add("is-relevant");
      });
      strip.append(item);
    }
    ["p", "s", "r"].forEach((k) => write(host, "[data-metric-" + k + "]", count ? format(current[k]) : "—"));
    write(host, "[data-metric-h]", current.ready ? format(current.h) : "—");
    write(host, "[data-metric-verdict]", current.ready ? current.h <= 0.25 ? "Trapping detected" : "No trapping detected" : "Awaiting full window");
    write(host, "[data-health-calculation]", current.ready ? "1 − " + format(current.p) + " × max(" + format(current.s) + ", " + format(current.r) + ") = " + format(current.h) : "Health estimation starts after 8 validated transitions.");
    const pointer = host.querySelector("[data-health-pointer]");
    pointer.style.left = (current.h || 0) * 100 + "%";
    pointer.hidden = !current.ready;
    host.querySelector("[data-worked-windows]").hidden = preset !== "worked";
    tabs(host.querySelectorAll("[data-progress-window-choice]"), host.querySelector('[data-progress-window-choice="' + (count <= 8 ? "early" : "late") + '"]'));
    write(host, "[data-progress-link-note]", current.ready && current.h <= 0.25 ? "Trapping detected. Continue with this task and gap." : "No recovery is required in this window. Compare the later stall.");
    host._posMetrics = current;
    if (controller) {
      working();
      transitionDetail();
    }
    publish();
  }
  function selectSignal() {
    host.dataset.signal = signal;
    tabs(host.querySelectorAll("[data-progress-signal]"), host.querySelector('[data-progress-signal="' + signal + '"]'));
    working();
  }
  function select(newMode, newPreset, late = false) {
    mode = newMode;
    preset = newPreset;
    lag = null;
    host.dataset.preset = preset;
    frames = preset === "worked" ? workedFrames(mode) : exampleFrames(preset, mode);
    tabs(host.querySelectorAll("[data-progress-mode]"), host.querySelector('[data-progress-mode="' + mode + '"]'));
    tabs(host.querySelectorAll("[data-progress-preset]"), host.querySelector('[data-progress-preset="' + preset + '"]'));
    host.querySelector("#pos-progress-panel").setAttribute("aria-labelledby", "pos-preset-" + preset);
    selectedTransition = late ? 16 : preset === "worked" ? 3 : 8;
    controller.seek(late ? 16 : 8, true);
    selectSignal();
  }
  controller = playback(host, () => frames.length, 2500, render, 8);
  working();
  transitionDetail();
  host.querySelectorAll("[data-progress-signal]").forEach((b) => b.addEventListener("click", () => {
    controller.pause();
    signal = b.dataset.progressSignal;
    selectSignal();
  }));
  host.querySelectorAll("[data-progress-mode]").forEach((b) => b.addEventListener("click", () => select(b.dataset.progressMode, preset, count > 8)));
  host.querySelectorAll("[data-progress-preset]").forEach((b) => b.addEventListener("click", () => select(mode, b.dataset.progressPreset)));
  host.querySelectorAll("[data-progress-window-choice]").forEach((b) => b.addEventListener("click", () => select(mode, "worked", b.dataset.progressWindowChoice === "late")));
  root.addEventListener("pos:recovery-choice", (e) => select(e.detail.mode, e.detail.preset, e.detail.late));
}
function recovery() {
  const host = root.querySelector("[data-pos-recovery]");
  let selection = root._posProgressSelection, resolved = false, controller;
  const names = ["Detect", "Diagnose", "Compose", "Act", "Validate", "Reassess"];
  function render(index) {
    const pattern = experience.recovery.patterns[selection.pattern], mode = selection.mode, type = mode === "diagnosis" ? "epistemic" : "achievement", g = experience.recovery.gaps[type], before = selection.metrics, active = before.ready && before.h <= 0.25;
    host.dataset.inactive = String(!active);
    host.dataset.phase = index;
    write(host, "[data-recovery-handoff]", (mode === "diagnosis" ? "Diagnosis" : "Execution") + " / " + (selection.preset === "worked" ? selection.count > 8 ? "later window" : "early window" : pattern.name + " window") + " / " + (before.ready ? "H = " + format(before.h) : "awaiting eight transitions"));
    write(host, "[data-recovery-active-gap]", selection.gap);
    write(host, "[data-recovery-pattern-description]", pattern.summary);
    write(host, "[data-recovery-state-middle]", selection.pattern === "cycle" ? "B" : selection.pattern === "drift" ? "A + notes" : "A");
    write(host, "[data-recovery-pattern-constraint]", pattern.constraint);
    write(host, "[data-recovery-gap-constraint]", g.constraint);
    write(host, "[data-recovery-constraint-status]", !active ? "No recovery constraints needed" : index < 2 ? "Constraints awaiting composition" : "Both constraints guide action selection");
    host.querySelectorAll("[data-recovery-milestone]").forEach((item, i) => {
      item.classList.toggle("is-active", active && i === index);
      item.classList.toggle("is-past", active && i < index);
    });
    const afterFrames = recoveryFrames(selection.frames, mode, resolved), after = measure(afterFrames, afterFrames.length - 1, mode), frame = afterFrames[afterFrames.length - 1];
    const titles = ["The same gap persists without useful progress.", "Identify the pattern and the blocked requirement.", "Combine escape and progress constraints.", g.action, "Validate the new observation.", after.h > 0.25 ? "Health recovers. Release the constraints." : "Health remains low. Keep the constraints."];
    const texts = ["The validated window has H at or below 0.25. Recovery addresses this task and this active gap.", pattern.summary + " The active gap remains the target.", pattern.constraint + " " + g.constraint, "The Task Agent selects an action under these constraints. They specify the change or information needed.", frame.observation, "Recompute the same signals over the updated window. p = " + format(after.p) + ", S = " + format(after.s) + ", R = " + format(after.r) + "; H = " + format(after.h) + ". " + (after.h > 0.25 ? "Normal interaction resumes; other task requirements may remain." : "A useful observation alone has not yet restored the window's health.")];
    write(host, "[data-recovery-kicker]", active ? names[index].toUpperCase() : "MONITORING");
    write(host, "[data-recovery-title]", active ? titles[index] : before.ready ? "This window does not trigger recovery." : "A full window is needed before trapping detection.");
    write(host, "[data-recovery-description]", active ? texts[index] : "Compare the later stall, or select a trapping pattern above. The task and active gap carry over from Progression.");
    host.querySelector("[data-recovery-icon]").className = "fas " + ["fa-pause-circle", "fa-crosshairs", "fa-code-branch", "fa-arrow-right", "fa-check-circle", "fa-sync-alt"][active ? index : 5];
    write(host, "[data-recovery-h-status]", !active ? before.ready ? "H = " + format(before.h) + " / monitoring" : "Detection pending" : index >= 4 ? "H: " + format(before.h) + " → " + format(after.h) : "H = " + format(before.h) + " / recovery active");
    write(host, "[data-recovery-release]", !active ? "The same progress assessment determines whether recovery is needed." : index >= 4 ? after.h > 0.25 ? "Release only after the validated window clears H > 0.25." : "Keep or revise the constraints while H ≤ 0.25." : "The active gap stays fixed while action selection changes.");
    host._posRecoveryMetrics = { before, after, active, resolved };
  }
  controller = playback(host, () => 6, 4300, render);
  function receive(s) {
    selection = s;
    const type = s.mode === "diagnosis" ? "epistemic" : "achievement";
    host.dataset.pattern = s.pattern;
    host.dataset.gap = type;
    tabs(host.querySelectorAll("[data-recovery-pattern]"), host.querySelector('[data-recovery-pattern="' + s.pattern + '"]'));
    tabs(host.querySelectorAll("[data-recovery-gap]"), host.querySelector('[data-recovery-gap="' + type + '"]'));
    host.querySelector("#pos-recovery-panel").setAttribute("aria-labelledby", "pos-recovery-" + s.pattern);
    controller.seek(0, true);
  }
  root.addEventListener("pos:progress-selection", (e) => receive(e.detail));
  const choose = (mode, preset, late = false) => root.dispatchEvent(new CustomEvent("pos:recovery-choice", { detail: { mode, preset, late } }));
  host.querySelectorAll("[data-recovery-pattern]").forEach((b) => b.addEventListener("click", () => choose(selection.mode, b.dataset.recoveryPattern)));
  host.querySelectorAll("[data-recovery-gap]").forEach((b) => b.addEventListener("click", () => choose(b.dataset.recoveryGap === "epistemic" ? "diagnosis" : "execution", selection.pattern)));
  host.querySelector("[data-recovery-stalled]").addEventListener("click", () => choose(selection.mode, "worked", true));
  host.querySelectorAll("[data-recovery-resolved]").forEach((b) => b.addEventListener("click", () => {
    resolved = b.dataset.recoveryResolved === "true";
    tabs(host.querySelectorAll("[data-recovery-resolved]"), b);
    controller.seek(selection.metrics.h <= 0.25 ? 5 : 0, true);
  }));
  receive(selection);
}
function navigation() {
  const nav = document.querySelector(".project-local-nav"), links = [...nav.querySelectorAll(".project-local-nav__links a")], select = nav.querySelector("[data-pos-section-select]"), targets = links.map((link) => ({ link, target: document.querySelector(link.getAttribute("href")) }));
  let queued = false;
  function update() {
    queued = false;
    let active = null;
    targets.forEach((item) => {
      if (item.target.getBoundingClientRect().top <= 150) active = item;
    });
    targets.forEach((item) => {
      const on = item === active;
      item.link.classList.toggle("is-active", on);
      if (on) item.link.setAttribute("aria-current", "location");
      else item.link.removeAttribute("aria-current");
    });
    if (select) select.value = active ? active.link.getAttribute("href") : "";
  }
  if (select) select.addEventListener("change", () => {
    const hash = select.value;
    if (!hash) return;
    if (location.hash === hash) {
      document.querySelector(hash).scrollIntoView({ block: "start", behavior: reduced.matches ? "instant" : "smooth" });
    } else {
      location.hash = hash;
    }
  });
  addEventListener("scroll", () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  addEventListener("resize", update);
  addEventListener("hashchange", update);
  update();
}
if (root) {
  progress();
  recovery();
  navigation();
}
