import assert from "node:assert/strict";
import {existsSync, readFileSync} from "node:fs";
import {resolve} from "node:path";
import test from "node:test";

const root = resolve(new URL("..", import.meta.url).pathname);
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

test("scenario showcase is split into focused server components", () => {
  for (const file of [
    "components/marketing/scenario-dashboard.tsx",
    "components/marketing/scenario-ledger.tsx",
    "components/marketing/scenario-analysis.tsx",
    "components/marketing/scenario-showcase.tsx",
  ]) {
    assert.equal(existsSync(resolve(root, file)), true, `${file} should exist`);
  }
});

test("main dashboard exposes readable statuses and anonymous project names", () => {
  const source = read("components/marketing/scenario-dashboard.tsx");
  assert.match(source, /collaborationMetrics/);
  assert.match(source, /collaborationProjects/);
  assert.match(source, /collaborationFollowUp/);
  assert.match(source, /aria-label="药企业务协同平台模拟工作台"/);
  assert.doesNotMatch(source, /use client|useState|useEffect/);
});
