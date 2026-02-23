---
sidebar_position: 5
---

# Agent Platform Security Checklist

Modern AI agents built on frameworks like Claude Agent SDK and OpenClaw require broad access to the file system, shell, and network by default. Running these agents in production demands a dedicated execution platform with strong security controls. This checklist helps Agent Platform builders systematically verify that their platform addresses the key security concerns.

Each section provides a checklist item, why it matters, and a concrete recommendation for what to do.

## 1. Sandbox Isolation

### 1.1 One session, one isolated environment

- [ ] Each AI agent session runs in its own isolated container or VM

**Why:** If multiple agents share an environment, one agent's file edits can conflict with another's, credentials can leak across sessions, and it becomes impossible to attribute actions to a specific agent.

**Recommendation:** Use Firecracker microVMs, containers (Docker/Podman), or managed services (AWS Lambda, ECS, Google Cloud Run, GKE) to give each agent session a dedicated, ephemeral environment. Destroy the environment when the session ends.

### 1.2 Blast radius containment

- [ ] Even if the AI agent takes destructive actions (e.g. `rm -rf /`), the impact is confined to the sandbox

**Why:** AI agents with shell access can execute arbitrary commands. Without isolation, a single mistake or prompt injection attack can destroy host files or affect other workloads.

**Recommendation:** Run agent containers with a read-only root filesystem where possible. Mount only the necessary working directory as writable. Drop all unnecessary Linux capabilities and use a non-root user inside the container.

## 2. Network Controls

### 2.1 Egress allowlisting

- [ ] Outbound network access is restricted to an explicit allowlist of domains/endpoints

**Why:** An AI agent influenced by Indirect Prompt Injection can exfiltrate sensitive data via `curl`, `wget`, or any HTTP library to an attacker-controlled endpoint (e.g. `https://attacker.example/collect?data=<secret>`).

**Recommendation:** Implement a domain-based egress allowlist. For coding agents, allow only necessary destinations such as `github.com`, `npmjs.org`, `pypi.org`, and your container registry. On Google Cloud, use Cloud NGFW with FQDN-based rules; on AWS, use VPC security groups with a forward proxy. Deny all other outbound traffic by default.

### 2.2 HTTP-level inspection

- [ ] For high-security environments, HTTP requests are inspected through a forward proxy

**Why:** Domain allowlisting alone cannot prevent data exfiltration through URL parameters, HTTP headers, or request bodies to an allowed domain.

**Recommendation:** Route agent traffic through a forward proxy (e.g. Squid, Envoy) that can inspect and log HTTP request URLs, headers, and payloads. Block requests containing patterns indicative of data exfiltration.

## 3. Credential Management

### 3.1 Principle of least privilege

- [ ] AI agents are granted only the minimum permissions required for their task

**Why:** AI agents will potentially exercise all permissions they are granted. Over-privileged agents amplify the damage from prompt injection or hallucination-driven actions.

**Recommendation:** Before granting any credential, document what resources the agent needs to access and what operations it needs to perform. Grant read-only access unless write access is explicitly required. For multi-user agents, also verify that the agent's permissions do not exceed those of the individual user (Confused Deputy Problem).

### 3.2 Short-lived credentials

- [ ] All credentials provided to agents expire within a short time window (e.g. 1 hour)

**Why:** Long-lived API keys that leak through prompt injection or log exposure remain exploitable for their entire lifetime. With LLM-assisted exploitation, attackers can escalate privileges within minutes.

**Recommendation:** Use Workload Identity (OIDC-based token exchange) to issue short-lived credentials. For GitHub, use GitHub App installation access tokens (1-hour expiry) instead of Personal Access Tokens. Never store long-lived API keys in the agent environment.

### 3.3 Credential injection proxy

- [ ] Credentials are injected by a proxy rather than stored in the agent environment

**Why:** Even short-lived credentials can be exfiltrated during their validity window. If the agent never holds credentials at all, the risk of direct leakage drops to near zero.

