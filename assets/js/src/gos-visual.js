/* Bundled with Three.js 0.186.1 (MIT) using esbuild; served as gos-visual.min.js. */
import * as THREE from "three";

const page = document.querySelector(".project-theme--graph-of-states");
if (page) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const intro = page.querySelector("[data-gos-intro]");
  const visual = page.querySelector("[data-gos-visual]");
  const caseData = JSON.parse(page.querySelector("[data-gos-data]").textContent);
  const chapters = [
    {step: 2, title: "Keep the alternatives open."},
    {step: 5, title: "Test a promising explanation."},
    {step: 8, title: "Let the evidence change direction."},
    {step: 12, title: "Look beneath the symptom."},
    {step: 18, title: "Reproduce the suspected cause."},
    {step: 20, title: "Report a verified explanation."}
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
    const camera = new THREE.OrthographicCamera(-5, 5, 3.3, -3.3, .1, 100);
    camera.position.set(0, -.2, 15);
    camera.lookAt(0, -.2, 0);
    const sculpture = new THREE.Group();
    scene.add(sculpture);
    const model = [
      ["alert", 0, 1.7, 0],
      ["database", -1.75, .45, .2],
      ["payment", 0, .45, -.55],
      ["orders", 1.75, .45, .1],
      ["fast", -2.55, -.8, .1],
      ["pool", 1.6, -.75, .35],
      ["leak", 1.4, -1.9, .1],
      ["cancellation", 1.05, -3.05, .2],
      ["repair", 2.8, -3.05, -.25]
    ].map(([id,x,y,z]) => ({...caseData.nodes.find(n => n.id === id), position: new THREE.Vector3(x,y,z)}));
    const foldedPositions = [
      [0,1.5,.15], [-1.55,.55,.25], [-.15,-.55,1.1], [1.55,.6,-.1],
      [-1.55,-.95,-.1], [1.5,-.45,.4], [.65,-1.5,-.2], [-.8,-1.95,.25], [1.65,-1.9,.3]
    ];
    model.forEach((node,i) => { node.origin = new THREE.Vector3(...foldedPositions[i]); });
    const relations = caseData.edges.filter(edge => model.some(n => n.id === edge.source) && model.some(n => n.id === edge.target));
    const positions = [], origins = [], seeds = [], owner = [], travels = [], birth = [], colors = [];
    let randomSeed = 739;
    function random() { randomSeed = (randomSeed * 16807) % 2147483647; return (randomSeed - 1) / 2147483646; }
    function point(position, node, travel = -1, born = node.born, origin = node.origin.clone().add(position.clone().sub(node.position))) {
      positions.push(position.x, position.y, position.z);
      origins.push(origin.x, origin.y, origin.z);
      seeds.push(random()); owner.push(model.indexOf(node)); travels.push(travel); birth.push(born);
      colors.push(.08, .21, .32);
    }
    // The sculpture is a compact projection of the actual case, not an unrelated particle logo.
    model.forEach(node => {
      const radius = node.kind === "evidence" ? .23 : .44;
      for (let i=0;i<850;i++) {
        const local = new THREE.Vector3(random()*2-1,random()*2-1,random()*2-1);
        const norm = node.kind === "evidence" ? Math.max(Math.abs(local.x),Math.abs(local.y),Math.abs(local.z)) : Math.abs(local.x)+Math.abs(local.y)+Math.abs(local.z);
        local.multiplyScalar(radius / Math.max(.001,norm));
        if (random()<.22) local.multiplyScalar(.55+random()*.4);
        point(local.clone().add(node.position),node,-1,node.born,local.add(node.origin));
      }
    });
    relations.forEach(edge => {
      const from = model.find(n => n.id === edge.source);
      const to = model.find(n => n.id === edge.target);
      const middle = from.position.clone().lerp(to.position, .5);
      middle.z += .4;
      const curve = new THREE.QuadraticBezierCurve3(from.position, middle, to.position);
      const foldedMiddle = from.origin.clone().lerp(to.origin,.5);
      foldedMiddle.z += .6;
      const foldedCurve = new THREE.QuadraticBezierCurve3(from.origin,foldedMiddle,to.origin);
      for (let i=0;i<330;i++) {
        const t = i / 329;
        const position = curve.getPoint(t);
        position.x += (random() - .5) * .055;
        position.y += (random() - .5) * .055;
        position.z += (random() - .5) * .055;
        point(position, to, t, edge.born,foldedCurve.getPoint(t));
      }
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("aOrigin", new THREE.Float32BufferAttribute(origins, 3));
    geometry.setAttribute("aSeed", new THREE.Float32BufferAttribute(seeds, 1));
    geometry.setAttribute("aTravel", new THREE.Float32BufferAttribute(travels, 1));
    geometry.setAttribute("aBirth", new THREE.Float32BufferAttribute(birth, 1));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    const material = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, vertexColors: true,
      uniforms: {uTime:{value:0},uGather:{value:0},uMorph:{value:0},uStep:{value:2},uPixelRatio:{value:Math.min(devicePixelRatio,1.75)}},
      vertexShader: `
        attribute vec3 aOrigin; attribute float aSeed; attribute float aTravel; attribute float aBirth;
        uniform float uTime; uniform float uGather; uniform float uMorph; uniform float uStep; uniform float uPixelRatio;
        varying vec3 vColor; varying float vAlpha;
        void main() {
          vec3 p = mix(aOrigin,position,uMorph);
          float drift = (1.0-uGather)*.23;
          p.x += sin(aSeed*40.0+uTime*.2)*drift;
          p.y += cos(aSeed*31.0+uTime*.15)*drift;
          p.z += sin(aSeed*23.0+uTime*.1)*drift;
          float evidenceVisibility = smoothstep(aBirth-.4,aBirth+.4,uStep);
          float flow = aTravel < 0.0 ? .9 : .32+.68*pow(.5+.5*sin(aTravel*16.0-uTime*2.2),6.0);
          vAlpha = mix(.18,.9,evidenceVisibility)*flow*(.6+.4*aSeed);
          vColor = color*mix(.75,1.2,aSeed);
          gl_Position = projectionMatrix*modelViewMatrix*vec4(p,1.0);
          gl_PointSize = (1.4+pow(aSeed,5.0)*2.3)*uPixelRatio;
        }`,
      fragmentShader: `
        varying vec3 vColor; varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord-vec2(.5));
          if(d>.5) discard;
          gl_FragColor=vec4(vColor,vAlpha*(1.0-smoothstep(.34,.5,d)));
          #include <colorspace_fragment>
        }`
    });
    sculpture.add(new THREE.Points(geometry, material));
    const labelLayer = visual.querySelector("[data-gos-hero-labels]");
    const labels = model.map(node => {
      const label = document.createElement("span");
      label.className = "gos-hero-label";
      label.textContent = node.label;
      labelLayer.appendChild(label);
      return label;
    });
    const projected = new THREE.Vector3();
    const pointer = {x:0,y:0};
    let smoothX = 0, smoothY = 0, visible = true, animationFrame = 0, lastTime = 0, currentChapter = -1;
    let scrollProgress = 0;
    const started = performance.now();
    function applyChapter(index) {
      currentChapter = index;
      const step = chapters[index].step;
      const updated = model.map(node => {
        const state = {...node};
        caseData.steps.slice(0,step).forEach(item => { if(item.updates?.[node.id]) Object.assign(state,item.updates[node.id]); });
        return state;
      });
      const focus = caseData.steps[step-1].focus;
      const visibleHypotheses = updated.filter(node => node.kind === "hypothesis" && node.status !== "rejected" && node.born <= step).sort((a,b) => b.depth-a.depth);
      const leadingNode = updated.find(node => node.id === focus) || visibleHypotheses[0];
      const attr = geometry.attributes.color;
      const color = new THREE.Color();
      owner.forEach((nodeIndex, i) => {
        const node = updated[nodeIndex];
        color.set(node.status === "rejected" ? "#a7b3ba" : node.kind === "evidence" ? "#b48b51" : node.id === focus || node.status === "confirmed" ? "#2b8d78" : "#355d88");
        attr.setXYZ(i,color.r,color.g,color.b);
      });
      attr.needsUpdate = true;
      updated.forEach((node,i) => {
        labels[i].classList.toggle("is-focus", node.id === focus || node.status === "confirmed");
        labels[i].classList.toggle("is-rejected",node.status === "rejected");
        labels[i].dataset.eligible = node.born <= step ? (node.status === "rejected" ? .5 : 1) : 0;
        labels[i].dataset.priority = node.id === leadingNode?.id ? 3 : node.id === "alert" ? 2 : node.status === "rejected" ? 0 : 1;
      });
      visual.dataset.heroStep = step;
    }
    function draw(now = performance.now()) {
      animationFrame = 0;
      if (!visible || document.hidden || contextLost || shaderFailed) return;
      if (!reduced.matches && now-lastTime < 32) { animationFrame=requestAnimationFrame(draw); return; }
      lastTime = now;
      material.uniforms.uTime.value = reduced.matches ? 0 : (now-started)/1000;
      material.uniforms.uGather.value = reduced.matches ? 1 : Math.min(1,(now-started)/1800);
      const morph = reduced.matches ? 1 : THREE.MathUtils.smoothstep(scrollProgress,.04,.85);
      material.uniforms.uMorph.value = morph;
      const targetStep = chapters[currentChapter].step;
      material.uniforms.uStep.value = reduced.matches ? targetStep : THREE.MathUtils.lerp(material.uniforms.uStep.value,targetStep,.08);
      smoothX += (pointer.x-smoothX)*.045; smoothY += (pointer.y-smoothY)*.045;
      sculpture.rotation.y = -.42*(1-scrollProgress) + (reduced.matches ? 0 : smoothX*.2 + Math.sin(now*.00016)*.045);
      sculpture.rotation.x = .08*(1-scrollProgress) + (reduced.matches ? 0 : smoothY*.06);
      sculpture.position.y = THREE.MathUtils.lerp(.1,.5,morph);
      sculpture.scale.setScalar(THREE.MathUtils.lerp(1.22,1.05,morph));
      sculpture.updateMatrixWorld();
      const projectedLabels = model.map((node,i) => {
        projected.copy(node.origin).lerp(node.position,morph).applyMatrix4(sculpture.matrixWorld).project(camera);
        const labelOffset = visual.clientWidth <= 600 ? 24 : 34;
        const left = (projected.x+1)*visual.clientWidth/2-labels[i].offsetWidth/2;
        const top = (1-projected.y)*visual.clientHeight/2+labelOffset;
        labels[i].style.transform = `translate(${left}px,${top}px)`;
        return {label:labels[i],left,top,right:left+labels[i].offsetWidth,bottom:top+labels[i].offsetHeight};
      });
      // Preserve the focus label; omit lower-priority labels when a short viewport crowds them.
      const placed = [];
      projectedLabels.sort((a,b) => Number(b.label.dataset.priority)-Number(a.label.dataset.priority)).forEach(item => {
        const alpha = Number(item.label.dataset.eligible)*THREE.MathUtils.smoothstep(scrollProgress,.15,.42);
        const crowded = placed.some(other => item.left<other.right+8 && item.right>other.left-8 && item.top<other.bottom+8 && item.bottom>other.top-8);
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
      const halfHeight = width <= 600 || height < 350 ? 3.9 : aspect < 1.3 ? 3.6 : 3.15;
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
    updateVisual = (p,index) => { scrollProgress=p; if(index!==currentChapter) applyChapter(index); wake(); };
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
