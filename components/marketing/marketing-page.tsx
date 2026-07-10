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

const primaryLink =
  "inline-flex min-h-11 items-center justify-center rounded-lg bg-[var(--brand)] px-5 py-3 text-sm font-extrabold text-white shadow-[0_12px_28px_rgba(23,88,213,.2)] transition hover:-translate-y-0.5 hover:brightness-95 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/25";
const secondaryLink =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--border)] bg-white/80 px-5 py-3 text-sm font-extrabold text-[var(--foreground)] transition hover:border-blue-300 hover:bg-white focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/20";

export function MarketingPage() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/90 backdrop-blur-xl">
        <div className="site-shell flex min-h-17 items-center justify-between gap-5">
          <a aria-label={`${brand.shortName}首页`} className="flex items-center gap-3" href="#top">
            <span className="grid size-9 place-items-center overflow-hidden rounded-lg bg-[var(--brand)] text-sm font-black text-white">云</span>
            <span>
              <strong className="block text-sm tracking-wide">{brand.shortName}</strong>
              <small className="block text-[.62rem] tracking-[.13em] text-[var(--muted)]">{brand.englishName}</small>
            </span>
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
              <h1 className="mt-7 text-[clamp(2.75rem,6vw,5.2rem)] font-[750] leading-[1.03] tracking-[-.025em]">
                让医药数字化，<br /><span className="text-[var(--brand)]">落到真实业务里。</span>
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-lg">
                {brand.description}从场景梳理、系统建设与数据连接，到上线支持与持续迭代。
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a className={primaryLink} href="#contact">预约方案沟通 ↗</a>
                <a className={secondaryLink} href="#solutions">查看解决方案</a>
              </div>
              <p className="mt-7 text-sm text-[var(--muted)]">{brand.disclaimer}</p>
            </div>
          </div>
          <div className="flex min-h-[440px] items-center justify-center px-4 pb-16 lg:min-h-0 lg:pb-0">
            <PrismGraphic />
          </div>
        </section>

        <section aria-label="项目交付物" className="border-y border-[var(--border)] bg-white">
          <div className="site-shell grid grid-cols-2 md:grid-cols-6">
            <p className="col-span-2 border-b border-[var(--border)] py-5 text-xs font-bold tracking-[.12em] text-[var(--muted)] md:col-span-1 md:border-b-0">DELIVERABLES</p>
            {deliverables.map((item) => <p className="border-l border-[var(--border)] py-5 text-center text-sm font-bold" key={item}>{item}</p>)}
          </div>
        </section>

        <section className="site-shell scroll-mt-20 py-24" id="audiences">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div><p className="section-kicker">01 · Who we serve</p><h2 className="section-title">理解不同机构的业务语境，再谈系统方案。</h2></div>
            <p className="section-copy">我们只展示已经确认的三类核心服务对象，让定位清晰，也让每种方案从真实组织方式出发。</p>
          </div>
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {audiences.map((item, index) => (
              <Reveal delay={index * 80} key={item.title}>
                <article className="relative min-h-64 overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-br from-white to-[var(--background)] p-7">
                  <span className="absolute right-6 top-4 text-5xl font-black text-[var(--brand-soft)]">{item.index}</span>
                  <p className="section-kicker">{item.eyebrow}</p>
                  <h3 className="mt-20 text-2xl font-bold">{item.title}</h3>
                  <p className="mt-4 leading-7 text-[var(--muted)]">{item.description}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="scroll-mt-20 bg-[var(--background)] py-24" id="solutions">
          <div className="site-shell">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div><p className="section-kicker">02 · Solutions</p><h2 className="section-title">围绕医药业务场景，建设可落地的数字化能力。</h2></div>
              <p className="section-copy">先确认角色、流程、数据与系统边界，再确定建设范围与实施节奏。</p>
            </div>
            <div className="mt-12 grid gap-4 lg:grid-cols-12">
              {solutions.map((item, index) => (
                <Reveal className={index === 0 || index === 3 ? "lg:col-span-7" : "lg:col-span-5"} delay={index * 70} key={item.title}>
                  <article className="relative min-h-60 rounded-2xl border border-[var(--border)] bg-white p-7">
                    <span className="absolute right-6 top-6 grid size-11 place-items-center rounded-xl border border-[var(--border)] bg-[var(--background)] text-xl text-[var(--brand)]">{item.icon}</span>
                    <p className="section-kicker">{item.index} / {item.eyebrow}</p>
                    <h3 className="mt-16 text-2xl font-bold">{item.title}</h3>
                    <p className="mt-4 max-w-2xl leading-7 text-[var(--muted)]">{item.description}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="scroll-mt-20 bg-[var(--foreground)] py-24 text-white" id="delivery">
          <div className="site-shell">
            <p className="section-kicker text-blue-300">03 · From data to action</p>
            <h2 className="section-title">把医药数据，变成清晰的行动依据。</h2>
            <p className="section-copy mt-5 text-slate-300">多源输入经过口径、权限和流程治理，形成可理解、可追踪、可验收的业务视图。</p>
            <div className="mt-12 grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
              <article className="rounded-2xl border border-white/15 bg-white/5 p-7"><p className="text-xs tracking-[.12em] text-blue-300">INPUT</p><h3 className="mt-10 text-xl font-bold">多源业务信息</h3><p className="mt-4 leading-7 text-slate-300">现有系统与表格、客户项目与渠道记录、授权知识与内容资料。</p></article>
              <span className="grid place-items-center text-2xl text-blue-300 max-lg:rotate-90">→</span>
              <article className="rounded-2xl border border-white/15 bg-white/5 p-7"><p className="text-xs tracking-[.12em] text-blue-300">STRUCTURE</p><h3 className="mt-10 text-xl font-bold">统一与治理</h3><p className="mt-4 leading-7 text-slate-300">角色权限、指标口径、接口条件与 AI 人工复核节点。</p></article>
              <span className="grid place-items-center text-2xl text-blue-300 max-lg:rotate-90">→</span>
              <article className="rounded-2xl border border-blue-400/35 bg-blue-500/10 p-7"><p className="text-xs tracking-[.12em] text-blue-300">OUTPUT</p><h3 className="mt-10 text-xl font-bold">可用数字能力</h3><p className="mt-4 leading-7 text-slate-300">业务系统、协作工具、专题分析与持续迭代能力。</p></article>
            </div>
            <div className="mt-20 grid border-y border-white/15 md:grid-cols-4">
              {deliverySteps.map((item) => (
                <article className="min-h-56 border-white/15 p-6 md:border-r" key={item.index}>
                  <span className="grid size-9 place-items-center rounded-lg border border-blue-300/30 text-xs text-blue-200">{item.index}</span>
                  <h3 className="mt-14 text-xl font-bold">{item.title}</h3>
                  <p className="mt-3 leading-7 text-slate-300">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="site-shell scroll-mt-20 py-24" id="scenarios">
          <p className="section-kicker">04 · Scenario examples</p>
          <h2 className="section-title">从一个关键场景开始，连接真实业务链。</h2>
          <p className="section-copy mt-5">以下均为场景示意，不代表未经授权的客户案例或效果承诺。</p>
          <div className="mt-12 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
            {scenarios.map((item, index) => (
              <article className={`relative overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-7 ${index === 0 ? "min-h-80 lg:row-span-2" : "min-h-40"}`} key={item.title}>
                <p className="section-kicker">SCENARIO {item.index}</p>
                <h3 className="mt-12 text-2xl font-bold">{item.title}</h3>
                <p className="mt-4 max-w-xl leading-7 text-[var(--muted)]">{item.description}</p>
                <span className="absolute bottom-4 right-6 text-6xl font-black text-[var(--brand-soft)]">{item.index}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="scroll-mt-20 bg-white py-24" id="about">
          <div className="site-shell">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div><p className="section-kicker">05 · Trust by design</p><h2 className="section-title">可信来自清晰边界与可验证交付。</h2></div>
              <p className="section-copy">根据项目用途共同确认数据类型、角色权限、部署方式、日志与备份要求。</p>
            </div>
            <div className="mt-12 grid border-y border-[var(--border)] sm:grid-cols-2 lg:grid-cols-4">
              {trustPrinciples.map((item) => (
                <article className="min-h-44 border-[var(--border)] p-6 sm:border-r" key={item.index}>
                  <span className="text-lg text-[var(--brand)]">{item.index}</span>
                  <h3 className="mt-10 font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm text-[var(--muted)]">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="site-shell scroll-mt-20 py-24" id="contact">
          <div className="grid gap-12 rounded-[1.5rem] bg-[var(--foreground)] p-6 text-white sm:p-10 lg:grid-cols-[.75fr_1.25fr] lg:p-14">
            <div>
              <p className="section-kicker text-blue-300">Business inquiry</p>
              <h2 className="mt-5 text-4xl font-bold tracking-[-.02em]">从一个明确的业务场景开始。</h2>
              <p className="mt-6 leading-8 text-slate-300">请简要说明当前流程与希望改善的环节，无需上传业务数据或完整需求文档。</p>
              <p className="mt-8 border-l-2 border-blue-300 pl-4 text-sm leading-6 text-slate-300">请勿提交患者、受试者、病历、处方、身份证件或其他敏感个人信息。</p>
            </div>
            <LeadForm />
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)] bg-[var(--background)] py-10">
        <div className="site-shell flex flex-col justify-between gap-4 text-sm text-[var(--muted)] lg:flex-row">
          <p>© 2026 {brand.legalName}</p>
          <div className="max-w-3xl lg:text-right">
            <a className="font-bold text-[var(--brand)]" href="/privacy">隐私说明</a>
            <p className="mt-2">{brand.disclaimer}</p>
          </div>
        </div>
      </footer>
    </>
  );
}
