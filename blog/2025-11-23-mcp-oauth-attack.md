---
title: "Weaponize the MCP - OAuth Phishing and Mitigations"
description: "Weaponize the MCP - OAuth Phishing and Mitigations"
authors: [hi120ki]
tags: [AI, Security, MCP, OAuth]
slug: posts/20251123
image: /img/2025-11-23/ogp.png
---

# Weaponize the MCP - OAuth Phishing and Mitigations

MCP, an extension layer for AI and LLM systems, now underpins many AI agents. At the same time, multiple attack vectors have been identified that build on this new AI and LLM context. The best known is MCP tool poisoning, where an agent is tricked into running harmful actions. This was discovered because of the combination of nondeterministic LLM behavior and the new concept of shared context.

While new attack methods emerge, long standing attack vectors are also being exposed by unsafe parts of the MCP specification.

<!-- truncate -->

## How OAuth Is Used in MCP

OAuth is used to grant MCP limited access and permissions to various services. When a user configures an MCP connection and starts using it, a browser opens automatically, the OAuth authorization flow begins, the account is authenticated, a consent screen is shown, and finally an access token is provided to the MCP client.

Registering an OAuth client is often a tedious step in the authorization flow. For example, in Google Cloud you can register an OAuth client that requests access to the Google account ecosystem such as Google Workspace. Registration requires company name, domain, links to a privacy policy and terms of service, and contact details as branding. Because an OAuth client administrator ultimately receives the user access token and can reach protected resources within scope without limits, strict review is required.

Yet in the MCP authorization process the step of registering an OAuth client appears to be skipped. MCP users start an OAuth authorization flow simply by adding a link to the MCP server in a config file.

