import React from "react";

interface Props {
  totalSeats: number;
  bookedSeats: number[];
  selected: number[];
  setSelected: (s: number[]) => void;
}

export default function SeatGrid({
  totalSeats,
  bookedSeats,
  selected,
  setSelected,
}: Props) {
  const toggle = (index: number) => {
    if (bookedSeats.includes(index)) return;

    if (selected.includes(index)) {
      setSelected(selected.filter((s) => s !== index));
    } else {
      setSelected([...selected, index]);
    }
  };

  return (
    <div className="grid">
      {Array.from({ length: totalSeats }).map((_, i) => {
        const isBooked = bookedSeats.includes(i);
        const isSelected = selected.includes(i);

        return (
          <div
            key={i}
            className={`seat ${isBooked ? "booked" : ""} ${
              isSelected ? "selected" : ""
            }`}
            onClick={() => toggle(i)}
          >
            {i + 1}
          </div>
        );
      })}
    </div>
  );
}
