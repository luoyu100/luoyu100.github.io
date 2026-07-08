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
  <img src="{{ '/images/graph-of-states.png' | relative_url }}" alt="Graph of States teaser figure" decoding="async">
  <figcaption>Graph of States turns abductive reasoning into a directed search over structured belief states, causal relations, and state transitions.</figcaption>
</figure>

## Abstract

Graph of States is a general-purpose neuro-symbolic framework for abductive reasoning with large language models. It grounds multi-agent collaboration in explicit belief states, uses a causal graph and state machine to constrain reasoning transitions, and converts open-ended exploration into a directed search over possible explanations. The framework is designed for complex tasks where agents must collect evidence, revise hypotheses, and identify the most plausible hidden cause behind observed symptoms.

## Project Overview

<div class="project-page-highlight-grid">
  <div class="project-page-highlight" markdown="1">
  <h3>Belief States</h3>
  <p>The reasoning process is represented as structured states, making collaboration more compact and traceable than long conversational histories.</p>
  </div>
  <div class="project-page-highlight" markdown="1">
  <h3>Causal Transitions</h3>
  <p>A causal graph and state machine constrain how hypotheses are expanded, refined, and rejected during abductive search.</p>
  </div>
  <div class="project-page-highlight" markdown="1">
  <h3>General Abduction</h3>
  <p>The design applies beyond microservice diagnosis, supporting broader abductive tasks where observed evidence must be explained by hidden causes.</p>
  </div>
</div>

## Method

<figure class="project-page-figure">
  <img src="{{ '/images/graph-of-states.png' | relative_url }}" alt="Graph of States method overview" decoding="async">
  <figcaption>The overview shows how central and expert agents update the graph-structured belief state through planning, investigation, and state conversion.</figcaption>
</figure>

## Citation

```bibtex
@inproceedings{luo2026graphstates,
  title={Graph of States: Solving Abductive Tasks with Large Language Models},
  author={Luo, Yu and Gao, Rongchen and Teng, Lu and Wen, Xidao and Jiang, Jiamin and Zhang, Qingliang and Sun, Yongqian and Zhang, Shenglin and Feng, Jiasong and Liu, Tong and Zhang, Wenjie and Pei, Dan},
  booktitle={Proceedings of the 43rd International Conference on Machine Learning},
  year={2026}
}
```

</div>
