import type {Metadata} from "next";
import {brand} from "@/lib/brand";

const privacyTitle = `隐私说明｜${brand.shortName}`;
const privacyDescription = `${brand.legalName}商务咨询表单隐私说明`;

export const metadata: Metadata = {
  title: {absolute: privacyTitle},
  description: privacyDescription,
  alternates: {canonical: "/privacy"},
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: brand.shortName,
    title: privacyTitle,
    description: privacyDescription,
    url: "/privacy",
  },
};

const sections = [
  {title: "我们处理的信息", body: "您主动填写的必填信息包括咨询方向、单位名称、联系人、联系电话、业务场景与目标；选填信息包括微信、所在地区、期望启动时间、预期使用范围、预算情况。系统还会记录 IP 地址和浏览器 User-Agent，用于防滥用、安全防护与问题排查。"},
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
