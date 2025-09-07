---
sidebar_position: 3
---

# Custom Property based Security Controls on GitHub

## Overview

GitHub Custom Properties enable organizations to add structured metadata to repositories, creating a powerful foundation for automated security controls and governance. By combining custom properties with repository rulesets, teams can implement scalable, policy-driven security measures that automatically adapt to repository characteristics.

Custom properties allow you to classify repositories by security level, compliance requirements, project type, or any organizational taxonomy. These properties then integrate seamlessly with GitHub's ruleset system, enabling automated enforcement of security policies based on repository metadata rather than manual configuration.

This approach transforms security governance from a manual, error-prone process into an automated system that scales with your organization while maintaining consistent security standards across all repositories.

## Custom Properties Management

### Understanding Custom Properties

Custom properties are key-value metadata that can be attached to repositories within a GitHub organization. They support several data types:

- **Text strings**: For flexible categorization (e.g., "high-security", "public-facing")
- **Single select**: For controlled vocabularies (e.g., security levels: "public", "internal", "confidential")
- **Multi-select**: For repositories with multiple characteristics (e.g., frameworks: ["react", "node.js"])
- **Boolean**: For binary classifications (e.g., "requires-approval": true/false)

Properties follow repository visibility - public repository properties are visible to anyone, while private repository properties are visible only to users with read access.

### Security-Focused Property Examples

**Security Classification**:

```yaml
property_name: security-level
values:
  - value: "confidential"
    repositories:
      - name: "org/payment-service"
      - name: "org/user-data-api"
  - value: "internal"
    repositories:
      - name: "org/internal-tools"
  - value: "public"
    repositories:
      - name: "org/documentation"
```

**Compliance Requirements**:

```yaml
property_name: compliance-framework
values:
  - value: "SOC2"
    repositories:
      - name: "org/customer-portal"
  - value: "GDPR"
    repositories:
      - name: "org/eu-data-service"
```

### Bulk Management with gh-custom-property-manager

Managing custom properties across hundreds of repositories manually becomes impractical. The `gh-custom-property-manager` tool provides a Terraform-like workflow for bulk property management:

**Installation**:

```bash
# Clone and build
git clone https://github.com/hi120ki/gh-custom-property-manager.git
cd gh-custom-property-manager
go build -o gh-custom-property-manager main.go

# Set up authentication
gh auth login
export GITHUB_TOKEN=$(gh auth token)
```

**Configuration-Driven Management**:
The tool uses YAML configuration files to define property assignments:

```yaml
# security-properties.yaml
property_name: requires-security-review
values:
  - value: "true"
    repositories:
      - name: "org/api-gateway"
      - name: "org/auth-service"
  - value: "false"
    repositories:
      - name: "org/documentation"
      - name: "org/scripts"
```

**Plan and Apply Workflow**:

```bash
# Preview changes before applying
./gh-custom-property-manager plan --config security-properties.yaml

# Output:
# Planned changes:
#   org/api-gateway: Set requires-security-review = true
#   org/auth-service: Set requires-security-review = true

# Apply the changes
./gh-custom-property-manager apply --config security-properties.yaml
```

### Integration with Repository Rulesets

The true power of custom properties emerges when combined with repository rulesets. Rulesets can target repositories based on their properties, creating dynamic security policies:

**Property-Based Ruleset Targeting**:

- **High-Security Repositories**: Require multiple approvals, signed commits, and status checks
- **Public Repositories**: Enforce branch protection and vulnerability scanning
- **Compliance-Sensitive**: Additional review requirements and audit trails

**Example Ruleset Configuration**:
For repositories with `security-level: "confidential"`:

- Require 1+ approvals from code owners
- Mandate signed commits
- Block force pushes to protected branches
- Require all status checks to pass on PR

### Benefits of Property-Based Security

**Scalability**: Policies automatically apply to new repositories based on their properties, eliminating manual configuration overhead.

**Consistency**: Standardized property schemas ensure uniform security controls across the organization.

**Visibility**: Properties make security posture immediately visible in repository lists and search results.

**Flexibility**: Properties can evolve with organizational needs without restructuring existing security policies.

**Compliance**: Automated property-based controls provide audit trails and ensure consistent policy enforcement.

This approach transforms GitHub repository security from reactive manual processes into proactive, automated governance that scales with organizational growth while maintaining security standards.

## References

- [Managing rulesets for repositories in your organization](https://docs.github.com/en/enterprise-cloud@latest/organizations/managing-organization-settings/managing-rulesets-for-repositories-in-your-organization)
- [Managing custom properties for repositories in your organization](https://docs.github.com/en/enterprise-cloud@latest/organizations/managing-organization-settings/managing-custom-properties-for-repositories-in-your-organization)
- [Repository Custom Properties GA and Ruleset Improvements](https://github.blog/changelog/2024-02-14-repository-custom-properties-ga-and-ruleset-improvements/)
- [hi120ki/gh-custom-property-manager](https://github.com/hi120ki/gh-custom-property-manager)
- [REST API endpoints for custom properties](https://docs.github.com/en/rest/repos/custom-properties?apiVersion=2022-11-28)
