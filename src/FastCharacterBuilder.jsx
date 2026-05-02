import { useEffect, useMemo, useState } from "react";

const MS_REGION = "GMS";
const MS_VERSION = "83";
const DEFAULT_ACTION = "stand1";
const BUILD_LABEL = "HAIR FACE CLASS ONLY v5";
const DATA_CACHE_BUSTER = "hair-face-class-only-v5-20260502";
const GUIDEBOOK_DATA_BASE = "https://raw.githubusercontent.com/sduckyduck/osms-classic-guidebook/main/public/data";
const GUIDEBOOK_ITEMS_URL = `${GUIDEBOOK_DATA_BASE}/items.json?v=${DATA_CACHE_BUSTER}`;
const GUIDEBOOK_MSIO_MAP_URL = `${GUIDEBOOK_DATA_BASE}/character_item_id_map.csv?v=${DATA_CACHE_BUSTER}`;

const VISUAL_SLOTS = new Set(["Hat", "Overall", "Top", "Bottom", "Shoes", "Glove", "Cape", "Earring", "Shield", "Weapon"]);
const TWO_HAND_WEAPON_PREFIXES = ["140", "141", "142", "143", "144", "146"];
const CLASS_GROUPS = ["warrior", "magician", "archer", "thief"];

const SKIN_OPTIONS = [
  { id: 2000, label: "Normal" },
  { id: 2001, label: "Light" },
  { id: 2002, label: "Warm" },
  { id: 2003, label: "Tan" },
];

const HAIR_OPTIONS = {
  male: [
    { id: 30000, label: "Toben Hair" },
    { id: 30010, label: "Zeta" },
    { id: 30020, label: "Unkempt Hair" },
    { id: 30030, label: "Shaved Hair" },
    { id: 30040, label: "Rockstar" },
    { id: 30050, label: "Metro" },
    { id: 30060, label: "Catalyst" },
    { id: 30070, label: "All Back" },
    { id: 30080, label: "Military Buzzcut" },
    { id: 30090, label: "Mohawk" },
    { id: 30100, label: "Fireball" },
    { id: 30110, label: "Vincent" },
    { id: 30120, label: "Antagonist" },
    { id: 30130, label: "Topknot" },
    { id: 30140, label: "Medium Cornrows" },
    { id: 30150, label: "Trip Scratch" },
    { id: 30160, label: "Line Scratch Hair" },
    { id: 30170, label: "Mane" },
    { id: 30180, label: "Bowl Cut" },
    { id: 30190, label: "Wind" },
    { id: 30200, label: "Shaggy Wax" },
    { id: 30210, label: "Grooovy Do" },
    { id: 30220, label: "Foil Perm" },
    { id: 30230, label: "Chestnut" },
    { id: 30240, label: "Afro" },
    { id: 30250, label: "Caspia Hair" },
    { id: 30260, label: "with Bald Spot" },
    { id: 30270, label: "Mohecan Shaggy Do" },
    { id: 30280, label: "Old Man 'Do" },
    { id: 30290, label: "Romance" },
    { id: 30300, label: "Acorn" },
    { id: 30310, label: "Close-Cropped Afro" },
    { id: 30320, label: "Cabana Boy Hair" },
    { id: 30330, label: "Tristan Hair" },
    { id: 30340, label: "Astro" },
    { id: 30350, label: "Spiky Tail" },
    { id: 30360, label: "Shaggy Dragon" },
    { id: 30370, label: "Dragon Layered Hair" },
    { id: 30380, label: "Tribal Buzz" },
  ],
  female: [
    { id: 31000, label: "Cutie Hair" },
    { id: 31010, label: "Veronica" },
    { id: 31020, label: "Francesca" },
    { id: 31030, label: "Polly" },
    { id: 31040, label: "Edgy" },
    { id: 31050, label: "Rockstar Hair" },
    { id: 31060, label: "Annie" },
    { id: 31070, label: "Stella" },
    { id: 31080, label: "Parted Pomp" },
    { id: 31090, label: "Bridget" },
    { id: 31100, label: "Mary Hair" },
    { id: 31110, label: "Monica Hair" },
    { id: 31120, label: "Miru Hair" },
    { id: 31130, label: "Jolie" },
    { id: 31140, label: "Pei Pei" },
    { id: 31150, label: "Angelica Hair" },
    { id: 31160, label: "Lori" },
    { id: 31170, label: "Rastafari Hair" },
    { id: 31180, label: "Cutie Hair" },
    { id: 31190, label: "Celeb Hair" },
    { id: 31200, label: "Holla' Back Do" },
    { id: 31210, label: "Perfect Stranger" },
    { id: 31220, label: "Caspia Hair" },
    { id: 31230, label: "Rose" },
    { id: 31240, label: "Disheveled" },
    { id: 31250, label: "Bowlcut" },
    { id: 31260, label: "Daisy Do Hair" },
    { id: 31270, label: "Pigtails" },
    { id: 31280, label: "Ellie" },
    { id: 31290, label: "Naomi" },
    { id: 31300, label: "Chantelle Hair" },
    { id: 31310, label: "Carla" },
    { id: 31320, label: "Roxy" },
    { id: 31330, label: "Penelope Hair" },
    { id: 31340, label: "Rae" },
    { id: 31350, label: "Fourtail Braids" },
    { id: 31360, label: "Swooshy Ponytail Hair" },
    { id: 31370, label: "Stylish Burst Hair" },
    { id: 31380, label: "Boyish" },
  ],
};

