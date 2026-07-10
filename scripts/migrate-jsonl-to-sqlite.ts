import {existsSync, readFileSync} from "node:fs";
import {env} from "../lib/config/env";
import {getDatabase} from "../lib/db/database";

const sourceExists = existsSync(env.legacyLeadsPath);
const sourceLines = sourceExists
  ? readFileSync(env.legacyLeadsPath, "utf8").split("\n").filter(Boolean).length
  : 0;

// 数据库初始化与应用启动使用完全相同的事务化迁移逻辑。
const database = getDatabase();
const total = Number((database.prepare("SELECT COUNT(*) AS count FROM leads").get() as {count: number}).count);
const metadata = database
  .prepare("SELECT value FROM app_meta WHERE key = ?")
  .get("legacy-jsonl-imported-v1") as {value: string} | undefined;

console.log(
  JSON.stringify(
    {
      legacyFile: env.legacyLeadsPath,
      sourceExists,
      sourceLines,
      migration: metadata ? JSON.parse(metadata.value) : null,
      sqliteFile: env.databasePath,
      sqliteTotal: total,
    },
    null,
    2,
  ),
);

if (sourceExists && !metadata) {
  console.error("发现旧 JSONL，但没有生成迁移标记。请检查数据库初始化日志。");
  process.exitCode = 1;
}
