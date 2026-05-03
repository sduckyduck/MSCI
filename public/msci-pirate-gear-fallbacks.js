(() => {
  const RETRY_DELAY_MS = 760;
  const RECHECK_DELAY_MS = 1500;
  const WEAPON_ID_PREFIXES = ["148", "149"];

  const PIRATE_WEAPONS_BY_ROLE = {
    BRAW: [
      { id: 1482000, name: "Steel Knuckler", reqLevel: 10, weaponType: "Knuckle" },
      { id: 1482001, name: "Leather Arms", reqLevel: 15, weaponType: "Knuckle" },
      { id: 1482002, name: "Double Tail Knuckler", reqLevel: 20, weaponType: "Knuckle" },
      { id: 1482003, name: "Norman Grip", reqLevel: 25, weaponType: "Knuckle" },
      { id: 1482004, name: "Prime Hands", reqLevel: 30, weaponType: "Knuckle" },
      { id: 1482005, name: "Silver Maiden", reqLevel: 35, weaponType: "Knuckle" },
      { id: 1482006, name: "Neozard", reqLevel: 40, weaponType: "Knuckle" },
      { id: 1482007, name: "Fury Claw", reqLevel: 50, weaponType: "Knuckle" },
      { id: 1482008, name: "Psycho Claw", reqLevel: 60, weaponType: "Knuckle" },
      { id: 1482009, name: "Beia Crash", reqLevel: 70, weaponType: "Knuckle" },
      { id: 1482010, name: "Steelno", reqLevel: 80, weaponType: "Knuckle" },
      { id: 1482011, name: "White Fangz", reqLevel: 90, weaponType: "Knuckle" },
      { id: 1482012, name: "King Cent", reqLevel: 100, weaponType: "Knuckle" },
      { id: 1482013, name: "Dragon Slash Claw", reqLevel: 110, weaponType: "Knuckle" },
      { id: 1482020, name: "Maple Knuckle", reqLevel: 35, weaponType: "Knuckle" },
      { id: 1482021, name: "Maple Storm Finger", reqLevel: 43, weaponType: "Knuckle" },
      { id: 1482022, name: "Maple Golden Claw", reqLevel: 64, weaponType: "Knuckle" },
      { id: 1482035, name: "Flairgrave (Knuckle)", reqLevel: 115, weaponType: "Knuckle" },
      { id: 1482036, name: "Speargrave (Knuckle)", reqLevel: 115, weaponType: "Knuckle" },
    ],
    GUNS: [
      { id: 1492000, name: "Pistol", reqLevel: 10, weaponType: "Gun" },
      { id: 1492001, name: "Dellinger Special", reqLevel: 15, weaponType: "Gun" },
      { id: 1492002, name: "The Negotiator", reqLevel: 20, weaponType: "Gun" },
      { id: 1492003, name: "Golden Hook", reqLevel: 25, weaponType: "Gun" },
      { id: 1492004, name: "Cold Mind", reqLevel: 30, weaponType: "Gun" },
      { id: 1492005, name: "Shooting Star", reqLevel: 35, weaponType: "Gun" },
      { id: 1492006, name: "Lunar Shooter", reqLevel: 40, weaponType: "Gun" },
      { id: 1492007, name: "Mr. Rasfelt", reqLevel: 50, weaponType: "Gun" },
      { id: 1492008, name: "Burning Hell", reqLevel: 60, weaponType: "Gun" },
      { id: 1492009, name: "Abyss Shooter", reqLevel: 70, weaponType: "Gun" },
      { id: 1492010, name: "Infinity's Wrath", reqLevel: 80, weaponType: "Gun" },
      { id: 1492011, name: "The Peacemaker", reqLevel: 90, weaponType: "Gun" },
      { id: 1492012, name: "Concerto", reqLevel: 100, weaponType: "Gun" },
      { id: 1492013, name: "Dragonfire Revolver", reqLevel: 110, weaponType: "Gun" },
      { id: 1492020, name: "Maple Gun", reqLevel: 35, weaponType: "Gun" },
      { id: 1492021, name: "Maple Storm Pistol", reqLevel: 43, weaponType: "Gun" },
      { id: 1492022, name: "Maple Cannon Shooter", reqLevel: 64, weaponType: "Gun" },
      { id: 1492031, name: "Judgement", reqLevel: 115, weaponType: "Gun" },
    ],
  };

  function currentImg() {
    return document.querySelector("img.msio-character-img");
  }

  function currentRole(img = currentImg()) {
    return img?.closest?.(".character-preview-bg")?.dataset?.role || "";
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

  function idPart(value) {
    return String(value || "").split(":")[0];
  }

  function isPirateWeaponId(value) {
    const id = idPart(value);
    return WEAPON_ID_PREFIXES.some((prefix) => id.startsWith(prefix));
  }

  function randomItem(items) {
    if (!items?.length) return null;
    return items[Math.floor(Math.random() * items.length)];
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

  function replacePirateWeaponInCharacterUrl(src, weapon) {
    const parsed = getCharacterUrlParts(src);
    if (!parsed) return src;
    const { url, parts, itemIndex, actionIndex } = parsed;
    const entries = decodeURIComponent(parts[itemIndex])
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .filter((entry) => !isPirateWeaponId(entry));

    entries.push(String(weapon.id));
    parts[itemIndex] = encodeURIComponent(entries.join(","));
    if (parts[actionIndex]) parts[actionIndex] = "stand1";
    url.pathname = parts.join("/");
    return url.toString();
  }

  function augmentVisiblePool() {
    const globalPool = window.MSCI_RARE_WEAPON_POOL;
    if (!globalPool?.pools) return false;

    Object.entries(PIRATE_WEAPONS_BY_ROLE).forEach(([roleCode, pirateItems]) => {
      const existing = globalPool.pools[roleCode] || [];
      const merged = dedupeById([...existing, ...pirateItems]);
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

    globalPool.pirateWeaponsByRole = PIRATE_WEAPONS_BY_ROLE;
    return true;
  }

  function getPiratePool(roleCode) {
    augmentVisiblePool();
    const globalPool = window.MSCI_RARE_WEAPON_POOL;
    return dedupeById([...(globalPool?.pools?.[roleCode] || []), ...(PIRATE_WEAPONS_BY_ROLE[roleCode] || [])]);
  }

  function applyPirateWeapon(img) {
    if (!img || !img.classList?.contains("msio-character-img")) return;
    const roleCode = String(currentRole(img) || "").toUpperCase();
    if (!PIRATE_WEAPONS_BY_ROLE[roleCode]) return;

    const currentSrc = img.currentSrc || img.src || "";
    if (!currentSrc || img.dataset.msciPirateAppliedSrc === currentSrc) return;

    const pool = getPiratePool(roleCode);
    const weapon = randomItem(pool);
    if (!weapon) return;

    const nextSrc = replacePirateWeaponInCharacterUrl(currentSrc, weapon);
    if (!nextSrc || nextSrc === currentSrc) return;

    img.dataset.msciPirateWeapon = `${weapon.name} (${weapon.id})`;
    img.dataset.msciPirateAppliedSrc = nextSrc;
    img.dataset.msciEqualCheckedSrc = nextSrc;
    img.dataset.msciEqualAppliedSrc = nextSrc;
    img.dataset.msciFallbackAppliedSrc = nextSrc;
    img.src = nextSrc;
  }

  function scan() {
    augmentVisiblePool();
    document.querySelectorAll("img.msio-character-img").forEach((img) => {
      window.setTimeout(() => applyPirateWeapon(img), RETRY_DELAY_MS);
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
          window.setTimeout(() => applyPirateWeapon(mutation.target), RETRY_DELAY_MS);
        }
        mutation.addedNodes?.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches?.("img.msio-character-img")) window.setTimeout(() => applyPirateWeapon(node), RETRY_DELAY_MS);
          node.querySelectorAll?.("img.msio-character-img").forEach((img) => {
            window.setTimeout(() => applyPirateWeapon(img), RETRY_DELAY_MS);
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

    window.MSCI_PIRATE_GEAR_FALLBACKS = {
      weaponsByRole: PIRATE_WEAPONS_BY_ROLE,
      augmentVisiblePool,
      scan,
    };
  }
})();