const FACE_OPTIONS = {
  male: [
    { id: 20000, label: "Defiant Face" },
    { id: 20001, label: "Confident Face" },
    { id: 20002, label: "Prudent Face" },
    { id: 20003, label: "Dramatic Face" },
    { id: 20004, label: "Rebel's Fire" },
    { id: 20005, label: "Alert Face" },
    { id: 20006, label: "Babyface Pout" },
    { id: 20007, label: "Sad Innocence" },
    { id: 20008, label: "Worrisome Glare" },
    { id: 20009, label: "Smart Aleck" },
    { id: 20010, label: "Wisdom Glance" },
    { id: 20011, label: "Cool Guy Gaze" },
    { id: 20012, label: "Curious Dog" },
    { id: 20013, label: "Insomniac Daze" },
    { id: 20014, label: "Look of Wonder" },
  ],
  female: [
    { id: 21000, label: "Defiant Face" },
    { id: 21001, label: "Prudent Face" },
    { id: 21002, label: "Intelligent Face" },
    { id: 21003, label: "Strong Stare" },
    { id: 21004, label: "Angel Glow" },
    { id: 21005, label: "Babyface Pout" },
    { id: 21006, label: "Pucker Up Face" },
    { id: 21007, label: "Dollface Look" },
    { id: 21008, label: "Hopeless Gaze" },
    { id: 21009, label: "Look of Death" },
    { id: 21010, label: "Wisdom Glance" },
    { id: 21011, label: "Hypnotized Look" },
    { id: 21012, label: "Soul's Window" },
    { id: 21013, label: "Wide-eyed Girl" },
    { id: 21014, label: "Curious Look" },
  ],
};

const GENDER_OPTIONS = [
  { id: "male", label: "男" },
  { id: "female", label: "女" },
];

const EMOTES = ["default", "wink", "smile", "angry", "blink", "bewildered"];

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
};

let equipmentDataPromise = null;
let equipmentDataCache = null;

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
  const slot = item?.slot || "";

  if (slot === "Top") {
    if (id.startsWith("1040")) return "male";
    if (id.startsWith("1041")) return "female";
  }

  if (slot === "Bottom") {
    if (id.startsWith("1060")) return "male";
    if (id.startsWith("1061")) return "female";
  }

  if (slot === "Overall") {
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

  return groups;
}

function isUniversalClassLabel(label) {
  const value = String(label || "").trim().toLowerCase();
  if (!value) return true;
  if (value === "all" || value === "common" || value === "beginner") return true;
  if (value.includes("all classes") || value.includes("common") || value.includes("beginner")) return true;
  return CLASS_GROUPS.every((group) => classGroupsFromLabel(value).has(group));
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
  return false;
}

