import {NextResponse} from "next/server";
import {brand} from "@/lib/brand";
import {databaseHealth} from "@/lib/db/lead-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ok: databaseHealth(), service: brand.serviceId, version: "1.0.0"});
  } catch (error) {
    console.error("Health check failed", error);
    return NextResponse.json({ok: false, service: brand.serviceId}, {status: 503});
  }
}
