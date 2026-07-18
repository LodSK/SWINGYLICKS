import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const items = await query(`
    SELECT mi.item_id, mi.name, mi.description, mi.price, mi.calories,
           mc.name AS category
    FROM menu_items mi
    JOIN menu_categories mc ON mc.category_id = mi.category_id
    WHERE mi.is_available = TRUE
    ORDER BY mc.display_order, mi.name
  `);
  return NextResponse.json({ items });
}
