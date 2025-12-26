export type AgentTokenVersion = 0;

/**
 * Agent Tokens v0 envelope.
 *
 * Keep this kernel tiny:
 * - v
 * - pkgs
 */
export type AgentTokenEnvelopeV0 = {
  v: 0;
  pkgs: Record<string, unknown>;
};

export type AgentTokenEnvelope = AgentTokenEnvelopeV0;
