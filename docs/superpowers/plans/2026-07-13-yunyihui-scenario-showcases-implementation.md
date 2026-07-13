# Yunyihui Scenario Showcases Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the homepage scenario section from three text cards into three polished, anonymous product-interface showcases for pharmaceutical collaboration, medical-institution operations, and pharmaceutical-commerce analysis.

**Architecture:** Keep public copy in `components/marketing/content.ts`, place read-only mock interface data in `components/marketing/scenario-content.ts`, and split each visual into a focused server component. `ScenarioShowcase` owns the section layout and is the only component imported by `marketing-page.tsx`; no API, database, client state, or new dependency is introduced.

**Tech Stack:** Next.js 16 App Router, React 19 server components, TypeScript 5.9, Tailwind CSS 4 utility classes, global CSS, Node test runner through `tsx --test`, GitHub Actions, headless Chrome.

## Global Constraints

- Base all work on `main` through branch `agent/yunyihui-scenario-showcases`.
- Do not merge the resulting pull request into `main`.
- Do not add npm dependencies.
- Do not modify consultation API behavior, SQLite schema, authentication, cookies, Docker service names, image names, or deployment paths.
- Use only anonymous mock content; do not include customer names, customer logos, hospitals, pharmaceutical company names, people, patients, subjects, drug names, prescriptions, certifications, revenue, deal values, rankings, or performance percentages.
- Display this exact disclaimer: `以下内容为基于行业常见业务流程构建的场景示意，不代表特定客户项目或效果承诺。`
- Keep helper body color `#5B7088` and do not rely on color alone to communicate state.
- Decorative SVG, grids, and chart geometry must use `aria-hidden="true"`; meaningful statuses must remain readable text.
- Animation may affect only `transform` and `opacity`, run once, and resolve immediately under `prefers-reduced-motion: reduce`.
- Required visual widths: 1440×1000, 1280×800, 1024×768, 768×1024, 390×844, 375×667, plus reduced-motion.

---

## File Structure

- `components/marketing/content.ts` — approved public headings, descriptions, and scenario disclaimer.
- `components/marketing/scenario-content.ts` — anonymous, read-only dashboard, ledger, and analysis data.
- `components/marketing/scenario-dashboard.tsx` — large pharmaceutical collaboration workbench.
- `components/marketing/scenario-ledger.tsx` — compact medical-institution operations ledger.
- `components/marketing/scenario-analysis.tsx` — compact pharmaceutical-commerce analysis panel.
- `components/marketing/scenario-showcase.tsx` — section heading, disclaimer, responsive one-main/two-supporting layout.
- `components/marketing/marketing-page.tsx` — replace the current scenario loop with `<ScenarioShowcase />`.
- `app/globals.css` — showcase styling, responsive rules, and reduced-motion final states.
- `tests/marketing-content.test.ts` — public-copy and prohibited-claim contract.
- `tests/scenario-showcase.test.ts` — component-boundary, accessibility, and structure contract.
- `.github/workflows/ci.yml` — scenario screenshots and artifact upload after standalone runtime verification.

---

### Task 1: Lock the scenario copy and anonymous display data

**Files:**
- Modify: `components/marketing/content.ts`
- Create: `components/marketing/scenario-content.ts`
- Modify: `tests/marketing-content.test.ts`

**Interfaces:**
- Consumes: existing `scenarios` export from `components/marketing/content.ts`.
- Produces: `scenarioDisclaimer`, updated `scenarios`, `collaborationMetrics`, `collaborationProjects`, `collaborationFollowUp`, `operationsLedger`, and `commerceAnalysis`.

- [ ] **Step 1: Write the failing content-contract test**

Replace the scenario assertions in `tests/marketing-content.test.ts` with:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import {
  audiences,
  deliverables,
  deliverySteps,
  navigation,
  scenarioDisclaimer,
  scenarios,
  solutions,
  trustPrinciples,
} from "../components/marketing/content";
import {
  collaborationMetrics,
  collaborationProjects,
  commerceAnalysis,
  operationsLedger,
} from "../components/marketing/scenario-content";

