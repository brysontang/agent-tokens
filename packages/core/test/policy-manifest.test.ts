import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

type Manifest = {
  format: number;
  suite: string;
  package?: string;
  vectors: Array<{
    id: string;
    file: string;
    purpose?: string;
    expect_result: "allow" | "deny" | "challenge";
  }>;
};

describe("Agent Tokens v0 — policy manifest", () => {
  const policyDir = path.resolve(process.cwd(), "../../spec/test-vectors/v0/policy");
  const manifestPath = path.join(policyDir, "manifest.json");

  it("manifest.json exists", () => {
    expect(fs.existsSync(manifestPath)).toBe(true);
  });

  it("manifest lists all policy vectors (excluding itself)", () => {
    const raw = fs.readFileSync(manifestPath, "utf8");
    const manifest = JSON.parse(raw) as Manifest;

    expect(manifest.format).toBe(1);
    expect(typeof manifest.suite).toBe("string");
    expect(Array.isArray(manifest.vectors)).toBe(true);

    const actualFiles = fs
      .readdirSync(policyDir)
      .filter((f) => f.endsWith(".json") && f !== "manifest.json")
      .sort((a, b) => a.localeCompare(b));

    const manifestFiles = manifest.vectors.map((v) => v.file).sort((a, b) => a.localeCompare(b));

    expect(manifestFiles).toEqual(actualFiles);

    // Spot-check that each manifest entry matches the file's declared id/expect_result
    for (const v of manifest.vectors) {
      const full = path.join(policyDir, v.file);
      const vecRaw = fs.readFileSync(full, "utf8");
      const vec = JSON.parse(vecRaw) as { id: string; expect_result: string };
      expect(vec.id).toBe(v.id);
      expect(vec.expect_result).toBe(v.expect_result);
    }
  });
});
