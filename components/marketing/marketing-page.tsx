import { LeadForm } from "@/components/lead-form/lead-form";
import { PrismGraphic } from "@/components/marketing/prism-graphic";
import { Reveal } from "@/components/marketing/reveal";
import {
  audiences,
  dataFlow,
  deliverables,
  deliverySteps,
  navigation,
  scenarios,
  solutions,
  trustIntro,
  trustPrinciples,
} from "@/components/marketing/content";
import { brand } from "@/lib/brand";

const primaryLink =
  "inline-flex min-h-11 items-center justify-center rounded-lg bg-[var(--brand)] px-5 py-3 text-sm font-extrabold text-white shadow-[0_12px_28px_rgba(23,88,213,.2)] transition hover:-translate-y-0.5 hover:brightness-95 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/25";
const secondaryLink =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--border)] bg-white/80 px-5 py-3 text-sm font-extrabold text-[var(--foreground)] transition hover:border-blue-300 hover:bg-white focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-600/20";

const [primaryScenario, ...secondaryScenarios] = scenarios;

function DashboardPreview() {
  return (
    <div aria-hidden="true" className="scenario-dashboard">
      <div className="dashboard-card dashboard-card-primary">
        <div className="dashboard-card-head">
          <span />
          <span />
          <span />
        </div>
        <div className="dashboard-line dashboard-line-brand" />
        <div className="dashboard-line" />
        <div className="dashboard-line dashboard-line-short" />
        <div className="dashboard-metrics">
          <i />
          <i />
          <i />
        </div>
      </div>
      <div className="dashboard-card dashboard-card-secondary">
        <div className="dashboard-card-head">
          <span />
          <span />
          <span />
        </div>
        <div className="dashboard-line dashboard-line-brand" />
        <div className="dashboard-line" />
        <div className="dashboard-line dashboard-line-short" />
      </div>
    </div>
  );
}

