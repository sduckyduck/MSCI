const LEGACY_CHARACTER_MARKER = "maplestory.io/api/GMS/83/Character/";

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
const TWO_HANDED_WEAPON_PREFIXES = ["138", "140", "141", "142", "143", "144", "145", "146"];

function getRoleCodeFromSrc(src) {
  try {
    const url = new URL(src, window.location.href);
    return (url.searchParams.get("msciAction") || "").split("-")[0] || "";
  } catch {
    return "";
  }
}

function getRoleCodeForImage(img) {
  return img?.closest?.(".character-preview-bg")?.getAttribute?.("data-role") || getRoleCodeFromSrc(img?.src) || "";
}

function normalizeLegacySeparators(src) {
  return String(src || "").replace(/%2C/gi, ",").replace(/%3A/gi, ":");
}

function getItemId(entry) {
  return String(entry || "").split(":")[0].trim();
}

function getItemSuffix(entry) {
  const parts = String(entry || "").split(":");
  return parts.length > 1 ? parts.slice(1).join(":").trim() : "";
}

function isFaceItem(entry) {
  const id = Number(getItemId(entry));
  return Number.isFinite(id) && id >= 20000 && id < 30000;
}

function cleanFaceEntries(items) {
  return items.map((entry) => (isFaceItem(entry) ? getItemId(entry) : entry));
}

function normalizeExpression(value) {
  const key = String(value || "default").trim().toLowerCase();
  if (!key || key === "0" || key === "normal" || key === "e00" || key === "default") return "default";
  if (key === "e01") return "wink";
  if (key === "e02" || key === "e10" || key === "smile") return "oops";
  if (key === "e03") return "cry";
  if (key === "e04") return "angry";
  if (key === "e05") return "bewildered";
  if (key === "e06") return "blink";
  if (key === "e08") return "bowing";
  if (key === "e09") return "cheers";
  return key;
}

function getExpression(url, items) {
  const fromQuery = url.searchParams.get("emotion") || url.searchParams.get("faceEmote") || "";
  const faceEntry = items.find(isFaceItem);
  return normalizeExpression(fromQuery || getItemSuffix(faceEntry) || "default");
}

function hasItemPrefix(items, prefixes) {
  return items.some((entry) => prefixes.some((prefix) => getItemId(entry).startsWith(prefix)));
}

function hasExactItem(items, itemId) {
  return items.some((entry) => getItemId(entry) === String(itemId));
}

function getWeaponId(items) {
  return items.map(getItemId).find((id) => WEAPON_PREFIXES.some((prefix) => id.startsWith(prefix))) || "";
}

function getStandingAction(items) {
  const weaponId = getWeaponId(items);
  return TWO_HANDED_WEAPON_PREFIXES.some((prefix) => weaponId.startsWith(prefix)) ? "stand2" : "stand1";
}

function getLoadoutItems(parts, characterIndex, roleCode) {
  const itemIndex = characterIndex + 2;
  if (!parts[itemIndex]) return [];

  const items = parts[itemIndex].split(",").map((item) => item.trim()).filter(Boolean);

  const defaultBody = ROLE_DEFAULT_BODY_ITEMS[roleCode];
  if (defaultBody && !hasItemPrefix(items, BODY_PREFIXES) && !hasExactItem(items, defaultBody)) items.push(defaultBody);

  const defaultWeapon = ROLE_DEFAULT_WEAPON_ITEMS[roleCode];
  if (defaultWeapon && !hasItemPrefix(items, WEAPON_PREFIXES) && !hasExactItem(items, defaultWeapon)) items.push(defaultWeapon);

  return items;
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
  const parts = decodeURIComponent(url.pathname).split("/");
  const characterIndex = parts.findIndex((part) => part === "Character");
  let action = "stand1";
  let expression = normalizeExpression(url.searchParams.get("emotion") || url.searchParams.get("faceEmote"));

  if (characterIndex >= 0) {
    const itemIndex = characterIndex + 2;
    const actionIndex = characterIndex + 3;
    const expressionIndex = characterIndex + 4;
    const items = getLoadoutItems(parts, characterIndex, roleCode);
    expression = getExpression(url, items);

    const cleanItems = cleanFaceEntries(items);
    parts[itemIndex] = cleanItems.join(",");

    action = getStandingAction(cleanItems);
    if (parts[actionIndex]) parts[actionIndex] = action;
    if (parts[expressionIndex]) parts[expressionIndex] = expression;
  }

  url.pathname = parts.join("/");
  url.searchParams.set("faceEmote", expression);
  url.searchParams.set("emotion", expression);
  url.searchParams.set("msciAction", `${roleCode || "MSCI"}-${action}-${expression}`);

  return url.toString().replace(/%2C/gi, ",").replace(/%3A/gi, ":");
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
