import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

import { decodeAgentTokenV0 } from "../src/codec";
import { getIntentV1 } from "../src/packages/registry";
import { evaluateAtIntentV1, type AgentRequestContext } from "../src/policy/intent";

type PolicyVector = {
  id: string;
  desc?: string;
  token: string;
  context: AgentRequestContext;
  expect_result: "allow" | "deny" | "challenge";
  expect_error?: string;
};

function loadJsonFiles<T>(dir: string): T[] {
  if (!fs.existsSync(dir)) return [];
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json") && f !== "manifest.json")
    .sort((a, b) => a.localeCompare(b));

  return files.map((file) => {
    const full = path.join(dir, file);
    const raw = fs.readFileSync(full, "utf8");
    try {
      return JSON.parse(raw) as T;
    } catch (e) {
      throw new Error(`Failed to parse JSON test vector ${full}: ${String(e)}`);
    }
  });
}

describe("Agent Tokens v0 — policy test vectors", () => {
  const vectorsRoot = path.resolve(process.cwd(), "../../spec/test-vectors/v0");
  const policyDir = path.join(vectorsRoot, "policy");

  const vectors = loadJsonFiles<PolicyVector>(policyDir);

  it("has at least one policy vector", () => {
    expect(vectors.length).toBeGreaterThan(0);
  });

  // Use a deterministic 'now' so tests don't become time bombs.
  const NOW = new Date("2026-01-01T00:00:00Z");

  for (const v of vectors) {
    it(`evaluates policy vector: ${v.id}`, () => {
      const decoded = decodeAgentTokenV0(v.token);
      const intent = getIntentV1(decoded);
      expect(intent, "policy vectors require at.intent.v1").toBeTruthy();

      const out = evaluateAtIntentV1(v.context, intent!, NOW);
      expect(out.decision).toBe(v.expect_result);
      if (v.expect_error) {
        expect(out.error).toBe(v.expect_error);
      } else {
        expect(out.error).toBeUndefined();
      }
    });
  }
});
