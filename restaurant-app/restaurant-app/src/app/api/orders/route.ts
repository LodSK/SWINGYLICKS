import { NextResponse } from "next/server";
import { z } from "zod";
import { query, withTransaction } from "@/lib/db";

const OrderItemSchema = z.object({
  item_id: z.string().uuid(),
  quantity: z.number().int().positive(),
});

const CreateOrderSchema = z.object({
  customer_id: z.string().uuid(),
  staff_id: z.string().uuid().optional(),
  channel: z.enum(["dine_in", "takeaway", "delivery"]),
  items: z.array(OrderItemSchema).min(1),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = CreateOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { customer_id, staff_id, channel, items } = parsed.data;

  try {
    const order = await withTransaction(async (client) => {
      const orderRes = await client.query(
        `INSERT INTO orders (customer_id, staff_id, channel, status)
         VALUES ($1, $2, $3, 'pending') RETURNING order_id`,
        [customer_id, staff_id ?? null, channel]
      );
      const orderId = orderRes.rows[0].order_id;

      // Snapshot current menu price into order_items, per item
      for (const it of items) {
        const priceRes = await client.query(
          `SELECT price FROM menu_items WHERE item_id = $1 AND is_available = TRUE`,
          [it.item_id]
        );
        if (priceRes.rowCount === 0) {
          throw new Error(`Menu item ${it.item_id} is not available`);
        }
        await client.query(
          `INSERT INTO order_items (order_id, item_id, quantity, unit_price)
           VALUES ($1, $2, $3, $4)`,
          [orderId, it.item_id, it.quantity, priceRes.rows[0].price]
        );
      }
      // Totals are computed by the trg_order_items_recalc trigger automatically.
      const finalOrder = await client.query(`SELECT * FROM orders WHERE order_id = $1`, [orderId]);
      return finalOrder.rows[0];
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get("customer_id");
  const rows = customerId
    ? await query(`SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC`, [customerId])
    : await query(`SELECT * FROM orders ORDER BY created_at DESC LIMIT 50`);
  return NextResponse.json({ orders: rows });
}
