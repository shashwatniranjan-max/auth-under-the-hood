import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { wakeApi } from "./api";
import App from "./App.jsx";
import "./index.css";

wakeApi();
setInterval(wakeApi, 9 * 60 * 1000);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
