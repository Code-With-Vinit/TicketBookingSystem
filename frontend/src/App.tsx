import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Booking from "./pages/Booking";

export default function App() {
  return (
    <div>
      <nav style={{ padding: 12, background: "#222", color: "white" }}>
        <Link style={{ marginRight: 20, color: "white" }} to="/">Home</Link>
        <Link style={{ color: "white" }} to="/admin">Admin</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/booking/:id" element={<Booking />} />
      </Routes>
    </div>
  );
}
