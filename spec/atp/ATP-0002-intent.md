# ATP-0002 — `at.intent.v1` (Per-request intent + scope)

## Motivation
Agents often carry out a user goal via multiple steps and tool calls.

Origins want a portable way to detect and respond to **intent drift**:
- benign drift (agent exploring)
- risky drift (agent attempts sensitive actions outside user’s goal)
- malicious drift (prompt injection / hijack)

This package supplies signals an origin can use to:
- deny
- challenge (require user confirmation)
- log + alert

## Wire format

Package id: `at.intent.v1`

```json
{
  "mode": "strict",
  "intentId": "01J0Z7G7E5M7H8Q7J9K2T8QJ9B",
  "goal": "Get the weather forecast for Maui",
  "promptHash": "sha256:...",
  "allow": [
    { "origin": "https://api.weather.gov", "methods": ["GET"], "pathPrefix": "/" }
  ],
  "exp": "2099-12-12T20:10:00Z"
}
```

## Fields
- `mode` (required): `"strict"` or `"advisory"`
- `intentId` (required): correlates a chain of requests to one user goal
- `goal` (optional): coarse summary (avoid raw prompt)
- `promptHash` (optional): `"sha256:<hex>"` of a canonicalized prompt string
- `allow` (optional): allowlist of request patterns
- `exp` (optional but recommended): ISO8601 expiry

## Privacy considerations
- Do not require raw prompts.
- Keep `goal` high-level.
- Consider short expiries and/or per-origin `intentId` derivation to reduce tracking risk.

## Security considerations
- This package is most useful when the header is bound to a request signature.
- In `strict` mode, origins SHOULD deny or challenge requests that do not match `allow`.

## Evaluation semantics (normative)
This section defines the **portable** semantics that compliant implementations MUST follow
when using `at.intent.v1` for policy evaluation.

### Inputs
Implementations evaluate against a minimal request context:

- `method` (string): the HTTP method
- `path` (string): the request path (e.g. `"/forecast"`)
- `origin` (optional string): the request origin (scheme + host + optional port)

### Expiry
If `exp` is present:
1. It MUST be a valid ISO8601 timestamp. If unparseable, the package is **invalid**.
2. If parseable and `now > exp`, the evaluator MUST return:
   - `decision = "deny"`
   - `error = "token_expired"`

### Allowlist matching
If `mode === "strict"`, the request MUST match **at least one** allow rule.

If `allow` is missing or empty in strict mode, the evaluator MUST return:

- `decision = "deny"`
- `error = "out_of_scope"`

A request matches an allow rule if all specified constraints match:

- **Methods:** if `rule.methods` is present and non-empty, compare after normalizing both
  `context.method` and each `rule.methods[i]` to ASCII uppercase.
- **Path prefix:** if `rule.pathPrefix` is present, `context.path` MUST start with `rule.pathPrefix`
  (case-sensitive string prefix match).
- **Origin:** if `rule.origin` is present:
  - `context.origin` MUST be present
  - both origins MUST be canonicalized via URL parsing and `.origin` extraction
    (e.g. `new URL(x).origin`)
  - if canonicalization fails for either value, the rule does not match (fail closed)
  - canonical origins MUST be equal

### Advisory mode
If `mode === "advisory"`, origins MAY log, rate-limit, or route to a higher-assurance policy decision point (PDP),
but the default evaluator SHOULD return `decision = "allow"` unless `exp` is expired.

### Conformance
The normative behavior above is captured by the test vectors under:

- `spec/test-vectors/v0/policy/*`
