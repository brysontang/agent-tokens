import { AgentTokenError } from "./errors";
import type { AgentTokenEnvelopeV0 } from "./envelope";
import { b64urlDecodeJson, b64urlEncodeJson } from "./b64url";

export function encodeAgentTokenV0(env: AgentTokenEnvelopeV0): string {
  return b64urlEncodeJson(env);
}

export function decodeAgentTokenV0(token: string): AgentTokenEnvelopeV0 {
  // 1. Guardrail: Max Size (8KB is typical header limit, allowing 16KB for safety)
  if (token.length > 16384) {
    throw new AgentTokenError("invalid_token", "Agent-Token exceeds maximum allowed size (16KB).");
  }

  let obj: unknown;
  try {
    obj = b64urlDecodeJson<unknown>(token);
  } catch (e: any) {
    // Base64url decode or JSON parse failed.
    throw new AgentTokenError(
      "invalid_token",
      `Agent-Token is not valid base64url-encoded JSON: ${e.message}`
    );
  }
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
    throw new AgentTokenError("invalid_token", "Agent-Token must decode to a JSON object.");
  }
  const o = obj as Record<string, unknown>;
  if (typeof o.v !== "number") {
    throw new AgentTokenError("invalid_token", "Agent-Token missing numeric version.");
  }
  if (o.v !== 0) {
    throw new AgentTokenError("unsupported_version", "Unsupported Agent-Token version.");
  }
  if (!o.pkgs || typeof o.pkgs !== "object" || Array.isArray(o.pkgs)) {
    throw new AgentTokenError("invalid_token", "Agent-Token missing pkgs object.");
  }
  return { v: 0, pkgs: o.pkgs as Record<string, unknown> };
}
