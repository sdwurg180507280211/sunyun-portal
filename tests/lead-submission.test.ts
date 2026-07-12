import assert from "node:assert/strict";
import {existsSync} from "node:fs";
import {resolve} from "node:path";
import {pathToFileURL} from "node:url";
import test from "node:test";

type Requester = (url: string, init: RequestInit) => Promise<Response>;
type SubmitLead = (
  payload: Record<string, FormDataEntryValue>,
  request?: Requester,
) => Promise<{type: "success" | "error"; message: string}>;

async function getSubmitLead(): Promise<SubmitLead> {
  const path = resolve(new URL("..", import.meta.url).pathname, "components/lead-form/submit-lead.ts");
  assert.equal(existsSync(path), true, "submit-lead adapter should exist");
  const module = (await import(pathToFileURL(path).href)) as {submitLead?: SubmitLead};
  assert.equal(typeof module.submitLead, "function", "adapter should export submitLead");
  return module.submitLead as SubmitLead;
}

const jsonResponse = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {"content-type": "application/json"},
  });

test("submitLead formats the successful business enquiry", async () => {
  const submitLead = await getSubmitLead();
  const result = await submitLead(
    {companyName: "示例药企"},
    async () => jsonResponse({
      ok: true,
      id: "SY-20260710-ABC123",
      message: "已收到您的咨询",
      nextStep: "我们将根据您留下的联系方式，与您沟通业务场景和项目范围",
    }, 201),
  );
  assert.deepEqual(result, {
    type: "success",
    message: "已收到您的咨询（编号 SY-20260710-ABC123）。我们将根据您留下的联系方式，与您沟通业务场景和项目范围",
  });
});

test("submitLead preserves a Chinese API error", async () => {
  const submitLead = await getSubmitLead();
  const result = await submitLead({}, async () =>
    jsonResponse({ok: false, message: "提交过于频繁，请稍后再试"}, 429));
  assert.deepEqual(result, {type: "error", message: "提交过于频繁，请稍后再试"});
});

test("submitLead falls back for non-JSON and network failures", async () => {
  const submitLead = await getSubmitLead();
  const nonJson = await submitLead({}, async () =>
    new Response("<html>proxy error</html>", {status: 502}));
  assert.deepEqual(nonJson, {type: "error", message: "暂时无法提交，请稍后重试或检查网络连接。"});
  const offline = await submitLead({}, async () => {
    throw new TypeError("fetch failed");
  });
  assert.deepEqual(offline, {type: "error", message: "暂时无法提交，请稍后重试或检查网络连接。"});
});
