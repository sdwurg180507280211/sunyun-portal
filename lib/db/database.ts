import Database from "better-sqlite3";
import {existsSync, mkdirSync, readFileSync} from "node:fs";
import {dirname} from "node:path";
import {env} from "@/lib/config/env";

const globalForDatabase = globalThis as unknown as {sunyunDatabase?: Database.Database};

function createDatabase() {
  mkdirSync(dirname(env.databasePath), {recursive: true});
  const database = new Database(env.databasePath);
  database.pragma("journal_mode = WAL");
  database.pragma("foreign_keys = ON");
  database.pragma("busy_timeout = 5000");
  database.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      service_type TEXT NOT NULL,
      company_name TEXT NOT NULL DEFAULT '',
      contact_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      wechat TEXT NOT NULL DEFAULT '',
      city TEXT NOT NULL DEFAULT '',
      expected_date TEXT NOT NULL DEFAULT '',
      scale TEXT NOT NULL DEFAULT '',
      budget TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'homepage',
      user_agent TEXT NOT NULL DEFAULT '',
      ip TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'contacted', 'qualified', 'won', 'closed')),
      assigned_to TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
    CREATE INDEX IF NOT EXISTS idx_leads_service_type ON leads(service_type);

    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL,
      actor TEXT NOT NULL,
      action TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      details TEXT NOT NULL DEFAULT '{}'
    );
  `);

  const migrationKey = "legacy-jsonl-imported-v1";
  const migrated = database.prepare("SELECT value FROM app_meta WHERE key = ?").get(migrationKey) as {value: string} | undefined;
  if (!migrated && existsSync(env.legacyLeadsPath)) {
    const lines = readFileSync(env.legacyLeadsPath, "utf8").split("\n").filter(Boolean);
    const insert = database.prepare(`
      INSERT OR IGNORE INTO leads (
        id, created_at, service_type, company_name, contact_name, phone, wechat, city,
        expected_date, scale, budget, description, source, user_agent, ip, status, assigned_to, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', ?)
    `);
    const migrate = database.transaction(() => {
      let imported = 0;
      for (const line of lines) {
        const raw = JSON.parse(line) as Record<string, string>;
        const now = new Date().toISOString();
        const createdAt = raw.createdAt || now;
        const id = raw.id || `LEGACY-${Buffer.from(line).toString("hex").slice(0, 20).toUpperCase()}`;
        const result = insert.run(
          id, createdAt, raw.serviceType || "未分类", raw.companyName || "", raw.contactName || "未填写",
          raw.phone || "未知", raw.wechat || "", raw.city || "", raw.expectedDate || raw.eventDate || "",
          raw.scale || raw.attendees || "", raw.budget || "", raw.description || "旧版线索导入",
          raw.source || "legacy-jsonl", raw.userAgent || "", raw.ip || "", raw.status || "new", createdAt,
        );
        imported += result.changes;
      }
      database.prepare("INSERT OR REPLACE INTO app_meta (key, value) VALUES (?, ?)").run(
        migrationKey,
        JSON.stringify({completedAt: new Date().toISOString(), sourceLines: lines.length, imported}),
      );
      return imported;
    });
    try {
      const imported = migrate();
      console.log(`Legacy JSONL migration completed: ${imported}/${lines.length}`);
    } catch (error) {
      console.error("Legacy JSONL migration failed", error);
      throw error;
    }
  }

  return database;
}

export function getDatabase() {
  globalForDatabase.sunyunDatabase ??= createDatabase();
  return globalForDatabase.sunyunDatabase;
}
