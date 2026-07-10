"use client";

import {Button, Card, Chip} from "@heroui/react";
import {LeadForm} from "@/components/lead-form/lead-form";

const services = [
  {number: "01", title: "软件定制开发", description: "围绕真实业务流程，交付可上线、可维护、可继续迭代的 Web 系统与管理后台。"},
  {number: "02", title: "官网与小程序", description: "兼顾品牌表达、访问性能、SEO 与获客转化，形成可持续运营的数字入口。"},
  {number: "03", title: "数据看板与报表", description: "把分散在 Excel、数据库和业务系统中的数据，整理成可读、可追踪的经营视图。"},
  {number: "04", title: "内部工具与自动化", description: "针对重复录入、流程审批、项目台账、客户跟进等场景，用轻量系统减少人工成本。"},
  {number: "05", title: "原型与需求梳理", description: "在编码前明确角色、流程、边界与验收标准，让预算投入更可控。"},
  {number: "06", title: "技术咨询与接手维护", description: "评估已有系统、工具选型、部署方案，也可以接手历史项目进行重构与长期维护。"},
];

const process = [
  ["01", "需求澄清", "了解业务目标、用户角色、核心流程与项目边界。"],
  ["02", "原型报价", "用原型和功能清单对齐范围，再确认周期与费用。"],
  ["03", "开发联调", "按阶段交付可运行版本，持续演示和吸收反馈。"],
  ["04", "上线验收", "完成部署、数据准备、使用培训与验收清单。"],
  ["05", "维护迭代", "提供问题响应、数据备份、安全更新和后续优化。"],
];

const cases = [
  ["线索与项目跟进系统", "从官网表单到后台筛选、状态跟进、CSV 导出，形成小型获客闭环。"],
  ["运营数据统计看板", "统一多个来源的数据口径，按日期、团队和业务维度呈现关键指标。"],
  ["报名页与现场管理后台", "支持活动报名、信息校验、现场签到、名单管理和结果导出。"],
];

function scrollToForm() {
  document.querySelector("#contact")?.scrollIntoView({behavior: "smooth", block: "start"});
}

