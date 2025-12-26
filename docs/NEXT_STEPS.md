# Next Steps (Pragmatic)

The fastest path from “idea” → “adoption” is:

1) **Spec kernel**
2) **Reference implementation**
3) **One wedge demo** that is obviously valuable
4) **Interop tests** / test vectors
5) 1–2 real adopters

## 1) Build the wedge: “intent drift guardrail”
A simple and concrete story:

> If the user asked for weather, and the agent attempts a bank transfer, the origin should be able to detect that mismatch and deny or challenge.

This is powered by:
- `at.intent.v1` (goal + allowlist)
- a policy engine (deterministic or LLM)
- a gateway/middleware (PEP) that enforces the decision

## 2) Ship a drop-in middleware
- `@agent-tokens/express` already provides parsing + basic enforcement hooks.
- Next: add a small “policy decision hook” interface so anyone can plug:
  - a rules engine
  - an LLM-based evaluator

## 3) Add Web Bot Auth compatibility (optional but powerful)
When you’re ready, compose with HTTP Message Signatures via Cloudflare’s Web Bot Auth:
- npm: `web-bot-auth`
- sign outgoing requests
- verify signatures at the origin
- require that the signature covers the `agent-token` header

This makes spoofing/replay dramatically harder.

## 4) What to publish first
- `@agent-tokens/core`
- `@agent-tokens/express`
- `@agent-tokens/example-express-basic` (demo)

Even if everything is “experimental,” publishing makes it real.

## 5) What to do next
- Write 10–20 test vectors (good / bad tokens)
- Ask 2–3 friends to implement a parser in a different language (Go/Python)
- Run an “interop day” over Zoom (2 hours) and document what broke
