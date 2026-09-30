(function () {
  "use strict";
  var root = document.querySelector("[data-pos-project]");
  if (!root) return;
  var data = JSON.parse(root.querySelector("[data-pos-data]").textContent);
  var stories = JSON.parse(root.querySelector("[data-pos-stories]").textContent);
  var story = root.querySelector("[data-pos-story]");
  var scene = story.querySelector(".pos-comic-scene");
  var caseIndex = 0;
  var runIndex = 1;
  var frameIndex = 0;
  var storyTimer = null;
  var trapTimer = null;
  var previousFrame = null;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var graph = null;
  var graphPositions = {};
  var graphWidth = 0;
  var graphContainer = story.querySelector("[data-pos-graph]");
  function graphViewport() {
    if (!graph || !graphContainer.clientWidth) return;
    graph.resize();
    var width = graphContainer.clientWidth;
    var zoom = Math.max(.75, Math.min(1, width / 360));
    graph.zoom(zoom); graph.pan({x: (width - 360 * zoom) / 2, y: (graphContainer.clientHeight - 280 * zoom) / 2});
    graphWidth = width;
  }
  function ensureGraph() {
    if (graph || !window.cytoscape) return;
    graphContainer.querySelector("[data-graph-fallback]").hidden = true;
    graph = window.cytoscape({container: graphContainer, elements: [], layout: {name: "preset"}, minZoom: .75, maxZoom: 1.35, wheelSensitivity: .12, zoom: 1,
      style: [
        {selector: "node", style: {label: "data(label)", width: 40, height: 40, "background-color": "#527e9a", "border-width": 2, "border-color": "#dbe7ee", "font-family": "Arial, sans-serif", "font-size": 11, color: "#33434d", "text-valign": "bottom", "text-margin-y": 7, "text-wrap": "wrap", "text-max-width": 100, "overlay-opacity": 0}},
        {selector: 'node[kind = "state"]', style: {shape: "round-rectangle", width: 65, height: 30, "background-color": "#e6f1ec", "border-color": "#85b3a2"}},
        {selector: 'node[kind = "evidence"]', style: {shape: "diamond", "background-color": "#bda271", "border-color": "#f0e7d6"}},
        {selector: ".resolved", style: {"background-color": "#368976", "border-color": "#b0d9cd"}},
        {selector: ".weakened", style: {"background-color": "#d0b3aa", "border-color": "#f0dfd9"}},
        {selector: ".changed", style: {"border-width": 4, "border-color": "#68aa99"}},
        {selector: "edge", style: {width: 1.5, "curve-style": "bezier", "target-arrow-shape": "triangle", "line-color": "#b3c6cd", "target-arrow-color": "#b3c6cd", label: "data(label)", "font-size": 9, color: "#657881", "text-background-color": "#ffffff", "text-background-opacity": 1, "text-background-padding": 3, "text-rotation": "autorotate"}},
        {selector: 'edge[kind = "support"]', style: {"line-color": "#73a495", "target-arrow-color": "#73a495"}}
      ]});
    graphContainer._posCy = graph;
    graph.on("dragfree", "node", function (event) { graphPositions[event.target.id()] = {...event.target.position()}; });
    graph.on("tap", "node", function (event) { text("[data-belief-understanding]", event.target.data("detail") || event.target.data("label")); });
    new ResizeObserver(function () { if (graphContainer.clientWidth !== graphWidth) graphViewport(); else graph.resize(); }).observe(graphContainer);
  }
  function drawBelief(frame, reset) {
    graphContainer.querySelectorAll(".pos-evidence-pulse").forEach(function (pulse) { pulse.getAnimations().forEach(function (a) { a.cancel(); }); pulse.remove(); });
    graphContainer.classList.toggle("is-empty", frame.world === 0);
    ensureGraph();
    if (!graph) { text("[data-graph-fallback]", frame.understanding); return; }
    graph.resize();
    if (reset) { graph.elements().remove(); graphPositions = {}; graphViewport(); }
    var w = 360;
    var elements = [];
    function node(id, label, kind, x, y, detail, classes) { elements.push({data: {id: id, label: label, kind: kind, detail: detail || label}, position: graphPositions[id] || {x: x, y: y}, classes: classes || ""}); }
    function edge(from, to, label, kind) { elements.push({data: {id: from + "-" + to, source: from, target: to, label: label, kind: kind || "relation"}}); }
    if (frame.world !== 0) {
      if (caseIndex === 0) {
        node("mug", "Mug 3", "entity", w / 2, 42);
        node("temperature", frame.hot ? "Hot" : frame.heating ? "Heating" : "Not hot", "state", 78, 126, "Temperature requirement: " + (frame.hot ? "fulfilled" : "unfulfilled"), frame.hot ? "resolved" : "");
        node("location", frame.mug === "cabinet" ? "In Cabinet 1" : frame.mug === "microwave" ? "In Microwave 1" : "At counter", "state", w - 78, 126);
        node("microwave", "Microwave 1", "entity", w * .28, 216, "Appliance used to cause the heating transition.");
        node("cabinet", "Cabinet 1", "entity", w * .72, 216, "Target location. Temperature must also satisfy the goal.", frame.outcome ? "resolved" : "");
        edge("mug", "temperature", "has state"); edge("mug", "location", "located");
        edge("microwave", "temperature", "can change"); edge("location", "cabinet", "target");
      } else {
        node("inventory", "Inventory", "entity", w / 2, 35, "Entity under investigation: inventory service.", frame.resolved ? "resolved" : "");
        node("jvm", "JVM processing", "state", 96, 124, "A competing explanation for request delay.", frame.resolved ? "resolved" : "");
        node("database", "Database waiting", "state", w - 96, 124, "Alternative explanation; weakened by the combined CPU + GC evidence.", frame.resolved ? "weakened" : "");
        edge("inventory", "jvm", "possible cause"); edge("inventory", "database", "alternative");
        if (frame.cards >= 1) { node("gc", "Elevated GC", "evidence", 68, 219); edge("gc", "jvm", "earlier clue", "support"); }
        if (frame.cards >= 2) { node("logs", "Log searches", "evidence", w / 2, 219, "Further logs have not resolved the active distinction."); edge("logs", "inventory", "investigates"); }
        if (frame.cpu) { node("cpu", "CPU activity", "evidence", w - 68, 219, "New CPU evidence is considered together with the GC clue."); edge("cpu", "jvm", "adds support", "support"); }
      }
    }
    var ids = new Set(elements.map(function (item) { return item.data.id; }));
    graph.batch(function () {
      graph.elements().forEach(function (item) { if (!ids.has(item.id())) { if (item.isNode()) graphPositions[item.id()] = {...item.position()}; item.remove(); } });
      elements.forEach(function (item) {
        var existing = graph.getElementById(item.data.id);
        var changed = existing.length && existing.data("label") !== item.data.label;
        if (!existing.length) { existing = graph.add(item); changed = !reset; }
        else existing.data(item.data);
        if (existing.isNode()) existing.classes((item.classes || "") + (changed ? " changed" : ""));
      });
    });
    text("[data-belief-understanding]", frame.world === 0 ? "The task arrives before the world model is constructed." : frame.understanding);
    // A new observation travels into the belief; scrubbing restores snapshots without residual effects.
    if (caseIndex === 1 && previousFrame && !reducedMotion.matches && frameIndex === Number(story.dataset.frame) + 1) {
      var evidenceId = frame.cpu && !previousFrame.cpu ? "cpu" : frame.cards >= 1 && !previousFrame.cards ? "gc" : null;
      if (evidenceId) {
        var source = graph.getElementById(evidenceId).renderedPosition();
        var target = graph.getElementById("jvm").renderedPosition();
        var pulse = document.createElement("span"); pulse.className = "pos-evidence-pulse"; pulse.setAttribute("aria-hidden", "true"); graphContainer.appendChild(pulse);
        var animation = pulse.animate([{transform: "translate(" + source.x + "px," + source.y + "px)", opacity: 0}, {opacity: 1, offset: .2}, {transform: "translate(" + target.x + "px," + target.y + "px)", opacity: 0}], {duration: 850, easing: "ease-in-out"});
        animation.onfinish = function () { pulse.remove(); };
      }
    }
  }
  story.querySelectorAll("[data-graph-zoom]").forEach(function (button) { button.addEventListener("click", function () {
    if (!graph) return;
    if (button.dataset.graphZoom === "reset") graphViewport();
    else graph.zoom({level: Math.max(.75, Math.min(1.35, graph.zoom() + (button.dataset.graphZoom === "in" ? .1 : -.1))), renderedPosition: {x: graphContainer.clientWidth / 2, y: graphContainer.clientHeight / 2}});
  }); });
  function text(selector, value) { root.querySelector(selector).textContent = value; }
  function currentRun() { return stories[caseIndex].runs[runIndex]; }
  function setPlayButton(button, playing, label) {
    button.setAttribute("aria-pressed", String(playing));
    button.setAttribute("aria-label", (playing ? "Pause " : "Play ") + label);
    button.title = (playing ? "Pause " : "Play ") + label;
    button.firstElementChild.className = "fas " + (playing ? "fa-pause" : "fa-play");
  }
  function pauseStory() { window.clearTimeout(storyTimer); storyTimer = null; setPlayButton(story.querySelector("[data-story-play]"), false, "story"); }
  function queueFrame() { storyTimer = window.setTimeout(function () { showFrame(frameIndex + 1); if (frameIndex < currentRun().steps.length - 1) queueFrame(); }, currentRun().steps[frameIndex].duration); }
  function pauseTraps() { window.clearInterval(trapTimer); trapTimer = null; setPlayButton(root.querySelector("[data-trap-play]"), false, "trapping patterns"); }
  function motion(element, keyframes, duration) {
    if (!reducedMotion.matches && element.animate) element.animate(keyframes, {duration: duration || 650, easing: "cubic-bezier(.22,.7,.25,1)"});
  }
  function renderHistory(run) {
    var list = story.querySelector("[data-trajectory-log]");
    if (!previousFrame) list.replaceChildren();
    while (list.children.length > frameIndex + 1) list.lastElementChild.remove();
    var firstNewEntry = list.children.length;
    run.steps.slice(firstNewEntry, frameIndex + 1).forEach(function (step, offset) {
      var i = firstNewEntry + offset;
      var li = document.createElement("li");
      var index = document.createElement("span"); index.className = "pos-log-index"; index.textContent = String(i + 1).padStart(2, "0");
      var body = document.createElement("div");
      ["action", "observation"].forEach(function (key) {
        var label = document.createElement("h5");
        var icon = document.createElement("i"); icon.className = "fas " + (key === "action" ? i === 0 ? "fa-flag" : "fa-arrow-right" : "fa-eye"); icon.setAttribute("aria-hidden", "true");
        label.append(icon, document.createTextNode(key === "action" ? i === 0 ? "Task / context" : "Action" : "Observation"));
        var value = document.createElement("p"); value.textContent = step.entry[key];
        body.append(label, value);
      });
      li.append(index, body); list.appendChild(li);
    });
    Array.prototype.forEach.call(list.children, function (entry, i) {
      if (i === frameIndex) entry.setAttribute("aria-current", "step");
      else entry.removeAttribute("aria-current");
    });
    list.scrollTop = list.scrollHeight;
    text("[data-log-count]", String(frameIndex + 1).padStart(2, "0"));
    text("[data-history-note]", caseIndex === 0 ? "Paraphrased from Figure 1; not verbatim tool logs." : "Illustrative history, not a recorded baseline trace.");
    if (previousFrame && firstNewEntry <= frameIndex) motion(list.lastElementChild, [{opacity: .2, transform: "translateY(18px)"}, {opacity: 1, transform: "translateY(0)"}]);
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
    scene.dataset.hypotheses = frameIndex >= 2;
    scene.dataset.recovering = run.id === "pos" && frame.phase.indexOf("Recovery") === 0;
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
    story.querySelector("[data-story-progress]").style.transform = "scaleX(" + ((frameIndex + 1) / run.steps.length) + ")";
    text("[data-story-status]", "Frame " + (frameIndex + 1) + " of " + run.steps.length);
    text("[data-frame-observation]", frame.observation);
    text("[data-frame-decision]", frame.decision);
    text("[data-frame-evidence]", frame.evidence);
    text("[data-story-source]", run.source);
    root.querySelector("[data-raw-panel]").hidden = run.id !== "raw";
    root.querySelector("[data-belief-panel]").hidden = run.id !== "pos";
    if (run.id === "raw") renderHistory(run);
    else {
      ["unresolved", "constraint"].forEach(function (key) {
        var changed = previousFrame && previousFrame[key] !== frame[key];
        var row = root.querySelector('[data-belief-row="' + key + '"]');
        row.getAnimations().forEach(function (animation) { animation.cancel(); });
        row.classList.toggle("is-changed", Boolean(changed));
        text("[data-belief-" + key + "]", frame[key]);
        if (changed) motion(row, [{opacity: .35, transform: "translateX(8px)"}, {opacity: 1, transform: "translateX(0)"}], 450);
      });
      text("[data-belief-phase]", frame.outcome ? "COMPLETE" : frame.phase.indexOf("Recovery") === 0 ? "RECOVER" : frame.phase === "Validate" ? "VALIDATE" : "MAINTAIN");
      drawBelief(frame, !previousFrame);
      text("[data-sentinel]", frame.sentinel || "Validated belief");
      text("[data-belief-health]", frame.health || (frame.tone === "stalled" ? "Low progress" : frame.resolved ? "Progress restored" : ""));
    }
    text("[data-mug-state]", frame.hot ? "Hot" : frame.heating ? "Heating" : "Not heated");
    var places = {counter: "At the counter", microwave: "In the microwave", cabinet: "In the cabinet"};
    text("[data-mug-place]", places[frame.mug] || "");
    story.querySelector("[data-scene-counter]").hidden = currentCase.id !== "execution" || !frame.counter;
    text("[data-scene-counter-text]", frame.counter || "");
    var focus = frame.resolved ? {icon: "fa-check-circle", label: "Combine the evidence"} : frame.cpu || frame.cpuPending ? {icon: "fa-microchip", label: "Inspect CPU activity"} : scene.dataset.recovering === "true" ? {icon: "fa-compass", label: "Redirect the investigation"} : frame.tone === "stalled" ? {icon: "fa-pause-circle", label: "The question remains open"} : {icon: "fa-search", label: frame.cards === 2 ? "Investigate the logs" : "Investigate the delay"};
    text("[data-focus-label]", focus.label);
    story.querySelector("[data-focus-icon]").className = "fas " + focus.icon;
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
    story.querySelector("[data-story-timeline]").value = frameIndex;
    text("[data-action-index]", frame.action_index || "Display frame · mechanism view");
    story.querySelectorAll("[data-milestone]").forEach(function (button) { button.classList.toggle("is-active", Number(button.dataset.milestone) <= frameIndex); });
    root.dispatchEvent(new CustomEvent("pos:frame", {detail: {caseId: currentCase.id, runId: run.id, frame: frame, reset: !previousFrame, index: frameIndex}}));
    if (previousFrame && currentCase.id === "execution") {
      var targetMug = mug.getBoundingClientRect();
      var dx = oldMug.left - targetMug.left;
      var dy = oldMug.top - targetMug.top;
      if (Math.abs(dx) + Math.abs(dy) > 1) motion(mug, [
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
    if (previousFrame && currentCase.id === "diagnosis" && !previousFrame.resolved && frame.resolved) {
      motion(scene.querySelector(".pos-hypothesis--jvm"), [{transform:"translateY(8px)",opacity:.5},{transform:"translateY(0)",opacity:1}], 700);
    }
    if (!previousFrame) motion(scene.querySelector(currentCase.id === "execution" ? ".pos-kitchen" : ".pos-investigation"), [{opacity:0,transform:"translateY(8px)"},{opacity:1,transform:"translateY(0)"}], 450);
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
    var milestones = story.querySelector("[data-story-milestones]"); milestones.replaceChildren();
    currentRun().steps.forEach(function (frame, i) { if (!frame.milestone) return; var button = document.createElement("button"); button.type = "button"; button.dataset.milestone = i; button.textContent = frame.milestone; milestones.appendChild(button); });
    story.querySelector("[data-story-timeline]").max = currentRun().steps.length - 1;
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
  story.querySelector("[data-story-timeline]").addEventListener("input", function () { pauseStory(); showFrame(Number(this.value)); });
  story.querySelector("[data-story-milestones]").addEventListener("click", function (event) { var button = event.target.closest("[data-milestone]"); if (button) { pauseStory(); showFrame(Number(button.dataset.milestone)); } });
  story.querySelector("[data-story-play]").addEventListener("click", function () {
    if (storyTimer) { pauseStory(); return; }
    if (frameIndex === currentRun().steps.length - 1) showFrame(0);
    setPlayButton(this, true, "story");
    queueFrame();
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
  var storyInView = false;
  function updateSceneVisibility() { story.classList.toggle("is-in-view", storyInView && !document.hidden); }
  document.addEventListener("visibilitychange", function () { updateSceneVisibility(); if (document.hidden) { pauseStory(); pauseTraps(); } });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) { storyInView = entries[0].isIntersecting; updateSceneVisibility(); if (!storyInView) pauseStory(); }).observe(story);
    new IntersectionObserver(function (entries) { if (!entries[0].isIntersecting) pauseTraps(); }).observe(root.querySelector(".pos-traps"));
  }
  reducedMotion.addEventListener("change", function () { pauseStory(); pauseTraps(); });
  startRun(); showResults(0);
}());
