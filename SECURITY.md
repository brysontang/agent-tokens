# Security Policy

Agent Tokens is an authentication protocol for AI agents. Security is foundational to its purpose. We take all security reports seriously.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| v0.x    | :white_check_mark: |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email:

- **Email:** brysontang@gmail.com
- **Subject:** `[SECURITY] Agent Tokens: <brief description>`

### What to Include

To help us triage and respond quickly, please include:

1. **Description** of the vulnerability
2. **Steps to reproduce** (proof of concept if possible)
3. **Affected components** (core library, Express middleware, spec, etc.)
4. **Potential impact** (authentication bypass, data exposure, etc.)
5. **Suggested fix** (if you have one)

### Response Timeline

- **Acknowledgment:** Within 48 hours of receipt
- **Initial assessment:** Within 5 business days
- **Status updates:** Every 7 days until resolution
- **Resolution target:** Dependent on severity, typically within 30-90 days

### What to Expect

1. We'll acknowledge your report and begin investigation
2. We'll work with you to understand the scope and impact
3. We'll develop and test a fix
4. We'll coordinate disclosure timing with you
5. We'll credit you in the security advisory (unless you prefer anonymity)

## Responsible Disclosure

We follow responsible disclosure principles:

- We ask that you give us reasonable time to address the issue before public disclosure
- We'll coordinate the disclosure timeline with you
- We'll publicly acknowledge your contribution (with your permission)

## Security Considerations for Implementers

If you're implementing Agent Tokens, please note:

1. **The base envelope is not authenticated.** Bind tokens to HTTP Message Signatures (RFC 9421) for cryptographic request authentication.
2. **Validate all inputs.** The reference implementation includes test vectors for malformed tokens.
3. **Check expiry fields.** The `at.intent.v1` package includes expiry; always enforce it.
4. **Rate limit token validation.** Parsing untrusted input can be a DoS vector.

## Scope

This security policy covers:

- The Agent Tokens specification (`/spec`)
- The TypeScript reference implementation (`/packages`)
- Example code (`/examples`)

Third-party implementations should establish their own security policies.
