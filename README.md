# Agent Tokens

**Status:** v0 Draft (Stable for experiments)

**Goal:** give the web a *first-class* way to answer: **“what agent made this request?”** — in a way that is:
- cryptographically bindable to the request (when used with HTTP Message Signatures)
- privacy-preserving by default
- extensible via small, composable “packages”

This repo contains:
- a **living spec** (`/spec`)
- a TypeScript **reference implementation** (`/packages`)
- runnable **examples** (`/examples`)

## Why this exists

User-Agent strings and IP allowlists are spoofable or operationally painful.

Meanwhile, agents are becoming normal web clients: personal assistants, crawlers, operators, and orchestrators.

Agent Tokens propose a minimal, modular envelope that an origin can parse to:
- identify cooperating agents
- apply per-agent policies (allow/deny/rate-limit/audit)
- optionally evaluate *per-request intent* (e.g., “weather lookup” vs “bank transfer”)

## Quickstart (Express)

```bash
pnpm install
pnpm -r build
pnpm --filter @agent-tokens/example-express-basic dev
```

Then send a request with an `agent-token` header (see `examples/express-basic/README.md`).

## Background & History

This protocol operationalizes the concepts from the whitepaper *[Introducing Agent Tokens](docs/background/introducing-agent-tokens.pdf)* (Tang, 2024).

> **Note:** The paper predates the v0 wire format. The current spec uses `base64url(JSON)` and does **not** use JWTs. Please refer to the `/spec` folder for the normative implementation.

## Spec

Start here:
- `spec/agent-tokens-v0.md`
- `spec/atp/ATP-0000-process.md`

## Conformance

This repo includes cross-language **test vectors** under:

- `spec/test-vectors/v0/valid` and `spec/test-vectors/v0/invalid` ("Can I decode this?")
- `spec/test-vectors/v0/policy` ("Should I allow this request?")

The TypeScript packages run these vectors in CI to keep semantics stable as the spec evolves.

## Relationship to existing standards

Agent Tokens are designed to **compose** with:
- HTTP Message Signatures (RFC 9421) for request authentication
- Web Bot Auth profiles (e.g., `Signature-Agent` + `.well-known` key directory)

Agent Tokens intentionally avoid reinventing:
- cryptographic request signing
- OAuth user authorization (e.g., MCP auth)

## Status

Experimental. Expect iteration.

If you implement this in the wild, please open an issue with:
- your use-case
- what fields you actually needed
- what privacy constraints you ran into
