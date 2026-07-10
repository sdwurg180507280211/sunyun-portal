# 云医荟「医药棱镜」门户 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有通用软件门户重构为北京云医荟科技有限公司的医药产业数字化门户，完整实现已批准的「医药棱镜 / Pharma Prism」品牌、首页、商务咨询、隐私说明和响应式体验。

**Architecture:** 保持现有 Next.js 16 App Router 模块化单体、`POST /api/leads`、SQLite 与管理员后台数据结构不变。新增纯数据品牌契约、营销内容契约、服务端棱镜组件和一个轻量客户端 Reveal 组件；营销页继续服务端渲染，只有 Reveal 与现有表单增加客户端行为。

**Tech Stack:** Node.js >=22、Next.js 16.2.6、React 19.2.6、TypeScript 5.9.3、HeroUI 3.2.2、Tailwind CSS 4.3.0、Zod 4.2.1、Node `node:test` + `tsx`、SQLite `better-sqlite3` 12.11.1。

## Global Constraints

- 公司全称必须是 `北京云医荟科技有限公司`，短名称必须是 `云医荟科技`，英文辅助字标必须是 `YUNYIHUI TECHNOLOGY`。
- 门户只面向药品生产企业、医疗机构和医药商业公司三类机构客户。
- 首屏主张必须是 `让医药数字化，落到真实业务里。`
- 不出现个人医疗咨询、诊断、治疗、用药建议、虚构客户、虚构效果数字、行业排名或未经确认的资质。
- 不重命名数据库文件、Cookie、历史线索 ID 前缀、Docker 服务、镜像或部署目录；不执行数据库迁移。
- 不新增 npm 依赖；Logo、棱镜与 Open Graph 图全部使用代码原生 SVG/CSS/`ImageResponse`。
- 普通辅助正文使用 `#5B7088`；`#13B7A6` 与 `#4E83EC` 不承载普通字号白色文字。
- 动效只使用 `transform` 和 `opacity`，只执行一次，并服从 `prefers-reduced-motion`。
- 商务表单不得收集或诱导提交患者、受试者、病历、处方、身份证件或其他敏感个人信息。
- 每个任务仅提交本任务列出的文件；不得暂存 `.superpowers/` 或 `graphify-out/`。

## Scope Check

该规格虽然同时涉及品牌、公开页面、表单、隐私和后台可见文案，但它们共享同一品牌契约与同一咨询转化路径，必须作为一个可端到端验收的门户重设计交付。数据库、认证、部署和后台产品能力被明确排除或保持不变，因此不再拆成独立子项目。

## File Structure

### 新增文件

- `lib/brand.ts`：品牌、站点描述、公开边界与线索响应文案的唯一来源。
- `components/marketing/content.ts`：服务对象、解决方案、交付物、交付阶段、场景和可信原则的类型化内容。
- `components/marketing/prism-graphic.tsx`：无交互、对辅助技术隐藏的 Hero 棱镜。
- `components/marketing/reveal.tsx`：IntersectionObserver 驱动的一次性进入动画。
- `components/lead-form/submit-lead.ts`：可注入 requester 的纯提交适配器，统一成功、API 错误、非 JSON 和网络错误。
- `app/privacy/page.tsx`：商务咨询隐私说明。
- `app/icon.svg`：代码原生棱镜站点图标。
- `app/opengraph-image.tsx`：Next `ImageResponse` 社交分享图。
- `tests/brand.test.ts`：品牌契约测试。
- `tests/marketing-content.test.ts`：营销内容数量与禁用表达测试。
- `tests/visual-contract.test.ts`：棱镜无障碍、动效降级与关键区块契约测试。
- `tests/privacy-content.test.ts`：隐私说明和表单告知契约测试。
- `tests/lead-submission.test.ts`：商务咨询成功、API 错误、非 JSON 与网络失败测试。
- `tests/public-branding.test.ts`：公开文件旧品牌清理测试。

### 修改文件

- `app/layout.tsx`：metadata、Open Graph、Organization JSON-LD。
- `app/globals.css`：品牌令牌、棱镜、Reveal、页面布局、响应式和 reduced-motion。
- `app/sitemap.ts`：加入 `/privacy`。
- `app/api/health/route.ts`：公开服务标识更新为 `yunyihui-portal`。
- `app/api/leads/route.ts`：商务咨询成功文案。
- `app/admin/page.tsx`、`app/admin/login/page.tsx`：后台 metadata。
- `components/marketing/marketing-page.tsx`：完整医药棱镜首页。
- `components/lead-form/lead-form.tsx`：医药咨询字段、折叠选填项、隐私提示与错误恢复。
- `components/admin/admin-dashboard.tsx`、`components/admin/login-form.tsx`：可见品牌与 CSV 表头。
- `lib/validation/lead.ts`：单位名称改为必填。
- `tests/lead-validation.test.ts`：新的 B2B 表单规则。
- `package.json`：仅更新 description。
- `README.md`：公开品牌、业务定位与本地说明。
- `.gitignore`：忽略本地设计和关系图产物。

---

### Task 1: 建立品牌与公开文案契约

**Files:**
- Create: `lib/brand.ts`
- Create: `tests/brand.test.ts`

**Interfaces:**
- Produces: `brand` 常量与 `leadCopy` 常量；后续 metadata、营销页、隐私页、API 与后台文案统一消费。
- `brand` fields: `legalName`, `shortName`, `englishName`, `tagline`, `positioning`, `description`, `serviceId`, `consultationSource`, `disclaimer`。
- `leadCopy` fields: `accepted`, `nextStep`, `networkError`。

- [ ] **Step 1: 安装锁文件依赖**

Run:

```bash
npm ci --no-audit --no-fund --registry=https://registry.npmmirror.com
```

Expected: exit 0；`node_modules/.bin/tsx`、`node_modules/.bin/tsc` 和 `node_modules/.bin/next` 存在；`package-lock.json` 无变更。

- [ ] **Step 2: 写品牌契约失败测试**

Create `tests/brand.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import {brand, leadCopy} from "../lib/brand";

test("public brand contract uses the approved Yunyihui identity", () => {
  assert.equal(brand.legalName, "北京云医荟科技有限公司");
  assert.equal(brand.shortName, "云医荟科技");
  assert.equal(brand.englishName, "YUNYIHUI TECHNOLOGY");
  assert.equal(brand.tagline, "让医药数字化，落到真实业务里。");
  assert.equal(brand.serviceId, "yunyihui-portal");
  assert.equal(brand.consultationSource, "homepage-pharma-prism");
  assert.match(brand.description, /药企、医疗机构与医药商业公司/);
  assert.match(brand.disclaimer, /不提供个人医疗咨询、诊断、治疗或用药建议/);
});

test("lead response copy stays within business-consultation scope", () => {
  assert.equal(leadCopy.accepted, "已收到您的咨询");
  assert.match(leadCopy.nextStep, /沟通业务场景和项目范围/);
  assert.doesNotMatch(JSON.stringify(leadCopy), /精准诊断|疗效|保证成交/);
});
```

- [ ] **Step 3: 运行测试并确认 RED**

Run:

```bash
npm exec -- tsx --test tests/brand.test.ts
```

Expected: FAIL，错误包含 `Cannot find module '../lib/brand'`。

- [ ] **Step 4: 实现品牌契约**

Create `lib/brand.ts`:

```ts
export const brand = {
  legalName: "北京云医荟科技有限公司",
  shortName: "云医荟科技",
  englishName: "YUNYIHUI TECHNOLOGY",
  tagline: "让医药数字化，落到真实业务里。",
  positioning: "面向机构客户的医药产业数字化技术服务",
  description:
    "面向药企、医疗机构与医药商业公司，提供医药业务软件、数据平台、AI 工作流工具、系统集成与持续数字化服务。",
  serviceId: "yunyihui-portal",
  consultationSource: "homepage-pharma-prism",
  disclaimer:
    "本网站面向机构客户提供医药数字化技术服务，不提供个人医疗咨询、诊断、治疗或用药建议。",
} as const;

export const leadCopy = {
  accepted: "已收到您的咨询",
  nextStep: "我们将根据您留下的联系方式，与您沟通业务场景和项目范围",
  networkError: "暂时无法提交，请稍后重试或检查网络连接。",
} as const;
```

- [ ] **Step 5: 运行品牌测试并确认 GREEN**

Run:

```bash
npm exec -- tsx --test tests/brand.test.ts
```

Expected: 2 tests PASS。

