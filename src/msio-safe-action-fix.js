const LEGACY_CHARACTER_MARKER = "maplestory.io/api/GMS/83/Character/";

const ROLE_ACTIONS = {
  KITE: "shoot1",
  SNIP: "shoot2",
};

function getRoleCodeForImage(img) {
  return img?.closest?.(".character-preview-bg")?.getAttribute?.("data-role") || "";
}

function getSafeActionForImage(img) {
  return ROLE_ACTIONS[getRoleCodeForImage(img)] || "stand1";
}

function normalizeLegacySeparators(src) {
  return String(src || "")
    .replace(/%2C/gi, ",")
    .replace(/%3A/gi, ":");
}

function applySafeAction(src, img) {
  const raw = normalizeLegacySeparators(src);
  if (!raw.includes(LEGACY_CHARACTER_MARKER)) return src;

  let url;
  try {
    url = new URL(raw, window.location.href);
  } catch {
    return raw;
  }

  const action = getSafeActionForImage(img);
  const parts = decodeURIComponent(url.pathname).split("/");
  const characterIndex = parts.findIndex((part) => part === "Character");

  if (characterIndex >= 0) {
    const actionIndex = characterIndex + 3;
    const finalFrameIndex = characterIndex + 4;

    if (parts[actionIndex]) parts[actionIndex] = action;
    // Keep the final frame segment stable. Setting this to blink/smile/etc.
    // caused MapleStory.IO to return a blank image in mobile Safari.
    if (parts[finalFrameIndex]) parts[finalFrameIndex] = "0";
  }

  url.pathname = parts.join("/");
  url.searchParams.set("msciAction", `${getRoleCodeForImage(img) || "MSCI"}-${action}`);

  return url.toString()
    .replace(/%2C/gi, ",")
    .replace(/%3A/gi, ":");
}

function fixImage(img) {
  if (!img?.src) return;
  const nextSrc = applySafeAction(img.src, img);
  if (nextSrc !== img.src) img.src = nextSrc;
}

function fixAllImages(root = document) {
  root.querySelectorAll?.("img.msio-character-img").forEach(fixImage);
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  fixAllImages();

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "attributes" && mutation.attributeName === "src") {
        fixImage(mutation.target);
        continue;
      }

      for (const node of mutation.addedNodes || []) {
        if (node?.matches?.("img.msio-character-img")) fixImage(node);
        fixAllImages(node);
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
