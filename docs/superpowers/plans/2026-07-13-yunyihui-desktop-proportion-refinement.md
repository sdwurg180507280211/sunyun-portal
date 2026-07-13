# 云医荟门户桌面比例优化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将营销首页从单一 `1200px` 容器升级为 1440px 展示层、1280px 标准层和受控阅读行宽，并收紧 Hero、章节与卡片的纵向比例。

**Architecture:** 在 `app/globals.css` 中建立无运行时依赖的容器令牌和两个布局原语；在现有 `MarketingPage` 中显式选择宽展示或标准容器，不改业务内容与数据流。使用源码级视觉契约测试锁定容器数值、章节归属、移动端自然高度和联系区保护项，最后通过生产构建与六个真实视口验收。

**Tech Stack:** Next.js 16、React 19、TypeScript、Tailwind CSS 4、原生 CSS、Node.js test runner、tsx。

## Global Constraints

- 以 `docs/superpowers/specs/2026-07-13-yunyihui-desktop-proportion-refinement-design.md` 为本轮唯一增量规格；基础品牌规格继续有效。
- 宽展示容器最大 `1440px`；标准内容容器最大 `1280px`；总水平页边距 `clamp(32px, 6.4vw, 112px)`。
- 章节标题最大 `840px`；普通说明正文最大 `720px`；Hero 副文案保持 `672px`。
- 桌面 Hero 最低高度 `660px`；普通章节移动端上下留白 `64px`、桌面 `80px`。
- 服务对象卡桌面最小高度 `224px`；解决方案卡 `208px`；主场景卡 `288px`；手机卡片不得继承这些固定最小高度。
- 服务对象恢复白底；解决方案保持珍珠灰底。
- 联系区继续使用 `.78fr / 1.22fr`，保留全部真实字段、隐私同意、敏感信息警示、校验、提交与错误恢复能力。
- 不改 API、SQLite、后台、隐私文案、营销文案、章节编号、棱镜图形或动效系统。
- 不新增 npm 依赖、外部图片、字体、分析脚本或客户端 JavaScript。
- 不修改或提交 `.superpowers/`、`graphify-out/` 和现有本地差异 `next-env.d.ts`。
- 直接在用户指定的 `main` 分支工作；每次提交只暂存任务列出的文件。

## File Structure

- Modify: `app/globals.css` — 定义容器、页边距和阅读宽度令牌。
- Modify: `components/marketing/marketing-page.tsx` — 为现有章节选择容器层级并调整响应式间距和卡片高度。
- Modify: `tests/visual-contract.test.ts` — 锁定布局令牌、章节容器归属和生产联系区保护项。
- No new runtime files and no data migrations.

---

### Task 1: 建立分层容器与阅读宽度原语

**Files:**
- Modify: `tests/visual-contract.test.ts`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: 现有 `.site-shell`、`.section-title`、`.section-copy` 类名。
- Produces: CSS 令牌 `--shell-gutter-total`、`--shell-standard`、`--shell-wide`、`--title-measure`、`--copy-measure`，以及新类 `.site-shell-wide`。

- [ ] **Step 1: 写入失败的容器契约测试**

在 `tests/visual-contract.test.ts` 的可访问性令牌测试后加入：

```ts
test("marketing layout defines layered containers and reading measures", () => {
  const css = read("app/globals.css");

  assert.match(css, /--shell-gutter-total:\s*clamp\(2rem,\s*6\.4vw,\s*7rem\)/);
  assert.match(css, /--shell-standard:\s*80rem/);
  assert.match(css, /--shell-wide:\s*90rem/);
  assert.match(css, /--title-measure:\s*52\.5rem/);
  assert.match(css, /--copy-measure:\s*45rem/);
  assert.match(
    css,
    /\.site-shell\s*\{[^}]*width:\s*min\(var\(--shell-standard\),\s*calc\(100% - var\(--shell-gutter-total\)\)\)/s,
  );
  assert.match(
    css,
    /\.site-shell-wide\s*\{[^}]*width:\s*min\(var\(--shell-wide\),\s*calc\(100% - var\(--shell-gutter-total\)\)\)/s,
  );
  assert.match(css, /\.section-title\s*\{[^}]*max-width:\s*var\(--title-measure\)/s);
  assert.match(css, /\.section-copy\s*\{[^}]*max-width:\s*var\(--copy-measure\)/s);
});
```

- [ ] **Step 2: 运行测试并确认 RED**

Run:

```bash
npm exec -- tsx --test --test-name-pattern="marketing layout defines layered containers" tests/visual-contract.test.ts
```

Expected: FAIL，首个失败信息包含 `--shell-gutter-total` 未匹配；不是语法错误或测试加载失败。

- [ ] **Step 3: 实现最小容器原语**

在 `app/globals.css` 的 `:root` 末尾加入：

