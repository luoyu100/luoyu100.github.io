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
  });
});

test('page stays unlisted and paper remains unavailable', () => {
  const page = readFileSync(new URL('../_pages/toolrca-project.html', import.meta.url), 'utf8');
  assert.match(page, /sitemap: false/);
  assert.match(page, /search: false/);
  assert.match(page, /robots: noindex, nofollow/);
  assert.match(page, /disabled class="trca-paper-soon"/);
  assert.doesNotMatch(page, /href="[^"]+\.pdf/);
  assert.equal((page.match(/<section class="trca-section/g) || []).length, 8);
  const config = readFileSync(new URL('../_config.yml', import.meta.url), 'utf8');
  assert.match(config, /- assets\/js\/src\/toolrca\.README\.md/);
});
