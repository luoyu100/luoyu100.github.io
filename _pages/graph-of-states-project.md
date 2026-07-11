---
permalink: /projects/graph-of-states/project/
title: "Graph of States Project Page | Yu Luo"
layout: project
author_profile: false
---

<div class="research-project-page" markdown="1">

<a class="project-page-back" href="{{ '/' | relative_url }}#-publications"><i class="fas fa-arrow-left" aria-hidden="true"></i> Publications</a>

<header class="project-page-hero">
  <h1 class="project-page-title">Graph of States: Solving Abductive Tasks with Large Language Models</h1>
  <p class="project-page-authors">
    <strong>Yu Luo</strong><sup>1</sup>, Rongchen Gao<sup>1</sup>, Lu Teng<sup>2</sup>, Xidao Wen<sup>3</sup>, Jiamin Jiang<sup>1</sup>, Qingliang Zhang<sup>1</sup>, Yongqian Sun<sup>1,*</sup>, Shenglin Zhang<sup>1</sup>, Jiasong Feng<sup>4</sup>, Tong Liu<sup>4</sup>, Wenjie Zhang<sup>4</sup>, Dan Pei<sup>5</sup>
  </p>
  <p class="project-page-affiliations">
    <sup>1</sup>Nankai University &nbsp; <sup>2</sup>Wenzhou Medical University &nbsp; <sup>3</sup>Alibaba Cloud &nbsp; <sup>4</sup>Lenovo &nbsp; <sup>5</sup>Tsinghua University
  </p>
  <p class="project-page-venue">ICML 2026</p>
  <p class="project-page-venue-detail">43rd International Conference on Machine Learning, Seoul, South Korea</p>
  <p class="project-page-note">* Corresponding author</p>
  <div class="project-page-links">
    <a class="project-page-link project-page-link--paper" href="https://arxiv.org/abs/2603.21250" target="_blank" rel="noopener"><i class="fas fa-file-alt" aria-hidden="true"></i> Paper</a>
    <a class="project-page-link project-page-link--code" href="https://github.com/gaorch85/Graph-of-States" target="_blank" rel="noopener"><i class="fas fa-code" aria-hidden="true"></i> Code</a>
    <a class="project-page-link project-page-link--press" href="https://mp.weixin.qq.com/s/ZC_-zurf8iV6Kbp39AHgBg" target="_blank" rel="noopener"><i class="fas fa-paper-plane" aria-hidden="true"></i> 机器之心</a>
    <a class="project-page-link project-page-link--slide" href="{{ '/assets/slides/GoS-presentation.pdf' | relative_url }}" target="_blank" rel="noopener"><i class="fas fa-file-powerpoint" aria-hidden="true"></i> Slide</a>
    <a class="project-page-link project-page-link--story" href="{{ '/projects/graph-of-states/' | relative_url }}"><i class="fas fa-book-open" aria-hidden="true"></i> Story</a>
  </div>
</header>

<figure class="project-page-teaser">
  <img src="{{ '/images/projects/gos-teaser.png' | relative_url }}" alt="Reasoning deficiencies in abductive tasks" decoding="async">
  <figcaption>Deductive reasoning frameworks can solve static logic problems, but abductive tasks expose evidence fabrication, context drift, failed backtracking, and early stopping.</figcaption>
</figure>

## Abstract

