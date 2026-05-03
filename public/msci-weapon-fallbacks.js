(() => {
  const RETRY_DELAY_MS = 620;
  const RECHECK_DELAY_MS = 1200;
  const WEAPON_ID_PREFIXES = [
    "130", "131", "132", "133", "137", "138", "140", "141", "142", "143", "144", "145", "146", "147", "148", "149",
  ];
  const TWO_HAND_WEAPON_PREFIXES = ["140", "141", "142", "143", "144", "146"];

  const MAGE_WEAPONS = [
    { id: 1372034, name: "Maple Shine Wand", reqLevel: 64, weaponType: "Wand" },
    { id: 1372035, name: "Elemental Wand 1", reqLevel: 70, weaponType: "Wand" },
    { id: 1372036, name: "Elemental Wand 2", reqLevel: 70, weaponType: "Wand" },
    { id: 1372037, name: "Elemental Wand 3", reqLevel: 70, weaponType: "Wand" },
    { id: 1372038, name: "Elemental Wand 4", reqLevel: 70, weaponType: "Wand" },
    { id: 1372010, name: "Dimon Wand", reqLevel: 98, weaponType: "Wand" },
    { id: 1382007, name: "Evil Wings", reqLevel: 65, weaponType: "Staff" },
    { id: 1382037, name: "Doomsday Staff", reqLevel: 102, weaponType: "Staff" },
    { id: 1382039, name: "Maple Wisdom Staff", reqLevel: 64, weaponType: "Staff" },
    { id: 1382045, name: "Elemental Staff 1", reqLevel: 103, weaponType: "Staff" },
    { id: 1382046, name: "Elemental Staff 2", reqLevel: 103, weaponType: "Staff" },
    { id: 1382047, name: "Elemental Staff 3", reqLevel: 103, weaponType: "Staff" },
    { id: 1382048, name: "Elemental Staff 4", reqLevel: 103, weaponType: "Staff" },
  ];

  const FALLBACK_WEAPONS_BY_ROLE = {
    SLAY: [
      { id: 1402004, name: "Blue Screamer", reqLevel: 80, weaponType: "Two-Handed Sword" },
      { id: 1402012, name: "Doombringer", reqLevel: 70, weaponType: "Two-Handed Sword" },
      { id: 1402035, name: "The Beheader", reqLevel: 100, weaponType: "Two-Handed Sword" },
      { id: 1402036, name: "Dragon Claymore", reqLevel: 110, weaponType: "Two-Handed Sword" },
      { id: 1402037, name: "Stonetooth Sword", reqLevel: 100, weaponType: "Two-Handed Sword" },
      { id: 1402039, name: "Maple Soul Rohen", reqLevel: 64, weaponType: "Two-Handed Sword" },
      { id: 1402055, name: "Flairgrave (Two-Handed Sword)", reqLevel: 115, weaponType: "Two-Handed Sword" },
    ],
    SHLD: [
      { id: 1302056, name: "Sparta", reqLevel: 100, weaponType: "One-Handed Sword" },
      { id: 1302059, name: "Dragon Carabella", reqLevel: 110, weaponType: "One-Handed Sword" },
      { id: 1322052, name: "Dragon Mace", reqLevel: 110, weaponType: "One-Handed Mace" },
      { id: 1322051, name: "Maple Havoc Hammer", reqLevel: 64, weaponType: "One-Handed Mace" },
    ],
    POLE: [
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
    ZAPZ: MAGE_WEAPONS,
    TOXI: MAGE_WEAPONS,
    HEAL: MAGE_WEAPONS,
    STAR: [
      { id: 1472030, name: "Maple Claw", reqLevel: 35, weaponType: "Claw" },
      { id: 1472032, name: "Maple Kandayo", reqLevel: 43, weaponType: "Claw" },
      { id: 1472031, name: "Black Mamba", reqLevel: 80, weaponType: "Claw" },
      { id: 1472033, name: "Casters", reqLevel: 90, weaponType: "Claw" },
      { id: 1472053, name: "Red Craven", reqLevel: 100, weaponType: "Claw" },
      { id: 1472051, name: "Dragon Green Sleve", reqLevel: 110, weaponType: "Claw" },
      { id: 1472055, name: "Maple Skanda", reqLevel: 64, weaponType: "Claw" },
    ],
    STAB: [
      { id: 1332018, name: "Kandine", reqLevel: 70, weaponType: "Dagger" },
      { id: 1332023, name: "Dragon's Tail", reqLevel: 80, weaponType: "Dagger" },
      { id: 1332026, name: "Cursayer", reqLevel: 90, weaponType: "Dagger" },
      { id: 1332027, name: "Varkit", reqLevel: 90, weaponType: "Dagger" },
      { id: 1332049, name: "Dragon Kanzir", reqLevel: 110, weaponType: "Dagger" },
      { id: 1332051, name: "Gold Double Knife", reqLevel: 100, weaponType: "Dagger" },
      { id: 1332052, name: "Blood Dagger", reqLevel: 100, weaponType: "Dagger" },
      { id: 1332025, name: "Maple Wagner", reqLevel: 43, weaponType: "Dagger" },
    ],
    KITE: [
      { id: 1452009, name: "Red Hinkel", reqLevel: 70, weaponType: "Bow" },
      { id: 1452015, name: "Dark Arund", reqLevel: 80, weaponType: "Bow" },
      { id: 1452017, name: "Metus", reqLevel: 90, weaponType: "Bow" },
      { id: 1452019, name: "White Nisrock", reqLevel: 100, weaponType: "Bow" },
      { id: 1452021, name: "Dark Nisrock", reqLevel: 100, weaponType: "Bow" },
      { id: 1452044, name: "Dragon Shiner Bow", reqLevel: 110, weaponType: "Bow" },
      { id: 1452045, name: "Maple Kandiva Bow", reqLevel: 64, weaponType: "Bow" },
      { id: 1452064, name: "Flairgrave (Bow)", reqLevel: 115, weaponType: "Bow" },
    ],
    SNIP: [
      { id: 1462018, name: "Casa Crow", reqLevel: 90, weaponType: "Crossbow" },
      { id: 1462021, name: "Dark Crow", reqLevel: 90, weaponType: "Crossbow" },
      { id: 1462022, name: "Yellow Crow", reqLevel: 90, weaponType: "Crossbow" },
      { id: 1462017, name: "Dark Neschere", reqLevel: 100, weaponType: "Crossbow" },
      { id: 1462039, name: "Dragon Shiner Cross", reqLevel: 110, weaponType: "Crossbow" },
      { id: 1462040, name: "Maple Nishada", reqLevel: 64, weaponType: "Crossbow" },
    ],
    BRAW: [
      { id: 1482007, name: "Fury Claw", reqLevel: 50, weaponType: "Knuckle" },
      { id: 1482009, name: "Beia Crash", reqLevel: 70, weaponType: "Knuckle" },
      { id: 1482010, name: "Steelno", reqLevel: 80, weaponType: "Knuckle" },
      { id: 1482012, name: "King Cent", reqLevel: 100, weaponType: "Knuckle" },
      { id: 1482013, name: "Dragon Slash Claw", reqLevel: 110, weaponType: "Knuckle" },
      { id: 1482021, name: "Maple Storm Finger", reqLevel: 43, weaponType: "Knuckle" },
      { id: 1482022, name: "Maple Golden Claw", reqLevel: 64, weaponType: "Knuckle" },
      { id: 1482035, name: "Flairgrave (Knuckle)", reqLevel: 115, weaponType: "Knuckle" },
      { id: 1482036, name: "Speargrave (Knuckle)", reqLevel: 115, weaponType: "Knuckle" },
    ],
    GUNS: [
      { id: 1492007, name: "Mr. Rasfelt", reqLevel: 50, weaponType: "Gun" },
      { id: 1492008, name: "Burning Hell", reqLevel: 60, weaponType: "Gun" },
      { id: 1492009, name: "Abyss Shooter", reqLevel: 70, weaponType: "Gun" },
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
