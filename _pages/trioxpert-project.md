---
permalink: /projects/trioxpert/project/
title: "TrioXpert Project Page | Yu Luo"
layout: project
author_profile: false
project_theme: trioxpert
project_navigation:
  - label: Overview
    href: "#overview"
  - label: Method
    href: "#method"
  - label: Results
    href: "#results"
  - label: Insights
    href: "#insights"
  - label: BibTeX
    href: "#bibtex"
---

<div class="research-project-page project-theme--trioxpert" markdown="1">

<header class="project-page-hero">
  <p class="project-page-eyebrow">ASE 2025 <span aria-hidden="true">/</span> Multimodal AIOps</p>
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
  <img src="{{ '/images/projects/trioxpert-teaser.png' | relative_url }}" alt="TrioXpert incident management lifecycle" decoding="async">
  <figcaption>TrioXpert targets the automated stages of incident management: anomaly detection, failure triage, and root cause localization.</figcaption>
</figure>

<section class="project-content-section project-content-section--foundation" id="overview">
  <div class="project-section-shell" markdown="1">
    <div class="project-section-heading">
      <p class="project-section-index">01 <span>THE PAPER</span></p>
      <h2>Abstract</h2>
    </div>
    <p class="project-abstract">Automated incident management plays a pivotal role in large-scale microservice systems. However, many existing methods rely solely on single-modal data (e.g., metrics, logs, and traces) and struggle to simultaneously address multiple downstream tasks, including anomaly detection (AD), failure triage (FT), and root cause localization (RCL). Moreover, the lack of clear reasoning evidence in current techniques often leads to insufficient interpretability. To address these limitations, we propose TrioXpert, an end-to-end incident management framework capable of fully leveraging multimodal data. TrioXpert designs three independent data processing pipelines based on the inherent characteristics of different modalities, comprehensively characterizing the operational status of microservice systems from both numerical and textual dimensions. It employs a collaborative reasoning mechanism using large language models (LLMs) to simultaneously handle multiple tasks while providing clear reasoning evidence to ensure strong interpretability. We conducted extensive evaluations on two microservice system datasets, and the experimental results demonstrate that TrioXpert achieves outstanding performance in AD (improving by 4.7% to 57.7%), FT (improving by 2.1% to 40.6%), and RCL (improving by 1.6% to 163.1%) tasks. TrioXpert has also been deployed in Lenovo's production environment, demonstrating substantial gains in diagnostic efficiency and accuracy.</p>

    <h3 class="project-subsection-title">Project Overview</h3>
    <div class="project-page-highlight-grid project-page-highlight-grid--three">
      <div class="project-page-highlight" markdown="1">
      <h3>Multimodal Evidence</h3>
      <p>TrioXpert treats metrics, logs, and traces according to their own data characteristics, using numerical and textual views to describe the system state more completely.</p>
      </div>
      <div class="project-page-highlight" markdown="1">
      <h3>Multi-Task Management</h3>
      <p>The framework covers anomaly detection, failure triage, and root cause localization in one end-to-end incident management workflow.</p>
      </div>
      <div class="project-page-highlight" markdown="1">
      <h3>Interpretable Reasoning</h3>
      <p>LLM-based experts cooperate over structured evidence, producing reasoning traces that help OCEs inspect why a diagnosis was made.</p>
      </div>
    </div>
  </div>
</section>

<section class="project-content-section project-content-section--takeaways" id="takeaways">
  <div class="project-section-shell" markdown="1">
    <div class="project-section-heading">
      <p class="project-section-index">02 <span>DESIGN LESSONS</span></p>
      <h2>Key Takeaways</h2>
    </div>
    <div class="project-takeaway-grid">
      <article class="project-takeaway-card">
        <p class="project-takeaway-label">Takeaway 1</p>
        <h3>Every modality matters, but not every record helps.</h3>
        <p>Metrics, logs, and traces reflect distinct aspects of system behavior, and all of them carry valuable diagnostic signals. The key difficulty is that logs and traces are often dominated by redundant entries, so useful textual evidence must be filtered before reasoning.</p>
      </article>
      <article class="project-takeaway-card">
        <p class="project-takeaway-label">Takeaway 2</p>
        <h3>A single LLM is not enough for reliable incident management.</h3>
        <p>Directly feeding complex multimodal incident data into one monolithic LLM can produce fluent but unreliable reports, with hallucinated steps, opaque reasoning, and context-window loss. TrioXpert therefore uses collaborative experts and structured prompts to make reasoning more stable and interpretable.</p>
      </article>
    </div>
  </div>
</section>

