const MAGE_CHARACTER_MARKER = "maplestory.io/api/GMS/83/Character/";
const MAGE_ROLE_CODES = new Set(["ZAPZ", "TOXI", "HEAL"]);
const MAGE_WAND_PREFIX = "137";
const MAGE_STAFF_PREFIX = "138";
const SHIELD_PREFIX = "109";
const DEFAULT_MAGE_WAND_ID = "1372000";
const DEFAULT_MAGE_SHIELD_ID = "1092000";

function normalizeMageUrlSeparators(src) {
  return String(src || "").replace(/%2C/gi, ",").replace(/%3A/gi, ":");
}

function getMageRoleFromUrl(src) {
  try {
    const url = new URL(src, window.location.href);
    return (url.searchParams.get("msciAction") || "").split("-")[0] || "";
  } catch {
    return "";
  }
}

function getMageRoleForImage(img, src) {
  return img?.closest?.(".character-preview-bg")?.getAttribute?.("data-role") || getMageRoleFromUrl(src) || "";
}

function parseMageCharacterUrl(src) {
  const raw = normalizeMageUrlSeparators(src);
  if (!raw.includes(MAGE_CHARACTER_MARKER)) return null;

  let url;
  try {
    url = new URL(raw, window.location.href);
  } catch {
    return null;
  }

  const parts = decodeURIComponent(url.pathname).split("/");
  const characterIndex = parts.findIndex((part) => part === "Character");
  if (characterIndex < 0) return null;

  return {
    url,
    parts,
    itemIndex: characterIndex + 2,
    actionIndex: characterIndex + 3,
  };
}

function getMageItemId(entry) {
  return String(entry || "").split(":")[0].trim();
}

function isMageWandId(id) {
  return String(id || "").startsWith(MAGE_WAND_PREFIX);
}

function isMageStaffId(id) {
  return String(id || "").startsWith(MAGE_STAFF_PREFIX);
}

function isMageWeaponEntry(entry) {
  const id = getMageItemId(entry);
  return isMageWandId(id) || isMageStaffId(id);
}

function isShieldEntry(entry) {
  return getMageItemId(entry).startsWith(SHIELD_PREFIX);
}

function hasShield(items) {
  return items.some(isShieldEntry);
}

function getMageWeaponId(items) {
  return getMageItemId(items.find(isMageWeaponEntry) || "");
}

function fixMageCharacterUrl(src, img = null) {
  const parsed = parseMageCharacterUrl(src);
  if (!parsed) return src;

  const roleCode = getMageRoleForImage(img, src);
  if (!MAGE_ROLE_CODES.has(roleCode)) return src;

  const originalItems = parsed.parts[parsed.itemIndex]
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  let changed = false;
  let items = [...originalItems];
  let weaponId = getMageWeaponId(items);

  if (!weaponId) {
    items.push(DEFAULT_MAGE_WAND_ID);
    weaponId = DEFAULT_MAGE_WAND_ID;
    changed = true;
  }

  if (isMageWandId(weaponId)) {
    if (!hasShield(items)) {
      items.push(DEFAULT_MAGE_SHIELD_ID);
      changed = true;
    }
  }

  if (isMageStaffId(weaponId)) {
    const noShieldItems = items.filter((entry) => !isShieldEntry(entry));
    if (noShieldItems.length !== items.length) {
      items = noShieldItems;
      changed = true;
    }
  }

  if (parsed.parts[parsed.actionIndex] !== "stand1") {
    parsed.parts[parsed.actionIndex] = "stand1";
    changed = true;
  }

  if (!changed) return src;

  parsed.parts[parsed.itemIndex] = items.join(",");
  parsed.url.pathname = parsed.parts.join("/");
  parsed.url.searchParams.set(
    "msciMageWeaponShieldFix",
    `${roleCode}-${isMageStaffId(weaponId) ? "staff-stand1" : "wand-shield"}`
  );

  return parsed.url.toString().replace(/%2C/gi, ",").replace(/%3A/gi, ":");
}

function fixMageImage(img) {
  if (!img?.src) return;
  const nextSrc = fixMageCharacterUrl(img.src, img);
  if (nextSrc && nextSrc !== img.src) img.src = nextSrc;
}

function fixAllMageImages(root = document) {
  root.querySelectorAll?.("img.msio-character-img").forEach(fixMageImage);
}

function installMageSrcSetterGuard() {
  if (window.__msciMageWeaponShieldFixInstalled) return;

  const descriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, "src");
  if (!descriptor?.set || !descriptor?.get) return;

  window.__msciMageWeaponShieldFixInstalled = true;

  Object.defineProperty(HTMLImageElement.prototype, "src", {
    configurable: descriptor.configurable,
    enumerable: descriptor.enumerable,
    get() {
      return descriptor.get.call(this);
    },
    set(value) {
      descriptor.set.call(this, fixMageCharacterUrl(value, this));
    },
  });
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  try {
    installMageSrcSetterGuard();
  } catch (error) {
    console.warn("MSCI mage preview setter guard failed:", error);
  }

  fixAllMageImages();

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "attributes" && mutation.attributeName === "src") {
        fixMageImage(mutation.target);
        continue;
      }

      for (const node of mutation.addedNodes || []) {
        if (node?.matches?.("img.msio-character-img")) fixMageImage(node);
        fixAllMageImages(node);
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
