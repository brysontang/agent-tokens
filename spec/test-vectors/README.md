# Agent Tokens Test Vectors

This folder contains **cross-language** test vectors for Agent Tokens.

## Goals
- Provide a shared set of inputs/outputs so independent implementations can interoperate.
- Focus on **decode + validation** semantics (not byte-for-byte encoding), since JSON key ordering is not canonicalized in v0.

## Folder layout
- `v0/valid/*.json` — vectors that MUST decode successfully.
- `v0/invalid/*.json` — vectors that MUST fail to decode with a specific error `code`.
- `v0/policy/*.json` — vectors that MUST decode successfully **and** evaluate to an expected policy decision (the "Should I allow this?" layer).
- `v0/policy/manifest.json` — optional human-friendly manifest listing the policy vectors (not itself a test vector).

## Vector format

Valid vector:

```json
{
  "id": "v0-minimal",
  "desc": "Minimal valid envelope",
  "token": "<base64url(JSON)>",
  "expect": {"v": 0, "pkgs": {}}
}
```

Invalid vector:

```json
{
  "id": "v0-invalid-not-json",
  "desc": "Base64url decodes but JSON parsing fails",
  "token": "<base64url(not-json)>",
  "error": "invalid_token"
}
```

Policy vector:

```json
{
  "id": "v0-policy-fail-drift",
  "desc": "Token is valid, but request conflicts with strict allowlist.",
  "token": "<base64url(JSON)>",
  "context": {"method": "POST", "path": "/bank/transfer"},
  "expect_result": "deny",
  "expect_error": "out_of_scope"
}
```

## Notes
- `token` is a base64url-encoded JSON string **without padding**.
- Implementations SHOULD treat invalid base64url / invalid JSON as `invalid_token`.
- Implementations SHOULD reject non-object `pkgs` (arrays, null, etc.) as `invalid_token`.
