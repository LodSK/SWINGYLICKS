import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const branches = await query(`
    SELECT branch_id, name, address, phone, latitude, longitude, opens_at, closes_at
    FROM branches WHERE is_active = TRUE ORDER BY name
  `);
  return NextResponse.json({ branches });
}
