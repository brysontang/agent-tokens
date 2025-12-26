export const AT_INTENT_V1 = "at.intent.v1" as const;

export type IntentMode = "strict" | "advisory";

export type IntentAllowRule = {
  /**
   * Optional origin constraint, e.g. "https://api.weather.gov".
   * If omitted, the rule matches any origin.
   */
  origin?: string;

  /**
   * Optional allowed HTTP methods, e.g. ["GET"].
   * If omitted, any method is allowed.
   */
  methods?: string[];

  /**
   * Optional allowed path prefix, e.g. "/v1/".
   * If omitted, any path is allowed.
   */
  pathPrefix?: string;
};

export type AtIntentV1 = {
  mode: IntentMode;
  intentId: string;

  /**
   * Optional high-level goal summary (avoid raw prompts).
   */
  goal?: string;

  /**
   * Optional hash of a canonicalized user prompt, e.g. "sha256:<hex>".
   * Useful for audit trails without leaking the prompt text.
   */
  promptHash?: string;

  /**
   * Optional allowlist of request patterns.
   * In `strict` mode, origins typically deny/challenge if the request doesn't match.
   */
  allow?: IntentAllowRule[];

  /**
   * Optional ISO8601 expiry.
   */
  exp?: string;
};

function isString(x: unknown): x is string {
  return typeof x === "string";
}

function isStringArray(x: unknown): x is string[] {
  return Array.isArray(x) && x.every(isString);
}

function isAllowRule(x: unknown): x is IntentAllowRule {
  if (!x || typeof x !== "object") return false;
  const r = x as Record<string, unknown>;
  if (r.origin !== undefined && !isString(r.origin)) return false;
  if (r.methods !== undefined && !isStringArray(r.methods)) return false;
  if (r.pathPrefix !== undefined && !isString(r.pathPrefix)) return false;
  return true;
}

export function isAtIntentV1(x: unknown): x is AtIntentV1 {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;

  if (o.mode !== "strict" && o.mode !== "advisory") return false;
  if (!isString(o.intentId) || o.intentId.length === 0) return false;

  if (o.goal !== undefined && !isString(o.goal)) return false;
  if (o.promptHash !== undefined && !isString(o.promptHash)) return false;
  if (o.allow !== undefined) {
    if (!Array.isArray(o.allow) || !o.allow.every(isAllowRule)) return false;
  }
  if (o.exp !== undefined) {
    if (!isString(o.exp)) return false;
    // Basic parseability check (ISO8601 recommended in spec).
    if (Number.isNaN(Date.parse(o.exp))) return false;
  }

  return true;
}
