/* Editable Three.js scenes. Build instructions: assets/js/src/pos-visual.README.md. */
import * as THREE from "three";

const page = document.querySelector("[data-pos-project]");
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const colors = {ink: 0x33434c, blue: 0x658eaa, teal: 0x408e7e, amber: 0xc49a52, coral: 0xc47765, white: 0xf8faf9};

function stage(element, extent = 5.5) {
  const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true, powerPreference: "low-power"});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0xffffff, 0);
  renderer.domElement.setAttribute("aria-hidden", "true");
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0xa4b7b5, 2.5));
  const light = new THREE.DirectionalLight(0xffffff, 3);
  light.position.set(-4, 7, 9); scene.add(light);
  const camera = new THREE.OrthographicCamera(-extent, extent, 3.5, -3.5, .1, 100);
  camera.position.set(0, 0, 16); camera.lookAt(0, 0, 0);
  function resize() {
    const w = element.clientWidth, h = element.clientHeight;
    if (!w || !h) return;
    const halfWidth = Math.max(extent, 3.5 * w / h);
    camera.left = -halfWidth; camera.right = halfWidth;
    camera.top = halfWidth * h / w; camera.bottom = -camera.top;
    camera.updateProjectionMatrix(); renderer.setSize(w, h, false);
  }
  element.prepend(renderer.domElement); resize();
  const material = (color) => new THREE.MeshStandardMaterial({color, roughness: .65, metalness: .08});
  function box(w, h, d, color, x = 0, y = 0, z = 0, parent = scene) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material(color));
    mesh.position.set(x, y, z); parent.add(mesh); return mesh;
  }
  function line(from, to, color = 0xbacdd3, radius = .012) {
    const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to), diff = b.clone().sub(a);
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, diff.length(), 10), material(color));
    mesh.position.copy(a).lerp(b, .5); mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), diff.normalize()); scene.add(mesh); return mesh;
  }
  const project = (position) => { const p = position.clone().project(camera); return {x: (p.x + 1) * element.clientWidth / 2, y: (1 - p.y) * element.clientHeight / 2}; };
  return {renderer, scene, camera, resize, material, box, line, project};
}

