import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import test from "node:test";

const root = resolve(new URL("..", import.meta.url).pathname);
const publicFiles = [
  "app/layout.tsx",
  "app/api/leads/route.ts",
  "app/api/health/route.ts",
  "app/admin/page.tsx",
  "app/admin/login/page.tsx",
  "components/marketing/marketing-page.tsx",
  "components/lead-form/lead-form.tsx",
  "components/admin/login-form.tsx",
  "components/admin/admin-dashboard.tsx",
  "lib/brand.ts",
  "README.md",
] as const;

test("user-facing files no longer expose the former company brand", () => {
  const copy = publicFiles.map((file) => readFileSync(resolve(root, file), "utf8")).join("\n");
  assert.doesNotMatch(copy, /榫合云|北京榫合云科技有限公司/);
  assert.match(copy, /北京云医荟科技有限公司/);
  assert.match(copy, /yunyihui-portal/);
});

test("package, admin surfaces, and CSV export use the approved operational copy", () => {
  const packageJson = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8")) as {description?: string};
  const adminPage = readFileSync(resolve(root, "app/admin/page.tsx"), "utf8");
  const adminLoginPage = readFileSync(resolve(root, "app/admin/login/page.tsx"), "utf8");
  const loginForm = readFileSync(resolve(root, "components/admin/login-form.tsx"), "utf8");
  const dashboard = readFileSync(resolve(root, "components/admin/admin-dashboard.tsx"), "utf8");

  assert.equal(
    packageJson.description,
    "北京云医荟科技有限公司医药数字化门户、商务咨询与管理后台",
  );
  assert.match(adminPage, /metadata\s*=\s*\{title:\s*"医药数字化商务咨询后台"\}/);
  assert.match(adminLoginPage, /metadata\s*=\s*\{title:\s*"云医荟后台登录"\}/);
  assert.match(loginForm, /<Card\.Title[^>]*>云医荟商务咨询后台<\/Card\.Title>/);
  assert.match(dashboard, /<h1[^>]*>医药数字化商务咨询后台<\/h1>/);
  assert.match(dashboard, /const headers = \[[^\]]*"咨询方向"[^\]]*"单位名称"[^\]]*\]/);
  assert.match(dashboard, /<th>咨询方向与业务场景<\/th>/);
  assert.ok(
    dashboard.includes("`yunyihui-leads-${new Date().toISOString().slice(0, 10)}.csv`"),
    "CSV filename must retain the yunyihui-leads-YYYY-MM-DD.csv contract",
  );
});
