# Ticket Booking System (Backend + Frontend)

## Overview
This repository contains a sample Ticket Booking System:
- Backend: Node.js + Express + Postgres
- Frontend: React + TypeScript

Key features:
- Admin create show & seats
- User seat selection and booking
- Concurrency-safe booking using DB row-level locks (SELECT ... FOR UPDATE)
- Booking statuses: PENDING, CONFIRMED, FAILED
- Background worker to expire PENDING bookings after 2 minutes

## Quick start (local using docker-compose)
1. Clone repo
2. `cd backend`
3. `docker-compose up --build`
4. Apply schema:
   - Connect to Postgres container and run `schema.sql` (or include `init.sql` into docker volume)
5. Start backend: `npm run dev` (or container already runs)
6. Frontend:
   - `cd frontend`
   - `npm install`
   - Create `.env` with `VITE_API_BASE=http://localhost:4000/api`
   - `npm run start`

## Env vars
- `DATABASE_URL` — Postgres connection string
- `PORT` — backend port

## API Endpoints
- `GET /api/shows` — list shows
- `POST /api/shows` — create show { name, start_time, total_seats }
- `GET /api/shows/:id/seats` — list seats with status
- `POST /api/bookings` — create booking { showId, seats: [seat_no,...] } -> PENDING
- `POST /api/bookings/:id/confirm` — confirm booking -> CONFIRMED
- `GET /api/bookings/:id` — get booking status

## Notes on concurrency
We use seat-level rows and `SELECT ... FOR UPDATE` inside a transaction to lock specific seat rows for the duration of the booking transaction, preventing double-booking.

## Deployment
- Backend: Render. Ensure `DATABASE_URL` set and run DB migrations (schema.sql).
- Frontend: Vercel. Set `VITE_API_BASE` to deployed backend `/api` URL.
