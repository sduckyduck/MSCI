import { useEffect, useMemo, useState } from "react";

const MS_REGION = "GMS";
const MS_VERSION = "83";
const FIXED_SKIN_ID = 2000;
const DEFAULT_ACTION = "stand1";
const DATA_CACHE_BUSTER = "smooth-safe-hair-20260503";
const GUIDEBOOK_DATA_BASE = "https://raw.githubusercontent.com/sduckyduck/osms-classic-guidebook/main/public/data";
const GUIDEBOOK_ITEMS_URL = `${GUIDEBOOK_DATA_BASE}/items.json?v=${DATA_CACHE_BUSTER}`;
const GUIDEBOOK_MSIO_MAP_URL = `${GUIDEBOOK_DATA_BASE}/character_item_id_map.csv?v=${DATA_CACHE_BUSTER}`;
const HAIR_COLOR_OFFSETS = [0, 1, 2, 3, 4, 5, 6, 7];
const EMOTES = ["default", "wink", "smile", "angry", "blink", "bewildered"];
const VISUAL_SLOTS = new Set(["Hat", "Overall", "Top", "Bottom", "Shoes", "Glove", "Cape", "Earring", "Shield", "Weapon"]);
const TWO_HAND_WEAPON_PREFIXES = ["140", "141", "142", "143", "144", "146"];
const CLASS_GROUPS = ["warrior", "magician", "archer", "thief", "pirate"];

// Source: OSMS datamine beauty_coupons.json / Ayumilove classic beauty list.
// These are black/base style IDs. HAIR_POOLS expands each style to all classic color offsets:
// Black, Brown, Blonde, Red, Orange, Green, Blue, Purple.
const SAFE_HAIR_BASE_IDS = {
  male: [
    30000, // Toben Hair
    30060, // Black Catalyst
    30100, // Black Fantasy
    30120, // Black Vincent
    30140, // Black Topknot
    30150, // Medium Cornrows
    30170, // Line Scratch Hair
    30200, // Black Wind
    30210, // Black Shaggy Wax
    30220, // Black Grooovy Do
    30230, // Black Foil Perm
    30260, // Caspia Hair
    30280, // Black Mohecan Shaggy Do
    30290, // Old Man 'Do
    30310, // Black Acorn
    30320, // Black Close-Cropped Afro
    30010, // Black Zeta
    30020, // Unkempt Hair
    30030, // Shaved Hair
    30070, // Black All Back
    30080, // Black Military Buzzcut
    30090, // Black Mohawk
    30300, // Black Romance
  ],
  female: [
    31030, // Black Polly
    31040, // Black Edgy
    31050, // Rockstar Hair
    31070, // Black Stella
    31080, // Black Parted Pomp
    31100, // Mary Hair
    31110, // Monica Hair
    31150, // Angelica Hair
    31160, // Black Lori
    31170, // Rastafari Hair
    31260, // Daisy Do Hair
    31270, // Black Pigtails
    31280, // Black Ellie
    31290, // Black Naomi
    31300, // Chantelle Hair
    31310, // Black Carla
    31350, // Black Fourtail Braids
    31360, // Swooshy Ponytail Hair
    31380, // Black Stylish Burst Hair
    31000, // Cutie Hair
  ],
};

const FACE_IDS = {
  male: [
    20000, // Defiant Face
    20001, // Confident Face
    20002, // Prudent Face
    20003, // Dramatic Face
    20004, // Rebel's Fire
    20005, // Alert Face
    20006, // Babyface Pout
    20007, // Sad Innocence
    20008, // Worrisome Glare
    20009, // Smart Aleck
    20010, // Wisdom Glance
    20011, // Cool Guy Gaze
    20012, // Curious Dog
    20013, // Insomniac Daze
    20014, // Look of Wonder
  ],
  female: [
    21000, // Defiant Face
    21001, // Prudent Face
    21002, // Intelligent Face
    21003, // Strong Stare
    21004, // Angel Glow
    21005, // Babyface Pout
    21006, // Pucker Up Face
    21007, // Dollface Look
    21008, // Hopeless Gaze
    21009, // Look of Death
    21010, // Wisdom Glance
    21011, // Hypnotized Look
    21012, // Soul's Window
    21013, // Wide-eyed Girl
    21014, // Curious Look
  ],
};

