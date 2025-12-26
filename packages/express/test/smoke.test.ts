import { describe, it, expect } from "vitest";

describe("express package smoke", () => {
  it("loads", async () => {
    const mod = await import("../src/index");
    expect(typeof mod.agentTokens).toBe("function");
  });
});
