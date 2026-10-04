# auth.md — Sandooq El-Amara Agent Authentication

This document describes authentication for automated agents and clients connecting to Sandooq El-Amara APIs.

## Discovery Metadata

- **OAuth Protected Resource Metadata**: [/.well-known/oauth-protected-resource](https://sandoqalemara.com/.well-known/oauth-protected-resource)
- **OAuth Authorization Server**: [/.well-known/oauth-authorization-server](https://sandoqalemara.com/.well-known/oauth-authorization-server)
- **OpenID Connect Configuration**: [/.well-known/openid-configuration](https://sandoqalemara.com/.well-known/openid-configuration)
- **Web Bot Auth Key Directory**: [/.well-known/http-message-signatures-directory](https://sandoqalemara.com/.well-known/http-message-signatures-directory)

## Authentication Methods

- **Bearer Token**: Send Bearer tokens via HTTP `Authorization: Bearer <token>` header.
- **Web Bot Auth**: Use HTTP Message Signatures compliant with RFC 9421.