const ROLE_PRESETS = {
  SLAY: { label: "剑客", emote: "angry" },
  SHLD: { label: "准骑士", emote: "default" },
  POLE: { label: "枪战士", emote: "default" },
  ZAPZ: { label: "冰雷法师", emote: "bewildered" },
  TOXI: { label: "火毒法师", emote: "wink" },
  HEAL: { label: "牧师", emote: "smile" },
  STAR: { label: "刺客", emote: "wink" },
  STAB: { label: "侠盗", emote: "angry" },
  KITE: { label: "猎人", emote: "default" },
  SNIP: { label: "弩弓手", emote: "blink" },
  BRAW: { label: "拳手", emote: "angry" },
  GUNS: { label: "火枪手", emote: "wink" },
};

const ROLE_RULES = {
  SLAY: { classGroup: "warrior", weaponKinds: ["2h-sword"], allowShield: false, slots: ["Hat", "Top", "Bottom", "Shoes", "Glove", "Cape", "Weapon"] },
  SHLD: { classGroup: "warrior", weaponKinds: ["1h-sword", "1h-axe", "1h-blunt"], allowShield: true, slots: ["Hat", "Top", "Bottom", "Shoes", "Glove", "Cape", "Weapon", "Shield"] },
  POLE: { classGroup: "warrior", weaponKinds: ["spear", "pole-arm"], allowShield: false, slots: ["Hat", "Top", "Bottom", "Shoes", "Glove", "Cape", "Weapon"] },
  ZAPZ: { classGroup: "magician", weaponKinds: ["wand", "staff"], allowShield: true, slots: ["Hat", "Overall", "Top", "Bottom", "Shoes", "Glove", "Cape", "Earring", "Weapon", "Shield"] },
  TOXI: { classGroup: "magician", weaponKinds: ["wand", "staff"], allowShield: true, slots: ["Hat", "Overall", "Top", "Bottom", "Shoes", "Glove", "Cape", "Earring", "Weapon", "Shield"] },
  HEAL: { classGroup: "magician", weaponKinds: ["wand", "staff"], allowShield: true, slots: ["Hat", "Overall", "Top", "Bottom", "Shoes", "Glove", "Cape", "Earring", "Weapon", "Shield"] },
  STAR: { classGroup: "thief", weaponKinds: ["claw"], allowShield: false, slots: ["Hat", "Top", "Bottom", "Shoes", "Glove", "Cape", "Earring", "Weapon"] },
  STAB: { classGroup: "thief", weaponKinds: ["dagger"], allowShield: true, slots: ["Hat", "Top", "Bottom", "Shoes", "Glove", "Cape", "Earring", "Weapon", "Shield"] },
  KITE: { classGroup: "archer", weaponKinds: ["bow"], allowShield: false, slots: ["Hat", "Overall", "Top", "Bottom", "Shoes", "Glove", "Cape", "Earring", "Weapon"] },
  SNIP: { classGroup: "archer", weaponKinds: ["crossbow"], allowShield: false, slots: ["Hat", "Overall", "Top", "Bottom", "Shoes", "Glove", "Cape", "Earring", "Weapon"] },
  BRAW: { classGroup: "pirate", weaponKinds: ["knuckle"], allowShield: false, slots: ["Hat", "Overall", "Top", "Bottom", "Shoes", "Glove", "Cape", "Weapon"] },
  GUNS: { classGroup: "pirate", weaponKinds: ["gun", "pistol"], allowShield: false, slots: ["Hat", "Overall", "Top", "Bottom", "Shoes", "Glove", "Cape", "Weapon"] },
};

const FALLBACK_EQUIPMENT = {
  SLAY: [1002001, 1060016, 1402000],
  SHLD: [1002001, 1060016, 1302000, 1092000],
  POLE: [1002001, 1060016, 1432000],
  ZAPZ: [1002019, 1050003, 1372000],
  TOXI: [1002019, 1050003, 1382000],
  HEAL: [1002019, 1050003, 1372000],
  STAR: [1002170, 1060043, 1472000],
  STAB: [1002170, 1060043, 1332000, 1092000],
  KITE: [1002165, 1060056, 1452000],
  SNIP: [1002165, 1060056, 1462000],
  BRAW: [1002610, 1052095, 1072288, 1482000],
  GUNS: [1002610, 1052095, 1072288, 1492000],
};

const HAIR_POOLS = {
  male: expandHairColors(SAFE_HAIR_BASE_IDS.male),
  female: expandHairColors(SAFE_HAIR_BASE_IDS.female),
};

