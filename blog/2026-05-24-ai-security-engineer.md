---
title: 4 Insights from My First Year as an AI Security Engineer
description: 4 Insights from My First Year as an AI Security Engineer
authors: [hi120ki]
tags: [AI, Security, LLM, Agent, MCP]
slug: posts/20260524
image: /img/2026-05-24/ogp.png
---

# 4 Insights from My First Year as an AI Security Engineer

Over the past year, the world of AI has changed a lot. The biggest change is in model performance. One year ago, we were amazed by the release of GPT-4, but looking back now, its performance seems somewhat primitive. The main uses were also limited to rough text generation and summarization.

However, times have moved on. The AI world is shifting from multi-step workflows that simply call LLM APIs to AI agents that run multiple steps autonomously using MCP, tools, and skills. It is now moving further toward a world where multiple AI agents work together on A2A and agent platforms.

<!-- truncate -->

As an AI security engineer at a business company, I have been deeply involved in introducing various AI-related products, promoting internal AI use from a security standpoint, and developing AI agents over the past year. From that position, I have kept thinking about the nature of these technologies and the skills required. I would like to share the following four insights with security engineers who work with AI, with people who want to use AI, and with those who decide strategy.

1. **Do not hesitate to wait one month**
2. **Recognize that an AI agent has only four variables**
3. **Have the courage to set standards, and change them without compromise**
4. **Keep track of the direction and timeline of the future**

These insights should continue to apply to future developments in AI agents as well.

## 1. Do not hesitate to wait one month

These days, updates, releases, and next-generation trends related to AI are shared across many social media platforms. From a user's point of view, it is wonderful to try new products as an early adopter and gain new knowledge from them. On the other hand, making such products available inside a specific organization needs a certain level of caution.

The reason is that, although there are many LLM providers, the underlying mechanism is essentially the same. Each model still predicts the next word from the input, and providers basically only adjust the input/output formats and similar aspects. As we have seen during the past year, even when a groundbreaking AI product appears, similar products from competitors usually arrive within a few weeks or months. In addition, even when something is labeled as a "new product," it is often just a system prompt change that can be reproduced with the products an organization has already adopted.

On top of that, introducing a new AI product brings large costs. It is not only about budget. As with any other service rollout, you need to handle user controls, security measures, monitoring and audit systems, and clear usage rules to reduce many kinds of risks. Even ending the use of a product later has very high costs: distributing accounts to new employees, doing inventory checks, periodic budget adjustments, keeping up with frequent feature updates, and updating security guidelines accordingly. You need to carefully check in advance whether the product is worth all these ongoing operational costs.

In other words, suppose you decide to introduce a groundbreaking AI product and pay all the costs of procurement and rollout. Even so, if a competitor releases something better right after, all that effort can be wasted. With this in mind, while keeping space for experimentation, it is important to wait one month before a full rollout and use that time to judge the true value of the product. You should compare it against the AI you have already introduced as an asset, and choose products that bring clear benefits to the organization, or that should be built in-house instead.

Looking back at the many new AI product releases I have seen this past year, only a small number were truly groundbreaking and worth introducing. At the same time, many people are still being pulled around by new trends on social media and have not yet developed the ability to see the real value. AI security engineers must take responsibility for communicating with these people and selecting the AI that brings clear benefits to the organization.

That said, AI security engineers face a lot of pressure. They deal with top-down AI adoption, requests from team members to judge new AI features, and daily work all at the same time. Handling so many incoming requests requires understanding from the people around them. For that reason, I sincerely hope the message "do not hesitate to wait one month" reaches not only AI security engineers but also the other people working on AI adoption.

## 2. Recognize that an AI agent has only four variables

As mentioned in the previous section, the basic mechanism of an LLM has not changed. At the same time, new concepts such as MCP, A2A, and Agent Skills keep appearing, CLI tools have become popular, HTML rather than Markdown is getting attention, and many other trends are filling social media.

However, if we step back to the technical core, I believe an AI agent is shaped by only four variables, even though many products with different purposes exist in this space. These are:

1. Input
2. Output
3. Tools
4. System prompt

Here, "input" means, for example, the first question in a Chat UI, a reply from a human, a startup message when running on a schedule, or an event-driven input for an SRE agent that reacts to a specific alert.

"Output" means the natural language or structured data generated through the LLM, along with its format.

"Tools" means the function-call features represented by MCP, which allow integration with external APIs, file system operations, command execution, and so on.

Finally, the "system prompt" includes both the traditional system prompt that defines the agent's behavior and dynamically loaded items such as Agent Skills.

These four variables basically shape an AI agent. Of course, the choice of LLM model, the platform used as the execution base, the orchestration method on that platform, and the security controls are also variables in a sense. But here I focus on the basic working principle of an agent.

The final goal of an agent platform is to let you freely combine these four variables. Most AI products in the world simply fix some of these variables for a specific purpose or make them selectable.

To put it the other way around, many people who try a new AI product they admired and are disappointed by the result do not fully understand these four variables. They have little experience of "which variable, set to which value, gives which result," so they are pulled in by the look and the marketing, and only their expectations move ahead.

