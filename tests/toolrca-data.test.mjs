import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compareRows, modelEffects, systemEffects, signed } from '../assets/js/src/toolrca-metrics.js';

const data = JSON.parse(readFileSync(new URL('../_data/toolrca_project.json', import.meta.url)));

test('paper coverage is eight configurations, with only four shared across models', () => {
  assert.equal(data.overall.length, 8);
  assert.equal(new Set(data.configs).size, 8);
  assert.equal(data.models.length, 4);
  assert.deepEqual(data.overall.map(row => row.id), data.configs);
  data.models.forEach(model => {
    assert.deepEqual(model.rows.map(row => row.id), data.common_configs);
    model.rows.forEach(row => assert.equal(row.values.length, 8));
  });
  data.overall.forEach(row => assert.equal(row.values.length, 7));
  data.system_results.forEach(row => assert.equal(row.values.length, 12));
});

test('default composition tradeoff uses pp and a total-token ratio', () => {
  const result = compareRows(data.overall, 'L3', 'L1+L2+L3');
  assert.equal(signed(result.ac), '\u22124.8');
  assert.equal(signed(result.ta), '+3.4');
  assert.equal(result.tokenRatio.toFixed(2), '4.17');
  assert.equal(compareRows(data.overall, 'L3', 'L3').tokenRatio, 1);
});

test('every directly selectable comparison uses measured configurations', () => {
  for (const reference of data.configs) {
    for (const comparison of data.configs) {
      const result = compareRows(data.overall, reference, comparison);
      assert.ok(Number.isFinite(result.ac));
      assert.ok(Number.isFinite(result.ta));
      assert.ok(Number.isFinite(result.tokenRatio) && result.tokenRatio > 0);
    }
  }
  const page = readFileSync(new URL('../_pages/toolrca-project.html', import.meta.url), 'utf8');
  assert.match(page, /type="radio" name="trca-reference"/);
  assert.match(page, /type="radio" name="trca-comparison"/);
  assert.doesNotMatch(page, /<select data-trca-(reference|compare)/);
  assert.match(page, /include toolrca-spectrum\.html/);
  assert.doesNotMatch(page, /tool-spectrum-v2\.webp/);
});

test('the native spectrum covers four independent levels and leaves diagnosis to the agent', () => {
  assert.deepEqual(data.levels.map(level => level.id), ['L0', 'L1', 'L2', 'L3']);
  data.levels.forEach(level => {
    for (const field of ['action', 'result', 'remaining', 'visual_description']) {
      assert.equal(typeof level.diagram[field], 'string');
      assert.ok(level.diagram[field].length > 0);
    }
  });
  assert.match(data.levels[0].diagram.action, /Python/);
  assert.match(data.levels[2].diagram.remaining, /symptoms from causes/);
  const diagram = readFileSync(new URL('../_includes/toolrca-spectrum.html', import.meta.url), 'utf8');
  assert.match(diagram, /The agent makes the final diagnosis at every level/);
  assert.match(diagram, /Independent interfaces, not a required pipeline/);
  assert.match(diagram, /viewBox="0 0 300 112"/);
  assert.doesNotMatch(diagram, /<img|<image|\.webp|\.png/);
});

test('capability effects and invocation rates reproduce Figure 7', () => {
  assert.deepEqual(data.models.map(model => signed(modelEffects(model).ac)), ['\u221213.9', '+4.1', '+5.3', '+14.0']);
  assert.deepEqual(data.models.map(model => modelEffects(model).usage), [0.8, 61.3, 91.5, 94]);
  const plus = data.models.find(model => model.id === 'plus');
  plus.rows.forEach(row => {
    const full = data.overall.find(other => other.id === row.id).values;
    assert.deepEqual(row.values.slice(0, 4), full.slice(0, 4));
    assert.deepEqual(row.values.slice(5), full.slice(4));
  });
});

test('all nine additions add exactly one structured level and preserve system results', () => {
  assert.equal(data.additions.length, 9);
  const unique = new Set();
  data.additions.forEach(addition => {
    const before = addition.from.split('+');
    const after = addition.to.split('+');
    assert.equal(after.length, before.length + 1);
    assert.ok(before.every(level => after.includes(level)));
    assert.ok(after.includes(addition.level) && !before.includes(addition.level));
    unique.add(`${addition.from}:${addition.to}`);
    assert.equal(systemEffects(data, addition).length, 3);
  });
  assert.equal(unique.size, 9);
  const results = systemEffects(data, data.additions[1]);
  assert.deepEqual(results.map(row => signed(row.ac)), ['+6.9', '\u22129.6', '\u221211.0']);
  assert.deepEqual(results.map(row => signed(row.ta)), ['+4.8', '+1.6', '+2.7']);
});

