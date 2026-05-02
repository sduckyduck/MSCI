import { useEffect, useMemo, useState } from "react";

const MS_REGION = "GMS";
const MS_VERSION = "83";
const CHARACTER_ACTION = "stand1";
const CHARACTER_STYLE_ITEM = 12000;
const GUIDEBOOK_DATA_BASE = "https://raw.githubusercontent.com/sduckyduck/osms-classic-guidebook/main/public/data";
const GUIDEBOOK_ITEMS_URL = `${GUIDEBOOK_DATA_BASE}/items.json`;
const GUIDEBOOK_MSIO_MAP_URL = `${GUIDEBOOK_DATA_BASE}/character_item_id_map.csv`;

const CLASS_GROUPS = ["warrior", "magician", "archer", "thief"];
const CLASS_LABELS = {
  warrior: "Warrior",
  magician: "Magician",
  archer: "Archer",
  thief: "Thief",
};

const ROLE_EQUIPMENT_RULES = {
  SLAY: {
    classGroup: "warrior",
    displayName: "剑客",
    weaponKinds: ["2h-sword"],
    allowShield: false,
    slotPriority: ["Hat", "Top", "Bottom", "Shoes", "Glove", "Cape", "Weapon"],
  },
  SHLD: {
    classGroup: "warrior",
    displayName: "准骑士",
    weaponKinds: ["1h-sword", "1h-axe", "1h-blunt"],
    allowShield: true,
    slotPriority: ["Hat", "Top", "Bottom", "Shoes", "Glove", "Cape", "Weapon", "Shield"],
  },
  POLE: {
    classGroup: "warrior",
    displayName: "枪战士",
    weaponKinds: ["spear", "pole-arm"],
    allowShield: false,
    slotPriority: ["Hat", "Top", "Bottom", "Shoes", "Glove", "Cape", "Weapon"],
  },
  ZAPZ: {
    classGroup: "magician",
    displayName: "冰雷法师",
    weaponKinds: ["wand", "staff"],
    allowShield: false,
    slotPriority: ["Hat", "Overall", "Shoes", "Glove", "Cape", "Earring", "Weapon"],
  },
  TOXI: {
    classGroup: "magician",
    displayName: "火毒法师",
    weaponKinds: ["wand", "staff"],
    allowShield: false,
    slotPriority: ["Hat", "Overall", "Shoes", "Glove", "Cape", "Earring", "Weapon"],
  },
  HEAL: {
    classGroup: "magician",
    displayName: "牧师",
    weaponKinds: ["wand", "staff"],
    allowShield: false,
    slotPriority: ["Hat", "Overall", "Shoes", "Glove", "Cape", "Earring", "Weapon"],
  },
  STAR: {
    classGroup: "thief",
    displayName: "刺客",
    weaponKinds: ["claw"],
    allowShield: false,
    slotPriority: ["Hat", "Top", "Bottom", "Shoes", "Glove", "Cape", "Earring", "Weapon"],
  },
  STAB: {
    classGroup: "thief",
    displayName: "侠盗",
    weaponKinds: ["dagger"],
    allowShield: true,
    slotPriority: ["Hat", "Top", "Bottom", "Shoes", "Glove", "Cape", "Earring", "Weapon", "Shield"],
  },
  KITE: {
    classGroup: "archer",
    displayName: "猎人",
    weaponKinds: ["bow"],
    allowShield: false,
    slotPriority: ["Hat", "Overall", "Top", "Bottom", "Shoes", "Glove", "Cape", "Earring", "Weapon"],
  },
  SNIP: {
    classGroup: "archer",
    displayName: "弩弓手",
    weaponKinds: ["crossbow"],
    allowShield: false,
    slotPriority: ["Hat", "Overall", "Top", "Bottom", "Shoes", "Glove", "Cape", "Earring", "Weapon"],
  },
};

