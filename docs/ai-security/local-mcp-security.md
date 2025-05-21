---
sidebar_position: 2
---

# Local MCP Server Security on Deployment

Local MCP servers, which run in developer or user environments, inherently carry more security risks depending on their implementation. This article outlines the security best practices that are relevant or anticipated as of May 2025 when implementing a Local MCP Server.

In particular, **access management** and **supply chain attacks** pose significant risks in the context of “easily deployable local MCP servers.” For example, a leak code injected into an open-source library could extract environment variables and steal an access token with no expiration, resulting in long-term consequences.

Given these scenarios, this guide provides recommendations to help you run a reasonably secure Local MCP Server with minimal setup, while reducing these risks as much as possible.

> I have implemented a Local MCP Server that incorporates these best practices. [hi120ki/mcp-vertex-ai-search-ts-stdio](https://github.com/hi120ki/mcp-vertex-ai-search-ts-stdio)
> It enables invoking Google Cloud’s Vertex AI Search from MCP, allowing you to retrieve custom context from arbitrary unstructured data. I encourage you to take a look.

## 1. Access Management

- ✅ Store a short-lived token obtained via OAuth2 authentication in a secure location (such as the keychain), and mount it to the MCP server via environment variables.
- ⚠️ Store a short-lived token obtained via OAuth2 authentication and mount it to the MCP server.
- 🚫 Write a long-lived (or possibly non-expiring) access token directly into the MCP configuration file.

Storing a short-lived OAuth2 token in a secure location like the system keychain will help prevent unauthorized access to the token. When we store it to the local file system, we need to ensure that the file is not accessible to other users or processes. Using environment variables to pass the token to the MCP server is a common practice, but it’s important to ensure that the environment variables can be taken over if the code of the MCP server is compromised. To reduce this risk, we should follow another best practice to be discussed below.

And worse, writing a long-lived access token directly into the MCP configuration file can lead to serious security vulnerabilities. These days, many cloud and SaaS service's long-lived credentials are written in the common MCP client configuration file, and this will be a common attack vector for supply chain attacks. If an attacker gains access to the configuration file, they can use the long-lived token to access the service without any restrictions. This is particularly dangerous if the token has elevated privileges or access to sensitive data.

## 2. Supply Chain Attacks

### 2.1. Deployment of Local MCP Server

- (✅ Remote deployment)
- ⚠️ Docker image based deployment
- 🚫 Use `npx` or `uv` to download and execute Local MCP Server

Developer and user environments often contain sensitive data like access tokens, API keys, and local files. Running the Local MCP Server separately - in a remote and containerized environment - can reduce the risk of supply chain attacks. This separation limits access to sensitive information and makes it easier to secure. But the authrization process of Remote MCP Server is not yet completely implemented, so we may need to use the Local MCP Server. In this case, we should be careful about the deployment method.

And using Docker images to deploy Local MCP Server can reduce the risk of supply chain attacks compared to using `npx` or `uv` to download and execute the Local MCP Server. Docker images are built from a known set of files and dependencies, which can be verified for integrity and authenticity. This makes it harder for an attacker to attack outside of container environment by inject malicious code in the Local MCP Server. However, it is still important to ensure that the Docker image is from a trusted source and has not been tampered with.

### 2.3. Version Hashing

- ✅ Use hashed version to verify the integrity of the Local MCP Server.
- 🚫 Use version or latest tag for the Local MCP Server.

To ensure the integrity of the Local MCP Server, it is important to use a hashed version of the Local MCP Server. This can be done by using a hash function like SHA-256 to generate a hash of the Local MCP Server container image. This hash can provide a unique identifier for the image not to be changed anyware. And hashed version will help us to investigate the incident if the Local MCP Server is compromised. The tag based versioning will make it difficult to identify the compromised version of the Local MCP Server. The tag based versioning is also not recommended for the Local MCP Server, because it can be easily changed by the attacker. For example, if an attacker injects malicious code into the Local MCP Server, they can change the tag to a different version or latest tag. This will make it difficult to identify the compromised version of the Local MCP Server.

✅ **OK**

```json
{
  "mcpServers": {
    "vertex-ai-search": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "ghcr.io/hi120ki/mcp-vertex-ai-search-ts-stdio@sha256:8bc5027cd219cdcd0d6860e2e6a7a4059d566bb3b55dc5fdcbd7a1ebba52aeff"
      ]
    }
  }
}
```

🚫 **NOT OK**

```json
{
  "mcpServers": {
    "vertex-ai-search": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "ghcr.io/hi120ki/mcp-vertex-ai-search-ts-stdio:latest"
      ]
    }
  }
}
```

### 2.2. Dependencies

- ✅ Use `latest` or `latest -1` version of dependencies and check the dependencies for vulnerabilities.
- ⚠️ Use older version of dependencies.

The depelopment of Local MCP Server is still in its early stages, and the dependencies are not yet stable. Using the latest version of dependencies can help ensure that you are using the most secure and up-to-date code. However, it is important to check the dependencies for vulnerabilities before using them. This can be done using tools like `npm audit` or `yarn audit`. Or we can use `trivy` to check the dependencies for vulnerabilities. This tool can help identify known vulnerabilities in the dependencies and provide recommendations for fixing them. It is also important to keep the dependencies up to date, as new vulnerabilities are discovered regularly. If you are using an older version of a dependency, it may contain known vulnerabilities that could be exploited by an attacker.

Basically, local MCP servers are deployed in a developer or user environment, and it is little bit difficult to attack the local MCP server from outside of the environment. But if the attacker can inject malicious code into the Local MCP Server, they can access the sensitive data in the container or the developer or user environment. This is particularly dangerous if the token has elevated privileges or access to sensitive data.

At the same time, it’s worth recognizing that immediately upgrading to the latest version without verifying the update contents can also introduce risks. In a supply chain attack where malicious code is injected, the attack remains effective until the contamination is discovered. In other words, unless someone verifies the update or a runtime detection tool identifies the issue, the attack will continue to affect all users running that version. Therefore, it is essential to both verify updates and implement EDR/DNS solutions capable of detecting and tracking the execution of compromised code - along with maintaining their continuous operation.