test("marketing content exposes the approved information architecture", () => {
  assert.equal(navigation.length, 5);
  assert.deepEqual(deliverables, ["需求蓝图", "产品原型", "权限矩阵", "接口清单", "验收清单"]);
  assert.deepEqual(audiences.map((item) => item.title), ["药品生产企业", "医疗机构", "医药商业公司"]);
  assert.equal(solutions.length, 4);
  assert.equal(deliverySteps.length, 4);
  assert.deepEqual(scenarios.map((item) => item.title), [
    "药企业务协同平台",
    "医疗机构运营台账",
    "医药商业经营分析",
  ]);
  assert.equal(trustPrinciples.length, 4);
  assert.match(solutions.find((item) => item.title === "AI 工作流工具")?.description || "", /人工复核/);
});

test("scenario showcase data is useful but anonymous", () => {
  assert.equal(
    scenarioDisclaimer,
    "以下内容为基于行业常见业务流程构建的场景示意，不代表特定客户项目或效果承诺。",
  );
  assert.equal(collaborationMetrics.length, 3);
  assert.equal(collaborationProjects.length, 3);
  assert.equal(operationsLedger.length, 3);
  assert.equal(commerceAnalysis.channels.length, 3);
  assert.match(JSON.stringify(collaborationProjects), /项目 A/);
  assert.match(JSON.stringify(operationsLedger), /运营事项/);
});

test("marketing content excludes unverified or patient-facing claims", () => {
  const copy = JSON.stringify({
    audiences,
    collaborationMetrics,
    collaborationProjects,
    commerceAnalysis,
    deliverables,
    deliverySteps,
    operationsLedger,
    scenarioDisclaimer,
    scenarios,
    solutions,
    trustPrinciples,
  });
  assert.doesNotMatch(
    copy,
    /榫合云|行业领先|全面合规|精准诊断|提升疗效|三甲医院|患者|受试者|病历|处方|药品名称|客户 Logo|\d+%/,
  );
});
```

- [ ] **Step 2: Run the content test and verify failure**

Run:

```bash
npm test -- tests/marketing-content.test.ts
```

Expected: FAIL because `scenarioDisclaimer` and `scenario-content.ts` exports do not exist and two titles still use the old wording.

- [ ] **Step 3: Update the public scenario contract**

Replace the current `scenarios` export and add the disclaimer in `components/marketing/content.ts`:

```ts
export const scenarioDisclaimer =
  "以下内容为基于行业常见业务流程构建的场景示意，不代表特定客户项目或效果承诺。";

export const scenarios = [
  {
    index: "01",
    eyebrow: "PHARMA COLLABORATION",
    title: "药企业务协同平台",
    description: "统一客户、项目、资料、活动与跟进记录，让协作过程可见，信息沉淀可用。",
  },
  {
    index: "02",
    eyebrow: "OPERATIONS LEDGER",
    title: "医疗机构运营台账",
    description: "围绕非诊疗事项、到期提醒、知识协作与责任状态形成清晰台账。",
  },
  {
    index: "03",
    eyebrow: "COMMERCE ANALYSIS",
    title: "医药商业经营分析",
    description: "连接渠道、订单、库存与客户结构，形成可理解的经营趋势和重点关注项。",
  },
] as const;
```

- [ ] **Step 4: Create the anonymous display-data module**

Create `components/marketing/scenario-content.ts`:

```ts
export const collaborationMetrics = [
  {label: "进行中项目", value: "08", note: "按阶段推进"},
  {label: "待审批事项", value: "05", note: "责任人已明确"},
  {label: "资料完成度", value: "良好", note: "按清单持续更新"},
] as const;

export const collaborationProjects = [
  {name: "项目 A", stage: "方案确认", progress: "72", owner: "项目组一"},
  {name: "项目 B", stage: "联调验证", progress: "58", owner: "项目组二"},
  {name: "项目 C", stage: "上线准备", progress: "86", owner: "项目组三"},
] as const;

export const collaborationFollowUp = {
  label: "最近跟进",
  title: "资料清单已更新",
  detail: "下一步确认接口条件与验收口径",
  status: "待确认",
} as const;

export const operationsLedger = [
  {title: "运营事项 01", owner: "运营组", deadline: "本周", status: "处理中"},
  {title: "运营事项 02", owner: "协作组", deadline: "下周", status: "待确认"},
  {title: "知识资料更新", owner: "内容组", deadline: "持续", status: "正常"},
] as const;

