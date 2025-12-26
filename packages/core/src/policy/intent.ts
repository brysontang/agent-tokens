import type { AtIntentV1, IntentAllowRule } from "../packages/intent";

/**
 * Minimal, framework-agnostic HTTP request context for policy evaluation.
 */
export type AgentRequestContext = {
  method: string;
  path: string;
  /**
   * Optional origin, e.g. "https://api.weather.gov".
   * If provided, allow rules that specify `origin` MUST match after canonicalization (URL().origin).
   */
  origin?: string;
};

export type AgentPolicyDecision = "allow" | "deny" | "challenge";

export type AgentPolicyEvaluation = {
  decision: AgentPolicyDecision;
  /**
   * Machine-readable error code for deny/challenge decisions.
   */
  error?: string;
  /**
   * Human-readable reason (safe for logs).
   */
  reason?: string;
};

function canonicalizeOrigin(input: string): string | null {
  try {
    return new URL(input).origin;
  } catch {
    return null;
  }
}

function matchesAllowRule(ctx: AgentRequestContext, rule: IntentAllowRule): boolean {
  if (rule.methods && rule.methods.length > 0) {
    const m = ctx.method.toUpperCase();
    const allowed = rule.methods.map((x) => x.toUpperCase());
    if (!allowed.includes(m)) return false;
  }

  if (rule.pathPrefix) {
    if (!ctx.path.startsWith(rule.pathPrefix)) return false;
  }

  if (rule.origin) {
    // If the allow rule is origin-scoped, we can only match if context includes an origin.
    if (!ctx.origin) return false;

    const ctxOrigin = canonicalizeOrigin(ctx.origin);
    const ruleOrigin = canonicalizeOrigin(rule.origin);

    // Fail closed on invalid origin strings.
    if (!ctxOrigin || !ruleOrigin) return false;

    if (ctxOrigin !== ruleOrigin) return false;
  }

  return true;
}

/**
 * Evaluate the default `at.intent.v1` policy semantics.
 *
 * This is intentionally small and deterministic so it can serve as a shared,
 * cross-language baseline for "Should I allow this request?" decisions.
 *
 * - If `exp` is present and the current time is after `exp`, deny.
 * - If `mode === "strict"`, deny if the request does not match any `allow` rule.
 * - Otherwise allow.
 */
export function evaluateAtIntentV1(
  ctx: AgentRequestContext,
  intent: AtIntentV1,
  now: Date = new Date()
): AgentPolicyEvaluation {
  if (intent.exp) {
    const t = Date.parse(intent.exp);

    // Hardening: Explicitly reject invalid timestamps (Fail Closed)
    if (Number.isNaN(t)) {
      return {
        decision: "deny",
        error: "invalid_intent_expiry",
        reason: "at.intent.v1 exp is not a valid timestamp.",
      };
    }

    if (now.getTime() > t) {
      return {
        decision: "deny",
        error: "token_expired",
        reason: "at.intent.v1 is expired (exp in the past).",
      };
    }
  }

  if (intent.mode === "strict") {
    const rules = intent.allow ?? [];
    const ok = rules.length > 0 && rules.some((rule) => matchesAllowRule(ctx, rule));
    if (!ok) {
      return {
        decision: "deny",
        error: "out_of_scope",
        reason: "Request outside declared at.intent.v1 allowlist (strict mode).",
      };
    }
  }

  return { decision: "allow" };
}
