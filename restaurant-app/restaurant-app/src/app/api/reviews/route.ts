import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const reviews = await query(`
    SELECT r.rating, r.comment, r.created_at, c.full_name AS customer_name
    FROM reviews r
    JOIN customers c ON c.customer_id = r.customer_id
    WHERE r.rating >= 4 AND r.comment IS NOT NULL
    ORDER BY r.created_at DESC
    LIMIT 6
  `);
  return NextResponse.json({ reviews });
}
