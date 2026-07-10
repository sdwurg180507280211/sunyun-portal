import {randomBytes, scryptSync, timingSafeEqual} from "node:crypto";

const PREFIX = "scrypt";
const KEY_LENGTH = 64;

export function hashPassword(password: string, salt = randomBytes(16).toString("hex")): string {
  if (password.length < 12) {
    throw new Error("Administrator password must contain at least 12 characters");
  }
  const digest = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${PREFIX}:${salt}:${digest}`;
}

export function verifyPassword(password: string, encoded: string): boolean {
  const [prefix, salt, expectedHex] = encoded.split(":");
  if (prefix !== PREFIX || !salt || !expectedHex) return false;

  try {
    const actual = scryptSync(password, salt, KEY_LENGTH);
    const expected = Buffer.from(expectedHex, "hex");
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
