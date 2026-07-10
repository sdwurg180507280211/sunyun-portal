import assert from "node:assert/strict";
import test from "node:test";
import {createSessionToken, verifySessionToken} from "../lib/auth/session";

const secret = "0123456789abcdef0123456789abcdef";

test("session token is signed and readable", () => {
  const token = createSessionToken("admin", secret, 60);
  assert.equal(verifySessionToken(token, secret)?.username, "admin");
  assert.equal(verifySessionToken(`${token}tampered`, secret), null);
});
