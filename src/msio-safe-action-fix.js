const LEGACY_CHARACTER_MARKER = "maplestory.io/api/GMS/83/Character/";

const ROLE_ACTIONS = {
  SLAY: "swingT1",
  SHLD: "swingO1",
  POLE: "swingP1",
  ZAPZ: "swingO1",
  TOXI: "swingO1",
  HEAL: "swingO1",
  STAR: "shoot1",
  STAB: "stabO1",
  KITE: "shoot1",
  SNIP: "shoot2",
};

const ROLE_DEFAULT_BODY_ITEMS = {
  ZAPZ: "1050003",
  TOXI: "1050003",
  HEAL: "1050003",
};

const ROLE_DEFAULT_WEAPON_ITEMS = {
  SLAY: "1402000",
  SHLD: "1302000",
  POLE: "1432000",
  ZAPZ: "1372000",
  TOXI: "1372000",
  HEAL: "1372000",
  STAR: "1472000",
  STAB: "1332000",
  KITE: "1452000",
  SNIP: "1462000",
};

const BODY_PREFIXES = ["104", "105", "106"];
const WEAPON_PREFIXES = ["130", "131", "132", "133", "137", "138", "140", "141", "142", "143", "144", "145", "146", "147"];

function getRoleCodeFromSrc(src) {
  try {
    const url = new URL(src, window.location.href);
    const marker = url.searchParams.get("msciAction") || "";
    return marker.split("-")[0] || "";
  } catch {
    return "";
  }
}

function getRoleCodeForImage(img) {
  return img?.closest?.(".character-preview-bg")?.getAttribute?.("data-role") || getRoleCodeFromSrc(img?.src) || "";
}

function getSafeActionForImage(img) {
  return ROLE_ACTIONS[getRoleCodeForImage(img)] || "stand1";
}

function normalizeLegacySeparators(src) {
  return String(src || "")
    .replace(/%2C/gi, ",")
    .replace(/%3A/gi, ":");
}

function getItemId(entry) {
  return String(entry || "").split(":")[0].trim();
}

function hasItemPrefix(items, prefixes) {
  return items.some((entry) => prefixes.some((prefix) => getItemId(entry).startsWith(prefix)));
}

function hasExactItem(items, itemId) {
  return items.some((entry) => getItemId(entry) === String(itemId));
}

function addMissingLoadoutItems(parts, characterIndex, roleCode) {
  const itemIndex = characterIndex + 2;
  if (!parts[itemIndex]) return;

  const items = parts[itemIndex]
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const defaultBody = ROLE_DEFAULT_BODY_ITEMS[roleCode];
  if (defaultBody && !hasItemPrefix(items, BODY_PREFIXES) && !hasExactItem(items, defaultBody)) {
    items.push(defaultBody);
  }

  const defaultWeapon = ROLE_DEFAULT_WEAPON_ITEMS[roleCode];
  if (defaultWeapon && !hasItemPrefix(items, WEAPON_PREFIXES) && !hasExactItem(items, defaultWeapon)) {
    items.push(defaultWeapon);
  }

  parts[itemIndex] = items.join(",");
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

  const roleCode = getRoleCodeForImage(img);
  const action = getSafeActionForImage(img);
  const parts = decodeURIComponent(url.pathname).split("/");
  const characterIndex = parts.findIndex((part) => part === "Character");

  if (characterIndex >= 0) {
    const actionIndex = characterIndex + 3;
    const finalFrameIndex = characterIndex + 4;

    addMissingLoadoutItems(parts, characterIndex, roleCode);

    if (parts[actionIndex]) parts[actionIndex] = action;
    // Keep the final frame segment stable. Setting this to blink/smile/etc.
    // caused MapleStory.IO to return a blank image in mobile Safari.
    if (parts[finalFrameIndex]) parts[finalFrameIndex] = "0";
  }

  url.pathname = parts.join("/");
  url.searchParams.set("msciAction", `${roleCode || "MSCI"}-${action}`);

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
