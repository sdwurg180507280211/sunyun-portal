import type {NextRequest} from "next/server";
import {env} from "@/lib/config/env";

export function getClientIp(request: NextRequest): string {
  if (!env.trustProxy) return "direct-client";
  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

export function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const forwardedHost = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || new URL(request.url).protocol.replace(":", "");
  if (!forwardedHost) return false;
  return origin === `${forwardedProto}://${forwardedHost}`;
}