- [ ] **Step 6: 提交品牌契约**

```bash
git add lib/brand.ts tests/brand.test.ts
git commit -m "feat: add yunyihui brand contract"
```

---

### Task 2: 更新 metadata、站点资产与健康标识

**Files:**
- Modify: `app/layout.tsx:1-31`
- Modify: `app/api/health/route.ts:1-14`
- Create: `app/icon.svg`
- Create: `app/opengraph-image.tsx`

**Interfaces:**
- Consumes: `brand` from `lib/brand.ts`。
- Produces: 全站 metadata、Organization JSON-LD、站点图标、社交分享图和 `yunyihui-portal` 健康标识。

- [ ] **Step 1: 将 layout 替换为品牌化 metadata 与 JSON-LD**

Replace `app/layout.tsx` with:

```tsx
import type {Metadata} from "next";
import {brand} from "@/lib/brand";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:4173";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${brand.legalName}｜医药数字化系统、数据平台与 AI 工作流`,
    template: `%s｜${brand.shortName}`,
  },
  description: brand.description,
  alternates: {canonical: "/"},
  openGraph: {
    type: "website",
    locale: "zh_CN",
    title: `${brand.shortName}｜${brand.tagline}`,
    description: brand.description,
    url: siteUrl,
    siteName: brand.shortName,
  },
};

const organizationJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: brand.legalName,
  alternateName: brand.shortName,
  url: siteUrl,
  description: brand.description,
}).replaceAll("<", "\\u003c");

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        {children}
        <script dangerouslySetInnerHTML={{__html: organizationJsonLd}} type="application/ld+json" />
      </body>
    </html>
  );
}
```

- [ ] **Step 2: 创建棱镜站点图标**

Create `app/icon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#1758D5"/>
  <path d="M19 18h25l7 10-11 22H19L12 35Z" fill="#fff" fill-opacity=".18" stroke="#fff" stroke-width="2"/>
  <path d="M20 22h8v11h9V22h8v20H20Z" fill="#fff"/>
  <path d="m35 17 13 12-9 20-5-16Z" fill="#8FB3FF" fill-opacity=".52"/>
</svg>
```

- [ ] **Step 3: 创建 Open Graph 分享图**

Create `app/opengraph-image.tsx`:

```tsx
import {ImageResponse} from "next/og";
import {brand} from "@/lib/brand";

export const alt = `${brand.shortName}｜${brand.tagline}`;
export const size = {width: 1200, height: 630};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "72px 82px",
        color: "#10233F",
        background: "linear-gradient(135deg,#FFFFFF 0%,#F3F6FA 58%,#DCE7F4 100%)",
      }}
    >
      <div style={{display: "flex", maxWidth: 720, flexDirection: "column"}}>
        <div style={{fontSize: 24, color: "#1758D5", letterSpacing: 3}}>{brand.englishName}</div>
        <div style={{marginTop: 28, fontSize: 72, fontWeight: 750, lineHeight: 1.08}}>{brand.tagline}</div>
        <div style={{marginTop: 28, fontSize: 28, color: "#5B7088"}}>{brand.description}</div>
      </div>
      <div
        style={{
          display: "flex",
          height: 300,
          width: 300,
          alignItems: "center",
          justifyContent: "center",
          clipPath: "polygon(50% 0%,96% 28%,82% 88%,53% 100%,11% 84%,0% 27%)",
          color: "white",
          background: "linear-gradient(145deg,#D8F3FF,#4E83EC 42%,#C5CEE0 70%,#7057E8)",
          fontSize: 110,
          fontWeight: 800,
        }}
      >
        云
      </div>
    </div>,
    size,
  );
}
```

- [ ] **Step 4: 更新公开健康服务标识**

Modify `app/api/health/route.ts` to import `brand` and use `brand.serviceId` in both responses:

```ts
import {brand} from "@/lib/brand";

return NextResponse.json({ok: databaseHealth(), service: brand.serviceId, version: "1.0.0"});
```

and:

```ts
return NextResponse.json({ok: false, service: brand.serviceId}, {status: 503});
```

- [ ] **Step 5: 验证类型与生产构建**

Run:

```bash
npm run typecheck
npm run build
```

Expected: both commands exit 0；Next route output includes `/opengraph-image` and existing routes remain buildable。

- [ ] **Step 6: 提交品牌基础设施**

```bash
git add app/layout.tsx app/icon.svg app/opengraph-image.tsx app/api/health/route.ts
git commit -m "feat: apply yunyihui metadata and brand assets"
```

---

### Task 3: 建立医药门户内容契约

**Files:**
- Create: `components/marketing/content.ts`
- Create: `tests/marketing-content.test.ts`

**Interfaces:**
- Produces: `navigation`, `deliverables`, `audiences`, `solutions`, `deliverySteps`, `scenarios`, `trustPrinciples`。
- Later tasks render these arrays without duplicating public copy。

- [ ] **Step 1: 写内容契约失败测试**

Create `tests/marketing-content.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import {
  audiences,
  deliverables,
  deliverySteps,
  navigation,
  scenarios,
  solutions,
  trustPrinciples,
} from "../components/marketing/content";

test("marketing content exposes the approved information architecture", () => {
  assert.equal(navigation.length, 5);
  assert.deepEqual(deliverables, ["需求蓝图", "产品原型", "权限矩阵", "接口清单", "验收清单"]);
  assert.deepEqual(audiences.map((item) => item.title), ["药品生产企业", "医疗机构", "医药商业公司"]);
  assert.equal(solutions.length, 4);
  assert.equal(deliverySteps.length, 4);
  assert.equal(scenarios.length, 3);
  assert.equal(trustPrinciples.length, 4);
  assert.match(solutions.find((item) => item.title === "AI 工作流工具")?.description || "", /人工复核/);
});

test("marketing content excludes unverified or patient-facing claims", () => {
  const copy = JSON.stringify({audiences, deliverables, deliverySteps, scenarios, solutions, trustPrinciples});
  assert.doesNotMatch(copy, /榫合云|行业领先|全面合规|精准诊断|提升疗效|三甲医院|\d+%/);
});
```

- [ ] **Step 2: 运行测试并确认 RED**

Run:

```bash
npm exec -- tsx --test tests/marketing-content.test.ts
```

Expected: FAIL，错误包含 `Cannot find module '../components/marketing/content'`。

- [ ] **Step 3: 实现内容契约**

Create `components/marketing/content.ts`:

```ts
export const navigation = [
  {label: "解决方案", href: "#solutions"},
  {label: "服务对象", href: "#audiences"},
  {label: "技术与交付", href: "#delivery"},
  {label: "场景实践", href: "#scenarios"},
  {label: "关于云医荟", href: "#about"},
] as const;

export const deliverables = ["需求蓝图", "产品原型", "权限矩阵", "接口清单", "验收清单"] as const;

export const audiences = [
  {index: "01", eyebrow: "PHARMA ENTERPRISE", title: "药品生产企业", description: "项目协同、资料与知识管理、商业运营数据、客户与活动流程工具。"},
  {index: "02", eyebrow: "MEDICAL INSTITUTION", title: "医疗机构", description: "院内非诊疗业务流程、运营数据、台账管理和知识协作工具。"},
  {index: "03", eyebrow: "PHARMA COMMERCE", title: "医药商业公司", description: "客户与渠道协同、经营数据、订单库存信息连接和业务看板。"},
] as const;

export const solutions = [
  {index: "01", eyebrow: "BUSINESS SOFTWARE", icon: "▦", title: "医药业务系统", description: "围绕客户、项目、资料、审批和运营等场景，建设角色清晰、流程可追踪的业务系统。"},
  {index: "02", eyebrow: "DATA PLATFORM", icon: "◫", title: "数据平台与分析", description: "梳理多源数据、指标口径与权限边界，建设查询、分析、看板与数据服务能力。"},
  {index: "03", eyebrow: "AI WORKFLOW", icon: "✦", title: "AI 工作流工具", description: "将 AI 用于资料整理、知识检索、内容辅助和流程自动化，并为关键结果设置人工复核节点。"},
  {index: "04", eyebrow: "INTEGRATION", icon: "⇄", title: "系统集成与持续服务", description: "根据已有系统、接口条件、数据质量和授权范围评估连接方式，并提供上线支持与持续迭代。"},
] as const;

