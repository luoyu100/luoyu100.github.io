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

## Story
TrioXpert was my first real research project. I started it during my senior year, at a time when I was just beginning to search for a direction that felt both technically interesting and personally worth pursuing. Large language models were already becoming impossible to ignore, so my first instinct was simple and a little naive: if LLMs can reason over text, perhaps they can help with root cause analysis in microservice systems.

The first attempts were not elegant. Incident management data is messy in a very practical way: metrics are time series, logs are semi-structured text, traces describe request paths and spans, and all of them can be huge. Feeding everything directly into an LLM was not really a solution. It was more like dropping a whole machine room onto a desk and asking the model to "please understand this." The idea was exciting, but the data refused to cooperate.

A senior student Binpeng Shi later suggested that I look carefully at ART, which was an important turning point for me. ART was interesting because it treated incident management as an end-to-end problem: metrics, logs, and traces were fused together to support *anomaly detection, failure triage, and root cause localization*. While studying its preprocessing pipeline, I noticed something that changed how I thought about the task. Logs and traces are not just auxiliary signals next to metrics; they contain a large amount of natural textual evidence. They are operational records, but they also carry descriptions, names, events, requests, and error messages. In other words, part of the system was already speaking in a language that LLMs could understand.

That observation led to the main design of TrioXpert. Instead of forcing all modalities into one uniform representation, we split multimodal fusion into two channels. Metrics were handled as numerical time-series evidence, while logs and traces were extracted from a textual perspective. This sounds simple in hindsight, but it was the first moment when the project started to feel less like "use an LLM for RCA" and more like a real system design: each modality should be processed according to what it naturally expresses.

The next problem appeared immediately. Logs and traces contain useful clues, but they also contain a tremendous amount of routine information. Most messages describe normal behavior; only a small fraction actually points toward the failure. If these redundant details are passed into the reasoning stage, they dilute the signal and make the diagnosis harder rather than easier. This is why we introduced two filtering mechanisms for logs and traces. The goal was not to make the pipeline look more complicated, but to preserve the pieces of evidence that could actually guide the diagnosis.

After that, the final form of TrioXpert became clearer: use specialized LLM-based experts to fuse the two channels of evidence and complete the downstream incident management tasks. The system was not designed only to squeeze out a small performance improvement. What mattered more to us was interpretability. Traditional deep learning systems often return a label or a ranked component, but they rarely explain how the evidence leads to that answer. With TrioXpert, we wanted the intermediate reasoning process to be visible, so an operations engineer could inspect not only the final diagnosis, but also the path that produced it.

Looking back, TrioXpert gave me my first concrete research lesson: a good agentic or LLM-based system does not begin with a model, but with a careful understanding of the information flow. **Before asking an LLM to reason, we have to decide what evidence it should see, what should be filtered away, and how different experts should collaborate**. This project later became an important starting point for my work on more explainable and collaborative agent systems.

<p class="project-question">I am especially grateful to <a href="https://scholar.google.com/citations?user=1aehrpYAAAAJ&hl=en">Dr. Xidao Wen</a>, who gave me generous support in both paper writing and experiments. His help filled many of the gaps I had as someone just beginning to do research, and made this first project much more mature.</p>

</div>