let equipmentDataPromise = null;
let equipmentDataCache = null;

function expandHairColors(styleIds) {
  const out = new Set();
  for (const id of styleIds || []) {
    const baseId = Math.floor(Number(id) / 10) * 10;
    for (const offset of HAIR_COLOR_OFFSETS) out.add(baseId + offset);
  }
  return [...out];
}

function normalizeGender(value) {
  const key = String(value || "").trim().toLowerCase();
  return key === "male" || key === "female" ? key : "female";
}

function normalizeRoleCode(profile) {
  return String(profile?.code || "SLAY").trim().toUpperCase();
}

function toNumber(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(String(value).replace(/[,+]/g, "").trim());
  return Number.isFinite(n) ? n : fallback;
}

function normalizeName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
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
  if (value.includes("cap") || value.includes("hat")) return "Hat";
  if (value.includes("overall")) return "Overall";
  if (value.includes("top")) return "Top";
  if (value.includes("bottom") || value.includes("pants") || value.includes("skirt")) return "Bottom";
  if (value.includes("shoe")) return "Shoes";
  if (value.includes("glove")) return "Glove";
  if (value.includes("cape")) return "Cape";
  if (value.includes("ear")) return "Earring";
  if (value.includes("shield")) return "Shield";
  return "Unknown";
}

function inferItemGender(item) {
  const id = String(item?.guidebookId || item?.id || "");
  if (item?.slot === "Top") {
    if (id.startsWith("1040")) return "male";
    if (id.startsWith("1041")) return "female";
  }
  if (item?.slot === "Bottom") {
    if (id.startsWith("1060")) return "male";
    if (id.startsWith("1061")) return "female";
  }
  if (item?.slot === "Overall") {
    if (id.startsWith("1050")) return "male";
    if (id.startsWith("1051")) return "female";
  }
  return "all";
}

function makeEquipmentRecord(item, msioMap) {
  const guidebookId = toNumber(item?.id, null);
  const name = String(item?.name || "").trim();
  if (!guidebookId || !name || item?.category !== "Equipment") return null;

  const mappedId = msioMap.bySourceId.get(String(guidebookId)) || msioMap.bySourceName.get(normalizeName(name)) || null;
  if (!mappedId) return null;

  const record = {
    id: mappedId,
    guidebookId,
    name,
    className: item.req_job_label || item.requiredJob || item.requiredJobs?.join("/") || "All",
    slot: normalizeSlot(item.sub_category),
    reqLevel: toNumber(item.stats?.reqLevel ?? item.reqLevel ?? item.requiredLevel, 0),
    weaponType: item.weapon_type || item.weaponType || "",
  };

  record.gender = inferItemGender(record);
  return record;
}

