import { NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";

const Schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const parsed = Schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }
  try {
    await query(
      `INSERT INTO newsletter_subscribers (email) VALUES ($1) ON CONFLICT (email) DO NOTHING`,
      [parsed.data.email]
    );
    return NextResponse.json({ subscribed: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
