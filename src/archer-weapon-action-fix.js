const ARCHER_ROLE_WEAPON_RULES = {
  KITE: {
    action: "stand2",
    weaponId: "1452000",
    allowedWeaponPrefixes: ["145"],
  },
  SNIP: {
    action: "stand2",
    weaponId: "1462000",
    allowedWeaponPrefixes: ["146"],
  },
};

const ARCHER_WEAPON_PREFIXES = ["145", "146"];
const ARCHER_LEGACY_CHARACTER_MARKER = "maplestory.io/api/GMS/83/Character/";

function getArcherRoleFromImage(img) {
  return img?.closest?.(".character-preview-bg")?.getAttribute?.("data-role") || "";
}

function parseArcherCharacterUrl(src) {
  const raw = String(src || "").replace(/%2C/gi, ",").replace(/%3A/gi, ":");
  if (!raw.includes(ARCHER_LEGACY_CHARACTER_MARKER)) return null;

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

function getArcherItemId(entry) {
  return String(entry || "").split(":")[0].trim();
}

function isArcherWeaponId(id) {
  return ARCHER_WEAPON_PREFIXES.some((prefix) => String(id).startsWith(prefix));
}

function isAllowedArcherWeaponId(id, rule) {
  return rule.allowedWeaponPrefixes.some((prefix) => String(id).startsWith(prefix));
}

function fixArcherWeaponUrl(src, roleCode) {
  const rule = ARCHER_ROLE_WEAPON_RULES[roleCode];
  const parsed = parseArcherCharacterUrl(src);
  if (!rule || !parsed) return src;

  const items = parsed.parts[parsed.itemIndex]
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const filteredItems = items.filter((entry) => {
    const id = getArcherItemId(entry);
    return !isArcherWeaponId(id) || isAllowedArcherWeaponId(id, rule);
  });

  const hasCorrectWeapon = filteredItems.some((entry) => isAllowedArcherWeaponId(getArcherItemId(entry), rule));
  if (!hasCorrectWeapon) filteredItems.push(rule.weaponId);

  parsed.parts[parsed.itemIndex] = filteredItems.join(",");
  parsed.parts[parsed.actionIndex] = rule.action;
  parsed.url.pathname = parsed.parts.join("/");
  parsed.url.searchParams.set("msciArcherWeaponFix", `${roleCode}-${rule.action}`);

  return parsed.url.toString().replace(/%2C/gi, ",").replace(/%3A/gi, ":");
}

function fixArcherImage(img) {
  if (!img?.src) return;

  const roleCode = getArcherRoleFromImage(img);
  if (!ARCHER_ROLE_WEAPON_RULES[roleCode]) return;

  const nextSrc = fixArcherWeaponUrl(img.src, roleCode);
  if (nextSrc && nextSrc !== img.src) img.src = nextSrc;
}

function fixAllArcherImages(root = document) {
  root.querySelectorAll?.("img.msio-character-img").forEach(fixArcherImage);
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  fixAllArcherImages();

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "attributes" && mutation.attributeName === "src") {
        fixArcherImage(mutation.target);
        continue;
      }

      for (const node of mutation.addedNodes || []) {
        if (node?.matches?.("img.msio-character-img")) fixArcherImage(node);
        fixAllArcherImages(node);
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