function itemAllowed(item, roleCode, gender) {
  const rule = ROLE_RULES[roleCode] || ROLE_RULES.SLAY;
  if (!item || !VISUAL_SLOTS.has(item.slot)) return false;
  if (!itemMatchesGender(item, gender)) return false;

  if (item.slot === "Weapon") {
    return (rule.weaponKinds || []).some((kind) => weaponMatchesKind(item, kind));
  }

  if (item.slot === "Shield") {
    return Boolean(rule.allowShield) && itemIsStrictClassEquipment(item, rule.classGroup);
  }

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

  if (!levels.length) return null;
  return randomItem(levels);
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

function buildMapleStoryIoCharacterUrl(config) {
  const faceEmote = normalizeLegacyFaceEmote(config.emote);
  const entries = [
    Number(config.hair),
    `${Number(config.face)}:${faceEmote}`,
    ...(config.equipment || []).map(Number),
  ].filter(Boolean);

  const itemPath = encodeURIComponent(entries.join(","));
  const action = encodeURIComponent(config.action || DEFAULT_ACTION);
  const skin = Number(config.skin) || 2000;

  return `https://maplestory.io/api/${MS_REGION}/${MS_VERSION}/Character/${skin}/${itemPath}/${action}/0?resize=3&renderMode=Full&bgColor=0,0,0,0&faceEmote=${encodeURIComponent(faceEmote)}`;
}

function actionForEquipment(roleCode, equipmentIds) {
  if (["KITE", "ZAPZ", "TOXI", "HEAL", "STAR", "STAB", "SHLD"].includes(roleCode)) return "stand1";
  if (roleCode === "SNIP") return "stand2";

  const weaponId = String((equipmentIds || []).find((id) => String(id).startsWith("1")) || "");
  return TWO_HAND_WEAPON_PREFIXES.some((prefix) => weaponId.startsWith(prefix)) ? "stand2" : "stand1";
}

function makeCharacterConfig({ roleCode, gender, equipmentData, loadoutTick }) {
  const preset = ROLE_PRESETS[roleCode] || ROLE_PRESETS.SLAY;
  const equipment = equipmentData
    ? makeRandomLoadout(equipmentData, roleCode, gender)
    : FALLBACK_EQUIPMENT[roleCode] || FALLBACK_EQUIPMENT.SLAY;

  return {
    skin: randomItem(SKIN_OPTIONS)?.id || 2000,
    hair: randomItem(HAIR_OPTIONS[gender])?.id || HAIR_OPTIONS.female[0].id,
    face: randomItem(FACE_OPTIONS[gender])?.id || FACE_OPTIONS.female[0].id,
    emote: loadoutTick === 0 ? preset.emote : randomItem(EMOTES),
    equipment,
    action: actionForEquipment(roleCode, equipment),
  };
}

function FastCharacterBuilder({ profile }) {
  const roleCode = normalizeRoleCode(profile);
  const preset = ROLE_PRESETS[roleCode] || ROLE_PRESETS.SLAY;
  const [gender, setGender] = useState("female");
  const [equipmentData, setEquipmentData] = useState(equipmentDataCache);
  const [loadoutTick, setLoadoutTick] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [loadError, setLoadError] = useState("");

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
        if (!cancelled) setLoadError(String(error?.message || error));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const config = useMemo(
    () => makeCharacterConfig({ roleCode, gender, equipmentData, loadoutTick }),
    [roleCode, gender, equipmentData, loadoutTick]
  );

  const imageSrc = useMemo(() => buildMapleStoryIoCharacterUrl(config), [config]);
  const poolCount = equipmentData?.records?.filter((item) => itemAllowed(item, roleCode, gender)).length || 0;
  const hairCount = HAIR_OPTIONS[gender]?.length || 0;
  const faceCount = FACE_OPTIONS[gender]?.length || 0;

  function updateGender(nextGender) {
    setGender(nextGender);
    setLoadoutTick((value) => value + 1);
    setImageError(false);
  }

  function randomizePreview() {
    setLoadoutTick((value) => value + 1);
    setImageError(false);
  }

  return (
    <div className="character-builder" data-role={roleCode}>
      <div className="character-preview-card">
        <div className="character-preview-bg" data-role={roleCode}>
          {imageError ? (
            <div className="msio-error-card">
              <b>角色图暂时加载失败</b>
              <span>MapleStory.io 偶尔会慢，刷新或点随机通常可以恢复。</span>
            </div>
          ) : (
            <img
              key={imageSrc}
              className="msio-character-img"
              src={imageSrc}
              alt={`${profile?.personaName || preset.label} 角色预览`}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              onError={() => setImageError(true)}
            />
          )}
        </div>
      </div>

      <details className="character-builder-controls">
        <summary className="builder-summary">
          <b>角色预览</b>
          <span>
            {preset.label} · {gender === "female" ? "女" : "男"} · {hairCount} 发型 / {faceCount} 脸型 · {equipmentData ? `${poolCount} 件职业专属可随机` : "职业装备池加载中"} · {BUILD_LABEL}
          </span>
        </summary>

        <div className="builder-control-head">
          <b>显示设置</b>
          <div className="builder-button-row">
            <button type="button" className="ghost-btn small-btn" onClick={randomizePreview}>
              随机发型脸型和职业装备
            </button>
          </div>
        </div>

        <div className="builder-grid">
          <label className="builder-field">
            <span>性别</span>
            <select value={gender} onChange={(event) => updateGender(event.target.value)}>
              {GENDER_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>

        {loadError && <p className="builder-note">装备池加载失败，当前使用职业 fallback：{loadError}</p>}
      </details>
    </div>
  );
}

export default FastCharacterBuilder;
