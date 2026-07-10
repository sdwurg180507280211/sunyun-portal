import type {Metadata} from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:4173";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "北京榫合云科技有限公司｜软件定制开发与数字化交付",
    template: "%s｜榫合云",
  },
  description:
    "面向中小企业与创业团队，提供官网、小程序、业务后台、数据看板、内部工具与轻量数字化系统交付。",
  alternates: {canonical: "/"},
  openGraph: {
    type: "website",
    locale: "zh_CN",
    title: "榫合云｜把业务需求做成真正能上线的系统",
    description: "软件定制、业务后台、数据看板、官网与小程序的一站式交付。",
    url: siteUrl,
    siteName: "榫合云",
  },
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