test('the reported case ends at auth / delay without fabricated measurements', () => {
  assert.equal(data.audit.length, 6);
  assert.equal(data.audit.at(-1).chosen, 'truth');
  assert.match(data.audit.at(-1).evidence, /ts-auth-service/);
  assert.match(data.audit.at(-1).evidence, /delay/);
  assert.equal(data.guidelines.length, 6);
  data.audit.forEach(frame => {
    assert.equal(frame.confidence, undefined);
    assert.equal(frame.step, undefined);
    assert.ok(frame.interpretation.length > 0);
    assert.ok(frame.check.length > 0);
  });
  data.audit.slice(0, -1).forEach(frame => {
    assert.notEqual(frame.chosen, 'truth');
    assert.doesNotMatch(`${frame.title} ${frame.evidence} ${frame.auth} ${frame.caption}`, /correct (service|candidate|root cause|recommendation)|Ground.truth root cause|Injected failure type/i);
  });
  assert.doesNotMatch(data.audit[0].evidence, /delay/);
  assert.match(data.audit[3].check, /does not rule out a delay fault/);
  assert.match(data.audit.at(-1).check, /Do not conclude that L3 should always be trusted/);
});

test('examples are explicitly schematic, with observations distinct from diagnoses', () => {
  assert.match(data.spectrum_example.notice, /not a recorded benchmark trace/);
  data.levels.forEach(level => {
    const example = data.spectrum_example.outputs[level.id];
    assert.equal(example.lines.length, 3);
    assert.ok(example.meaning.length > 0);
  });
  assert.match(data.spectrum_example.outputs.L1.meaning, /has not labeled them anomalous/);
  assert.match(data.spectrum_example.outputs.L2.meaning, /does not mean most likely root cause/);
  assert.match(data.spectrum_example.outputs.L3.meaning, /not the final answer/);
});

test('reporting keeps missing protocol details and conditional denominators explicit', () => {
  assert.equal(data.reporting.length, 6);
  const python = data.reporting.find(item => item.topic.startsWith('Python'));
  assert.match(python.status, /Not specified/);
  assert.match(python.detail, /does not explicitly say whether structured configurations also expose it/);
  const uncertainty = data.reporting.find(item => item.topic.startsWith('Repeated'));
  assert.match(uncertainty.detail, /Repeat counts, random seeds, and uncertainty intervals are not stated/);
  const switching = data.reporting.find(item => item.topic.startsWith('Conditional'));
  assert.match(switching.detail, /sample counts are not stated/);
  assert.match(switching.detail, /not overall tool accuracy/);
});

test('fixed findings precede exploration and guidelines provide actionable checks', () => {
  const page = readFileSync(new URL('../_pages/toolrca-project.html', import.meta.url), 'utf8');
  for (const [section, control] of [['composition', 'data-comparison'], ['capability', 'data-trca-tabs="models"'], ['environment', 'data-trca-addition']]) {
    const summary = page.indexOf(`data-result-summary="${section}"`);
    assert.ok(summary > 0 && summary < page.indexOf(control));
  }
  assert.match(page, /Read the full abstract/);
  assert.match(page, /data-audit-observation/);
  assert.match(page, /data-audit-interpretation/);
  assert.match(page, /data-audit-check/);
  data.guidelines.forEach(item => {
    for (const field of ['when', 'check', 'try', 'evidence', 'href']) assert.ok(item[field].length > 0);
    assert.ok(page.includes(`id="${item.href.slice(1)}"`));
  });
  assert.match(page, /not separately validated improvements/);
});