<section class="project-content-section project-content-section--method" id="method">
  <div class="project-section-shell" markdown="1">
    <div class="project-section-heading">
      <p class="project-section-index">03 <span>THE FRAMEWORK</span></p>
      <h2>Method</h2>
    </div>
    <figure class="project-page-figure">
      <img src="{{ '/images/trioxpert.jpg' | relative_url }}" alt="TrioXpert method overview" decoding="async">
      <figcaption>The method overview highlights how evidence from multiple modalities flows into collaborative incident management experts.</figcaption>
    </figure>
  </div>
</section>

<section class="project-content-section project-content-section--results project-results-section" id="results">
  <div class="project-section-shell" markdown="1">
    <div class="project-section-heading">
      <p class="project-section-index">04 <span>EVALUATION</span></p>
      <h2>Experimental Results</h2>
    </div>
    <div id="trioxpert-results-carousel" class="results-carousel" data-project-carousel>
      <button class="project-carousel-button project-carousel-button--prev" type="button" data-carousel-prev aria-label="Previous experiment result">
        <i class="fas fa-chevron-left" aria-hidden="true"></i>
      </button>
      <div class="project-carousel-track">
        <div class="item is-active" data-carousel-item>
          <div class="image-container">
            <img src="{{ '/images/projects/trioxpert-table1-datasets.png' | relative_url }}" alt="Table 1: Detailed information of datasets" loading="lazy" decoding="async">
          </div>
          <h2 class="subtitle">
            <strong>Datasets:</strong> TrioXpert is evaluated on two microservice-system datasets containing multimodal traces, logs, and metrics across multiple failure types.
          </h2>
        </div>
        <div class="item" data-carousel-item>
          <div class="image-container">
            <img src="{{ '/images/projects/trioxpert-table2-performance.png' | relative_url }}" alt="Table 2: Performance comparison on AD, FT, RCL, and time" loading="lazy" decoding="async">
          </div>
          <h2 class="subtitle">
            <strong>Overall Performance:</strong> TrioXpert consistently improves AD, FT, and RCL performance over multimodal and task-specific baselines on both datasets.
          </h2>
        </div>
        <div class="item" data-carousel-item>
          <div class="image-container">
            <img src="{{ '/images/projects/trioxpert-table3-ablation.png' | relative_url }}" alt="Table 3: Ablation study" loading="lazy" decoding="async">
          </div>
          <h2 class="subtitle">
            <strong>Ablation Study:</strong> Removing modality coverage, collaborative reasoning, coordination, or hallucination mitigation weakens performance, confirming the need for the full design.
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
      </div>
    </div>
  </div>
</section>

<section class="project-content-section project-content-section--insights project-insights-section" id="insights" markdown="1">
  <div class="project-section-shell" markdown="1">
    <div class="project-section-heading">
      <p class="project-section-index">05 <span>WHAT WE LEARNED</span></p>
      <h2>Key Insights</h2>
    </div>
    <div class="project-insight-panel" markdown="1">
    <p>TrioXpert shows that multimodal fusion in AIOps cannot treat all observability data as the same kind of signal. Metrics should be understood through their temporal and statistical behavior, while logs and traces should be used for their rich semantic evidence. The important move is not simply to put more data into a model, but to preserve the diagnostic value that each modality naturally carries.</p>
    <p>The paper also provides an early demonstration that multi-agent collaboration can be effective for AIOps root cause analysis. By separating numerical and textual expertise, coordinating expert outputs, and forcing evidence-backed reasoning, TrioXpert improves interpretability as well as task performance. This became a useful starting point for later work on more structured and reliable agentic diagnosis.</p>
    </div>
  </div>
</section>

<section class="project-content-section project-content-section--bibtex project-bibtex-section" id="bibtex">
  <div class="project-section-shell">
    <div class="bibtex-header">
      <div class="project-section-heading">
        <p class="project-section-index">06 <span>CITE THIS WORK</span></p>
        <h2>BibTeX</h2>
      </div>
      <button class="copy-bibtex-btn" type="button" title="Copy BibTeX to clipboard" aria-label="Copy BibTeX">
        <i class="fas fa-copy" aria-hidden="true"></i>
        <span class="copy-text">Copy</span>
      </button>
    </div>
    <pre id="bibtex-code"><code>@inproceedings{sun2025trioxpert,
  title={TrioXpert: An Automated Incident Management Framework for Microservice System},
  author={Sun, Yongqian and Luo, Yu and Wen, Xidao and Yuan, Yuan and Nie, Xiaohui and Zhang, Shenglin and Liu, Tong and Luo, Xi},
  booktitle={2025 40th IEEE/ACM International Conference on Automated Software Engineering (ASE)},
  pages={3239--3250},
  year={2025},
  organization={IEEE}
}</code></pre>
  </div>
</section>
</div>
