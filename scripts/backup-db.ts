import {copyFileSync, existsSync, mkdirSync} from "node:fs";
import {basename, dirname, resolve} from "node:path";
import {env} from "../lib/config/env";
import {getDatabase} from "../lib/db/database";

if (!existsSync(env.databasePath)) {
  console.log(`数据库尚不存在：${env.databasePath}`);
  process.exit(0);
}

getDatabase().pragma("wal_checkpoint(FULL)");
const timestamp = new Date().toISOString().replaceAll(/[:.]/g, "-");
const backupDir = resolve(process.env.BACKUP_DIR || dirname(env.databasePath), "backups");
mkdirSync(backupDir, {recursive: true});
const target = resolve(backupDir, `${basename(env.databasePath)}.${timestamp}.bak`);
copyFileSync(env.databasePath, target);
console.log(`数据库备份完成：${target}`);
