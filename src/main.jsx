import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";
import "./compact-text.css";
import "./character-builder.css";
import "./premium-light.css";
import "./export-stable-preview.css";
import "./msio-safe-action-fix.js";
import "./msci-class-visual-fix.js";
import "./archer-weapon-action-fix.js";
import "./mage-weapon-shield-fix.js";
import "./final-preview-action-guard.js";
import "./simplify-random-button.js";
import "./safe-result-export.js";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
