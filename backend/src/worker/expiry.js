// src/worker/expiry.js
const db = require('../db');

const EXPIRY_MINUTES = 2;

async function expireBookings() {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `SELECT id FROM bookings
       WHERE status = 'PENDING' AND created_at < now() - interval '${EXPIRY_MINUTES} minutes'
       FOR UPDATE SKIP LOCKED`
    );

    if (rows.length === 0) {
      await client.query('COMMIT');
      return;
    }

    for (const r of rows) {
      const bookingId = r.id;
      // get seat ids
      const seatRes = await client.query(
        `SELECT s.id FROM seats s
         JOIN booking_seats bs ON bs.seat_id = s.id
         WHERE bs.booking_id = $1 FOR UPDATE`,
        [bookingId]
      );
      const seatIds = seatRes.rows.map(s => s.id);
      if (seatIds.length > 0) {
        await client.query('UPDATE seats SET status = $1 WHERE id = ANY($2::uuid[])', ['AVAILABLE', seatIds]);
      }
      await client.query('UPDATE bookings SET status = $1, updated_at = now() WHERE id = $2', ['FAILED', bookingId]);
      console.log(`Expired booking ${bookingId}`);
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Worker error', err);
  } finally {
    client.release();
  }
}

async function run() {
  console.log('Expiry worker started');
  setInterval(expireBookings, 30 * 1000); // every 30s
}

run().catch(err => console.error(err));