async function loadEquipmentData() {
  if (equipmentDataCache) return equipmentDataCache;
  if (!equipmentDataPromise) {
    equipmentDataPromise = Promise.all([
      fetch(GUIDEBOOK_ITEMS_URL, { cache: "no-store" }).then((res) => {
        if (!res.ok) throw new Error(`items.json HTTP ${res.status}`);
        return res.json();
      }),
      fetch(GUIDEBOOK_MSIO_MAP_URL, { cache: "no-store" }).then((res) => {
        if (!res.ok) throw new Error(`character_item_id_map.csv HTTP ${res.status}`);
        return res.text();
      }),
    ]).then(([itemJson, mapText]) => {
      const rows = Array.isArray(itemJson) ? itemJson : itemJson.items || itemJson.data || [];
      const msioMap = buildMsioMap(parseCsv(mapText));
      const records = rows
        .map((item) => makeEquipmentRecord(item, msioMap))
        .filter((item) => item && VISUAL_SLOTS.has(item.slot));
      equipmentDataCache = { records, loadedAt: Date.now() };
      return equipmentDataCache;
    });
  }
  return equipmentDataPromise;
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

function itemMatchesGender(item, gender) {
  return !item?.gender || item.gender === "all" || item.gender === gender;
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

function itemAllowed(item, roleCode, gender) {
  const rule = ROLE_RULES[roleCode] || ROLE_RULES.SLAY;
  if (!item || !VISUAL_SLOTS.has(item.slot)) return false;
  if (!itemMatchesGender(item, gender)) return false;
  if (item.slot === "Weapon") return (rule.weaponKinds || []).some((kind) => weaponMatchesKind(item, kind));
  if (item.slot === "Shield") return Boolean(rule.allowShield) && itemIsStrictClassEquipment(item, rule.classGroup);
  return itemIsStrictClassEquipment(item, rule.classGroup);
}

function randomItem(items) {
  if (!items?.length) return null;
  return items[Math.floor(Math.random() * items.length)];
}

function chooseBySlot(candidates, slot, selectedIds, targetLevel = null) {
  const slotItems = candidates.filter((item) => item.slot === slot && !selectedIds.has(String(item.id)));
  if (!slotItems.length) return null;
  if (targetLevel !== null) {
    const nearby = slotItems.filter((item) => Math.abs(toNumber(item.reqLevel, 0) - targetLevel) <= 10);
    if (nearby.length) return randomItem(nearby);
  }
  const level60 = slotItems.filter((item) => toNumber(item.reqLevel, 0) <= 60);
  return randomItem(level60.length ? level60 : slotItems);
}

function pickTargetLevel(candidates, rule) {
  const levels = candidates
    .filter((item) => rule.slots.includes(item.slot))
    .map((item) => toNumber(item.reqLevel, 0))
    .filter((level) => level > 0 && level <= 60);
  return levels.length ? randomItem(levels) : null;
}

function makeRandomLoadout(equipmentData, roleCode, gender) {
  const rule = ROLE_RULES[roleCode] || ROLE_RULES.SLAY;
  const candidates = (equipmentData?.records || []).filter((item) => itemAllowed(item, roleCode, gender));
  if (!candidates.length) return FALLBACK_EQUIPMENT[roleCode] || FALLBACK_EQUIPMENT.SLAY;

  const selected = [];
  const selectedIds = new Set();
  const targetLevel = pickTargetLevel(candidates, rule);

  function add(item) {
    if (!item || selectedIds.has(String(item.id))) return null;
    selected.push(item);
    selectedIds.add(String(item.id));
    return item;
  }

  const weapon = add(chooseBySlot(candidates, "Weapon", selectedIds, targetLevel));
  const weaponText = getWeaponText(weapon);
  const mageWithStaff = ["ZAPZ", "TOXI", "HEAL"].includes(roleCode) && weaponText.includes("staff");
  const hasOverall = candidates.some((item) => item.slot === "Overall");
  const useOverall = hasOverall && Math.random() < 0.55;

  if (rule.slots.includes("Overall") && useOverall) {
    add(chooseBySlot(candidates, "Overall", selectedIds, targetLevel));
  } else {
    if (rule.slots.includes("Top")) add(chooseBySlot(candidates, "Top", selectedIds, targetLevel));
    if (rule.slots.includes("Bottom")) add(chooseBySlot(candidates, "Bottom", selectedIds, targetLevel));
  }

  for (const slot of rule.slots) {
    if (["Weapon", "Overall", "Top", "Bottom", "Shield"].includes(slot)) continue;
    if (Math.random() < 0.92) add(chooseBySlot(candidates, slot, selectedIds, targetLevel));
  }

  if (rule.allowShield && !mageWithStaff && Math.random() < 0.8) {
    add(chooseBySlot(candidates, "Shield", selectedIds, targetLevel));
  }

  const ids = selected.map((item) => item.id).filter(Boolean);
  return ids.length ? ids : FALLBACK_EQUIPMENT[roleCode] || FALLBACK_EQUIPMENT.SLAY;
}

function normalizeLegacyFaceEmote(emote) {
  const key = String(emote || "default").trim().toLowerCase();
  if (!key || key === "0" || key === "e00" || key === "normal") return "default";
  if (key === "e01") return "wink";
  if (key === "e02") return "smile";
  if (key === "e03") return "cry";
  if (key === "e04") return "angry";
  if (key === "e05") return "bewildered";
  if (key === "e06") return "blink";
  return key;
}

function isHatId(id) {
  return String(id || "").startsWith("100");
}

function actionForEquipment(roleCode, equipmentIds) {
  if (["KITE", "ZAPZ", "TOXI", "HEAL", "STAR", "STAB", "SHLD", "BRAW", "GUNS"].includes(roleCode)) return "stand1";
  if (roleCode === "SNIP") return "stand2";
  const weaponId = String((equipmentIds || []).find((id) => String(id).startsWith("1")) || "");
  return TWO_HAND_WEAPON_PREFIXES.some((prefix) => weaponId.startsWith(prefix)) ? "stand2" : "stand1";
}

function buildCharacterUrl(config, hideHat) {
  const faceEmote = normalizeLegacyFaceEmote(config.emote);
  const equipment = hideHat ? config.equipment.filter((id) => !isHatId(id)) : config.equipment;
  const entries = [config.hair, `${config.face}:${faceEmote}`, ...equipment].filter(Boolean);
  const itemPath = encodeURIComponent(entries.join(","));
  const action = encodeURIComponent(config.action || DEFAULT_ACTION);
  return `https://maplestory.io/api/${MS_REGION}/${MS_VERSION}/Character/${FIXED_SKIN_ID}/${itemPath}/${action}/0?resize=3&renderMode=Full&bgColor=0,0,0,0&faceEmote=${encodeURIComponent(faceEmote)}`;
}

function makeConfig({ roleCode, gender, equipmentData, rerollCount }) {
  const preset = ROLE_PRESETS[roleCode] || ROLE_PRESETS.SLAY;
  const equipment = makeRandomLoadout(equipmentData, roleCode, gender);
  return {
    hair: randomItem(HAIR_POOLS[gender]) || HAIR_POOLS.female[0],
    face: randomItem(FACE_IDS[gender]) || FACE_IDS.female[0],
    emote: rerollCount === 0 ? preset.emote : randomItem(EMOTES),
    equipment,
    action: actionForEquipment(roleCode, equipment),
  };
}

function SmoothCharacterBuilder({ profile, characterGender }) {
  const roleCode = normalizeRoleCode(profile);
  const gender = normalizeGender(characterGender);
  const preset = ROLE_PRESETS[roleCode] || ROLE_PRESETS.SLAY;
  const [equipmentData, setEquipmentData] = useState(equipmentDataCache);
  const [rerollCount, setRerollCount] = useState(0);
  const [hideHat, setHideHat] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [config, setConfig] = useState(() => makeConfig({ roleCode, gender, equipmentData: equipmentDataCache, rerollCount: 0 }));

  useEffect(() => {
    let cancelled = false;
    loadEquipmentData()
      .then((data) => {
        if (!cancelled) {
          setEquipmentData(data);
          setLoadError("");
        }
      })
      .catch((error) => {
        if (!cancelled) setLoadError(error?.message || "装备数据加载失败，暂用备用装备池");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setConfig(makeConfig({ roleCode, gender, equipmentData, rerollCount: 0 }));
    setRerollCount(0);
    setHideHat(false);
    setImageError(false);
  }, [roleCode, gender, equipmentData]);

  const visibleConfig = useMemo(() => {
    if (!imageError) return config;
    return { ...config, equipment: config.equipment.filter((id) => !isHatId(id)) };
  }, [config, imageError]);

  const imageUrl = useMemo(() => buildCharacterUrl(visibleConfig, hideHat), [visibleConfig, hideHat]);

  function rerollCharacter() {
    setRerollCount((count) => {
      const nextCount = count + 1;
      setConfig(makeConfig({ roleCode, gender, equipmentData, rerollCount: nextCount }));
      setHideHat(false);
      setImageError(false);
      return nextCount;
    });
  }

  return (
    <div className="character-builder smooth-character-builder">
      <div className="character-preview-card">
        <div className="character-preview-bg" data-role={roleCode}>
          {imageError && !visibleConfig.equipment.length ? (
            <div className="msio-error-card">
              <b>角色预览加载失败</b>
              <span>MapleStory.io 暂时没有返回这个组合。</span>
            </div>
          ) : (
            <img
              className="msio-character-img"
              src={imageUrl}
              alt={`${profile?.name || preset.label || roleCode} 角色预览`}
              draggable="false"
              onError={() => setImageError(true)}
            />
          )}
        </div>
      </div>

      <details className="character-builder-controls" open data-export-hidden="true">
        <summary className="builder-summary">
          <b>角色预览</b>
          <span>{preset.label || profile?.name || roleCode}</span>
        </summary>
        <div className="builder-control-head">
          <b>显示设置</b>
          <div className="builder-button-row">
            <button type="button" className="ghost-btn small-btn" onClick={rerollCharacter}>随机发型脸型和职业装备</button>
            <button type="button" className={`ghost-btn small-btn ${hideHat ? "active" : ""}`} onClick={() => setHideHat((value) => !value)}>
              {hideHat ? "显示帽子" : "隐藏帽子"}
            </button>
          </div>
        </div>
        {loadError && <p className="builder-note">{loadError}</p>}
      </details>
    </div>
  );
}

export default SmoothCharacterBuilder;
