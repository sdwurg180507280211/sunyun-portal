import assert from "node:assert/strict";
import test from "node:test";
import {
  audiences,
  deliverables,
  deliverySteps,
  navigation,
  scenarioDisclaimer,
  scenarios,
  solutions,
  trustPrinciples,
} from "../components/marketing/content";
import {
  collaborationMetrics,
  collaborationProjects,
  commerceAnalysis,
  operationsLedger,
} from "../components/marketing/scenario-content";

test("marketing content exposes the approved information architecture", () => {
  assert.equal(navigation.length, 5);
  assert.deepEqual(deliverables, ["需求蓝图", "产品原型", "权限矩阵", "接口清单", "验收清单"]);
  assert.deepEqual(audiences.map((item) => item.title), ["药品生产企业", "医疗机构", "医药商业公司"]);
  assert.equal(solutions.length, 4);
  assert.equal(deliverySteps.length, 4);
  assert.deepEqual(scenarios.map((item) => item.title), [
    "药企业务协同平台",
    "医疗机构运营台账",
    "医药商业经营分析",
  ]);
  assert.equal(trustPrinciples.length, 4);
  assert.match(solutions.find((item) => item.title === "AI 工作流工具")?.description || "", /人工复核/);
});

test("scenario showcase data is useful but anonymous", () => {
  assert.equal(
    scenarioDisclaimer,
    "以下内容为基于行业常见业务流程构建的场景示意，不代表特定客户项目或效果承诺。",
  );
  assert.equal(collaborationMetrics.length, 3);
  assert.equal(collaborationProjects.length, 3);
  assert.equal(operationsLedger.length, 3);
  assert.equal(commerceAnalysis.channels.length, 3);
  assert.match(JSON.stringify(collaborationProjects), /项目 A/);
  assert.match(JSON.stringify(operationsLedger), /运营事项/);
});

test("marketing content excludes unverified or patient-facing claims", () => {
  const copy = JSON.stringify({
    audiences,
    collaborationMetrics,
    collaborationProjects,
    commerceAnalysis,
    deliverables,
    deliverySteps,
    operationsLedger,
    scenarioDisclaimer,
    scenarios,
    solutions,
    trustPrinciples,
  });
  assert.doesNotMatch(
    copy,
    /榫合云|行业领先|全面合规|精准诊断|提升疗效|三甲医院|患者|受试者|病历|处方|药品名称|客户 Logo|\d+%/,
  );
});
