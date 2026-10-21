import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = path => readFileSync(new URL(path, import.meta.url), "utf8");
const about = read("../_pages/about.md");

test("October news announces PoS paper and code below the newer ToolRCA release", () => {
  const news = about.split("# 🔥 News")[1].split("# 🧪 Preprint")[0];
  const entries = news.trim().split("\n");
  const toolrcaIndex = entries.findIndex(entry => /2026\.10.*ToolRCA.*2610\.05009/.test(entry));
  const posIndex = entries.findIndex(entry => /2026\.10.*Progression of States \(PoS\)/.test(entry));
  assert.ok(toolrcaIndex >= 0 && posIndex > toolrcaIndex);
  assert.match(entries[posIndex], /2610\.01415/);
  assert.match(entries[posIndex], /\[code\]\(https:\/\/github\.com\/luoyu100\/PoS\)/);
  assert.equal(entries.filter(entry => /Progression of States \(PoS\)/.test(entry)).length, 1);
});

test("media coverage news uses the correct articles and stays in reverse chronological order", () => {
  const news = about.split("# 🔥 News")[1].split("# 🧪 Preprint")[0];
  const entries = news.trim().split("\n");
  assert.match(entries[0], /2026\.10.*🎉🎉.*\*\*PoS\*\* was featured in \[机器之心\]\(https:\/\/mp\.weixin\.qq\.com\/s\/WKCz1PUKyz510xMQX-5auA\)/);
  const gos = entries.find(entry => /2026\.06.*Graph of States.*featured in/.test(entry));
  assert.ok(gos);
  assert.match(gos, /\[机器之心\]\(https:\/\/mp\.weixin\.qq\.com\/s\/ZC_-zurf8iV6Kbp39AHgBg\)/);
  const months = entries.map(entry => entry.match(/202\d\.\d{2}/)?.[0]);
  assert.ok(months.every(Boolean));
  assert.deepEqual(months, [...months].sort().reverse());
  assert.equal(entries.filter(entry => /was featured in/.test(entry)).length, 2);
});

test("Preprint has its own emoji while retaining the existing navigation anchor", () => {
  const navigation = read("../_data/navigation.yml");
  assert.match(about, /^# 🧪 Preprint \{#preprint\}$/m);
  assert.match(about, /^# 📝 Publications/m);
  assert.match(navigation, /title: "Preprint"\s+url: "\/#preprint"/);
});

test("PoS card keeps paper and code links and adds a local Hugging Face logo link", () => {
  const preprints = about.split("# 🧪 Preprint")[1].split("# 📝 Publications")[0];
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

test("PoS media link matches the GoS media button markup and points to its own article", () => {
  const preprints = about.split("# 🧪 Preprint")[1].split("# 📝 Publications")[0];
  const pos = preprints.slice(preprints.indexOf('href="https://arxiv.org/abs/2610.01415"'));
  const publications = about.split("# 📝 Publications")[1];
  const mediaLink = /<a class="paper-story-link paper-story-link--wechat"[^>]*>[\s\S]*?<\/a>/;
  const posLink = pos.match(mediaLink)?.[0];
  const gosLink = publications.match(mediaLink)?.[0];
  assert.ok(posLink && gosLink);
  assert.match(posLink, /href="https:\/\/mp\.weixin\.qq\.com\/s\/WKCz1PUKyz510xMQX-5auA"/);
  assert.equal(posLink.replace(/href="[^"]+"/, 'href="article"'), gosLink.replace(/href="[^"]+"/, 'href="article"'));
});

test("official Hugging Face icon is self-contained and preserves its square viewBox", () => {
  const svg = read("../images/hugging-face.svg");
  assert.match(svg, /viewBox="0 0 256 256"/);
  assert.match(svg, /<path /);
  assert.doesNotMatch(svg, /<(?:script|foreignObject|image)\b|(?:href|src)=|\bon\w+=/i);
});
