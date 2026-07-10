import {NextRequest, NextResponse} from "next/server";
import {z} from "zod";
import {verifyPassword} from "@/lib/auth/password";
import {createSessionToken, SESSION_COOKIE} from "@/lib/auth/session";
import {env, requireAuthConfig} from "@/lib/config/env";
import {consumeRateLimit} from "@/lib/security/rate-limit";
import {getClientIp, isSameOrigin} from "@/lib/security/request";

export const runtime = "nodejs";

const loginSchema = z.object({
  username: z.string().trim().min(1).max(80),
  password: z.string().min(1).max(256),
});

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ok: false, message: "请求来源校验失败"}, {status: 403});
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 8 * 1024) {
    return NextResponse.json({ok: false, message: "登录请求内容过大"}, {status: 413});
  }

  const rate = consumeRateLimit(`admin-login:${getClientIp(request)}`, 10, 15 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json({ok: false, message: "登录尝试过于频繁，请稍后再试"}, {status: 429});
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ok: false, message: "登录请求格式不正确"}, {status: 400});
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ok: false, message: "用户名或密码格式不正确"}, {status: 400});
  }

  try {
    const config = requireAuthConfig();
    const validPassword = verifyPassword(parsed.data.password, config.passwordHash);
    const valid = parsed.data.username === config.username && validPassword;
    if (!valid) {
      return NextResponse.json({ok: false, message: "用户名或密码错误"}, {status: 401});
    }

    const token = createSessionToken(config.username, config.sessionSecret, config.ttlSeconds);
    const response = NextResponse.json({ok: true});
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: env.cookieSecure,
      sameSite: "strict",
      path: "/",
      maxAge: config.ttlSeconds,
    });
    return response;
  } catch (error) {
    console.error("Admin login failed", error);
    return NextResponse.json({ok: false, message: "后台认证尚未配置完成"}, {status: 503});
  }
}

export async function DELETE(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ok: false, message: "请求来源校验失败"}, {status: 403});
  }
  const response = NextResponse.json({ok: true});
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}
