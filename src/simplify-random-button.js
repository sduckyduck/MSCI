function normalizeButtonText(button) {
  return (button?.textContent || "").replace(/\s+/g, "").trim();
}

function applyButtonState(button, { hidden, text, ariaLabel }) {
  const nextHidden = hidden ? "1" : "0";
  const nextText = text || "";

  if (
    button.dataset.msciSimplified === "1" &&
    button.dataset.msciHidden === nextHidden &&
    (!nextText || button.textContent === nextText)
  ) {
    return;
  }

  button.dataset.msciSimplified = "1";
  button.dataset.msciHidden = nextHidden;
  button.hidden = Boolean(hidden);
  button.style.display = hidden ? "none" : "";

  if (hidden) {
    button.dataset.html2canvasIgnore = "true";
    return;
  }

  if (text && button.textContent !== text) button.textContent = text;
  if (ariaLabel) button.setAttribute("aria-label", ariaLabel);
}

function simplifyRandomButtons(root = document) {
  root.querySelectorAll?.(".builder-button-row").forEach((row) => {
    Array.from(row.querySelectorAll("button")).forEach((button) => {
      const text = normalizeButtonText(button);

      if (text.includes("结果推荐") || text.includes("本职业随机")) {
        applyButtonState(button, { hidden: true });
        return;
      }

      if (text.includes("高等级随机") || text === "随机") {
        applyButtonState(button, { hidden: false, text: "随机", ariaLabel: "随机" });
      }
    });
  });
}

let simplifyScheduled = false;

function scheduleSimplify(root = document) {
  if (simplifyScheduled) return;
  simplifyScheduled = true;

  requestAnimationFrame(() => {
    simplifyScheduled = false;
    simplifyRandomButtons(root);
  });
}

function nodeMayContainBuilderButtons(node) {
  if (!node || node.nodeType !== 1) return false;
  return Boolean(
    node.matches?.(".builder-button-row, .character-builder-controls, button") ||
    node.querySelector?.(".builder-button-row")
  );
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  scheduleSimplify();

  const observer = new MutationObserver((mutations) => {
    const shouldRun = mutations.some((mutation) =>
      Array.from(mutation.addedNodes || []).some(nodeMayContainBuilderButtons)
    );

    if (shouldRun) scheduleSimplify();
  });

  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
  });
}
