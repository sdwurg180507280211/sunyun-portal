import assert from "node:assert/strict";
import {existsSync, readFileSync} from "node:fs";
import {resolve} from "node:path";
import test from "node:test";

const root = resolve(new URL("..", import.meta.url).pathname);

test("privacy page discloses technical data, retention, and sensitive-data limits", () => {
  const path = resolve(root, "app/privacy/page.tsx");
  assert.equal(existsSync(path), true);
  const source = readFileSync(path, "utf8");
  assert.match(source, /IP 地址/);
  assert.match(source, /User-Agent/);
  assert.match(source, /12 个月/);
  assert.match(source, /病历|处方/);
  assert.match(source, /隐私与个人信息/);
});

test("lead form links privacy notice and warns against sensitive submissions", () => {
  const source = readFileSync(resolve(root, "components/lead-form/lead-form.tsx"), "utf8");
  assert.match(source, /href="\/privacy"/);
  assert.match(source, /患者、受试者、病历、处方/);
  assert.match(source, /brand\.consultationSource/);
});

test("lead form controls meet touch-target and dark-surface contrast contracts", () => {
  const source = readFileSync(resolve(root, "components/lead-form/lead-form.tsx"), "utf8");
  const inputs = source.match(/<Input\b[^>]*\/>/g) ?? [];
  const labels = source.match(/<Label\b[^>]*>/g) ?? [];
  const submitButton = source.match(/<Button\b[^>]*type="submit"[^>]*>/)?.[0] ?? "";
  const summary = source.match(/<summary\b[^>]*>/)?.[0] ?? "";

  assert.equal(inputs.length, 8);
  for (const input of inputs) assert.match(input, /className="[^"]*\bmin-h-11\b[^"]*"/);

  assert.equal(labels.length, 9);
  for (const label of labels) assert.match(label, /className="[^"]*\btext-slate-200\b[^"]*"/);

  for (const utility of ["min-h-11"]) assert.match(submitButton, new RegExp(`\\b${utility}\\b`));
  for (const utility of ["min-h-11", "flex", "items-center"]) {
    assert.match(summary, new RegExp(`\\b${utility}\\b`));
  }
});
