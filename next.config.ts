import type {NextConfig} from "next";

export function buildContentSecurityPolicy(nodeEnv: string | undefined) {
  const scriptSources = ["'self'", "'unsafe-inline'"];
  if (nodeEnv === "development") scriptSources.push("'unsafe-eval'");

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "style-src 'self' 'unsafe-inline'",
    `script-src ${scriptSources.join(" ")}`,
    "connect-src 'self'",
  ].join("; ");
}

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  serverExternalPackages: ["better-sqlite3"],
  experimental: {
    optimizePackageImports: ["@heroui/react"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {key: "X-Content-Type-Options", value: "nosniff"},
          {key: "Referrer-Policy", value: "strict-origin-when-cross-origin"},
          {key: "X-Frame-Options", value: "DENY"},
          {key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()"},
          {
            key: "Content-Security-Policy",
            value: buildContentSecurityPolicy(process.env.NODE_ENV),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
