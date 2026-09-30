/* Bundled with Three.js 0.186.1 (MIT) using esbuild; served as gos-visual.min.js. */
import * as THREE from "three";

const page = document.querySelector(".project-theme--graph-of-states");
if (page) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const intro = page.querySelector("[data-gos-intro]");
  const visual = page.querySelector("[data-gos-visual]");
  const caseData = JSON.parse(page.querySelector("[data-gos-data]").textContent);
  const chapters = [
    {step: 2, focus: "database", title: "Start with three possible causes."},
    {step: 6, focus: "database", title: "Evidence rules out database overload."},
    {step: 8, focus: "orders", title: "Backtrack to the order service."},
    {step: 16, focus: "leak", title: "Drill down: a connection leak."},
    {step: 18, focus: "cancellation", title: "Reproduce the cancellation bug."},
    {step: 20, focus: "cancellation", title: "Fix verified. Root cause confirmed."}
  ];
  let progress = 0;
  let chapter = -1;
  let updateVisual = () => {};
  let scrollFrame = 0;
  const meter = document.createElement("span");
  meter.className = "gos-page-progress";
  meter.setAttribute("aria-hidden", "true");
  document.querySelector(".project-local-nav").appendChild(meter);

  function updateScroll() {
    scrollFrame = 0;
    const rect = intro.getBoundingClientRect();
    const sticky = intro.querySelector(".gos-intro-sticky");
    const distance = Math.max(1, intro.offsetHeight - sticky.offsetHeight);
    progress = reduced.matches ? 0 : THREE.MathUtils.clamp((64 - rect.top) / distance, 0, 1);
    intro.style.setProperty("--gos-intro-progress", progress.toFixed(3));
    meter.style.setProperty("--gos-page-progress", `${scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight) * 100}%`);
    if (page.querySelector("#overview").getBoundingClientRect().top > innerHeight * .45) {
      document.querySelectorAll(".project-local-nav__links a.is-active").forEach(link => link.classList.remove("is-active"));
    }
    const next = Math.min(5, Math.floor(progress * 6));
    if (next !== chapter) {
      chapter = next;
      page.querySelector("[data-gos-hero-number]").textContent = `${String(chapter + 1).padStart(2, "0")} / 06`;
      page.querySelector("[data-gos-hero-phase]").textContent = chapters[chapter].title;
      page.querySelectorAll(".gos-hero-progress span").forEach((el, i) => el.classList.toggle("is-active", i <= chapter));
    }
    updateVisual(progress, chapter);
  }
  function scheduleScroll() { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll); }
  window.addEventListener("scroll", scheduleScroll, {passive: true});
  window.addEventListener("resize", scheduleScroll, {passive: true});

  const revealElements = page.querySelectorAll("[data-gos-reveal], .project-section-heading, .project-abstract, .project-page-highlight, .project-page-figure, .gos-method-flow li, .project-stat, .gos-case-intro, .gos-case, .results-carousel, .project-deploy-list li, .project-run-grid, .project-faq-item, #bibtex-code");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
    }), {threshold: .06, rootMargin: "0px 0px -24px 0px"});
    revealElements.forEach((el, i) => {
      el.dataset.gosReveal = "";
      if (el.classList.contains("project-page-highlight") || el.classList.contains("project-stat")) el.style.setProperty("--gos-reveal-delay", `${i % 4 * 60}ms`);
      observer.observe(el);
    });
    document.body.classList.add("gos-enhanced");
  }

  const flow = page.querySelector("[data-gos-method-flow]");
  let flowVisible = false;
  let flowTimer;
  let flowIndex = 0;
  function runFlow() {
    clearInterval(flowTimer);
    if (!flowVisible || document.hidden || reduced.matches) return;
    const items = [...flow.children];
    items[flowIndex].classList.add("is-active");
    flowTimer = setInterval(() => {
      flowIndex = (flowIndex + 1) % items.length;
      items.forEach((item, i) => item.classList.toggle("is-active", i === flowIndex));
    }, 2200);
  }
  if ("IntersectionObserver" in window) new IntersectionObserver(entries => {
    flowVisible = entries[0].isIntersecting;
    runFlow();
  }).observe(flow);
  document.addEventListener("visibilitychange", runFlow);
  reduced.addEventListener("change", () => { runFlow(); scheduleScroll(); });

  try {
    const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true, powerPreference: "low-power"});
    let shaderFailed = false;
    let contextLost = false;
    renderer.debug.onShaderError = (gl, program, vertex, fragment) => {
      shaderFailed = true;
      console.error("GoS visual shader:",gl.getShaderInfoLog(vertex),gl.getShaderInfoLog(fragment));
    };
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    renderer.setClearColor(0xffffff, 0);
    renderer.domElement.setAttribute("aria-hidden", "true");
    visual.prepend(renderer.domElement);
    const scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xffffff,.85));
    const light = new THREE.DirectionalLight(0xffffff,1.0);
    light.position.set(-3,5,8); scene.add(light);
    const camera = new THREE.OrthographicCamera(-5, 5, 3.3, -3.3, .1, 100);
    camera.position.set(0, -.3, 15);
    camera.lookAt(0, -.3, 0);
    const sculpture = new THREE.Group();
    scene.add(sculpture);
    const model = [
      ["alert", 0, 2.1, 0],
      ["database", -2.5, .9, 0],
      ["payment", 0, .9, 0],
      ["orders", 2.5, .9, 0],
      ["unlocked", -2.5, -.3, .05],
      ["trace", 0, -.3, .05],
      ["pool", 2.5, -.3, 0],
      ["balance", 0, -1.5, .05],
      ["leak", 2.5, -1.5, 0],
      ["reproduce", 0, -2.7, .05],
      ["repair", 0, -2.7, .05],
      ["cancellation", 2.5, -2.7, 0]
    ].map(([id,x,y,z]) => ({...caseData.nodes.find(n => n.id === id), position: new THREE.Vector3(x,y,z)}));
    const relations = caseData.edges.filter(edge => model.some(n => n.id === edge.source) && model.some(n => n.id === edge.target));
    const palette = {hypothesis: "#44698a", evidence: "#aa7b3d", symptom: "#3c5362", focus: "#238572", rejected: "#b47b6b"};
    // Keep the same layered layout in every chapter; only evidence and belief change.
    const nodeViews = model.map(node => {
      const group = new THREE.Group();
      group.position.copy(node.position);
      const shape = node.kind === "evidence" ? new THREE.BoxGeometry(.29,.29,.12) : new THREE.OctahedronGeometry(node.kind === "symptom" ? .22 : .28);
      if (node.kind === "evidence") shape.rotateZ(Math.PI/4);
      else {shape.rotateY(.28);shape.rotateX(.12);}
      const face = new THREE.MeshLambertMaterial({color: "#edf3f7",transparent: true,depthWrite: false,opacity: 0});
      const outline = new THREE.LineBasicMaterial({color: palette[node.kind],transparent: true,opacity: 0});
      group.add(new THREE.Mesh(shape,face),new THREE.LineSegments(new THREE.EdgesGeometry(shape),outline));
      const ring = new THREE.Mesh(new THREE.RingGeometry(.32,.334,64),new THREE.MeshBasicMaterial({color: palette.focus,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false}));
      group.add(ring);
      sculpture.add(group);
      return {group,face,outline,ring,alpha:0,target:0,color:new THREE.Color(palette[node.kind]),focus:false,rejected:false};
    });
    const arrowGeometry = new THREE.ConeGeometry(.038,.12,12);
    const beadGeometry = new THREE.SphereGeometry(.036,12,8);
    const edgeViews = relations.map(edge => {
      const from = model.find(node=>node.id===edge.source);
      const to = model.find(node=>node.id===edge.target);
      const direction = to.position.clone().sub(from.position).normalize();
      const start = from.position.clone().addScaledVector(direction,.31);
      const end = to.position.clone().addScaledVector(direction,-.34);
      const middle = start.clone().lerp(end,.5); middle.z+=.06;
      const curve = new THREE.QuadraticBezierCurve3(start,middle,end);
      const color = palette[edge.relation === "refute" ? "rejected" : edge.relation === "support" ? "evidence" : "hypothesis"];
      const lineMaterial = edge.relation === "refute" ? new THREE.LineDashedMaterial({color,transparent:true,opacity:0,dashSize:.08,gapSize:.055}) : new THREE.LineBasicMaterial({color,transparent:true,opacity:0});
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(40)),lineMaterial);
      line.computeLineDistances();
      const arrow = new THREE.Mesh(arrowGeometry,new THREE.MeshBasicMaterial({color,transparent:true,opacity:0}));
      arrow.position.copy(end); arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),curve.getTangent(1));
      const bead = new THREE.Mesh(beadGeometry,new THREE.MeshBasicMaterial({color,transparent:true,opacity:0}));
      sculpture.add(line,arrow,bead);
      return {edge,curve,line,arrow,bead,alpha:0,target:0,color:new THREE.Color(color),active:false};
    });
    const labelLayer = visual.querySelector("[data-gos-hero-labels]");
    const labels = model.map(node => {
      const label = document.createElement("span");
      label.className = "gos-hero-label";
      label.dataset.nodeId = node.id;
      label.classList.add("gos-hero-label--"+node.kind);
      const title = document.createElement("span"); title.className="gos-hero-label-title"; title.textContent=node.label;
      const status = document.createElement("small");
      label.append(title,status);
      labelLayer.appendChild(label);
      return label;
    });
    const projected = new THREE.Vector3();
    const white = new THREE.Color("#ffffff");
    const pointer = {x:0,y:0};
    let smoothX = 0, smoothY = 0, visible = true, animationFrame = 0, lastTime = 0, currentChapter = -1;
    let targetOffset = 0;
    function applyChapter(index) {
      currentChapter = index;
      const step = chapters[index].step;
      const updated = model.map(node => {
        const state = {...node};
        caseData.steps.slice(0,step).forEach(item => { if(item.updates?.[node.id]) Object.assign(state,item.updates[node.id]); });
        return state;
      });
      const focus = chapters[index].focus;
      const path = new Set([focus]);
      for(let i=0;i<4;i++) relations.forEach(edge=>{if(["derive","refine"].includes(edge.relation)&&path.has(edge.target))path.add(edge.source);});
      updated.forEach((node,i) => {
        const view = nodeViews[i];
        view.target = node.born <= step && !(node.id === "reproduce" && index === 5) ? 1 : 0;
        view.focus = node.id === focus;
        view.rejected = node.status === "rejected";
        view.color.set(view.rejected ? palette.rejected : node.kind === "evidence" ? palette.evidence : path.has(node.id) ? palette.focus : palette[node.kind]);
        labels[i].classList.toggle("is-focus",path.has(node.id)&&!view.rejected);
        labels[i].classList.toggle("is-rejected",view.rejected);
        labels[i].querySelector("small").textContent = view.rejected ? "Ruled out" : node.id===focus ? node.status==="confirmed" ? "Confirmed" : "Current focus" : "";
        labels[i].dataset.status=node.status||"open";
        labels[i].dataset.priority = view.focus ? 3 : node.id === "alert" ? 2 : view.rejected ? 0 : 1;
      });
      const visibleRows = model.filter((node,i)=>nodeViews[i].target).map(node=>node.position.y);
      targetOffset = -.3-(Math.max(...visibleRows)+Math.min(...visibleRows))/2;
      edgeViews.forEach(view=>{
        const from = updated.findIndex(node=>node.id===view.edge.source);
        const to = updated.findIndex(node=>node.id===view.edge.target);
        view.target=view.edge.born<=step&&nodeViews[from].target&&nodeViews[to].target ? 1 : 0;
        const onPath=path.has(view.edge.source)&&path.has(view.edge.target);
        view.active=onPath||view.edge.target===focus;
        const rejected=nodeViews[from].rejected||nodeViews[to].rejected;
        view.color.set(view.edge.relation==="refute" ? palette.rejected : onPath&&!rejected ? palette.focus : view.edge.relation==="support" ? palette.evidence : palette.hypothesis);
        if(rejected&&view.edge.relation!=="refute")view.target*=.3;
      });
      visual.dataset.heroStep = step;
      visual.dataset.heroChapter = index;
    }
    function draw(now = performance.now()) {
      animationFrame = 0;
      if (!visible || document.hidden || contextLost || shaderFailed) return;
      if (!reduced.matches && now-lastTime < 32) { animationFrame=requestAnimationFrame(draw); return; }
      lastTime = now;
      smoothX += (pointer.x-smoothX)*.045; smoothY += (pointer.y-smoothY)*.045;
      sculpture.rotation.y = reduced.matches ? 0 : smoothX*.04;
      sculpture.rotation.x = reduced.matches ? 0 : smoothY*.025;
      sculpture.position.y = reduced.matches ? targetOffset : THREE.MathUtils.lerp(sculpture.position.y,targetOffset,.16);
      nodeViews.forEach(view=>{
        view.alpha=reduced.matches ? view.target : THREE.MathUtils.lerp(view.alpha,view.target,.18);
        view.group.visible=view.alpha>.005;
        view.group.scale.setScalar(.88+.12*view.alpha);
        if(reduced.matches)view.outline.color.copy(view.color);else view.outline.color.lerp(view.color,.16);
        view.outline.opacity=view.alpha*(view.rejected?.55:1);
        view.face.color.copy(view.outline.color).lerp(white,.8);
        view.face.opacity=view.alpha*.85;
        view.ring.material.color.copy(view.outline.color);
        view.ring.material.opacity=view.alpha*(view.focus?.75:0);
      });
      edgeViews.forEach(view=>{
        view.alpha=reduced.matches ? view.target : THREE.MathUtils.lerp(view.alpha,view.target,.18);
        if(reduced.matches)view.line.material.color.copy(view.color);else view.line.material.color.lerp(view.color,.16);
        view.line.material.opacity=view.alpha*(view.active?.8:.5);
        view.arrow.material.color.copy(view.line.material.color);
        view.arrow.material.opacity=view.alpha*.8;
        view.bead.material.color.copy(view.line.material.color);
        view.bead.material.opacity=reduced.matches||!view.active ? 0 : view.alpha*.85;
        view.bead.position.copy(view.curve.getPoint((now*.00022)%1));
      });
      sculpture.updateMatrixWorld();
      const projectedLabels = model.map((node,i) => {
        projected.copy(node.position).applyMatrix4(sculpture.matrixWorld).project(camera);
        const labelOffset = visual.clientWidth <= 600 || visual.clientHeight < 350 ? 14 : 20;
        const left = (projected.x+1)*visual.clientWidth/2-labels[i].offsetWidth/2;
        const top = (1-projected.y)*visual.clientHeight/2+labelOffset;
        labels[i].style.transform = `translate(${left}px,${top}px)`;
        return {label:labels[i],left,top,right:left+labels[i].offsetWidth,bottom:top+labels[i].offsetHeight};
      });
      // Preserve the focus label; omit lower-priority labels when a short viewport crowds them.
      const placed = [];
      projectedLabels.sort((a,b) => Number(b.label.dataset.priority)-Number(a.label.dataset.priority)).forEach(item => {
        const view = nodeViews[model.findIndex(node=>node.id===item.label.dataset.nodeId)];
        const alpha = view.target && view.alpha>.02 ? view.alpha : 0;
        const crowded = placed.some(other => item.left<other.right+4 && item.right>other.left-4 && item.top<other.bottom+4 && item.bottom>other.top-4);
        const clipped = item.left<4 || item.right>visual.clientWidth-4 || item.top<0 || item.bottom>visual.clientHeight-4;
        item.label.style.opacity = alpha && !crowded && !clipped ? alpha : 0;
        if(alpha && !crowded && !clipped) placed.push(item);
      });
      renderer.render(scene,camera);
      if (shaderFailed) { visual.classList.remove("is-rendered"); return; }
      visual.classList.add("is-rendered");
      visual.dataset.renderFrame = String(Number(visual.dataset.renderFrame || 0)+1);
      if (!reduced.matches) animationFrame=requestAnimationFrame(draw);
    }
    function wake() { if (!animationFrame && visible && !document.hidden && !contextLost && !shaderFailed) animationFrame=requestAnimationFrame(draw); }
    function resize() {
      const width = visual.clientWidth, height = visual.clientHeight;
      const aspect = width / height;
      const halfHeight = Math.max(3.6,3.4/aspect,height<350?4.1:0);
      visual.classList.toggle("is-compact",height<350);
      camera.left = -halfHeight*aspect; camera.right = halfHeight*aspect;
      camera.top = halfHeight; camera.bottom = -halfHeight;
      camera.updateProjectionMatrix(); renderer.setSize(width,height); wake();
    }
    visual.addEventListener("pointermove",event => {
      const rect = visual.getBoundingClientRect();
      pointer.x=(event.clientX-rect.left)/rect.width-.5; pointer.y=(event.clientY-rect.top)/rect.height-.5;
      wake();
    }, {passive:true});
    visual.addEventListener("pointerleave",()=>{pointer.x=0;pointer.y=0;});
    updateVisual = (p,index) => { if(index!==currentChapter) applyChapter(index); wake(); };
    if ("IntersectionObserver" in window) new IntersectionObserver(entries => {
      visible=entries[0].isIntersecting;
      if(!visible){cancelAnimationFrame(animationFrame);animationFrame=0;} else wake();
    }).observe(visual);
    document.addEventListener("visibilitychange",()=>{if(document.hidden){cancelAnimationFrame(animationFrame);animationFrame=0;}else wake();});
    reduced.addEventListener("change",()=>{cancelAnimationFrame(animationFrame);animationFrame=0;wake();});
    renderer.domElement.addEventListener("webglcontextlost",event=>{event.preventDefault();contextLost=true;cancelAnimationFrame(animationFrame);animationFrame=0;visual.classList.remove("is-rendered");});
    renderer.domElement.addEventListener("webglcontextrestored",()=>{contextLost=false;wake();});
    new ResizeObserver(resize).observe(visual);
    applyChapter(0); resize();
  } catch (error) {
    // Reading the paper remains possible when WebGL is unavailable.
    visual.classList.remove("is-rendered");
  }
  updateScroll();
}
