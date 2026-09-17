(function () {
  "use strict";
  var root = document.querySelector("[data-pos-project]");
  if (!root) return;
  var data = JSON.parse(root.querySelector("[data-pos-data]").textContent);
  var stories = JSON.parse(root.querySelector("[data-pos-stories]").textContent);
  var story = root.querySelector("[data-pos-story]");
  var scene = story.querySelector(".pos-comic-scene");
  var caseIndex = 0;
  var runIndex = 0;
  var frameIndex = 0;
  var storyTimer = null;
  var trapTimer = null;
  var previousFrame = null;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  function text(selector, value) { root.querySelector(selector).textContent = value; }
  function currentRun() { return stories[caseIndex].runs[runIndex]; }
  function setPlayButton(button, playing, label) {
    button.setAttribute("aria-pressed", String(playing));
    button.setAttribute("aria-label", (playing ? "Pause " : "Play ") + label);
    button.title = (playing ? "Pause " : "Play ") + label;
    button.firstElementChild.className = "fas " + (playing ? "fa-pause" : "fa-play");
  }
  function pauseStory() { window.clearInterval(storyTimer); storyTimer = null; setPlayButton(story.querySelector("[data-story-play]"), false, "story"); }
  function pauseTraps() { window.clearInterval(trapTimer); trapTimer = null; setPlayButton(root.querySelector("[data-trap-play]"), false, "trapping patterns"); }
  function motion(element, keyframes, duration) {
    if (!reducedMotion.matches && element.animate) element.animate(keyframes, {duration: duration || 650, easing: "cubic-bezier(.22,.7,.25,1)"});
  }
  function renderHistory(run) {
    var list = story.querySelector("[data-trajectory-log]");
    list.replaceChildren();
    run.steps.slice(0, frameIndex + 1).forEach(function (step, i) {
      var li = document.createElement("li");
      var index = document.createElement("span"); index.className = "pos-log-index"; index.textContent = String(i + 1).padStart(2, "0");
      var body = document.createElement("div");
      ["action", "observation"].forEach(function (key) {
        var label = document.createElement("h5"); label.textContent = key === "action" ? "Action" : "Observation";
        var value = document.createElement("p"); value.textContent = step.entry[key];
        body.append(label, value);
      });
      li.append(index, body); list.appendChild(li);
    });
    list.scrollTop = list.scrollHeight;
    text("[data-log-count]", String(frameIndex + 1).padStart(2, "0"));
    text("[data-history-note]", caseIndex === 0 ? "Paraphrased from Figure 1; not verbatim tool logs." : "Illustrative history, not a recorded baseline trace.");
    if (previousFrame) motion(list.lastElementChild, [{opacity: .2, transform: "translateY(18px)"}, {opacity: 1, transform: "translateY(0)"}]);
  }
  function showFrame(index) {
    var currentCase = stories[caseIndex];
    var run = currentRun();
    frameIndex = Math.max(0, Math.min(run.steps.length - 1, index));
    var frame = run.steps[frameIndex];
    var mug = scene.querySelector(".pos-mug");
    var oldMug = mug.getBoundingClientRect();
    scene.getAnimations({subtree: true}).forEach(function (animation) { animation.cancel(); });
    scene.classList.toggle("is-new-run", !previousFrame);
    scene.dataset.comic = currentCase.id;
    scene.dataset.mug = frame.mug || "counter";
    scene.dataset.hot = Boolean(frame.hot);
    scene.dataset.heating = Boolean(frame.heating);
    scene.dataset.door = frame.door || "closed";
    scene.dataset.cabinet = frame.cabinet || "closed";
    scene.dataset.inspect = Boolean(frame.inspect);
    scene.dataset.cards = frame.cards || 0;
    scene.dataset.cpu = frame.cpu ? "evidence" : frame.cpuPending ? "pending" : "none";
    scene.dataset.resolved = Boolean(frame.resolved);
    scene.dataset.tone = frame.tone || (frame.outcome ? "complete" : "normal");
    scene.setAttribute("aria-label", frame.scene_note + " " + frame.observation);
    story.dataset.method = run.id;
    text("[data-story-title]", currentCase.title);
    text("[data-story-subtitle]", currentCase.subtitle);
    text("[data-run-note]", run.note);
    text("[data-run-label]", frame.phase);
    text("[data-frame-title]", frame.title);
    text("[data-scene-note]", frame.scene_note);
    text("[data-frame-count]", String(frameIndex + 1).padStart(2, "0") + " / " + String(run.steps.length).padStart(2, "0"));
    text("[data-story-status]", "Frame " + (frameIndex + 1) + " of " + run.steps.length);
    text("[data-frame-observation]", frame.observation);
    text("[data-frame-decision]", frame.decision);
    text("[data-frame-evidence]", frame.evidence);
    text("[data-story-source]", run.source);
    root.querySelector("[data-frame-source]").hash = currentCase.id === "execution" ? "page=1" : "page=26";
    root.querySelector("[data-raw-panel]").hidden = run.id !== "raw";
    root.querySelector("[data-belief-panel]").hidden = run.id !== "pos";
    if (run.id === "raw") renderHistory(run);
    else {
      ["understanding", "unresolved", "constraint"].forEach(function (key) {
        var changed = previousFrame && previousFrame[key] !== frame[key];
        var row = root.querySelector('[data-belief-row="' + key + '"]');
        row.getAnimations().forEach(function (animation) { animation.cancel(); });
        row.classList.toggle("is-changed", Boolean(changed));
        text("[data-belief-" + key + "]", frame[key]);
        if (changed) motion(row, [{opacity: .35, transform: "translateX(8px)"}, {opacity: 1, transform: "translateX(0)"}], 450);
      });
      text("[data-belief-phase]", frame.phase.indexOf("Recovery") === 0 ? "RECOVER" : frame.phase === "Validate" ? "VALIDATE" : "MAINTAIN");
    }
    text("[data-mug-state]", frame.hot ? "Hot" : frame.heating ? "Heating" : "Not heated");
    var places = {counter: "At the counter", microwave: "In the microwave", cabinet: "In the cabinet"};
    text("[data-mug-place]", places[frame.mug] || "");
    text(".pos-hypothesis--database small", frame.resolved ? "Less supported" : "Possible explanation");
    text(".pos-hypothesis--jvm small", frame.resolved ? "More supported" : "Possible explanation");
    var cpu = root.querySelector("[data-cpu-label]");
    cpu.replaceChildren(document.createTextNode(frame.cpu ? "New observation" : "Agent-selected investigation"));
    var cpuDetail = document.createElement("strong"); cpuDetail.textContent = frame.cpu ? "Increased CPU activity" : "Inspect CPU activity"; cpu.appendChild(cpuDetail);
    text("[data-investigation-status]", frame.counter || (frame.resolved ? "CPU + GC evidence inform the revision." : frame.tone === "stalled" ? "More interactions. No resolved distinction." : frame.cpuPending ? "Seek evidence that separates the alternatives." : "The question remains open."));
    root.querySelector("[data-scene-icon]").className = "fas " + (frame.outcome ? frame.tone === "stalled" ? "fa-minus-circle" : "fa-check-circle" : "fa-arrow-right");
    story.querySelector("[data-story-prev]").disabled = frameIndex === 0;
    story.querySelector("[data-story-next]").disabled = frameIndex === run.steps.length - 1;
    story.querySelectorAll("[data-pos-frame]").forEach(function (button, i) {
      button.classList.toggle("is-read", i < frameIndex);
      if (i === frameIndex) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
    });
    // Scroll the timeline only inside its own strip, never move the document.
    var active = story.querySelector('[data-pos-frame="' + frameIndex + '"]');
    var strip = active.parentElement;
    strip.scrollLeft = active.offsetLeft - strip.offsetLeft - strip.clientWidth / 2 + active.offsetWidth / 2;
    story.querySelector(".pos-step-evidence").open = false;
    story.dataset.frame = frameIndex;
    story.dataset.case = currentCase.id;
    if (previousFrame && currentCase.id === "execution" && previousFrame.mug !== frame.mug) {
      var targetMug = mug.getBoundingClientRect();
      var dx = oldMug.left - targetMug.left;
      var dy = oldMug.top - targetMug.top;
      motion(mug, [
        {transform: "translate(" + dx + "px," + dy + "px) rotate(0deg)"},
        {transform: "translate(" + dx * .5 + "px," + (dy * .5 - 26) + "px) rotate(" + (dx < 0 ? -8 : 8) + "deg)", offset: .5},
        {transform: "translate(0,0) rotate(0deg)"}
      ], 1000);
    }
    if (previousFrame && frame.inspect) motion(scene.querySelector(".pos-inspect-ring"), [
      {transform:"translateX(-12px) rotate(-18deg)",opacity:0},
      {transform:"translateX(10px) rotate(12deg)",opacity:1,offset:.5},
      {transform:"translateX(0) rotate(0deg)",opacity:1}
    ], 900);
    if (previousFrame && currentCase.id === "diagnosis" && (previousFrame.cards !== frame.cards || previousFrame.cpu !== frame.cpu || previousFrame.cpuPending !== frame.cpuPending || frame.inspect)) {
      var card = scene.querySelector(frame.cpu || frame.cpuPending ? ".pos-evidence--cpu" : frame.cards === 1 ? ".pos-evidence--gc" : ".pos-evidence--logs");
      motion(card, [{opacity:0,transform:"translate(28px,14px) rotate(3deg)"},{opacity:1,transform:"translate(0,0) rotate(0deg)"}], 750);
    }
    if (previousFrame && (frame.hot || frame.heating)) motion(scene.querySelector(".pos-steam"), [{transform:"translateY(5px)",opacity:0},{transform:"translateY(-4px)",opacity:1}], 1100);
    // Flush a run reset before enabling door transitions again.
    void scene.offsetWidth;
    scene.classList.remove("is-new-run");
    previousFrame = frame;
    if (frameIndex === run.steps.length - 1) pauseStory();
  }
  function activateTabs(buttons, active) {
    buttons.forEach(function (button) { var selected = button === active; button.setAttribute("aria-selected", String(selected)); button.tabIndex = selected ? 0 : -1; });
  }
  function keyboardTabs(container) {
    container.addEventListener("keydown", function (event) {
      var buttons = Array.prototype.slice.call(container.querySelectorAll('[role="tab"]'));
      var index = buttons.indexOf(document.activeElement);
      if (index < 0 || ["ArrowLeft", "ArrowRight", "Home", "End"].indexOf(event.key) === -1) return;
      event.preventDefault();
      var next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length;
      buttons[next].focus(); buttons[next].click();
    });
  }
  function startRun() {
    pauseStory(); previousFrame = null;
    var strip = story.querySelector(".pos-frame-steps"); strip.replaceChildren();
    currentRun().steps.forEach(function (frame, i) {
      var button = document.createElement("button"); button.type = "button"; button.dataset.posFrame = i;
      button.textContent = i + 1; button.title = frame.title; button.setAttribute("aria-label", "Frame " + (i + 1) + ": " + frame.title);
      strip.appendChild(button);
    });
    showFrame(0);
  }
  var caseTabs = story.querySelectorAll("[data-pos-case]");
  caseTabs.forEach(function (button) {
    button.addEventListener("click", function () {
      caseIndex = Number(button.dataset.posCase); activateTabs(caseTabs, button);
      story.querySelector("#pos-story-reader").setAttribute("aria-labelledby", button.id); startRun();
    });
  });
  var runTabs = story.querySelectorAll("[data-pos-run]");
  runTabs.forEach(function (button) {
    button.addEventListener("click", function () {
      runIndex = Number(button.dataset.posRun); activateTabs(runTabs, button);
      story.querySelector("#pos-run-reader").setAttribute("aria-labelledby", button.id); startRun();
    });
  });
  story.querySelector(".pos-frame-steps").addEventListener("click", function (event) {
    var button = event.target.closest("[data-pos-frame]"); if (button) { pauseStory(); showFrame(Number(button.dataset.posFrame)); }
  });
  story.querySelector("[data-story-prev]").addEventListener("click", function () { pauseStory(); showFrame(frameIndex - 1); });
  story.querySelector("[data-story-next]").addEventListener("click", function () { pauseStory(); showFrame(frameIndex + 1); });
  story.querySelector("[data-story-play]").addEventListener("click", function () {
    if (storyTimer) { pauseStory(); return; }
    if (frameIndex === currentRun().steps.length - 1) showFrame(0);
    setPlayButton(this, true, "story");
    storyTimer = window.setInterval(function () { showFrame(frameIndex + 1); }, 8000);
  });

  var validationStates = {
    candidate: { icon: "fa-file-alt", title: "Two incompatible states in one update.", description: "The candidate records the microwave as both open and closed. It is not ready to guide the next action." },
    check: { icon: "fa-search", title: "Check consistency and the supporting observation.", description: "The Sentinel flags the conflicting states and checks the update against interaction evidence. Issues return to the task agent for revision." },
    revise: { icon: "fa-check-circle", title: "A supported update becomes the decision context.", description: "In this schematic example, the latest observation supports an open microwave. The revised belief retains that state before progress is assessed." }
  };
  var validationTabs = root.querySelectorAll("[data-validation-stage]");
  validationTabs.forEach(function (button) { button.addEventListener("click", function () {
    var state = validationStates[button.dataset.validationStage];
    activateTabs(validationTabs, button);
    root.querySelector(".pos-validator").dataset.validation = button.dataset.validationStage;
    root.querySelector("#pos-validation-panel").setAttribute("aria-labelledby", button.id);
    root.querySelector("[data-validation-icon]").className = "fas " + state.icon;
    text("[data-validation-title]", state.title); text("[data-validation-text]", state.description);
  }); });
  root.querySelector("[data-trap-play]").addEventListener("click", function () {
    if (trapTimer) { pauseTraps(); return; }
    setPlayButton(this, true, "trapping patterns");
    trapTimer = window.setInterval(function () { var el = root.querySelector(".pos-traps"); el.dataset.trapPhase = (Number(el.dataset.trapPhase) + 1) % 3; }, reducedMotion.matches ? 2000 : 1100);
  });
  var patterns = { static: "Do not repeat the ineffective action under the unchanged belief.", cycle: "Break the recurrent transition instead of revisiting the same sequence.", drift: "Re-anchor the next action to the active gap rather than gathering unrelated information." };
  var gaps = { epistemic: "Acquire evidence that distinguishes the remaining explanations.", achievement: "Induce a goal-relevant state change that addresses the unmet requirement." };
  root.querySelector("#pos-pattern").addEventListener("change", function () { text("[data-pattern-constraint]", patterns[this.value]); });
  root.querySelector("#pos-gap").addEventListener("change", function () { text("[data-gap-constraint]", gaps[this.value]); });

  function showResults(index) {
    var model = data.backbones[index];
    var grid = root.querySelector("[data-score-grid]");
    grid.replaceChildren();
    data.benchmarks.forEach(function (benchmark, i) {
      var item = document.createElement("article");
      var heading = document.createElement("h4"); heading.textContent = benchmark;
      var score = document.createElement("p"); score.className = "pos-score"; score.textContent = model.pos[i].toFixed(2);
      var unit = document.createElement("span"); unit.textContent = "%"; score.appendChild(unit);
      var baseline = document.createElement("p"); baseline.textContent = "vs. " + model.best[i].toFixed(2) + "%";
      var name = document.createElement("small"); name.textContent = model.best_names[i];
      var delta = document.createElement("p"); delta.className = "pos-score-delta"; delta.textContent = "+" + (model.pos[i] - model.best[i]).toFixed(2) + " pp";
      item.append(heading, score, baseline, name, delta); grid.appendChild(item);
    });
    var body = root.querySelector("[data-results-body]"); body.replaceChildren();
    model.rows.forEach(function (row) {
      var tr = document.createElement("tr"); if (row.method === "PoS") tr.className = "is-pos";
      var name = document.createElement("th"); name.scope = "row"; name.textContent = row.method; tr.appendChild(name);
      row.values.forEach(function (value) { var cell = document.createElement("td"); cell.textContent = value.toFixed(2); tr.appendChild(cell); }); body.appendChild(tr);
    });
    text("[data-results-caption]", "Table 1 \u00b7 " + model.name + " \u00b7 All values are percentages");
  }
  var backboneTabs = root.querySelectorAll("[data-pos-backbone]");
  backboneTabs.forEach(function (button) { button.addEventListener("click", function () {
    activateTabs(backboneTabs, button);
    root.querySelector("#pos-results-panel").setAttribute("aria-labelledby", button.id);
    showResults(Number(button.dataset.posBackbone));
  }); });
  root.querySelectorAll('[role="tablist"]').forEach(keyboardTabs);
  document.addEventListener("visibilitychange", function () { if (document.hidden) { pauseStory(); pauseTraps(); } });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) { if (!entries[0].isIntersecting) pauseStory(); }).observe(story);
    new IntersectionObserver(function (entries) { if (!entries[0].isIntersecting) pauseTraps(); }).observe(root.querySelector(".pos-traps"));
  }
  reducedMotion.addEventListener("change", function () { pauseStory(); pauseTraps(); });
  startRun(); showResults(0);
}());
