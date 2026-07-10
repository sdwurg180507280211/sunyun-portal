import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import {requireAuthConfig} from "@/lib/config/env";
import {SESSION_COOKIE, verifySessionToken} from "@/lib/auth/session";

export async function getCurrentAdmin() {
  try {
    const config = requireAuthConfig();
    const cookieStore = await cookies();
    return verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value, config.sessionSecret);
  } catch {
    return null;
  }
}

export async function requireCurrentAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
