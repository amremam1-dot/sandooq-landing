# auth.md — Sandooq El-Amara Agent Authentication

This document describes how automated agents register and authenticate with Sandooq El-Amara.

## Discovery Metadata

- **OAuth Protected Resource Metadata**: [/.well-known/oauth-protected-resource](https://sandoqalemara.com/.well-known/oauth-protected-resource)
- **OAuth Authorization Server**: [/.well-known/oauth-authorization-server](https://sandoqalemara.com/.well-known/oauth-authorization-server)
- **OpenID Connect Configuration**: [/.well-known/openid-configuration](https://sandoqalemara.com/.well-known/openid-configuration)
- **Web Bot Auth Key Directory**: [/.well-known/http-message-signatures-directory](https://sandoqalemara.com/.well-known/http-message-signatures-directory)

## Agent Registration

- **Registration Endpoint**: `POST https://sandoqalemara.com/agent/register`
- **Supported Identity Types**: `anonymous`
- **Supported Credential Types**: `bearer`
- **Claim Endpoint**: `POST https://sandoqalemara.com/agent/claim`

## Authentication Methods

- **Bearer Token**: Transmitted via HTTP `Authorization: Bearer <token>` header.
- **Web Bot Auth**: HTTP Message Signatures compliant with RFC 9421.
