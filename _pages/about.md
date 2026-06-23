---
permalink: /
title: ""
excerpt: ""
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---
 
{% if site.google_scholar_stats_use_cdn %}
{% assign gsDataBaseUrl = "https://cdn.jsdelivr.net/gh/" | append: site.repository | append: "@" %}
{% else %}
{% assign gsDataBaseUrl = "https://raw.githubusercontent.com/" | append: site.repository | append: "/" %}
{% endif %}
{% assign url = gsDataBaseUrl | append: "google-scholar-stats/gs_data_shieldsio.json" %}

<span class='anchor' id='about-me'></span>

Yu Luo is currently a 1st-year Ph.D. student at Nankai University, working under the supervision of Prof. [Yongqian Sun](https://nkcs.iops.ai/yongqiansun/) and Prof. [Shenglin Zhang](https://nkcs.iops.ai/shenglinzhang/). He received his Bachelor's degree in Software Engineering from Nankai University in 2025. His research interests include **AIOps, multi-agent systems, and reinforcement learning**, with a specific focus on **building collaborative multi-agent systems that leverage LLM reasoning, memory, RAG, and RL to solve complex downstream tasks**. He has published 5 high-quality papers at CCF A/B conferences.

---

My recent research interests lie in:
(i) Building self-evolving agents via parametric approaches; (💡 *Agentic tool-use, self-evolution*)
(ii) Tackling belief state challenges in long-horizon and multi-turn agent interactions, with a particular focus on active reasoning tasks. (💡 *Active Reasoning*)


# 🔥 News
- *2026.05*: &nbsp;🏅 I received **Gold Reviewer** Award from ICML 2026
- *2026.05*: &nbsp;🎉🎉 One paper is accepted by ICML 2026 
- *2025.09*: &nbsp;🎉🎉 Two papers are accepted by ASE 2025 
- *2025.08*: &nbsp;🎉🎉 One paper is accepted by ISSRE 2025 
- *2025.06*: &nbsp;🎉🎉 I start my internship as an algorithm engineer at Lenovo
- *2025.05*: &nbsp;🎉🎉 One paper is accepted by KDD 2025

# 📝 Publications 

<div class='paper-box'><div class='paper-box-image' style="transition: transform 0.3s ease; cursor: pointer; position: relative; z-index: 10;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'"><div><div class="badge">ICML 2026</div><a href="https://arxiv.org/abs/2603.21250"><img src='images/graph-of-states.png' alt="sym" width="100%"></a></div></div>
<div class='paper-box-text' markdown="1">

[Graph of States: Solving Abductive Tasks with Large Language Models](https://arxiv.org/abs/2603.21250)

**Yu Luo**, Rongchen Gao, Lu Teng, et al.

- Graph of States is a general-purpose neuro-symbolic framework for abductive reasoning that grounds multi-agent collaboration in structured belief states, uses a causal graph and state machine to constrain reasoning transitions, and turns unconstrained exploration into a directed search that consistently improves performance on complex real-world abductive tasks.

<div class="paper-actions">
  <a class="paper-story-link" target="_self" href="{{ '/projects/graph-of-states/' | relative_url }}">
    <i class="fas fa-book-open" aria-hidden="true"></i>
    <span>Read the story</span>
    <i class="fas fa-arrow-right paper-story-link__arrow" aria-hidden="true"></i>
  </a>
  <a class="paper-story-link paper-story-link--wechat" target="_blank" rel="noopener" href="https://mp.weixin.qq.com/s/ZC_-zurf8iV6Kbp39AHgBg">
    <i class="fas fa-paper-plane" aria-hidden="true"></i>
    <span>机器之心</span>
    <i class="fas fa-external-link-alt paper-story-link__arrow" aria-hidden="true"></i>
  </a>
  <a class="paper-story-link paper-story-link--code" target="_blank" rel="noopener" href="https://github.com/gaorch85/Graph-of-States">
    <i class="fas fa-code" aria-hidden="true"></i>
    <span>Code</span>
    <i class="fas fa-external-link-alt paper-story-link__arrow" aria-hidden="true"></i>
  </a>
  <a class="paper-story-link paper-story-link--slide" target="_blank" rel="noopener" href="{{ '/assets/slides/GoS-presentation.pdf' | relative_url }}">
    <i class="fas fa-file-powerpoint" aria-hidden="true"></i>
    <span>Slide</span>
    <i class="fas fa-external-link-alt paper-story-link__arrow" aria-hidden="true"></i>
  </a>
</div>
</div>
</div>

<div class='paper-box'><div class='paper-box-image' style="transition: transform 0.3s ease; cursor: pointer; position: relative; z-index: 10;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'"><div><div class="badge">Arxiv 2025</div><a href="https://arxiv.org/abs/2510.24145"><img src="{{ '/images/opsagent.png' | relative_url }}?v=20260528" alt="sym" width="100%"></a></div></div>
<div class='paper-box-text' markdown="1">

[OpsAgent: An Evolving Multi-agent System for Incident Management in Microservices](https://arxiv.org/abs/2510.24145)

**Yu Luo**, Jiamin Jiang, Jingfei Feng, et al.

- OpsAgent is a lightweight and self-evolving multi-agent framework for incident management that transforms heterogeneous observability data into structured textual evidence, coordinates specialized agents for transparent diagnosis, and continuously improves through both model refinement and accumulated operational experience.

<div class="paper-actions">
  <a class="paper-story-link" target="_self" href="{{ '/projects/opsagent/' | relative_url }}">
    <i class="fas fa-book-open" aria-hidden="true"></i>
    <span>Read the story</span>
    <i class="fas fa-arrow-right paper-story-link__arrow" aria-hidden="true"></i>
  </a>
</div>
</div>
</div>

<div class='paper-box'><div class='paper-box-image' style="transition: transform 0.3s ease; cursor: pointer; position: relative; z-index: 10;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'"><div><div class="badge">ASE 2025</div><a href="https://nkcs.iops.ai/wp-content/uploads/2025/10/TrioXpert1.pdf"><img src='images/trioxpert.jpg' alt="sym" width="100%"></a></div></div>
<div class='paper-box-text' markdown="1">

[TrioXpert: An Automated Incident Management Framework for Microservice System](https://nkcs.iops.ai/wp-content/uploads/2025/10/TrioXpert1.pdf)

Yongqian Sun, **Yu Luo**, Xidao Wen*, Yuan Yuan, et al.

- TrioXpert is an end-to-end framework for incident management in microservice systems that leverages multimodal data and LLM-based collaborative reasoning to handle AD, FT, and RCL tasks with high interpretability. It significantly outperforms baselines across multiple benchmarks.

<div class="paper-actions">
  <a class="paper-story-link" target="_self" href="{{ '/projects/trioxpert/' | relative_url }}">
    <i class="fas fa-book-open" aria-hidden="true"></i>
    <span>Read the story</span>
    <i class="fas fa-arrow-right paper-story-link__arrow" aria-hidden="true"></i>
  </a>
  <a class="paper-story-link paper-story-link--code" target="_blank" rel="noopener" href="https://github.com/luoyu100/TrioXpert">
    <i class="fas fa-code" aria-hidden="true"></i>
    <span>Code</span>
    <i class="fas fa-external-link-alt paper-story-link__arrow" aria-hidden="true"></i>
  </a>
  <a class="paper-story-link paper-story-link--slide" target="_blank" rel="noopener" href="{{ '/assets/slides/industry-31-slides.pdf' | relative_url }}">
    <i class="fas fa-file-powerpoint" aria-hidden="true"></i>
    <span>Slide</span>
    <i class="fas fa-external-link-alt paper-story-link__arrow" aria-hidden="true"></i>
  </a>
</div>
</div>
</div>

<div class='paper-box'><div class='paper-box-image' style="transition: transform 0.3s ease; cursor: pointer; position: relative; z-index: 10;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'"><div><div class="badge">ASE 2025</div><a href="https://nkcs.iops.ai/wp-content/uploads/2025/09/Mengyao__SiameseLSTM.pdf"><img src='images/dynamicregress.jpg' alt="sym" width="100%"></a></div></div>
<div class='paper-box-text' markdown="1">

[Adaptive Performance Regression Detection via Semi-Supervised Siamese Learning](https://nkcs.iops.ai/wp-content/uploads/2025/09/Mengyao__SiameseLSTM.pdf)

Yongqian Sun, Mengyao Li, Xiao Xiong, Lei Tao, Yimin Zuo, Wenwei Gu, Shenglin Zhang*, Junhua Kuang, **Yu Luo**, et al.

- DynamicRegress is an adaptive performance regression detection framework that jointly models multi-dimensional KPIs and workload context with a semi-supervised Siamese LSTM, enabling accurate comparison of variable-length traces under dynamic loads. Deployed on Huawei Cloud, it achieves an F1 score of 0.958 with real-time detection latency.
</div>
</div>

<div class='paper-box'><div class='paper-box-image' style="transition: transform 0.3s ease; cursor: pointer; position: relative; z-index: 10;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'"><div><div class="badge">ISSRE 2025</div><a href="https://nkcs.iops.ai/wp-content/uploads/2025/08/PIPCell_ISSRE_CameraReady_v5.pdf"><img src='images/pipcell.jpg' alt="sym" width="100%"></a></div></div>
<div class='paper-box-text' markdown="1">

[Predicting the Impact of Parameter Adjustments on Cellular Networks](https://nkcs.iops.ai/wp-content/uploads/2025/08/PIPCell_ISSRE_CameraReady_v5.pdf)

Yongqian Sun, Qingliang Zhang, **Yu Luo**, Mingjie Li*, et al.

- PIPCell is a two-phase predictive framework for estimating how transmission power and cell individual offset adjustments affect cellular network metrics, combining domain-knowledge calibration with graph-organized Transformers to model intervention effects and inter-metric dependencies. On real-world China Mobile data, it improves over strong baselines by up to 25.8% in RMSE and 59.0% in sMAPE.

<div class="paper-actions">
  <a class="paper-story-link paper-story-link--slide" target="_blank" rel="noopener" href="{{ '/assets/slides/PIPCell_v2.pdf' | relative_url }}">
    <i class="fas fa-file-powerpoint" aria-hidden="true"></i>
    <span>Slide</span>
    <i class="fas fa-external-link-alt paper-story-link__arrow" aria-hidden="true"></i>
  </a>
</div>
</div>
</div>

<div class='paper-box'><div class='paper-box-image' style="transition: transform 0.3s ease; cursor: pointer; position: relative; z-index: 10;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'"><div><div class="badge">KDD 2025</div><a href="https://nkcs.iops.ai/wp-content/uploads/2026/01/FlowXpert-Expertizing-Troubleshooting-Workflow-Orchestration-with-Knowledge-Base-and-Multi-Agent-Coevolution.pdf"><img src='images/flowxpert.jpg' alt="sym" width="100%"></a></div></div>
<div class='paper-box-text' markdown="1">

[FlowXpert: Expertizing Troubleshooting Workflow Orchestration with Knowledge Base and Multi-Agent Coevolution](https://nkcs.iops.ai/wp-content/uploads/2026/01/FlowXpert-Expertizing-Troubleshooting-Workflow-Orchestration-with-Knowledge-Base-and-Multi-Agent-Coevolution.pdf)

Binpeng Shi, **Yu Luo**, Jingya Wang, Yongxin Zhao, et al.

- FlowXpert is a troubleshooting workflow orchestration framework that uses LLMs to build an incident-aware knowledge base and applies reinforcement learning with AI feedback to improve workflow generation. Evaluated on OpsFlowBench and deployed in Huawei Cloud’s datacenter, it demonstrated effectiveness in supporting engineers and AI agents.

<div class="paper-actions">
  <a class="paper-story-link paper-story-link--slide" target="_blank" rel="noopener" href="{{ '/assets/slides/slides-KDD25-FlowXpert.pdf' | relative_url }}">
    <i class="fas fa-file-powerpoint" aria-hidden="true"></i>
    <span>Slide</span>
    <i class="fas fa-external-link-alt paper-story-link__arrow" aria-hidden="true"></i>
  </a>
</div>
</div>
</div>


# 🎖 Honors and Awards
- *2025.10* 🎓 Scholarship for Postgraduate Recommendation (3/51), Nankai University
- *2025.10* 🎓 Scholarship for Merit and Competence, Nankai University
- *2025.06* 📝 Distinguished Undergraduate Thesis Award, Nankai University (南开大学校级优秀毕业论文)
- *2024.10* 🎓 Scholarship for Merit and Competence, Nankai University
- *2023.10* 🎓 Scholarship for Academic Excellence, Nankai University

# 📖 Educations
- *2025.06 - present*, PhD, Software Engineering, Nankai University, China, advisor [Yongqian Sun](https://nkcs.iops.ai/yongqiansun/)
- *2021.09 - 2025.06*, undergraduate, Software Engineering, Nankai University, China

<!-- # 💬 Invited Talks
- *2021.06*, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ornare aliquet ipsum, ac tempus justo dapibus sit amet. 
- *2021.03*, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ornare aliquet ipsum, ac tempus justo dapibus sit amet.  \| [\[video\]](https://github.com/) -->

# 💻 Internships
- *2025.06 - 2026.01*, Algorithm Engineer at Lenovo, China.

# 🎤 Invited Talks
- *2026.06*: "Graph of States: Solving Abductive Tasks with Large Language Models", AITIME Community, [Link](https://www.bilibili.com/video/BV1zLL96dELo/?share_source=copy_web&vd_source=46fea0c86812502b4bd703eca52de309&t=2193&sessionid=)

# ⛪ Services
ICML26 (Gold Reviewer)

# Visitors

<div style="margin-top: 1rem; text-align: center;">
  <div style="width: 70%; margin: 0 auto;">
    <script
      type="text/javascript"
      id="mapmyvisitors"
      src="//mapmyvisitors.com/map.js?d=XzjopC4LS8uUkOWtd9w_d0mJ0Voq7X6HYSwP7MLrqw8&cl=ffffff&w=a">
    </script>
  </div>
</div>
