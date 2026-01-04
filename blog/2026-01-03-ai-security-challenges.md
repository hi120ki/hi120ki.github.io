---
title: AI Security Challenges in 2026
description: AI Security Challenges in 2026
authors: [hi120ki]
tags: [AI, Security, LLM, Agent, MCP, OAuth]
slug: posts/20260103
image: /img/2026-01-03/ogp.png
---

# AI Security Challenges in 2026

The year 2025 witnessed a continuous cycle of emerging and evolving AI/LLM technologies. Across the industry, various security measures for AI have been advancing. In 2026, AI adoption is expected to expand further, bringing new technologies and demanding corresponding security measures. This article reviews the major topics from 2025, breaks down the anticipated industry-wide challenges in AI Security for 2026 into concrete action items, and summarizes security measures for safely using and providing AI.

<!-- truncate -->

**[→ 日本語版 / Japanese version](https://hi120ki.github.io/ja/blog/posts/20260103/)**

## Looking Back at 2025

AI Security activities in 2025 focused on implementing security measures alongside the introduction of newly emerging AI technologies. While best practices were limited in early 2025, comprehensive guidelines have now been developed and are gaining recognition:

- [OWASP Top 10 Risk & Mitigations for LLMs and Gen AI Apps](https://genai.owasp.org/llm-top-10/)
- [NIST AI RMF Playbook](https://www.nist.gov/itl/ai-risk-management-framework/nist-ai-rmf-playbook)
- [MITRE ATLAS](https://atlas.mitre.org/)
- [Google SAIF](https://safety.google/intl/en_ALL/safety/saif/)
- [CSA AI Controls Matrix](https://cloudsecurityalliance.org/artifacts/ai-controls-matrix)
- [Identity Management for Agentic AI](https://openid.net/wp-content/uploads/2025/10/Identity-Management-for-Agentic-AI.pdf)
- [CoSAI AI Incident Response Framework](https://github.com/cosai-oasis/ws2-defenders/blob/main/incident-response/AI%20Incident%20Response.md)

These frameworks have enabled fundamental security measures for AI. Here, we explore five particularly noteworthy topics in depth.

![AI Security 2025](/img/2026-01-03/ai-security-2025-en.jpg)

### Safe Introduction of AI Solutions

Throughout 2025, AI solutions like [Claude Code](https://code.claude.com/docs/overview), [Cursor](https://cursor.com/en-US), and [Devin](https://devin.ai/) as coding agents, AI workflow services like [n8n](https://n8n.io/) and [Dify](https://dify.ai/), and AI Meeting Note applications have been trending, with new ones appearing almost monthly.

The biggest risk in organizational AI solution usage is the unintentional leakage of confidential information when users are unaware that free plan usage data may be used for model training. Additionally, when data is stored on service provider servers, managing the types of usage data, access methods, and permissions is essential. Since these services frequently change in popularity with model performance improvements, relying on a single specific tool is insufficient. Therefore, it's important to not only manage usage but also establish "a foundation for safely trying all tools" and "a process for managing AI solutions that can be used safely."

An example of infrastructure investment is utilizing an LLM API Proxy ([LiteLLM](https://www.litellm.ai/)). This enables safe usage of tools that support the OpenAI API specification with custom LLM APIs (Claude Code, Codex, Gemini CLI, OpenCommit, etc.), establishing a centralized management system ([Providing Safe and Convenient Access to LLM APIs with LLM Key Server](https://engineering.mercari.com/en/blog/entry/20251202-llm-key-server/)) that can manage multiple models uniformly. This platform is one of the best practices that simultaneously solves common issues with LLM API usage: access permission granting, auditing, API key management, budget management, and model management.

For processes to manage safely usable AI solutions, establishing review processes for new tools and guidelines is important. Approaches such as developing or introducing custom security features ([Security Challenges in Devin Discovered Through Operations - Devin Meetup Tokyo 2025](https://speakerdeck.com/hi120ki/devin-ai-security), [Open-Sourcing n8n Static Analysis CLI Tool – Automating Security Checks with JSON Analysis and DAG](https://engineering.mercari.com/blog/entry/20251211-580dc508a7/)) are also effective.

### MCP Security

In addition to "AI Agents" like Claude Code and n8n, [MCP (Model Context Protocol)](https://modelcontextprotocol.io/docs/getting-started/intro) was one of the most talked-about topics. While it became commonplace as an extension feature to automatically gather the context necessary for AI agents to perform tasks correctly, MCP carries significant risks in supply chain and access permission management.

In the early days of MCP, Atlassian led with official MCP server offerings, but major service vendors have been slow to develop official MCP servers. As a result, organizations have been using open-source MCP servers published on GitHub or developing their own MCP servers. Using open-source MCP servers without inspection can lead to situations like the [postmark-mcp](https://postmarkapp.com/blog/information-regarding-malicious-postmark-mcp-package) incident, where an unofficial MCP server contained email leakage code, allowing abuse of service access permissions or execution of malicious code in local environments.

Furthermore, MCP may require long-lived API keys to be directly written in configuration files for granting access permissions to services. Additionally, the Dynamic Client Registration authorization specification recommended by the official MCP specification has multiple security flaws ([Authentication and Authorization in MCP - MCP Meetup Tokyo 2025](https://speakerdeck.com/hi120ki/mcp-authorization)), making it difficult for existing service authorization servers to support. Each AI agent's MCP client implementation has been slow to support the official specification's recommended authorization methods, and using the connection conversion tool [mcp-remote](https://github.com/geelen/mcp-remote) raised concerns about authentication information being stored in plaintext in `~/.mcp-auth/` rather than in the OS's official encrypted keystore.

To address these risks, it's important to limit MCP servers to officially provided ones as much as possible, establish review processes for MCP server implementation and management to reduce supply chain risks, and encourage migration to MCP servers and clients that support the latest authorization specifications.

### Confused Deputy Problem

2025 marked a shift from [Prompt Engineering](https://www.promptingguide.ai/) for improving single instructions to [Context Engineering](https://www.singlestore.com/blog/context-engineering-a-definitive-guide/), changing the fundamental approach to instructing AI agents and passing information to them. As part of this, AI agents have been encouraged to acquire more context and have gained permissions to various data sources.

However, data has inherent permission structures. For example, personal information managed by the HR department cannot be viewed by engineers. Confidential information managed independently by each department is controlled and audited so that only members of that department can view it. Granting permissions without considering the AI agent's users, output disclosure scope, or impact scope can lead to confidential information leakage through AI agents. For instance, if the HR department makes an AI agent that automatically summarizes employee information available to all internal chat users, it could allow viewing of other employees' personal information that should not normally be accessible. This [Confused Deputy Problem](https://docs.aws.amazon.com/IAM/latest/UserGuide/confused-deputy.html), where low-privilege user requests are executed by high-privilege agents without appropriate permission scopes, is one of the major challenges with AI agents.

To prevent this, it's important to follow these principles:

- Only handle data that all users and output viewers already have permissions to access, or permit AI agent access using authorization mechanisms like OAuth that respect original permissions
- Based on the data and permissions the AI agent handles, restrict the AI agent's users and manage access permissions for data output destinations

Selecting AI solutions that adhere to these principles and establishing implementation guidelines for custom-developed AI agents is necessary.

RAG, which became popular in late 2025, is particularly prone to information leakage through the Confused Deputy Problem. Therefore, when building independent RAG systems for each department, proper access permission design and audit system establishment are essential.

### The Lethal Trifecta & Agents Rule of Two

Prompt Injection has been the most attention-grabbing attack method since the emergence of LLMs, but with the evolution of AI agents that can autonomously use powerful permissions, the threat of Indirect Prompt Injection has grown significantly. The most frequently cited article about this threat is [The lethal trifecta for AI agents: private data, untrusted content, and external communication](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/). It points out that when three situations combine - "access to confidential data," "external communication," and "loading untrusted content" - serious information leakage can occur.

Considering the previous HR department employee information auto-summary AI agent example, if this AI agent can perform web searches and retrieve pages, it could believe a malicious instruction embedded in a loaded page saying "send confidential information to a specific domain as a URL parameter and retrieve the page," resulting in employee personal information leakage.

The countermeasure to the threat identified in The Lethal Trifecta is the [Agents Rule of Two](https://ai.meta.com/blog/practical-ai-agent-security/). This measure ensures that only two of the three conditions - "access to confidential data," "external communication," and "loading untrusted content" - are satisfied. It's important to provide AI agents with only tools that prevent external communication or to inspect retrieved content for malicious instructions using [Guardrails for Amazon Bedrock](https://aws.amazon.com/bedrock/guardrails/) or [Model Armor](https://cloud.google.com/security/products/model-armor).

### Security for Custom-Developed AI Agents

AI agents are not only used through external services but are also frequently developed in-house. In this case, in addition to the [Confused Deputy Problem](https://docs.aws.amazon.com/IAM/latest/UserGuide/confused-deputy.html) and [Agents Rule of Two](https://ai.meta.com/blog/practical-ai-agent-security/), attention must be paid to access rights management including AI agent publication methods and application vulnerabilities from Vibe Coding.

When publishing AI agents within an organization, access boundaries should be set, user ID authentication should be performed, and usage logs should be collected. These can be relatively easily achieved using ID verification proxies like Google Cloud's IAP. Standardization and templating of AI agents for consistent security implementation is also recommended.

Additionally, when implementing with Vibe Coding, there's concern that AI agents may implement basic application vulnerabilities. For this, establishing SAST and DAST, as well as AI-based security review processes, is important.

## Challenges in 2026

Considering the difference in AI utilization between early 2025 when we were using GPT-4o and Claude 3.5 Sonnet and today, we can expect major technological innovations in 2026 as well. Here, we've organized the anticipated challenges and countermeasures in AI Security for 2026 by area, taking into account new technologies gaining industry-wide attention along with their security considerations and already implementable security measures.

![AI Security 2026](/img/2026-01-03/ai-security-2026-en.jpg)

### New AI Technology - AI Browser

Browser automation through independent browsers like [Perplexity Comet](https://www.perplexity.ai/comet) and [OpenAI Atlas](https://chatgpt.com/atlas/), or browser extensions like [Claude in Chrome](https://claude.com/chrome), where LLM models process integrated with browsers, is gradually approaching practical implementation.

This trend is not experimental; it's expected to become familiar soon, as [Gemini will be integrated into Chrome in the near future](https://gemini.google/overview/gemini-in-chrome/). However, as introduced in [Continuously hardening ChatGPT Atlas against prompt injection attacks](https://openai.com/index/hardening-atlas-against-prompt-injection/) and [Architecting Security for Agentic Capabilities in Chrome](https://security.googleblog.com/2025/12/architecting-security-for-agentic.html), LLMs are susceptible to prompt injection, and usage in high-risk environments like logged-in browsers, which have high privileges and wide access to confidential information, still has unknowns such as the accuracy of browser-side security measures.

AI Browser is a technology expected to become widespread, but for full-scale organizational deployment, it's recommended to start with non-logged-in trial usage while carefully considering the scope of use. Additionally, visualization of organization-level usage and log retention, along with other infrastructure for safe usage, should be considered as challenges to address.

### New AI Technology - AI Computer Use

While AI Browser is advancing toward real-world application, experiments are progressing with Computer Use, where AI agents autonomously perform PC operations as a more advanced form.

OpenAI's [computer-use-preview model](https://platform.openai.com/docs/models/computer-use-preview) is available, but as pointed out in [Risks and safety](https://platform.openai.com/docs/guides/tools-computer-use#risks-and-safety), it's susceptible to prompt injection, and usage in local environments where important assets are accessible is not yet recommended. The [official guide](https://platform.openai.com/docs/guides/tools-computer-use#setting-up-your-environment) also recommends using virtual machines.

AI Computer Use is currently an experimental technology, but anticipating future full-scale deployment, careful consideration of usage scope is required, similar to AI Browser. Additionally, constructing virtual environments with restricted external network communication and permissions, along with visualization of organization-level usage and log retention, are important security infrastructure considerations.

### New AI Technology - Agentic Ops

While AI Browser and AI Computer Use are primarily software for improving productivity in local environments, in new areas called Agentic Ops, such as [Komodor](https://komodor.com/), AI agents automatically investigate, identify root causes, and resolve issues in production environments.

While this usage method is expected to reduce on-call burden and make systems more stable, there's a risk that unintended AI agent decisions could cause service outages or data loss if production environment high privileges are directly obtained.

For safely introducing Agentic Ops, it's recommended to design systems where AI agents are not given direct production environment permissions but are only entrusted with the decision to execute or not execute predetermined processes. Additionally, implementing [HITL (Human in the loop)](http://botpress.com/blog/human-in-the-loop) to ensure humans always make judgments before execution and control against incorrect process execution is important.

### Continuous Mitigation of Vibe Coding Risks

While further AI agent and LLM accuracy improvements are expected in 2026, Vibe Coding still requires attention to application vulnerabilities and logic vulnerabilities. Particularly for application vulnerabilities, in addition to detection and correction through SAST and DAST, awareness raising within organizations to utilize features like [Claude Code's built-in security review function](https://support.claude.com/en/articles/11932705-automated-security-reviews-in-claude-code) and establishing [CI execution](https://github.com/anthropics/claude-code-security-review) is expected. However, since running security inspections on all PRs in CI can also degrade developer experience, approaches such as performing inspections collectively before release require consideration.

Additionally, as many coding tasks are entrusted to AI agents, there's concern about processing that doesn't meet basic logic requirements, internal requirements, or legal requirements. For this, mechanisms to accurately pass these logic and requirements to AI agents, and thorough reviews through Human in the loop, are important.

### Multi Agent System and Agent Platform

As the development of multiple highly specialized AI agents progresses, momentum is building for Multi Agent Systems that coordinate these agents to achieve objectives. While Multi Agent Systems themselves have various discussions around accuracy and token usage, from a security perspective, having multiple independently deployed AI agent groups gathered in one place for centralized management offers several major benefits:

1. Standardization of authentication and authorization
2. Centralization of log collection
3. Batch deployment of Human in the loop and Prompt Guardrails
4. Improved maintainability and reduced Supply Chain Risk through common library adoption

Security investment in Agent Platforms that realize Multi Agent Systems is expected to be one of the most noteworthy in 2026.

Services realizing Multi Agent Systems have actually emerged, including [AWS Bedrock AgentCore](https://aws.amazon.com/bedrock/agentcore/), [Google Gemini Enterprise](https://cloud.google.com/gemini-enterprise?hl=en), and [Salesforce Agentforce](https://www.salesforce.com/agentforce/).

These services provide mechanisms to safely realize authentication and authorization to data sources, audit logs, Human in the loop, and Prompt Guardrail deployment. By consolidating existing AI agents into these platforms, security measures that were previously needed individually can be implemented collectively.

### Agent Sandbox Security

If smarter LLM models and models optimized for browser automation and PC operation automation beyond coding emerge, making these capabilities practical beyond just coding, verification and deployment of sandboxes to safely run these AI agents will become an important consideration.

Lightweight code execution environments like [Agent Engine Code Interpreter](https://cloud.google.com/vertex-ai/generative-ai/docs/agent-engine/code-execution/overview) and [AgentCore Code Interpreter](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/code-interpreter-tool.html), services providing isolated Linux environments like [GKE Agent Sandbox](https://cloud.google.com/blog/products/containers-kubernetes/agentic-ai-on-kubernetes-and-gke), and AI agent-oriented browser environments like [Browserbase](https://www.browserbase.com/) and [Steel](https://steel.dev/) are currently available. For Computer Use as well, remote isolated environments using virtualization technology will likely be prepared to protect local environments. In these isolated environments, it's recommended to collect and manage commands executed by AI agents, actually started processes, and network logs.

### Human in the Loop and Approval Fatigue

Human in the loop has been implemented intensively to prevent information leakage and unintended behavior from AI agent malfunctions due to Prompt Injection attacks as pointed out in [The Lethal Trifecta](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/), and to prevent execution of incorrect behavior from AI hallucinations.

On the other hand, too frequent Human in the loop causes approval fatigue, where users just press "YES" without judging. This renders the implemented Human in the loop meaningless, so it's important to prepare safe environments, allow AI agent autonomous operation for behaviors where safety is guaranteed, and balance by obtaining approval only for things that truly need human judgment.

For this purpose, it's recommended to establish AI agent sandbox environments and appropriately classify behaviors that allow autonomous operation and behaviors requiring approval.

### Context Engineering and Prompt Injection Countermeasures

Previously, RAG and web search tools were utilized as Context Engineering, raising concerns about untrusted content being passed to AI agents. To address this, countermeasures were taken to inspect retrieved content for malicious instructions using [Guardrails for Amazon Bedrock](https://aws.amazon.com/bedrock/guardrails/) or [Model Armor](https://cloud.google.com/security/products/model-armor).

However, as new Context Engineering approaches, efforts to manage context among multiple people that was previously managed individually, and in Multi Agent Systems where multiple agents and users share context through RAG and LLM memory tools, are emerging.

These shared contexts can affect multiple AI agents and users through contamination by untrusted content. Additionally, since RAG and LLM memory have long retention periods, there's concern that untrusted content could continue to have adverse effects long-term. Therefore, it's recommended to enable Prompt Guardrails like [Guardrails for Amazon Bedrock](https://aws.amazon.com/bedrock/guardrails/) or [Model Armor](https://cloud.google.com/security/products/model-armor) in these context management systems and prevent unintended behavior through Human in the loop implementation.

### Prompt Guardrail Tuning and Low-Cost Deployment Support

Regarding Prompt Injection countermeasures with increased AI autonomy and threats, previously measures were recommended as introduced in articles like [How Microsoft defends against indirect prompt injection attacks](https://www.microsoft.com/en-us/msrc/blog/2025/07/how-microsoft-defends-against-indirect-prompt-injection-attacks), which involved improving prompt writing to emphasize untrusted content and avoid following incorrect instructions or guidance.

In addition to these methods, Prompt Guardrails are being provided by various companies to inspect whether malicious content is included in the context and prompts that LLMs read. These include products provided by major cloud vendors like [Guardrails for Amazon Bedrock](https://aws.amazon.com/bedrock/guardrails/) and [Model Armor](https://cloud.google.com/security/products/model-armor), as well as those provided by AI Security vendors like [EnkryptAI](https://www.enkryptai.com/), [HiddenLayer](https://hiddenlayer.com/), [Lakera AI](https://www.lakera.ai/), [Lasso Security](https://www.lasso.security/), [Pillar Security](https://www.pillar.security/), and [Prompt Security](https://prompt.security/).

While these Prompt Guardrails are somewhat useful, in actual use there are many unintended stops due to false positives, making detection level adjustment important. In addition to accuracy concerns from increased false negatives through adjustment, concerns remain about detection accuracy against attacks using languages other than English. Considering these factors, it's recommended to adjust standard detection levels to organizational requirements.

Additionally, since individually applying these Prompt Guardrails to each AI agent and managing filter levels is very labor-intensive, low-cost deployment through batch management with Guardrail settings at the LLM Proxy layer ([LiteLLM Guardrails](https://docs.litellm.ai/docs/proxy/guardrails/quick_start)) is effective.

However, while Prompt Guardrails are somewhat useful, they should be deployed with the understanding that, like WAFs, they have limitations against sophisticated attacks, and it's important to respond with combinations of multiple countermeasures.

### Okta XAA and MCP CIMD Support

With AI agents currently obtaining access permissions to multiple data sources and services, there are several identity challenges. First, while OAuth has been adopted to properly grant permissions to AI agents, the situation has become complicated as OAuth authorization flows must be executed for multiple services for each AI agent. Additionally, in MCP authorization, there's an unauthenticated [Dynamic Client Registration](https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization#dynamic-client-registration) situation that deviates from identity management best practices, where arbitrary users can register arbitrary OAuth clients.

New identity systems are emerging to address these issues. First is [Okta XAA (Cross App Access)](https://www.okta.com/integrations/cross-app-access/). Okta is widely used for employee identity management and handles authentication to internal services via SSO. Okta XAA allows Okta, as an identity management system, to manage authorization to each service, enabling applications to exchange tokens provided by Okta for service access tokens, making OAuth authorization flows optional. In other words, when logging into an AI agent system with Okta, document management and cloud permissions are automatically granted. This enables centralized management of AI agent identity in Okta while greatly reducing user effort and is highly promising.

For MCP as well, in the [latest specification published on November 25, 2025](https://modelcontextprotocol.io/specification/2025-11-25), [CIMD (Client ID Metadata Documents)](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization#client-id-metadata-documents) has become recommended for client registration for OAuth authorization flows. This replaces unauthenticated Dynamic Client Registration, and authorization servers no longer need to manage large numbers of OAuth clients server-side, instead registering clients from URLs provided by clients. In fact, Visual Studio Code is publishing CIMD client metadata at https://vscode.dev/oauth/client-metadata.json, and preparations for implementation have begun.

Regarding these new technologies for AI agent identity management, it's recommended to understand the latest situation and consider migration at the appropriate timing.

### AI Identity and Workload Cleanup

As the first year of AI agents, 2025 saw many organizations trial and develop various AI services. While such rapid technical verification is important, there's a risk that permissions granted to experimentally created AI agents and workloads deployed to the cloud remain without being organized.

These permissions and workloads are easily exploited as means of lateral movement and persistence when service or cloud compromise occurs, and periodic inventory and deletion is recommended from an attack surface reduction perspective.

This initiative also has benefits from a FinOps perspective, so in addition to visualization using CSPM, unification into agent platforms and establishment of AI agent inventory and audit systems should proceed in parallel.

### Standardization of AI Incident Response

The [CoSAI AI Incident Response Framework](https://github.com/cosai-oasis/ws2-defenders/blob/main/incident-response/AI%20Incident%20Response.md), published in late 2025, became a hot topic as the most mature incident response framework for AI/LLM applications. It summarizes incident types, log collection systems, analysis, response, playbooks, and past cases, and is expected to evolve AI agent security monitoring systems (authentication and authorization, audit logs, usage log collection and analysis, etc.) into even smoother incident response systems.

### Further Response to Shadow AI

The biggest risk in organizational AI solution usage is the unintentional leakage of confidential information when users are unaware that free plan usage data may be used for model training. Regarding unauthorized AI use ([Shadow AI](https://www.ibm.com/think/topics/shadow-ai)), establishing audit systems has been an ongoing challenge. In 2026, in addition to usage auditing, a new challenge of "migration from old usage methods" will be added.

Specifically, this includes migration from old MCP server implementations to official Remote MCP servers, and stopping plaintext authentication information storage in `~/.mcp-auth/` from using the connection conversion tool [mcp-remote](https://github.com/geelen/mcp-remote). These can be achieved through file auditing on endpoint devices and [MCP server allowlist management via MCP registry](https://github.blog/changelog/2025-11-18-internal-mcp-registry-and-allowlist-controls-for-vs-code-stable-in-public-preview/).

Additionally, recently, VSCode-derived Code Editors with AI agents like [Antigravity](https://antigravity.google/) have newly emerged in addition to [Cursor](https://cursor.com). When deploying these, in addition to organizational license management, setting [profile management](https://code.visualstudio.com/docs/setup/enterprise) ([Cursor](https://cursor.com/docs/enterprise/deployment-patterns)) supported by VSCode is recommended.

### Investigation and Deployment of New AI Security Services

2025 was also a period when various AI Security services significantly increased their visibility. Specifically, summarizing services selected for Gartner's Cool Vendors in AI Security, Agentic AI TRiSM, and AI Cybersecurity Governance:

- [Prompt Security](https://prompt.security/blog/prompt-security-named-as-a-2025-gartner-cool-vendor-in-ai-security): Automated LLM application testing and real-time protection for LLM usage
- [Noma Security](https://www.prnewswire.com/news-releases/noma-security-named-a-cool-vendor-in-the-2025-gartner-cool-vendors-in-ai-security-302577858.html): AIBOM generation and management, automated LLM application testing, Agentic Risk Map
- [Miggo Security](https://www.globenewswire.com/news-release/2025/10/08/3163321/0/en/Miggo-Security-Named-a-Gartner-Cool-Vendor-in-AI-Security.html): Application Detection & Response
- [Enkrypt AI](https://www.news10.com/business/press-releases/ein-presswire/857836418/enkrypt-ai-recognized-as-a-gartner-cool-vendor-in-ai-security-2025/): Prompt Guardrail and automated LLM application testing including voice
- [Aim Security](https://web.archive.org/web/20251015145002/https://www.aim.security/post/aim-security-is-recognized-as-a-cool-vendor-in-2025-gartner-r-cool-vendors-in-agentic-ai-trism-report): AI SPM, AI Runtime Security
- [Zenity](https://www.businesswire.com/news/home/20250910440978/en/Zenity-Named-a-2025-Gartner-Cool-Vendor-in-Agentic-AI-Trust-Risk-and-Security-Management-Report): AI Observability, AI SPM
- [Credo AI](https://www.businesswire.com/news/home/20251020911682/en/Credo-AI-Named-a-Gartner-Cool-Vendor-2025-in-AI-Cybersecurity-Governance): [EU AI Act](https://artificialintelligenceact.eu/) compliance automation and governance visualization
- [Knostic](https://www.knostic.ai/blog/gartner-cool-vendor-recognition): Data leakage prevention for LLMs

These new services are gaining attention, and there is much to learn from the countermeasure methods they provide.

Additionally, acquisitions of AI Security-related services by major companies are progressing, and AI Security features may be added to security solutions already available in organizations, with their implementation becoming necessary:

- [Palo Alto Networks ← Protect AI](https://www.paloaltonetworks.com/company/press/2025/palo-alto-networks-completes-acquisition-of-protect-ai)
- [SentinelOne ← Prompt Security](https://www.sentinelone.com/press/sentinelone-to-acquire-prompt-security-to-advance-genai-security/)
- [Cato Networks ← Aim Security](https://www.catonetworks.com/news/cato-acquires-aim-security-to-extend-sase-leadership-and-secure-enterprise-ai-transformation/)
- [Check Point ← Lakera](https://www.checkpoint.com/press-releases/check-point-acquires-lakera-to-deliver-end-to-end-ai-security-for-enterprises/)
- [CrowdStrike ← Pangea](https://www.crowdstrike.com/en-us/blog/crowdstrike-to-acquire-pangea/)

## Conclusion

The shift in trends from LLMs to AI agents in 2025 will continue in 2026, with smarter AI agents expected to have higher autonomy and permissions and be utilized more broadly. This article has summarized the challenges many companies are likely to face and the necessary countermeasures.

AI Security is not something that can be completed once countermeasures are implemented; it requires continuous adaptation with technological evolution. Many of the countermeasures introduced in this article can already be implemented, while others need to wait for future technological maturation. What's important is establishing infrastructure to safely try new AI technologies and accelerating innovation while understanding security risks.

Additionally, AI Security is not just a security team challenge. The entire organization, including developers, product managers, and executive leadership, needs to have a common understanding of safe AI usage and provision and work together. We hope this article serves as a starting point for discussions about AI Security within organizations and helps make AI utilization in 2026 safer and more productive.
