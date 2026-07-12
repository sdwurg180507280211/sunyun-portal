import assert from "node:assert/strict";
import {existsSync, readFileSync} from "node:fs";
import {resolve} from "node:path";
import test from "node:test";
import {metadata} from "../app/privacy/page";
import {brand} from "../lib/brand";

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

test("privacy page enumerates every required and optional consultation field", () => {
  const source = readFileSync(resolve(root, "app/privacy/page.tsx"), "utf8");

  for (const field of [
    "咨询方向",
    "单位名称",
    "联系人",
    "联系电话",
    "业务场景与目标",
    "微信",
    "所在地区",
    "期望启动时间",
    "预期使用范围",
    "预算情况",
    "IP 地址",
    "User-Agent",
  ]) {
    assert.match(source, new RegExp(field));
  }
  assert.doesNotMatch(source, /及选填信息/);
});

test("privacy metadata overrides canonical and complete Open Graph values", () => {
  const title = `隐私说明｜${brand.shortName}`;
  const description = `${brand.legalName}商务咨询表单隐私说明`;

  assert.deepEqual(metadata.title, {absolute: title});
  assert.equal(metadata.description, description);
  assert.deepEqual(metadata.alternates, {canonical: "/privacy"});
  assert.deepEqual(metadata.openGraph, {
    type: "website",
    locale: "zh_CN",
    siteName: brand.shortName,
    title,
    description,
    url: "/privacy",
  });
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
  for (const utility of ["list-item", "min-h-11", "py-2.5", "leading-6"]) {
    assert.match(summary, new RegExp(`\\b${utility}\\b`));
  }
  assert.doesNotMatch(summary, /\b(?:flex|items-center)\b/);
});