export const deliverySteps = [
  {index: "01", title: "场景与边界", description: "确认角色、流程、目标、数据类型和适用要求。"},
  {index: "02", title: "蓝图与原型", description: "形成需求蓝图、交互原型、权限矩阵和阶段范围。"},
  {index: "03", title: "研发与验证", description: "按阶段演示、持续联调并对照验收清单确认。"},
  {index: "04", title: "上线与迭代", description: "完成部署、培训与问题跟踪，按约定持续演进。"},
] as const;

export const scenarios = [
  {index: "01", title: "药企业务协同平台", description: "统一客户、项目、资料、活动与跟进记录，让协作过程可见，信息沉淀可用。"},
  {index: "02", title: "非诊疗运营工具", description: "面向医疗机构的运营流程、台账和知识协作。"},
  {index: "03", title: "经营与渠道协同", description: "连接客户、渠道和经营数据，形成统一业务视图。"},
] as const;

export const trustPrinciples = [
  {index: "01", title: "最小权限", description: "角色与访问边界"},
  {index: "02", title: "关键留痕", description: "重要操作可追踪"},
  {index: "03", title: "人工复核", description: "AI 关键结果保留确认节点"},
  {index: "04", title: "备份恢复", description: "明确数据保护策略"},
] as const;
```

- [ ] **Step 4: 运行内容测试并确认 GREEN**

Run:

```bash
npm exec -- tsx --test tests/marketing-content.test.ts
```

Expected: 2 tests PASS。

- [ ] **Step 5: 提交内容契约**

```bash
git add components/marketing/content.ts tests/marketing-content.test.ts
git commit -m "feat: define pharma portal content"
```

---

### Task 4: 实现棱镜图形与一次性 Reveal 动效

**Files:**
- Create: `components/marketing/prism-graphic.tsx`
- Create: `components/marketing/reveal.tsx`
- Create: `tests/visual-contract.test.ts`
- Modify: `app/globals.css:4-150`

**Interfaces:**
- Produces: `PrismGraphic(): JSX.Element` 与 `Reveal({children, className?, delay?})`。
- `Reveal` renders a `div` with class `reveal`, `data-visible`, and CSS custom property `--reveal-delay`。

- [ ] **Step 1: 写视觉契约失败测试**

Create `tests/visual-contract.test.ts`:

```ts
import assert from "node:assert/strict";
import {existsSync, readFileSync} from "node:fs";
import {resolve} from "node:path";
import test from "node:test";

const root = resolve(new URL("..", import.meta.url).pathname);
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

test("decorative prism is hidden from assistive technology", () => {
  const path = resolve(root, "components/marketing/prism-graphic.tsx");
  assert.equal(existsSync(path), true);
  assert.match(readFileSync(path, "utf8"), /aria-hidden="true"/);
});

