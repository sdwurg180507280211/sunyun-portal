import {existsSync, readFileSync} from "node:fs";
import {env} from "../lib/config/env";
import {getDatabase} from "../lib/db/database";
import {importLegacyLead} from "../lib/db/lead-repository";

if (!existsSync(env.legacyLeadsPath)) {
  console.log(`未发现旧线索文件，跳过迁移：${env.legacyLeadsPath}`);
  process.exit(0);
}

const lines = readFileSync(env.legacyLeadsPath, "utf8").split("\n").filter(Boolean);
let imported = 0;
let skipped = 0;
let failed = 0;

for (const [index, line] of lines.entries()) {
  try {
    const result = importLegacyLead(JSON.parse(line));
    if (result.changes) imported += 1;
    else skipped += 1;
  } catch (error) {
    failed += 1;
    console.error(`第 ${index + 1} 行导入失败：`, error);
  }
}

const count = Number((getDatabase().prepare("SELECT COUNT(*) AS count FROM leads").get() as {count: number}).count);
console.log(JSON.stringify({sourceLines: lines.length, imported, skipped, failed, sqliteTotal: count}, null, 2));
if (failed > 0) process.exitCode = 1;