const FALLBACK_EQUIPMENT = [
  { id: 1040002, guidebookId: 1040002, name: "White Undershirt", className: "All", slot: "Top", reqLevel: 0, source: "fallback", msioMapped: true },
  { id: 1060002, guidebookId: 1060002, name: "Brown Cotton Shorts", className: "All", slot: "Bottom", reqLevel: 0, source: "fallback", msioMapped: true },
  { id: 1072001, guidebookId: 1072001, name: "Beginner Shoes", className: "All", slot: "Shoes", reqLevel: 0, source: "fallback", msioMapped: true },
  { id: 1002001, guidebookId: 1002001, name: "Green Skullcap", className: "Warrior", slot: "Hat", reqLevel: 5, source: "fallback", msioMapped: true },
  { id: 1060016, guidebookId: 1060016, name: "Steel Sergeant Kilt", className: "Warrior", slot: "Bottom", reqLevel: 20, source: "fallback", msioMapped: true },
  { id: 1402000, guidebookId: 1402000, name: "Two-Handed Sword", className: "Warrior", slot: "Weapon", reqLevel: 10, weaponType: "2H Sword", source: "fallback", msioMapped: true },
  { id: 1302000, guidebookId: 1302000, name: "Sword", className: "Warrior", slot: "Weapon", reqLevel: 0, weaponType: "1H Sword", source: "fallback", msioMapped: true },
  { id: 1092000, guidebookId: 1092000, name: "Stolen Fence", className: "Warrior/Thief", slot: "Shield", reqLevel: 5, source: "fallback", msioMapped: true },
  { id: 1432000, guidebookId: 1432000, name: "Spear", className: "Warrior", slot: "Weapon", reqLevel: 10, weaponType: "Spear", source: "fallback", msioMapped: true },
  { id: 1442000, guidebookId: 1442000, name: "Pole Arm", className: "Warrior", slot: "Weapon", reqLevel: 10, weaponType: "Pole Arm", source: "fallback", msioMapped: true },
  { id: 1002019, guidebookId: 1002019, name: "Brown Apprentice Hat", className: "Magician", slot: "Hat", reqLevel: 8, source: "fallback", msioMapped: true },
  { id: 1050003, guidebookId: 1050003, name: "Magician Robe", className: "Magician", slot: "Overall", reqLevel: 18, source: "fallback", msioMapped: true },
  { id: 1372000, guidebookId: 1372000, name: "Wooden Wand", className: "Magician", slot: "Weapon", reqLevel: 8, weaponType: "Wand", source: "fallback", msioMapped: true },
  { id: 1382000, guidebookId: 1382000, name: "Wooden Staff", className: "Magician", slot: "Weapon", reqLevel: 10, weaponType: "Staff", source: "fallback", msioMapped: true },
  { id: 1002165, guidebookId: 1002165, name: "Archer Hat", className: "Archer", slot: "Hat", reqLevel: 20, source: "fallback", msioMapped: true },
  { id: 1060056, guidebookId: 1060056, name: "Archer Pants", className: "Archer", slot: "Bottom", reqLevel: 30, source: "fallback", msioMapped: true },
  { id: 1452000, guidebookId: 1452000, name: "Bow", className: "Archer", slot: "Weapon", reqLevel: 10, weaponType: "Bow", source: "fallback", msioMapped: true },
  { id: 1462000, guidebookId: 1462000, name: "Crossbow", className: "Archer", slot: "Weapon", reqLevel: 12, weaponType: "Crossbow", source: "fallback", msioMapped: true },
  { id: 1002170, guidebookId: 1002170, name: "Thief Hat", className: "Thief", slot: "Hat", reqLevel: 20, source: "fallback", msioMapped: true },
  { id: 1060043, guidebookId: 1060043, name: "Green Legolier Pants", className: "Thief", slot: "Bottom", reqLevel: 30, source: "fallback", msioMapped: true },
  { id: 1472000, guidebookId: 1472000, name: "Garnier", className: "Thief", slot: "Weapon", reqLevel: 10, weaponType: "Claw", source: "fallback", msioMapped: true },
  { id: 1332000, guidebookId: 1332000, name: "Fruit Knife", className: "Thief", slot: "Weapon", reqLevel: 8, weaponType: "Dagger", source: "fallback", msioMapped: true },
  { id: 1102000, guidebookId: 1102000, name: "Old Raggedy Cape", className: "All", slot: "Cape", reqLevel: 25, source: "fallback", msioMapped: true },
  { id: 1032000, guidebookId: 1032000, name: "Weighted Earrings", className: "All", slot: "Earring", reqLevel: 15, source: "fallback", msioMapped: true },
  { id: 1082002, guidebookId: 1082002, name: "Steel Fingerless Gloves", className: "All", slot: "Glove", reqLevel: 10, source: "fallback", msioMapped: true },
];