This is powered by unauthenticated dynamic client registration. The MCP spec recommends using the authorization pattern defined in [RFC7591](https://datatracker.ietf.org/doc/html/rfc7591). In general, DCR is implemented by posting JSON with fields like the following to an HTTP endpoint such as `/register`.

```json
{
  "redirect_uris": [
    "https://client.example.org/callback",
    "https://client.example.org/callback2"
  ],
  "client_name": "My Example Client",
  "client_name#ja-Jpan-JP": "\u30AF\u30E9\u30A4\u30A2\u30F3\u30C8\u540D",
  "token_endpoint_auth_method": "client_secret_basic",
  "logo_uri": "https://client.example.org/logo.png",
  "jwks_uri": "https://client.example.org/my_public_keys.jwks",
  "example_extension_parameter": "example_value"
}
```

The server returns a response like this and the OAuth client registration completes.

```json
{
  "client_id": "s6BhdRkqt3",
  "client_secret": "cf136dc3c1fc93f31185e5885805d",
  "client_id_issued_at": 2893256800,
  "client_secret_expires_at": 2893276800,
  "redirect_uris": [
    "https://client.example.org/callback",
    "https://client.example.org/callback2"
  ],
  "grant_types": ["authorization_code", "refresh_token"],
  "client_name": "My Example Client",
  "client_name#ja-Jpan-JP": "\u30AF\u30E9\u30A4\u30A2\u30F3\u30C8\u540D",
  "token_endpoint_auth_method": "client_secret_basic",
  "logo_uri": "https://client.example.org/logo.png",
  "jwks_uri": "https://client.example.org/my_public_keys.jwks",
  "example_extension_parameter": "example_value"
}
```

This lets MCP users freely register an OAuth client for each environment. As noted earlier, the administrator of an OAuth client ultimately receives user access tokens and can reach protected resources within scope without limit, so registration normally requires review.

Services such as Atlassian and Notion already provide unauthenticated DCR for MCP, and more services are adding support. This registration model creates room for abuse.

## Unauthenticated DCR and OAuth Phishing

The most severe attack in unauthenticated DCR is OAuth phishing.

Classic phishing lures users to a fake site that closely mimics the real service. The attacker steals the username and password entered there and abuses resources in the account, causing data leaks and financial damage.

Phishing keeps evolving. Some phishing sites now relay one time passwords to the real site in real time to bypass stronger authentication.

One of the newest methods is OAuth phishing or consent phishing, which exploits the OAuth authorization flow. The attacker registers their own OAuth app on the target platform. They send phishing mail or fake invites and ask the user to sign in and approve. The link points to the real domain such as `https://auth.example.com/authorize?...`. When the user signs in and clicks approve, the attacker receives an access token that opens protected resources and payment privileges. The key traits are:

1. **The attack begins on a real domain**, so domain checks cannot block it.
2. **Passkeys cannot protect the user** because the real domain and real login flow are used, so even the strongest recommended phishing resistant authentication does not block the attack.
3. **Enforcing PKCE is ineffective.** Even if the authorization server requires PKCE, an attacker can fix the code challenge and verifier on their server and bypass the control.

In short, neither the authorization server nor the user can fully block this at the root.

In this attack pattern, unauthenticated DCR in MCP gives attackers more room to abuse. Because they can register OAuth clients without submitting company name, domain, contact details, or other information, it is hard to trace who registered a malicious OAuth client. Even if an operator disables one OAuth client used for phishing, the attacker can quickly register a replacement.

## Mitigations

OAuth phishing bypasses existing phishing resistant authentication such as passkeys and causes major impact to users and service operators. Offering unauthenticated DCR for MCP increases that risk. Possible ways to reduce it include the following.

### Mitigations for Authorization Server Operators

**Consent screens that warn about MCP use**

Unauthenticated DCR is not commonly used and is often provided specifically for MCP. In this case, the consent screen should highlight that the connection is for MCP and warn users about possible misuse such as OAuth phishing outside MCP.

**Scope limits for OAuth clients registered through unauthenticated DCR**

Limit OAuth clients registered through unauthenticated DCR to scopes in a predefined allow list. This reduces impact. In particular, block scopes that grant access to sensitive personal data, password changes, or fund transfers when those scopes are not needed for MCP.

**Ongoing monitoring of OAuth client callback URLs and use of a deny list**

In most cases, callback URLs in MCP OAuth flows point to localhost or 127.0.0.1. If a callback URL is hosted on a standalone server, the OAuth client may be used in an unusual way. Keep monitoring these URLs and disable OAuth clients when they are used for OAuth phishing. Maintain a deny list to prevent the same URL from being registered again as a callback.

**Rate limiting and monitoring of registration and token based API calls**

Monitor suspicious use such as a large number of registrations from the same IP address or many API calls with access tokens in a short time, and apply basic rate limits.

### Guidance for Service Users

**Check details on the consent screen**

On the consent screen, review the app name and callback destination and avoid authorizing through suspicious OAuth clients.

## Moving to Client ID Metadata Documents

In the current MCP draft spec, a migration to OAuth client registration based on the [OAuth Client ID Metadata Document](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-client-id-metadata-document-00) has been proposed and merged. Instead of dynamically registering OAuth clients like DCR, you prepare a document that hosts the client metadata in advance, keep its URL in the MCP server, and use that to register the OAuth client.

![OAuth Client ID Metadata Document](/img/2025-11-23/cimd.png)

This is not a complete defense against OAuth phishing, but adding the step of hosting a Client ID Metadata Document as proof of identity raises the bar from anyone anonymously registering an OAuth client to requiring domain ownership and trust. Authorization server operators can then run allow and deny lists for domains that host malicious Client ID Metadata Documents.

This new Client ID Metadata Documents approach is planned to become the recommended method for OAuth client registration (DCR will move from recommended to optional).

It also tackles challenges beyond OAuth phishing, such as unchecked growth of OAuth clients and the need for complex monitoring on authorization servers. Quick migration by MCP server providers and MCP clients is needed. Work is already underway in the [typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk/issues/1052), and server providers should start adopting it too.

## Closing Thoughts

This article explained how unauthenticated DCR in the MCP authorization specification can become a new starting point for OAuth phishing, and introduced mitigations and the protection that the latest draft spec adds.

Beyond MCP, the wider OAuth ecosystem is updating its stance on OAuth phishing. I hope these best practices help reduce harm.

## References

- [Authorization - Model Context Protocol](https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization)
- [RFC7591](https://datatracker.ietf.org/doc/html/rfc7591)
- [MCP Tools: Attack Vectors and Defense Recommendations for Autonomous Agents](https://www.elastic.co/security-labs/mcp-tools-attack-defense-recommendations)
- [Submit for brand verification](https://developers.google.com/identity/protocols/oauth2/production-readiness/brand-verification)
- [Protect against consent phishing](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/protect-against-consent-phishing)
- [Evolving OAuth Client Registration in the Model Context Protocol](https://blog.modelcontextprotocol.io/posts/client_registration/)
- [Building MCP with OAuth Client ID Metadata (CIMD)](https://stytch.com/blog/oauth-client-id-metadata-mcp/)
- [SEP-991: Enable URL-based Client Registration using OAuth Client ID Metadata Documents](https://github.com/modelcontextprotocol/modelcontextprotocol/issues/991)
- [Client Registration Approaches](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/docs/specification/draft/basic/authorization.mdx#client-registration-approaches)
