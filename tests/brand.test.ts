import assert from "node:assert/strict";
import test from "node:test";
import {brand, leadCopy} from "../lib/brand";

test("public brand contract uses the approved Yunyihui identity", () => {
  assert.equal(brand.legalName, "北京云医荟科技有限公司");
  assert.equal(brand.shortName, "云医荟科技");
  assert.equal(brand.englishName, "YUNYIHUI TECHNOLOGY");
  assert.equal(brand.tagline, "让医药数字化，落到真实业务里。");
  assert.equal(brand.serviceId, "yunyihui-portal");
  assert.equal(brand.consultationSource, "homepage-pharma-prism");
  assert.match(brand.description, /药企、医疗机构与医药商业公司/);
  assert.match(brand.disclaimer, /不提供个人医疗咨询、诊断、治疗或用药建议/);
});

test("lead response copy stays within business-consultation scope", () => {
  assert.equal(leadCopy.accepted, "已收到您的咨询");
  assert.match(leadCopy.nextStep, /沟通业务场景和项目范围/);
  assert.doesNotMatch(JSON.stringify(leadCopy), /精准诊断|疗效|保证成交/);
});