export function MarketingPage() {
  return (
    <main>
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/80 backdrop-blur-xl">
        <div className="site-shell flex h-18 items-center justify-between gap-6">
          <a className="flex items-center gap-3 font-extrabold tracking-tight" href="#top" aria-label="榫合云首页">
            <span className="grid size-10 place-items-center rounded-xl bg-[var(--foreground)] text-white">榫</span>
            <span>榫合云科技</span>
          </a>
          <nav className="hidden items-center gap-7 text-sm text-[var(--muted)] md:flex" aria-label="主导航">
            <a href="#services">服务</a><a href="#process">流程</a><a href="#cases">能力</a><a href="#contact">联系</a>
          </nav>
          <Button onPress={scrollToForm} size="sm" variant="primary">提交需求</Button>
        </div>
      </header>

      <section className="site-shell grid min-h-[760px] items-center gap-12 py-20 lg:grid-cols-[1.08fr_.92fr]" id="top">
        <div>
          <Chip color="accent">企业软件定制 · 轻量数字化交付伙伴</Chip>
          <h1 className="mt-7 max-w-4xl text-[clamp(3rem,7vw,6.4rem)] font-[780] leading-[.94] tracking-[-.065em]">
            把业务需求，<br /><span className="text-[var(--accent)]">做成真正能上线的系统。</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            北京榫合云为中小企业、创业团队和项目负责人承接官网、小程序、业务后台、数据看板与内部工具开发。从需求梳理到部署维护，一支团队盯到底。
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button onPress={scrollToForm} variant="primary">聊聊你的项目</Button>
            <Button onPress={() => document.querySelector("#services")?.scrollIntoView({behavior: "smooth"})} variant="outline">查看服务范围</Button>
          </div>
          <div className="mt-12 grid max-w-2xl grid-cols-3 gap-4 border-t border-black/10 pt-7 text-sm">
            <div><strong className="block text-2xl">1 对 1</strong><span className="text-[var(--muted)]">需求负责人</span></div>
            <div><strong className="block text-2xl">阶段化</strong><span className="text-[var(--muted)]">演示与验收</span></div>
            <div><strong className="block text-2xl">可持续</strong><span className="text-[var(--muted)]">维护与迭代</span></div>
          </div>
        </div>

        <div className="glass-panel relative overflow-hidden rounded-[2rem] p-6 sm:p-9">
          <div className="absolute -right-16 -top-16 size-52 rounded-full bg-emerald-300/25 blur-3xl" />
          <div className="relative flex items-center justify-between border-b border-black/10 pb-5">
            <div><p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--accent)]">Delivery console</p><h2 className="mt-2 text-2xl font-bold">项目交付不是黑盒</h2></div>
            <span className="size-3 rounded-full bg-emerald-500 shadow-[0_0_0_6px_rgba(16,185,129,.12)]" />
          </div>
          <div className="relative mt-6 grid gap-4">
            {["业务系统定制", "官网 · 小程序 · 落地页", "数据看板与内部工具"].map((item, index) => (
              <Card key={item} variant={index === 0 ? "tertiary" : "default"}>
                <Card.Header><Card.Title>{item}</Card.Title><Card.Description>从需求、原型、开发到部署维护</Card.Description></Card.Header>
                <Card.Content>
                  <div className="flex items-center gap-2 text-sm text-[var(--muted)]"><span className="h-1.5 flex-1 rounded-full bg-black/8"><span className="block h-full rounded-full bg-[var(--accent)]" style={{width: `${88 - index * 14}%`}} /></span><span>{88 - index * 14}%</span></div>
                </Card.Content>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="site-shell py-24" id="services">
        <p className="section-kicker">Services</p><h2 className="section-title">不是堆功能，而是解决一段真实业务流程。</h2>
        <p className="section-copy mt-6">先判断真正需要解决的问题，再选择合适的技术与交付范围。项目可以从一个关键环节开始，后续逐步扩展。</p>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.number} className="min-h-64" variant="default">
              <Card.Header><span className="text-sm font-black text-[var(--accent)]">{service.number}</span><Card.Title className="mt-8 text-2xl">{service.title}</Card.Title></Card.Header>
              <Card.Content><p className="leading-7 text-[var(--muted)]">{service.description}</p></Card.Content>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-[var(--foreground)] py-24 text-white" id="process">
        <div className="site-shell">
          <p className="section-kicker text-emerald-300">Process</p><h2 className="section-title">把不确定的开发过程，拆成可确认的五步。</h2>
          <div className="mt-14 grid gap-px overflow-hidden rounded-3xl bg-white/15 lg:grid-cols-5">
            {process.map(([number, title, copy]) => <div className="min-h-72 bg-[var(--foreground)] p-7" key={number}><span className="text-emerald-300">{number}</span><h3 className="mt-16 text-xl font-bold">{title}</h3><p className="mt-4 text-sm leading-7 text-white/60">{copy}</p></div>)}
          </div>
        </div>
      </section>

      <section className="site-shell py-24" id="cases">
        <p className="section-kicker">Capabilities</p><h2 className="section-title">用可以落地的场景，说明我们的交付能力。</h2>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {cases.map(([title, copy], index) => <Card key={title} variant={index === 1 ? "tertiary" : "secondary"}><Card.Header><Chip>{`0${index + 1}`}</Chip><Card.Title className="mt-8 text-2xl">{title}</Card.Title></Card.Header><Card.Content><p className="leading-7 text-[var(--muted)]">{copy}</p></Card.Content></Card>)}
        </div>
      </section>

      <section className="site-shell pb-24 pt-10" id="contact">
        <div className="glass-panel grid gap-12 rounded-[2rem] p-6 sm:p-10 lg:grid-cols-[.72fr_1.28fr] lg:p-14">
          <div><p className="section-kicker">Start a project</p><h2 className="mt-4 text-4xl font-bold tracking-tight">把需求先说清楚，项目就成功了一半。</h2><p className="mt-6 leading-8 text-[var(--muted)]">不需要先准备完整需求文档。描述业务场景、主要使用者和想解决的问题，我们会协助补全边界、优先级和实施路径。</p><div className="mt-8 space-y-3 text-sm"><p>✓ 1 个工作日内联系</p><p>✓ 先给执行建议，再确定是否合作</p><p>✓ 信息仅用于本次项目沟通</p></div></div>
          <LeadForm />
        </div>
      </section>

      <footer className="border-t border-black/10 py-10">
        <div className="site-shell flex flex-col justify-between gap-5 text-sm text-[var(--muted)] sm:flex-row"><p>© 2026 北京榫合云科技有限公司</p><p>软件开发 · 业务系统 · 数据看板 · 数字化咨询</p></div>
      </footer>
    </main>
  );
}
