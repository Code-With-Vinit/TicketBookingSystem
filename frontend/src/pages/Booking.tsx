import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useShowContext } from "../context/ShowContext";
import SeatGrid from "../components/SeatGrid";
import { bookSeats } from "../api";

export default function Booking() {
  const { id } = useParams();
  const showId = Number(id);
  const { shows, reloadShows } = useShowContext();
  const show = shows.find((s) => s.id === showId);

  const [selected, setSelected] = useState<number[]>([]);
  const [status, setStatus] = useState("");

  if (!show) return <p>Loading...</p>;

  const confirmBooking = async () => {
    const result = await bookSeats(showId, selected);
    setStatus(result.status);
    reloadShows();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Booking for {show.name}</h2>

      <SeatGrid
        totalSeats={show.totalSeats}
        bookedSeats={show.bookedSeats}
        selected={selected}
        setSelected={setSelected}
      />

      <button onClick={confirmBooking} disabled={selected.length === 0}>
        Confirm Booking
      </button>

      {status && <p>Booking Status: {status}</p>}
    </div>
  );
}
