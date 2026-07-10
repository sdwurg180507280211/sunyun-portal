import assert from "node:assert/strict";
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import test, {after} from "node:test";

const directory = mkdtempSync(join(tmpdir(), "sunyun-database-test-"));
const databasePath = join(directory, "sunyun.db");
const legacyPath = join(directory, "leads.jsonl");

writeFileSync(
  legacyPath,
  `${JSON.stringify({
    id: "SY-LEGACY-001",
    createdAt: "2026-07-01T00:00:00.000Z",
    serviceType: "旧版软件项目",
    companyName: "历史客户",
    contactName: "历史联系人",
    phone: "13800138000",
    eventDate: "两个月内",
    attendees: "30人",
    description: "这是从旧版 JSONL 迁移的测试线索。",
  })}\n`,
  "utf8",
);

process.env.DATABASE_PATH = databasePath;
process.env.LEGACY_LEADS_PATH = legacyPath;

const repository = await import("../lib/db/lead-repository");
const {getDatabase} = await import("../lib/db/database");
const {parseLeadInput} = await import("../lib/validation/lead");

after(() => {
  getDatabase().close();
  rmSync(directory, {recursive: true, force: true});
});

test("legacy JSONL is imported once into SQLite", () => {
  assert.equal(repository.databaseHealth(), true);
  const first = repository.listLeads({limit: 20});
  assert.equal(first.total, 1);
  assert.equal(first.leads[0]?.id, "SY-LEGACY-001");
  assert.equal(first.leads[0]?.expectedDate, "两个月内");
  assert.equal(first.leads[0]?.scale, "30人");

  const migration = getDatabase()
    .prepare("SELECT value FROM app_meta WHERE key = ?")
    .get("legacy-jsonl-imported-v1") as {value: string};
  assert.equal(JSON.parse(migration.value).imported, 1);
  assert.match(readFileSync(legacyPath, "utf8"), /SY-LEGACY-001/);
});

test("new lead can be created, searched, and moved through status", () => {
  const parsed = parseLeadInput({
    serviceType: "软件定制开发",
    companyName: "新客户",
    contactName: "赵先生",
    phone: "13900139000",
    description: "需要开发一个项目进度与经营数据统计系统。",
    source: "test-suite",
    consent: true,
  });
  assert.equal(parsed.success, true);
  if (!parsed.success) return;

  const lead = repository.createLead(parsed.data, {ip: "127.0.0.1", userAgent: "node-test"});
  const result = repository.listLeads({query: "新客户", limit: 20});
  assert.equal(result.total, 1);
  assert.equal(result.leads[0]?.id, lead.id);

  assert.equal(repository.updateLeadStatus(lead.id, "contacted", "test-admin"), true);
  const updated = repository.listLeads({status: "contacted", limit: 20});
  assert.equal(updated.total, 1);
  assert.equal(updated.leads[0]?.status, "contacted");

  const audit = getDatabase()
    .prepare("SELECT actor, action, entity_id FROM audit_logs WHERE entity_id = ?")
    .get(lead.id) as {actor: string; action: string; entity_id: string};
  assert.deepEqual(audit, {
    actor: "test-admin",
    action: "lead.status.updated",
    entity_id: lead.id,
  });
});
