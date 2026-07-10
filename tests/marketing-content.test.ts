import assert from "node:assert/strict";
import test from "node:test";
import {
  audiences,
  deliverables,
  deliverySteps,
  navigation,
  scenarios,
  solutions,
  trustPrinciples,
} from "../components/marketing/content";

test("marketing content exposes the approved information architecture", () => {
  assert.equal(navigation.length, 5);
  assert.deepEqual(deliverables, ["需求蓝图", "产品原型", "权限矩阵", "接口清单", "验收清单"]);
  assert.deepEqual(audiences.map((item) => item.title), ["药品生产企业", "医疗机构", "医药商业公司"]);
  assert.equal(solutions.length, 4);
  assert.equal(deliverySteps.length, 4);
  assert.equal(scenarios.length, 3);
  assert.equal(trustPrinciples.length, 4);
  assert.match(solutions.find((item) => item.title === "AI 工作流工具")?.description || "", /人工复核/);
});

test("marketing content excludes unverified or patient-facing claims", () => {
  const copy = JSON.stringify({audiences, deliverables, deliverySteps, scenarios, solutions, trustPrinciples});
  assert.doesNotMatch(copy, /榫合云|行业领先|全面合规|精准诊断|提升疗效|三甲医院|\d+%/);
});
