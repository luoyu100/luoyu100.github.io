import { select, scaleLinear, axisBottom, axisLeft } from 'd3';
import { compareRows, modelEffects, systemEffects, signed } from './toolrca-metrics.js';

const root = document.querySelector('[data-toolrca-project]');
if (root) initialize(root);

function initialize(root) {
  const data = JSON.parse(root.querySelector('[data-trca-data]').textContent);
  const q = selector => root.querySelector(selector);
  const qa = selector => [...root.querySelectorAll(selector)];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const colors = { blue: '#507fa8', teal: '#368675', coral: '#bc6255', neutral: '#bacbcf' };
  const state = { reference: 'L3', comparison: 'L1+L2+L3', model: 0, addition: 1, frame: 0, playing: false };
  let timer = null;
  let resizeFrame = null;
  root.classList.add('is-ready');
  qa('[data-trca-fallback-table]').forEach(details => { details.open = false; });

  function animate(node) {
    node.classList.remove('is-changing');
    if (!motion.matches) requestAnimationFrame(() => node.classList.add('is-changing'));
  }

  function tabs(name, onChange) {
    const list = q(`[data-trca-tabs="${name}"]`);
    const buttons = [...list.querySelectorAll('[role=tab]')];
    const panels = qa(`[data-trca-panel="${name}"]`);
    function show(index, focus = false) {
      buttons.forEach((button, i) => {
        button.setAttribute('aria-selected', String(index === i));
        button.tabIndex = index === i ? 0 : -1;
        panels[i].hidden = index !== i;
      });
      animate(panels[index]);
      if (onChange) onChange(index);
      if (focus) buttons[index].focus({ preventScroll: true });
    }
    buttons.forEach((button, index) => {
      button.addEventListener('click', () => show(index));
      button.addEventListener('keydown', event => {
        let next = index;
        if (event.key === 'ArrowRight') next = (index + 1) % buttons.length;
        else if (event.key === 'ArrowLeft') next = (index - 1 + buttons.length) % buttons.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = buttons.length - 1;
        else return;
        event.preventDefault();
        show(next, true);
      });
    });
    show(0);
  }

  function svgFor(container, height, label) {
    const width = Math.max(1, Math.floor(container.getBoundingClientRect().width));
    container.style.height = `${height}px`;
    const svg = select(container).selectAll('svg').data([null]).join('svg')
      .attr('viewBox', `0 0 ${width} ${height}`).attr('role', 'img').attr('aria-label', label);
    return { svg, width, height };
  }

  function bars(selector, rows, metric, label, highlighted) {
    const container = q(selector);
    const height = rows.length * 42 + 44;
    const { svg, width } = svgFor(container, height, label);
    const font = Number.parseFloat(getComputedStyle(root).getPropertyValue('--body'));
    const left = font === 15 ? 102 : 112;
    const right = 48;
    const x = scaleLinear().domain([0, 100]).range([left, Math.max(left + 1, width - right)]);
    const axis = svg.selectAll('.trca-axis').data([null]).join('g').attr('class', 'trca-axis').attr('transform', `translate(0,${height - 32})`);
    axis.call(axisBottom(x).tickValues(width < 430 ? [0, 50, 100] : [0, 25, 50, 75, 100]).tickSize(4).tickPadding(9));
    const groups = svg.selectAll('.trca-bar-row').data(rows, row => row.id).join(enter => {
      const g = enter.append('g').attr('class', 'trca-bar-row');
      g.append('text').attr('class', 'config');
      g.append('rect').attr('class', 'track');
      g.append('rect').attr('class', 'value');
      g.append('text').attr('class', 'amount');
      g.append('title');
      return g;
    }).attr('transform', (row, index) => `translate(0,${index * 42 + 8})`);
    groups.select('.config').attr('x', left - 12).attr('y', 17).attr('text-anchor', 'end').text(row => row.id);
    groups.select('.track').attr('x', left).attr('y', 1).attr('height', 21).attr('width', x(100) - left).attr('fill', '#e9eeee');
    const rects = groups.select('.value').attr('x', left).attr('y', 1).attr('height', 21).attr('rx', 2);
    rects.interrupt();
    const update = motion.matches ? rects : rects.transition().duration(300);
    update.attr('width', row => Math.max(0, x(row.values[metric]) - left)).attr('fill', row => highlighted(row));
    groups.select('.amount').attr('x', width - 1).attr('y', 17).attr('text-anchor', 'end').text(row => row.values[metric].toFixed(1));
    groups.select('title').text(row => `${row.id}: ${row.values[metric].toFixed(1)}%`);
  }

  function deltaBlock(label, value, detail, isDelta = true) {
    const block = document.createElement('div');
    const name = document.createElement('span'); name.textContent = label;
    const number = document.createElement('strong'); number.textContent = value;
    if (isDelta) number.className = value.startsWith('\u2212') ? 'trca-negative' : value.startsWith('+') ? 'trca-positive' : '';
    const note = document.createElement('p'); note.textContent = detail;
    block.append(name, number, note);
    return block;
  }

  function drawScatter() {
    const container = q('[data-chart=efficiency]');
    const height = 360;
    const { svg, width } = svgFor(container, height, 'Token and latency tradeoffs for all eight configurations');
    const x = scaleLinear().domain([0, 160]).range([56, width - 22]);
    const y = scaleLinear().domain([0, 100]).range([height - 72, 20]);
    svg.selectAll('.trca-grid').data([null]).join('g').attr('class', 'trca-grid').attr('transform', 'translate(56,0)')
      .call(axisLeft(y).tickValues([0, 25, 50, 75, 100]).tickSize(-(width - 78)).tickPadding(10));
    svg.selectAll('.trca-axis').data([null]).join('g').attr('class', 'trca-axis').attr('transform', `translate(0,${height - 72})`)
      .call(axisBottom(x).tickValues(width < 500 ? [0, 80, 160] : [0, 40, 80, 120, 160]).tickPadding(10));
    svg.selectAll('.trca-x-label').data([null]).join('text').attr('class', 'trca-x-label').attr('x', width / 2).attr('y', height - 12).attr('text-anchor', 'middle').text('Tokens per case (K)');
    svg.selectAll('.trca-y-label').data([null]).join('text').attr('class', 'trca-y-label').attr('x', 56).attr('y', 16).text('Latency (s)');
    const points = svg.selectAll('.trca-point').data(data.overall, row => row.id).join(enter => {
      const g = enter.append('g').attr('class', 'trca-point').attr('tabindex', 0);
      g.append('circle'); g.append('title'); return g;
    });
    points.attr('role', 'img').attr('aria-label', row => `${row.id}: ${row.values[4]}K tokens, ${row.values[5]} seconds, AC@1 ${row.values[0]}%, TA ${row.values[3]}%, USD ${row.values[6].toFixed(3)} per case`);
    points.select('circle').attr('cx', row => x(row.values[4])).attr('cy', row => y(row.values[5]))
      .attr('r', row => row.id === state.reference || row.id === state.comparison ? 8 : 5)
      .attr('fill', row => row.id === state.reference ? colors.blue : row.id === state.comparison ? colors.teal : '#96aeb5')
      .attr('stroke', '#fff').attr('stroke-width', 2);
    points.select('title').text(row => `${row.id}\n${row.values[4]}K tokens · ${row.values[5]} seconds\nAC@1 ${row.values[0]}% · TA ${row.values[3]}% · $${row.values[6].toFixed(3)}`);
    const selected = data.overall.filter(row => row.id === state.reference || row.id === state.comparison);
    svg.selectAll('.trca-point-label').data(selected, row => row.id).join('text').attr('class', 'trca-point-label')
      .attr('x', row => Math.max(78, Math.min(width - 75, x(row.values[4])))).attr('y', row => y(row.values[5]) - 18).attr('text-anchor', 'middle')
      .text(row => width < 500 ? row.id === state.reference ? 'A' : 'B' : row.id);
    q('.trca-legend-ref').textContent = `A · ${state.reference}`;
    q('.trca-legend-compare').textContent = `B · ${state.comparison}`;
    let note = container.nextElementSibling;
    if (!note || !note.matches('[data-scatter-detail]')) {
      note = document.createElement('p'); note.dataset.scatterDetail = ''; note.className = 'trca-source';
      note.setAttribute('aria-live', 'polite'); container.after(note);
    }
    note.textContent = 'Each point represents one tested configuration.';
    points.on('mouseenter focus', (event, row) => {
      note.textContent = `${row.id}: ${row.values[4]}K tokens · ${row.values[5]}s · AC@1 ${row.values[0]}% · TA ${row.values[3]}% · $${row.values[6].toFixed(3)}/case`;
    });
  }

  function drawOverall() {
    const result = compareRows(data.overall, state.reference, state.comparison);
    q('[data-trca-deltas]').replaceChildren(
      deltaBlock('Localization · AC@1', `${signed(result.ac)} pp`, `${result.a[0].toFixed(1)}% → ${result.b[0].toFixed(1)}%`),
      deltaBlock('Failure typing · TA', `${signed(result.ta)} pp`, `${result.a[3].toFixed(1)}% → ${result.b[3].toFixed(1)}%`),
      deltaBlock('Total tokens', `${result.tokenRatio.toFixed(2)}×`, `${result.a[4].toFixed(1)}K → ${result.b[4].toFixed(1)}K per case`, false)
    );
    const highlight = row => row.id === state.reference ? colors.blue : row.id === state.comparison ? colors.teal : colors.neutral;
    bars('[data-chart=overall-ac]', data.overall, 0, 'Top-1 localization accuracy for eight tool configurations', highlight);
    bars('[data-chart=overall-ta]', data.overall, 3, 'Failure type accuracy for eight tool configurations', highlight);
    drawScatter();
    qa('[data-overall-row]').forEach(row => {
      const id = row.dataset.overallRow;
      if (id === state.reference || id === state.comparison) row.dataset.selected = id === state.reference ? 'reference' : 'comparison';
      else delete row.dataset.selected;
    });
  }

  function drawModel() {
    const model = data.models[state.model];
    const result = modelEffects(model);
    const highlight = row => row.id === 'L1+L2' ? colors.blue : row.id === 'L1+L2+L3' ? colors.teal : colors.neutral;
    bars('[data-chart=model-ac]', model.rows, 0, `${model.name}: localization under four shared configurations`, highlight);
    bars('[data-chart=model-ta]', model.rows, 3, `${model.name}: type accuracy under four shared configurations`, highlight);
    q('[data-model-deltas]').replaceChildren(
      deltaBlock('Add L3 · localization', `${signed(result.ac)} pp`, 'L1+L2 → L1+L2+L3'),
      deltaBlock('Add L3 · failure typing', `${signed(result.ta)} pp`, 'L1+L2 → L1+L2+L3'),
      deltaBlock('L3 invocation rate', `${result.usage.toFixed(1)}%`, 'Under the full toolset', false)
    );
    q('[data-model-usage]').textContent = `${model.usage.toFixed(1)}%`;
    q('[data-model-usage-bar]').style.width = `${model.usage}%`;
  }

  function drawSystems() {
    const addition = data.additions[state.addition];
    const results = systemEffects(data, addition);
    const container = q('[data-chart=systems]');
    const mobile = innerWidth < 768;
    const height = mobile ? 430 : 340;
    const { svg, width } = svgFor(container, height, `Changes after ${addition.from} to ${addition.to} in Online Boutique, Sock Shop, and Train Ticket`);
    const x = scaleLinear().domain([-60, 60]).range([54, width - 48]);
    const step = mobile ? 110 : 80;
    svg.selectAll('.trca-axis').data([null]).join('g').attr('class', 'trca-axis').attr('transform', `translate(0,${height - 44})`)
      .call(axisBottom(x).tickValues(mobile ? [-60, 0, 60] : [-60, -30, 0, 30, 60]).tickPadding(8));
    svg.selectAll('.trca-zero').data([null]).join('line').attr('class', 'trca-zero').attr('x1', x(0)).attr('x2', x(0)).attr('y1', 20).attr('y2', height - 44).attr('stroke', '#aebfbc');
    const groups = svg.selectAll('.trca-system-row').data(results, result => result.id).join(enter => {
      const g = enter.append('g').attr('class', 'trca-system-row');
      g.append('text').attr('class', 'system');
      for (const key of ['ac', 'ta']) {
        g.append('rect').attr('class', key);
        g.append('text').attr('class', `${key}-label`);
      }
      g.append('title'); return g;
    }).attr('transform', (result, index) => `translate(0,${index * step + 26})`);
    groups.select('.system').attr('x', 0).attr('y', 28).text(result => result.id);
    ['ac', 'ta'].forEach((key, index) => {
      const rects = groups.select(`.${key}`).attr('y', index * 27).attr('height', 18).attr('rx', 2);
      rects.interrupt();
      const update = motion.matches ? rects : rects.transition().duration(300);
      update.attr('x', result => x(Math.min(0, result[key]))).attr('width', result => Math.abs(x(result[key]) - x(0)))
        .attr('fill', result => result[key] < 0 ? colors.coral : key === 'ac' ? colors.blue : colors.teal);
      groups.select(`.${key}-label`).attr('x', result => x(result[key]) + (result[key] < 0 ? -8 : 8)).attr('y', index * 27 + 14)
        .attr('text-anchor', result => result[key] < 0 ? 'end' : 'start').text(result => signed(result[key]));
    });
    groups.select('title').text(result => `${result.name}: AC@1 ${signed(result.ac)} pp; TA ${signed(result.ta)} pp`);
    svg.selectAll('.trca-system-unit').data([null]).join('text').attr('class', 'trca-system-unit').attr('x', width / 2).attr('y', height - 3).attr('text-anchor', 'middle').text('Change (percentage points)');
    let legend = container.previousElementSibling;
    if (!legend || !legend.matches('[data-system-legend]')) {
      legend = document.createElement('p'); legend.dataset.systemLegend = ''; legend.className = 'trca-source trca-interactive'; container.before(legend);
    }
    legend.textContent = `${addition.from} → ${addition.to} · upper bar: localization (AC@1) · lower bar: failure typing (TA)`;
    q('[data-system-values]').replaceChildren(...results.map(result => {
      const node = document.createElement('div');
      const label = document.createElement('span'); label.className = 'trca-eyebrow'; label.textContent = result.id;
      const title = document.createElement('h3'); title.textContent = result.name;
      const ac = document.createElement('p'); ac.textContent = `Localization ${signed(result.ac)} pp`; ac.className = result.ac < 0 ? 'trca-negative' : 'trca-positive';
      const ta = document.createElement('p'); ta.textContent = `Failure typing ${signed(result.ta)} pp`; ta.className = result.ta < 0 ? 'trca-negative' : 'trca-positive';
      node.append(label, title, ac, ta); return node;
    }));
  }

  function pause() {
    clearTimeout(timer); timer = null; state.playing = false;
    q('[data-audit-play]').setAttribute('aria-label', 'Play case');
    q('[data-audit-play]').title = 'Play case';
    q('[data-audit-play] i').className = 'fas fa-play';
  }
  function frame(index) {
    state.frame = Math.max(0, Math.min(data.audit.length - 1, index));
    const item = data.audit[state.frame];
    q('[data-audit-phase]').textContent = `${String(state.frame + 1).padStart(2, '0')} / ${item.phase}`;
    q('[data-audit-title]').textContent = item.title;
    const evidence = q('[data-audit-evidence]');
    evidence.querySelector('h3').textContent = item.evidence_title;
    q('[data-audit-observation]').textContent = item.evidence;
    q('[data-audit-interpretation]').textContent = item.interpretation;
    q('[data-audit-interpretation-label]').textContent = item.chosen === 'truth' ? 'Decision versus ground truth · hindsight' : 'Agent interpretation · summary';
    q('[data-audit-check]').textContent = item.check;
    q('[data-audit-perspective]').textContent = item.chosen === 'truth' ? 'BENCHMARK LABEL / HINDSIGHT' : 'AVAILABLE OBSERVATIONS';
    animate(evidence);
    q('[data-auth-state]').textContent = item.auth;
    q('[data-payment-state]').textContent = item.payment;
    const auth = q('[data-candidate=auth]'), payment = q('[data-candidate=payment]');
    auth.classList.toggle('is-chosen', item.chosen === 'auth' || item.chosen === 'truth');
    auth.classList.toggle('is-rejected', item.chosen === 'payment');
    payment.classList.toggle('is-chosen', item.chosen === 'payment' && state.frame < 5);
    payment.classList.toggle('is-wrong', item.chosen === 'truth');
    const verdict = q('[data-audit-verdict]');
    verdict.querySelector('i').className = item.chosen === 'truth' ? 'fas fa-check-circle' : item.chosen ? 'fas fa-arrow-right' : 'fas fa-search';
    verdict.querySelector('span').textContent = item.chosen === 'truth' ? 'Ground truth: auth / delay' : item.chosen === 'payment' ? 'Agent favors payment' : item.chosen === 'auth' ? 'Agent retains auth' : 'Investigation open';
    q('[data-audit-caption]').textContent = item.caption;
    q('[data-audit-range]').value = state.frame;
    q('[data-audit-range]').setAttribute('aria-valuetext', `Frame ${state.frame + 1}: ${item.phase}`);
    q('[data-audit-counter]').textContent = `Frame ${state.frame + 1} / ${data.audit.length}`;
    q('[data-audit-prev]').disabled = state.frame === 0;
    q('[data-audit-next]').disabled = state.frame === data.audit.length - 1;
    qa('[data-audit-jump]').forEach((button, i) => {
      if (i === state.frame) button.setAttribute('aria-current', 'step'); else button.removeAttribute('aria-current');
    });
    if (state.frame === data.audit.length - 1) pause();
  }
  function play() {
    if (state.frame === data.audit.length - 1) frame(0);
    state.playing = true;
    q('[data-audit-play]').setAttribute('aria-label', 'Pause case');
    q('[data-audit-play]').title = 'Pause case';
    q('[data-audit-play] i').className = 'fas fa-pause';
    function tick() {
      timer = setTimeout(() => {
        if (!state.playing) return;
        frame(state.frame + 1);
        if (state.playing) tick();
      }, 5000);
    }
    tick();
  }

  function configurationChoices(selector, key) {
    qa(selector).forEach(input => {
      input.checked = input.value === state[key];
      input.addEventListener('change', () => {
        if (!input.checked) return;
        state[key] = input.value;
        drawOverall();
      });
    });
  }
  configurationChoices('[data-trca-reference]', 'reference');
  configurationChoices('[data-trca-compare]', 'comparison');
  q('[data-trca-addition]').addEventListener('change', event => { state.addition = Number(event.target.value); drawSystems(); });
  tabs('spectrum');
  tabs('models', index => { state.model = index; drawModel(); });
  q('[data-audit-play]').addEventListener('click', () => state.playing ? pause() : play());
  q('[data-audit-prev]').addEventListener('click', () => { pause(); frame(state.frame - 1); });
  q('[data-audit-next]').addEventListener('click', () => { pause(); frame(state.frame + 1); });
  q('[data-audit-reset]').addEventListener('click', () => { pause(); frame(0); play(); });
  q('[data-audit-range]').addEventListener('input', event => { pause(); frame(Number(event.target.value)); });
  qa('[data-audit-jump]').forEach(button => button.addEventListener('click', () => { pause(); frame(Number(button.dataset.auditJump)); }));
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) pause();
    }, { threshold: 0 }).observe(q('[data-audit-player]'));
    const reveal = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); reveal.unobserve(entry.target); }
      });
    }, { threshold: 0.05 });
    qa('.trca-heading, .trca-rqs, .trca-design-grid, .trca-finding, .trca-call-stages, .trca-guidelines li').forEach(node => {
      node.classList.add('trca-reveal'); reveal.observe(node);
    });
  }

  const navLinks = [...document.querySelectorAll('.project-local-nav__links a')];
  const navSelect = document.querySelector('[data-trca-section-select]');
  const sections = qa('.trca-section');
  function updateNavigation() {
    const position = scrollY + 140;
    const active = [...sections].reverse().find(section => section.offsetTop <= position) || sections[0];
    navLinks.forEach(link => {
      if (link.hash === `#${active.id}`) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
    navSelect.value = `#${active.id}`;
  }
  navSelect.addEventListener('change', event => {
    const target = document.querySelector(event.target.value);
    if (!target) return;
    history.replaceState(null, '', event.target.value);
    target.scrollIntoView({ behavior: motion.matches ? 'instant' : 'smooth', block: 'start' });
  });
  let navPending = false;
  addEventListener('scroll', () => {
    if (navPending) return;
    navPending = true;
    requestAnimationFrame(() => { updateNavigation(); navPending = false; });
  }, { passive: true });

  function redraw() { drawOverall(); drawModel(); drawSystems(); updateNavigation(); }
  new ResizeObserver(() => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(redraw);
  }).observe(q('.trca-shell'));
  motion.addEventListener('change', redraw);
  frame(0);
  redraw();
}
