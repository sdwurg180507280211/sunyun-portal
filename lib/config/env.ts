import {resolve} from "node:path";

function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:4173",
  databasePath: resolve(process.env.DATABASE_PATH || "data/sunyun.db"),
  legacyLeadsPath: resolve(process.env.LEGACY_LEADS_PATH || "data/leads.jsonl"),
  adminUsername: process.env.ADMIN_USERNAME || "",
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH || "",
  sessionSecret: process.env.SESSION_SECRET || "",
  sessionTtlSeconds: positiveInteger(process.env.SESSION_TTL_SECONDS, 8 * 60 * 60),
  trustProxy: process.env.TRUST_PROXY === "1",
  cookieSecure: process.env.COOKIE_SECURE !== "0",
};

export function requireAuthConfig() {
  const missing = [
    ["ADMIN_USERNAME", env.adminUsername],
    ["ADMIN_PASSWORD_HASH", env.adminPasswordHash],
    ["SESSION_SECRET", env.sessionSecret],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length) {
    throw new Error(`Missing required authentication settings: ${missing.join(", ")}`);
  }

  if (env.sessionSecret.length < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 characters");
  }

  return {
    username: env.adminUsername,
    passwordHash: env.adminPasswordHash,
    sessionSecret: env.sessionSecret,
    ttlSeconds: env.sessionTtlSeconds,
  };
}
