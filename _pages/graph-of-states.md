---
permalink: /projects/graph-of-states/
title: "Graph of States | Yu Luo"
author_profile: true
---

<div class="project-story" markdown="1">
<a class="project-back-link" target="_self" href="{{ '/' | relative_url }}#-publications"><i class="fas fa-arrow-left" aria-hidden="true"></i> Back to publications</a>

<p class="project-kicker">ICML 2026 / Abductive Reasoning / Multi-agent Systems</p>

<h1 class="project-title">Graph of States</h1>

<p class="project-subtitle">Solving Abductive Tasks with Large Language Models</p>

<p class="project-byline"><strong>Yu Luo</strong>, Rongchen Gao, Lu Teng, et al.</p>

<div class="project-links">
  <a class="project-link" href="https://arxiv.org/abs/2603.21250"><i class="fas fa-file-alt" aria-hidden="true"></i> Read the paper <i class="fas fa-external-link-alt" aria-hidden="true"></i></a>
</div>

<figure class="project-figure">
  <img src="{{ '/images/graph-of-states.png' | relative_url }}" alt="Overview of the Graph of States framework for abductive reasoning" decoding="async">
  <figcaption>Graph of States structures collaborative reasoning through belief states, causal relations, and constrained transitions.</figcaption>
</figure>

## Why this work?

Abductive reasoning requires a system to work backward from incomplete observations toward plausible explanations. Large language models can generate possibilities quickly, but without a structured state representation their exploration can become inconsistent, redundant, or difficult to verify.

<p class="project-question">Can multi-agent reasoning search for explanations through explicit belief states, rather than relying on unconstrained conversational exploration?</p>

## The idea

Graph of States provides a neuro-symbolic framework in which agents collaborate over structured belief states. A causal graph captures relevant relationships, while a state machine constrains how reasoning can progress. Together, these components turn open-ended hypothesis generation into a more directed search process for complex abductive tasks.

## What I learned

This work strengthened my interest in agent systems whose reasoning process is represented explicitly. For difficult inference tasks, structure is not merely a guardrail: it can be the mechanism that makes collaboration more efficient, interpretable, and easier to improve.

</div>
