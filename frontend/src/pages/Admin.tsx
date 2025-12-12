import React, { useState } from "react";
import { createShow } from "../api";
import { useShowContext } from "../context/ShowContext";

export default function Admin() {
  const { reloadShows } = useShowContext();
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [totalSeats, setTotalSeats] = useState(40);

  const submit = async () => {
    if (!name || !startTime) return alert("All fields required");

    await createShow({ name, startTime, totalSeats });
    reloadShows();

    setName("");
    setStartTime("");
    setTotalSeats(40);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Panel</h2>

      <div className="form">
        <input
          placeholder="Show Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />

        <input
          type="number"
          value={totalSeats}
          onChange={(e) => setTotalSeats(Number(e.target.value))}
        />

        <button onClick={submit}>Create Show</button>
      </div>
    </div>
  );
}