function normalizeMsioEmote(emote) {
  const key = String(emote || "default").trim().toLowerCase();

  if (!key || key === "default" || key === "normal" || key === "e00") return "0";
  if (key === "e01") return "wink";
  if (key === "e02") return "smile";
  if (key === "e03") return "cry";
  if (key === "e04") return "angry";
  if (key === "e05") return "bewildered";
  if (key === "e06") return "blink";
  if (key === "e08") return "bowing";
  if (key === "e09") return "cheers";
  if (key === "e10") return "chu";

  return key;
}

function normalizeLegacyFaceEmote(emote) {
  const normalized = normalizeMsioEmote(emote);
  return normalized === "0" ? "default" : normalized;
}

function normalizeMsioAction(action) {
  const key = String(action || CHARACTER_ACTION).trim().toLowerCase();
  if (key === "stand" || key === "default") return "stand1";
  return key || CHARACTER_ACTION;
}

function normalizeName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toNumber(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(String(value).replace(/[,+]/g, "").trim());
  return Number.isFinite(n) ? n : fallback;
}

// Legacy GMS/v83 route supports face-layer animations through `faceId:faceAnimation`.
// The previous modern route changed the emote path segment, but in MSCI that did not
// visually change the face reliably. This route puts the emote directly on the face item.
function buildMapleStoryIoCharacterUrl({ config, equipment, action = CHARACTER_ACTION }) {
  const faceEmote = normalizeLegacyFaceEmote(config?.emote);
  const itemEntries = [
    Number(config?.hair),
    `${Number(config?.face)}:${faceEmote}`,
    ...getEquipmentIds(equipment),
  ].filter(Boolean);

  return `https://maplestory.io/api/${MS_REGION}/${MS_VERSION}/Character/${Number(config?.skin)}/${encodeURIComponent(itemEntries.join(","))}/${normalizeMsioAction(action)}/0?resize=3&renderMode=Full&bgColor=0,0,0,0&faceEmote=${encodeURIComponent(faceEmote)}`;
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
  const msioBySourceId = new Map();
  const msioBySourceName = new Map();

  for (const row of rows || []) {
    const sourceId = toNumber(row.osms_item_id ?? row.source_item_id ?? row.item_id ?? row.id, null);
    const msioId = toNumber(row.msio_item_id ?? row.mapped_item_id ?? row.target_item_id ?? row.msio_id, null);
    if (!msioId || msioId <= 0) continue;

    if (sourceId) msioBySourceId.set(String(sourceId), msioId);

    const note = String(row.note || row.match_note || "");
    const sourceNameFromNote = note.match(/^\s*([^>-]+?)\s*->/)?.[1]?.trim();
    if (sourceNameFromNote) msioBySourceName.set(normalizeName(sourceNameFromNote), msioId);

    const sourceName = row.osms_item_name || row.source_item_name || row.item_name || row.name;
    if (sourceName) msioBySourceName.set(normalizeName(sourceName), msioId);
  }

  return { msioBySourceId, msioBySourceName };
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
  return slot || "Unknown";
}

function itemSupportsClass(item, classGroup) {
  const label = String(item.req_job_label || item.className || "All").toLowerCase();
  if (!label || label === "all" || label.includes("common")) return true;

  if (classGroup === "warrior") return label.includes("warrior");
  if (classGroup === "magician") return label.includes("magician") || label.includes("mage");
  if (classGroup === "archer") return label.includes("archer") || label.includes("bowman");
  if (classGroup === "thief") return label.includes("thief") || label.includes("rogue");

  return false;
}

function isRenderableVisualEquipment(equipment) {
  if (!equipment?.id) return false;
  if (!equipment.msioMapped && equipment.source !== "fallback") return false;
  if (["Unknown"].includes(equipment.slot)) return false;
  return true;
}

