---
title: AI Security Action Items for the Second Half of 2026
description: AI Security Action Items for the Second Half of 2026
authors: [hi120ki]
tags: [AI, Security, LLM, Agent, MCP, OAuth]
slug: posts/20260701
image: /img/2026-07-01/ogp.jpg
---

# AI Security Action Items for the Second Half of 2026

At the start of the year, in [AI Security Challenges in 2026](https://hi120ki.github.io/blog/posts/20260103/), I laid out the challenges the industry as a whole would likely face over the course of the year. Half a year has now passed, and many of the topics I described back then as needing to "wait for future technological maturation" have already reached a stage where we can start taking action. Okta Cross-App Access has become a service ready for production deployment, and Anthropic has adopted it. Sandboxes for agents are becoming standardized, and frontier models are beginning to surpass humans in the application security domain. As we enter the second half of 2026, this article summarizes the latest state of the AI Security industry and lays out where those responsible for AI Security at a typical organization—one that is presumably driving agent adoption—should start over the next six months.

<!-- truncate -->

**[→ 日本語版 / Japanese version](https://hi120ki.github.io/ja/blog/posts/20260701/)**

![AI Security Action Items for the Second Half of 2026](/img/2026-07-01/img.jpg)

## Looking Back at the First Half of 2026

The biggest change in the first half of 2026 was that the AI agent platform ecosystem matured all at once. Elements that were still experimental at the start of the year have entered a consolidation phase, much like how each vendor lined up best practices during the cloud migration era. ([Action Items for Agent Platform Security](https://hi120ki.github.io/blog/posts/20260223/))

A symbolic example is Claude Enterprise adding [support for Okta Cross-App Access](https://claude.com/blog/enterprise-managed-auth), and [sandboxes for agents](https://claude.com/blog/claude-managed-agents) becoming common infrastructure.

Another notable trait of the past six months is that the building blocks of AI agents have converged into four elements — input, output, tools, and system prompt — and implementations across vendors have become remarkably similar. When implementations become standardized, security measures can be standardized too. That is exactly why the second half is a good time to shift our focus from case-by-case responses to investment in common foundations.

Below, I summarize the items I consider high priority for the next six months, each in its own section.

## Full-Scale Adoption of Okta Cross-App Access and Managing and Monitoring Access Logs

The top priority for the second half of 2026 is the full-scale adoption of [Okta Cross App Access (XAA)](https://www.okta.com/solutions/cross-app-access/). I described it as "highly promising" in my article at the start of the year, and over the past six months it has advanced rapidly from a concept to a service ready for production use.

XAA is a vendor-neutral open protocol that extends OAuth and is also incorporated as MCP's official authorization extension (Enterprise Managed Auth) ([Okta introduces Cross App Access](https://www.okta.com/newsroom/press-releases/okta-introduces-cross-app-access-to-help-secure-ai-agents-in-the/)). Okta, which is widely used for employee identity management, mediates authorization to each service, and AI agents exchange Okta tokens for each service's access token, eliminating the need to go through an OAuth authorization flow for every service. In June 2026, the ecosystem expanded, with more than 25 integrations announced, including Cloudflare, WorkOS, Stytch, and Keycloak ([Okta advances the industry standard for secure AI agent connections](https://www.okta.com/newsroom/press-releases/okta-announces-cross-app-access-partners/)).

What is especially noteworthy is that Anthropic adopted it. Okta became a featured identity provider for Claude, making it possible to centrally manage access through Okta to participating MCP providers such as Asana, Atlassian, Canva, Figma, Granola, Linear, and Supabase ([Okta becomes a featured identity provider powering secure AI agent connections for Claude](https://www.okta.com/newsroom/press-releases/okta-becomes-a-featured-identity-provider-powering-secure-ai-agent-connections-for-claude-enterprise/)). Anthropic began offering enterprise-managed authorization for MCP connectors, so that once IT administrators provision organization-wide MCP integrations through Okta, employees are automatically granted access the moment they first open Claude ([Enterprise-Managed Authorization: Zero-touch OAuth for MCP](https://blog.modelcontextprotocol.io/posts/enterprise-managed-auth/)). Per-user consent screens are no longer needed — exactly the world I was hoping for at the start of the year.

One thing not to forget when adopting XAA is log management and monitoring. XAA is designed on the premise that all connections go through a central identity policy and all actions are logged. It only becomes meaningful once you go beyond simply deploying it and build a system to collect and monitor these logs and trace which agent accessed which service. The first step for the second half is to proceed with the migration to XAA while setting up log collection and monitoring operations in parallel.

## Establishing an Agent Identity Model and Deploying It at Scale

The second priority is establishing an Agent Identity model. While XAA solves authorization to individual services, a more fundamental design question remains: how does an organization define and manage "who an AI agent even is"?

In enterprise environments in 2026, machine identities are said to exist at nearly 100 times the scale of humans, and many of them are shifting toward being tied to AI agents ([Non-Human Identity Is the New Security Perimeter in 2026](https://nhimg.org/nhi-101/non-human-identity-security-perimeter-2026)). However, AI agents differ in nature from traditional static, narrowly scoped NHIs like service accounts and API keys. Because they are dynamic entities that reason autonomously, delegate permissions, and operate across multiple domains, they cannot be captured as a simple extension of traditional NHI management ([A New Identity Playbook for AI Agents in 2026](https://www.strata.io/blog/agentic-identity/new-identity-playbook-ai-agents-not-nhi-8b/)).

The principle to uphold here is simple: an agent's identity must always be traceable back to a specific human. Permissions should be granted as short-lived tokens tied to a task and revoked once the task is complete, or, to avoid holding credentials at all, a MITM proxy should be set up to inject HTTP headers in a way the agent cannot access. CSA has also published a [white paper on the governance of non-human identity and agentic AI](https://labs.cloudsecurityalliance.org/research/csa-whitepaper-nonhuman-identity-agentic-ai-governance-v1-cs/), and the governance gap in this area is starting to be recognized as a shared challenge across the industry ([What identity means in the age of agentic AI](https://www.ibm.com/think/news/think-2026-identity-recap)).

In this effort, it is especially important not only to document and share the model you establish, but also to make it reusable and deploy it thoroughly across the organization.

## Addressing the Limits of OAuth — Tenant Isolation and the Shift to Machine Identity

Using OAuth to properly delegate permissions to agents while avoiding the Confused Deputy Problem has become the established approach. However, there is a structural limitation here. Current OAuth scopes make it difficult to strictly define resource access boundaries, leaving the risk that an agent can access information it should never touch. In fact, there is analysis showing that overly scoped tokens increase the probability of privilege escalation and data leakage ([Authorization infrastructure for AI agents needs finer-grained controls](https://nhimg.org/articles/authorization-infrastructure-for-ai-agents-needs-finer-grained-controls/)).

Updates on the OAuth protocol side are improving scope and resource control, but it will take time for these to propagate to every service. As an effective interim workaround, tenant isolation of confidential information is useful. Carve out the data that truly must be protected into a separate tenant or service, and forcibly block access so that it is physically unreachable from OAuth scopes and resources.

Another possible direction is a paradigm shift toward access management that leverages machine identity — a world where you can express, in finer permission-based terms, who can perform which action on what, and in which context. However, when allowing machine access via machine identity, you must pair it with two things: verification that access stays within what the user could originally reach, and audit logs that always trace who actually performed the action.

## Tool-Based Permission Restriction — MCP Configuration Alone Is Not Enough

As MCP has become widespread, one reality has become clear: restricting connection targets in a configuration file alone is not enough as a permission restriction. MCP handles authentication, but it has no mechanism for tool-level authorization. Therefore, this layer must be enforced outside of MCP, through a gateway or individual MCP client configuration ([MCP Permissions: Securing AI Agent Access to Tools](https://www.cerbos.dev/blog/mcp-permissions-securing-ai-agent-access-to-tools)).

Furthermore, many AI agents connected to MCP run with the same permissions as the user who launched them. With default settings, it is easy to delegate not just read operations but also write operations to the agent via MCP. As a result, situations arise where a support agent that should only need to read tickets and update the CRM ends up with filesystem write access, network egress, code execution, and even DB administrator privileges ([MCP RBAC: Tool-Level Permissions for Production AI Agents](https://www.getmaxim.ai/articles/mcp-rbac-tool-level-permissions-for-production-ai-agents/)).

The countermeasure is to appropriately enable and disable tools on the agent or MCP client side and enforce the principle of least privilege. Controlling at the tool level, as with MCP RBAC, achieves controls similar to AWS's [secure AI agent access patterns to AWS resources using MCP](https://aws.amazon.com/blogs/security/secure-ai-agent-access-patterns-to-aws-resources-using-model-context-protocol/). Don't be reassured by MCP configuration alone; design tool-level least privilege, and especially for change operations, consider the recoverability of the target resources and the establishment of that recovery process.

## Strengthening and Standardizing Agent Sandbox Security

Agent Sandbox, which I described in my article at the start of the year as "becoming important going forward," has entered the practical phase of selection and deployment over the past six months. Once you entrust agents with not just coding but also browser automation and PC operation, the quality of the sandbox that safely isolates and runs them directly translates into your security quality.

For isolation technologies, three have taken hold as the mainstream in 2026: microVMs represented by Firecracker (the strongest isolation, robust enough even for regulated data), syscall-level user-space kernels like gVisor, and lightweight V8 Isolates ([How to sandbox AI agents in 2026: MicroVMs, gVisor & isolation strategies](https://northflank.com/blog/how-to-sandbox-ai-agents)). What is important is that a shared understanding has formed that ordinary containers are insufficient as an isolation boundary for agentic workloads. OWASP, NVIDIA, and Microsoft are all converging on the same controls: kernel-level process isolation, network egress allowlists, write protection for configuration files, per-task secret provisioning, or HTTP header injection of credentials via a MITM proxy ([Best Code Execution Sandboxes for AI Agents in 2026](https://modal.com/resources/best-code-execution-sandboxes-ai-agents)).

For the second half of this year, I think it is a good idea to translate these standardized controls into your own organization's sandbox, templatize them, and roll them out horizontally. Dedicated services like E2B and Daytona are already widely used, so you don't necessarily need to build everything yourself. On the premise of defense in depth that layers isolation, resource limits, network control, permission scoping, and monitoring, you need to establish a consistent standard where "every agent performs its various tasks on top of this sandbox."

## Building Audit Logs and Alerts for Dangerous Behavior

Once you have a system in place to grant agents permissions and run them in a sandbox, the next thing you need is audit logs that let you trace "what they did" and an alerting mechanism that detects dangerous behavior.

The core of the problem is that, especially for agents using OAuth, they run with the same permissions as employees, so in the audit logs of connected services they are indistinguishable from human users. As a result, the actions of a compromised agent become "ownerless" audit records, creating a danger that accountability becomes ambiguous ([AI agent audit logging exposes the gap in identity governance](https://nhimg.org/articles/ai-agent-audit-logging-exposes-the-gap-in-identity-governance/)). This is exactly why audit logs that record every action, prompt, query, and response — with attribution to the actor and traceability — are required.

Furthermore, you shouldn't stop at just "collecting" audit logs; you will likely need to build in alerts that detect dangerous actions such as external transmission of confidential information or destructive operations in real time. What helps here is that the MITM-proxy-style OSS I mentioned at the start of the year has now come together over the past six months. [Pipelock](https://github.com/luckyPipewrench/pipelock) is an open-source agent firewall that inspects MCP, A2A, HTTP, and WebSocket traffic to scan for exfiltration, SSRF, and prompt injection, and can leave "signed action receipts" that are verifiable from outside the agent ([Pipelock: Open-source AI agent firewall](https://www.helpnetsecurity.com/2026/05/04/pipelock-open-source-ai-agent-firewall/)). Putting this combination in place—an inspection point outside the agent that stops dangerous traffic while leaving an audit trail—gives your incident response a noticeably higher resolution.

## AI SBOM and Recoverability — Visibility and Resilience for Agent Operations

At the start of the year, I wrote about "the risk that experimentally created agents and workloads remain without being organized." In the second half, it's time to systematize this as an AI SBOM (AIBOM). An AIBOM is an inventory for taking machine-readable stock of an AI system's components — models, datasets, tools, guardrails, and runtime elements — together with evidence of their provenance and integrity.

The technical documentation requirements in the EU AI Act was published, making AIBOM unavoidable ([What Is an AI-BOM (AI Bill of Materials)?](https://www.paloaltonetworks.com/cyberpedia/what-is-an-ai-bom)). CISA has published [Software Bill of Materials for AI - Minimum Elements](https://www.cisa.gov/resources-tools/resources/software-bill-materials-ai-minimum-elements), and OWASP has published [the OWASP AIBOM](https://owaspaibom.org/), and standardization is progressing.

Even so, it indicate that [only around 31% of ITAM team have visibility into their overall AI usage](https://info.flexera.com/ITAM-REPORT-State-of-IT-Asset-Management). It's worth starting by grasping "where and what AI is running." Alongside consolidation into CSPM and agent platforms, it is recommended to proceed in parallel with building out an AI agent inventory and audit system.

Something to keep in mind at the same time is recoverability. For agents that frequently modify resources, a process to confirm and prepare in advance whether operations are recoverable becomes important. Clarify points such as whether the design allows you to roll back even when an agent makes a wrong decision, and whether snapshots or rollback mechanisms are prepared before destructive operations. The more you increase autonomy, the more tasks you can entrust to agents, which should also contribute to improving organizational productivity.

## Continuing Shadow AI Countermeasures and Maturing the AI Tool Adoption Process

Responding to Shadow AI is an ongoing challenge from the start of the year. One survey found that a lot of the AI tools in use are outside the control of security/IT, and that AI adoption is outpacing governance ([What is Shadow AI? Risks, Tools, and Best Practices for 2026](https://www.lasso.security/blog/what-is-shadow-ai)). A realistic approach is to combine endpoint monitoring, network scanning, review of OAuth integrations, and self-declaration surveys to continuously discover the AI actually running within the organization and consolidate and visualize it ([Shadow AI and the Governance Gap](https://www.techloy.com/shadow-ai-and-the-governance-gap-the-quiet-tech-story-of-2026/)).

Turning the safe trial of AI tools into a process is also important. Because new tools are swapped out almost every month, rather than handling each one individually, you need to have, as a set, "a foundation for trying tools safely" and "a standardized process for evaluating and approving what you've tried." Something easily overlooked here is that risk reduction works differently for engineers and non-engineers. You can expect a certain level of technical literacy from engineers, but for AI SaaS and AI-enabled business tools used by non-engineers, a different approach is needed — setting guidelines and usage scope, and making data handling explicit. Being conscious of this difference while growing a process that can cover both will be the challenge.

## Preparing for the Rise of Frontier Models' Cyber Capabilities

Finally, a major change to keep in mind for the second half is the sharp rise in frontier models' cybersecurity capabilities. AI models are approaching a level that surpasses humans in the ability to discover and exploit software vulnerabilities.

Anthropic is advancing [Project Glasswing](https://www.anthropic.com/glasswing), which hardens critical software for the AI era, and how fast frontier models' autonomous cyber capabilities are growing is summarized in the [UK AI Security Institute's Frontier AI Trends Report](https://www.aisi.gov.uk/frontier-ai-trends-report). From the defender's perspective, Palo Alto's [Defender's Guide to the Frontier AI Impact on Cybersecurity](https://www.paloaltonetworks.com/blog/2026/05/defenders-guide-frontier-ai-impact-cybersecurity-may-2026-update/) is a helpful summary of the current state.

That said, these models are not omnipotent. The false positive rate in white-box detection is said to still be high. However, this trend has sharply raised the presence not only of "Security for AI" but also of "AI for Security," with OSS and SaaS for agent-driven vulnerability assessment now available and the groundwork being laid to put them into real operation. That is exactly why, in the second half, I think it's a good idea to experiment with how to adopt this capability on the defensive side, while intentionally creating situations where you can stay ahead of attackers.

## Conclusion

Many of the items I wrote at the start of the year as needing to "wait for future technological maturation" have, over the past six months, already changed into a stage where we can start taking action. I believe we are in a phase of moving forward on items such as the full-scale adoption of Cross App Access, establishing an agent identity model, tenant isolation and tool-level permission restriction, sandbox standardization, audit logs and alerts, AI SBOM and recoverability, continuing Shadow AI countermeasures, and preparing for the rise of frontier models' capabilities — all while shifting our focus from case-by-case responses to investment in common foundations.

Because much of AI Security work is foundational and easy to standardize, I feel it is equally important to document and share what you've implemented and deploy it with scalability in mind, while also making the impact visible alongside easy-to-understand metrics such as CIS benchmark achievement rates.

I hope to make progress on various initiatives so that I can write the next installment half a year from now. Thank you for reading this far.

## References

- [AI Security Challenges in 2026](https://hi120ki.github.io/blog/posts/20260103/)
- [Action Items for Agent Platform Security](https://hi120ki.github.io/blog/posts/20260223/)
- [How Secure Are Claude Managed Agents?](https://hi120ki.github.io/blog/posts/20260413/)
- [4 Insights from My First Year as an AI Security Engineer](https://hi120ki.github.io/blog/posts/20260524/)
