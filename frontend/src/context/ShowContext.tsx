import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchShows } from "../api";

interface Show {
  id: number;
  name: string;
  startTime: string;
  totalSeats: number;
  bookedSeats: number[];
}

interface ShowContextType {
  shows: Show[];
  reloadShows: () => void;
}

const ShowContext = createContext<ShowContextType>({
  shows: [],
  reloadShows: () => {},
});

export const ShowProvider = ({ children }: { children: React.ReactNode }) => {
  const [shows, setShows] = useState<Show[]>([]);

  const load = async () => {
    const data = await fetchShows();
    setShows(data);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <ShowContext.Provider value={{ shows, reloadShows: load }}>
      {children}
    </ShowContext.Provider>
  );
};

export const useShowContext = () => useContext(ShowContext);
