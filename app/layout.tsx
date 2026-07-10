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
