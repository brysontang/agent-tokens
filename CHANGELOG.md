# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-01-XX

### Added

- **Core specification** (`spec/agent-tokens-v0.md`): Wire format, envelope structure, and package extensibility model.
- **`at.intent.v1` package** (`spec/atp/ATP-0002-intent.md`): Per-request intent declaration with strict/advisory modes, allowlists, and expiry.
- **`@agent-tokens/core`**: Reference implementation for encoding, decoding, and policy evaluation.
- **`@agent-tokens/express`**: Drop-in Express middleware with intent scope enforcement.
- **Cross-language test vectors**: 15+ vectors covering valid tokens, invalid tokens, and policy evaluation scenarios.
- **Interactive debugger**: Browser-based token encoder/decoder at `site/index.html`.
- **CI pipeline**: GitHub Actions testing across Node 18, 20, and 22.

### Security

- Strict Base64URL validation (no padding, no whitespace).
- Fail-closed behavior for malformed `at.intent.v1` packages.
- Expiry enforcement independent of allowlist evaluation.
- Multiple `Agent-Token` header rejection to prevent ambiguity attacks.

## [Unreleased]

### Planned

- Python reference implementation.
- Go reference implementation.
- HTTP Message Signatures integration guide.
- `at.attribution.v1` package for agent identity claims.

---

[0.1.0]: https://github.com/brysontang/agent-tokens/releases/tag/v0.1.0
[Unreleased]: https://github.com/brysontang/agent-tokens/compare/v0.1.0...HEAD
