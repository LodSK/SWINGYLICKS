import { NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";

const CustomerSchema = z.object({
  full_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(6),
});

// Simple guest-checkout upsert: find by email, or create.
// NOTE: for a real production launch, replace this with Supabase Auth
// so customers have real accounts, password resets, and order history tied to a login.
export async function POST(req: Request) {
  const parsed = CustomerSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { full_name, email, phone } = parsed.data;

  const existing = await query(`SELECT customer_id FROM customers WHERE email = $1`, [email]);
  if (existing.length > 0) {
    return NextResponse.json({ customer_id: existing[0].customer_id });
  }

  const created = await query(
    `INSERT INTO customers (full_name, email, phone, password_hash)
     VALUES ($1, $2, $3, 'guest_checkout') RETURNING customer_id`,
    [full_name, email, phone]
  );
  return NextResponse.json({ customer_id: created[0].customer_id });
}
