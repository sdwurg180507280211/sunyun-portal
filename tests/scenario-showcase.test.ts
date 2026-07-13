import assert from "node:assert/strict";
import {existsSync, readFileSync} from "node:fs";
import {resolve} from "node:path";
import test from "node:test";

const root = resolve(new URL("..", import.meta.url).pathname);
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

test("scenario showcase is split into focused server components", () => {
  for (const file of [
    "components/marketing/scenario-dashboard.tsx",
    "components/marketing/scenario-ledger.tsx",
    "components/marketing/scenario-analysis.tsx",
    "components/marketing/scenario-showcase.tsx",
  ]) {
    assert.equal(existsSync(resolve(root, file)), true, `${file} should exist`);
  }
});

test("main dashboard exposes readable statuses and anonymous project names", () => {
  const source = read("components/marketing/scenario-dashboard.tsx");
  assert.match(source, /collaborationMetrics/);
  assert.match(source, /collaborationProjects/);
  assert.match(source, /collaborationFollowUp/);
  assert.match(source, /aria-label="药企业务协同平台模拟工作台"/);
  assert.doesNotMatch(source, /use client|useState|useEffect/);
});

test("supporting scenario panels keep meaningful text and decorative charts separate", () => {
  const ledger = read("components/marketing/scenario-ledger.tsx");
  const analysis = read("components/marketing/scenario-analysis.tsx");
  assert.match(ledger, /operationsLedger/);
  assert.match(ledger, /aria-label="医疗机构运营台账模拟界面"/);
  assert.match(analysis, /commerceAnalysis/);
  assert.match(analysis, /aria-hidden="true"/);
  assert.match(analysis, /医药商业经营分析模拟界面/);
  assert.doesNotMatch(`${ledger}\n${analysis}`, /use client|canvas|setInterval|requestAnimationFrame/);
});

test("marketing page delegates the complete scenario section to ScenarioShowcase", () => {
  const page = read("components/marketing/marketing-page.tsx");
  const showcase = read("components/marketing/scenario-showcase.tsx");
  assert.match(page, /import \{ScenarioShowcase\}/);
  assert.match(page, /<ScenarioShowcase \/>/);
  assert.doesNotMatch(page, /scenarios\.map/);
  assert.match(showcase, /id="scenarios"/);
  assert.match(showcase, /scenarioDisclaimer/);
  assert.match(showcase, /ScenarioDashboard/);
  assert.match(showcase, /ScenarioLedger/);
  assert.match(showcase, /ScenarioAnalysis/);
});

test("scenario styles include desktop composition, mobile simplification, and reduced motion", () => {
  const layout = read("app/layout.tsx");
  const css = read("app/scenario-showcase.css");
  assert.match(layout, /scenario-showcase\.css/);
  assert.match(css, /\.scenario-showcase-grid/);
  assert.match(css, /grid-template-columns:\s*1\.25fr\s+0\.75fr/);
  assert.match(css, /@media \(max-width: 1023px\)/);
  assert.match(css, /@media \(max-width: 767px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /\.scenario-progress-track i/);
  assert.doesNotMatch(css, /scenario-[^{]+\{[^}]*animation:[^;]*(infinite|linear infinite)/is);
});
