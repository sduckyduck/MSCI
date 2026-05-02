import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";
import "./compact-text.css";
import "./character-builder.css";
import "./premium-light.css";
import "./export-stable-preview.css";
import "./stable-character-preview-manager.js";
import "./gender-only-character-controls.js";
import "./intro-layout-cleanup.js";
import "./simplify-random-button.js";
import "./safe-result-export.js";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