function makeEquipmentRecord(item, msioMap) {
  const guidebookId = toNumber(item?.id, null);
  const name = String(item?.name || "").trim();
  if (!guidebookId || !name || item?.category !== "Equipment") return null;

  const msioId =
    msioMap.msioBySourceId.get(String(guidebookId)) ||
    msioMap.msioBySourceName.get(normalizeName(name)) ||
    null;

  return {
    id: msioId || guidebookId,
    guidebookId,
    name,
    className: item.req_job_label || "All",
    slot: normalizeSlot(item.sub_category),
    reqLevel: toNumber(item.stats?.reqLevel ?? item.reqLevel, 0),
    weaponType: item.weapon_type || "",
    thumbnail: item.thumbnail || "",
    source: "guidebook-items-json",
    msioMapped: Boolean(msioId),
  };
}

function buildEquipmentPool(itemRows, msioMap) {
  const allEquipment = (itemRows || [])
    .map((item) => makeEquipmentRecord(item, msioMap))
    .filter(Boolean);

  const classPools = Object.fromEntries(
    CLASS_GROUPS.map((classGroup) => [
      classGroup,
      allEquipment.filter((item) => itemSupportsClass(item, classGroup)),
    ])
  );

  return {
    allEquipment,
    classPools,
    source: "guidebook-items-json + character-item-id-map",
  };
}

function buildFallbackPool() {
  const classPools = Object.fromEntries(
    CLASS_GROUPS.map((classGroup) => [
      classGroup,
      FALLBACK_EQUIPMENT.filter((item) => itemSupportsClass(item, classGroup)),
    ])
  );

  return {
    allEquipment: FALLBACK_EQUIPMENT,
    classPools,
    source: "fallback-seed",
  };
}

function countBySlot(items) {
  return (items || []).reduce((acc, item) => {
    acc[item.slot] = (acc[item.slot] || 0) + 1;
    return acc;
  }, {});
}

function getPoolStats(pool) {
  const stats = {};

  for (const classGroup of CLASS_GROUPS) {
    const classItems = pool.classPools?.[classGroup] || [];
    const renderable = classItems.filter(isRenderableVisualEquipment);
    stats[classGroup] = {
      total: classItems.length,
      renderable: renderable.length,
      bySlot: countBySlot(classItems),
      renderableBySlot: countBySlot(renderable),
    };
  }

  return stats;
}

function getClassPoolSummary(stats) {
  return CLASS_GROUPS
    .map((classGroup) => {
      const row = stats?.[classGroup] || { total: 0, renderable: 0 };
      return `${CLASS_LABELS[classGroup]} ${row.renderable}/${row.total}`;
    })
    .join(" ｜ ");
}

const SKIN_OPTIONS = [
  { id: 2000, label: "普通皮肤" },
  { id: 2001, label: "白皙皮肤" },
  { id: 2002, label: "偏暖皮肤" },
  { id: 2003, label: "健康皮肤" },
];

const HAIR_OPTIONS = {
  male: [
    { id: 30000, label: "黑短发" },
    { id: 30020, label: "中分黑发" },
    { id: 30030, label: "清爽短发" },
    { id: 30040, label: "冒险家发型" },
  ],
  female: [
    { id: 31000, label: "黑长发" },
    { id: 31040, label: "侧分黑发" },
    { id: 31050, label: "双马尾" },
    { id: 31060, label: "短发少女" },
  ],
};

const FACE_OPTIONS = {
  male: [
    { id: 20000, label: "普通脸" },
    { id: 20001, label: "锐利脸" },
    { id: 20002, label: "冷静脸" },
    { id: 20003, label: "认真脸" },
  ],
  female: [
    { id: 21000, label: "普通脸" },
    { id: 21001, label: "可爱脸" },
    { id: 21002, label: "冷静脸" },
    { id: 21003, label: "锐利脸" },
  ],
};

