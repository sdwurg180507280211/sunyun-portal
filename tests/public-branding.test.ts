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
