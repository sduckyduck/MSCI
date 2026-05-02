function normalizeLegacyCharacterUrl(src) {
  const text = String(src || "");
  if (!text.includes("maplestory.io/api/GMS/83/Character/")) return text;

  const normalized = text
    .replace(/%2C/gi, ",")
    .replace(/%3A/gi, ":");

  if (normalized === text) return text;

  return normalized;
}

function normalizeMsioImage(img) {
  if (!img?.src) return;

  const nextSrc = normalizeLegacyCharacterUrl(img.src);
  if (nextSrc !== img.src) {
    img.src = nextSrc;
  }
}

function normalizeAllMsioImages(root = document) {
  root.querySelectorAll?.("img.msio-character-img").forEach(normalizeMsioImage);
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  normalizeAllMsioImages();

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "attributes" && mutation.attributeName === "src") {
        normalizeMsioImage(mutation.target);
        continue;
      }

      for (const node of mutation.addedNodes || []) {
        if (node?.matches?.("img.msio-character-img")) {
          normalizeMsioImage(node);
        }
        normalizeAllMsioImages(node);
      }
    }
  });

  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["src"],
  });
}
