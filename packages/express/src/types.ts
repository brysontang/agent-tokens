import type { Request } from "express";
import type { AgentTokenEnvelopeV0, AtIntentV1 } from "@agent-tokens/core";

export type AgentPolicyDecision = "allow" | "deny" | "challenge";

export type AgentPolicyResult = {
  decision: AgentPolicyDecision;
  /**
   * Optional human/machine-readable reason for logs.
   */
  reason?: string;
  /**
   * Optional machine-readable error code for deny/challenge.
   * Recommended to align with the core/spec vocabulary (e.g. "out_of_scope", "token_expired").
   */
  error?: string;
  /**
   * Optional HTTP status override.
   * - deny defaults to 403
   * - challenge defaults to 428
   */
  status?: number;
};

export type AgentPolicyContext = {
  req: Request;
  token: AgentTokenEnvelopeV0;
  intent?: AtIntentV1;
};

export type AgentPolicyFn = (ctx: AgentPolicyContext) => AgentPolicyResult | Promise<AgentPolicyResult>;

export type AgentTokensMiddlewareOptions = {
  /**
   * Header name for the Agent Token. Defaults to "agent-token" (lowercased).
   */
  headerName?: string;

  /**
   * If true, deny requests missing Agent-Token.
   */
  required?: boolean;

  /**
   * If true, require a valid at.intent.v1 package.
   */
  requireIntent?: boolean;

  /**
   * If set to "strict", enforce allow rules when intent.mode === "strict".
   */
  enforceIntentScope?: "none" | "strict";

  /**
   * Optional policy hook. This is where you can plug in a rules engine or an LLM "judge".
   */
  policy?: AgentPolicyFn;
};
