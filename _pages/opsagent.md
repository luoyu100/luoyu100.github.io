---
permalink: /projects/opsagent/
title: "OpsAgent | Yu Luo"
author_profile: true
---

<div class="project-story" markdown="1">
<a class="project-back-link" target="_self" href="{{ '/' | relative_url }}#-publications"><i class="fas fa-arrow-left" aria-hidden="true"></i> Back to publications</a>

<p class="project-kicker">arXiv 2025 / Incident Management / Multi-agent Systems</p>

<h1 class="project-title">OpsAgent</h1>

<p class="project-subtitle">An Evolving Multi-agent System for Incident Management in Microservices</p>

<p class="project-byline"><strong>Yu Luo</strong>, Jiamin Jiang, Jingfei Feng, et al.</p>

<div class="project-links">
  <a class="project-link" href="https://arxiv.org/abs/2510.24145"><i class="fas fa-file-alt" aria-hidden="true"></i> Read the paper <i class="fas fa-external-link-alt" aria-hidden="true"></i></a>
</div>

<figure class="project-figure">
  <img src="{{ '/images/opsagent.png' | relative_url }}" alt="Overview of the OpsAgent framework for incident management" decoding="async">
  <figcaption>OpsAgent coordinates specialized agents for diagnosis while incorporating refinement and operational experience.</figcaption>
</figure>

## Why this work?

Incidents in microservice systems rarely arrive with a single clear cause. Engineers need to connect partial evidence from metrics, logs, and traces, reason about possible failures, and still produce a diagnosis that others can inspect and trust. This makes incident management a natural setting for collaborative agents: the central challenge is not only finding an answer, but organizing evidence and reasoning responsibly.

<p class="project-question">Can a multi-agent system turn fragmented observability data into transparent diagnostic evidence, while continuing to improve from operational experience?</p>

## The idea

OpsAgent begins by transforming heterogeneous observability signals into structured textual evidence. Specialized agents then collaborate on incident diagnosis, allowing their reasoning roles to remain explicit instead of collapsing every step into a single opaque response. Its self-evolution mechanism combines model refinement with accumulated operational experience, so improvements can be grounded in what happened during real diagnostic tasks.

## What I learned

This project shaped how I think about dependable agents for operational settings. Capability alone is not enough: an agent system should make its evidence legible, expose how individual roles contribute to a conclusion, and learn without losing the structure that lets engineers review its decisions.

</div>
