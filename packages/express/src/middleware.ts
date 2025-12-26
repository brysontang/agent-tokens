import type { RequestHandler } from "express";
import { AgentTokenError, decodeAgentTokenV0, getIntentV1 } from "@agent-tokens/core";
import type { AgentTokensMiddlewareOptions } from "./types";
import { enforceIntentPolicy } from "./policy";

/**
 * Express middleware that:
 * - parses Agent-Token header
 * - optionally parses at.intent.v1
 * - optionally enforces strict intent allowlists
 * - optionally calls a policy function (rules engine or LLM judge)
 */
export function agentTokens(options: AgentTokensMiddlewareOptions = {}): RequestHandler {
  const headerName = (options.headerName ?? "agent-token").toLowerCase();
  const required = options.required ?? false;
  const requireIntent = options.requireIntent ?? false;
  const enforceScope = options.enforceIntentScope ?? "none";

  return async (req, res, next) => {
    const raw = req.headers[headerName];

    // Security Hardening: Reject ambiguity
    if (Array.isArray(raw)) {
      return res.status(400).json({
        error: "invalid_request",
        message: "Multiple Agent-Token headers are not allowed.",
      });
    }

    const tokenStr = raw;

    if (!tokenStr) {
      if (required) {
        return res.status(401).json({ error: "missing_agent_token" });
      }
      return next();
    }

    try {
      const token = decodeAgentTokenV0(String(tokenStr));
      const intent = getIntentV1(token);

      if (requireIntent && !intent) {
        return res.status(400).json({ error: "missing_intent_package", pkg: "at.intent.v1" });
      }

      // Always enforce intent expiry (if present) before doing anything else.
      // This is independent of allowlist enforcement because expiry is a basic
      // freshness / tracking risk control.
      if (intent?.exp) {
        const t = Date.parse(intent.exp);
        // Hardening: Fail if invalid OR expired
        if (Number.isNaN(t)) {
          return res.status(400).json({ error: "invalid_intent_expiry", pkg: "at.intent.v1" });
        }
        if (Date.now() > t) {
          return res.status(401).json({ error: "token_expired", pkg: "at.intent.v1" });
        }
      }

      // Built-in strict allowlist enforcement.
      if (enforceScope === "strict" && intent) {
        const enforced = enforceIntentPolicy(req, intent);
        if (enforced) {
          const status = enforced.status ?? (enforced.decision === "challenge" ? 428 : 403);
          return res.status(status).json({ error: enforced.error ?? "agent_policy_denied", reason: enforced.reason });
        }
      }

      // Optional policy hook (can be an LLM "judge").
      if (options.policy) {
        const out = await options.policy({ req, token, intent: intent ?? undefined });
        if (out.decision === "deny") {
          return res.status(out.status ?? 403).json({ error: out.error ?? "agent_policy_denied", reason: out.reason });
        }
        if (out.decision === "challenge") {
          // 428 Precondition Required is a reasonable default for "need more confirmation".
          return res
            .status(out.status ?? 428)
            .json({ error: out.error ?? "agent_policy_challenge", reason: out.reason });
        }
      }

      // Attach for downstream handlers (untyped property; consumers can cast req as needed).
      (req as any).agentToken = token;
      (req as any).agentIntent = intent ?? undefined;

      return next();
    } catch (err) {
      if (err instanceof AgentTokenError) {
        return res.status(400).json({ error: err.code, message: err.message });
      }
      return res.status(400).json({ error: "invalid_token" });
    }
  };
}
