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
