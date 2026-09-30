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
  var confidenceFrame = null;
  var flowFrame = null;
  var graphVisible = false;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
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
        "label": "", "shape": "round-rectangle", "background-image": "data(cardImage)",
        "background-fit": "contain", "background-clip": "none", "background-opacity": 0,
        "border-width": 0, "width": 178, "height": 98, "overlay-opacity": 0
      } },
      { selector: "node[kind = 'evidence']", style: {
        "width": 178, "height": 78
      } },
      { selector: "node[kind = 'symptom']", style: {
        "width": 178, "height": 78
      } },
      { selector: "node.focus", style: { "underlay-color": "#8dcab0", "underlay-opacity": 0.09, "underlay-padding": 7, "underlay-shape": "round-rectangle" } },
      { selector: "node.inspected", style: { "outline-width": 1.5, "outline-color": "#bfa576", "outline-offset": 5 } },
      { selector: "edge", style: {
        "curve-style": "bezier", "width": 1.4, "line-color": "#7b9597", "target-arrow-color": "#7b9597",
        "target-arrow-shape": "triangle", "arrow-scale": 0.8, "opacity": 0.55,
        "font-size": 11, "color": "#a8c2b9", "text-background-color": "#1c242a",
        "text-background-opacity": 0.95, "text-background-padding": 3, "text-rotation": "autorotate", "overlay-opacity": 0
      } },
      { selector: "edge[relation = 'support']", style: { "line-color": "#71ad91", "target-arrow-color": "#71ad91", "color": "#91c3a8" } },
      { selector: "edge[relation = 'refute']", style: { "line-style": "dashed", "line-color": "#c48573", "target-arrow-color": "#c48573", "color": "#d49f8c" } },
      { selector: "edge.highlight", style: { "label": "data(relation)", "opacity": 1, "width": 2.2 } },
      { selector: "edge.path", style: { "line-color": "#87c4a7", "target-arrow-color": "#87c4a7", "width": 2.4, "opacity": 1 } },
      { selector: "edge.fresh-edge, edge.path, edge.highlight", style: { "line-style": "dashed", "line-dash-pattern": [7, 5] } }
    ]
  });
  fallback.hidden = true;

  function setText(attribute, value) { root.querySelector("[" + attribute + "]").textContent = value; }
  function xml(value) { return String(value).replace(/[&<>"']/g, function (char) { return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[char]; }); }
  function cardImage(node, focused) {
    var hypothesis = node.kind === "hypothesis";
    var height = hypothesis ? 98 : 78;
    var rejected = node.status === "rejected";
    var accent = rejected ? "#71817f" : focused || node.status === "confirmed" ? "#91cbb1" : node.kind === "evidence" ? "#c3a477" : node.kind === "symptom" ? "#94bace" : "#8ca7b3";
    var background = rejected ? "#2b3237" : focused || node.status === "confirmed" ? "#28453b" : node.kind === "evidence" ? "#37332a" : "#283a43";
    var foreground = rejected ? "#a2b0a9" : "#e3ece6";
    var words = node.label.split(" "), lines = [""];
    words.forEach(function (word) { var last = lines.length - 1; if (lines[last] && (lines[last] + " " + word).length > 19) { lines.push(word); } else lines[last] += (lines[last] ? " " : "") + word; });
    var type = hypothesis ? "HYPOTHESIS / D" + node.depth : node.kind === "evidence" ? "EVIDENCE / " + String(node.born).padStart(2,"0") : "SURFACE SYMPTOM";
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="178" height="' + height + '" viewBox="0 0 178 ' + height + '"><rect x="1" y="1" width="176" height="' + (height-2) + '" rx="6" fill="' + background + '" stroke="' + accent + '" stroke-opacity="' + (focused ? 1 : .5) + '"' + (rejected ? ' stroke-dasharray="4 3"' : '') + '/><text x="14" y="20" font-family="Arial,sans-serif" font-size="8" fill="' + accent + '">' + type + '</text>';
    lines.slice(0,2).forEach(function (line,i) { svg += '<text x="14" y="' + (41 + i*18) + '" font-family="Arial,sans-serif" font-size="16" font-weight="500" fill="' + foreground + '">' + xml(line) + '</text>'; });
    if (hypothesis) {
      svg += '<rect x="14" y="80" width="109" height="3" rx="1" fill="#ffffff14"/><rect x="14" y="80" width="' + (node.confidence*109).toFixed(1) + '" height="3" rx="1" fill="' + accent + '"/><text x="158" y="85" text-anchor="end" font-family="monospace" font-size="10" fill="' + accent + '">' + node.confidence.toFixed(2) + '</text>';
    }
    svg += '<circle cx="170" cy="' + (height/2) + '" r="2.5" fill="' + accent + '"/></svg>';
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }
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
  function fitGraph(animate) {
    programmatic = true;
    var bounds = cy.elements().boundingBox();
    var fitted = Math.min((canvas.clientWidth - 80) / bounds.w, (canvas.clientHeight - 80) / bounds.h);
    var zoom = Math.max(minZoom, Math.min(1.1, fitted));
    var center = fitted < minZoom ? cy.getElementById(data.steps[stepIndex].focus).position() : {x:(bounds.x1+bounds.x2)/2,y:(bounds.y1+bounds.y2)/2};
    var pan = {x:canvas.clientWidth/2-center.x*zoom,y:canvas.clientHeight/2-center.y*zoom};
    cy.stop();
    if (animate && !reducedMotion.matches) cy.animate({zoom:zoom,pan:pan},{duration:650,easing:"ease-in-out-cubic",complete:function(){programmatic=false;updateZoomControls();}});
    else { cy.zoom(zoom); cy.pan(pan); programmatic=false; updateZoomControls(); }
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
    var hadSnapshot = Boolean(snapshot);
    stepIndex = Math.max(0, Math.min(data.steps.length - 1, index));
    var step = data.steps[stepIndex];
    snapshot = stateAt(stepIndex);
    window.cancelAnimationFrame(confidenceFrame);
    var changed = [];
    programmatic = true;
    cy.batch(function () {
      var ids = snapshot.nodes.map(function (node) { return node.id; });
      cy.nodes().filter(function (node) { return ids.indexOf(node.id()) === -1; }).remove();
      cy.nodes().removeClass("focus fresh inspected");
      cy.edges().removeClass("path highlight fresh-edge");
      snapshot.nodes.forEach(function (node) {
        var element = cy.getElementById(node.id);
        var focused = node.id === step.focus;
        var next = Object.assign({},node,{cardImage:cardImage(node,focused)});
        if (element.length) {
          var previousConfidence = element.data("confidence");
          element.data(next);
          if (previousConfidence !== undefined && previousConfidence !== node.confidence) changed.push({element:element,from:previousConfidence,node:node,focused:focused});
        } else {
          var position = positions[node.id] || {x:node.x,y:node.y};
          element = cy.add({data:next,position:position});
          if (hadSnapshot && !reducedMotion.matches) {
            element.style("opacity",0);
            if (node.kind === "evidence") element.position({x:position.x,y:position.y+18});
            element.animate({position:position,style:{opacity:1}},{duration:550,easing:"ease-out-cubic"});
          }
        }
        if (focused) element.addClass("focus");
        if (node.born === stepIndex+1) element.addClass("fresh");
      });
      var edgeIds = snapshot.edges.map(function (edge) { return "edge-"+edge.source+"-"+edge.target+"-"+edge.relation; });
      cy.edges().filter(function (edge) { return edgeIds.indexOf(edge.id()) === -1; }).remove();
      snapshot.edges.forEach(function (edge,i) {
        var element = cy.getElementById(edgeIds[i]);
        if (!element.length) element=cy.add({data:Object.assign({id:edgeIds[i]},edge)});
        if (edge.born === stepIndex+1) element.addClass("fresh-edge");
      });
      var ancestor = step.focus;
      while (ancestor !== "alert") {
        var parent = cy.edges().filter(function (edge) { return edge.data("target") === ancestor && ["derive", "refine"].indexOf(edge.data("relation")) !== -1; }).first();
        if (!parent.length) break;
        parent.addClass("path");
        ancestor = parent.data("source");
      }
    });
    programmatic = false;
    if (changed.length && !reducedMotion.matches) {
      var start = performance.now(), lastPaint = 0;
      function interpolate(now) {
        var t = Math.min(1,(now-start)/650);
        if (now-lastPaint > 55 || t === 1) {
          lastPaint = now;
          cy.batch(function () { changed.forEach(function (item) {
            if (!item.element.removed()) item.element.data("cardImage",cardImage(Object.assign({},item.node,{confidence:item.from+(item.node.confidence-item.from)*(1-Math.pow(1-t,3))}),item.focused));
          }); });
        }
        confidenceFrame = t < 1 ? window.requestAnimationFrame(interpolate) : null;
      }
      confidenceFrame = window.requestAnimationFrame(interpolate);
    }
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
    if (!manualViewport) fitGraph(hadSnapshot);
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
  cy.on("grab", "node", function () { pause(); cy.stop(); programmatic=false; manualViewport=true; });
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
      if (action === "reset") { positions = Object.create(null); cy.nodes().forEach(function(node){node.stop();node.position({x:node.data("x"),y:node.data("y")});}); manualViewport = false; render(stepIndex); return; }
      if (action === "fit") { fitGraph(); manualViewport = false; return; }
      manualViewport = true;
      cy.zoom({ level: Math.max(minZoom, Math.min(maxZoom, cy.zoom() * (action === "zoom-in" ? 1.2 : 1 / 1.2))), renderedPosition: { x: canvas.clientWidth / 2, y: canvas.clientHeight / 2 } });
    });
  });
  canvas.addEventListener("wheel",function(){cy.stop();programmatic=false;manualViewport=true;},{passive:true,capture:true});
  var lastFlowPaint = 0;
  function animateFlow(now) {
    flowFrame = null;
    if (!graphVisible || document.hidden || reducedMotion.matches) return;
    if (now-lastFlowPaint > 55) {
      lastFlowPaint = now;
      var offset = (now/65)%120;
      cy.edges(".highlight, .fresh-edge").style("line-dash-offset",-offset);
      cy.edges(".path").style("line-dash-offset",data.steps[stepIndex].action === "Backtrack" ? offset : -offset);
    }
    flowFrame = window.requestAnimationFrame(animateFlow);
  }
  function syncFlow() {
    window.cancelAnimationFrame(flowFrame); flowFrame=null;
    if (graphVisible && !document.hidden && !reducedMotion.matches) flowFrame=window.requestAnimationFrame(animateFlow);
  }
  document.addEventListener("visibilitychange", function () { if (document.hidden) pause(); syncFlow(); });
  reducedMotion.addEventListener("change",function(){pause();syncFlow();});
  if ("IntersectionObserver" in window) new IntersectionObserver(function (entries) {
    graphVisible=entries[0].isIntersecting;
    if (!graphVisible) pause();
    syncFlow();
  }).observe(canvas);
  new ResizeObserver(function () { cy.resize(); if (!manualViewport) fitGraph(); drawRows(); }).observe(canvas);
  render(0);
}());
