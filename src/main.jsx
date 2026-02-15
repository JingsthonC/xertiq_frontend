// IMPORTANT: This must be imported FIRST to suppress Konva warnings
import "./utils/suppressKonvaWarning.js";

import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./index.css";
import "react-toastify/dist/ReactToastify.css";

// Initialize React app
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);

// Chrome extension specific initialization
if (
  typeof window !== "undefined" &&
  typeof window.chrome !== "undefined" &&
  window.chrome.runtime
) {
  console.log("XertiQ Wallet Chrome Extension loaded");

  // Set initial badge
  window.chrome.action.setBadgeText({ text: "🔒" });
  window.chrome.action.setBadgeBackgroundColor({ color: "#4A70A9" });
}
