import React from "react";
import { Link } from "react-router-dom";
import { useShowContext } from "../context/ShowContext";

export default function Home() {
  const { shows } = useShowContext();

  return (
    <div style={{ padding: 20 }}>
      <h2>Available Shows</h2>

      {shows.length === 0 && <p>No shows available.</p>}

      {shows.map((s) => (
        <div key={s.id} className="card">
          <h3>{s.name}</h3>
          <p>Start Time: {s.startTime}</p>
          <p>Total Seats: {s.totalSeats}</p>

          <Link to={`/booking/${s.id}`}>
            <button>Book Seats</button>
          </Link>
        </div>
      ))}
    </div>
  );
}