export function MarketingPage() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/90 backdrop-blur-xl">
        <div className="site-shell flex min-h-17 items-center justify-between gap-5">
          <a
            aria-label={`${brand.shortName}首页`}
            className="flex items-center gap-3"
            href="#top"
          >
            <span className="brand-mark">云</span>
            <span>
              <strong className="block text-sm tracking-wide">
                {brand.shortName}
              </strong>
              <small className="block text-[.62rem] tracking-[.13em] text-[var(--muted)]">
                {brand.englishName}
              </small>
            </span>
          </a>
          <nav
            aria-label="主导航"
            className="hidden items-center gap-7 text-sm text-[var(--muted)] lg:flex"
          >
            {navigation.map((item) => (
              <a href={item.href} key={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
          <a className={`${primaryLink} px-4 py-2`} href="#contact">
            商务咨询 ↗
          </a>
        </div>
      </header>

      <main className="overflow-hidden" id="top">
        <section className="prism-grid-bg relative grid min-h-[640px] lg:grid-cols-[1.05fr_.95fr]">
          <div className="relative z-10 flex items-center px-4 py-16 sm:px-8 lg:px-[6vw] xl:px-[7vw] 2xl:px-[8vw]">
            <div className="max-w-3xl">
              <p className="section-kicker">
                面向机构客户 · 医药产业数字化技术服务
              </p>
              <h1 className="mt-7 text-[clamp(2.25rem,10vw,2.55rem)] font-[750] leading-[1.03] tracking-[-.035em] sm:text-[3rem] lg:text-[3.2rem] xl:text-[4rem] 2xl:text-[4.8rem]">
                <span className="block whitespace-nowrap">让医药数字化，</span>
                <span className="block whitespace-nowrap text-[var(--brand)]">
                  落到真实业务里。
                </span>
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-lg">
                {brand.description}
                从场景梳理、系统建设与数据连接，到上线支持与持续迭代。
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a className={primaryLink} href="#contact">
                  预约方案沟通 ↗
                </a>
                <a className={secondaryLink} href="#solutions">
                  查看解决方案
                </a>
              </div>
              <p className="mt-7 text-sm text-[var(--muted)]">
                {brand.disclaimer}
              </p>
            </div>
          </div>
          <div className="flex min-h-[420px] items-center justify-center px-4 pb-12 lg:min-h-0 lg:pb-0">
            <PrismGraphic />
          </div>
        </section>

        <section aria-label="项目交付物" className="deliverable-strip">
          <div className="site-shell deliverable-grid">
            <p className="deliverable-label">DELIVERABLES</p>
            {deliverables.map((item) => (
              <p className="deliverable-item" key={item}>
                {item}
              </p>
            ))}
          </div>
        </section>

        <section className="site-shell scroll-mt-20 py-20" id="audiences">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="section-kicker">01 · Who we serve</p>
              <h2 className="section-title">
                理解不同机构的业务语境，再谈系统方案。
              </h2>
            </div>
            <p className="section-copy">
              我们只展示已经确认的三类核心服务对象，让定位清晰，也让每种方案从真实组织方式出发。
            </p>
          </div>
          <div className="mt-11 grid gap-4 lg:grid-cols-3">
            {audiences.map((item, index) => (
              <Reveal delay={index * 80} key={item.title}>
                <article className="relative min-h-56 overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-br from-white to-[var(--background)] p-7">
                  <span className="absolute right-6 top-4 text-5xl font-black text-[var(--brand-soft)]">
                    {item.index}
                  </span>
                  <p className="section-kicker">{item.eyebrow}</p>
                  <h3 className="mt-16 text-2xl font-bold">{item.title}</h3>
                  <p className="mt-4 leading-7 text-[var(--muted)]">
                    {item.description}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <section
          className="scroll-mt-20 bg-[var(--background)] py-20"
          id="solutions"
        >
          <div className="site-shell">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <p className="section-kicker">02 · Solutions</p>
                <h2 className="section-title">
                  围绕医药业务场景，建设可落地的数字化能力。
                </h2>
              </div>
              <p className="section-copy">
                先确认角色、流程、数据与系统边界，再确定建设范围与实施节奏。
              </p>
            </div>
            <div className="mt-11 grid gap-4 lg:grid-cols-12">
              {solutions.map((item, index) => (
                <Reveal
                  className={
                    index === 0 || index === 3
                      ? "lg:col-span-7"
                      : "lg:col-span-5"
                  }
                  delay={index * 70}
                  key={item.title}
                >
                  <article className="relative min-h-[13.5rem] rounded-2xl border border-[var(--border)] bg-white p-7">
                    <span className="absolute right-6 top-6 grid size-11 place-items-center rounded-xl border border-[var(--border)] bg-[var(--background)] text-xl text-[var(--brand)]">
                      {item.icon}
                    </span>
                    <p className="section-kicker">
                      {item.index} / {item.eyebrow}
                    </p>
                    <h3 className="mt-14 text-2xl font-bold">{item.title}</h3>
                    <p className="mt-4 max-w-2xl leading-7 text-[var(--muted)]">
                      {item.description}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="data-section scroll-mt-20" id="data">
          <div className="site-shell relative z-10">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <p className="section-kicker text-blue-300">
                  03 · From data to action
                </p>
                <h2 className="section-title">
                  把医药数据，变成清晰的行动依据。
                </h2>
              </div>
              <p className="section-copy text-slate-300">
                棱镜不是装饰，而是页面的数据叙事：多源输入经过口径、权限和流程治理，形成可理解、可追踪、可验收的业务视图。
              </p>
            </div>
            <div className="data-flow">
              {dataFlow.map((item, index) => (
                <div className="contents" key={item.eyebrow}>
                  <article
                    className={`data-block ${index === dataFlow.length - 1 ? "data-block-output" : ""}`}
                  >
                    <p>{item.eyebrow}</p>
                    <h3>{item.title}</h3>
                    <ul>
                      {item.items.map((entry) => (
                        <li key={entry}>{entry}</li>
                      ))}
                    </ul>
                  </article>
                  {index < dataFlow.length - 1 ? (
                    <span aria-hidden="true" className="data-arrow">
                      →
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="site-shell scroll-mt-20 py-20" id="delivery">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="section-kicker">04 · Delivery method</p>
              <h2 className="section-title">
                每一阶段，都有明确输入、产出与确认。
              </h2>
            </div>
            <p className="section-copy">
              避免黑盒式开发，让项目范围、数据条件和验收标准逐步变得清晰。
            </p>
          </div>
          <div className="delivery-method-grid mt-11">
            {deliverySteps.map((item) => (
              <article className="delivery-method-step" key={item.index}>
                <span>{item.index}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          className="scroll-mt-20 bg-[var(--background)] py-20"
          id="scenarios"
        >
          <div className="site-shell">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <p className="section-kicker">05 · Scenario examples</p>
                <h2 className="section-title">
                  从一个关键场景开始，连接真实业务链。
                </h2>
              </div>
              <p className="section-copy">
                以下均为场景示意，不代表未经授权的客户案例或效果承诺。
              </p>
            </div>
            <div className="scenario-grid mt-11">
              <article className="scenario-feature">
                <div className="scenario-feature-copy">
                  <p className="section-kicker">
                    SCENARIO {primaryScenario.index}
                  </p>
                  <h3>{primaryScenario.title}</h3>
                  <p>{primaryScenario.description}</p>
                </div>
                <DashboardPreview />
              </article>
              <div className="scenario-secondary">
                {secondaryScenarios.map((item) => (
                  <article className="scenario-secondary-card" key={item.title}>
                    <p className="section-kicker">SCENARIO {item.index}</p>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <span aria-hidden="true">{item.index}</span>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="scroll-mt-20 bg-white py-20" id="about">
          <div className="site-shell">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <p className="section-kicker">06 · Trust by design</p>
                <h2 className="section-title">
                  可信来自清晰边界与可验证交付。
                </h2>
              </div>
              <p className="section-copy">
                不展示尚未获得的认证、诊疗能力或绝对化安全承诺；具体措施以项目方案和验收结果为准。
              </p>
            </div>
            <div className="trust-grid mt-11">
              <article className="trust-intro">
                <h3>{trustIntro.title}</h3>
                <p>{trustIntro.description}</p>
              </article>
              {trustPrinciples.map((item) => (
                <article className="trust-item" key={item.index}>
                  <span>{item.index}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="contact-wrap scroll-mt-20" id="contact">
          <div className="site-shell contact-panel">
            <div className="contact-copy">
              <p className="section-kicker text-blue-200">Business inquiry</p>
              <h2>从一个明确的业务场景开始。</h2>
              <p>
                请简要说明当前流程与希望改善的环节，无需上传业务数据或完整需求文档。
              </p>
              <p className="contact-note">
                请勿提交患者、受试者、病历、处方、身份证件或其他敏感个人信息。
              </p>
            </div>
            <div className="contact-form-shell">
              <LeadForm />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)] bg-[var(--background)] py-10">
        <div className="site-shell flex flex-col justify-between gap-4 text-sm text-[var(--muted)] lg:flex-row">
          <p>© 2026 {brand.legalName}</p>
          <div className="max-w-3xl lg:text-right">
            <a className="font-bold text-[var(--brand)]" href="/privacy">
              隐私说明
            </a>
            <p className="mt-2">{brand.disclaimer}</p>
          </div>
        </div>
      </footer>
    </>
  );
}