**Recommendation:** Deploy a credential injection proxy (e.g. [WardGate](https://github.com/wardgate/wardgate)) that intercepts outbound HTTP requests from the agent and attaches authentication headers before forwarding. The agent only knows the proxy URL and never sees any credentials. Alternatively, provide unauthenticated Remote MCP servers accessible only from within the agent's network.

### 3.4 Commit signing without long-lived keys

- [ ] Git commits created by agents are signed without storing GPG/SSH keys in the agent environment

**Why:** Many organizations require signed commits. However, GPG and SSH keys are long-lived and highly sensitive. Storing them in the agent sandbox creates a high-value target.

**Recommendation:** Use the GitHub GraphQL API for commit creation, which automatically signs commits. The CLI tool [ghcommit](https://github.com/planetscale/ghcommit) wraps this into a command-line interface. Pair it with a short-lived GitHub App installation access token.

### 3.5 Recoverability of affected resources

- [ ] For resources that agents can modify or delete, a recovery mechanism exists

**Why:** AI agents can make incorrect updates or deletions. Third-party services may not provide built-in recovery for such changes.

**Recommendation:** Snapshot or back up resource state before agent actions. For source code, enforce Branch Rulesets to prevent direct pushes to the default branch and require PR reviews. For irreversible actions (e.g. sending emails), implement Human in the Loop.

## 4. Observability

### 4.1 Agent action logs

- [ ] Every tool call, command execution, and MCP server invocation is recorded with timestamps

**Why:** During security incidents, you need to reconstruct exactly what the agent did, when, and with what parameters. Without action logs, incident investigation is impossible.

**Recommendation:** Build action logging into your agent framework. If using Claude Code CLI (`claude -p`), export logs from the `~/.claude` directory. Store logs in a centralized, append-only log store with retention policies.

### 4.2 LLM API proxy logging

- [ ] All LLM API calls (prompts, responses, metadata) are recorded through a proxy

**Why:** LLM-layer logs capture the agent's reasoning and decision-making process, which is essential for understanding why an agent took a particular action.

**Recommendation:** Route all LLM API calls through a proxy such as [LiteLLM](https://www.litellm.ai/). Record prompts, completions, token counts, and latency. Consider deploying policy-based response blocking (e.g. [cencurity](https://github.com/cencurity/cencurity)) to detect and stop dangerous LLM responses in real time.

### 4.3 AI agent observability instrumentation

- [ ] Agent framework-level instrumentation is in place for tracing multi-step agent workflows

**Why:** Beyond individual LLM calls, you need visibility into the agent's overall workflow: which tools were called in what order, how context flowed between steps, and where failures occurred.

**Recommendation:** Integrate observability libraries such as [Datadog LLM Observability](https://www.datadoghq.com/blog/datadog-llm-observability/), [LangSmith](https://www.langchain.com/langsmith/observability), or [Arize Phoenix](https://arize.com/docs/phoenix) into your agent framework.

### 4.4 Runtime security monitoring

- [ ] Commands and processes executed inside the sandbox are monitored at the OS level

**Why:** LLM-layer monitoring cannot catch all threats. An agent executing a malicious command, installing a slopsquatted package, or spawning unexpected processes requires OS-level detection.

**Recommendation:** Deploy runtime security tools like [Falco](https://falco.org/) inside agent sandboxes. Tune rules to reduce false positives. Monitor for supply chain risks such as slopsquatting (installation of hallucinated packages).

## 5. Prompt Filtering

### 5.1 Enable prompt guardrails

- [ ] A prompt filtering service is enabled for both input and output

**Why:** Prompt filtering provides a baseline defense against prompt injection, data exfiltration via prompts, and generation of harmful content.

**Recommendation:** Enable [Model Armor](https://cloud.google.com/security/products/model-armor) (Google Cloud) or [Bedrock Guardrails](https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails.html) (AWS). For proxy-level deployment across multiple agents, use [LiteLLM Guardrails](https://docs.litellm.ai/docs/proxy/guardrails/quick_start).

### 5.2 Defense in depth beyond prompt filtering

- [ ] Security does not rely solely on prompt filtering; platform-level controls (sandboxing, network restrictions, credential isolation) are the primary defense

**Why:** Prompt filtering cannot perfectly prevent all attacks. Modern Agent Goal Hijack attacks use legitimate-sounding instructions with malicious intent, which are harder to detect than direct prompt injection.

**Recommendation:** Treat prompt filtering as one layer in a defense-in-depth strategy. The platform-level controls in this checklist (least privilege, credential injection proxy, network allowlists, Human in the Loop) are the primary mitigations. Prompt filtering catches the obvious attacks; platform design limits the blast radius of sophisticated ones.

## 6. Long-Lived Shared LLM Memory

### 6.1 Namespace isolation for memory

- [ ] LLM memory is scoped per agent or per session, not shared globally without access controls

**Why:** If multiple agents share the same memory space, a single poisoned entry (via Indirect Prompt Injection) can persist and affect all agents that read it, as demonstrated by the [Zombie Agents](https://arxiv.org/abs/2602.15654) attack.

**Recommendation:** Enforce strict namespace separation per agent. If memory must be shared, implement write-time validation (filtering or Human in the Loop) to ensure stored context is not malicious.

### 6.2 Memory audit logs

- [ ] All reads and writes to LLM memory are logged

**Why:** When memory is contaminated, you need to trace back to the source: which agent wrote the malicious entry, when, and what other agents consumed it.

**Recommendation:** Log every memory read and write operation with the agent ID, session ID, timestamp, and content hash. Set up alerts for unusual memory write patterns.

## 7. Supply Chain Security

### 7.1 Component verification

- [ ] AI agent frameworks, MCP servers, and Agent Skills are sourced from trusted origins and pinned to specific versions

**Why:** Agent Platforms handle significant permissions. A compromised framework or MCP server in the supply chain can lead to credential theft or data exfiltration.

**Recommendation:** Pin all dependencies to exact versions or content hashes. Perform regular dependency audits. Use container image digests (e.g. `image@sha256:...`) instead of mutable tags.

### 7.2 Read-only configuration

- [ ] Configuration files are mounted as read-only and do not carry over between sessions

**Why:** A compromised agent could modify its own configuration to escalate privileges or persist malicious settings into future sessions.

**Recommendation:** Mount configuration file directories as read-only in the container. Generate fresh configuration for each session from a trusted source. Never reuse an agent session's filesystem state for a new session.

## 8. Access Management for the Platform Itself

### 8.1 Authenticated access to agent endpoints

- [ ] The agent platform's API/gateway requires authentication and is not exposed to the public internet without access controls

**Why:** Exposing an agent gateway to the internet without authentication allows anyone to trigger agent actions, leak credentials, or take remote control of agent sessions.

**Recommendation:** Place the agent gateway behind an identity-aware proxy such as [Google Cloud IAP](https://cloud.google.com/security/products/iap). Require user authentication for all agent operations. Never expose agent control endpoints directly to the public internet.

### 8.2 Audit logs for platform access

- [ ] All user interactions with the agent platform (session creation, instruction submission, result retrieval) are logged

**Why:** Audit logs are essential for security incident investigation, compliance, and governance.

**Recommendation:** Log all platform access events with user identity, timestamp, action type, and session ID. Integrate with your organization's SIEM for centralized monitoring.

## References

- [Action Items for Agent Platform Security](https://hi120ki.github.io/blog/posts/20260223/)
- [AI Security Challenges in 2026](https://hi120ki.github.io/blog/posts/20260103/)
