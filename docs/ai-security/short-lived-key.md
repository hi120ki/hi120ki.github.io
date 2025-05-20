---
sidebar_position: 3
---

# Short-Lived OpenAI API Access Key

Managing API keys for cloud services like OpenAI is a critical security concern, especially when static, long-lived keys are used. Such keys, if leaked or forgotten, can grant unauthorized access for extended periods, making them difficult to audit, rotate, or revoke. The [OpenAI Key Server](https://github.com/hi120ki/openaikeyserver) addresses these risks by providing a secure, automated solution for issuing short-lived, on-demand API keys to authenticated users.

## What is OpenAI Key Server?

OpenAI Key Server is an open-source application that issues temporary OpenAI API keys to authorized users. It leverages Google OAuth2 for user authentication and the OpenAI Management API for dynamic key provisioning. Only users who are explicitly authorized—either by email address or domain—can obtain a temporary API key. Each key is valid for a limited period (default: 24 hours), after which it is automatically revoked and deleted, along with its associated service account.

## Key Features

- **Strong Authentication and Access Control:**
  Only users authenticated via Google OAuth2 and explicitly allowed by the administrator can obtain API keys. The server verifies ID tokens using OIDC to ensure authenticity and email verification.

- **On-Demand, Short-Lived API Keys:**
  Each user receives a unique API key generated on demand, tied to a dedicated service account. Keys are valid only for a configurable period (default: 24 hours).

- **Automated Expiry and Cleanup:**
  Expired keys and their service accounts are automatically deleted by a background process, minimizing the risk of lingering access.

- **No Long-Term Key Exposure:**
  The OpenAI Management Key is kept secure and never exposed to users. Only temporary, scoped keys are issued.

- **User-Friendly Web Interface:**
  After authentication, users are presented with their temporary API key and its expiration time in a secure, easy-to-use web page. Keys are never stored or logged by the server.

- **Simple Deployment and Configuration:**
  The server is easy to set up with environment variables for all critical settings, including allowed users/domains, OAuth2 credentials, and operational parameters.

## How It Works

1. The user accesses the server and is redirected to Google's OAuth2 login page.
2. After successful authentication, the server verifies the user's identity and checks if they are authorized.
3. If authorized, the server creates a new OpenAI service account and issues a temporary API key.
4. The key and its expiration time are displayed to the user via a secure web interface.
5. A background process periodically deletes expired keys and service accounts, ensuring no obsolete credentials remain.

## Security Considerations

- The server enforces strict access control, allowing only pre-approved users or domains.
- All issued API keys are short-lived and automatically revoked after expiration.
- The admin-level OpenAI Management Key is never exposed to users and is used only for internal operations.
- No API keys are stored or logged, reducing the risk of accidental leakage.
- The OAuth2 state parameter and secure cookies are used to prevent CSRF attacks during authentication.

## Configuration and Setup

The server is configured via environment variables, including:

- `ALLOWED_USERS` and/or `ALLOWED_DOMAINS` for access control
- `OPENAI_MANAGEMENT_KEY` for OpenAI API management
- `CLIENT_ID`, `CLIENT_SECRET`, and `REDIRECT_URI` for Google OAuth2
- `EXPIRATION` and `CLEANUP_INTERVAL` for key lifecycle management

Refer to the README for a full list of variables and their defaults.

### Prerequisites

- Go 1.24 or higher
- OpenAI Management API key (admin privileges)
- Google Cloud OAuth2 credentials

### Quick Start

1. Clone the repository
2. Create a `.env` file with the required environment variables
3. Run the application: `go run main.go`
4. Access the server in your browser and authenticate with Google
5. Receive your temporary OpenAI API key if authorized

## Implementation Overview

- `handler/callback.go`: Handles the OAuth2 callback, verifies the user, and issues API keys.
- `management/management.go`: Implements the logic for creating and cleaning up API keys and service accounts.
- `server/server.go`: Manages the HTTP server lifecycle and the background cleanup routine.
- `config/config.go`: Loads and validates configuration from environment variables, including security-critical settings.

## References

- [OpenAI Key Server (GitHub)](https://github.com/hi120ki/openaikeyserver)
- [OpenAI Platform Documentation](https://platform.openai.com/docs/api-reference/introduction)