export const commerceAnalysis = {
  summary: [
    {label: "订单协同", value: "稳定"},
    {label: "库存状态", value: "可用"},
  ],
  channels: [
    {label: "核心渠道", value: 78},
    {label: "区域渠道", value: 61},
    {label: "协作渠道", value: 43},
  ],
  attention: "2 项经营信息待复核",
} as const;
```

The numeric `progress` and channel values are visual positions only. Do not render a `%` suffix or describe them as measured business performance.

- [ ] **Step 5: Run the content test and verify success**

Run:

```bash
npm test -- tests/marketing-content.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit Task 1**

```bash
git add components/marketing/content.ts components/marketing/scenario-content.ts tests/marketing-content.test.ts
git commit -m "feat: define anonymous scenario showcase content"
```

---

### Task 2: Build the main pharmaceutical collaboration workbench

**Files:**
- Create: `components/marketing/scenario-dashboard.tsx`
- Create: `tests/scenario-showcase.test.ts`

**Interfaces:**
- Consumes: `collaborationMetrics`, `collaborationProjects`, and `collaborationFollowUp` from `scenario-content.ts`.
- Produces: `ScenarioDashboard(): React.JSX.Element`.

- [ ] **Step 1: Write the failing component-boundary test**

Create `tests/scenario-showcase.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the new test and verify failure**

Run:

```bash
npm test -- tests/scenario-showcase.test.ts
```

Expected: FAIL because the four component files do not exist.

- [ ] **Step 3: Create the main dashboard component**

Create `components/marketing/scenario-dashboard.tsx`:

```tsx
import {
  collaborationFollowUp,
  collaborationMetrics,
  collaborationProjects,
} from "@/components/marketing/scenario-content";

export function ScenarioDashboard() {
  return (
    <div aria-label="药企业务协同平台模拟工作台" className="scenario-dashboard">
      <div className="scenario-window-bar">
        <span>业务协同工作台</span>
        <span className="scenario-window-status">场景示意</span>
      </div>

      <div className="scenario-metric-grid">
        {collaborationMetrics.map((metric) => (
          <article className="scenario-metric" key={metric.label}>
            <p>{metric.label}</p>
            <strong>{metric.value}</strong>
            <small>{metric.note}</small>
          </article>
        ))}
      </div>

      <div className="scenario-project-list" aria-label="匿名项目状态">
        <div className="scenario-project-heading">
          <span>项目</span>
          <span>阶段</span>
          <span>责任组</span>
        </div>
        {collaborationProjects.map((project) => (
          <article className="scenario-project-row" key={project.name}>
            <div>
              <strong>{project.name}</strong>
              <span className="scenario-progress-track" aria-label={`${project.name}阶段进度`}>
                <i style={{"--scenario-progress": project.progress} as React.CSSProperties} />
              </span>
            </div>
            <span className="scenario-status-pill">{project.stage}</span>
            <span>{project.owner}</span>
          </article>
        ))}
      </div>

      <aside className="scenario-follow-up">
        <span>{collaborationFollowUp.label}</span>
        <strong>{collaborationFollowUp.title}</strong>
        <p>{collaborationFollowUp.detail}</p>
        <b>{collaborationFollowUp.status}</b>
      </aside>
    </div>
  );
}
```

- [ ] **Step 4: Run the focused test**

Run:

```bash
npm test -- tests/scenario-showcase.test.ts
```

Expected: the file-existence test still FAILS for the remaining three files, while the dashboard-specific assertions PASS.

- [ ] **Step 5: Commit Task 2**

```bash
git add components/marketing/scenario-dashboard.tsx tests/scenario-showcase.test.ts
git commit -m "feat: add pharma collaboration scenario dashboard"
```

---

### Task 3: Build the operations ledger and commerce analysis panels

**Files:**
- Create: `components/marketing/scenario-ledger.tsx`
- Create: `components/marketing/scenario-analysis.tsx`
- Modify: `tests/scenario-showcase.test.ts`

**Interfaces:**
- Consumes: `operationsLedger` and `commerceAnalysis` from `scenario-content.ts`.
- Produces: `ScenarioLedger(): React.JSX.Element` and `ScenarioAnalysis(): React.JSX.Element`.

- [ ] **Step 1: Extend the failing source-contract test**

Append to `tests/scenario-showcase.test.ts`:

```ts
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
```

- [ ] **Step 2: Run and verify failure**

Run:

```bash
npm test -- tests/scenario-showcase.test.ts
```

Expected: FAIL because the ledger and analysis components do not exist.

- [ ] **Step 3: Create the operations ledger**

Create `components/marketing/scenario-ledger.tsx`:

```tsx
import {operationsLedger} from "@/components/marketing/scenario-content";

