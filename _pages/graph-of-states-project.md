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

Large language models have achieved strong results on many deductive reasoning tasks, but abductive reasoning remains difficult because the model must infer the most plausible hidden cause from incomplete observations. In tasks such as medical diagnosis and failure diagnosis in distributed systems, existing reasoning frameworks often fabricate evidence, drift across long contexts, fail to backtrack from wrong hypotheses, or stop too early with shallow explanations. Graph of States addresses this gap with a neuro-symbolic framework that represents the reasoning process as explicit belief states, combines a causal graph with a state machine, and coordinates central and expert agents to perform structured hypothesis refinement, evidence retrieval, backtracking, and drill-down search. Experiments show that this design improves both matching accuracy and relevant diagnosis quality while maintaining practical inference cost.

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
