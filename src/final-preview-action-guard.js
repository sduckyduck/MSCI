const FINAL_GUARD_MARKER = "maplestory.io/api/GMS/83/Character/";
const FINAL_MAGE_ROLES = new Set(["ZAPZ", "TOXI", "HEAL"]);
const FINAL_ARCHER_RULES = {
  KITE: { action: "stand1", weaponPrefix: "145", weaponId: "1452000" },
  SNIP: { action: "stand2", weaponPrefix: "146", weaponId: "1462000" },
};

const FINAL_MAGE_WAND_PREFIX = "137";
const FINAL_MAGE_STAFF_PREFIX = "138";
const FINAL_SHIELD_PREFIX = "109";
const FINAL_DEFAULT_MAGE_WAND_ID = "1372000";
const FINAL_DEFAULT_MAGE_SHIELD_ID = "1092000";
const FINAL_ARCHER_WEAPON_PREFIXES = ["145", "146"];

function finalNormalizeUrl(src) {
  return String(src || "").replace(/%2C/gi, ",").replace(/%3A/gi, ":");
}

function finalGetRoleFromUrl(src) {
  try {
    const url = new URL(src, window.location.href);
    return (url.searchParams.get("msciAction") || "").split("-")[0] || "";
  } catch {
    return "";
  }
}

function finalGetRole(img, src) {
  return img?.closest?.(".character-preview-bg")?.getAttribute?.("data-role") || finalGetRoleFromUrl(src) || "";
}

function finalParseCharacterUrl(src) {
  const raw = finalNormalizeUrl(src);
  if (!raw.includes(FINAL_GUARD_MARKER)) return null;

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

function finalGetItemId(entry) {
  return String(entry || "").split(":")[0].trim();
}

function finalHasPrefix(entry, prefix) {
  return finalGetItemId(entry).startsWith(prefix);
}

function finalIsArcherWeapon(entry) {
  const id = finalGetItemId(entry);
  return FINAL_ARCHER_WEAPON_PREFIXES.some((prefix) => id.startsWith(prefix));
}

function finalIsMageWeapon(entry) {
  const id = finalGetItemId(entry);
  return id.startsWith(FINAL_MAGE_WAND_PREFIX) || id.startsWith(FINAL_MAGE_STAFF_PREFIX);
}

function finalIsShield(entry) {
  return finalHasPrefix(entry, FINAL_SHIELD_PREFIX);
}

function finalApplyArcherRule(parsed, roleCode) {
  const rule = FINAL_ARCHER_RULES[roleCode];
  if (!rule) return false;

  let changed = false;
  const rawItems = parsed.parts[parsed.itemIndex]
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const items = rawItems.filter((entry) => {
    if (!finalIsArcherWeapon(entry)) return true;
    return finalHasPrefix(entry, rule.weaponPrefix);
  });

  if (items.length !== rawItems.length) changed = true;

  if (!items.some((entry) => finalHasPrefix(entry, rule.weaponPrefix))) {
    items.push(rule.weaponId);
    changed = true;
  }

  if (parsed.parts[parsed.actionIndex] !== rule.action) {
    parsed.parts[parsed.actionIndex] = rule.action;
    changed = true;
  }

  parsed.parts[parsed.itemIndex] = items.join(",");
  parsed.url.searchParams.set("msciFinalActionGuard", `${roleCode}-${rule.action}`);
  return changed;
}

function finalApplyMageRule(parsed, roleCode) {
  if (!FINAL_MAGE_ROLES.has(roleCode)) return false;

  let changed = false;
  let items = parsed.parts[parsed.itemIndex]
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  let weaponId = finalGetItemId(items.find(finalIsMageWeapon) || "");

  if (!weaponId) {
    items.push(FINAL_DEFAULT_MAGE_WAND_ID);
    weaponId = FINAL_DEFAULT_MAGE_WAND_ID;
    changed = true;
  }

  if (weaponId.startsWith(FINAL_MAGE_WAND_PREFIX)) {
    if (!items.some(finalIsShield)) {
      items.push(FINAL_DEFAULT_MAGE_SHIELD_ID);
      changed = true;
    }
  }

  if (weaponId.startsWith(FINAL_MAGE_STAFF_PREFIX)) {
    const noShield = items.filter((entry) => !finalIsShield(entry));
    if (noShield.length !== items.length) {
      items = noShield;
      changed = true;
    }
  }

  if (parsed.parts[parsed.actionIndex] !== "stand1") {
    parsed.parts[parsed.actionIndex] = "stand1";
    changed = true;
  }

  parsed.parts[parsed.itemIndex] = items.join(",");
  parsed.url.searchParams.set("msciFinalActionGuard", `${roleCode}-stand1`);
  return changed;
}

function finalFixCharacterUrl(src, img = null) {
  const parsed = finalParseCharacterUrl(src);
  if (!parsed) return src;

  const roleCode = finalGetRole(img, src);
  const changed = finalApplyArcherRule(parsed, roleCode) || finalApplyMageRule(parsed, roleCode);
  if (!changed) return src;

  parsed.url.pathname = parsed.parts.join("/");
  return parsed.url.toString().replace(/%2C/gi, ",").replace(/%3A/gi, ":");
}

function finalFixImage(img) {
  if (!img?.src) return;
  const nextSrc = finalFixCharacterUrl(img.src, img);
  if (nextSrc && nextSrc !== img.src) img.src = nextSrc;
}

function finalFixAllImages(root = document) {
  root.querySelectorAll?.("img.msio-character-img").forEach(finalFixImage);
}

function installFinalPreviewSetterGuard() {
  if (window.__msciFinalPreviewActionGuardInstalled) return;

  const descriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, "src");
  if (!descriptor?.set || !descriptor?.get) return;

  window.__msciFinalPreviewActionGuardInstalled = true;

  Object.defineProperty(HTMLImageElement.prototype, "src", {
    configurable: descriptor.configurable,
    enumerable: descriptor.enumerable,
    get() {
      return descriptor.get.call(this);
    },
    set(value) {
      descriptor.set.call(this, finalFixCharacterUrl(value, this));
    },
  });
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  try {
    installFinalPreviewSetterGuard();
  } catch (error) {
    console.warn("MSCI final preview action guard failed:", error);
  }

  finalFixAllImages();

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "attributes" && mutation.attributeName === "src") {
        finalFixImage(mutation.target);
        continue;
      }

      for (const node of mutation.addedNodes || []) {
        if (node?.matches?.("img.msio-character-img")) finalFixImage(node);
        finalFixAllImages(node);
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
