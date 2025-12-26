import { describe, it, expect } from "vitest";
import { decodeAgentTokenV0, encodeAgentTokenV0 } from "../src/codec";
import { AT_INTENT_V1, isAtIntentV1 } from "../src/packages/intent";

describe("Agent Tokens core", () => {
  it("round-trips encode/decode", () => {
    const token = encodeAgentTokenV0({ v: 0, pkgs: { hello: { a: 1 } } });
    const env = decodeAgentTokenV0(token);
    expect(env.v).toBe(0);
    expect((env.pkgs as any).hello.a).toBe(1);
  });

  it("validates at.intent.v1 shape", () => {
    const intent = {
      mode: "strict",
      intentId: "01J0Z7G7E5M7H8Q7",
      goal: "Get weather",
      allow: [{ origin: "https://api.weather.gov", methods: ["GET"], pathPrefix: "/" }],
    };
    expect(isAtIntentV1(intent)).toBe(true);

    const bad = { mode: "strict", intentId: 123 };
    expect(isAtIntentV1(bad)).toBe(false);
  });

  it("can embed at.intent.v1 in pkgs", () => {
    const env = {
      v: 0 as const,
      pkgs: { [AT_INTENT_V1]: { mode: "advisory", intentId: "abcdabcd" } },
    };
    const token = encodeAgentTokenV0(env);
    const decoded = decodeAgentTokenV0(token);
    expect(decoded.pkgs[AT_INTENT_V1]).toBeTruthy();
  });
});
