(function () {
  "use strict";
  var root = document.querySelector("[data-gos-case]");
  if (!root) return;
  var fallback = root.querySelector("[data-graph-fallback]");
  if (!window.cytoscape) {
    fallback.textContent = "The graph could not load. The complete case is available in the transcript below.";
    root.querySelectorAll("button, input, select").forEach(function (control) { control.disabled = true; });
    return;
  }
  var data = JSON.parse(root.querySelector("[data-gos-data]").textContent);
  var canvas = root.querySelector(".gos-graph-canvas");
  var range = root.querySelector("[data-case-range]");
  var selector = root.querySelector("[data-node-select]");
  var timeline = root.querySelector(".gos-case-timeline");
  var positions = Object.create(null);
  var stepIndex = 0;
  var timer = null;
  var programmatic = false;
  var manualViewport = false;
  var snapshot;
  var minZoom = 0.6;
  var maxZoom = 1.6;
  var cy = window.cytoscape({
    container: canvas,
    layout: { name: "preset" },
    minZoom: minZoom,
    maxZoom: maxZoom,
    boxSelectionEnabled: false,
    autounselectify: true,
    style: [
      { selector: "node", style: {
        "label": "data(displayLabel)", "font-family": "-apple-system, BlinkMacSystemFont, Arial, sans-serif",
        "font-size": 18, "font-weight": 600, "text-wrap": "wrap", "text-max-width": 128,
        "text-valign": "center", "text-halign": "center", "color": "#275b5c",
        "background-color": "#e6f0f2", "border-width": 1.5, "border-color": "#7b9ea8",
        "width": 146, "height": 82, "overlay-opacity": 0, "text-events": "yes"
      } },
      { selector: "node[kind = 'evidence']", style: {
        "shape": "round-rectangle", "width": 168, "height": 58,
        "background-color": "#fff7e7", "border-color": "#c6ae79", "color": "#77592e",
        "font-size": 16, "font-weight": 500, "text-max-width": 146
      } },
      { selector: "node[kind = 'symptom']", style: {
        "shape": "round-rectangle", "width": 180, "height": 60,
        "background-color": "#e4edf2", "border-color": "#8098a9", "color": "#35576c"
      } },
      { selector: "node[status = 'rejected']", style: {
        "background-color": "#f0f2f3", "border-color": "#a9b5bb", "border-style": "dashed", "color": "#788990"
      } },
      { selector: "node[status = 'confirmed']", style: { "background-color": "#bde0d5", "border-color": "#3a8b78", "border-width": 2.5 } },
      { selector: "node.fresh", style: { "border-width": 3 } },
      { selector: "node.focus", style: { "background-color": "#cde8df", "border-color": "#1a7478", "border-width": 3.5, "underlay-color": "#2f8b8c", "underlay-opacity": 0.08, "underlay-padding": 8 } },
      { selector: "node.inspected", style: { "outline-width": 2, "outline-color": "#b98942", "outline-offset": 4 } },
      { selector: "edge", style: {
        "curve-style": "bezier", "width": 1.8, "line-color": "#a3b5bf", "target-arrow-color": "#a3b5bf",
        "target-arrow-shape": "triangle", "arrow-scale": 0.8, "opacity": 0.55,
        "font-size": 12, "color": "#677b84", "text-background-color": "#fcfdfd",
        "text-background-opacity": 0.95, "text-background-padding": 3, "text-rotation": "autorotate", "overlay-opacity": 0
      } },
      { selector: "edge[relation = 'support']", style: { "line-color": "#69a18b", "target-arrow-color": "#69a18b", "color": "#3b8167" } },
      { selector: "edge[relation = 'refute']", style: { "line-style": "dashed", "line-color": "#c8877d", "target-arrow-color": "#c8877d", "color": "#a65c51" } },
      { selector: "edge.highlight", style: { "label": "data(relation)", "opacity": 1, "width": 2.7 } },
      { selector: "edge.path", style: { "line-color": "#328579", "target-arrow-color": "#328579", "width": 3.5, "opacity": 1 } }
    ]
  });
  fallback.hidden = true;

  function setText(attribute, value) { root.querySelector("[" + attribute + "]").textContent = value; }
  // Rebuild knowledge from step one, so revisiting an earlier snapshot never leaks later evidence.
  function stateAt(index) {
    var nodes = data.nodes.filter(function (node) { return node.born <= index + 1; }).map(function (node) {
      var copy = Object.assign({ status: "open" }, node);
      data.steps.slice(0, index + 1).forEach(function (step) {
        if (step.updates && step.updates[node.id]) Object.assign(copy, step.updates[node.id]);
      });
      return copy;
    });
    return { nodes: nodes, edges: data.edges.filter(function (edge) { return edge.born <= index + 1; }) };
  }
  function pause() {
    window.clearInterval(timer);
    timer = null;
    var button = root.querySelector('[data-case-control="play"]');
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", "Play snapshots");
    button.title = "Play snapshots";
    button.firstElementChild.className = "fas fa-play";
  }
  function updateZoomControls() {
    var zoom = cy.zoom();
    setText("data-zoom-value", Math.round(zoom * 100) + "%");
    root.querySelector('[data-graph-tool="zoom-out"]').disabled = zoom <= minZoom + 0.001;
    root.querySelector('[data-graph-tool="zoom-in"]').disabled = zoom >= maxZoom - 0.001;
  }
  function fitGraph() {
    programmatic = true;
    var bounds = cy.elements().boundingBox();
    var fitted = Math.min((canvas.clientWidth - 80) / bounds.w, (canvas.clientHeight - 80) / bounds.h);
    cy.zoom(Math.max(minZoom, Math.min(1.1, fitted)));
    // Never fit by shrinking below the readable floor; center the active branch instead.
    cy.center(fitted < minZoom ? cy.getElementById(data.steps[stepIndex].focus) : cy.elements());
    programmatic = false;
    updateZoomControls();
  }
  function inspect(id) {
    var node = snapshot.nodes.find(function (item) { return item.id === id; });
    if (!node) return;
    selector.value = id;
    cy.nodes().removeClass("inspected");
    if (id !== data.steps[stepIndex].focus) cy.getElementById(id).addClass("inspected");
    cy.edges().removeClass("highlight");
    cy.getElementById(id).connectedEdges().addClass("highlight");
    var meta = node.kind === "hypothesis" ? "Hypothesis \u00b7 Depth " + node.depth + " \u00b7 Confidence " + node.confidence.toFixed(2) + " \u00b7 " + node.status : node.kind === "evidence" ? "Evidence \u00b7 Observed at step " + node.born : "Surface symptom \u00b7 Step 1";
    setText("data-node-meta", meta);
    setText("data-node-description", node.detail);
    var relations = root.querySelector("[data-node-relations]");
    relations.replaceChildren();
    var relationLabels = { derive: ["Derives", "Derived from"], refine: ["Refines", "Refined from"], support: ["Supports", "Supported by"], refute: ["Refutes", "Refuted by"] };
    snapshot.edges.filter(function (edge) { return edge.source === id || edge.target === id; }).forEach(function (edge) {
      var incoming = edge.target === id;
      var other = snapshot.nodes.find(function (item) { return item.id === (incoming ? edge.source : edge.target); });
      var item = document.createElement("li");
      var label = document.createElement("span");
      label.textContent = relationLabels[edge.relation][incoming ? 1 : 0];
      item.dataset.relation = edge.relation;
      item.append(label, document.createTextNode(other.label));
      relations.appendChild(item);
    });
  }
  function render(index) {
    stepIndex = Math.max(0, Math.min(data.steps.length - 1, index));
    var step = data.steps[stepIndex];
    snapshot = stateAt(stepIndex);
    programmatic = true;
    cy.batch(function () {
      cy.elements().remove();
      cy.add(snapshot.nodes.map(function (node) {
        return {
          data: Object.assign({}, node, { displayLabel: node.label + (node.kind === "hypothesis" ? "\n" + node.confidence.toFixed(2) : "") }),
          position: positions[node.id] || { x: node.x, y: node.y },
          classes: (node.id === step.focus ? "focus " : "") + (node.born === stepIndex + 1 ? "fresh" : "")
        };
      }));
      cy.add(snapshot.edges.map(function (edge, i) { return { data: Object.assign({ id: "edge-" + i }, edge) }; }));
      var ancestor = step.focus;
      while (ancestor !== "alert") {
        var parent = cy.edges().filter(function (edge) { return edge.data("target") === ancestor && ["derive", "refine"].indexOf(edge.data("relation")) !== -1; }).first();
        if (!parent.length) break;
        parent.addClass("path");
        ancestor = parent.data("source");
      }
    });
    programmatic = false;
    setText("data-step-count", String(stepIndex + 1).padStart(2, "0") + " / 20");
    setText("data-step-action", step.action);
    root.querySelector("[data-step-action]").dataset.action = step.action;
    setText("data-step-title", step.title);
    setText("data-step-observation", step.observation);
    setText("data-step-decision", step.decision);
    setText("data-case-progress", (stepIndex + 1) + " / 20");
    range.value = stepIndex + 1;
    range.style.setProperty("--case-progress", (stepIndex / (data.steps.length - 1) * 100) + "%");
    range.setAttribute("aria-valuetext", "Step " + (stepIndex + 1) + " of 20: " + step.title);
    root.querySelector('[data-case-control="prev"]').disabled = stepIndex === 0;
    root.querySelector('[data-case-control="next"]').disabled = stepIndex === 19;
    root.querySelectorAll("[data-case-step]").forEach(function (button, i) {
      button.classList.toggle("is-visited", i < stepIndex);
      if (i === stepIndex) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
    });
    var active = timeline.children[stepIndex];
    if (active.offsetLeft < timeline.scrollLeft || active.offsetLeft + active.offsetWidth > timeline.scrollLeft + timeline.clientWidth) {
      timeline.scrollLeft = active.offsetLeft - timeline.clientWidth / 2 + active.offsetWidth / 2;
    }
    selector.replaceChildren();
    snapshot.nodes.forEach(function (node) {
      var option = document.createElement("option");
      option.value = node.id;
      option.textContent = node.label;
      selector.appendChild(option);
    });
    var focus = snapshot.nodes.find(function (node) { return node.id === step.focus; });
    setText("data-focus-label", focus.label);
    setText("data-focus-depth", focus.depth ? "Hypothesis depth " + focus.depth : "Surface symptom");
    canvas.setAttribute("aria-label", "Snapshot " + (stepIndex + 1) + ": " + step.title + ". " + snapshot.nodes.length + " nodes. Current focus: " + focus.label + ". Use Inspect a node for details.");
    inspect(step.focus);
    if (!manualViewport) fitGraph();
    if (stepIndex === 19) pause();
    root.dataset.snapshot = stepIndex + 1;
  }

  var depthLayer = root.querySelector(".gos-depth-lines");
  var rows = [60, 240, 440, 650, 860].map(function (y, i) {
    var line = document.createElement("div");
    line.className = "gos-depth-line";
    var label = document.createElement("span");
    label.textContent = i ? "DEPTH " + i : "SYMPTOM";
    line.appendChild(label);
    depthLayer.appendChild(line);
    return { element: line, y: y, depth: i };
  });
  var rowFrame = null;
  function drawRows() {
    if (rowFrame) return;
    rowFrame = window.requestAnimationFrame(function () {
      rowFrame = null;
      var maxDepth = snapshot ? Math.max.apply(null, snapshot.nodes.map(function (node) { return node.depth || 0; })) : 0;
      rows.forEach(function (row) {
        row.element.style.top = (row.y * cy.zoom() + cy.pan().y) + "px";
        row.element.hidden = row.depth > maxDepth;
      });
    });
  }
  cy.on("pan zoom", function () { if (!programmatic) manualViewport = true; drawRows(); updateZoomControls(); });
  cy.on("render", drawRows);
  cy.on("grab", "node", pause);
  cy.on("dragfree", "node", function (event) {
    var node = event.target;
    if (node.data("kind") === "hypothesis" || node.data("kind") === "symptom") node.position("y", node.data("y"));
    positions[node.id()] = { x: node.position("x"), y: node.position("y") };
    manualViewport = true;
  });
  cy.on("tap", "node", function (event) { pause(); inspect(event.target.id()); });
  selector.addEventListener("change", function () {
    pause(); inspect(selector.value);
    programmatic = true;
    cy.center(cy.getElementById(selector.value));
    programmatic = false;
  });
  range.addEventListener("input", function () { pause(); render(Number(range.value) - 1); });
  root.querySelectorAll("[data-case-step]").forEach(function (button) {
    button.addEventListener("click", function () { pause(); render(Number(button.dataset.caseStep)); });
  });
  root.querySelectorAll("[data-case-control]").forEach(function (button) {
    button.addEventListener("click", function () {
      var action = button.dataset.caseControl;
      if (action !== "play") { pause(); render(stepIndex + (action === "next" ? 1 : -1)); return; }
      if (timer) { pause(); return; }
      if (stepIndex === 19) render(0);
      button.setAttribute("aria-pressed", "true");
      button.setAttribute("aria-label", "Pause snapshots");
      button.title = "Pause snapshots";
      button.firstElementChild.className = "fas fa-pause";
      timer = window.setInterval(function () { render(stepIndex + 1); }, 6500);
    });
  });
  root.querySelectorAll("[data-graph-tool]").forEach(function (button) {
    button.addEventListener("click", function () {
      pause();
      var action = button.dataset.graphTool;
      if (action === "reset") { positions = Object.create(null); manualViewport = false; render(stepIndex); return; }
      if (action === "fit") { fitGraph(); manualViewport = false; return; }
      manualViewport = true;
      cy.zoom({ level: Math.max(minZoom, Math.min(maxZoom, cy.zoom() * (action === "zoom-in" ? 1.2 : 1 / 1.2))), renderedPosition: { x: canvas.clientWidth / 2, y: canvas.clientHeight / 2 } });
    });
  });
  document.addEventListener("visibilitychange", function () { if (document.hidden) pause(); });
  if ("IntersectionObserver" in window) new IntersectionObserver(function (entries) { if (!entries[0].isIntersecting) pause(); }).observe(root);
  new ResizeObserver(function () { cy.resize(); if (!manualViewport) fitGraph(); drawRows(); }).observe(canvas);
  render(0);
}());