export function ScenarioLedger() {
  return (
    <div aria-label="医疗机构运营台账模拟界面" className="scenario-ledger">
      <div className="scenario-panel-heading">
        <div>
          <small>OPERATIONS</small>
          <strong>事项台账</strong>
        </div>
        <span>本周视图</span>
      </div>
      <div className="scenario-ledger-list">
        {operationsLedger.map((item) => (
          <article key={item.title}>
            <span className="scenario-ledger-marker" aria-hidden="true" />
            <div>
              <strong>{item.title}</strong>
              <small>{item.owner} · {item.deadline}</small>
            </div>
            <b>{item.status}</b>
          </article>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create the commerce analysis panel**

Create `components/marketing/scenario-analysis.tsx`:

```tsx
import {commerceAnalysis} from "@/components/marketing/scenario-content";

export function ScenarioAnalysis() {
  return (
    <div aria-label="医药商业经营分析模拟界面" className="scenario-analysis">
      <div className="scenario-panel-heading">
        <div>
          <small>COMMERCE</small>
          <strong>经营视图</strong>
        </div>
        <span>结构分析</span>
      </div>

      <div className="scenario-analysis-summary">
        {commerceAnalysis.summary.map((item) => (
          <article key={item.label}>
            <small>{item.label}</small>
            <strong>{item.value}</strong>
          </article>
        ))}
        <svg aria-hidden="true" className="scenario-sparkline" viewBox="0 0 160 48">
          <path d="M3 39C22 35 28 17 47 23S74 38 91 20s34-9 45-15 17 4 21 0" fill="none" />
        </svg>
      </div>

      <div className="scenario-channel-list" aria-label="匿名渠道结构">
        {commerceAnalysis.channels.map((channel) => (
          <div key={channel.label}>
            <span>{channel.label}</span>
            <i><b style={{"--scenario-channel": channel.value} as React.CSSProperties} /></i>
          </div>
        ))}
      </div>
      <p className="scenario-attention">{commerceAnalysis.attention}</p>
    </div>
  );
}
```

- [ ] **Step 5: Run the focused test and verify the two panels pass**

Run:

```bash
npm test -- tests/scenario-showcase.test.ts
```

Expected: only the missing `scenario-showcase.tsx` assertion remains failing.

- [ ] **Step 6: Commit Task 3**

```bash
git add components/marketing/scenario-ledger.tsx components/marketing/scenario-analysis.tsx tests/scenario-showcase.test.ts
git commit -m "feat: add operations and commerce scenario panels"
```

---

### Task 4: Assemble and integrate the responsive scenario showcase

**Files:**
- Create: `components/marketing/scenario-showcase.tsx`
- Modify: `components/marketing/marketing-page.tsx`
- Modify: `app/globals.css`
- Modify: `tests/scenario-showcase.test.ts`

**Interfaces:**
- Consumes: `scenarioDisclaimer`, `scenarios`, `ScenarioDashboard`, `ScenarioLedger`, and `ScenarioAnalysis`.
- Produces: `ScenarioShowcase(): React.JSX.Element`, owning `<section id="scenarios">`.

- [ ] **Step 1: Add the failing integration assertions**

Append to `tests/scenario-showcase.test.ts`:

```ts
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
  const css = read("app/globals.css");
  assert.match(css, /\.scenario-showcase-grid/);
  assert.match(css, /grid-template-columns:\s*1\.25fr\s+0\.75fr/);
  assert.match(css, /@media \(max-width: 1023px\)/);
  assert.match(css, /@media \(max-width: 767px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /\.scenario-progress-track i/);
  assert.doesNotMatch(css, /scenario-[^{]+\{[^}]*animation:[^;]*(infinite|linear infinite)/is);
});
```

- [ ] **Step 2: Run and verify failure**

Run:

```bash
npm test -- tests/scenario-showcase.test.ts
```

Expected: FAIL because `ScenarioShowcase` and its styles are absent.

- [ ] **Step 3: Create the section component**

Create `components/marketing/scenario-showcase.tsx`:

```tsx
import {scenarioDisclaimer, scenarios} from "@/components/marketing/content";
import {ScenarioAnalysis} from "@/components/marketing/scenario-analysis";
import {ScenarioDashboard} from "@/components/marketing/scenario-dashboard";
import {ScenarioLedger} from "@/components/marketing/scenario-ledger";
import {Reveal} from "@/components/marketing/reveal";

export function ScenarioShowcase() {
  const [collaboration, ledger, analysis] = scenarios;

  return (
    <section className="scroll-mt-20 bg-[var(--background)] py-16 lg:py-20" id="scenarios">
      <div className="site-shell-wide">
        <p className="section-kicker">05 · Scenario examples</p>
        <h2 className="section-title">从一个关键场景开始，连接真实业务链。</h2>
        <p className="section-copy mt-5">{scenarioDisclaimer}</p>

        <div className="scenario-showcase-grid mt-12">
          <Reveal>
            <article className="scenario-card scenario-card-main">
              <div className="scenario-card-copy">
                <p className="section-kicker">SCENARIO {collaboration.index} · {collaboration.eyebrow}</p>
                <h3>{collaboration.title}</h3>
                <p>{collaboration.description}</p>
              </div>
              <ScenarioDashboard />
            </article>
          </Reveal>

          <div className="scenario-supporting-stack">
            <Reveal delay={80}>
              <article className="scenario-card scenario-card-supporting">
                <div className="scenario-card-copy">
                  <p className="section-kicker">SCENARIO {ledger.index} · {ledger.eyebrow}</p>
                  <h3>{ledger.title}</h3>
                  <p>{ledger.description}</p>
                </div>
                <ScenarioLedger />
                <span className="scenario-card-number" aria-hidden="true">{ledger.index}</span>
              </article>
            </Reveal>

            <Reveal delay={160}>
              <article className="scenario-card scenario-card-supporting">
                <div className="scenario-card-copy">
                  <p className="section-kicker">SCENARIO {analysis.index} · {analysis.eyebrow}</p>
                  <h3>{analysis.title}</h3>
                  <p>{analysis.description}</p>
                </div>
                <ScenarioAnalysis />
                <span className="scenario-card-number" aria-hidden="true">{analysis.index}</span>
              </article>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Replace the inline scenario loop in the marketing page**

In `components/marketing/marketing-page.tsx`:

1. Remove `scenarios` from the `content.ts` import.
2. Add:

```tsx
import {ScenarioShowcase} from "@/components/marketing/scenario-showcase";
```

3. Replace the complete current `<section id="scenarios">...</section>` block with:

```tsx
<ScenarioShowcase />
```

Do not change any surrounding section, contact form, navigation, or footer.

- [ ] **Step 5: Add the responsive visual system**

Append the following focused rules before the existing responsive media queries in `app/globals.css`:

```css
.scenario-showcase-grid {
  display: grid;
  grid-template-columns: 1.25fr 0.75fr;
  gap: 1rem;
}

.scenario-supporting-stack {
  display: grid;
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.scenario-card {
  position: relative;
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 1.25rem;
  background: var(--surface);
  box-shadow: 0 18px 48px rgb(16 35 63 / 7%);
}

.scenario-card-main {
  display: grid;
  grid-template-columns: minmax(15rem, 0.72fr) minmax(0, 1.28fr);
  min-height: 24rem;
}

.scenario-card-supporting {
  display: grid;
  grid-template-columns: minmax(12rem, 0.8fr) minmax(0, 1.2fr);
  min-height: 11.5rem;
}

.scenario-card-copy {
  position: relative;
  z-index: 2;
  padding: clamp(1.4rem, 2.5vw, 2rem);
}

.scenario-card-copy h3 {
  margin-top: 2.25rem;
  font-size: clamp(1.35rem, 2vw, 2rem);
  font-weight: 740;
  line-height: 1.12;
  letter-spacing: -0.02em;
}

.scenario-card-copy > p:last-child {
  margin-top: 1rem;
  color: var(--muted);
  line-height: 1.75;
}

.scenario-card-number {
  position: absolute;
  right: 1rem;
  bottom: -0.3rem;
  color: var(--brand-soft);
  font-size: 4.5rem;
  font-weight: 900;
  line-height: 1;
}

.scenario-dashboard,
.scenario-ledger,
.scenario-analysis {
  min-width: 0;
  color: var(--foreground);
  background: linear-gradient(145deg, #edf4fc, #e3ebf5 58%, #f0effa);
}

.scenario-dashboard {
  position: relative;
  min-height: 100%;
  padding: 1.25rem;
}

.scenario-window-bar,
.scenario-panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.scenario-window-bar {
  color: var(--muted);
  font-size: 0.75rem;
  font-weight: 800;
}

.scenario-window-status,
.scenario-panel-heading > span,
.scenario-status-pill,
.scenario-ledger-list b,
.scenario-follow-up b {
  border: 1px solid rgb(23 88 213 / 16%);
  border-radius: 999px;
  color: #164aa9;
  background: rgb(255 255 255 / 68%);
  font-size: 0.7rem;
  font-weight: 800;
  white-space: nowrap;
}

.scenario-window-status,
.scenario-panel-heading > span {
  padding: 0.35rem 0.6rem;
}

.scenario-metric-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.625rem;
  margin-top: 1rem;
}

.scenario-metric {
  min-width: 0;
  padding: 0.85rem;
  border: 1px solid rgb(255 255 255 / 82%);
  border-radius: 0.85rem;
  background: rgb(255 255 255 / 72%);
  box-shadow: 0 12px 28px rgb(37 65 103 / 8%);
}

.scenario-metric p,
.scenario-metric small,
.scenario-project-heading,
.scenario-ledger-list small,
.scenario-analysis-summary small {
  color: var(--muted);
  font-size: 0.7rem;
}

.scenario-metric strong {
  display: block;
  margin-block: 0.4rem 0.2rem;
  font-size: 1.25rem;
}

.scenario-project-list {
  margin-top: 0.8rem;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 82%);
  border-radius: 0.9rem;
  background: rgb(255 255 255 / 74%);
}

.scenario-project-heading,
.scenario-project-row {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(6rem, 0.8fr) minmax(5rem, 0.7fr);
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.8rem;
}

.scenario-project-row {
  border-top: 1px solid rgb(216 227 239 / 82%);
  font-size: 0.75rem;
}

.scenario-project-row > div {
  min-width: 0;
}

.scenario-progress-track {
  display: block;
  height: 0.28rem;
  margin-top: 0.45rem;
  overflow: hidden;
  border-radius: 999px;
  background: #dce7f4;
}

.scenario-progress-track i {
  display: block;
  width: calc(var(--scenario-progress) * 1%);
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--brand), var(--brand-light));
  transform-origin: left;
  animation: scenario-bar-in 560ms ease both;
}

.scenario-status-pill,
.scenario-ledger-list b,
.scenario-follow-up b {
  justify-self: start;
  padding: 0.28rem 0.5rem;
}

.scenario-follow-up {
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  width: min(78%, 18rem);
  padding: 0.85rem;
  border: 1px solid rgb(255 255 255 / 86%);
  border-radius: 0.9rem;
  background: rgb(255 255 255 / 82%);
  box-shadow: 0 15px 34px rgb(37 65 103 / 12%);
  backdrop-filter: blur(10px);
}

.scenario-follow-up > span,
.scenario-panel-heading small {
  color: var(--brand);
  font-size: 0.65rem;
  font-weight: 900;
  letter-spacing: 0.09em;
}

.scenario-follow-up strong,
.scenario-panel-heading strong {
  display: block;
  margin-top: 0.25rem;
}

.scenario-follow-up p {
  margin-block: 0.35rem 0.55rem;
  color: var(--muted);
  font-size: 0.72rem;
}

.scenario-ledger,
.scenario-analysis {
  position: relative;
  z-index: 2;
  padding: 1rem;
}

.scenario-ledger-list,
.scenario-channel-list {
  display: grid;
  gap: 0.55rem;
  margin-top: 0.75rem;
}

.scenario-ledger-list article {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.55rem;
  padding: 0.55rem;
  border: 1px solid rgb(255 255 255 / 78%);
  border-radius: 0.7rem;
  background: rgb(255 255 255 / 67%);
}

.scenario-ledger-marker {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
  background: var(--brand);
}

.scenario-ledger-list strong,
.scenario-ledger-list small {
  display: block;
}

.scenario-analysis-summary {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
  min-height: 4.7rem;
  margin-top: 0.7rem;
}

.scenario-analysis-summary article {
  position: relative;
  z-index: 2;
  padding: 0.55rem;
  border-radius: 0.7rem;
  background: rgb(255 255 255 / 66%);
}

.scenario-analysis-summary strong {
  display: block;
  margin-top: 0.25rem;
}

.scenario-sparkline {
  position: absolute;
  inset: auto 0 0;
  width: 100%;
  height: 2.4rem;
}

.scenario-sparkline path {
  stroke: var(--brand);
  stroke-width: 2;
  stroke-linecap: round;
}

.scenario-channel-list > div {
  display: grid;
  grid-template-columns: 5rem minmax(0, 1fr);
  align-items: center;
  gap: 0.5rem;
  color: var(--muted);
  font-size: 0.7rem;
}

.scenario-channel-list i {
  height: 0.32rem;
  overflow: hidden;
  border-radius: 999px;
  background: rgb(255 255 255 / 72%);
}

.scenario-channel-list b {
  display: block;
  width: calc(var(--scenario-channel) * 1%);
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--brand), var(--prism-violet));
  transform-origin: left;
  animation: scenario-bar-in 560ms ease both;
}

.scenario-attention {
  margin-top: 0.7rem;
  color: #164aa9;
  font-size: 0.72rem;
  font-weight: 800;
}

@keyframes scenario-bar-in {
  from { opacity: 0; transform: scaleX(0); }
  to { opacity: 1; transform: scaleX(1); }
}

@media (max-width: 1023px) {
  .scenario-showcase-grid,
  .scenario-card-main,
  .scenario-card-supporting {
    grid-template-columns: 1fr;
  }

  .scenario-supporting-stack {
    grid-template-rows: auto;
  }

  .scenario-card-main {
    min-height: 0;
  }

  .scenario-card-supporting {
    min-height: 0;
  }
}

@media (max-width: 767px) {
  .scenario-card-copy {
    padding: 1.25rem;
  }

  .scenario-card-copy h3 {
    margin-top: 1.4rem;
  }

  .scenario-dashboard {
    min-height: 23rem;
    padding: 1rem;
  }

  .scenario-metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .scenario-metric:last-child {
    display: none;
  }

  .scenario-project-heading {
    display: none;
  }

  .scenario-project-row {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .scenario-project-row > span:last-child {
    display: none;
  }

  .scenario-ledger-list article:nth-child(3),
  .scenario-channel-list > div:nth-child(3) {
    display: none;
  }

  .scenario-follow-up {
    width: calc(100% - 2rem);
  }
}
```

Extend the existing reduced-motion block with:

```css
.scenario-progress-track i,
.scenario-channel-list b {
  opacity: 1 !important;
  transform: none !important;
  animation: none !important;
  transition: none !important;
}
```

- [ ] **Step 6: Run focused tests and format/type checks**

Run:

```bash
npm test -- tests/marketing-content.test.ts tests/scenario-showcase.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 7: Run the full application check**

Run:

```bash
npm run check
```

Expected: typecheck PASS, all tests PASS, Next.js production build PASS.

- [ ] **Step 8: Commit Task 4**

```bash
git add components/marketing/scenario-showcase.tsx components/marketing/marketing-page.tsx app/globals.css tests/scenario-showcase.test.ts
git commit -m "feat: integrate responsive scenario showcases"
```

---

### Task 5: Add visual QA evidence and open the pull request

**Files:**
- Modify: `.github/workflows/ci.yml`
- Test: GitHub Actions CI and generated screenshots.

**Interfaces:**
- Consumes: standalone Next.js build from the existing CI job.
- Produces: artifact `yunyihui-scenario-visual-qa` containing six viewport images and one reduced-motion image.

- [ ] **Step 1: Add screenshot capture after the standalone runtime check**

Insert these steps before `Build production Docker image` in `.github/workflows/ci.yml`:

```yaml
      - name: Capture scenario visual QA
        shell: bash
        run: |
          set -euo pipefail
          sudo apt-get update
          sudo apt-get install -y fonts-noto-cjk
          mkdir -p visual-qa
          PORT=8081 \
          HOSTNAME=127.0.0.1 \
          DATABASE_PATH="$RUNNER_TEMP/sunyun-visual.db" \
          COOKIE_SECURE=0 \
          NEXT_TELEMETRY_DISABLED=1 \
          node .next/standalone/server.js > "$RUNNER_TEMP/sunyun-visual.log" 2>&1 &
          visual_pid=$!
          trap 'kill "$visual_pid" 2>/dev/null || true' EXIT
          for attempt in $(seq 1 20); do
            curl -fsS http://127.0.0.1:8081/api/health && break
            sleep 1
          done
          capture() {
            local name="$1"
            local size="$2"
            google-chrome --headless --no-sandbox --disable-gpu --hide-scrollbars \
              --window-size="$size" \
              --screenshot="visual-qa/$name.png" \
              http://127.0.0.1:8081/#scenarios
          }
          capture 1440x1000 1440,1000
          capture 1280x800 1280,800
          capture 1024x768 1024,768
          capture 768x1024 768,1024
          capture 390x844 390,844
          capture 375x667 375,667
          google-chrome --headless --no-sandbox --disable-gpu --hide-scrollbars \
            --force-prefers-reduced-motion \
            --window-size=1440,1000 \
            --screenshot=visual-qa/1440x1000-reduced-motion.png \
            http://127.0.0.1:8081/#scenarios
          test "$(find visual-qa -name '*.png' | wc -l)" -eq 7

      - name: Upload scenario visual QA
        uses: actions/upload-artifact@v4
        with:
          name: yunyihui-scenario-visual-qa
          path: visual-qa/*.png
          retention-days: 7
```

Do not change the existing typecheck, test, build, runtime, or Docker steps.

- [ ] **Step 2: Run local verification before pushing**

Run:

```bash
npm ci --no-audit --no-fund
npm run check
```

Expected: PASS.

- [ ] **Step 3: Commit Task 5**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: capture scenario showcase visual QA"
```

- [ ] **Step 4: Push the branch and create a draft pull request**

Push `agent/yunyihui-scenario-showcases` and open a draft PR to `main` with title:

```text
Upgrade Yunyihui scenario showcases
```

PR body:

```markdown
## 目标

将首页场景实践区升级为三个匿名真实感产品原型，展示药企业务协同、医疗机构运营台账和医药商业经营分析能力。

## 范围

- 独立场景组件与匿名展示数据
- 一主两辅桌面布局与移动端单列简化
- 场景示意统一声明
- 可访问状态文本与 reduced-motion 兜底
- 六视口及 reduced-motion 截图产物

## 保持不变

- 咨询 API 与 SQLite
- 管理员认证与 Cookie
- Docker 服务、镜像与部署路径
- 无新增 npm 依赖

## 发布状态

完成检查后保留 PR，不合并到 `main`。
```

- [ ] **Step 5: Wait for CI and inspect every gate**

Required successful steps:

```text
npm ci
npm run typecheck
npm test
npm run build
Verify standalone SQLite runtime
Capture scenario visual QA
Upload scenario visual QA
Build production Docker image
```

If a step fails, inspect its logs, fix the root cause on the same branch, and rerun the full gate.

- [ ] **Step 6: Download and review the visual artifact**

Review all seven PNGs for:

```text
- no horizontal overflow
- readable Chinese text
- main dashboard does not clip metrics, rows, or follow-up card
- supporting cards have balanced height and density
- 768px and mobile layouts are single-column
- mobile hides only low-value detail while keeping each scenario understandable
- no content overlaps the large decorative numbers
- reduced-motion image shows final bar widths with no hidden content
```

- [ ] **Step 7: Mark the PR ready only after all evidence passes**

Update the PR checklist with actual CI and visual results, mark it Ready for review, and leave it open and unmerged.

---

## Plan Self-Review

- Spec coverage: all three scenarios, disclaimer, component isolation, responsive behavior, accessibility, motion, six viewports, and non-goals map to explicit tasks.
- Placeholder scan: no `TBD`, `TODO`, deferred implementation, or undefined interface remains.
- Type consistency: all component names, data exports, import paths, and CSS custom properties match across tasks.
- Scope: no API, persistence, authentication, consultation, Docker naming, or unrelated homepage work is included.
