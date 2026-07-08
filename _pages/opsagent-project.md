---
permalink: /projects/opsagent/project/
title: "OpsAgent Project Page | Yu Luo"
layout: project
author_profile: false
---

<div class="research-project-page" markdown="1">

<a class="project-page-back" href="{{ '/' | relative_url }}#-publications"><i class="fas fa-arrow-left" aria-hidden="true"></i> Publications</a>

<header class="project-page-hero">
  <h1 class="project-page-title">OpsAgent: An Evolving Multi-agent System for Incident Management in Microservices</h1>
  <p class="project-page-authors">
    <strong>Yu Luo</strong><sup>1</sup>, Jiamin Jiang<sup>1</sup>, Jingfei Feng<sup>1</sup>, Lei Tao<sup>1</sup>, Qingliang Zhang<sup>1</sup>, Xidao Wen<sup>2</sup>, Yongqian Sun<sup>1,*</sup>, Shenglin Zhang<sup>1</sup>, Tong Liu<sup>3</sup>, Wenjie Zhang<sup>3</sup>, Dan Pei<sup>4</sup>
  </p>
  <p class="project-page-affiliations">
    <sup>1</sup>Nankai University &nbsp; <sup>2</sup>Alibaba Cloud &nbsp; <sup>3</sup>Lenovo &nbsp; <sup>4</sup>Tsinghua University
  </p>
  <p class="project-page-venue">ASE 2026</p>
  <p class="project-page-venue-detail">41st IEEE/ACM International Conference on Automated Software Engineering, Munich, Germany</p>
  <p class="project-page-note">* Corresponding author</p>
  <div class="project-page-links">
    <a class="project-page-link project-page-link--paper" href="https://arxiv.org/abs/2510.24145" target="_blank" rel="noopener"><i class="fas fa-file-alt" aria-hidden="true"></i> Paper</a>
    <a class="project-page-link project-page-link--code" href="https://anonymous.4open.science/r/OpsAgent-CCC0" target="_blank" rel="noopener"><i class="fas fa-code" aria-hidden="true"></i> Code</a>
    <a class="project-page-link project-page-link--story" href="{{ '/projects/opsagent/' | relative_url }}"><i class="fas fa-book-open" aria-hidden="true"></i> Story</a>
  </div>
</header>

<figure class="project-page-teaser">
  <img src="{{ '/images/opsagent.png' | relative_url }}?v=20260528" alt="OpsAgent teaser figure" decoding="async">
  <figcaption>OpsAgent refines heterogeneous observability data into textual evidence and coordinates specialized agents for transparent incident diagnosis.</figcaption>
</figure>

## Abstract

OpsAgent is a lightweight and self-evolving multi-agent system for incident management in microservices. It converts metrics, logs, and traces into structured textual evidence, coordinates specialized agents for anomaly detection, failure triage, and root cause localization, and improves through model refinement and accumulated operational experience. The system is designed to make incident diagnosis more auditable, transferable, and adaptive to real operational environments.

## Project Overview

<div class="project-page-highlight-grid">
  <div class="project-page-highlight" markdown="1">
  <h3>Training-Free Evidence</h3>
  <p>Heterogeneous observability data is distilled into compact textual evidence, making it easier for LLM agents to reason over operational signals.</p>
  </div>
  <div class="project-page-highlight" markdown="1">
  <h3>Multi-Agent Diagnosis</h3>
  <p>An orchestrator coordinates task-specific agents so diagnosis becomes a structured collaboration rather than an unconstrained conversation.</p>
  </div>
  <div class="project-page-highlight" markdown="1">
  <h3>Self-Evolution</h3>
  <p>The system combines refinement and accumulated operational experience, allowing the diagnostic workflow to improve from past incidents.</p>
  </div>
</div>

## Method

<figure class="project-page-figure">
  <img src="{{ '/images/opsagent.png' | relative_url }}?v=20260528" alt="OpsAgent method overview" decoding="async">
  <figcaption>The overview shows how processed evidence, coordinated agents, cross-review, and self-evolution form the OpsAgent workflow.</figcaption>
</figure>

## Citation

```bibtex
@inproceedings{luo2026opsagent,
  title={OpsAgent: An Evolving Multi-agent System for Incident Management in Microservices},
  author={Luo, Yu and Jiang, Jiamin and Feng, Jingfei and Tao, Lei and Zhang, Qingliang and Wen, Xidao and Sun, Yongqian and Zhang, Shenglin and Liu, Tong and Zhang, Wenjie and Pei, Dan},
  booktitle={Companion Proceedings of the 41st IEEE/ACM International Conference on Automated Software Engineering},
  year={2026}
}
```

</div>
