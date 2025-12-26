import type { Request } from "express";
import { evaluateAtIntentV1, type AtIntentV1 } from "@agent-tokens/core";
import type { AgentPolicyResult } from "./types";

function requestOrigin(req: Request): string {
  // Note: behind proxies, configure `app.set("trust proxy", true)` if you want X-Forwarded-* honored.
  const proto = req.protocol || "http";
  const host = req.get("host") || "";
  return `${proto}://${host}`;
}

/**
 * Default enforcement policy for `at.intent.v1` in Express:
 * - Applies the framework-agnostic `evaluateAtIntentV1` semantics.
 * - If the evaluation returns allow → return null
 * - If deny/challenge → return a policy result that the middleware can enforce
 */
export function enforceIntentPolicy(req: Request, intent: AtIntentV1): AgentPolicyResult | null {
  const out = evaluateAtIntentV1(
    { method: req.method, path: req.path, origin: requestOrigin(req) },
    intent
  );

  if (out.decision === "allow") return null;

  // Map decision to HTTP-ish results.
  if (out.decision === "challenge") {
    return {
      decision: "challenge",
      status: 428,
      error: "agent_policy_challenge",
      reason: out.reason ?? "Agent policy challenge.",
    };
  }

  // deny
  return {
    decision: "deny",
    status: out.error === "token_expired" ? 401 : 403,
    error: out.error ?? "agent_policy_denied",
    reason: out.reason ?? "Agent policy denied.",
  };
}
