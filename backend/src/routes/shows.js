// src/routes/shows.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

/**
 * GET /api/shows
 * List shows with basic info
 */
router.get('/', async (req, res) => {
  const { rows } = await db.query('SELECT id, name, start_time, total_seats FROM shows ORDER BY start_time');
  res.json(rows);
});

/**
 * POST /api/shows
 * Create show and seats
 * body: { name, start_time, total_seats }
 */
router.post('/', async (req, res) => {
  const { name, start_time, total_seats } = req.body;
  if (!name || !start_time || !total_seats) return res.status(400).json({ error: 'missing fields' });

  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const showId = uuidv4();
    await client.query(
      'INSERT INTO shows (id, name, start_time, total_seats) VALUES ($1,$2,$3,$4)',
      [showId, name, start_time, total_seats]
    );
    // create seats
    for (let i = 1; i <= total_seats; i++){
      await client.query(
        'INSERT INTO seats (show_id, seat_no, status) VALUES ($1,$2,$3)',
        [showId, i, 'AVAILABLE']
      );
    }
    await client.query('COMMIT');
    res.status(201).json({ id: showId, name, start_time, total_seats });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'failed to create show' });
  } finally {
    client.release();
  }
});

/**
 * GET /api/shows/:id/seats
 * Return seats with status
 */
router.get('/:id/seats', async (req, res) => {
  const showId = req.params.id;
  const { rows } = await db.query('SELECT id, seat_no, status FROM seats WHERE show_id = $1 ORDER BY seat_no', [showId]);
  res.json(rows);
});

module.exports = router;
