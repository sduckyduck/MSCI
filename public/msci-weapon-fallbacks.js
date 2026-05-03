(() => {
  const RETRY_DELAY_MS = 620;
  const RECHECK_DELAY_MS = 1200;
  const WEAPON_ID_PREFIXES = [
    "130", "131", "132", "133", "137", "138", "140", "141", "142", "143", "144", "145", "146", "147", "148", "149",
  ];
  const TWO_HAND_WEAPON_PREFIXES = ["140", "141", "142", "143", "144", "146"];

  const FALLBACK_WEAPONS_BY_ROLE = {
    POLE: [
      // MapleLegends spear / polearm entries missing from the guidebook-derived pool.
      { id: 1432006, name: "Holy Spear", reqLevel: 60, weaponType: "Spear" },
      { id: 1432007, name: "Redemption", reqLevel: 70, weaponType: "Spear" },
      { id: 1432010, name: "Omega Spear", reqLevel: 80, weaponType: "Spear" },
      { id: 1432011, name: "Fairfrozen", reqLevel: 90, weaponType: "Spear" },
      { id: 1432012, name: "Maple Impaler", reqLevel: 43, weaponType: "Spear" },
      { id: 1432030, name: "Pinaka", reqLevel: 100, weaponType: "Spear" },
      { id: 1432038, name: "Dragon Faltizan", reqLevel: 110, weaponType: "Spear" },
      { id: 1432040, name: "Maple Soul Spear", reqLevel: 64, weaponType: "Spear" },
      { id: 1432056, name: "Stormshear", reqLevel: 100, weaponType: "Spear" },
      { id: 1442008, name: "The Gold Dragon", reqLevel: 70, weaponType: "Polearm" },
      { id: 1442010, name: "Skylar", reqLevel: 60, weaponType: "Polearm" },
      { id: 1442020, name: "Hellslayer", reqLevel: 90, weaponType: "Polearm" },
      { id: 1442043, name: "Eclipse", reqLevel: 80, weaponType: "Polearm" },
      { id: 1442044, name: "Zedbug", reqLevel: 100, weaponType: "Polearm" },
      { id: 1442045, name: "Dragon Chelbird", reqLevel: 110, weaponType: "Polearm" },
      { id: 1442051, name: "Maple Karstan", reqLevel: 64, weaponType: "Polearm" },
    ],
  };

  function currentImg() {
    return document.querySelector("img.msio-character-img");
  }

  function currentRole(img = currentImg()) {
    return img?.closest?.(".character-preview-bg")?.dataset?.role || "";
  }

  function idPart(value) {
    return String(value || "").split(":")[0];
  }

  function isWeaponId(value) {
    const id = idPart(value);
    return WEAPON_ID_PREFIXES.some((prefix) => id.startsWith(prefix));
  }

  function dedupeById(items) {
    const seen = new Set();
    const out = [];
    for (const item of items || []) {
      const key = String(item?.id || "");
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(item);
    }
    return out;
  }

  function randomItem(items) {
    if (!items?.length) return null;
    return items[Math.floor(Math.random() * items.length)];
  }

  function actionForWeapon(roleCode, weaponId) {
    if (roleCode === "SNIP") return "stand2";
    if (["KITE", "ZAPZ", "TOXI", "HEAL", "STAR", "STAB", "SHLD", "BRAW", "GUNS"].includes(roleCode)) return "stand1";
    const id = String(weaponId || "");
    return TWO_HAND_WEAPON_PREFIXES.some((prefix) => id.startsWith(prefix)) ? "stand2" : "stand1";
  }

  function getCharacterUrlParts(src) {
    const url = new URL(src);
    const parts = url.pathname.split("/");
    const skinIndex = parts.findIndex((part) => part === "2000");
    const itemIndex = skinIndex + 1;
    const actionIndex = skinIndex + 2;
    if (skinIndex < 0 || !parts[itemIndex]) return null;
    return { url, parts, itemIndex, actionIndex };
  }

  function replaceWeaponInCharacterUrl(src, roleCode, weapon) {
    const parsed = getCharacterUrlParts(src);
    if (!parsed) return src;
    const { url, parts, itemIndex, actionIndex } = parsed;
    const entries = decodeURIComponent(parts[itemIndex])
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .filter((entry) => !isWeaponId(entry));

    entries.push(String(weapon.id));
    parts[itemIndex] = encodeURIComponent(entries.join(","));
    if (parts[actionIndex]) parts[actionIndex] = encodeURIComponent(actionForWeapon(roleCode, weapon.id));
    url.pathname = parts.join("/");
    return url.toString();
  }

  function augmentVisiblePool() {
    const globalPool = window.MSCI_RARE_WEAPON_POOL;
    if (!globalPool?.pools) return false;

    Object.entries(FALLBACK_WEAPONS_BY_ROLE).forEach(([roleCode, fallbackItems]) => {
      const existing = globalPool.pools[roleCode] || [];
      const merged = dedupeById([...existing, ...fallbackItems]);
      globalPool.pools[roleCode] = merged;
      if (globalPool.list) {
        globalPool.list[roleCode] = merged.map((item) => ({
          id: item.id,
          name: item.name,
          level: item.reqLevel,
          type: item.weaponType,
        }));
      }
    });

    globalPool.fallbackWeaponsByRole = FALLBACK_WEAPONS_BY_ROLE;
    return true;
  }

  function getAugmentedWeaponPool(roleCode) {
    augmentVisiblePool();
    const globalPool = window.MSCI_RARE_WEAPON_POOL;
    const base = globalPool?.pools?.[roleCode] || [];
    const fallback = FALLBACK_WEAPONS_BY_ROLE[roleCode] || [];
    return dedupeById([...base, ...fallback]);
  }

  function applyFallbackEqualWeapon(img) {
    if (!img || !img.classList?.contains("msio-character-img")) return;
    const currentSrc = img.currentSrc || img.src || "";
    if (!currentSrc || img.dataset.msciFallbackAppliedSrc === currentSrc) return;

    const roleCode = String(currentRole(img) || "").toUpperCase();
    const pool = getAugmentedWeaponPool(roleCode);
    if (!pool.length) return;

    const weapon = randomItem(pool);
    if (!weapon) return;

    const nextSrc = replaceWeaponInCharacterUrl(currentSrc, roleCode, weapon);
    if (!nextSrc || nextSrc === currentSrc) return;

    img.dataset.msciFallbackWeapon = `${weapon.name} (${weapon.id})`;
    img.dataset.msciFallbackAppliedSrc = nextSrc;
    img.dataset.msciEqualCheckedSrc = nextSrc;
    img.dataset.msciEqualAppliedSrc = nextSrc;
    img.src = nextSrc;
  }

  function scan() {
    augmentVisiblePool();
    document.querySelectorAll("img.msio-character-img").forEach((img) => {
      window.setTimeout(() => applyFallbackEqualWeapon(img), RETRY_DELAY_MS);
    });
  }

  if (typeof document !== "undefined") {
    window.addEventListener("DOMContentLoaded", () => {
      window.setTimeout(scan, RECHECK_DELAY_MS);
      window.setTimeout(scan, RECHECK_DELAY_MS * 2);
    });

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes" && mutation.target?.classList?.contains("msio-character-img")) {
          window.setTimeout(() => applyFallbackEqualWeapon(mutation.target), RETRY_DELAY_MS);
        }
        mutation.addedNodes?.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches?.("img.msio-character-img")) window.setTimeout(() => applyFallbackEqualWeapon(node), RETRY_DELAY_MS);
          node.querySelectorAll?.("img.msio-character-img").forEach((img) => {
            window.setTimeout(() => applyFallbackEqualWeapon(img), RETRY_DELAY_MS);
          });
        });
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["src"],
    });

    window.MSCI_WEAPON_FALLBACKS = {
      weaponsByRole: FALLBACK_WEAPONS_BY_ROLE,
      augmentVisiblePool,
      scan,
    };
  }
})();