if (page) {
  const intro = page.querySelector("[data-pos-intro]");
  const host = page.querySelector("[data-pos-hero-visual]");
  const phases = [
    ["Observe the world.", "An interaction adds evidence, not just another line of history."],
    ["Update the current belief.", "Keep entities, states, and the unresolved requirement together."],
    ["Check before committing.", "Validate the proposed update against consistency and evidence."],
    ["More activity. The same gap.", "The action record grows while the relevant belief stays unchanged."],
    ["Combine the recovery constraints.", "Break the unproductive pattern and address the missing requirement."],
    ["Progress restored.", "A useful state change resolves the active gap and moves toward the goal."]
  ];
  let elapsed = reduced.matches ? 24000 : 0;
  let mark = performance.now(), finished = reduced.matches, visible = true, raf = 0, endTimer = 0;
  let draw = () => {}, resize = () => {}, lastPhase = -1;
  function clock(now) {
    if (!document.hidden && !finished) elapsed = Math.min(24000, elapsed + Math.max(0, now - mark));
    mark = Math.max(mark, now);
    if (elapsed >= 24000) finished = true;
  }
  function caption() {
    const phase = Math.max(0, Math.min(5, Math.floor(elapsed / 4000)));
    intro.dataset.phase = phase; intro.dataset.finished = String(finished); intro.dataset.elapsed = Math.round(elapsed);
    if (phase !== lastPhase) {
      lastPhase = phase;
      page.querySelector("[data-pos-hero-count]").textContent = `${String(phase + 1).padStart(2, "0")} / 06`;
      page.querySelector("[data-pos-hero-phase]").textContent = phases[phase][0];
      page.querySelector("[data-pos-hero-description]").textContent = phases[phase][1];
      page.querySelectorAll(".pos-film-track span").forEach((s, i) => s.classList.toggle("is-active", i <= phase));
    }
    return phase;
  }
  function tick(now) {
    raf = 0; clock(now); const phase = caption();
    if (visible) draw(elapsed / 1000, phase);
    if (!finished && visible && !document.hidden) raf = requestAnimationFrame(tick);
  }
  function schedule() {
    cancelAnimationFrame(raf); clearTimeout(endTimer);
    clock(performance.now()); caption();
    if (document.hidden) return;
    if (visible) { draw(elapsed / 1000, caption()); if (!finished) raf = requestAnimationFrame(tick); }
    else if (!finished) endTimer = setTimeout(() => { clock(performance.now()); caption(); }, 24000 - elapsed + 20);
  }
  try {
    const s = stage(host, 5.0);
    const models = [
      {id: "observation", x: -3.1, y: 1.65, title: "Observation", sub: "New interaction evidence", color: colors.blue, from: 0},
      {id: "belief", x: -.55, y: .55, title: "Current belief", sub: "Entity · state · relation", color: colors.blue, from: 1},
      {id: "gap", x: 2.6, y: 1.65, title: "Active gap", sub: "Still unresolved", color: colors.amber, from: 1},
      {id: "sentinel", x: -3.1, y: -1.65, title: "Belief Sentinel", sub: "Consistency + evidence", color: colors.teal, from: 2},
      {id: "pattern", x: -.5, y: -1.65, title: "Break the pattern", sub: "Stop ineffective repetition", color: colors.coral, from: 4},
      {id: "requirement", x: 2.15, y: -1.65, title: "Address the gap", sub: "Cause a useful state change", color: colors.teal, from: 4},
      {id: "goal", x: 3.2, y: -.05, title: "Goal", sub: "Progress restored", color: colors.teal, from: 5}
    ];
    const labelHost = page.querySelector("[data-pos-hero-labels]");
    const views = models.map(m => {
      const g = new THREE.Group(); g.position.set(m.x, m.y, 0); s.scene.add(g);
      const body = s.box(m.id === "belief" ? 1.25 : .77, .57, .23, m.color, 0, 0, 0, g);
      body.rotation.set(.14, -.18, 0);
      s.box(.68, .025, .02, 0xffffff, 0, .12, .16, g);
      s.box(.48, .025, .02, 0xffffff, -.1, 0, .16, g);
      s.box(.55, .025, .02, 0xffffff, -.065, -.12, .16, g);
      if (m.id === "belief") for (let i = 1; i < 3; i++) s.box(1.2, .55, .1, 0xd6e4eb, -.05 * i, .04 * i, -.16 * i, g);
      const label = document.createElement("span"); label.className = "pos-hero-label";
      const title = document.createElement("strong"), sub = document.createElement("small");
      title.textContent = m.title; sub.textContent = m.sub; label.append(title, sub); labelHost.append(label);
      return {m, g, body, label, sub};
    });
    const edges = [[0, 1, 1], [1, 2, 1], [1, 3, 2], [3, 1, 2], [1, 4, 4], [4, 5, 4], [5, 6, 5], [2, 6, 5]].map(([a, b, from]) => {
      const start = new THREE.Vector3(models[a].x, models[a].y, -.2), end = new THREE.Vector3(models[b].x, models[b].y, -.2);
      const dir = end.clone().sub(start).normalize(); start.addScaledVector(dir, .6); end.addScaledVector(dir, -.55);
      const line = s.line(start.toArray(), end.toArray());
      const arrow = new THREE.Mesh(new THREE.ConeGeometry(.045, .13, 12), s.material(0xa0bbc3));
      arrow.position.copy(end); arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir); s.scene.add(arrow);
      const bead = s.box(.075, .075, .075, colors.teal);
      return {line, arrow, bead, start, end, from};
    });
    const actionStack = new THREE.Group(); actionStack.position.set(-3.1, .15, 0); s.scene.add(actionStack);
    const actions = Array.from({length: 5}, (_, i) => s.box(.7, .08, .13, 0xdee7ea, 0, -.13 * i, .05 * i, actionStack));
    const activity = document.createElement("span"); activity.className = "pos-hero-activity"; activity.textContent = "Actions keep accumulating"; labelHost.append(activity);
    function render(t, phase) {
      const local = Math.min(1, (t % 4) / .75);
      views.forEach(({m, g, body, label, sub}) => {
        const shown = phase >= m.from;
        g.visible = shown; label.hidden = !shown;
        g.scale.setScalar(phase === m.from && !finished ? .9 + .1 * local : 1);
        const p = s.project(g.position);
        const compact = host.clientWidth < 450;
        label.style.width = `${Math.max(84, Math.min(142, host.clientWidth / 5.4))}px`;
        label.style.left = `${p.x}px`; label.style.top = `${p.y + (compact ? m.id === "gap" ? -42 : 14 : 26)}px`;
        if (m.id === "belief") { body.material.color.setHex(phase === 3 ? colors.coral : phase === 5 ? colors.teal : m.color); sub.textContent = phase === 3 ? "Unchanged despite new actions" : phase === 5 ? "Useful state change committed" : m.sub; }
        if (m.id === "gap") { body.material.color.setHex(phase === 5 ? colors.teal : m.color); sub.textContent = phase === 5 ? "Resolved" : "Still unresolved"; }
      });
      edges.forEach(e => { e.line.visible = e.arrow.visible = phase >= e.from; e.bead.visible = !finished && phase >= e.from && phase !== 3; if (e.bead.visible) e.bead.position.copy(e.start).lerp(e.end, (t * .45) % 1); });
      actionStack.visible = phase === 3; activity.hidden = phase !== 3;
      actions.forEach((a, i) => { a.visible = i <= Math.floor((t - 12) * 1.25); });
      const p = s.project(new THREE.Vector3(-3.1, -.9, 0)); activity.style.left = `${p.x}px`; activity.style.top = `${p.y}px`;
      s.renderer.render(s.scene, s.camera);
    }
    resize = () => { s.resize(); render(elapsed / 1000, caption()); };
    draw = render;
    s.renderer.compile(s.scene, s.camera); render(elapsed / 1000, caption());
    host.classList.add("has-webgl");
    s.renderer.domElement.addEventListener("webglcontextlost", (e) => { e.preventDefault(); host.classList.remove("has-webgl"); draw = () => {}; elapsed = 24000; finished = true; schedule(); });
    mark = performance.now(); schedule();
  } catch (error) {
    host.querySelector("canvas")?.remove(); elapsed = 24000; finished = true; caption();
  }
  document.addEventListener("visibilitychange", () => {
    // Charge the visible interval before suspension; never charge hidden time.
    const now = performance.now();
    if (document.hidden && !finished) elapsed = Math.min(24000, elapsed + now - mark);
    mark = now; schedule();
  });
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); }, {rootMargin: "80px"}).observe(intro);
  new ResizeObserver(resize).observe(host);
  reduced.addEventListener("change", () => { if (reduced.matches) { elapsed = 24000; finished = true; schedule(); } });

  // Case scene transitions are driven only by the controller's shared snapshot.
  const worldHost = page.querySelector("[data-pos-world]");
  const comic = worldHost.parentElement;
  try {
    const s = stage(worldHost, 4.7);
    s.camera.position.set(0, 2.8, 15); s.camera.lookAt(0, -.2, 0);
    const kitchen = new THREE.Group(), diagnosis = new THREE.Group(); s.scene.add(kitchen, diagnosis);
    s.box(8.9, .18, 3.3, 0xd5dfdb, 0, -1.7, 0, kitchen);
    s.box(8.9, 2.9, .1, 0xf2f5f2, 0, -.15, -1.55, kitchen);
    s.box(2.75, 1.6, 1.3, 0xa5bac0, -2.45, -.68, 0, kitchen);
    s.box(2.35, 1.2, .08, 0x455c64, -2.45, -.65, .69, kitchen);
    const microwaveDoor = new THREE.Group(); microwaveDoor.position.set(-3.77, -.68, .77); kitchen.add(microwaveDoor);
    s.box(2.6, 1.47, .1, 0x7b939b, 1.3, 0, 0, microwaveDoor);
    s.box(1.96, 1.04, .05, 0xbacdd2, 1.25, 0, .08, microwaveDoor);
    s.box(.08, .62, .09, 0x40545b, 2.38, 0, .13, microwaveDoor);
    s.box(2.75, 2.45, 1.25, 0xa6baa9, 2.45, -.26, -.12, kitchen);
    s.box(2.42, 2.15, .09, 0xdce6d9, 2.45, -.26, .53, kitchen);
    s.box(2.5, .06, .9, 0x778f7c, 2.45, -.45, .33, kitchen);
    const cabinetDoor = new THREE.Group(); cabinetDoor.position.set(3.77, -.26, .63); kitchen.add(cabinetDoor);
    s.box(2.61, 2.36, .08, 0x9cb29e, -1.3, 0, 0, cabinetDoor);
    s.box(.07, .48, .1, 0x40554a, -2.28, 0, .1, cabinetDoor);
    const mug = new THREE.Group(); kitchen.add(mug);
    const cupMaterial = s.material(colors.teal);
    mug.add(new THREE.Mesh(new THREE.CylinderGeometry(.26, .23, .49, 40, 1, true), cupMaterial));
    const cupBase = new THREE.Mesh(new THREE.CylinderGeometry(.23, .23, .025, 40), cupMaterial); cupBase.position.y = -.24; mug.add(cupBase);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(.2, .045, 12, 36), cupMaterial); handle.position.set(.29, .02, 0); mug.add(handle);
    const steam = new THREE.Group(); mug.add(steam);
    for (let i = 0; i < 3; i++) { const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(i * .14 - .14, .33, 0), new THREE.Vector3(i * .14 - .08, .58, 0), new THREE.Vector3(i * .14 - .17, .87, 0)]); steam.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 16, .013, 6, false), s.material(0xb3ccc4))); }
    const heatingLight = new THREE.PointLight(0xf4c66a, 0, 4); heatingLight.position.set(-2.45, -.6, 1); kitchen.add(heatingLight);
    const servers = [
      {x: 0, name: "Inventory service", color: colors.blue}, {x: -2.9, name: "JVM", color: colors.teal}, {x: 2.9, name: "Database", color: colors.blue}
    ];
    servers.forEach((v, i) => { const g = new THREE.Group(); diagnosis.add(g); s.box(1.4, i === 0 ? 1.6 : 1.3, .85, v.color, v.x, i === 0 ? .65 : -.5, 0, g); for (let j = 0; j < 3; j++) s.box(1, .06, .04, 0xd8e6ed, v.x, (i === 0 ? .65 : -.5) + .3 - j * .3, .45, g); });
    const flowA = s.line([0, .2, -.2], [-2.9, -.5, -.2], 0x99bcb0, .025), flowB = s.line([0, .2, -.2], [2.9, -.5, -.2], 0x99b2c2, .025);
    diagnosis.add(flowA, flowB);
    const evidence = [s.box(1.3, .5, .08, colors.amber, -2.9, -1.75, .2, diagnosis), s.box(1.3, .5, .08, 0xa4b9c2, 0, -1.75, .2, diagnosis), s.box(1.3, .5, .08, colors.teal, 2.9, -1.75, .2, diagnosis)];
    const labels = document.createElement("div"); labels.className = "pos-world-labels"; worldHost.append(labels);
    function makeLabel(text, position) { const el = document.createElement("span"); el.textContent = text; labels.append(el); return {el, position: new THREE.Vector3(...position)}; }
    const kitchenLabels = [makeLabel("Microwave 1", [-2.45, .4, .2]), makeLabel("Cabinet 1", [2.45, 1.3, .1]), makeLabel("Mug 3", [0, -1.3, .1])];
    const diagnosisLabels = [makeLabel("Inventory service", [0, 1.75, .1]), makeLabel("JVM processing", [-2.9, .45, .1]), makeLabel("Database waiting", [2.9, .45, .1]), makeLabel("Earlier GC", [-2.9, -2.05, .3]), makeLabel("Log searches", [0, -2.05, .3]), makeLabel("CPU evidence", [2.9, -2.05, .3])];
    let state = null, previous = null, from = {}, target = {}, started = 0, moving = false, seen = false, worldRaf = 0;
    const locations = {counter: [0, -1.33, .6], microwave: [-2.45, -.94, 1], cabinet: [2.45, -.16, .95]};
    function render(now) {
      worldRaf = 0;
      if (!state) return;
      const t = reduced.matches || !moving ? 1 : Math.min(1, (now - started) / 1100);
      const smooth = t * t * (3 - 2 * t);
      mug.position.lerpVectors(from.position, target.position, smooth);
      mug.position.y += Math.sin(Math.PI * t) * (from.position.distanceTo(target.position) > .1 ? .55 : 0);
      mug.rotation.z = Math.sin(Math.PI * t) * .13;
      microwaveDoor.rotation.y = THREE.MathUtils.lerp(from.door, target.door, smooth);
      cabinetDoor.rotation.y = THREE.MathUtils.lerp(from.cabinet, target.cabinet, smooth);
      steam.visible = Boolean(state.frame.hot || state.frame.heating); steam.position.y = moving ? Math.sin(t * 6) * .04 : 0;
      heatingLight.intensity = state.frame.heating ? 6 : 0;
      kitchen.visible = state.caseId === "execution"; diagnosis.visible = !kitchen.visible;
      kitchenLabels[2].position.copy(mug.position).add(new THREE.Vector3(0, -.6, .1));
      evidence.forEach((e, i) => { e.visible = i === 0 ? state.frame.cards >= 1 : i === 1 ? state.frame.cards >= 2 : Boolean(state.frame.cpu || state.frame.cpuPending); if (i === 2 && e.visible) { e.position.y = -1.75 + (state.frame.cpu && t < 1 ? (1 - smooth) * .4 : 0); e.material.color.setHex(state.frame.cpu ? colors.teal : 0xd7e2df); } });
      [...kitchenLabels, ...diagnosisLabels].forEach((l, i) => { const p = s.project(l.position); l.el.style.left = `${p.x}px`; l.el.style.top = `${p.y}px`; l.el.hidden = i < 3 ? !kitchen.visible : kitchen.visible || (i >= 6 && !evidence[i - 6].visible); });
      s.renderer.render(s.scene, s.camera);
      if (t < 1 && seen && !document.hidden) worldRaf = requestAnimationFrame(render);
      else moving = false;
    }
    page.addEventListener("pos:frame", event => {
      state = event.detail;
      const f = state.frame;
      target = {position: new THREE.Vector3(...locations[f.mug || "counter"]), door: f.door === "open" ? -1.35 : 0, cabinet: f.cabinet === "open" ? 1.35 : 0};
      from = {position: mug.position.clone(), door: microwaveDoor.rotation.y, cabinet: cabinetDoor.rotation.y};
      moving = Boolean(previous && !state.reset && !reduced.matches && seen);
      started = performance.now(); cancelAnimationFrame(worldRaf); render(started);
      previous = state;
      comic.classList.add("has-world");
    });
    new ResizeObserver(() => { s.resize(); if (state) render(performance.now()); }).observe(worldHost);
    new IntersectionObserver(entries => { seen = entries[0].isIntersecting; if (!seen) cancelAnimationFrame(worldRaf); else if (state) render(performance.now()); }).observe(worldHost);
    document.addEventListener("visibilitychange", () => { if (document.hidden) cancelAnimationFrame(worldRaf); else if (seen && state) render(performance.now()); });
    s.renderer.domElement.addEventListener("webglcontextlost", e => { e.preventDefault(); cancelAnimationFrame(worldRaf); comic.classList.remove("has-world"); });
  } catch (error) { worldHost.querySelector("canvas")?.remove(); }

  const reveal = page.querySelectorAll(".project-section-heading, .pos-belief-definition > div, .project-page-figure, .pos-method-block, .pos-teaser, .pos-hero, .pos-trap-grid article");
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } }), {threshold: .03});
  reveal.forEach(el => { el.classList.add("pos-reveal"); observer.observe(el); });
}
