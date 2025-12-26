# Agent Tokens v0 (Living Draft)

## 0.1 Purpose

Agent Tokens make it easy for any origin to answer:

> **What agent made this request, and what metadata do I need to apply policy?**

They are designed to be:

- **minimal** (kernel, not universe)
- **modular** (everything beyond the kernel is an extension “package”)
- **privacy-preserving by default**
- **compatible with HTTP infrastructure**

## 0.2 Non-goals

Agent Tokens v0 do **not** attempt to standardize:

- a global “agent passport authority”
- watermarking / model provenance verification
- universal “truth” about an agent’s training, weights, or evals
- replacing OAuth (user authorization) or HTTP Message Signatures (request authentication)

Those may exist later, but v0 focuses on what can be adopted now.

---

## 1. Wire format

### 1.1 Transport

Agent Tokens are sent as an HTTP request header:

- **Header name:** `Agent-Token` (case-insensitive; Node exposes it as `agent-token`)
- **Header value:** `base64url(JSON)` (no padding)

### 1.2 Core envelope (kernel)

Decoded JSON object:

```json
{
  "v": 0,
  "pkgs": {
    "at.intent.v1": {
      "mode": "strict",
      "intentId": "01J0Z7G7E5M7H8Q7J9K2T8QJ9B",
      "goal": "Get the weather forecast for Maui",
      "promptHash": "sha256:6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b",
      "allow": [
        { "origin": "https://api.weather.gov", "methods": ["GET"], "pathPrefix": "/" }
      ],
      "exp": "2099-12-12T20:10:00Z"
    }
  }
}
```

**Fields:**

- `v` *(required, integer)* — envelope version (v0 uses `0`)
- `pkgs` *(required, object)* — map of package identifiers → package payload objects

That’s it. Everything else is packages.

### 1.3 Operational limits

While the core supports payloads up to 16KB, broadly compatible implementations SHOULD target **<8KB** to fit within standard HTTP server header limits (e.g., Nginx, Apache).

To maintain size hygiene:
- Prefer short, high-entropy `intentId` values.
- Omit `goal` (verbose text) in favor of `promptHash` where possible.
- If rich metadata exceeds 8KB, implementations SHOULD use a "handshake" pattern (exchange token for a reference ID) rather than bloating the header.

---

## 2. Packages (extensibility)

A **package** is an object keyed by a stable identifier string.

### 2.1 Package identifier rules

- MUST be globally unique
- SHOULD be reverse-DNS-like or a short community namespace

This spec reserves the `at.*` namespace for ATP-defined packages.

### 2.2 Why packages exist

Origins need different metadata in different contexts:

- a crawler might declare rate expectations
- a personal assistant might declare user-intent scope
- a merchant might want “delegation / consumer identity” (but privacy matters)

Packages let the ecosystem evolve without bloating the kernel.

---

## 3. `at.intent.v1` — Per-request intent + scope (initial package)

### 3.1 What problem it solves

Agents often execute a user goal via **multiple requests**.

If a user intent is “get the weather”, and the agent later attempts a “bank transfer”, that mismatch should be detectable as a **policy red flag**.

`at.intent.v1` lets an agent declare an **intent scope** that origins can enforce or audit.

### 3.2 Per-request vs per-session

- The **Agent-Token header is per request**.
- `at.intent.v1` can represent either:
  - the *overall user goal* (stable across a chain of requests), or
  - the *allowed scope for this request* (narrow)

To link a chain of requests, include the same `intentId` across them.

### 3.3 Privacy model

Raw user prompts can be sensitive (PII, secrets, private context).

Therefore:

- `goal` is OPTIONAL and SHOULD be a **high-level summary**, not a verbatim prompt.
- `promptHash` is OPTIONAL and can be used for:
  - audit trails
  - correlating disputes (“this action was outside the prompt that produced this intentId”)
- Implementations SHOULD NOT require a raw prompt to be sent to an origin.
- If you ever add raw prompt transmission, it SHOULD be a separate package with explicit consent.

### 3.4 Schema

```ts
type AtIntentV1 = {
  mode: "strict" | "advisory";
  intentId: string;               // stable across a request-chain
  goal?: string;                  // coarse summary (optional)
  promptHash?: string;            // e.g. "sha256:<hex>" (optional)
  allow?: Array<{
    origin?: string;              // e.g. "https://api.weather.gov"
    methods?: string[];           // e.g. ["GET"]
    pathPrefix?: string;          // e.g. "/v1/"
  }>;
  exp?: string;                   // ISO8601 expiry (recommended)
};
```

### 3.5 How an origin uses it

`mode` defines the origin’s default posture:

- `strict`: if the request does not match any `allow` rule, the origin SHOULD deny or require explicit user confirmation
- `advisory`: origin MAY use `goal`/`allow` as signals, but MAY still serve the request

**Important:** the origin chooses its policy. The package is a *signal*; enforcement is local.

---

## 4. Policy engines (deterministic or LLM)

A common pattern is:

- **PEP (Policy Enforcement Point):** middleware / gateway in front of the origin
- **PDP (Policy Decision Point):** a rules engine *or an LLM* that evaluates the context

Agent Tokens make it easier to build a PDP because they provide structured, signed-ish signals.

But the protocol does not require an LLM. You can use:

- simple allowlists
- risk scoring
- heuristics
- LLM evaluation (e.g., “does this action align with the stated goal?”)

---

## 5. Security notes

### 5.1 Agent Tokens are not authentication by themselves

Without binding the header to a request signature, a token could be replayed or spoofed.

For production use, you SHOULD combine this with:

- **HTTP Message Signatures (RFC 9421)**, and/or a profile such as Web Bot Auth
- a well-known key directory + agent card for key discovery (when relevant)

### 5.2 Minimize cross-site tracking

A stable `intentId` across different origins can become a tracking vector.

Mitigations (implementation choices):

- use short expiries (`exp`)
- rotate `intentId` frequently
- consider per-origin derived intent IDs (advanced)

### 5.3 Recommended error codes (non-normative)

Different implementations may use different HTTP status codes and response bodies.
To simplify adoption, this section recommends a small, shared `error` vocabulary.

**Envelope / decoding**
- `invalid_token` — malformed header value (bad base64url, not JSON, missing required envelope fields)
- `unsupported_version` — `v` is present but unsupported

**Request / transport**
- `missing_agent_token` — header missing when required
- `invalid_request` — request malformed (e.g., multiple `Agent-Token` headers)

**`at.intent.v1` package / policy**
- `missing_intent_package` — `at.intent.v1` missing when required
- `invalid_intent_package` — `at.intent.v1` present but does not match the expected schema
- `invalid_intent_expiry` — `at.intent.v1.exp` is present but not a valid timestamp
- `token_expired` — token is expired (`now > exp`)
- `out_of_scope` — request does not match allowlist in strict mode

**Policy hooks**
- `agent_policy_denied` — denied by a local policy hook
- `agent_policy_challenge` — challenge required by a local policy hook

**Recommended posture for package parsing (non-normative):**
- Unknown package IDs SHOULD be ignored for forward compatibility.
- If a known package ID is present but invalid (schema mismatch), implementations SHOULD fail closed (treat the token as invalid) rather than silently treating it as “missing”.

The `decision` outcome space is intentionally **`allow | deny | challenge`** even if baseline evaluators don’t use `challenge` yet.

---

## 6. Open questions (intentionally deferred)

- how to standardize “user confirmation challenges”
- how to express sensitive actions in a generic way
- third-party attestations and verifiers
- selective disclosure / privacy-preserving claims

Those are candidates for future ATPs.
