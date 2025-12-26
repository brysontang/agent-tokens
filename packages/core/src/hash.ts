/**
 * Simple prompt hashing helper (Node 18+).
 *
 * Not required by the spec — just convenient.
 */
import { createHash } from "node:crypto";

export function canonicalizePrompt(prompt: string): string {
  // Basic normalization: trim + collapse whitespace.
  return prompt.trim().replace(/\s+/g, " ");
}

export function sha256Hex(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

export function sha256PromptHash(prompt: string): string {
  const canon = canonicalizePrompt(prompt);
  return `sha256:${sha256Hex(canon)}`;
}
