(() => {
  const DATA_CACHE_BUSTER = "rare-equipment-pool-20260503-zakum";
  const GUIDEBOOK_DATA_BASE = "https://raw.githubusercontent.com/sduckyduck/osms-classic-guidebook/main/public/data";
  const GUIDEBOOK_ITEMS_URL = `${GUIDEBOOK_DATA_BASE}/items.json?v=${DATA_CACHE_BUSTER}`;
  const GUIDEBOOK_MSIO_MAP_URL = `${GUIDEBOOK_DATA_BASE}/character_item_id_map.csv?v=${DATA_CACHE_BUSTER}`;
  const RARE_WEAPON_ROLL = 0.08;
  const LEGENDARY_HAT_ROLL = 0.01;
  const RETRY_DELAY_MS = 220;
  const RECHECK_DELAY_MS = 900;

  const TWO_HAND_WEAPON_PREFIXES = ["140", "141", "142", "143", "144", "146"];
  const HAT_ID_PREFIXES = ["100"];
  const WEAPON_ID_PREFIXES = [
    "130", "131", "132", "133", "137", "138", "140", "141", "142", "143", "144", "145", "146", "147", "148", "149",
  ];

  const ROLE_RULES = {
    SLAY: { label: "剑客", weaponKinds: ["2h-sword"] },
    SHLD: { label: "准骑士", weaponKinds: ["1h-sword", "1h-axe", "1h-blunt"] },
    POLE: { label: "枪战士", weaponKinds: ["spear", "pole-arm"] },
    ZAPZ: { label: "冰雷法师", weaponKinds: ["wand", "staff"] },
    TOXI: { label: "火毒法师", weaponKinds: ["wand", "staff"] },
    HEAL: { label: "牧师", weaponKinds: ["wand", "staff"] },
    STAR: { label: "刺客", weaponKinds: ["claw"] },
    STAB: { label: "侠客", weaponKinds: ["dagger"] },
    KITE: { label: "猎人", weaponKinds: ["bow"] },
    SNIP: { label: "弩弓手", weaponKinds: ["crossbow"] },
    BRAW: { label: "拳手", weaponKinds: ["knuckle"] },
    GUNS: { label: "火枪手", weaponKinds: ["gun", "pistol"] },
  };

  // Hand-picked name hints are intentionally broad because OSMS / MapleStory.io names can differ by source.
  // The fallback level rule below still catches regular 70-100 weapons even when a name is not listed here.
  const RARE_NAME_HINTS = [
    // Warrior / spearman highlights
    "odin spear", "fairfrozen", "sky ski", "dragon faltizan", "omega spear", "pinaka",
    "gold dragon", "hellslayer", "purple surfboard", "maple impaler", "maple scorpio",
    "stonetooth sword", "dragon claymore", "solomon", "eternal solomon", "sparta", "maple soul rohen", "maple glory sword",

    // Magician highlights
    "evil wings", "necromancer", "doomsday staff", "elemental staff", "elemental wand",
    "maple lama staff", "maple shine wand", "maple staff", "maple wand", "maple umbrella", "umbrella",

    // Thief highlights
    "red craven", "dragon green sleeve", "maple kandayo", "maple skanda", "casters", "dragon kanzir", "gold double knife",
    "maple wagner", "maple dagger", "maple claw",

    // Archer highlights
    "dark nisrock", "dragon shiner bow", "metus", "maple kandiva bow", "maple bow",
    "dark neschere", "dragon shiner cross", "maple nishada", "maple crossbow",

    // Pirate highlights
    "king cent", "dragon slash claw", "maple knuckle", "maple golden claw",
    "concerto", "dragon revolver", "maple gun", "maple storm pistol", "pistol",
  ].map(normalizeName);

  // 扎昆头盔 / Zakum Helmet: all classes can roll it, but at the lowest visible rate.
  const LEGENDARY_HAT_NAME_HINTS = ["zakum helmet", "zakum helm", "zakum", "扎昆", "砝坤"].map(normalizeName);
  const FALLBACK_LEGENDARY_HATS = [
    { id: 1002357, guidebookId: 1002357, name: "Zakum Helmet", normalizedName: "zakum helmet", slot: "Hat", reqLevel: 50, weaponType: "" },
  ];

  let rareDataPromise = null;
  let rarePools = null;

  function toNumber(value, fallback = null) {
    if (value === undefined || value === null || value === "") return fallback;
    const n = Number(String(value).replace(/[,+]/g, "").trim());
    return Number.isFinite(n) ? n : fallback;
  }

  function normalizeName(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9\u4e00-\u9fff]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function parseCsv(text) {
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      const next = text[i + 1];
      if (char === '"' && inQuotes && next === '"') {
        field += '"';
        i += 1;
        continue;
      }
      if (char === '"') {
        inQuotes = !inQuotes;
        continue;
      }
      if (char === "," && !inQuotes) {
        row.push(field);
        field = "";
        continue;
      }
      if ((char === "\n" || char === "\r") && !inQuotes) {
        if (char === "\r" && next === "\n") i += 1;
        row.push(field);
        field = "";
        if (row.some((cell) => String(cell).trim() !== "")) rows.push(row);
        row = [];
        continue;
      }
      field += char;
    }

    row.push(field);
    if (row.some((cell) => String(cell).trim() !== "")) rows.push(row);
    if (!rows.length) return [];

    const headers = rows[0].map((header) => String(header || "").replace(/^\uFEFF/, "").trim());
    return rows.slice(1).map((cells) => {
      const out = {};
      headers.forEach((header, index) => {
        out[header] = cells[index] ?? "";
      });
      return out;
    });
  }

  function buildMsioMap(rows) {
    const bySourceId = new Map();
    const bySourceName = new Map();

    for (const row of rows || []) {
      const sourceId = toNumber(row.osms_item_id ?? row.source_item_id ?? row.item_id ?? row.id, null);
      const msioId = toNumber(row.msio_item_id ?? row.mapped_item_id ?? row.target_item_id ?? row.msio_id, null);
      if (!msioId || msioId <= 0) continue;
      if (sourceId) bySourceId.set(String(sourceId), msioId);

      const note = String(row.note || row.match_note || "");
      const sourceNameFromNote = note.match(/^\s*([^>-]+?)\s*->/)?.[1]?.trim();
      if (sourceNameFromNote) bySourceName.set(normalizeName(sourceNameFromNote), msioId);

      const sourceName = row.osms_item_name || row.source_item_name || row.item_name || row.name;
      if (sourceName) bySourceName.set(normalizeName(sourceName), msioId);
    }

    return { bySourceId, bySourceName };
  }

  function normalizeSlot(slot) {
    const value = String(slot || "").toLowerCase();
    if (value.includes("weapon")) return "Weapon";
    if (value.includes("cap") || value.includes("hat") || value.includes("helmet")) return "Hat";
    return "Unknown";
  }

  function makeEquipmentRecord(item, msioMap) {
    const guidebookId = toNumber(item?.id, null);
    const name = String(item?.name || "").trim();
    if (!guidebookId || !name || item?.category !== "Equipment") return null;

    const mappedId = msioMap.bySourceId.get(String(guidebookId)) || msioMap.bySourceName.get(normalizeName(name)) || null;
    if (!mappedId) return null;

    return {
      id: mappedId,
      guidebookId,
      name,
      normalizedName: normalizeName(name),
      slot: normalizeSlot(item.sub_category),
      reqLevel: toNumber(item.stats?.reqLevel ?? item.reqLevel ?? item.requiredLevel, 0),
      weaponType: item.weapon_type || item.weaponType || "",
    };
  }

  function getWeaponText(item) {
    return `${item?.weaponType || ""} ${item?.name || ""}`.toLowerCase();
  }

  function weaponMatchesKind(item, kind) {
    const text = getWeaponText(item);
    if (kind === "2h-sword") return (text.includes("2h sword") || text.includes("two-handed sword") || text.includes("two handed sword")) && !text.includes("1h");
    if (kind === "1h-sword") return (text.includes("1h sword") || text.includes("one-handed sword") || text.includes("one handed sword")) && !text.includes("2h");
    if (kind === "1h-axe") return (text.includes("1h axe") || text.includes("one-handed axe") || text.includes("one handed axe")) && !text.includes("2h");
    if (kind === "1h-blunt") return (text.includes("1h blunt") || text.includes("one-handed blunt") || text.includes("one handed blunt") || text.includes("1h bw")) && !text.includes("2h");
    if (kind === "spear") return text.includes("spear");
    if (kind === "pole-arm") return text.includes("pole arm") || text.includes("polearm");
    if (kind === "wand") return text.includes("wand");
    if (kind === "staff") return text.includes("staff");
    if (kind === "claw") return text.includes("claw");
    if (kind === "dagger") return text.includes("dagger");
    if (kind === "bow") return text.includes("bow") && !text.includes("crossbow") && !text.includes("cross bow");
    if (kind === "crossbow") return text.includes("crossbow") || text.includes("cross bow");
    if (kind === "knuckle") return text.includes("knuckle");
    if (kind === "gun") return text.includes("gun") && !text.includes("stun") && !text.includes("beginner");
    if (kind === "pistol") return text.includes("pistol");
    return false;
  }

  function hasRareNameHint(item) {
    const name = item?.normalizedName || normalizeName(item?.name);
    if (!name) return false;
    return RARE_NAME_HINTS.some((hint) => hint && name.includes(hint));
  }

  function hasLegendaryHatHint(item) {
    const name = item?.normalizedName || normalizeName(item?.name);
    if (!name) return false;
    return LEGENDARY_HAT_NAME_HINTS.some((hint) => hint && name.includes(hint));
  }

  function isRareWeaponCandidate(item) {
    if (!item || item.slot !== "Weapon") return false;
    const level = toNumber(item.reqLevel, 0);
    const name = item.normalizedName || normalizeName(item.name);
    const isMapleWeapon = name.includes("maple") && !name.includes("cape") && !name.includes("shield");
    return hasRareNameHint(item) || isMapleWeapon || (level >= 70 && level <= 100);
  }

  function isLegendaryHatCandidate(item) {
    return item?.slot === "Hat" && hasLegendaryHatHint(item);
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

  async function loadRarePools() {
    if (rarePools) return rarePools;
    if (!rareDataPromise) {
      rareDataPromise = Promise.all([
        fetch(GUIDEBOOK_ITEMS_URL, { cache: "no-store" }).then((res) => res.json()),
        fetch(GUIDEBOOK_MSIO_MAP_URL, { cache: "no-store" }).then((res) => res.text()),
      ]).then(([itemJson, mapText]) => {
        const rows = Array.isArray(itemJson) ? itemJson : itemJson.items || itemJson.data || [];
        const msioMap = buildMsioMap(parseCsv(mapText));
        const records = rows
          .map((item) => makeEquipmentRecord(item, msioMap))
          .filter(Boolean);

        const rareWeapons = records.filter(isRareWeaponCandidate);
        const legendaryHats = dedupeById([...records.filter(isLegendaryHatCandidate), ...FALLBACK_LEGENDARY_HATS]);

        rarePools = {
          weapons: Object.fromEntries(
            Object.entries(ROLE_RULES).map(([roleCode, rule]) => {
              const pool = rareWeapons.filter((item) => (rule.weaponKinds || []).some((kind) => weaponMatchesKind(item, kind)));
              return [roleCode, pool];
            })
          ),
          hats: legendaryHats,
        };

        window.MSCI_RARE_WEAPON_POOL = {
          weaponRoll: RARE_WEAPON_ROLL,
          legendaryHatRoll: LEGENDARY_HAT_ROLL,
          pools: rarePools.weapons,
          hats: rarePools.hats,
          list: Object.fromEntries(
            Object.entries(rarePools.weapons).map(([roleCode, pool]) => [
              roleCode,
              pool.map((item) => ({ id: item.id, name: item.name, level: item.reqLevel, type: item.weaponType })),
            ])
          ),
          legendaryHatList: rarePools.hats.map((item) => ({ id: item.id, name: item.name, level: item.reqLevel })),
        };

        return rarePools;
      });
    }
    return rareDataPromise;
  }

  function findRoleCode(img) {
    return img?.closest?.(".character-preview-bg")?.dataset?.role || "";
  }

  function idPart(value) {
    return String(value || "").split(":")[0];
  }

  function isWeaponId(value) {
    const id = idPart(value);
    return WEAPON_ID_PREFIXES.some((prefix) => id.startsWith(prefix));
  }

  function isHatId(value) {
    const id = idPart(value);
    return HAT_ID_PREFIXES.some((prefix) => id.startsWith(prefix));
  }

  function actionForWeapon(roleCode, weaponId) {
    if (roleCode === "SNIP") return "stand2";
    if (["KITE", "ZAPZ", "TOXI", "HEAL", "STAR", "STAB", "SHLD", "BRAW", "GUNS"].includes(roleCode)) return "stand1";
    const id = String(weaponId || "");
    return TWO_HAND_WEAPON_PREFIXES.some((prefix) => id.startsWith(prefix)) ? "stand2" : "stand1";
  }

  function updateCharacterUrlEntries(src, updater, roleCode, weaponId = null) {
    const url = new URL(src);
    const parts = url.pathname.split("/");
    const skinIndex = parts.findIndex((part) => part === "2000");
    const itemIndex = skinIndex + 1;
    const actionIndex = skinIndex + 2;
    if (skinIndex < 0 || !parts[itemIndex]) return src;

    const entries = decodeURIComponent(parts[itemIndex])
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);

    parts[itemIndex] = encodeURIComponent(updater(entries).join(","));
    if (weaponId && parts[actionIndex]) parts[actionIndex] = encodeURIComponent(actionForWeapon(roleCode, weaponId));
    url.pathname = parts.join("/");
    return url.toString();
  }

  function replaceWeaponInCharacterUrl(src, roleCode, rareWeapon) {
    return updateCharacterUrlEntries(
      src,
      (entries) => [...entries.filter((entry) => !isWeaponId(entry)), String(rareWeapon.id)],
      roleCode,
      rareWeapon.id
    );
  }

  function replaceHatInCharacterUrl(src, legendaryHat) {
    return updateCharacterUrlEntries(
      src,
      (entries) => [...entries.filter((entry) => !isHatId(entry)), String(legendaryHat.id)],
      null,
      null
    );
  }

  async function maybeApplyRareEquipment(img) {
    if (!img || !img.classList?.contains("msio-character-img")) return;
    const currentSrc = img.currentSrc || img.src || "";
    if (!currentSrc || img.dataset.msciRareCheckedSrc === currentSrc || img.dataset.msciRareAppliedSrc === currentSrc) return;

    img.dataset.msciRareCheckedSrc = currentSrc;
    const roleCode = findRoleCode(img);
    const rule = ROLE_RULES[roleCode];
    if (!rule) return;

    const shouldRollLegendaryHat = Math.random() < LEGENDARY_HAT_ROLL;
    const shouldRollRareWeapon = Math.random() < RARE_WEAPON_ROLL;
    if (!shouldRollLegendaryHat && !shouldRollRareWeapon) return;

    try {
      const pools = await loadRarePools();
      let nextSrc = currentSrc;
      const applied = [];

      if (shouldRollLegendaryHat) {
        const legendaryHat = randomItem(pools?.hats || []);
        if (legendaryHat) {
          nextSrc = replaceHatInCharacterUrl(nextSrc, legendaryHat);
          applied.push(`hat: ${legendaryHat.name} (${legendaryHat.id})`);
        }
      }

      if (shouldRollRareWeapon) {
        const rareWeapon = randomItem(pools?.weapons?.[roleCode] || []);
        if (rareWeapon) {
          nextSrc = replaceWeaponInCharacterUrl(nextSrc, roleCode, rareWeapon);
          applied.push(`weapon: ${rareWeapon.name} (${rareWeapon.id})`);
        }
      }

      if (nextSrc && nextSrc !== currentSrc) {
        img.dataset.msciOriginalSrc = currentSrc;
        img.dataset.msciRareEquipment = applied.join("; ");
        img.dataset.msciRareAppliedSrc = nextSrc;
        img.src = nextSrc;
      }
    } catch (error) {
      console.warn("MSCI rare equipment pool failed:", error);
    }
  }

  function scan() {
    document.querySelectorAll("img.msio-character-img").forEach((img) => {
      window.setTimeout(() => maybeApplyRareEquipment(img), RETRY_DELAY_MS);
    });
  }

  if (typeof document !== "undefined") {
    window.addEventListener("DOMContentLoaded", () => {
      loadRarePools().catch(() => {});
      scan();
      window.setTimeout(scan, RECHECK_DELAY_MS);
    });

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes" && mutation.target?.classList?.contains("msio-character-img")) {
          window.setTimeout(() => maybeApplyRareEquipment(mutation.target), RETRY_DELAY_MS);
        }
        mutation.addedNodes?.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches?.("img.msio-character-img")) window.setTimeout(() => maybeApplyRareEquipment(node), RETRY_DELAY_MS);
          node.querySelectorAll?.("img.msio-character-img").forEach((img) => {
            window.setTimeout(() => maybeApplyRareEquipment(img), RETRY_DELAY_MS);
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
  }
})();