Logical reasoning encompasses deduction, induction, and abduction. However, while Large Language Models (LLMs) have effectively mastered the former two, abductive reasoning remains significantly underexplored. Existing frameworks, predominantly designed for static deductive tasks, fail to generalize to abductive reasoning due to unstructured state representation and lack of explicit state control. Consequently, they are inevitably prone to Evidence Fabrication, Context Drift, Failed Backtracking, and Early Stopping. To bridge this gap, we introduce Graph of States (GoS), a general-purpose neuro-symbolic framework tailored for abductive tasks. GoS grounds multi-agent collaboration in a structured belief states, utilizing a causal graph to explicitly encode logical dependencies and a state machine to govern the valid transitions of the reasoning process. By dynamically aligning the reasoning focus with these symbolic constraints, our approach transforms aimless, unconstrained exploration into a convergent, directed search. Extensive evaluations on two real-world datasets demonstrate that GoS significantly outperforms all baselines, providing a robust solution for complex abductive tasks. Code repo and all prompts: [gaorch85/Graph-of-States](https://github.com/gaorch85/Graph-of-States).

## Project Overview

<div class="project-page-highlight-grid">
  <div class="project-page-highlight" markdown="1">
  <h3>Abductive Reasoning</h3>
  <p>GoS focuses on diagnosis-style tasks where agents must explain observed symptoms by searching for hidden causes, rather than simply deriving answers from complete premises.</p>
  </div>
  <div class="project-page-highlight" markdown="1">
  <h3>Failure Modes</h3>
  <p>The paper identifies four recurring deficiencies in LLM reasoning frameworks: evidence fabrication, context drift, failed backtracking, and early stopping.</p>
  </div>
  <div class="project-page-highlight" markdown="1">
  <h3>Structured Belief State</h3>
  <p>GoS keeps hypotheses, confidence, supporting evidence, and causal relations in an explicit graph, giving agents a shared state instead of an unstructured conversation history.</p>
  </div>
  <div class="project-page-highlight" markdown="1">
  <h3>State-Guided Search</h3>
  <p>A state machine controls backtracking, drill-down, and report generation, so agents can revise shallow explanations and investigate more concrete root causes.</p>
  </div>
</div>

## Method

<figure class="project-page-figure">
  <img src="{{ '/images/graph-of-states.png' | relative_url }}" alt="Graph of States method overview" decoding="async">
  <figcaption>The overview shows how central and expert agents update the graph-structured belief state through planning, investigation, and state conversion.</figcaption>
</figure>

<section class="project-results-section">
  <h2>Experimental Results</h2>
  <div id="results-carousel" class="results-carousel" data-project-carousel>
    <button class="project-carousel-button project-carousel-button--prev" type="button" data-carousel-prev aria-label="Previous experiment result">
      <i class="fas fa-chevron-left" aria-hidden="true"></i>
    </button>
    <div class="project-carousel-track">
      <div class="item is-active" data-carousel-item>
        <div class="image-container">
          <img src="{{ '/images/projects/gos-table1-medical-diagnosis.png' | relative_url }}" alt="Table 1: Performance of medical diagnosis" loading="lazy" decoding="async">
        </div>
        <h2 class="subtitle">
          <strong>Medical Diagnosis Results:</strong> GoS achieves the best Match and Relevant scores under both LLM-as-a-Judge and Human-as-a-Judge evaluation.
        </h2>
      </div>
      <div class="item" data-carousel-item>
        <div class="image-container">
          <img src="{{ '/images/projects/gos-table2-ablation.png' | relative_url }}" alt="Table 2: Ablation study of medical diagnosis" loading="lazy" decoding="async">
        </div>
        <h2 class="subtitle">
          <strong>Ablation Study:</strong> Removing reasoning focus, structured state management, the causal graph, or the state machine weakens GoS on medical diagnosis.
        </h2>
      </div>
      <div class="item" data-carousel-item>
        <div class="image-container">
          <img src="{{ '/images/projects/gos-figure5-sensitivity.png' | relative_url }}" alt="Figure 5: Sensitivity analysis" loading="lazy" decoding="async">
        </div>
        <h2 class="subtitle">
          <strong>Sensitivity Analysis:</strong> GoS remains consistently stronger than the best baseline across interaction, retrieval, evidence, and confidence settings.
        </h2>
      </div>
      <div class="item" data-carousel-item>
        <div class="image-container">
          <img src="{{ '/images/projects/gos-table3-failure-diagnosis.png' | relative_url }}" alt="Table 3: Performance of failure diagnosis in distributed systems" loading="lazy" decoding="async">
        </div>
        <h2 class="subtitle">
          <strong>Distributed-System Diagnosis:</strong> GoS substantially improves Match and Relevant scores for failure diagnosis in distributed systems.
        </h2>
      </div>
      <div class="item" data-carousel-item>
        <div class="image-container">
          <img src="{{ '/images/projects/gos-figure6-failure-example.png' | relative_url }}" alt="Figure 6: Example of failure diagnosis in distributed systems" loading="lazy" decoding="async">
        </div>
        <h2 class="subtitle">
          <strong>Case Study:</strong> A failure diagnosis example shows how GoS updates hypotheses, drills down through evidence, and reports a concrete root cause.
        </h2>
      </div>
    </div>
    <button class="project-carousel-button project-carousel-button--next" type="button" data-carousel-next aria-label="Next experiment result">
      <i class="fas fa-chevron-right" aria-hidden="true"></i>
    </button>
    <div class="slider-pagination" aria-label="Experiment result pagination">
      <button class="slider-page is-active" type="button" data-carousel-dot="0" aria-label="Show experiment result 1"></button>
      <button class="slider-page" type="button" data-carousel-dot="1" aria-label="Show experiment result 2"></button>
      <button class="slider-page" type="button" data-carousel-dot="2" aria-label="Show experiment result 3"></button>
      <button class="slider-page" type="button" data-carousel-dot="3" aria-label="Show experiment result 4"></button>
      <button class="slider-page" type="button" data-carousel-dot="4" aria-label="Show experiment result 5"></button>
    </div>
  </div>
</section>

<section class="project-deploy-section" markdown="1">
  <h2>Possible Deployable Area</h2>
  <p class="project-deploy-intro">GoS is designed for long-horizon reasoning tasks where the goal is not to produce a one-shot answer, but to make multiple hypotheses converge through iterative interaction with the environment and accumulating evidence.</p>

  <ol class="project-deploy-list">
    <li>
      <strong>Medical diagnosis:</strong> A diagnostic agent can maintain competing disease hypotheses, request new tests or observations, and gradually refine the belief state until the evidence supports a reliable diagnosis.
    </li>
    <li>
      <strong>Failure diagnosis:</strong> In complex software or distributed systems, GoS can organize possible root-cause hypotheses, drill down into logs, metrics, and traces, and backtrack when a shallow explanation is contradicted.
    </li>
    <li>
      <strong>Criminal investigation:</strong> Investigators often reason over incomplete clues, suspects, timelines, and motives. GoS provides a structured way to update hypotheses as new evidence appears and to avoid premature closure.
    </li>
    <li>
      <strong>Scientific discovery:</strong> Scientific reasoning repeatedly proposes hypotheses, designs observations or experiments, and revises explanations. GoS can support this process by keeping hypotheses, evidence, and causal relations explicit.
    </li>
  </ol>

  <p class="project-deploy-summary">These domains share the same reasoning pattern: multiple plausible hypotheses, evidence-seeking interaction, controlled state transitions, and final convergence toward the most defensible explanation.</p>
</section>

<section class="project-bibtex-section" id="BibTeX">
  <div class="bibtex-header">
    <h2>BibTeX</h2>
    <button class="copy-bibtex-btn" type="button" title="Copy BibTeX to clipboard" aria-label="Copy BibTeX">
      <i class="fas fa-copy" aria-hidden="true"></i>
      <span class="copy-text">Copy</span>
    </button>
  </div>
  <pre id="bibtex-code"><code>@article{luo2026graph,
  title={Graph of States: Solving Abductive Tasks with Large Language Models},
  author={Luo, Yu and Gao, Rongchen and Teng, Lu and Wen, Xidao and Jiang, Jiamin and Zhang, Qingliang and Sun, Yongqian and Zhang, Shenglin and Feng, Jiasong and Liu, Tong and others},
  journal={arXiv preprint arXiv:2603.21250},
  year={2026}
}</code></pre>
</section>
</div>
