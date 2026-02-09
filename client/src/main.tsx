import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

window.onerror = function(message, source, lineno, colno, error) {
  try {
    fetch("/api/client-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        message: String(message),
        stack: error?.stack || `${source}:${lineno}:${colno}`,
        componentStack: "",
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        type: "window.onerror",
      }),
    }).catch(() => {});
  } catch (e) {}
};

window.addEventListener("unhandledrejection", function(event) {
  try {
    fetch("/api/client-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        message: String(event.reason?.message || event.reason || "Unhandled promise rejection"),
        stack: event.reason?.stack || "",
        componentStack: "",
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        type: "unhandledrejection",
      }),
    }).catch(() => {});
  } catch (e) {}
});

createRoot(document.getElementById("root")!).render(<App />);
