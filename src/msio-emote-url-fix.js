const LEGACY_CHARACTER_MARKER = "maplestory.io/api/GMS/83/Character/";

const ROLE_ACTIONS = {
  KITE: "shoot1",
  SNIP: "shoot2",
};

function getRoleCodeForImage(img) {
  return img?.closest?.(".character-preview-bg")?.getAttribute?.("data-role") || "";
}

function getActionForImage(img) {
  return ROLE_ACTIONS[getRoleCodeForImage(img)] || "stand1";
}

function getFaceEmoteFromUrl(url) {
  const queryValue = url.searchParams.get("faceEmote");
  if (queryValue && queryValue !== "0") return queryValue;

  const decodedPath = decodeURIComponent(url.pathname);
  const faceEntry = decodedPath.match(/(?:^|,)(\d{5,8}):([^,/]+)(?:,|\/)/);
  if (faceEntry?.[2]) return faceEntry[2];

  return "default";
}

function normalizeLegacyCharacterUrl(src, img) {
  const text = String(src || "");
  if (!text.includes(LEGACY_CHARACTER_MARKER)) return text;

  let url;
  try {
    url = new URL(text, window.location.href);
  } catch {
    return text
      .replace(/%2C/gi, ",")
      .replace(/%3A/gi, ":");
  }

  const faceEmote = getFaceEmoteFromUrl(url);
  const action = getActionForImage(img);

  const decodedPath = decodeURIComponent(url.pathname);
  const parts = decodedPath.split("/");

  // Expected legacy path:
  // /api/GMS/83/Character/{skin}/{hair,face:emote,equipment}/{action}/{emotionFrame}
  const characterIndex = parts.findIndex((part) => part === "Character");
  if (characterIndex >= 0) {
    const actionIndex = characterIndex + 3;
    const emoteIndex = characterIndex + 4;

    if (parts[actionIndex]) parts[actionIndex] = action;
    if (parts[emoteIndex]) parts[emoteIndex] = faceEmote;
  }

  url.pathname = parts.join("/");
  url.searchParams.set("faceEmote", faceEmote);
  url.searchParams.set("msciRender", `${getRoleCodeForImage(img) || "MSCI"}-${action}-${faceEmote}`);

  return url.toString()
    .replace(/%2C/gi, ",")
    .replace(/%3A/gi, ":");
}

function normalizeMsioImage(img) {
  if (!img?.src) return;

  const nextSrc = normalizeLegacyCharacterUrl(img.src, img);
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
