import { NextResponse } from "next/server";
import { z } from "zod";
import { query, withTransaction } from "@/lib/db";

const ReservationSchema = z.object({
  customer_id: z.string().uuid(),
  party_size: z.number().int().positive(),
  reservation_time: z.string().datetime(),
});

export async function POST(req: Request) {
  const parsed = ReservationSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { customer_id, party_size, reservation_time } = parsed.data;

  try {
    const reservation = await withTransaction(async (client) => {
      // Find a table big enough that isn't already booked within +/- 90 min of the requested time
      const tableRes = await client.query(
        `SELECT t.table_id
         FROM restaurant_tables t
         WHERE t.is_active = TRUE
           AND t.capacity >= $1
           AND t.table_id NOT IN (
             SELECT r.table_id FROM reservations r
             WHERE r.status IN ('booked','seated')
               AND r.reservation_time BETWEEN $2::timestamptz - INTERVAL '90 minutes'
                                          AND $2::timestamptz + INTERVAL '90 minutes'
           )
         ORDER BY t.capacity ASC
         LIMIT 1`,
        [party_size, reservation_time]
      );
      if (tableRes.rowCount === 0) {
        throw new Error("No tables available for that party size and time");
      }
      const tableId = tableRes.rows[0].table_id;

      const resRes = await client.query(
        `INSERT INTO reservations (customer_id, table_id, party_size, reservation_time)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [customer_id, tableId, party_size, reservation_time]
      );
      return resRes.rows[0];
    });

    return NextResponse.json({ reservation }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function GET() {
  const reservations = await query(`SELECT * FROM active_reservations`);
  return NextResponse.json({ reservations });
}
