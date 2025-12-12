// src/routes/bookings.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

/**
 * POST /api/bookings
 * body: { showId, seats: [seat_no,...] }
 * Creates a PENDING booking and locks seats (status -> LOCKED)
 */
router.post('/', async (req, res) => {
  const { showId, seats } = req.body;
  if (!showId || !Array.isArray(seats) || seats.length === 0) {
    return res.status(400).json({ error: 'showId and seats array required' });
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // Fetch seat rows with SELECT ... FOR UPDATE
    const q = `
      SELECT id, seat_no, status FROM seats
      WHERE show_id = $1 AND seat_no = ANY($2::int[])
      FOR UPDATE
    `;
    const { rows } = await client.query(q, [showId, seats]);

    if (rows.length !== seats.length) {
      // some seats not found
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'one or more seats not found' });
    }

    // check availability
    const occupied = rows.filter(r => r.status !== 'AVAILABLE');
    if (occupied.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'one or more seats already taken', taken: occupied.map(r=>r.seat_no) });
    }

    // lock seats -> set to LOCKED
    const seatIds = rows.map(r => r.id);
    await client.query(
      'UPDATE seats SET status = $1 WHERE id = ANY($2::uuid[])',
      ['LOCKED', seatIds]
    );

    // create booking
    const bookingId = uuidv4();
    await client.query(
      'INSERT INTO bookings (id, show_id, status) VALUES ($1,$2,$3)',
      [bookingId, showId, 'PENDING']
    );

    // link seats
    for (const sid of seatIds) {
      await client.query('INSERT INTO booking_seats (booking_id, seat_id) VALUES ($1,$2)', [bookingId, sid]);
    }

    await client.query('COMMIT');

    res.status(201).json({ bookingId, status: 'PENDING' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'booking failed' });
  } finally {
    client.release();
  }
});

/**
 * POST /api/bookings/:id/confirm
 * Confirm booking: set booking status CONFIRMED and seats -> BOOKED
 */
router.post('/:id/confirm', async (req, res) => {
  const bookingId = req.params.id;
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // get seats for booking with FOR UPDATE
    const seatRows = await client.query(`
      SELECT s.id, s.status
      FROM seats s
      JOIN booking_seats bs ON bs.seat_id = s.id
      WHERE bs.booking_id = $1
      FOR UPDATE
    `, [bookingId]);

    if (seatRows.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'booking or seats not found' });
    }

    // ensure seats are LOCKED
    const notLocked = seatRows.rows.filter(r => r.status !== 'LOCKED' && r.status !== 'AVAILABLE' && r.status !== 'BOOKED' && r.status !== 'LOCKED');
    // simpler: if any seat is BOOKED already -> conflict
    const alreadyBooked = seatRows.rows.filter(r => r.status === 'BOOKED');
    if (alreadyBooked.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'some seats already booked' });
    }

    // set seats BOOKED
    const seatIds = seatRows.rows.map(r => r.id);
    await client.query('UPDATE seats SET status = $1 WHERE id = ANY($2::uuid[])', ['BOOKED', seatIds]);

    // update booking
    await client.query('UPDATE bookings SET status = $1, updated_at = now() WHERE id = $2', ['CONFIRMED', bookingId]);

    await client.query('COMMIT');
    res.json({ bookingId, status: 'CONFIRMED' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'confirm failed' });
  } finally {
    client.release();
  }
});

/**
 * GET /api/bookings/:id
 * Get booking status
 */
router.get('/:id', async (req, res) => {
  const bookingId = req.params.id;
  const { rows } = await db.query('SELECT id, show_id, status, created_at, updated_at FROM bookings WHERE id = $1', [bookingId]);
  if (rows.length === 0) return res.status(404).json({ error: 'not found' });
  res.json(rows[0]);
});

module.exports = router;
