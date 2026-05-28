---
permalink: /projects/graph-of-states/
title: "Graph of States | Yu Luo"
author_profile: true
---

<div class="project-story" markdown="1">
<a class="project-back-link" target="_self" href="{{ '/' | relative_url }}#-publications"><i class="fas fa-arrow-left" aria-hidden="true"></i> Back to publications</a>

<p class="project-kicker">ICML 2026 / Abductive Reasoning / Multi-agent Systems / Belief States</p>

<h1 class="project-title">Graph of States</h1>

<p class="project-subtitle">Solving Abductive Tasks with Large Language Models</p>

<p class="project-byline"><strong>Yu Luo</strong>, Rongchen Gao, Lu Teng, et al.</p>

<div class="project-links">
  <a class="project-link" href="https://arxiv.org/abs/2603.21250"><i class="fas fa-file-alt" aria-hidden="true"></i> Read the paper <i class="fas fa-external-link-alt" aria-hidden="true"></i></a>
</div>

<figure class="project-figure">
  <img src="{{ '/images/graph-of-states.png' | relative_url }}" alt="Overview of the Graph of States framework for abductive reasoning" decoding="async">
  <figcaption>Graph of States structures collaborative reasoning through belief states, causal relations, and constrained transitions.</figcaption>
</figure>

## Story
Graph of States also began with a question left open by my earlier work. In TrioXpert, agents were separated by modality: one path handled numerical evidence, and another handled textual evidence. In OpsAgent, agents were separated by task: anomaly detection, failure triage, and root cause localization. Both designs were useful, but I gradually started to wonder whether they really reflected how operations engineers work in the real world.

This was where my advisor, Professor Yongqian Sun, gave me a very important push. He pointed out that an essential step toward unattended operations is not merely using agents to process data, but using agents to replace, or at least closely mirror, the roles of real operations engineers. If that is the goal, then the system should not only divide a task into convenient machine-friendly modules. It should also ask what kinds of experts exist in real operational workflows, how they communicate, and how their reasoning moves from symptoms to evidence and then to a root cause.

After discussions with Lenovo operations engineers, our initial idea was to build a multi-agent system that mapped more directly onto real incident response scenarios. We imagined agents that could reason in a ReAct-style loop, observing evidence, making hypotheses, asking for more information, and gradually moving toward a diagnosis. At first, this sounded like a natural next step. If humans reason interactively, why not let agents do the same?

But a problem appeared quickly. If several agents are working toward the same goal, how do they coordinate without dragging an ever-growing conversation history behind them? A long context can preserve information, but it is not a very elegant form of collaboration. It is expensive, noisy, and difficult for each agent to know exactly where the team currently stands. We needed a more compact structure that could summarize the reasoning state, guide future actions, and let different agents cooperate without rereading everything.

This is where the notion of belief states became central. A belief state is not just memory. It is a structured representation of what the agents currently believe about the task: what has been observed, what hypotheses remain plausible, what evidence supports or weakens them, and where the reasoning process should go next. For multi-agent collaboration, this is especially useful. It gives agents a shared map. It also gives each individual agent a sense of "where am I now?" and "where should I go next?"

Through preliminary studies, we identified several common failure patterns in microservice systems. That led us to introduce a causal graph and a state machine to construct and update belief states. The causal graph helps represent relationships among system components and possible failure paths, while the state machine constrains how the reasoning process can move forward. Together, they turn multi-agent reasoning from an open-ended conversation into a more organized search over possible explanations.

While framing the experiments, I realized something that changed the scope of the project. Root cause analysis in operations is essentially a form of abductive reasoning: we observe symptoms, search backward for evidence, and infer the most plausible cause. Then I noticed that medical diagnosis has a surprisingly similar structure. A patient shows symptoms, doctors collect evidence, and the goal is also to identify the underlying cause. In one setting the "patient" is a microservice system; in the other, it is a human body. This analogy helped Graph of States grow beyond incident management and become a more general framework for abductive reasoning.

<p class="project-question">I am especially grateful to Rongchen Gao, a Ph.D. student who supported the experimental work throughout the project. His implementation ability, careful thinking, and steady execution made the system much stronger than it would have been otherwise.</p>

</div>
