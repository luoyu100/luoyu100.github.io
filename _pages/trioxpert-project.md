---
permalink: /projects/trioxpert/project/
title: "TrioXpert Project Page | Yu Luo"
layout: project
author_profile: false
---

<div class="research-project-page" markdown="1">

<a class="project-page-back" href="{{ '/' | relative_url }}#-publications"><i class="fas fa-arrow-left" aria-hidden="true"></i> Publications</a>

<header class="project-page-hero">
  <h1 class="project-page-title">TrioXpert: An Automated Incident Management Framework for Microservice System</h1>
  <p class="project-page-authors">
    Yongqian Sun<sup>1,7</sup>, <strong>Yu Luo</strong><sup>1</sup>, Xidao Wen<sup>4,*</sup>, Yuan Yuan<sup>6</sup>, Xiaohui Nie<sup>2</sup>, Shenglin Zhang<sup>1,5</sup>, Tong Liu<sup>3</sup>, Xi Luo<sup>3</sup>
  </p>
  <p class="project-page-affiliations">
    <sup>1</sup>Nankai University &nbsp; <sup>2</sup>Computer Network Information Center, Chinese Academy of Sciences &nbsp; <sup>3</sup>Lenovo (Tianjin) Co., Ltd. &nbsp; <sup>4</sup>BizSeer<br>
    <sup>5</sup>Key Laboratory of Data and Intelligent System Security, Ministry of Education, China &nbsp; <sup>6</sup>National University of Defense Technology &nbsp; <sup>7</sup>Tianjin Key Laboratory of Software Experience and Human Computer Interaction
  </p>
  <p class="project-page-venue">ASE 2025</p>
  <p class="project-page-note">* Corresponding author</p>
  <div class="project-page-links">
    <a class="project-page-link project-page-link--paper" href="https://nkcs.iops.ai/wp-content/uploads/2025/10/TrioXpert1.pdf" target="_blank" rel="noopener"><i class="fas fa-file-alt" aria-hidden="true"></i> Paper</a>
    <a class="project-page-link project-page-link--code" href="https://github.com/luoyu100/TrioXpert" target="_blank" rel="noopener"><i class="fas fa-code" aria-hidden="true"></i> Code</a>
    <a class="project-page-link project-page-link--slide" href="{{ '/assets/slides/industry-31-slides.pdf' | relative_url }}" target="_blank" rel="noopener"><i class="fas fa-file-powerpoint" aria-hidden="true"></i> Slide</a>
    <a class="project-page-link project-page-link--story" href="{{ '/projects/trioxpert/' | relative_url }}"><i class="fas fa-book-open" aria-hidden="true"></i> Story</a>
  </div>
</header>

<figure class="project-page-teaser">
  <img src="{{ '/images/trioxpert.jpg' | relative_url }}" alt="TrioXpert teaser figure" decoding="async">
  <figcaption>TrioXpert integrates multimodal observability data with collaborative LLM-based experts for automated incident management.</figcaption>
</figure>

## Abstract

TrioXpert is an end-to-end incident management framework for microservice systems. It jointly considers anomaly detection, failure triage, and root cause localization, and combines multimodal observability signals with LLM-based collaborative reasoning. Instead of treating metrics, logs, and traces as a single undifferentiated input stream, TrioXpert extracts structured evidence from each modality and lets specialized experts reason over the evidence in an interpretable workflow.

## Project Overview

<div class="project-page-highlight-grid">
  <div class="project-page-highlight" markdown="1">
  <h3>Multimodal Evidence</h3>
  <p>Metrics, logs, and traces are processed according to their own data characteristics, turning raw observability streams into evidence that can support diagnosis.</p>
  </div>
  <div class="project-page-highlight" markdown="1">
  <h3>Collaborative Experts</h3>
  <p>LLM-based experts cooperate across incident management tasks, making the diagnosis process more transparent than a single black-box prediction.</p>
  </div>
  <div class="project-page-highlight" markdown="1">
  <h3>End-to-End Management</h3>
  <p>The framework covers anomaly detection, failure triage, and root cause localization in a unified workflow for microservice incidents.</p>
  </div>
</div>

## Method

<figure class="project-page-figure">
  <img src="{{ '/images/trioxpert.jpg' | relative_url }}" alt="TrioXpert method overview" decoding="async">
  <figcaption>The method overview highlights how evidence from multiple modalities flows into collaborative incident management experts.</figcaption>
</figure>

## Citation

```bibtex
@inproceedings{sun2025trioxpert,
  title={TrioXpert: An Automated Incident Management Framework for Microservice System},
  author={Sun, Yongqian and Luo, Yu and Wen, Xidao and Yuan, Yuan and Nie, Xiaohui and Zhang, Shenglin and Liu, Tong and Luo, Xi},
  booktitle={Proceedings of the 40th IEEE/ACM International Conference on Automated Software Engineering},
  year={2025}
}
```

</div>
