import type { AgentTokenEnvelopeV0 } from "../envelope";
import { AgentTokenError } from "../errors";
import { AT_INTENT_V1, isAtIntentV1, type AtIntentV1 } from "./intent";

/**
 * Typed accessors for known packages.
 */
export function getIntentV1(env: AgentTokenEnvelopeV0): AtIntentV1 | undefined {
  const pkg = env.pkgs[AT_INTENT_V1];
  if (pkg === undefined) return undefined;
  if (isAtIntentV1(pkg)) return pkg;

  // Prefer a specific error when the expiry field is the source of invalidity.
  if (pkg && typeof pkg === "object" && "exp" in (pkg as Record<string, unknown>)) {
    const exp = (pkg as Record<string, unknown>).exp;
    if (typeof exp !== "string" || Number.isNaN(Date.parse(exp))) {
      throw new AgentTokenError(
        "invalid_intent_expiry",
        "Invalid at.intent.v1 package: exp must be a valid ISO8601 timestamp."
      );
    }
  }

  throw new AgentTokenError(
    "invalid_intent_package",
    "Invalid at.intent.v1 package: payload does not match the expected schema."
  );
}
