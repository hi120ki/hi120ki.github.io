---
sidebar_position: 2
---

# Cross-Platform Federation

When building solutions that span multiple cloud/platform providers, authentication and authorization become critical concerns. Traditionally, long-lived credentials such as AWS IAM User access keys or Google Cloud Service Account keys have been used to enable programmatic access. However, these static credentials pose significant security risks:

- **Long validity period**: If these keys are leaked or compromised, attackers may have persistent access for months or even years.
- **Lack of clear ownership**: Keys are often shared among teams or embedded in automation, making it difficult to track who is responsible for their use.
- **Operational burden**: Rotating, revoking, and auditing static keys across multiple environments is complex and error-prone.

For these reasons, the use of static, long-lived credentials is strongly discouraged in modern cloud environments.

Instead, all major cloud providers now offer federation mechanisms that allow you to grant temporary, least-privilege access to resources. Federation enables users or workloads to authenticate using trusted identity providers (such as SAML, OIDC, or another cloud's identity service) and obtain short-lived credentials on demand. This approach offers several advantages:

- **Reduced risk**: Temporary credentials limit the window of opportunity for attackers, even if credentials are leaked.
- **Improved traceability**: Each session is tied to a specific user or workload, making auditing and incident response easier.
- **Centralized identity management**: You can manage access policies and identities in a single place, reducing administrative overhead.
- **Seamless cross-cloud access**: Federation makes it possible to securely access resources across AWS, Google Cloud, and other platforms without managing multiple sets of static keys.

In the following sections, we will provide step-by-step guides for setting up cross-cloud federation, including scenarios such as granting AWS resources access to Google Cloud resources and vice versa. By adopting federation, you can significantly enhance the security and manageability of your multi-cloud infrastructure.

## Accessing AWS Resources from Google Cloud

> **TBD (Content will be added in the future)**

## Accessing Google Cloud Resources from AWS

> **TBD (Content will be added in the future)**

## Accessing AWS Resources from GitHub Actions

> **TBD (Content will be added in the future)**

## Accessing Google Cloud Resources from GitHub Actions

> **TBD (Content will be added in the future)**
