import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { query } from "@/lib/db";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const ChatSchema = z.object({
  staff_id: z.string().uuid(),
  conversation_id: z.string().uuid().optional(),
  message: z.string().min(1),
});

export async function POST(req: Request) {
  const parsed = ChatSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { staff_id, message } = parsed.data;
  let conversationId = parsed.data.conversation_id;

  if (!conversationId) {
    const rows = await query(
      `INSERT INTO ai_conversations (channel, staff_id) VALUES ('admin', $1) RETURNING conversation_id`,
      [staff_id]
    );
    conversationId = rows[0].conversation_id;
  }
  await query(
    `INSERT INTO ai_messages (conversation_id, sender, content) VALUES ($1, 'user', $2)`,
    [conversationId, message]
  );

  // Pull live operational snapshots the bot can reason over — this is what makes it
  // an "insights" bot rather than a chat toy: real numbers, not guesses.
  const [sales, lowStock, topItems, upcomingReservations] = await Promise.all([
    query(`SELECT * FROM daily_sales_summary LIMIT 7`),
    query(`SELECT * FROM low_stock_ingredients`),
    query(`SELECT * FROM top_selling_items LIMIT 5`),
    query(`SELECT * FROM active_reservations LIMIT 10`),
  ]);

  const systemPrompt = `You are an operations assistant for restaurant management staff.
Answer using ONLY the live data provided below. If asked something the data doesn't cover,
say so rather than guessing.

LAST 7 DAYS SALES:
${JSON.stringify(sales)}

LOW STOCK INGREDIENTS (need reordering):
${JSON.stringify(lowStock)}

TOP 5 SELLING ITEMS (30 days):
${JSON.stringify(topItems)}

UPCOMING RESERVATIONS:
${JSON.stringify(upcomingReservations)}`;

  const history = await query(
    `SELECT sender, content FROM ai_messages WHERE conversation_id = $1 ORDER BY created_at ASC LIMIT 20`,
    [conversationId]
  );

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 600,
    system: systemPrompt,
    messages: history.map((h: any) => ({
      role: h.sender === "user" ? "user" : "assistant",
      content: h.content,
    })),
  });

  const reply = response.content.find((c) => c.type === "text")?.text ?? "";

  await query(
    `INSERT INTO ai_messages (conversation_id, sender, content) VALUES ($1, 'bot', $2)`,
    [conversationId, reply]
  );

  return NextResponse.json({ conversation_id: conversationId, reply });
}
