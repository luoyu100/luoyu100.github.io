import * as THREE from "three";

export function createPerception(root, stage, reduced) {
  const exhibit = root.querySelector("[data-pos-perception]");
  const host = exhibit.querySelector("[data-perception-stage]");
  let snapshot = null, seen = false, view = null, failed = false;
  function initialize() {
    if (view || failed) return;
    try {
      const s = stage(host, 3.45);
      s.camera.zoom = 1.5; s.camera.updateProjectionMatrix();
      s.camera.position.set(0, 3.2, 12); s.camera.lookAt(0, -.15, 0);
      s.box(6.2, .12, 3, 0xe3e9e5, 0, -1.36, .15);
      const appliance = new THREE.Group(); s.scene.add(appliance);
      s.box(3.2, .12, 1.8, 0x8babae, -.65, .77, 0, appliance);
      s.box(3.2, .12, 1.8, 0x9eb5b4, -.65, -1.16, 0, appliance);
      s.box(.12, 1.95, 1.8, 0x8babae, -2.2, -.19, 0, appliance);
      s.box(.48, 1.95, 1.8, 0xa1b6b5, .72, -.19, 0, appliance);
      s.box(2.62, 1.77, .12, 0xc4d0c9, -.87, -.19, -.87, appliance);
      s.box(.29, .48, .025, 0x526b70, .72, .26, .93, appliance);
      for (let i = 0; i < 3; i++) s.box(.15, .035, .03, 0xd2e4df, .72, .39 - i * .09, .95, appliance);
      const dial = new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, .075, 32), s.material(0x607a7f)); dial.rotation.x = Math.PI / 2; dial.position.set(.72, -.48, .94); appliance.add(dial);
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(.9, .9, .03, 48), s.material(0xdfebe7)); plate.position.set(-.85, -1.04, 0); appliance.add(plate);
      const door = new THREE.Group(); door.position.set(-2.2, -.19, .95); appliance.add(door);
      s.box(2.62, .16, .1, 0x6f9399, 1.31, .88, 0, door); s.box(2.62, .16, .1, 0x6f9399, 1.31, -.88, 0, door);
      s.box(.16, 1.78, .1, 0x6f9399, .08, 0, 0, door); s.box(.16, 1.78, .1, 0x6f9399, 2.54, 0, 0, door);
      const glass = s.box(2.31, 1.56, .025, 0x6f929d, 1.31, 0, .01, door); glass.material.transparent = true; glass.material.opacity = .28; glass.material.depthWrite = false;
      s.box(.07, .64, .11, 0x425e64, 2.4, 0, .14, door);
      const mug = new THREE.Group(); s.scene.add(mug);
      const ceramic = s.material(0x3e8d79);
      mug.add(new THREE.Mesh(new THREE.CylinderGeometry(.29, .245, .59, 64, 1, true), ceramic));
      const base = new THREE.Mesh(new THREE.CylinderGeometry(.245, .245, .035, 48), ceramic); base.position.y = -.29; mug.add(base);
      const lip = new THREE.Mesh(new THREE.TorusGeometry(.287, .018, 12, 64), s.material(0x79b6a1)); lip.rotation.x = Math.PI / 2; lip.position.y = .295; mug.add(lip);
      const handle = new THREE.Mesh(new THREE.TorusGeometry(.235, .043, 16, 48), ceramic); handle.position.set(.32, 0, 0); mug.add(handle);
      const shadow = new THREE.Mesh(new THREE.RingGeometry(.36, .41, 64), new THREE.MeshBasicMaterial({color: 0x7da794, transparent: true, opacity: .32, side: THREE.DoubleSide})); shadow.rotation.x = -Math.PI / 2; shadow.position.set(1.77, -1.285, .75); s.scene.add(shadow);
      const labels = document.createElement("div"); labels.className = "pos-perception-world-labels"; host.append(labels);
      const microwaveLabel = document.createElement("span"), mugLabel = document.createElement("span"); microwaveLabel.textContent = "Microwave 1"; mugLabel.textContent = "Mug 3"; labels.append(microwaveLabel, mugLabel);
      let target = null, from = null, elapsed = 1600, previousTime = null, raf = 0, position = new THREE.Vector3();
      const locations = {counter: [1.77, -1.015, .75], held: [1.5, .4, 1.2], microwave: [-.85, -.715, .35]};
      function render(now) {
        raf = 0;
        if (!target) return;
        if (previousTime !== null && seen && !document.hidden) elapsed += Math.max(0, now - previousTime);
        previousTime = now;
        const t = reduced.matches ? 1 : Math.min(1, elapsed / 1600), smooth = t * t * (3 - 2 * t);
        mug.position.lerpVectors(from.position, target.position, smooth);
        mug.position.y += Math.sin(Math.PI * t) * (from.position.distanceTo(target.position) > .1 ? .45 : 0);
        mug.rotation.z = Math.sin(Math.PI * t) * -.11;
        door.rotation.y = THREE.MathUtils.lerp(from.door, target.door, smooth);
        shadow.visible = snapshot.frame.location === "counter";
        const a = s.project(new THREE.Vector3(-.65, 1.14, .1)); microwaveLabel.style.left = `${a.x}px`; microwaveLabel.style.top = `${a.y}px`;
        position.copy(mug.position).add(new THREE.Vector3(0, .56, 0));
        const b = s.project(position); mugLabel.style.left = `${b.x}px`; mugLabel.style.top = `${b.y}px`;
        mugLabel.textContent = snapshot.frame.location === "held" ? "Agent holds Mug 3" : "Mug 3";
        s.renderer.render(s.scene, s.camera);
        if (t < 1 && seen && !document.hidden) raf = requestAnimationFrame(render);
      }
      function update(detail) {
        if (detail.mode === "diagnosis") {cancelAnimationFrame(raf); previousTime = null; return;}
        const {frame, reset} = detail;
        target = {position: new THREE.Vector3(...locations[frame.location]), door: frame.door === "open" ? -1.35 : 0};
        from = {position: mug.position.clone(), door: door.rotation.y};
        elapsed = reset || reduced.matches ? 1600 : 0; previousTime = null;
        cancelAnimationFrame(raf); render(performance.now());
      }
      view = {update, render, s, stop: () => {cancelAnimationFrame(raf); previousTime = null;}};
      if (snapshot) update(snapshot);
      exhibit.classList.add("has-perception-world");
      new ResizeObserver(() => {s.resize(); render(performance.now());}).observe(host);
      s.renderer.domElement.addEventListener("webglcontextlost", event => {event.preventDefault(); view.stop(); exhibit.classList.remove("has-perception-world");});
    } catch (error) {failed = true; host.querySelector("canvas")?.remove();}
  }
  root.addEventListener("pos:perception", event => {snapshot = event.detail; if (seen && snapshot.mode !== "diagnosis") initialize(); view?.update(snapshot);});
  new IntersectionObserver(entries => {
    seen = entries[0].isIntersecting;
    snapshot = snapshot || exhibit._posPerceptionFrame;
    if (seen) {initialize(); view?.render(performance.now());} else view?.stop();
  }, {rootMargin: "80px"}).observe(host);
  document.addEventListener("visibilitychange", () => document.hidden ? view?.stop() : seen && view?.render(performance.now()));
  reduced.addEventListener("change", () => {if (snapshot && view) view.update({...snapshot, reset: true});});
}
