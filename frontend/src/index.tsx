import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ShowProvider } from "./context/ShowContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ShowProvider>
        <App />
      </ShowProvider>
    </BrowserRouter>
  </React.StrictMode>
);
