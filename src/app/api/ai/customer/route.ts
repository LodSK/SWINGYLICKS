import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { query } from "@/lib/db";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const ChatSchema = z.object({
  customer_id: z.string().uuid().optional(),
  conversation_id: z.string().uuid().optional(),
  message: z.string().min(1),
});

export async function POST(req: Request) {
  const parsed = ChatSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { customer_id, message } = parsed.data;
  let conversationId = parsed.data.conversation_id;

  // Start or continue a logged conversation
  if (!conversationId) {
    const rows = await query(
      `INSERT INTO ai_conversations (channel, customer_id) VALUES ('customer', $1) RETURNING conversation_id`,
      [customer_id ?? null]
    );
    conversationId = rows[0].conversation_id;
  }
  await query(
    `INSERT INTO ai_messages (conversation_id, sender, content) VALUES ($1, 'user', $2)`,
    [conversationId, message]
  );

  // Ground the bot in the real, current menu — no hallucinated dishes or prices
  const menu = await query(`
    SELECT mi.name, mi.description, mi.price, mc.name AS category
    FROM menu_items mi JOIN menu_categories mc ON mc.category_id = mi.category_id
    WHERE mi.is_available = TRUE ORDER BY mc.display_order
  `);

  const history = await query(
    `SELECT sender, content FROM ai_messages WHERE conversation_id = $1 ORDER BY created_at ASC LIMIT 20`,
    [conversationId]
  );

  const systemPrompt = `You are the ordering assistant for a restaurant. Recommend dishes and help
customers build an order using ONLY the menu below — never invent items or prices.
When a customer is ready to order, summarize their order clearly (items, quantities, total)
so the app can submit it; do not claim you have placed the order yourself.

MENU:
${menu.map((m: any) => `- ${m.name} (${m.category}): ${m.description ?? ""} — GHS ${m.price}`).join("\n")}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 500,
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
