import assert from "node:assert/strict";
import test from "node:test";
import {parseLeadInput} from "../lib/validation/lead";

const completeLead = {
  serviceType: "医药业务系统",
  companyName: "示例药企",
  contactName: "赵先生",
  phone: "13800138000",
  description: "希望梳理客户协同流程并建设可持续迭代的业务系统。",
  consent: true,
};

test("lead validation accepts an institutional pharma inquiry", () => {
  assert.equal(parseLeadInput(completeLead).success, true);
});

test("lead validation requires an organization name", () => {
  assert.equal(parseLeadInput({...completeLead, companyName: "   "}).success, false);
  const {companyName: _companyName, ...withoutCompanyName} = completeLead;
  assert.equal(parseLeadInput(withoutCompanyName).success, false);
});

test("lead validation rejects invalid phone and short description", () => {
  assert.equal(parseLeadInput({...completeLead, phone: "abc", description: "太短"}).success, false);
});

test("privacy inquiry is accepted without collecting medical data", () => {
  const result = parseLeadInput({
    ...completeLead,
    serviceType: "隐私与个人信息",
    source: "homepage-pharma-prism",
    patientName: "不应进入线索数据",
    prescription: "不应进入线索数据",
  });
  assert.equal(result.success, true);
  if (!result.success) return;
  assert.equal("patientName" in result.data, false);
  assert.equal("prescription" in result.data, false);
  assert.equal(result.data.source, "homepage-pharma-prism");
});

test("lead validation preserves existing limits and requires consent", () => {
  assert.equal(parseLeadInput({...completeLead, description: "医".repeat(1201)}).success, false);
  assert.equal(parseLeadInput({...completeLead, wechat: "x".repeat(61)}).success, false);
  const {consent: _consent, ...withoutConsent} = completeLead;
  assert.equal(parseLeadInput(withoutConsent).success, false);
});
