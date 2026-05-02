function simplifyRandomButtons(root = document) {
  root.querySelectorAll?.(".builder-button-row").forEach((row) => {
    const buttons = Array.from(row.querySelectorAll("button"));

    buttons.forEach((button) => {
      const text = (button.textContent || "").replace(/\s+/g, "").trim();

      if (text.includes("结果推荐") || text.includes("本职业随机")) {
        button.hidden = true;
        button.style.display = "none";
        button.dataset.html2canvasIgnore = "true";
        return;
      }

      if (text.includes("高等级随机")) {
        button.hidden = false;
        button.style.display = "";
        button.textContent = "随机";
        button.setAttribute("aria-label", "随机");
      }
    });
  });
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  simplifyRandomButtons();

  const observer = new MutationObserver((mutations) => {
    simplifyRandomButtons();

    for (const mutation of mutations) {
      for (const node of mutation.addedNodes || []) {
        simplifyRandomButtons(node);
      }
    }
  });

  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    characterData: true,
  });
}
