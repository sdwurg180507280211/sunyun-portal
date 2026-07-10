import {NextResponse} from "next/server";
import {databaseHealth} from "@/lib/db/lead-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ok: databaseHealth(), service: "sunyun-portal", version: "1.0.0"});
  } catch (error) {
    console.error("Health check failed", error);
    return NextResponse.json({ok: false, service: "sunyun-portal"}, {status: 503});
  }
}
