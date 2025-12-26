import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { decodeAgentTokenV0 } from "../src/codec";
import { AgentTokenError } from "../src/errors";

type ValidVector = {
  id: string;
  desc?: string;
  token: string;
  expect: { v: 0; pkgs: Record<string, unknown> };
};

type InvalidVector = {
  id: string;
  desc?: string;
  token: string;
  error: string;
};

function loadJsonFiles<T>(dir: string): T[] {
  if (!fs.existsSync(dir)) return [];
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
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

describe("Agent Tokens v0 — spec test vectors", () => {
  const vectorsRoot = path.resolve(process.cwd(), "../../spec/test-vectors/v0");
  const validDir = path.join(vectorsRoot, "valid");
  const invalidDir = path.join(vectorsRoot, "invalid");

  const valid = loadJsonFiles<ValidVector>(validDir);
  const invalid = loadJsonFiles<InvalidVector>(invalidDir);

  it("has at least one valid and one invalid vector", () => {
    expect(valid.length).toBeGreaterThan(0);
    expect(invalid.length).toBeGreaterThan(0);
  });

  for (const v of valid) {
    it(`decodes valid vector: ${v.id}`, () => {
      const decoded = decodeAgentTokenV0(v.token);
      expect(decoded).toMatchObject(v.expect);
    });
  }

  for (const v of invalid) {
    it(`rejects invalid vector: ${v.id}`, () => {
      try {
        decodeAgentTokenV0(v.token);
        // If decode didn't throw, this is a failure.
        expect(false).toBe(true);
      } catch (e) {
        expect(e).toBeInstanceOf(AgentTokenError);
        const err = e as AgentTokenError;
        expect(err.code).toBe(v.error);
      }
    });
  }
});
