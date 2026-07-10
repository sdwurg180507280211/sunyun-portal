import {existsSync, mkdirSync} from "node:fs";
import {basename, dirname, resolve} from "node:path";
import {env} from "../lib/config/env";
import {getDatabase} from "../lib/db/database";

if (!existsSync(env.databasePath)) {
  console.log(`数据库尚不存在：${env.databasePath}`);
  process.exit(0);
}

const timestamp = new Date().toISOString().replaceAll(/[:.]/g, "-");
const backupDir = resolve(process.env.BACKUP_DIR || dirname(env.databasePath), "backups");
mkdirSync(backupDir, {recursive: true});
const target = resolve(backupDir, `${basename(env.databasePath)}.${timestamp}.bak`);

await getDatabase().backup(target);
console.log(`SQLite 在线备份完成：${target}`);
