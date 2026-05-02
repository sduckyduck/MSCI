function getBuilderFieldLabel(field) {
  return String(field?.querySelector?.("span")?.textContent || "").trim();
}

function applyGenderOnlyCharacterControls(root = document) {
  root.querySelectorAll?.(".character-builder-controls").forEach((panel) => {
    panel.dataset.genderOnlyControls = "1";

    panel.querySelectorAll(".builder-field").forEach((field) => {
      const label = getBuilderFieldLabel(field);
      const keep = label.includes("性别");
      field.dataset.keepCharacterControl = keep ? "1" : "0";
      field.hidden = !keep;
      field.style.display = keep ? "" : "none";
    });

    const grid = panel.querySelector(".builder-grid");
    if (grid) grid.dataset.genderOnlyGrid = "1";
  });
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  applyGenderOnlyCharacterControls();

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes || []) {
        if (node?.matches?.(".character-builder-controls")) applyGenderOnlyCharacterControls(node.parentElement || document);
        if (node?.querySelector?.(".character-builder-controls")) applyGenderOnlyCharacterControls(node);
      }
    }
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
}