test('public release exposes verified paper links, authors, and a copyable citation', () => {
  const page = readFileSync(new URL('../_pages/toolrca-project.html', import.meta.url), 'utf8');
  assert.doesNotMatch(page, /sitemap: false|search: false|noindex|Coming Soon/);
  assert.equal(data.publication.arxiv_url, 'https://arxiv.org/abs/2610.05009');
  assert.equal(data.publication.pdf_url, 'https://arxiv.org/pdf/2610.05009');
  assert.equal(data.publication.year, 2026);
  assert.equal(data.publication.primary_class, 'cs.SE');
  assert.equal(data.publication.bibtex_key, 'luo2026rethinkingtooldesignagentic');
  assert.deepEqual(data.authors.map(author => author.name), ['Yu Luo', 'Rongchen Gao', 'Zhenhui Zhou', 'Changchang Liu', 'Yuliang You', 'Yongqian Sun', 'Shenglin Zhang', 'Qiuai Fu', 'Shijie Wang', 'Dan Pei']);
  assert.deepEqual(data.authors.filter(author => author.corresponding).map(author => author.name), ['Yongqian Sun']);
  assert.deepEqual(data.affiliations.map(item => item.name), ['Nankai University', 'Huawei Technologies Co., Ltd.', 'Tsinghua University']);
  data.authors.forEach(author => assert.ok(data.affiliations.some(item => item.id === author.affiliation)));
  assert.match(page, /href="{{ study.publication.arxiv_url }}"/);
  assert.match(page, /href="{{ study.publication.pdf_url }}"/);
  assert.match(page, /class="trca-authors"/);
  assert.match(page, /class="copy-bibtex-btn"/);
  assert.match(page, /id="bibtex-code"/);
  assert.match(page, /archivePrefix=\{arXiv\}/);
  assert.match(data.abstract, /eight configurations with Qwen3.7-Plus/);
  assert.doesNotMatch(page, /The abstract counts seven/);
  assert.equal((page.match(/<section class="trca-section/g) || []).length, 9);
  const config = readFileSync(new URL('../_config.yml', import.meta.url), 'utf8');
  assert.match(config, /- assets\/js\/src\/toolrca\.README\.md/);
});

test('homepage announces ToolRCA above PoS without adding a code link or changing the published count', () => {
  const about = readFileSync(new URL('../_pages/about.md', import.meta.url), 'utf8');
  const news = about.split('# 🔥 News')[1].split('# Preprint')[0];
  assert.match(news.trim().split('\n')[0], /2026\.10.*ToolRCA.*2610\.05009/);
  const preprints = about.split('# Preprint')[1].split('# 📝 Publications')[0];
  assert.ok(preprints.indexOf('2610.05009') < preprints.indexOf('2610.01415'));
  const toolrca = preprints.slice(0, preprints.indexOf('2610.01415'));
  assert.match(toolrca, /badge">Arxiv 2026/);
  assert.match(toolrca, /motivation\.webp/);
  assert.match(toolrca, /<span>Project<\/span>/);
  assert.match(toolrca, /<span>arXiv<\/span>/);
  assert.doesNotMatch(toolrca, /<span>Code<\/span>/);
  assert.match(about, /He has published 10 papers/);
});

test('the cover pairs three evidence-backed hooks with concrete design rules', () => {
  assert.deepEqual(data.takeaways.map(item => item.id), ['composition', 'capability', 'environment']);
  for (const item of data.takeaways) {
    assert.ok(item.title.length > 0 && item.rule.length > 0);
    assert.equal(item.href, `#${item.id}`);
  }
  const page = readFileSync(new URL('../_pages/toolrca-project.html', import.meta.url), 'utf8');
  const brief = readFileSync(new URL('../_includes/toolrca-brief.html', import.meta.url), 'utf8');
  assert.ok(page.indexOf('include toolrca-brief.html') < page.indexOf('<section'));
  assert.match(brief, /<ul class="trca-brief-list">/);
  assert.match(brief, /data-key-finding/);
  assert.match(brief, /<strong>Design rule:<\/strong>/);
  assert.match(brief, /study-derived, not separately validated/);
  assert.match(brief, /divided_by: l3.values\[4\]/);
  assert.match(brief, /minus: small_before.values\[0\]/);
  assert.match(brief, /minus: system_before.values\[8\]/);
  assert.match(brief, /<a target="_self" href="{{ item.href }}">/);
});

test('reading order leads with the case and evidence, not the paper structure', () => {
  const page = readFileSync(new URL('../_pages/toolrca-project.html', import.meta.url), 'utf8');
  const ids = [...page.matchAll(/<section class="trca-section[^"]*" id="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(ids, ['audit', 'composition', 'capability', 'environment', 'guidelines', 'spectrum', 'design', 'abstract', 'bibtex']);
  const indices = [...page.matchAll(/class="trca-index">(\d{2}) \/ /g)].map(match => match[1]);
  assert.deepEqual(indices, ['01', '02', '03', '04', '05', '06', '07', '08', '09']);
  const nav = [...page.matchAll(/- \{label: [^,]+, href: "#([^"]+)"\}/g)].map(match => match[1]);
  assert.deepEqual(nav, ['findings', ...ids]);
  assert.equal((page.match(/class="trca-reading-link"/g) || []).length, 8);
  assert.ok(page.indexOf('<footer') > page.lastIndexOf('</div></section>'));
  assert.match(page, /evidence-analysis tools \(L2\)/);
  assert.match(page, /diagnostic tools \(L3\)/);
  assert.doesNotMatch(page, /<a href=/);
});
