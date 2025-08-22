import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/converter.css";
import { inject } from "@vercel/analytics";

// enable vercel analytics
inject();

// Get the root element
const rootElement = document.getElementById("root");

// Make sure the element exists
if (!rootElement) {
  throw new Error("Root element not found");
}

// Create a root
const root = createRoot(rootElement);

// Render the app
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
