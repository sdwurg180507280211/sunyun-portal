import {NextRequest, NextResponse} from "next/server";
import {SESSION_COOKIE, verifySessionToken} from "@/lib/auth/session";
import {leadCopy} from "@/lib/brand";
import {requireAuthConfig} from "@/lib/config/env";
import {createLead, listLeads} from "@/lib/db/lead-repository";
import {consumeRateLimit} from "@/lib/security/rate-limit";
import {getClientIp} from "@/lib/security/request";
import {parseLeadInput} from "@/lib/validation/lead";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedStatuses = new Set(["new", "contacted", "qualified", "won", "closed"]);

function getAdmin(request: NextRequest) {
  try {
    const config = requireAuthConfig();
    return verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value, config.sessionSecret);
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ok: false, message: "仅支持 JSON 请求"}, {status: 415});
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 64 * 1024) {
    return NextResponse.json({ok: false, message: "提交内容过大"}, {status: 413});
  }

  const ip = getClientIp(request);
  const rate = consumeRateLimit(`lead:${ip}`);
  if (!rate.allowed) {
    return NextResponse.json({ok: false, message: "提交过于频繁，请稍后再试"}, {status: 429});
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ok: false, message: "请求格式不是有效 JSON"}, {status: 400});
  }

  const parsed = parseLeadInput(raw);
  if (!parsed.success) {
    return NextResponse.json(
      {ok: false, message: parsed.error.issues[0]?.message || "请检查表单内容"},
      {status: 400},
    );
  }
  if (parsed.data.website) {
    return NextResponse.json({ok: true, message: leadCopy.accepted}, {status: 201});
  }

  try {
    const lead = createLead(parsed.data, {
      ip,
      userAgent: request.headers.get("user-agent")?.slice(0, 240) || "",
    });
    return NextResponse.json(
      {
        ok: true,
        id: lead.id,
        message: leadCopy.accepted,
        nextStep: leadCopy.nextStep,
      },
      {status: 201},
    );
  } catch (error) {
    console.error("Lead submission failed", error);
    return NextResponse.json({ok: false, message: "服务器暂时无法保存咨询"}, {status: 500});
  }
}

export async function GET(request: NextRequest) {
  if (!getAdmin(request)) {
    return NextResponse.json({ok: false, message: "登录已失效"}, {status: 401});
  }

  const {searchParams} = request.nextUrl;
  const status = searchParams.get("status") || "";
  if (status && !allowedStatuses.has(status)) {
    return NextResponse.json({ok: false, message: "线索状态筛选值不正确"}, {status: 400});
  }

  try {
    const result = listLeads({
      query: searchParams.get("q") || "",
      status,
      limit: Number(searchParams.get("limit") || 100),
      offset: Number(searchParams.get("offset") || 0),
    });
    return NextResponse.json({ok: true, ...result});
  } catch (error) {
    console.error("Lead list failed", error);
    return NextResponse.json({ok: false, message: "读取线索失败"}, {status: 500});
  }
}
