---
permalink: /projects/trioxpert/
title: "TrioXpert | Yu Luo"
author_profile: true
---

<div class="project-story" markdown="1">
<a class="project-back-link" target="_self" href="{{ '/' | relative_url }}#-publications"><i class="fas fa-arrow-left" aria-hidden="true"></i> Back to publications</a>

<p class="project-kicker">ASE 2025 / Incident Management / Microservice Systems</p>

<h1 class="project-title">TrioXpert</h1>

<p class="project-subtitle">An Automated Incident Management Framework for Microservice System</p>

<p class="project-byline">Yongqian Sun, <strong>Yu Luo</strong>, Xidao Wen*, Yuan Yuan, et al.</p>

<div class="project-links">
  <a class="project-link" href="https://nkcs.iops.ai/wp-content/uploads/2025/10/TrioXpert1.pdf"><i class="fas fa-file-alt" aria-hidden="true"></i> Read the paper <i class="fas fa-external-link-alt" aria-hidden="true"></i></a>
</div>

<figure class="project-figure">
  <img src="{{ '/images/trioxpert.jpg' | relative_url }}" alt="Overview of the TrioXpert incident management framework" decoding="async">
  <figcaption>TrioXpert supports automated incident management through multimodal evidence and collaborative LLM-based reasoning.</figcaption>
</figure>

## Why this work?

Microservice incidents require more than detecting that something has gone wrong. Engineers must identify failures, trace them to likely causes, and reason across multiple forms of operational evidence under time pressure. Handling those tasks separately leaves substantial effort in connecting their outputs into a useful diagnosis.

<p class="project-question">Can an automated framework connect anomaly detection, failure triage, and root cause localization through interpretable collaborative reasoning?</p>

## The idea

TrioXpert is designed as an end-to-end incident management framework for microservice systems. It integrates multimodal operational data with LLM-based collaborative reasoning to address anomaly detection, failure triage, and root cause localization in a unified process, while keeping its diagnostic decisions interpretable.

## What I learned

This project highlighted the importance of joining operational tasks into a coherent diagnostic workflow. A useful incident management system must do more than score well on individual tasks: it should help engineers understand how evidence travels from a symptom to an actionable explanation.

</div>
