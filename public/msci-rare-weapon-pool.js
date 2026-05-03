(() => {
  const DATA_CACHE_BUSTER = "stable-hat-equipment-pool-20260503";
  const GUIDEBOOK_DATA_BASE = "https://raw.githubusercontent.com/sduckyduck/osms-classic-guidebook/main/public/data";
  const GUIDEBOOK_ITEMS_URL = `${GUIDEBOOK_DATA_BASE}/items.json?v=${DATA_CACHE_BUSTER}`;
  const GUIDEBOOK_MSIO_MAP_URL = `${GUIDEBOOK_DATA_BASE}/character_item_id_map.csv?v=${DATA_CACHE_BUSTER}`;
  const RETRY_DELAY_MS = 220;
  const RECHECK_DELAY_MS = 900;

  const TWO_HAND_WEAPON_PREFIXES = ["140", "141", "142", "143", "144", "146"];
  const HAT_ID_PREFIXES = ["100"];
  const WEAPON_ID_PREFIXES = [
    "130", "131", "132", "133", "137", "138", "140", "141", "142", "143", "144", "145", "146", "147", "148", "149",
  ];
  const CLASS_GROUPS = ["warrior", "magician", "archer", "thief", "pirate"];
  const MAGE_ROLE_CODES = new Set(["ZAPZ", "TOXI", "HEAL"]);

  const ROLE_RULES = {
    SLAY: { label: "剑客", classGroup: "warrior", weaponKinds: ["2h-sword"] },
    SHLD: { label: "准骑士", classGroup: "warrior", weaponKinds: ["1h-sword", "1h-axe", "1h-blunt"] },
    POLE: { label: "枪战士", classGroup: "warrior", weaponKinds: ["spear", "pole-arm"] },
    ZAPZ: { label: "冰雷法师", classGroup: "magician", weaponKinds: ["wand", "staff"] },
    TOXI: { label: "火毒法师", classGroup: "magician", weaponKinds: ["wand", "staff"] },
    HEAL: { label: "牧师", classGroup: "magician", weaponKinds: ["wand", "staff"] },
    STAR: { label: "刺客", classGroup: "thief", weaponKinds: ["claw"] },
    STAB: { label: "侠客", classGroup: "thief", weaponKinds: ["dagger"] },
    KITE: { label: "猎人", classGroup: "archer", weaponKinds: ["bow"] },
    SNIP: { label: "弩弓手", classGroup: "archer", weaponKinds: ["crossbow"] },
    BRAW: { label: "拳手", classGroup: "pirate", weaponKinds: ["knuckle"] },
    GUNS: { label: "火枪手", classGroup: "pirate", weaponKinds: ["gun", "pistol"] },
  };

  // 扎昆头盔 / Zakum Helmet is the only universal hat intentionally allowed into every job pool.
  const LEGENDARY_HAT_NAME_HINTS = ["zakum helmet", "zakum helm", "zakum", "扎昆", "砝坤"].map(normalizeName);
  const FALLBACK_LEGENDARY_HATS = [
    { id: 1002357, guidebookId: 1002357, name: "Zakum Helmet", normalizedName: "zakum helmet", className: "All", slot: "Hat", reqLevel: 50, weaponType: "" },
  ];

  let equalDataPromise = null;
  let equalPools = null;

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
      className: item.req_job_label || item.requiredJob || item.requiredJobs?.join("/") || "All",
      slot: normalizeSlot(item.sub_category),
      reqLevel: toNumber(item.stats?.reqLevel ?? item.reqLevel ?? item.requiredLevel, 0),
      weaponType: item.weapon_type || item.weaponType || "",
    };
  }

  function classGroupsFromLabel(label) {
    const value = String(label || "").toLowerCase();
    const groups = new Set();
    if (value.includes("warrior") || value.includes("swordman")) groups.add("warrior");
    if (value.includes("magician") || value.includes("mage") || value.includes("wizard")) groups.add("magician");
    if (value.includes("archer") || value.includes("bowman")) groups.add("archer");
    if (value.includes("thief") || value.includes("rogue")) groups.add("thief");
    if (value.includes("pirate") || value.includes("brawler") || value.includes("gunslinger")) groups.add("pirate");
    return groups;
  }

  function isUniversalClassLabel(label) {
    const value = String(label || "").trim().toLowerCase();
    if (!value) return true;
    if (value === "all" || value === "common" || value === "beginner") return true;
    if (value.includes("all classes") || value.includes("common") || value.includes("beginner")) return true;
    const groups = classGroupsFromLabel(value);
    return CLASS_GROUPS.every((group) => groups.has(group));
  }

  function itemIsStrictClassEquipment(item, classGroup) {
    if (isUniversalClassLabel(item?.className)) return false;
    const groups = classGroupsFromLabel(item?.className);
    return groups.size === 1 && groups.has(classGroup);
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

  function isElementalWeapon(item) {
    return String(item?.name || "").trim().toLowerCase().startsWith("elemental");
  }

  function isExcludedWeapon(item, roleCode) {
    return MAGE_ROLE_CODES.has(String(roleCode || "").toUpperCase()) && isElementalWeapon(item);
  }

  function hasLegendaryHatHint(item) {
    const name = item?.normalizedName || normalizeName(item?.name);
    if (!name) return false;
    return LEGENDARY_HAT_NAME_HINTS.some((hint) => hint && name.includes(hint));
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

  async function loadEqualPools() {
    if (equalPools) return equalPools;
    if (!equalDataPromise) {
      equalDataPromise = Promise.all([
        fetch(GUIDEBOOK_ITEMS_URL, { cache: "no-store" }).then((res) => res.json()),
        fetch(GUIDEBOOK_MSIO_MAP_URL, { cache: "no-store" }).then((res) => res.text()),
      ]).then(([itemJson, mapText]) => {
        const rows = Array.isArray(itemJson) ? itemJson : itemJson.items || itemJson.data || [];
        const msioMap = buildMsioMap(parseCsv(mapText));
        const records = rows.map((item) => makeEquipmentRecord(item, msioMap)).filter(Boolean);
        const legendaryHats = dedupeById([...records.filter((item) => item.slot === "Hat" && hasLegendaryHatHint(item)), ...FALLBACK_LEGENDARY_HATS]);

        equalPools = {
          weapons: Object.fromEntries(
            Object.entries(ROLE_RULES).map(([roleCode, rule]) => {
              const pool = records.filter(
                (item) =>
                  item.slot === "Weapon" &&
                  (rule.weaponKinds || []).some((kind) => weaponMatchesKind(item, kind)) &&
                  !isExcludedWeapon(item, roleCode)
              );
              return [roleCode, dedupeById(pool)];
            })
          ),
          hats: Object.fromEntries(
            Object.entries(ROLE_RULES).map(([roleCode, rule]) => {
              const strictJobHats = records.filter((item) => item.slot === "Hat" && itemIsStrictClassEquipment(item, rule.classGroup));
              return [roleCode, dedupeById([...strictJobHats, ...legendaryHats])];
            })
          ),
          legendaryHats,
        };

        window.MSCI_RARE_WEAPON_POOL = {
          mode: "stable-hat-toggle-pool",
          weaponRoll: "same as eligible weapon pool; stable across hat hide/show",
          legendaryHatRoll: "same as eligible hat pool; stable across hat hide/show",
          excludedWeaponRule: "mage weapons whose names start with Elemental are excluded",
          pools: equalPools.weapons,
          hatsByRole: equalPools.hats,
          legendaryHatList: equalPools.legendaryHats.map((item) => ({ id: item.id, name: item.name, level: item.reqLevel })),
          list: Object.fromEntries(
            Object.entries(equalPools.weapons).map(([roleCode, pool]) => [
              roleCode,
              pool.map((item) => ({ id: item.id, name: item.name, level: item.reqLevel, type: item.weaponType })),
            ])
          ),
        };

        return equalPools;
      });
    }
    return equalDataPromise;
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

  function getCharacterUrlParts(src) {
    const url = new URL(src);
    const parts = url.pathname.split("/");
    const skinIndex = parts.findIndex((part) => part === "2000");
    const itemIndex = skinIndex + 1;
    const actionIndex = skinIndex + 2;
    if (skinIndex < 0 || !parts[itemIndex]) return null;
    return { url, parts, itemIndex, actionIndex };
  }

  function readCharacterEntries(src) {
    const parsed = getCharacterUrlParts(src);
    if (!parsed) return [];
    return decodeURIComponent(parsed.parts[parsed.itemIndex])
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  function baseEntriesKey(entries) {
    return (entries || []).filter((entry) => !isHatId(entry) && !isWeaponId(entry)).join(",");
  }

  function updateCharacterUrlEntries(src, updater, roleCode, weaponId = null) {
    const parsed = getCharacterUrlParts(src);
    if (!parsed) return src;
    const { url, parts, itemIndex, actionIndex } = parsed;
    const entries = decodeURIComponent(parts[itemIndex])
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);

    parts[itemIndex] = encodeURIComponent(updater(entries).join(","));
    if (weaponId && parts[actionIndex]) parts[actionIndex] = encodeURIComponent(actionForWeapon(roleCode, weaponId));
    url.pathname = parts.join("/");
    return url.toString();
  }

  function replaceWeaponInCharacterUrl(src, roleCode, weaponId) {
    return updateCharacterUrlEntries(
      src,
      (entries) => [...entries.filter((entry) => !isWeaponId(entry)), String(weaponId)],
      roleCode,
      weaponId
    );
  }

  function replaceHatInCharacterUrl(src, hatId) {
    return updateCharacterUrlEntries(
      src,
      (entries) => [...entries.filter((entry) => !isHatId(entry)), String(hatId)],
      null,
      null
    );
  }

  function rememberChoice(img, baseKey, weapon, hat) {
    img.dataset.msciEqualBaseKey = baseKey;
    if (weapon) {
      img.dataset.msciEqualWeaponId = String(weapon.id);
      img.dataset.msciEqualWeaponName = weapon.name || "";
    }
    if (hat) {
      img.dataset.msciEqualHatId = String(hat.id);
      img.dataset.msciEqualHatName = hat.name || "";
    }
  }

  async function maybeApplyEqualEquipment(img) {
    if (!img || !img.classList?.contains("msio-character-img")) return;
    const currentSrc = img.currentSrc || img.src || "";
    if (!currentSrc || img.dataset.msciEqualApplyingSrc === currentSrc) return;

    const roleCode = findRoleCode(img);
    if (!ROLE_RULES[roleCode]) return;

    const entries = readCharacterEntries(currentSrc);
    const baseKey = `${roleCode}|${baseEntriesKey(entries)}`;
    if (!baseKey || baseKey.endsWith("|")) return;

    try {
      const pools = await loadEqualPools();
      if (img.dataset.msciEqualBaseKey !== baseKey) {
        const weapon = randomItem(pools?.weapons?.[roleCode] || []);
        const hat = randomItem(pools?.hats?.[roleCode] || []);
        rememberChoice(img, baseKey, weapon, hat);
      }

      let nextSrc = currentSrc;
      const applied = [];
      const weaponId = img.dataset.msciEqualWeaponId;
      const hatId = img.dataset.msciEqualHatId;
      const hasVisibleHat = entries.some((entry) => isHatId(entry));

      if (weaponId) {
        nextSrc = replaceWeaponInCharacterUrl(nextSrc, roleCode, weaponId);
        applied.push(`weapon: ${img.dataset.msciEqualWeaponName || weaponId} (${weaponId})`);
      }

      if (hasVisibleHat && hatId) {
        nextSrc = replaceHatInCharacterUrl(nextSrc, hatId);
        applied.push(`hat: ${img.dataset.msciEqualHatName || hatId} (${hatId})`);
      }

      if (nextSrc && nextSrc !== currentSrc) {
        img.dataset.msciOriginalSrc = currentSrc;
        img.dataset.msciEqualEquipment = applied.join("; ");
        img.dataset.msciEqualAppliedSrc = nextSrc;
        img.dataset.msciEqualApplyingSrc = nextSrc;
        img.dataset.msciFallbackBaseKey = baseKey;
        img.src = nextSrc;
      }
    } catch (error) {
      console.warn("MSCI equal equipment pool failed:", error);
    }
  }

  function scan() {
    document.querySelectorAll("img.msio-character-img").forEach((img) => {
      window.setTimeout(() => maybeApplyEqualEquipment(img), RETRY_DELAY_MS);
    });
  }

  if (typeof document !== "undefined") {
    window.addEventListener("DOMContentLoaded", () => {
      loadEqualPools().catch(() => {});
      scan();
      window.setTimeout(scan, RECHECK_DELAY_MS);
    });

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes" && mutation.target?.classList?.contains("msio-character-img")) {
          window.setTimeout(() => maybeApplyEqualEquipment(mutation.target), RETRY_DELAY_MS);
        }
        mutation.addedNodes?.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches?.("img.msio-character-img")) window.setTimeout(() => maybeApplyEqualEquipment(node), RETRY_DELAY_MS);
          node.querySelectorAll?.("img.msio-character-img").forEach((img) => {
            window.setTimeout(() => maybeApplyEqualEquipment(img), RETRY_DELAY_MS);
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
