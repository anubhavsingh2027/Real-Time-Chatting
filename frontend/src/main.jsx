import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
// Track new user visit
window.addEventListener("load", () => {
  fetch("https://app.chatting.nav-code.com/detector/newUser/Real-time-chatting", {
    method: "GET",
  })
    .then((res) => res.json())
    .then((data) => {
      // User visited
    })
    .catch((err) => {
      // Visit tracking failed
    });
});