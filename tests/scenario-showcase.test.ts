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
  assert.ok(source.includes("collaborationMetrics"));
  assert.ok(source.includes("collaborationProjects"));
  assert.ok(source.includes("collaborationFollowUp"));
  assert.ok(source.includes('aria-label="药企业务协同平台模拟工作台"'));
  assert.doesNotMatch(source, /use client|useState|useEffect/);
});

test("supporting scenario panels keep meaningful text and decorative charts separate", () => {
  const ledger = read("components/marketing/scenario-ledger.tsx");
  const analysis = read("components/marketing/scenario-analysis.tsx");
  assert.ok(ledger.includes("operationsLedger"));
  assert.ok(ledger.includes('aria-label="医疗机构运营台账模拟界面"'));
  assert.ok(analysis.includes("commerceAnalysis"));
  assert.ok(analysis.includes('aria-hidden="true"'));
  assert.ok(analysis.includes("医药商业经营分析模拟界面"));
  assert.doesNotMatch(`${ledger}\n${analysis}`, /use client|canvas|setInterval|requestAnimationFrame/);
});

test("marketing page delegates the complete scenario section to ScenarioShowcase", () => {
  const page = read("components/marketing/marketing-page.tsx");
  const showcase = read("components/marketing/scenario-showcase.tsx");
  assert.ok(page.includes('import {ScenarioShowcase} from "@/components/marketing/scenario-showcase"'));
  assert.ok(page.includes("<ScenarioShowcase />"));
  assert.equal(page.includes("scenarios.map"), false);
  assert.ok(showcase.includes('id="scenarios"'));
  assert.ok(showcase.includes("scenarioDisclaimer"));
  assert.ok(showcase.includes("ScenarioDashboard"));
  assert.ok(showcase.includes("ScenarioLedger"));
  assert.ok(showcase.includes("ScenarioAnalysis"));
});

test("scenario styles include desktop composition, mobile simplification, and reduced motion", () => {
  const layout = read("app/layout.tsx");
  const css = read("app/scenario-showcase.css");
  assert.ok(layout.includes('import "./scenario-showcase.css"'));
  assert.ok(css.includes(".scenario-showcase-grid"));
  assert.ok(css.includes("grid-template-columns: 1.25fr 0.75fr"));
  assert.ok(css.includes("@media (max-width: 1023px)"));
  assert.ok(css.includes("@media (max-width: 767px)"));
  assert.ok(css.includes("@media (prefers-reduced-motion: reduce)"));
  assert.ok(css.includes(".scenario-progress-track i"));
  assert.equal(css.includes("animation: infinite"), false);
  assert.equal(css.includes("linear infinite"), false);
});

test("visual QA isolates Chrome debugging and waits for the assigned port", () => {
  const script = read("scripts/capture-scenario-visual-qa.mjs");
  assert.ok(script.includes('"--remote-debugging-port=0"'));
  assert.ok(script.includes("DevToolsActivePort"));
  assert.equal(script.includes("const debugPort = 9222"), false);
});

test("visual QA waits for Reveal activation-zone transitions before capture", () => {
  const script = read("scripts/capture-scenario-visual-qa.mjs");
  assert.ok(script.includes('querySelectorAll("#scenarios .reveal")'));
  assert.ok(script.includes('dataset.state === "visible"'));
  assert.ok(script.includes("getAnimations({subtree: true})"));
  assert.ok(script.includes("const rectangle = element.getBoundingClientRect()"));
  assert.ok(script.includes("rectangle.top <= window.innerHeight * 0.92 && rectangle.bottom > 0"));
});
