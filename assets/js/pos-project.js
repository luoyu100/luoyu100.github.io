(function () {
  "use strict";
  var root = document.querySelector("[data-pos-project]");
  if (!root) return;
  var data = JSON.parse(root.querySelector("[data-pos-data]").textContent);
  var story = root.querySelector("[data-pos-story]");
  var scene = story.querySelector(".pos-comic-scene");
  var caseIndex = 0;
  var frameIndex = 0;
  var storyTimer = null;
  var trapTimer = null;
  var previousFrame = null;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  function text(selector, value) { root.querySelector(selector).textContent = value; }
  function setPlayButton(button, playing, label) {
    button.setAttribute("aria-pressed", String(playing));
    button.setAttribute("aria-label", (playing ? "Pause " : "Play ") + label);
    button.title = (playing ? "Pause " : "Play ") + label;
    button.firstElementChild.className = "fas " + (playing ? "fa-pause" : "fa-play");
  }
  function pauseStory() { window.clearInterval(storyTimer); storyTimer = null; setPlayButton(story.querySelector("[data-story-play]"), false, "story"); }
  function pauseTraps() { window.clearInterval(trapTimer); trapTimer = null; setPlayButton(root.querySelector("[data-trap-play]"), false, "trapping patterns"); }
  function showFrame(index) {
    var currentCase = data.cases[caseIndex];
    frameIndex = Math.max(0, Math.min(currentCase.steps.length - 1, index));
    var frame = currentCase.steps[frameIndex];
    scene.classList.toggle("is-new-run", !previousFrame || previousFrame.run !== frame.run);
    scene.dataset.comic = currentCase.id;
    scene.dataset.stage = frame.stage;
    scene.dataset.run = frame.run;
    scene.setAttribute("aria-label", frame.scene_note + " " + frame.observation);
    text("[data-story-title]", currentCase.title);
    text("[data-story-subtitle]", currentCase.subtitle);
    text("[data-run-label]", frame.badge);
    text("[data-frame-title]", frame.title);
    text("[data-scene-note]", frame.scene_note);
    text("[data-frame-count]", String(frameIndex + 1).padStart(2, "0") + " / 06");
    text("[data-story-status]", "Frame " + (frameIndex + 1) + " of " + currentCase.steps.length);
    text("[data-frame-observation]", frame.observation);
    text("[data-frame-decision]", frame.decision);
    text("[data-frame-evidence]", frame.evidence);
    text("[data-story-source]", currentCase.source);
    var source = root.querySelector("[data-frame-source]");
    source.hash = currentCase.id === "execution" ? "page=1" : "page=26";
    ["understanding", "unresolved", "constraint"].forEach(function (key) {
      var changed = previousFrame && previousFrame[key] !== frame[key];
      root.querySelector('[data-belief-row="' + key + '"]').classList.toggle("is-changed", Boolean(changed));
      text("[data-belief-" + key + "]", frame[key]);
    });
    var reveal = root.querySelector("[data-reveal-gap]");
    reveal.hidden = !frame.reveal;
    if (frame.reveal) text("[data-belief-unresolved]", "The goal still has an unmet requirement.");
    story.querySelector("[data-story-prev]").disabled = frameIndex === 0;
    story.querySelector("[data-story-next]").disabled = frameIndex === currentCase.steps.length - 1;
    story.querySelectorAll("[data-pos-frame]").forEach(function (button, i) {
      button.title = currentCase.steps[i].title;
      button.setAttribute("aria-label", "Frame " + (i + 1) + ": " + currentCase.steps[i].title);
      button.classList.toggle("is-read", i < frameIndex);
      if (i === frameIndex) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
    });
    story.querySelector(".pos-step-evidence").open = false;
    var resolved = frame.stage === "revised" || frame.stage === "resolved";
    text(".pos-hypothesis--database small", resolved ? "Less supported" : "Possible explanation");
    text(".pos-hypothesis--jvm small", resolved ? "More supported" : "Possible explanation");
    var statuses = { investigating: "One unresolved question.", trapped: "Static stagnation + epistemic gap", redirecting: "The agent chooses to inspect CPU activity.", exploring: "3 further low-progress actions", revised: "Targeted gap resolved at step 26.", resolved: "Correct entity and failure type at step 27." };
    text("[data-investigation-status]", statuses[frame.stage] || "");
    previousFrame = frame;
    story.dataset.frame = frameIndex;
    story.dataset.case = currentCase.id;
    if (frameIndex === currentCase.steps.length - 1) pauseStory();
    // A new run resets the scene rather than animating a takeover of the preceding run.
    window.requestAnimationFrame(function () { window.requestAnimationFrame(function () { scene.classList.remove("is-new-run"); }); });
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
  var caseTabs = story.querySelectorAll("[data-pos-case]");
  caseTabs.forEach(function (button) {
    button.addEventListener("click", function () {
      pauseStory(); caseIndex = Number(button.dataset.posCase); previousFrame = null;
      activateTabs(caseTabs, button);
      story.querySelector('[role="tabpanel"]').setAttribute("aria-labelledby", button.id);
      showFrame(0);
    });
  });
  story.querySelectorAll("[data-pos-frame]").forEach(function (button) { button.addEventListener("click", function () { pauseStory(); showFrame(Number(button.dataset.posFrame)); }); });
  story.querySelector("[data-story-prev]").addEventListener("click", function () { pauseStory(); showFrame(frameIndex - 1); });
  story.querySelector("[data-story-next]").addEventListener("click", function () { pauseStory(); showFrame(frameIndex + 1); });
  story.querySelector("[data-story-play]").addEventListener("click", function () {
    if (storyTimer) { pauseStory(); return; }
    if (frameIndex === data.cases[caseIndex].steps.length - 1) showFrame(0);
    setPlayButton(this, true, "story");
    storyTimer = window.setInterval(function () { showFrame(frameIndex + 1); }, 7000);
  });
  root.querySelector("[data-reveal-gap]").addEventListener("click", function () {
    pauseStory(); text("[data-belief-unresolved]", data.cases[caseIndex].steps[frameIndex].unresolved); this.hidden = true;
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
  showFrame(0); showResults(0);
}());
