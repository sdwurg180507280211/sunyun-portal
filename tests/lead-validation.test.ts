import assert from "node:assert/strict";
import test from "node:test";
import {parseLeadInput} from "../lib/validation/lead";

test("lead validation accepts a complete request", () => {
  const result = parseLeadInput({serviceType: "软件定制开发", contactName: "赵先生", phone: "13800138000", description: "需要开发一个客户项目管理和统计系统。", consent: true});
  assert.equal(result.success, true);
});

test("lead validation rejects invalid phone and short description", () => {
  const result = parseLeadInput({serviceType: "软件定制开发", contactName: "赵先生", phone: "abc", description: "太短", consent: true});
  assert.equal(result.success, false);
});
