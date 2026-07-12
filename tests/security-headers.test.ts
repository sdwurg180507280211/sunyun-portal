import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import test from "node:test";
import nextConfig, {buildContentSecurityPolicy} from "../next.config";

const root = resolve(new URL("..", import.meta.url).pathname);

test("CSP permits React development tooling only in development", () => {
  const development = buildContentSecurityPolicy("development");

  assert.match(development, /script-src 'self' 'unsafe-inline' 'unsafe-eval'/);
  for (const nodeEnv of ["production", "test", undefined]) {
    assert.doesNotMatch(buildContentSecurityPolicy(nodeEnv), /'unsafe-eval'/);
  }
});

test("CSP preserves the portal's core security boundaries", () => {
  const policy = buildContentSecurityPolicy("production");

  for (const directive of [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "connect-src 'self'",
  ]) {
    assert.match(policy, new RegExp(directive.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("Next headers use the environment-aware CSP builder", async () => {
  assert.equal(typeof nextConfig.headers, "function");
  const rules = await nextConfig.headers!();
  const contentSecurityPolicy = rules
    .flatMap((rule) => rule.headers)
    .find((header) => header.key === "Content-Security-Policy");

  assert.equal(contentSecurityPolicy?.value, buildContentSecurityPolicy(process.env.NODE_ENV));
  const source = readFileSync(resolve(root, "next.config.ts"), "utf8");
  assert.match(source, /value:\s*buildContentSecurityPolicy\(process\.env\.NODE_ENV\)/);
});
