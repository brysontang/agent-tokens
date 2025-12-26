/**
 * Isomorphic Base64URL helpers (RFC 4648).
 * * - Node.js: Uses native Buffer (fast, safe).
 * - Browser: Uses TextEncoder/btoa with strict cleaning.
 * - Enforces strict alphabet (no padding, no whitespace).
 */

const STRICT_B64URL_REGEX = /^[A-Za-z0-9_-]+$/;

export function b64urlEncodeJson(obj: unknown): string {
  const json = JSON.stringify(obj);

  // 1. Node.js Path (Fastest)
  if (typeof Buffer !== "undefined") {
    return Buffer.from(json, "utf-8").toString("base64url");
  }

  // 2. Browser Path (Unicode Safe)
  const bytes = new TextEncoder().encode(json);
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }

  return btoa(bin)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function b64urlDecodeJson<T>(input: string): T {
  if (!input) throw new Error("Invalid format: empty token");

  // Strictness check: Fail fast on non-spec characters
  if (!STRICT_B64URL_REGEX.test(input)) {
    throw new Error("Invalid format: Must be strict Base64URL (no padding, no '+', no '/', no whitespace)");
  }

  // 1. Node.js Path
  if (typeof Buffer !== "undefined") {
    return JSON.parse(Buffer.from(input, "base64url").toString("utf-8"));
  }

  // 2. Browser Path
  let b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";

  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);

  const jsonStr = new TextDecoder().decode(bytes);
  return JSON.parse(jsonStr) as T;
}
