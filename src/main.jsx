import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "react-toastify/dist/ReactToastify.css";

// Initialize React app
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <App />
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
  window.chrome.action.setBadgeBackgroundColor({ color: "#3B82F6" });
}