test("motion and color tokens honor accessibility constraints", () => {
  const css = read("app/globals.css");
  assert.match(css, /--brand:\s*#1758d5/i);
  assert.match(css, /--muted:\s*#5b7088/i);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /\.reveal\s*\{[^}]*opacity:\s*1/s);
  assert.match(css, /\.reveal\[data-state="visible"\]/);
  assert.doesNotMatch(css, /animation:\s*[^;]*infinite/i);
});
```

- [ ] **Step 2: 运行测试并确认 RED**

Run:

```bash
npm exec -- tsx --test tests/visual-contract.test.ts
```

Expected: FAIL；`prism-graphic.tsx` 不存在，且 CSS 不包含 `--brand: #1758d5`。

- [ ] **Step 3: 实现服务端棱镜组件**

Create `components/marketing/prism-graphic.tsx`:

```tsx
export function PrismGraphic() {
  return (
    <div aria-hidden="true" className="prism-graphic">
      <span className="prism-axis prism-axis-x" />
      <span className="prism-axis prism-axis-y" />
      <span className="prism-axis-label prism-axis-business">BUSINESS DIMENSION</span>
      <span className="prism-axis-label prism-axis-data">DATA DIMENSION</span>
      <span className="prism-polyhedron"><span className="prism-facet" /></span>
      <span className="prism-label prism-label-one"><small>INPUT 01</small><b><i />角色与业务流程</b></span>
      <span className="prism-label prism-label-two"><small>INPUT 02</small><b><i />数据与接口条件</b></span>
      <span className="prism-label prism-label-three"><small>OUTPUT</small><b><i />可验收数字系统</b></span>
    </div>
  );
}
```

- [ ] **Step 4: 实现 Reveal 客户端组件**

Create `components/marketing/reveal.tsx`:

```tsx
"use client";

import {useEffect, useRef, useState, type CSSProperties, type ReactNode} from "react";

export function Reveal({children, className = "", delay = 0}: {children: ReactNode; className?: string; delay?: number}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "hidden" | "visible">("idle");

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      setState("visible");
      return;
    }
    if (element.getBoundingClientRect().top <= window.innerHeight * 0.92) {
      setState("visible");
      return;
    }
    setState("hidden");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setState("visible");
        observer.disconnect();
      },
      {rootMargin: "0px 0px -8% 0px", threshold: 0.12},
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`reveal ${className}`.trim()}
      data-state={state}
      ref={ref}
      style={{"--reveal-delay": `${delay}ms`} as CSSProperties}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 5: 更新全局令牌、背景、棱镜和 Reveal CSS**

Replace the existing `:root`, `html`, `body`, `.site-shell`, `.glass-panel`, `.section-kicker`, `.section-title`, and `.section-copy` blocks with:

```css
:root {
  --background: #f3f6fa;
  --surface: #ffffff;
  --surface-secondary: #edf2f7;
  --surface-tertiary: #dce7f4;
  --foreground: #10233f;
  --brand: #1758d5;
  --brand-light: #4e83ec;
  --brand-soft: #dce7f4;
  --accent: var(--brand);
  --accent-foreground: #ffffff;
  --signal: #13b7a6;
  --prism-violet: #7057e8;
  --border: #d8e3ef;
  --muted: #5b7088;
  --radius-sm: 0.5rem;
  --radius-md: 0.875rem;
  --radius-lg: 1.375rem;
}

html {scroll-behavior: smooth; background: var(--background);}
body {
  margin: 0;
  color: var(--foreground);
  background: var(--background);
  font-family: Inter, "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
  text-rendering: optimizeLegibility;
}
::selection {color: #ffffff; background: var(--brand);}
.site-shell {width: min(1200px, calc(100% - 2rem)); margin-inline: auto;}
.section-kicker {color: var(--brand); font-size: .75rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase;}
.section-title {margin-top: .75rem; max-width: 800px; font-size: clamp(2rem, 4vw, 3.5rem); font-weight: 740; line-height: 1.08; letter-spacing: -.025em;}
.section-copy {max-width: 720px; color: var(--muted); font-size: 1rem; line-height: 1.85;}
.prism-grid-bg {
  background-image: linear-gradient(90deg, rgb(112 137 164 / 8%) 1px, transparent 1px), linear-gradient(rgb(112 137 164 / 8%) 1px, transparent 1px), linear-gradient(145deg, #fff, #f2f6fa 62%, #eaf0f7);
  background-size: 58px 58px, 58px 58px, auto;
}
.reveal {opacity: 1; transform: none;}
.reveal[data-state="hidden"] {opacity: 0; transform: translateY(10px);}
.reveal[data-state="visible"] {opacity: 1; transform: translateY(0); transition: opacity 520ms ease var(--reveal-delay), transform 520ms ease var(--reveal-delay);}
```

Append the prism styles:

```css
.prism-graphic {position: relative; width: min(42vw, 470px); aspect-ratio: 1; margin-inline: auto;}
.prism-axis {position: absolute; background: rgb(45 79 117 / 17%);}
.prism-axis-x {left: 2%; right: 2%; bottom: 12%; height: 1px; transform-origin: left; animation: prism-axis-in 620ms ease both;}
.prism-axis-y {top: 2%; bottom: 2%; left: 8%; width: 1px; transform-origin: bottom; animation: prism-axis-in-y 620ms ease both;}
.prism-axis-label {position: absolute; color: #5b7088; font-size: .66rem; font-weight: 800; letter-spacing: .08em;}
.prism-axis-business {left: 11%; top: 0;}.prism-axis-data {right: 0; bottom: 14%;}
.prism-polyhedron {position: absolute; inset: 9% 8% 13% 12%; clip-path: polygon(50% 0,96% 28%,82% 88%,53% 100%,11% 84%,0 27%); background: linear-gradient(145deg,rgb(241 252 255 / 94%),rgb(78 131 236 / 82%) 38%,rgb(200 210 230 / 86%) 64%,rgb(112 87 232 / 69%)); filter: drop-shadow(0 30px 35px rgb(54 86 148 / 20%)); animation: prism-enter 640ms cubic-bezier(.2,.7,.2,1) both;}
.prism-facet {position: absolute; inset: 16%; clip-path: polygon(50% 0,100% 40%,73% 100%,9% 83%,0 25%); border: 1px solid rgb(255 255 255 / 72%); background: rgb(255 255 255 / 12%);}
.prism-label {position: absolute; z-index: 2; min-width: 9.5rem; padding: .75rem .8rem; border: 1px solid rgb(255 255 255 / 78%); border-radius: .7rem; background: rgb(255 255 255 / 72%); box-shadow: 0 14px 34px rgb(37 68 111 / 12%); backdrop-filter: blur(14px); animation: prism-label-in 500ms ease both;}
.prism-label small {display: block; color: #5b7088; font-size: .62rem; letter-spacing: .08em;}.prism-label b {display: block; margin-top: .35rem; font-size: .78rem;}.prism-label i {display: inline-block; width: .35rem; height: .35rem; margin-right: .45rem; border-radius: 50%; background: var(--brand);}
.prism-label-one {left: 0; top: 24%; animation-delay: 160ms;}.prism-label-two {right: 0; top: 46%; animation-delay: 240ms;}.prism-label-three {left: 12%; bottom: 2%; animation-delay: 320ms;}
@keyframes prism-enter {from {opacity: 0; transform: translateY(12px) scale(.97);} to {opacity: 1; transform: translateY(0) scale(1);}}
@keyframes prism-label-in {from {opacity: 0; transform: translateY(8px);} to {opacity: 1; transform: translateY(0);}}
@keyframes prism-axis-in {from {transform: scaleX(0);} to {transform: scaleX(1);}}
@keyframes prism-axis-in-y {from {transform: scaleY(0);} to {transform: scaleY(1);}}
@media (max-width: 767px) {
  .prism-graphic {width: min(88vw, 360px);}
  .prism-label {min-width: 7.5rem; padding: .55rem .6rem; backdrop-filter: none;}
  .prism-label small {font-size: .55rem;}.prism-label b {font-size: .68rem;}
}
```

Keep the existing form and admin table rules, but change their color references to the new variables. Extend the existing reduced-motion block so it also contains:

```css
.reveal,
.prism-axis,
.prism-polyhedron,
.prism-label {
  opacity: 1 !important;
  transform: none !important;
  animation: none !important;
  transition: none !important;
}
```

- [ ] **Step 6: 运行视觉契约、类型检查与构建**

Run:

```bash
npm exec -- tsx --test tests/visual-contract.test.ts
npm run typecheck
npm run build
```

Expected: 2 tests PASS；typecheck 和 build exit 0。

- [ ] **Step 7: 提交视觉原语**

```bash
git add components/marketing/prism-graphic.tsx components/marketing/reveal.tsx app/globals.css tests/visual-contract.test.ts
git commit -m "feat: add pharma prism visual system"
```

---

### Task 5: 组装完整医药棱镜首页

**Files:**
- Modify: `components/marketing/marketing-page.tsx:1-128`
- Modify: `tests/visual-contract.test.ts`

**Interfaces:**
- Consumes: `brand`, all exports from `components/marketing/content.ts`, `PrismGraphic`, `Reveal`, `LeadForm`。
- Produces: section anchors `top`, `audiences`, `solutions`, `delivery`, `scenarios`, `about`, `contact`。

- [ ] **Step 1: 扩展视觉契约测试并确认旧首页失败**

Append to `tests/visual-contract.test.ts`:

```ts
test("marketing page exposes the approved Pharma Prism sections", () => {
  const source = read("components/marketing/marketing-page.tsx");
  for (const id of ["audiences", "solutions", "delivery", "scenarios", "about", "contact"]) {
    assert.match(source, new RegExp(`id=["']${id}["']`));
  }
  assert.match(source, /PrismGraphic/);
  assert.match(source, /让医药数字化/);
  assert.doesNotMatch(source, /Delivery console|88\s*-|index \* 14|榫合云/);
});
```

Run:

```bash
npm exec -- tsx --test tests/visual-contract.test.ts
```

Expected: FAIL because the current page has none of the new section IDs and still contains `Delivery console`。

- [ ] **Step 2: 替换营销页结构**

Replace `components/marketing/marketing-page.tsx` with a server component that follows this exact hierarchy and consumes the shared arrays:

```tsx
import {LeadForm} from "@/components/lead-form/lead-form";
import {PrismGraphic} from "@/components/marketing/prism-graphic";
import {Reveal} from "@/components/marketing/reveal";
import {
  audiences,
  deliverables,
  deliverySteps,
  navigation,
  scenarios,
  solutions,
  trustPrinciples,
} from "@/components/marketing/content";
import {brand} from "@/lib/brand";

const primaryLink = "inline-flex min-h-11 items-center justify-center rounded-lg bg-[var(--brand)] px-5 py-3 text-sm font-extrabold text-white shadow-[0_12px_28px_rgba(23,88,213,.2)] transition hover:-translate-y-0.5 hover:brightness-95 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/25";
const secondaryLink = "inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--border)] bg-white/80 px-5 py-3 text-sm font-extrabold text-[var(--foreground)] transition hover:border-blue-300 hover:bg-white focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/20";

export function MarketingPage() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/90 backdrop-blur-xl">
        <div className="site-shell flex min-h-17 items-center justify-between gap-5">
          <a aria-label={`${brand.shortName}首页`} className="flex items-center gap-3" href="#top">
            <span className="grid size-9 place-items-center overflow-hidden rounded-lg bg-[var(--brand)] text-sm font-black text-white">云</span>
            <span><strong className="block text-sm tracking-wide">{brand.shortName}</strong><small className="block text-[.62rem] tracking-[.13em] text-[var(--muted)]">{brand.englishName}</small></span>
          </a>
          <nav aria-label="主导航" className="hidden items-center gap-7 text-sm text-[var(--muted)] lg:flex">
            {navigation.map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}
          </nav>
          <a className={`${primaryLink} px-4 py-2`} href="#contact">商务咨询 ↗</a>
        </div>
      </header>

      <main className="overflow-hidden" id="top">
      <section className="prism-grid-bg relative grid min-h-[700px] lg:grid-cols-[1.05fr_.95fr]">
        <div className="relative z-10 flex items-center px-4 py-20 sm:px-8 lg:px-[max(8vw,2rem)]">
          <div className="max-w-3xl">
            <p className="section-kicker">面向机构客户 · 医药产业数字化技术服务</p>
            <h1 className="mt-7 text-[clamp(2.75rem,6vw,5.2rem)] font-[750] leading-[1.03] tracking-[-.025em]">让医药数字化，<br /><span className="text-[var(--brand)]">落到真实业务里。</span></h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-lg">{brand.description}从场景梳理、系统建设与数据连接，到上线支持与持续迭代。</p>
            <div className="mt-8 flex flex-wrap gap-3"><a className={primaryLink} href="#contact">预约方案沟通 ↗</a><a className={secondaryLink} href="#solutions">查看解决方案</a></div>
            <p className="mt-7 text-sm text-[var(--muted)]">{brand.disclaimer}</p>
          </div>
        </div>
        <div className="flex min-h-[440px] items-center justify-center px-4 pb-16 lg:min-h-0 lg:pb-0"><PrismGraphic /></div>
      </section>

      <section aria-label="项目交付物" className="border-y border-[var(--border)] bg-white">
        <div className="site-shell grid grid-cols-2 md:grid-cols-6"><p className="col-span-2 border-b border-[var(--border)] py-5 text-xs font-bold tracking-[.12em] text-[var(--muted)] md:col-span-1 md:border-b-0">DELIVERABLES</p>{deliverables.map((item) => <p className="border-l border-[var(--border)] py-5 text-center text-sm font-bold" key={item}>{item}</p>)}</div>
      </section>

      <section className="site-shell scroll-mt-20 py-24" id="audiences">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div><p className="section-kicker">01 · Who we serve</p><h2 className="section-title">理解不同机构的业务语境，再谈系统方案。</h2></div><p className="section-copy">我们只展示已经确认的三类核心服务对象，让定位清晰，也让每种方案从真实组织方式出发。</p></div>
        <div className="mt-12 grid gap-4 lg:grid-cols-3">{audiences.map((item, index) => <Reveal delay={index * 80} key={item.title}><article className="relative min-h-64 overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-br from-white to-[var(--background)] p-7"><span className="absolute right-6 top-4 text-5xl font-black text-[var(--brand-soft)]">{item.index}</span><p className="section-kicker">{item.eyebrow}</p><h3 className="mt-20 text-2xl font-bold">{item.title}</h3><p className="mt-4 leading-7 text-[var(--muted)]">{item.description}</p></article></Reveal>)}</div>
      </section>

      <section className="scroll-mt-20 bg-[var(--background)] py-24" id="solutions"><div className="site-shell"><div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div><p className="section-kicker">02 · Solutions</p><h2 className="section-title">围绕医药业务场景，建设可落地的数字化能力。</h2></div><p className="section-copy">先确认角色、流程、数据与系统边界，再确定建设范围与实施节奏。</p></div><div className="mt-12 grid gap-4 lg:grid-cols-12">{solutions.map((item, index) => <Reveal className={index === 0 || index === 3 ? "lg:col-span-7" : "lg:col-span-5"} delay={index * 70} key={item.title}><article className="relative min-h-60 rounded-2xl border border-[var(--border)] bg-white p-7"><span className="absolute right-6 top-6 grid size-11 place-items-center rounded-xl border border-[var(--border)] bg-[var(--background)] text-xl text-[var(--brand)]">{item.icon}</span><p className="section-kicker">{item.index} / {item.eyebrow}</p><h3 className="mt-16 text-2xl font-bold">{item.title}</h3><p className="mt-4 max-w-2xl leading-7 text-[var(--muted)]">{item.description}</p></article></Reveal>)}</div></div></section>

      <section className="scroll-mt-20 bg-[var(--foreground)] py-24 text-white" id="delivery"><div className="site-shell"><p className="section-kicker text-blue-300">03 · From data to action</p><h2 className="section-title">把医药数据，变成清晰的行动依据。</h2><p className="section-copy mt-5 text-slate-300">多源输入经过口径、权限和流程治理，形成可理解、可追踪、可验收的业务视图。</p><div className="mt-12 grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr]"><article className="rounded-2xl border border-white/15 bg-white/5 p-7"><p className="text-xs tracking-[.12em] text-blue-300">INPUT</p><h3 className="mt-10 text-xl font-bold">多源业务信息</h3><p className="mt-4 leading-7 text-slate-300">现有系统与表格、客户项目与渠道记录、授权知识与内容资料。</p></article><span className="grid place-items-center text-2xl text-blue-300 max-lg:rotate-90">→</span><article className="rounded-2xl border border-white/15 bg-white/5 p-7"><p className="text-xs tracking-[.12em] text-blue-300">STRUCTURE</p><h3 className="mt-10 text-xl font-bold">统一与治理</h3><p className="mt-4 leading-7 text-slate-300">角色权限、指标口径、接口条件与 AI 人工复核节点。</p></article><span className="grid place-items-center text-2xl text-blue-300 max-lg:rotate-90">→</span><article className="rounded-2xl border border-blue-400/35 bg-blue-500/10 p-7"><p className="text-xs tracking-[.12em] text-blue-300">OUTPUT</p><h3 className="mt-10 text-xl font-bold">可用数字能力</h3><p className="mt-4 leading-7 text-slate-300">业务系统、协作工具、专题分析与持续迭代能力。</p></article></div><div className="mt-20 grid border-y border-white/15 md:grid-cols-4">{deliverySteps.map((item) => <article className="min-h-56 border-white/15 p-6 md:border-r" key={item.index}><span className="grid size-9 place-items-center rounded-lg border border-blue-300/30 text-xs text-blue-200">{item.index}</span><h3 className="mt-14 text-xl font-bold">{item.title}</h3><p className="mt-3 leading-7 text-slate-300">{item.description}</p></article>)}</div></div></section>

      <section className="site-shell scroll-mt-20 py-24" id="scenarios"><p className="section-kicker">04 · Scenario examples</p><h2 className="section-title">从一个关键场景开始，连接真实业务链。</h2><p className="section-copy mt-5">以下均为场景示意，不代表未经授权的客户案例或效果承诺。</p><div className="mt-12 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">{scenarios.map((item, index) => <article className={`relative overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-7 ${index === 0 ? "min-h-80 lg:row-span-2" : "min-h-40"}`} key={item.title}><p className="section-kicker">SCENARIO {item.index}</p><h3 className="mt-12 text-2xl font-bold">{item.title}</h3><p className="mt-4 max-w-xl leading-7 text-[var(--muted)]">{item.description}</p><span className="absolute bottom-4 right-6 text-6xl font-black text-[var(--brand-soft)]">{item.index}</span></article>)}</div></section>

      <section className="scroll-mt-20 bg-white py-24" id="about"><div className="site-shell"><div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div><p className="section-kicker">05 · Trust by design</p><h2 className="section-title">可信来自清晰边界与可验证交付。</h2></div><p className="section-copy">根据项目用途共同确认数据类型、角色权限、部署方式、日志与备份要求。</p></div><div className="mt-12 grid border-y border-[var(--border)] sm:grid-cols-2 lg:grid-cols-4">{trustPrinciples.map((item) => <article className="min-h-44 border-[var(--border)] p-6 sm:border-r" key={item.index}><span className="text-lg text-[var(--brand)]">{item.index}</span><h3 className="mt-10 font-bold">{item.title}</h3><p className="mt-2 text-sm text-[var(--muted)]">{item.description}</p></article>)}</div></div></section>

      <section className="site-shell scroll-mt-20 py-24" id="contact"><div className="grid gap-12 rounded-[1.5rem] bg-[var(--foreground)] p-6 text-white sm:p-10 lg:grid-cols-[.75fr_1.25fr] lg:p-14"><div><p className="section-kicker text-blue-300">Business inquiry</p><h2 className="mt-5 text-4xl font-bold tracking-[-.02em]">从一个明确的业务场景开始。</h2><p className="mt-6 leading-8 text-slate-300">请简要说明当前流程与希望改善的环节，无需上传业务数据或完整需求文档。</p><p className="mt-8 border-l-2 border-blue-300 pl-4 text-sm leading-6 text-slate-300">请勿提交患者、受试者、病历、处方、身份证件或其他敏感个人信息。</p></div><LeadForm /></div></section>
      </main>

      <footer className="border-t border-[var(--border)] bg-[var(--background)] py-10"><div className="site-shell flex flex-col justify-between gap-4 text-sm text-[var(--muted)] lg:flex-row"><p>© 2026 {brand.legalName}</p><div className="max-w-3xl lg:text-right"><a className="font-bold text-[var(--brand)]" href="/privacy">隐私说明</a><p className="mt-2">{brand.disclaimer}</p></div></div></footer>
    </>
  );
}
```

- [ ] **Step 3: 运行结构测试、类型检查与构建**

Run:

```bash
npm exec -- tsx --test tests/visual-contract.test.ts tests/marketing-content.test.ts
npm run typecheck
npm run build
```

Expected: all selected tests PASS；typecheck 与 build exit 0。

- [ ] **Step 4: 提交完整首页**

```bash
git add components/marketing/marketing-page.tsx tests/visual-contract.test.ts
git commit -m "feat: build pharma prism marketing page"
```

---

### Task 6: 重构商务咨询、校验与隐私说明

**Files:**
- Modify: `lib/validation/lead.ts:3-22`
- Modify: `tests/lead-validation.test.ts:1-13`
- Modify: `components/lead-form/lead-form.tsx:1-113`
- Create: `components/lead-form/submit-lead.ts`
- Modify: `app/api/leads/route.ts:1-100`
- Modify: `app/sitemap.ts:1-13`
- Create: `app/privacy/page.tsx`
- Create: `tests/privacy-content.test.ts`
- Create: `tests/lead-submission.test.ts`

**Interfaces:**
- Consumes: `brand`, `leadCopy`。
- Preserves: existing POST JSON keys and SQLite schema。
- Produces: `submitLead(payload, request?)`, `/privacy` static page and source value `homepage-pharma-prism`。

- [ ] **Step 1: 写表单与隐私失败测试**

Replace `tests/lead-validation.test.ts` with:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import {parseLeadInput} from "../lib/validation/lead";

const completeLead = {
  serviceType: "医药业务系统",
  companyName: "示例药企",
  contactName: "赵先生",
  phone: "13800138000",
  description: "希望梳理客户协同流程并建设可持续迭代的业务系统。",
  consent: true,
};

test("lead validation accepts an institutional pharma inquiry", () => {
  assert.equal(parseLeadInput(completeLead).success, true);
});

test("lead validation requires an organization name", () => {
  assert.equal(parseLeadInput({...completeLead, companyName: "   "}).success, false);
  const {companyName: _companyName, ...withoutCompanyName} = completeLead;
  assert.equal(parseLeadInput(withoutCompanyName).success, false);
});

test("lead validation rejects invalid phone and short description", () => {
  assert.equal(parseLeadInput({...completeLead, phone: "abc", description: "太短"}).success, false);
});

test("privacy inquiry is accepted without collecting medical data", () => {
  const result = parseLeadInput({
    ...completeLead,
    serviceType: "隐私与个人信息",
    source: "homepage-pharma-prism",
    patientName: "不应进入线索数据",
    prescription: "不应进入线索数据",
  });
  assert.equal(result.success, true);
  if (!result.success) return;
  assert.equal("patientName" in result.data, false);
  assert.equal("prescription" in result.data, false);
  assert.equal(result.data.source, "homepage-pharma-prism");
});

test("lead validation preserves existing limits and requires consent", () => {
  assert.equal(parseLeadInput({...completeLead, description: "医".repeat(1201)}).success, false);
  assert.equal(parseLeadInput({...completeLead, wechat: "x".repeat(61)}).success, false);
  const {consent: _consent, ...withoutConsent} = completeLead;
  assert.equal(parseLeadInput(withoutConsent).success, false);
});
```

Create `tests/privacy-content.test.ts`:

```ts
import assert from "node:assert/strict";
import {existsSync, readFileSync} from "node:fs";
import {resolve} from "node:path";
import test from "node:test";

const root = resolve(new URL("..", import.meta.url).pathname);

test("privacy page discloses technical data, retention, and sensitive-data limits", () => {
  const path = resolve(root, "app/privacy/page.tsx");
  assert.equal(existsSync(path), true);
  const source = readFileSync(path, "utf8");
  assert.match(source, /IP 地址/);
  assert.match(source, /User-Agent/);
  assert.match(source, /12 个月/);
  assert.match(source, /病历|处方/);
  assert.match(source, /隐私与个人信息/);
});

test("lead form links privacy notice and warns against sensitive submissions", () => {
  const source = readFileSync(resolve(root, "components/lead-form/lead-form.tsx"), "utf8");
  assert.match(source, /href="\/privacy"/);
  assert.match(source, /患者、受试者、病历、处方/);
  assert.match(source, /brand\.consultationSource/);
});
```

Create `tests/lead-submission.test.ts`:

```ts
import assert from "node:assert/strict";
import {existsSync} from "node:fs";
import {resolve} from "node:path";
import {pathToFileURL} from "node:url";
import test from "node:test";

type Requester = (url: string, init: RequestInit) => Promise<Response>;
type SubmitLead = (
  payload: Record<string, FormDataEntryValue>,
  request?: Requester,
) => Promise<{type: "success" | "error"; message: string}>;

async function getSubmitLead(): Promise<SubmitLead> {
  const path = resolve(new URL("..", import.meta.url).pathname, "components/lead-form/submit-lead.ts");
  assert.equal(existsSync(path), true, "submit-lead adapter should exist");
  const module = (await import(pathToFileURL(path).href)) as {submitLead?: SubmitLead};
  assert.equal(typeof module.submitLead, "function", "adapter should export submitLead");
  return module.submitLead as SubmitLead;
}

const jsonResponse = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {"content-type": "application/json"},
  });

test("submitLead formats the successful business enquiry", async () => {
  const submitLead = await getSubmitLead();
  const result = await submitLead(
    {companyName: "示例药企"},
    async () => jsonResponse({
      ok: true,
      id: "SY-20260710-ABC123",
      message: "已收到您的咨询",
      nextStep: "我们将根据您留下的联系方式，与您沟通业务场景和项目范围",
    }, 201),
  );
  assert.deepEqual(result, {
    type: "success",
    message: "已收到您的咨询（编号 SY-20260710-ABC123）。我们将根据您留下的联系方式，与您沟通业务场景和项目范围",
  });
});

test("submitLead preserves a Chinese API error", async () => {
  const submitLead = await getSubmitLead();
  const result = await submitLead({}, async () =>
    jsonResponse({ok: false, message: "提交过于频繁，请稍后再试"}, 429));
  assert.deepEqual(result, {type: "error", message: "提交过于频繁，请稍后再试"});
});

test("submitLead falls back for non-JSON and network failures", async () => {
  const submitLead = await getSubmitLead();
  const nonJson = await submitLead({}, async () =>
    new Response("<html>proxy error</html>", {status: 502}));
  assert.deepEqual(nonJson, {type: "error", message: "暂时无法提交，请稍后重试或检查网络连接。"});
  const offline = await submitLead({}, async () => {
    throw new TypeError("fetch failed");
  });
  assert.deepEqual(offline, {type: "error", message: "暂时无法提交，请稍后重试或检查网络连接。"});
});
```

- [ ] **Step 2: 运行测试并确认 RED**

Run:

```bash
npm exec -- tsx --test tests/lead-validation.test.ts tests/privacy-content.test.ts tests/lead-submission.test.ts
```

Expected: FAIL because blank/missing `companyName` currently succeeds, `/privacy` does not exist, the form contains the old source, and `submit-lead.ts` does not exist。

- [ ] **Step 3: 收紧单位名称校验**

In `lib/validation/lead.ts`, add a helper beside `text` so a missing value and an all-whitespace value share the same Chinese error:

```ts
const requiredText = (max: number, message: string) =>
  z.preprocess(
    (value) => value ?? "",
    z.string().trim().min(1, message).max(max),
  );
```

Then replace the `companyName` field with:

```ts
companyName: requiredText(80, "请填写单位名称"),
```

- [ ] **Step 4: 实现纯提交适配器**

Create `components/lead-form/submit-lead.ts`:

```ts
import {leadCopy} from "@/lib/brand";

export type SubmitState = {type: "success" | "error"; message: string};
type Requester = (url: string, init: RequestInit) => Promise<Response>;
type LeadResponse = {ok: boolean; id?: string; message?: string; nextStep?: string};

export async function submitLead(
  payload: Record<string, FormDataEntryValue>,
  request: Requester = fetch,
): Promise<SubmitState> {
  try {
    const response = await request("/api/leads", {
      method: "POST",
      headers: {"content-type": "application/json"},
      body: JSON.stringify(payload),
    });
    if (!response.headers.get("content-type")?.includes("application/json")) {
      return {type: "error", message: leadCopy.networkError};
    }
    const data = (await response.json()) as LeadResponse;
    if (!response.ok || !data.ok) {
      return {type: "error", message: data.message || leadCopy.networkError};
    }
    const id = data.id ? `（编号 ${data.id}）` : "";
    const nextStep = data.nextStep ? `。${data.nextStep}` : "";
    return {
      type: "success",
      message: `${data.message || leadCopy.accepted}${id}${nextStep}`,
    };
  } catch {
    return {type: "error", message: leadCopy.networkError};
  }
}
```

- [ ] **Step 5: 重构 LeadForm**

Keep the existing `SubmitState` and `FormData` approach, and make these exact behavior changes:

```tsx
const consultationOptions = [
  "医药业务系统",
  "数据平台与分析",
  "AI 工作流工具",
  "系统集成",
  "数字化咨询与原型",
  "隐私与个人信息",
] as const;
```

Import the pure adapter and the shared brand contract:

```tsx
import {submitLead, type SubmitState} from "@/components/lead-form/submit-lead";
import {brand} from "@/lib/brand";
```

Replace `onSubmit` with:

```tsx
async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
  setSubmitting(true);
  setResult({type: "idle", message: ""});
  const form = event.currentTarget;
  try {
    const outcome = await submitLead(Object.fromEntries(new FormData(form).entries()));
    setResult(outcome);
    if (outcome.type === "success") form.reset();
  } finally {
    setSubmitting(false);
  }
}
```

Remove the old local `SubmitState` alias, add `type FormState = {type: "idle" | SubmitState["type"]; message: string};`, and initialize `useState<FormState>({type: "idle", message: ""})` so the initial state remains `idle`。

The rendered form must use these exact labels and structure:

```tsx
<Form className="grid gap-4" onSubmit={onSubmit}>
  <div className="form-grid">
    <div className="form-field">
      <label htmlFor="serviceType">咨询方向 *</label>
      <select className="native-control" defaultValue="" id="serviceType" name="serviceType" required>
        <option disabled value="">请选择咨询方向</option>
        {consultationOptions.map((option) => <option key={option}>{option}</option>)}
      </select>
    </div>
    <TextField isRequired name="companyName"><Label>单位名称</Label><Input placeholder="公司或机构名称" /></TextField>
    <TextField isRequired name="contactName"><Label>联系人</Label><Input placeholder="怎么称呼您" /></TextField>
    <TextField isRequired name="phone"><Label>联系电话</Label><Input inputMode="tel" placeholder="手机或座机" /></TextField>
  </div>
  <TextField isRequired minLength={10} name="description">
    <Label>业务场景与目标</Label>
    <TextArea rows={6} placeholder="请简要说明当前流程、主要使用角色、已有系统或数据条件，以及希望改善的环节。" />
  </TextField>
  <p className="rounded-lg border border-blue-200/25 bg-blue-400/10 p-3 text-sm leading-6 text-slate-200">请勿填写患者、受试者、病历、处方、身份证件或其他敏感个人信息。</p>
  <details className="rounded-xl border border-white/15 bg-white/5 p-4">
    <summary className="cursor-pointer font-bold">补充信息（选填）</summary>
    <div className="form-grid mt-4">
      <TextField name="wechat"><Label>微信</Label><Input /></TextField>
      <TextField name="city"><Label>所在地区</Label><Input /></TextField>
      <TextField name="expectedDate"><Label>期望启动时间</Label><Input /></TextField>
      <TextField name="scale"><Label>预期使用范围</Label><Input /></TextField>
      <TextField name="budget"><Label>预算情况</Label><Input /></TextField>
    </div>
  </details>
  <input aria-hidden="true" autoComplete="off" className="hidden" name="website" tabIndex={-1} />
  <input name="source" type="hidden" value={brand.consultationSource} />
  <label className="flex items-start gap-3 text-sm leading-6 text-slate-300">
    <input className="mt-1 size-4" name="consent" required type="checkbox" />
    <span>我已阅读并同意 <a className="font-bold text-blue-200 underline" href="/privacy">《隐私说明》</a>，同意{brand.legalName}为回复本次商务咨询处理上述信息。</span>
  </label>
  <div className="flex flex-wrap items-center gap-4">
    <Button isPending={submitting} type="submit" variant="primary">{submitting ? "正在提交" : "提交商务咨询"}</Button>
    <span aria-live="polite" className={result.type === "error" ? "text-sm text-red-300" : "text-sm text-emerald-200"} role={result.type === "error" ? "alert" : undefined}>{result.message}</span>
  </div>
</Form>
```

Import `brand` and `leadCopy` from `@/lib/brand`.

- [ ] **Step 6: 创建隐私说明页面**

Create `app/privacy/page.tsx` as a static page with `metadata.title = "隐私说明"`, a back link to `/`, and these sections rendered as visible headings and paragraphs:

```tsx
import type {Metadata} from "next";
import {brand} from "@/lib/brand";

export const metadata: Metadata = {title: "隐私说明", description: `${brand.legalName}商务咨询表单隐私说明`};

const sections = [
  {title: "我们处理的信息", body: "您主动填写的咨询方向、单位名称、联系人、联系电话及选填信息；系统还会记录 IP 地址和浏览器 User-Agent，用于防滥用、安全防护与问题排查。"},
  {title: "处理目的", body: "用于回复本次商务咨询、评估项目范围、沟通实施条件并保障表单安全。请勿提交患者、受试者、病历、处方、身份证件或其他敏感个人信息。"},
  {title: "保存期限", body: "未建立合作的咨询信息原则上在最后一次沟通后 12 个月内删除或匿名化；已建立合作的，按照合同和适用要求处理。"},
  {title: "共享与委托处理", body: "我们不出售咨询信息。因托管、运维或履行项目确需第三方处理时，将结合实际情况说明并采取合同与安全措施。"},
  {title: "您的权利", body: "如需查询、更正或删除咨询信息，请返回商务咨询表单，在咨询方向中选择“隐私与个人信息”并说明请求。"},
] as const;

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] py-16">
      <article className="site-shell max-w-4xl rounded-2xl border border-[var(--border)] bg-white p-6 sm:p-10">
        <a className="text-sm font-bold text-[var(--brand)]" href="/">← 返回首页</a>
        <p className="section-kicker mt-10">Privacy notice · 2026-07-10</p>
        <h1 className="mt-4 text-4xl font-bold tracking-[-.02em]">商务咨询隐私说明</h1>
        <p className="mt-6 leading-8 text-[var(--muted)]">本说明适用于{brand.legalName}官网商务咨询表单。</p>
        <div className="mt-10 grid gap-8">{sections.map((section) => <section key={section.title}><h2 className="text-xl font-bold">{section.title}</h2><p className="mt-3 leading-8 text-[var(--muted)]">{section.body}</p></section>)}</div>
        <p className="mt-10 border-t border-[var(--border)] pt-6 text-sm leading-7 text-[var(--muted)]">{brand.disclaimer}</p>
      </article>
    </main>
  );
}
```

- [ ] **Step 7: 更新 API 响应与 sitemap**

In `app/api/leads/route.ts`, import `leadCopy` and replace the success payload fields with:

```ts
message: leadCopy.accepted,
nextStep: leadCopy.nextStep,
```

In `app/sitemap.ts`, return both public routes:

```ts
return [
  {url: new URL("/", siteUrl).toString(), lastModified: new Date(), changeFrequency: "monthly", priority: 1},
  {url: new URL("/privacy", siteUrl).toString(), lastModified: new Date(), changeFrequency: "yearly", priority: 0.3},
];
```

- [ ] **Step 8: 运行表单、隐私、类型与构建验证**

Run:

```bash
npm exec -- tsx --test tests/lead-validation.test.ts tests/privacy-content.test.ts tests/lead-submission.test.ts
npm run typecheck
npm run build
```

Expected: selected tests PASS；typecheck 与 build exit 0；route output includes `/privacy`。

- [ ] **Step 9: 提交商务咨询与隐私说明**

```bash
git add lib/validation/lead.ts tests/lead-validation.test.ts components/lead-form/submit-lead.ts components/lead-form/lead-form.tsx app/api/leads/route.ts app/privacy/page.tsx app/sitemap.ts tests/privacy-content.test.ts tests/lead-submission.test.ts
git commit -m "feat: adapt consultation flow for pharma clients"
```

---

### Task 7: 清理公开旧品牌并更新后台与文档

**Files:**
- Create: `tests/public-branding.test.ts`
- Modify: `app/admin/page.tsx:1-10`
- Modify: `app/admin/login/page.tsx:1-14`
- Modify: `components/admin/login-form.tsx:32-45`
- Modify: `components/admin/admin-dashboard.tsx:59-75`
- Modify: `package.json:2-20`
- Modify: `README.md:1-110`

**Interfaces:**
- Consumes: `brand` in admin components where practical。
- Produces: user-facing public/admin/docs copy with no old company brand。

- [ ] **Step 1: 写公开品牌失败测试**

Create `tests/public-branding.test.ts`:

```ts
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
```

- [ ] **Step 2: 运行测试并确认 RED**

Run:

```bash
npm exec -- tsx --test tests/public-branding.test.ts
```

Expected: FAIL because admin components and README still contain the former brand or generic software-project copy。

- [ ] **Step 3: 更新后台可见标题和 CSV 文案**

Apply these exact strings:

- `app/admin/page.tsx`: metadata title `医药数字化商务咨询后台`。
- `app/admin/login/page.tsx`: metadata title `云医荟后台登录`。
- `components/admin/login-form.tsx`: Card title `云医荟商务咨询后台`；description `使用管理员账号登录，Cookie 仅由服务端读取。`。
- `components/admin/admin-dashboard.tsx`: kicker `Business inquiry workspace`；H1 `医药数字化商务咨询后台`。
- CSV header `项目类型` -> `咨询方向`；`客户单位` -> `单位名称`；表格标题 `项目与需求` -> `咨询方向与业务场景`。
- CSV download filename `sunyun-leads-YYYY-MM-DD.csv` -> `yunyihui-leads-YYYY-MM-DD.csv`。

- [ ] **Step 4: 更新 package 描述与 README**

Set `package.json.description` to:

```json
"北京云医荟科技有限公司医药数字化门户、商务咨询与管理后台"
```

Change the README title and opening to:

```md
# 北京云医荟科技有限公司门户网站

面向药企、医疗机构与医药商业公司的医药产业数字化门户。项目采用 Next.js 模块化单体架构，提供公开品牌页面、商务咨询表单、SQLite 线索管理后台与自托管部署能力。

## 门户定位

- 医药业务系统与协作平台
- 数据平台、专题分析与经营视图
- AI 资料整理、知识检索与工作流辅助
- 系统集成、部署支持与持续迭代

本网站面向机构客户，不提供个人医疗咨询、诊断、治疗或用药建议。
```

Retain the existing local-development, checks, database, Docker and ECS operational instructions, but replace public references to `榫合云` with `云医荟` and replace `软件项目线索后台` with `商务咨询后台`。

- [ ] **Step 5: 运行品牌、全量测试、类型与构建验证**

Run:

```bash
npm exec -- tsx --test tests/public-branding.test.ts
npm test
npm run typecheck
npm run build
```

Expected: all tests PASS；typecheck 与 build exit 0。

- [ ] **Step 6: 提交品牌清理**

```bash
git add tests/public-branding.test.ts app/admin/page.tsx app/admin/login/page.tsx components/admin/login-form.tsx components/admin/admin-dashboard.tsx package.json README.md
git commit -m "chore: align portal copy with yunyihui brand"
```

---

### Task 8: 集成验证、浏览器 QA 与本地产物清理

**Files:**
- Modify: `.gitignore:1-16`
- No production source changes unless a preceding acceptance check fails; return the failure to the owning task instead of hiding it in this task。

**Interfaces:**
- Consumes: complete portal from Tasks 1–7。
- Produces: clean worktree, passing quality gate, verified desktop/mobile portal and verified consultation-to-admin flow。

- [ ] **Step 1: 忽略本地设计与关系图产物**

Append to `.gitignore`:

```gitignore
.superpowers/
graphify-out/
```

Run:

```bash
git add .gitignore
git commit -m "chore: ignore local design artifacts"
```

- [ ] **Step 2: 运行完整自动门禁**

Run:

```bash
npm run check
git diff --check
```

Expected: typecheck, all tests, and production build PASS；`git diff --check` produces no output。

- [ ] **Step 3: 启动隔离数据的本地 QA 服务**

Run in a persistent terminal session:

```bash
rm -f /tmp/yunyihui-qa.db /tmp/yunyihui-qa.db-wal /tmp/yunyihui-qa.db-shm /tmp/yunyihui-cookie.txt
DATABASE_PATH=/tmp/yunyihui-qa.db \
LEGACY_LEADS_PATH=/tmp/yunyihui-no-legacy.jsonl \
ADMIN_USERNAME=admin \
ADMIN_PASSWORD_HASH='scrypt:00112233445566778899aabbccddeeff:565859c6cb1a6a568a0ccb50adf101c46da690398a3144aaf721d14fccccafb8a6d01330bd7b58408518d2d5fad262a2378104f5966be6fd4c8f9b0dd8192569' \
SESSION_SECRET=0123456789abcdef0123456789abcdef \
COOKIE_SECURE=0 \
NEXT_PUBLIC_SITE_URL=http://localhost:4173 \
npm run dev
```

Expected: Next dev server listens on `http://localhost:4173` with no startup error。

- [ ] **Step 4: 验证公开路由与健康响应**

Run:

```bash
curl -fsS http://127.0.0.1:4173/ >/dev/null
curl -fsS http://127.0.0.1:4173/privacy >/dev/null
curl -fsS http://127.0.0.1:4173/opengraph-image >/dev/null
curl -fsS http://127.0.0.1:4173/api/health
```

Expected health JSON contains `"ok":true` and `"service":"yunyihui-portal"`。

- [ ] **Step 5: 验证咨询提交与后台读取**

Submit a non-sensitive synthetic inquiry:

```bash
curl -fsS -H 'content-type: application/json' \
  -d '{"serviceType":"医药业务系统","companyName":"自动化验收示例机构","contactName":"测试联系人","phone":"13800138000","description":"希望梳理客户协同流程并建设可持续迭代的医药业务系统。","source":"homepage-pharma-prism","website":"","consent":true}' \
  http://127.0.0.1:4173/api/leads
```

Expected: JSON contains `"ok":true`, `"message":"已收到您的咨询"`, and an `id`。

Login and read the lead:

```bash
curl -fsS -c /tmp/yunyihui-cookie.txt -H 'content-type: application/json' \
  -d '{"username":"admin","password":"A-strong-admin-password-2026"}' \
  http://127.0.0.1:4173/api/admin/session
curl -fsS -b /tmp/yunyihui-cookie.txt 'http://127.0.0.1:4173/api/leads?q=自动化验收示例机构'
```

Expected: login JSON contains `"ok":true`; lead JSON contains the synthetic organization name and `"total":1`。

- [ ] **Step 6: 使用浏览器完成桌面、笔记本与平板视觉交互 QA**

Open `http://localhost:4173` at `1440×1000`, `1280×800`, `1024×768`, and `768×1024`。Verify:

- sticky navigation does not cover anchored headings；
- Hero H1 remains two lines and prism labels do not overlap；
- no 88%、74%、60% or old company brand appears；
- five deliverables align without clipped text；
- 7/5 solution cards, deep data section, delivery steps, scenarios, trust row, contact form and footer match the approved direction；
- at `1024×768` the Hero remains two-column without prism clipping；at `768×1024` secondary navigation hides, cards reflow without narrow text columns, and Logo/CTA remain visible；
- keyboard Tab exposes visible focus for logo, navigation, CTAs, privacy link, details summary, every input and submit button；
- submitting through the browser shows the returned lead ID and resets the form；
- browser console has no hydration, CSP, React key or resource errors。

Capture screenshots for the Hero, data section and contact section。

- [ ] **Step 7: 使用浏览器完成移动与 reduced-motion QA**

Open `http://localhost:4173` at `390×844` and `375×667`。Verify:

- no horizontal scrolling；
- Logo and CTA remain visible while secondary navigation is hidden；
- Hero copy precedes the simplified prism；
- cards have natural height and one-column order；
- delivery steps read vertically；
- `<details>` holds optional fields and every control is at least 44px high；
- footer disclaimer is readable at 16px-equivalent body size。

Enable `prefers-reduced-motion: reduce` in browser emulation and reload。Expected: all sections and prism labels are immediately visible; no entrance animation or transition runs。

Capture one full-page mobile screenshot and one reduced-motion Hero screenshot。

- [ ] **Step 8: 最终范围与工作区审计**

Run:

```bash
rg -n '榫合云|Delivery console|88 - index|index \* 14' app components README.md || true
git status --short --branch
git log --oneline --decorate -10
```

Expected: `rg` produces no output；worktree is clean；history contains one focused commit per task and does not contain `.superpowers/` or `graphify-out/`。

---

## Spec Coverage Audit

| Approved design requirement | Implementing task(s) |
|---|---|
| Brand identity, names, tagline, medical boundary | Tasks 1, 2, 7 |
| Exact accessible color tokens, typography, prism, spacing | Task 4 |
| Navigation, Hero, deliverables, audiences, solutions | Tasks 3, 5 |
| Data narrative, delivery method, scenarios, trust | Tasks 3, 5 |
| Consultation fields, API copy, errors, honeypot | Tasks 1, 6, 8 |
| Privacy notice, IP/User-Agent disclosure, retention | Task 6 |
| Metadata, JSON-LD, icon, OG, sitemap, health ID | Tasks 1, 2, 6 |
| Responsive behavior, motion, reduced-motion, no-JS | Tasks 4, 5, 8 |
| Admin visible branding, CSV labels, README | Task 7 |
| Automated, functional, visual, accessibility verification | Tasks 1–8, especially Task 8 |
| No DB migration, no dependency growth, preserved internal IDs | Global Constraints and Tasks 6–8 |
| Production legal/business confirmation gates | Completion Gate |

Self-review result: every approved design section maps to at least one task; no uncovered requirement or unresolved cross-task interface remains。

## Completion Gate

The implementation is complete only when every checkbox above is complete, `npm run check` passes from a clean worktree, the synthetic inquiry appears in the admin API, all six browser viewport checks pass, reduced-motion displays final states, and the production release caveats in the approved design spec remain explicitly documented.
