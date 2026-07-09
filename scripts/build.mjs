// 构建脚本：把当前可部署文件快照为带版本+时间戳的发布包
// 输出：dist/sunyun-portal-<version>-<timestamp>/ 目录 + dist/sunyun-portal-<version>-<timestamp>.tar.gz
// 沿用项目既有 dist/ 约定；dist/ 已被 .gitignore 忽略，不会入库。

import { execFileSync } from "node:child_process";
import { cp, mkdir, rm, readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const pkg = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
const version = pkg.version || "0.0.0";

const now = new Date();
const pad = (n) => String(n).padStart(2, "0");
const ts =
  `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
  `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

const outName = `sunyun-portal-${version}-${ts}`;
const distDir = resolve(root, "dist");
const stageDir = resolve(distDir, outName);

// 需纳入发布包的内容（相对 root 的源 -> 目标）
const entries = [
  ["public", "public"],
  ["server.js", "server.js"],
  ["package.json", "package.json"],
  ["deploy", "deploy"],
];

async function ensureGitkeep() {
  const gk = resolve(root, "data", ".gitkeep");
  if (!existsSync(gk)) {
    const { writeFile } = await import("node:fs/promises");
    await mkdir(dirname(gk), { recursive: true });
    await writeFile(gk, "");
  }
}

async function main() {
  await ensureGitkeep();
  await rm(stageDir, { recursive: true, force: true });
  await mkdir(stageDir, { recursive: true });

  for (const [src, dest] of entries) {
    const from = resolve(root, src);
    if (!existsSync(from)) {
      console.warn(`  ! 跳过缺失项: ${src}`);
      continue;
    }
    const s = await stat(from);
    if (s.isDirectory()) {
      await cp(from, resolve(stageDir, dest), { recursive: true });
    } else {
      await cp(from, resolve(stageDir, dest));
    }
  }

  // data/.gitkeep 占位（线索文件本身不进包）
  await mkdir(resolve(stageDir, "data"), { recursive: true });
  await cp(resolve(root, "data", ".gitkeep"), resolve(stageDir, "data", ".gitkeep"));

  // 打包（排除 macOS 残留 .DS_Store）
  execFileSync("tar", ["--exclude=.DS_Store", "-czf", `${outName}.tar.gz`, outName], {
    cwd: distDir,
  });

  const { size } = await stat(resolve(distDir, `${outName}.tar.gz`));
  const kb = (size / 1024).toFixed(1);
  console.log(`构建完成: dist/${outName}.tar.gz (${kb} KB)`);
  console.log(`  解包目录: dist/${outName}/`);
}

main().catch((err) => {
  console.error("构建失败:", err);
  process.exit(1);
});
