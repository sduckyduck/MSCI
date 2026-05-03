import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";
import "./compact-text.css";
import "./character-builder.css";
import "./premium-light.css";
import "./export-stable-preview.css";
import "./intro-layout.css";
import "./export-share-card.css";
import "./export-character-framing.css";
import "./author-widget.css";
import "./export-author-avatar.css";
import "./export-final-fixes.css";
import "./completion-auto-scroll.js";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
