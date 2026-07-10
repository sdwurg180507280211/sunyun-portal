import {NextRequest, NextResponse} from "next/server";
import {z} from "zod";
import {SESSION_COOKIE, verifySessionToken} from "@/lib/auth/session";
import {requireAuthConfig} from "@/lib/config/env";
import {updateLeadStatus} from "@/lib/db/lead-repository";
import {isSameOrigin} from "@/lib/security/request";

export const runtime = "nodejs";

const statusSchema = z.object({
  status: z.enum(["new", "contacted", "qualified", "won", "closed"]),
});

export async function PATCH(request: NextRequest, context: {params: Promise<{id: string}>}) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ok: false, message: "请求来源校验失败"}, {status: 403});
  }

  let admin;
  try {
    const config = requireAuthConfig();
    admin = verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value, config.sessionSecret);
  } catch {
    admin = null;
  }
  if (!admin) {
    return NextResponse.json({ok: false, message: "登录已失效"}, {status: 401});
  }

  const parsed = statusSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ok: false, message: "线索状态不正确"}, {status: 400});
  }
  const {id} = await context.params;
  const updated = updateLeadStatus(id, parsed.data.status, admin.username);
  if (!updated) {
    return NextResponse.json({ok: false, message: "线索不存在"}, {status: 404});
  }
  return NextResponse.json({ok: true});
}
