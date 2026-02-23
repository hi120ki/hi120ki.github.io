---
sidebar_position: 1
---

# AI Security

As AI systems like LLMs and agents become part of real products, new security problems appear. Traditional security tools are not enough to handle threats such as prompt injection, data leakage, and supply chain attacks on AI components. This section covers practical guides and tools to help you build and run AI systems more safely.

## Section Overview

- [Local MCP Server Security on Deployment](./local-mcp-security.md)
  Best practices for running local MCP servers safely, including access management, supply chain attack prevention, and version pinning.

- [Short-Lived OpenAI API Access Key](./short-lived-key.md)
  A tool that issues temporary OpenAI API keys through Google OAuth2 authentication, removing the risk of long-lived key exposure.

- [Model Armor Evaluator](./model-armor-evaluator.md)
  A hands-on guide to Google Cloud Model Armor, which filters both input prompts and AI responses to block prompt injection, harmful content, and sensitive data leakage.

- [Agent Platform Security Checklist](./agent-platform-security-checklist.md)
  A checklist for building secure AI agent platforms, covering sandbox isolation, network controls, credential management, observability, and prompt filtering.