const EMOTE_OPTIONS = [
  { id: "default", label: "默认", apiCode: "E00" },
  { id: "wink", label: "眨眼", apiCode: "E01" },
  { id: "smile", label: "微笑", apiCode: "E02" },
  { id: "cry", label: "哭哭", apiCode: "E03" },
  { id: "angry", label: "生气", apiCode: "E04" },
  { id: "bewildered", label: "懵了", apiCode: "E05" },
  { id: "blink", label: "闭眼", apiCode: "E06" },
  { id: "bowing", label: "鞠躬脸", apiCode: "E08" },
  { id: "cheers", label: "开心", apiCode: "E09" },
  { id: "chu", label: "啾咪", apiCode: "E10" },
];

const GENDER_OPTIONS = [
  { id: "male", label: "男" },
  { id: "female", label: "女" },
];

const ROLE_PRESETS = {
  SLAY: { emote: "angry" },
  SHLD: { emote: "default" },
  POLE: { emote: "default" },
  ZAPZ: { emote: "bewildered" },
  TOXI: { emote: "wink" },
  HEAL: { emote: "smile" },
  STAR: { emote: "wink" },
  STAB: { emote: "angry" },
  KITE: { emote: "default" },
  SNIP: { emote: "blink" },
};

const CODE_TO_GROUP = Object.fromEntries(
  Object.entries(ROLE_EQUIPMENT_RULES).map(([code, rule]) => [code, rule.classGroup])
);

function pick(options) {
  if (!options?.length) return null;
  return options[Math.floor(Math.random() * options.length)];
}

function getOption(options, id) {
  return options.find((option) => String(option.id) === String(id)) || options[0];
}

function getRoleRule(profile) {
  return ROLE_EQUIPMENT_RULES[profile?.code] || ROLE_EQUIPMENT_RULES.SLAY;
}

function getClassGroupForProfile(profile) {
  return getRoleRule(profile).classGroup || CODE_TO_GROUP[profile?.code] || "warrior";
}

function getWeaponSearchText(item) {
  return `${item?.weaponType || ""} ${item?.name || ""}`.toLowerCase();
}

function weaponMatchesKind(item, kind) {
  const text = getWeaponSearchText(item);

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

  return false;
}

function itemAllowedForRole(item, profile) {
  const rule = getRoleRule(profile);

  if (item.slot === "Shield") return Boolean(rule.allowShield);
  if (item.slot !== "Weapon") return true;

  return (rule.weaponKinds || []).some((kind) => weaponMatchesKind(item, kind));
}

function pickFromSlot(items, slot, profile, maxLevel = 60) {
  const base = items
    .filter(isRenderableVisualEquipment)
    .filter((item) => item.slot === slot)
    .filter((item) => itemAllowedForRole(item, profile));

  const candidates = base.filter((item) => toNumber(item.reqLevel, 0) <= maxLevel);
  return pick(candidates.length ? candidates : base);
}

function makeEquipmentLoadout(profile, pool, maxLevel = 60) {
  const roleRule = getRoleRule(profile);
  const classGroup = getClassGroupForProfile(profile);
  const classItems = pool.classPools?.[classGroup] || [];
  const slotPriority = roleRule.slotPriority || ROLE_EQUIPMENT_RULES.SLAY.slotPriority;
  const selected = [];
  const selectedSlots = new Set();

  const overall = pickFromSlot(classItems, "Overall", profile, maxLevel);
  const useOverall = Boolean(overall) && Math.random() < 0.5;

  if (useOverall) {
    selected.push(overall);
    selectedSlots.add("Overall");
    selectedSlots.add("Top");
    selectedSlots.add("Bottom");
  }

  for (const slot of slotPriority) {
    if (selectedSlots.has(slot)) continue;
    if (slot === "Overall" && !useOverall) continue;

    const item = pickFromSlot(classItems, slot, profile, maxLevel);
    if (!item) continue;

    selected.push(item);
    selectedSlots.add(slot);
  }

  return selected;
}

function makeConfigForProfile(profile, randomize = true, fixedGender = "female") {
  const code = profile?.code || "SLAY";
  const base = ROLE_PRESETS[code] || ROLE_PRESETS.SLAY;
  const gender = fixedGender;

  return {
    skin: 2000,
    gender,
    hair: pick(HAIR_OPTIONS[gender]).id,
    face: pick(FACE_OPTIONS[gender]).id,
    emote: randomize ? pick(EMOTE_OPTIONS).id : base.emote,
  };
}