```css
  --shell-gutter-total: clamp(2rem, 6.4vw, 7rem);
  --shell-standard: 80rem;
  --shell-wide: 90rem;
  --title-measure: 52.5rem;
  --copy-measure: 45rem;
```

用以下代码替换现有 `.site-shell`：

```css
.site-shell,
.site-shell-wide {
  margin-inline: auto;
}

.site-shell {
  width: min(var(--shell-standard), calc(100% - var(--shell-gutter-total)));
}

.site-shell-wide {
  width: min(var(--shell-wide), calc(100% - var(--shell-gutter-total)));
}
```

将阅读宽度替换为：

```css
.section-title {
  margin-top: 0.75rem;
  max-width: var(--title-measure);
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 740;
  line-height: 1.08;
  letter-spacing: -0.025em;
}

.section-copy {
  max-width: var(--copy-measure);
  color: var(--muted);
  font-size: 1rem;
  line-height: 1.85;
}
```

- [ ] **Step 4: 运行任务测试并确认 GREEN**

Run:

```bash
npm exec -- tsx --test --test-name-pattern="marketing layout defines layered containers" tests/visual-contract.test.ts
```

Expected: PASS，目标测试通过且退出码为 0。

- [ ] **Step 5: 运行完整视觉契约测试**

Run:

```bash
npm exec -- tsx --test tests/visual-contract.test.ts
```

Expected: PASS；现有棱镜、动效、Hero、联系区和链接契约全部保持通过。

- [ ] **Step 6: 提交容器原语**

```bash
git add app/globals.css tests/visual-contract.test.ts
git diff --cached --check
git commit -m "feat: add layered marketing containers"
```

Expected: 提交只包含上述两个文件，不包含 `next-env.d.ts`。

---

### Task 2: 将首页应用到宽展示层并收紧纵向节奏

**Files:**
- Modify: `tests/visual-contract.test.ts`
- Modify: `components/marketing/marketing-page.tsx`

**Interfaces:**
- Consumes: Task 1 的 `.site-shell` 和 `.site-shell-wide`。
- Produces: Hero、导航、展示型章节、联系区和页脚使用 `.site-shell-wide`；可信设计保留 `.site-shell`；移动卡片自然高度。

- [ ] **Step 1: 写入失败的章节归属与高度契约**

在 `tests/visual-contract.test.ts` 中加入：

