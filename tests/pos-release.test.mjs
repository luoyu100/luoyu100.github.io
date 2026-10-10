import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = path => readFileSync(new URL(path, import.meta.url), "utf8");
const about = read("../_pages/about.md");

test("October news announces PoS paper and code below the newer ToolRCA release", () => {
  const news = about.split("# 🔥 News")[1].split("# Preprint")[0];
  const entries = news.trim().split("\n");
  assert.match(entries[0], /2026\.10.*ToolRCA/);
  assert.match(entries[1], /2026\.10.*Progression of States \(PoS\)/);
  assert.match(entries[1], /2610\.01415/);
  assert.match(entries[1], /\[code\]\(https:\/\/github\.com\/luoyu100\/PoS\)/);
  assert.equal(entries.filter(entry => /Progression of States \(PoS\)/.test(entry)).length, 1);
});

test("PoS card keeps paper and code links and adds a local Hugging Face logo link", () => {
  const preprints = about.split("# Preprint")[1].split("# 📝 Publications")[0];
  const pos = preprints.slice(preprints.indexOf('href="https://arxiv.org/abs/2610.01415"'));
  assert.match(pos, /href="https:\/\/github\.com\/luoyu100\/PoS"/);
  assert.match(pos, /href="https:\/\/huggingface\.co\/papers\/2610\.01415"/);
  assert.match(pos, /hugging-face\.svg/);
  assert.match(pos, /<span>Hugging Face<\/span>/);
  assert.match(pos, /class="paper-actions" style="flex-wrap: wrap; overflow: visible;"/);
});

test("PoS project shares the Hugging Face URL across its header and resources", () => {
  const data = read("../_data/pos_project.yml");
  const page = read("../_pages/progression-of-states-project.html");
  assert.match(data, /huggingface_url: https:\/\/huggingface\.co\/papers\/2610\.01415/);
  assert.equal((page.match(/href="{{ pos\.huggingface_url }}"/g) || []).length, 2);
  assert.equal((page.match(/hugging-face\.svg/g) || []).length, 2);
  assert.match(page, /Open-source implementation, prompts, and benchmark configurations/);
  assert.doesNotMatch(page, /repository linked in the manuscript/);
});

test("official Hugging Face icon is self-contained and preserves its square viewBox", () => {
  const svg = read("../images/hugging-face.svg");
  assert.match(svg, /viewBox="0 0 256 256"/);
  assert.match(svg, /<path /);
  assert.doesNotMatch(svg, /<(?:script|foreignObject|image)\b|(?:href|src)=|\bon\w+=/i);
});
