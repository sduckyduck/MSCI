import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";
import "./compact-text.css";
import "./character-builder.css";
import "./premium-light.css";
import "./export-stable-preview.css";
import "./intro-layout-cleanup.js";

createRoot(document.getElementById("root")).render(<App />);