function makeFullyRandomConfig(fixedGender = "female") {
  const gender = fixedGender;
  return {
    skin: pick(SKIN_OPTIONS).id,
    gender,
    hair: pick(HAIR_OPTIONS[gender]).id,
    face: pick(FACE_OPTIONS[gender]).id,
    emote: pick(EMOTE_OPTIONS).id,
  };
}

function useGuidebookEquipmentPool() {
  const [state, setState] = useState(() => {
    const fallbackPool = buildFallbackPool();
    return {
      pool: fallbackPool,
      stats: getPoolStats(fallbackPool),
      loading: true,
      source: fallbackPool.source,
      error: "",
    };
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [itemsResponse, mapResponse] = await Promise.all([
          fetch(GUIDEBOOK_ITEMS_URL, { cache: "no-store" }),
          fetch(GUIDEBOOK_MSIO_MAP_URL, { cache: "no-store" }),
        ]);

        if (!itemsResponse.ok) throw new Error(`items.json HTTP ${itemsResponse.status}`);
        if (!mapResponse.ok) throw new Error(`character_item_id_map.csv HTTP ${mapResponse.status}`);

        const itemJson = await itemsResponse.json();
        const mapText = await mapResponse.text();
        const itemRows = Array.isArray(itemJson) ? itemJson : itemJson.items || itemJson.data || [];
        const msioMap = buildMsioMap(parseCsv(mapText));
        const pool = buildEquipmentPool(itemRows, msioMap);

        if (!cancelled) {
          setState({
            pool,
            stats: getPoolStats(pool),
            loading: false,
            source: pool.source,
            error: "",
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            loading: false,
            source: "fallback-seed",
            error: String(error?.message || error),
          }));
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

function getEquipmentIds(equipment) {
  return (equipment || [])
    .map((item) => item?.id)
    .filter((id) => Number.isFinite(Number(id)) && Number(id) > 0)
    .map(Number);
}

function getEquipmentSummary(equipment) {
  return (equipment || [])
    .map((item) => `${item.name} / ${item.className} / ${item.slot}${item.weaponType ? ` / ${item.weaponType}` : ""} / OSMS ${item.guidebookId} → MSIO ${item.id}`)
    .join("; ");
}

function buildCharacterItemIds(config, equipment) {
  return [
    Number(config.skin),
    CHARACTER_STYLE_ITEM,
    Number(config.hair),
    Number(config.face),
    ...getEquipmentIds(equipment),
  ].filter(Boolean);
}

function SelectField({ label, value, options, onChange }) {
  return (
    <label className="builder-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.id} value={option.id}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

export default function CharacterBuilder({ profile }) {
  const equipmentPoolState = useGuidebookEquipmentPool();
  const defaultConfig = useMemo(() => makeConfigForProfile(profile, true, "female"), [profile?.code]);
  const [config, setConfig] = useState(defaultConfig);
  const [equipment, setEquipment] = useState(() => makeEquipmentLoadout(profile, buildFallbackPool()));
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setConfig(defaultConfig);
    setEquipment(makeEquipmentLoadout(profile, equipmentPoolState.pool));
    setImageFailed(false);
  }, [defaultConfig, equipmentPoolState.pool, profile]);

  const characterItemIds = useMemo(
    () => buildCharacterItemIds(config, equipment),
    [config, equipment]
  );
  const imageUrl = useMemo(
    () => buildMapleStoryIoCharacterUrl({ config, equipment }),
    [config, equipment]
  );

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  const roleRule = getRoleRule(profile);
  const classGroup = getClassGroupForProfile(profile);
  const hairOptions = HAIR_OPTIONS[config.gender] || HAIR_OPTIONS.male;
  const faceOptions = FACE_OPTIONS[config.gender] || FACE_OPTIONS.male;
  const selectedEmote = getOption(EMOTE_OPTIONS, config.emote);
  const equipmentSummary = getEquipmentSummary(equipment);
  const poolSummary = getClassPoolSummary(equipmentPoolState.stats);

  function updateConfig(key, value) {
    setImageFailed(false);
    setConfig((prev) => {
      const next = { ...prev, [key]: value };

      if (key === "gender") {
        next.hair = pick(HAIR_OPTIONS[value]).id;
        next.face = pick(FACE_OPTIONS[value]).id;
      }

      return next;
    });
  }

  function randomizeForResult() {
    setImageFailed(false);
    setConfig(makeConfigForProfile(profile, true, config.gender));
    setEquipment(makeEquipmentLoadout(profile, equipmentPoolState.pool));
  }

  function resetRecommended() {
    setImageFailed(false);
    setConfig(makeConfigForProfile(profile, false, config.gender));
    setEquipment(makeEquipmentLoadout(profile, equipmentPoolState.pool, 40));
  }

  function randomizeAll() {
    setImageFailed(false);
    setConfig(makeFullyRandomConfig(config.gender));
    setEquipment(makeEquipmentLoadout(profile, equipmentPoolState.pool, 120));
  }

  return (
    <div className="character-builder msio-builder">
      <div className="character-preview-card">
        <div className="character-preview-bg" data-role={profile?.code || "MSCI"}>
          {!imageFailed ? (
            <img
              className="msio-character-img"
              src={imageUrl}
              alt="MapleStory.IO generated character preview"
              draggable="false"
              crossOrigin="anonymous"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="msio-error-card">
              <b>角色 API 暂时加载失败</b>
              <span>可以点随机重试，或稍后刷新。</span>
            </div>
          )}
        </div>
      </div>

      <details className="character-builder-controls" data-html2canvas-ignore="true">
        <summary className="builder-summary">
          <b>自定义 API 角色</b>
          <span>已折叠 · 装备按二转职业规则随机</span>
        </summary>

        <div className="builder-control-head">
          <b>角色外观</b>
          <div className="builder-button-row">
            <button type="button" className="ghost-btn small-btn" onClick={resetRecommended}>结果推荐</button>
            <button type="button" className="primary-btn small-btn" onClick={randomizeForResult}>本职业随机</button>
            <button type="button" className="ghost-btn small-btn" onClick={randomizeAll}>高等级随机</button>
          </div>
        </div>

        <div className="builder-grid">
          <SelectField label="性别" value={config.gender} options={GENDER_OPTIONS} onChange={(value) => updateConfig("gender", value)} />
          <SelectField label="皮肤" value={String(config.skin)} options={SKIN_OPTIONS} onChange={(value) => updateConfig("skin", Number(value))} />
          <SelectField label="发型" value={String(config.hair)} options={hairOptions} onChange={(value) => updateConfig("hair", Number(value))} />
          <SelectField label="脸型" value={String(config.face)} options={faceOptions} onChange={(value) => updateConfig("face", Number(value))} />
          <SelectField label="表情" value={config.emote} options={EMOTE_OPTIONS} onChange={(value) => updateConfig("emote", value)} />
        </div>

        <p className="builder-note">
          使用 MapleStory.IO GMS v83 API 实时生成；装备池从 guidebook `items.json` 全量读取 Equipment，并用 `character_item_id_map.csv` 把 OSMS ID/名称转成 MSIO 渲染 ID；二转规则：{roleRule.displayName}｜武器限制 {roleRule.weaponKinds.join(" / ")}{roleRule.allowShield ? "｜允许盾牌" : "｜不带盾牌"}；表情通过 legacy face entry `{Number(config.face)}:{normalizeLegacyFaceEmote(config.emote)}` 渲染；当前职业池：{CLASS_LABELS[classGroup]}；当前数据源：{equipmentPoolState.source}{equipmentPoolState.loading ? "（加载中）" : ""}{equipmentPoolState.error ? `（回退原因：${equipmentPoolState.error}）` : ""}；各职业可渲染/总装备：{poolSummary}；当前表情：{selectedEmote.label} / {selectedEmote.apiCode} / {normalizeLegacyFaceEmote(selectedEmote.id)}；Item IDs：{characterItemIds.join(", ")}；当前装备：{equipmentSummary}
        </p>
      </details>
    </div>
  );
}