On the other hand, if you have the "four variables" view, it becomes a strong compass for evaluating new AI products, choosing an agent platform, and even predicting future directions.

## 3. Have the courage to set standards, and change them without compromise

This point is mainly about the attitude that security engineers should keep when facing new features in AI and AI agents.

One year ago, the main technique for improving LLM performance was prompt engineering. The main battlefield was "how to raise the accuracy of LLM API calls," focusing on what kind of system prompt to prepare and how to pass the input.

However, with the arrival of AI agents and the further exploration of AI agent workflows and A2A, Context Engineering has replaced prompt engineering. In the earlier world where you only called LLM APIs, the main topics were basic LLM security, such as handling personal information, output data accuracy, and prompt injection. So when introducing an AI product, you could focus mainly on these points. [OWASP LLM Top 10](https://genai.owasp.org/llm-top-10/) was one of the representative security guidelines of the LLM era.

On the other hand, today AI agents autonomously read and write the file system, run commands freely, and call external APIs. As a result, the security standards have changed greatly. Of course, the previous standards still need to be followed. But you need to be aware that even if the basics do not change, the required standards shift, and past standards may no longer be the new standards for this new world. In fact, the guideline I now reference most often is [OWASP Top 10 for Agentic Applications for 2026](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/).

In this situation, you will sometimes need to revise standards you set in the past, or allow uses of AI that were not allowed before. Security engineers are responsible for safety, so they often become "blockers" for what teams want to do. When they receive requests about new ways of using AI, or about introducing and using AI products, they tend to focus on the dangers and want to stop the request.

However, in a time when AI adoption inside an organization is a strategic priority, a security team that acts as a blocker can be seen as a business risk. In that case, AI security engineers need to change their mindset. They should act not as blockers but as enablers, and seriously think about what kinds of rules and security guardrails could allow new AI products and new ways of building and using AI.

To do that, security engineers need more than knowledge of AI safety and dangers. They must keep up with the latest information, understand how AI is actually being used, and patiently communicate with many stakeholders.

This skill of safely enabling AI use is very rare. Holding this skill is essential to keep growing as a security engineer in the future.

## 4. Keep track of the direction and timeline of the future

In addition to following the latest information, you also need to imagine the future based on the changes you have followed so far.

### "Direction": Read the future through past innovations

LLM-related technology is currently developing at a very fast pace. The general direction is the same as how cloud computing became the "default": the technology is developing, maturing, getting organized, and gathering best practices.

If you look at past technical revolutions, you can also see the direction of AI development to some extent. The agent platforms and agent sandboxes that are now widely discussed are walking the same path that cloud computing did. The way zero-trust concepts are starting to enter AI agents is also part of this same line. By imagining the future through the history of past innovations, you can keep tracking the direction. While doing this, you need to seriously think about how to promote AI and which technologies to choose.

In current AI use, many internal and external products are being mass-produced and tested. At the same time, many issues are also building up. Some in-house products stop being used after large LLM providers release similar products. Internal products quickly become outdated. The maintenance cost of many in-house AI projects becomes heavy. Visibility of the management structure decreases.

These issues are also a reflection of the fact that AI is in an "early state." We can compare it to the time when on-premise servers were managed by hand, then by Ansible code, and finally on the cloud with IaC management.

One of the responsibilities of a security engineer is to choose carefully among the many products released by different companies, while keeping the future direction in mind. I believe safety will also improve along the same timeline as past technical developments. Based on that view, supporting the right product and technology choices is essential.

### "Timeline": Lead time to adoption and ROI

Keeping the "timeline" of technical development in mind is just as important. As an example, think about the next version of OAuth and the requirements for agent identity that are currently being discussed in RFCs and similar venues. How long will it take for these to become a finished protocol, for use cases and PoCs to spread, and for major service providers to adopt them?

In other words, for areas where adoption will take a long time, you need to keep an eye on the direction and the ideal goal, but solve current problems with the tools you have. To "solve with the tools you have," you will surely face development and maintenance costs. You must also estimate when a replacement solution might appear: a few months from now, or a few years from now. You need to include this estimate in your ROI calculation while keeping safety in place.

### Do not rely on safety as the only reason

If a security engineer joins these direction and technology choice discussions with safety as the only reason, it will be hard to gain understanding from others. Cutting off an option with a clear technical benefit by saying only "it is not safe" is a big waste.

What is needed now, in the highly uncertain and still-developing AI field, is the ability to grasp the path to a clear win by combining direction and timeline, see it as a whole, and drive it forward. I hope this way of thinking reaches not only security engineers who work with AI but also people who are leading AI in their organizations.

## Finally

This was a somewhat abstract article, but I have shared the 4 insights I value to keep being effective as an AI security engineer, based on this past year of work.

This time I focused on Security for AI inside the broader AI field. However, I believe these ideas also apply to other technical areas. Technical progress continues in existing security areas as well, such as the use of AI in vulnerability assessment, SOC, and cloud infrastructure management.

The ideas introduced here are not limited to AI. They should apply to other fields as well. I hope this article will be useful, and that more people can work on providing safe services and on building environments where those services can be used safely.
