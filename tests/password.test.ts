import assert from "node:assert/strict";
import test from "node:test";
import {hashPassword, verifyPassword} from "../lib/auth/password";

test("password hashes verify only the original password", () => {
  const encoded = hashPassword("A-strong-admin-password-2026", "00112233445566778899aabbccddeeff");
  assert.equal(verifyPassword("A-strong-admin-password-2026", encoded), true);
  assert.equal(verifyPassword("wrong-password", encoded), false);
});
