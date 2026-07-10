import {NextRequest, NextResponse} from "next/server";
import {createLead, listLeads} from "@/lib/db/lead-repository";
import {parseLeadInput} from "@/lib/validation/lead";
import {consumeRateLimit} from "@/lib/security/rate-limit";
import {getClientIp} from "@/lib/security/request";
import {SESSION_COOKIE, verifySessionToken} from "@/lib/auth/session";
import {requireAuthConfig} from "@/lib/config/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getAdmin(request: NextRequest) {
  try {
    const config = requireAuthConfig();
    return verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value, config.sessionSecret);
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rate = consumeRateLimit(`lead:${ip}`);
  if (!rate.allowed) {
    return NextResponse.json({ok: false, message: "提交过于频繁，请稍后再试"}, {status: 429});
  }

  try {
    const raw = await request.json();
    const parsed = parseLeadInput(raw);
    if (!parsed.success) {
      return NextResponse.json(
        {ok: false, message: parsed.error.issues[0]?.message || "请检查表单内容"},
        {status: 400},
      );
    }
    if (parsed.data.website) {
      return NextResponse.json({ok: true, message: "需求已提交"}, {status: 201});
    }

    const lead = createLead(parsed.data, {
      ip,
      userAgent: request.headers.get("user-agent")?.slice(0, 240) || "",
    });
    return NextResponse.json(
      {
        ok: true,
        id: lead.id,
        message: "需求已进入榫合云项目池",
        nextStep: "1 个工作日内完成需求澄清并给出执行建议",
      },
      {status: 201},
    );
  } catch (error) {
    console.error("Lead submission failed", error);
    return NextResponse.json({ok: false, message: "服务器暂时无法保存需求"}, {status: 500});
  }
}

export async function GET(request: NextRequest) {
  if (!getAdmin(request)) {
    return NextResponse.json({ok: false, message: "登录已失效"}, {status: 401});
  }

  const {searchParams} = request.nextUrl;
  const result = listLeads({
    query: searchParams.get("q") || "",
    status: searchParams.get("status") || "",
    limit: Number(searchParams.get("limit") || 100),
    offset: Number(searchParams.get("offset") || 0),
  });
  return NextResponse.json({ok: true, ...result});
}