```ts
test("marketing page applies wide shells with compact responsive rhythm", () => {
  const source = read("components/marketing/marketing-page.tsx");
  const section = (id: string) =>
    source.match(new RegExp(`<section\\b[^>]*id=["']${id}["'][\\s\\S]*?<\\/section>`))?.[0] ?? "";
  const hero = source.match(/<section\b[^>]*prism-grid-bg[\s\S]*?<\/section>/)?.[0] ?? "";
  const header = source.match(/<header\b[\s\S]*?<\/header>/)?.[0] ?? "";
  const footer = source.match(/<footer\b[\s\S]*?<\/footer>/)?.[0] ?? "";

  assert.match(header, /site-shell-wide/);
  assert.match(hero, /site-shell-wide grid lg:min-h-\[660px\][^"\n]*lg:grid-cols-\[7fr_5fr\]/);
  assert.doesNotMatch(hero, /min-h-\[700px\]/);

  for (const id of ["audiences", "solutions", "delivery", "scenarios"]) {
    assert.match(section(id), /site-shell-wide/);
    assert.match(section(id), /py-16[^"\n]*lg:py-20/);
  }
  assert.match(section("audiences"), /bg-white/);
  assert.match(section("about"), /site-shell(?:\s|["'])/);
  assert.doesNotMatch(section("about"), /site-shell-wide/);
  assert.match(section("about"), /py-16[^"\n]*lg:py-20/);
  assert.match(section("contact"), /site-shell-wide/);
  assert.match(footer, /site-shell-wide/);

  assert.match(section("audiences"), /lg:min-h-56/);
  assert.doesNotMatch(section("audiences"), /\bmin-h-64\b/);
  assert.match(section("solutions"), /lg:min-h-52/);
  assert.doesNotMatch(section("solutions"), /\bmin-h-60\b/);
  assert.match(section("scenarios"), /lg:min-h-72/);
  assert.doesNotMatch(section("scenarios"), /\bmin-h-(?:80|40)\b/);
  assert.match(section("about"), /lg:min-h-44/);
  assert.match(section("contact"), /lg:grid-cols-\[\.78fr_1\.22fr\]/);
});
```

同时把现有 `hero keeps each approved claim sentence on one line across target viewports` 测试中的布局断言替换为：

```ts
  assert.match(
    source,
    /site-shell-wide grid lg:min-h-\[660px\][^"\n]*lg:grid-cols-\[7fr_5fr\]/,
  );
  assert.doesNotMatch(source, /min-h-\[700px\]/);
  assert.doesNotMatch(source, /lg:grid-cols-\[1\.05fr_\.95fr\]/);
  assert.doesNotMatch(source, /xl:px-\[max\(8vw,2rem\)\]/);
```

保留该测试对 H1 两个 `whitespace-nowrap` 行、字号和 `.prism-graphic` 最大宽度的其余断言。

- [ ] **Step 2: 运行测试并确认 RED**

Run:

```bash
npm exec -- tsx --test --test-name-pattern="marketing page applies wide shells|hero keeps each approved claim" tests/visual-contract.test.ts
```

Expected: FAIL，原因至少包含页面中没有 `site-shell-wide`，而不是测试语法失败。

- [ ] **Step 3: 应用 Hero 和全局展示容器**

在 `components/marketing/marketing-page.tsx` 中进行以下精确结构调整：

```tsx
<header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/90 backdrop-blur-xl">
  <div className="site-shell-wide flex min-h-17 items-center justify-between gap-5">
    {/* 现有 Logo、导航与 CTA 原样保留 */}
  </div>
</header>

<section className="prism-grid-bg relative">
  <div className="site-shell-wide grid lg:min-h-[660px] lg:grid-cols-[7fr_5fr]">
    <div className="relative z-10 flex items-center py-16 sm:pr-8 lg:py-20 lg:pr-10">
      {/* 现有 Hero 文案、按钮与边界说明原样保留 */}
    </div>
    <div className="flex min-h-[400px] items-center justify-center pb-12 lg:min-h-0 lg:pb-0">
      <PrismGraphic />
    </div>
  </div>
</section>
```

将交付物横条的两个 `site-shell` 都替换为 `site-shell-wide`。不要修改交付物文案与合规说明。

- [ ] **Step 4: 应用章节容器、背景和纵向比例**

对各章节使用以下最终类名和包装关系；内部 map、标题、正文和数据不变：

```tsx
<section className="scroll-mt-20 bg-white py-16 lg:py-20" id="audiences">
  <div className="site-shell-wide">{/* 现有 audiences 内容 */}</div>
</section>

<section className="scroll-mt-20 bg-[var(--background)] py-16 lg:py-20" id="solutions">
  <div className="site-shell-wide">{/* 现有 solutions 内容 */}</div>
</section>

<section className="scroll-mt-20 bg-[var(--foreground)] py-16 text-white lg:py-20" id="delivery">
  <div className="site-shell-wide">{/* 现有 delivery 内容 */}</div>
</section>

<section className="scroll-mt-20 py-16 lg:py-20" id="scenarios">
  <div className="site-shell-wide">{/* 现有 scenarios 内容 */}</div>
</section>

<section className="scroll-mt-20 bg-white py-16 lg:py-20" id="about">
  <div className="site-shell">{/* 现有 about 内容 */}</div>
</section>
```

将联系区内部容器和页脚内部容器从 `site-shell` 改为 `site-shell-wide`，但联系区外层 `py-12 sm:py-16`、`.contact-panel`、`.78fr / 1.22fr` 和全部表单内容保持不变。

使用以下桌面限定高度和标题间距：

```tsx
// audience article
className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-br from-white to-[var(--background)] p-7 lg:min-h-56"
// audience h3
className="mt-14 text-2xl font-bold"

// solution article
className="relative rounded-2xl border border-[var(--border)] bg-white p-7 lg:min-h-52"
// solution h3
className="mt-12 text-2xl font-bold"

// delivery step article
className="border-b border-white/15 p-6 last:border-b-0 lg:min-h-52 lg:border-b-0 lg:border-r lg:last:border-r-0"

// scenario article
className={`relative overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-7 ${
  index === 0 ? "lg:min-h-72 lg:row-span-2" : ""
}`}
// scenario h3
className="mt-10 text-2xl font-bold"

// trust principle article
className="border-[var(--border)] p-6 sm:border-r lg:min-h-44"
```

- [ ] **Step 5: 运行任务测试并确认 GREEN**

Run:

```bash
npm exec -- tsx --test --test-name-pattern="marketing page applies wide shells|hero keeps each approved claim|contact section preserves" tests/visual-contract.test.ts
```

Expected: PASS；宽度、Hero 和联系区三个目标契约全部通过。

- [ ] **Step 6: 运行完整测试与类型检查**

Run:

```bash
npm test
npm run typecheck
```

Expected: 两个命令均退出码 0；不出现 JSX 闭合、Tailwind 类名或 TypeScript 错误。

- [ ] **Step 7: 提交首页比例优化**

```bash
git add components/marketing/marketing-page.tsx tests/visual-contract.test.ts
git diff --cached --check
git commit -m "feat: widen pharma prism desktop layout"
```

Expected: 提交只包含上述两个文件；Task 1 已提交的 CSS 不重复出现在未提交差异中，`next-env.d.ts` 仍未暂存。

---

### Task 3: 生产构建、六视口与真实表单验收

**Files:**
- Verify only: `app/globals.css`
- Verify only: `components/marketing/marketing-page.tsx`
- Verify only: `components/lead-form/lead-form.tsx`
- Verify only: `app/api/leads/route.ts`
- Preserve uncommitted: `next-env.d.ts`

**Interfaces:**
- Consumes: Task 1–2 的最终页面。
- Produces: 可证明的自动验证、布局测量、浏览器视觉结果和无回归的真实咨询链路。

- [ ] **Step 1: 运行最终自动门禁**

Run:

```bash
npm run check
```

Expected: `tsc --noEmit`、全部 Node 测试和 `next build` 均通过；构建输出包含 `/`、`/privacy` 和 `/api/leads`。

- [ ] **Step 2: 启动隔离的生产预览**

若 4173 端口仍是本项目旧预览，先正常终止旧进程，再运行：

```bash
NEXT_PUBLIC_SITE_URL=http://127.0.0.1:4173 \
DATABASE_PATH=/tmp/yunyihui-layout-qa.db \
npm exec -- next start -H 127.0.0.1 -p 4173
```

Expected: 控制台显示 `Ready`，访问 `http://127.0.0.1:4173/` 返回 200；允许监听用户已批准的本地端口。

- [ ] **Step 3: 测量六个目标视口**

使用浏览器工具依次设置 `1920×1080`、`1440×1000`、`1280×800`、`1024×768`、`768×1024`、`390×844`，每个视口执行：

```js
({
  viewport: [window.innerWidth, window.innerHeight],
  scrollWidth: document.documentElement.scrollWidth,
  scrollHeight: document.documentElement.scrollHeight,
  wideShells: [...document.querySelectorAll(".site-shell-wide")].map((node) =>
    Math.round(node.getBoundingClientRect().width),
  ),
  standardShells: [...document.querySelectorAll(".site-shell")].map((node) =>
    Math.round(node.getBoundingClientRect().width),
  ),
});
```

Expected:

- 所有视口 `scrollWidth === viewport[0]`。
- 1920px 下宽展示容器约 `1440px`、标准容器约 `1280px`。
- 1440px 下宽展示容器约 `1348px`、标准容器约 `1280px`。
- 1280px 下两类容器约 `1198px`。
- 1440×1000 下页面总高度不高于约 `5550px`，且无章节拥挤。
- 390px 下卡片没有来自桌面的 224/208/288px 固定最小高度。

- [ ] **Step 4: 完成视觉、键盘和减少动态效果检查**

逐视口截图并检查导航、Hero 两行标题、棱镜、服务对象白底、解决方案灰底、数据区、场景区、可信设计、联系面板和页脚。重点确认 1024px 下 H1 与棱镜不碰撞；390px 下 CTA、卡片和表单不溢出。

仅用键盘完成：导航到商务咨询、展开“补充信息”、填写必填字段、切换隐私同意并聚焦提交按钮。模拟 `prefers-reduced-motion: reduce`，确认所有 Reveal 和棱镜内容直接可见。

Expected: 无裁切、遮挡、横向滚动、不可见焦点或仅靠 hover 才能访问的信息。

- [ ] **Step 5: 验证真实咨询链路**

使用虚构机构数据填写单位、联系人、电话、咨询方向、10 字以上业务场景和隐私同意；不要输入患者、病历、处方或其他敏感信息。提交后检查：

- 请求发送到 `POST /api/leads`。
- 页面展示包含线索编号的成功提示。
- 按钮从提交态恢复。
- 表单按既有行为重置。

随后模拟一次离线提交，确认页面显示可理解的网络错误且按钮恢复可用。

- [ ] **Step 6: 检查工作区与提交边界**

Run:

```bash
git status --short --branch
git log -4 --oneline --decorate
```

Expected: 只有任务前已存在的 ` M next-env.d.ts`；没有 `.superpowers/`、`graphify-out/`、数据库、截图、构建输出或临时文件进入 Git；本轮应包含规格、容器原语和首页比例三个独立提交。

- [ ] **Step 7: 若 QA 暴露缺陷，按同一 TDD 边界修复**

仅当 Step 3–5 失败时：先在 `tests/visual-contract.test.ts` 添加能复现该布局回归的断言，确认 RED；再只修改 `app/globals.css` 或 `components/marketing/marketing-page.tsx`，确认 GREEN 后运行 `npm run check`，并执行：

```bash
git add app/globals.css components/marketing/marketing-page.tsx tests/visual-contract.test.ts
git diff --cached --check
git commit -m "fix: close desktop proportion QA gaps"
```

若没有 QA 缺陷，不创建空提交。
