const GUIDEBOOK_DATA_BASE = "https://raw.githubusercontent.com/sduckyduck/osms-classic-guidebook/main/public/data";
const GUIDEBOOK_ITEMS_URL = `${GUIDEBOOK_DATA_BASE}/items.json`;
const GUIDEBOOK_MSIO_MAP_URL = `${GUIDEBOOK_DATA_BASE}/character_item_id_map.csv`;
const LEGACY_CHARACTER_MARKER = "maplestory.io/api/GMS/83/Character/";

const ROLE_COLORS = {
  SLAY: "#b94a48",
  SHLD: "#8b6f47",
  POLE: "#536f9f",
  ZAPZ: "#4e88c7",
  TOXI: "#8b5aa8",
  HEAL: "#67a878",
  STAR: "#6c5f99",
  STAB: "#5f6b78",
  KITE: "#6f9f6a",
  SNIP: "#4f7f73",
};

const ROLE_RULES = {
  SLAY: { classGroup: "warrior", weaponKinds: ["2h-sword"], allowShield: false, slots: ["Hat", "Top", "Bottom", "Shoes", "Glove", "Cape", "Weapon"] },
  SHLD: { classGroup: "warrior", weaponKinds: ["1h-sword", "1h-axe", "1h-blunt"], allowShield: true, slots: ["Hat", "Top", "Bottom", "Shoes", "Glove", "Cape", "Weapon", "Shield"] },
  POLE: { classGroup: "warrior", weaponKinds: ["spear", "pole-arm"], allowShield: false, slots: ["Hat", "Top", "Bottom", "Shoes", "Glove", "Cape", "Weapon"] },
  ZAPZ: { classGroup: "magician", weaponKinds: ["wand", "staff"], allowShield: false, slots: ["Hat", "Overall", "Top", "Bottom", "Shoes", "Glove", "Cape", "Earring", "Weapon"] },
  TOXI: { classGroup: "magician", weaponKinds: ["wand", "staff"], allowShield: false, slots: ["Hat", "Overall", "Top", "Bottom", "Shoes", "Glove", "Cape", "Earring", "Weapon"] },
  HEAL: { classGroup: "magician", weaponKinds: ["wand", "staff"], allowShield: false, slots: ["Hat", "Overall", "Top", "Bottom", "Shoes", "Glove", "Cape", "Earring", "Weapon"] },
  STAR: { classGroup: "thief", weaponKinds: ["claw"], allowShield: false, slots: ["Hat", "Top", "Bottom", "Shoes", "Glove", "Cape", "Earring", "Weapon"] },
  STAB: { classGroup: "thief", weaponKinds: ["dagger"], allowShield: true, slots: ["Hat", "Top", "Bottom", "Shoes", "Glove", "Cape", "Earring", "Weapon", "Shield"] },
  KITE: { classGroup: "archer", weaponKinds: ["bow"], allowShield: false, slots: ["Hat", "Overall", "Top", "Bottom", "Shoes", "Glove", "Cape", "Earring", "Weapon"] },
  SNIP: { classGroup: "archer", weaponKinds: ["crossbow"], allowShield: false, slots: ["Hat", "Overall", "Top", "Bottom", "Shoes", "Glove", "Cape", "Earring", "Weapon"] },
};

const VISUAL_SLOTS = new Set(["Hat", "Overall", "Top", "Bottom", "Shoes", "Glove", "Cape", "Earring", "Shield", "Weapon"]);
const BODY_SLOTS = new Set(["Overall", "Top", "Bottom"]);
const WEAPON_PREFIXES = ["130", "131", "132", "133", "137", "138", "140", "141", "142", "143", "144", "145", "146", "147"];
const TWO_HANDED_WEAPON_PREFIXES = ["138", "140", "141", "142", "143", "144", "145", "146"];

let equipmentDataPromise = null;
let equipmentData = null;

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
  return slot || "Unknown";
}

function makeRecord(item, msioMap) {
  const guidebookId = toNumber(item?.id, null);
  const name = String(item?.name || "").trim();
  if (!guidebookId || !name || item?.category !== "Equipment") return null;

  const mappedId = msioMap.bySourceId.get(String(guidebookId)) || msioMap.bySourceName.get(normalizeName(name)) || null;
  const id = mappedId || guidebookId;

  return {
    id,
    guidebookId,
    name,
    className: item.req_job_label || item.requiredJob || item.requiredJobs?.join("/") || "",
    slot: normalizeSlot(item.sub_category),
    reqLevel: toNumber(item.stats?.reqLevel ?? item.reqLevel ?? item.requiredLevel, 0),
    weaponType: item.weapon_type || item.weaponType || "",
    msioMapped: Boolean(mappedId),
  };
}

function labelMatchesClassOnly(label, classGroup) {
  const value = String(label || "").toLowerCase();
  if (!value || value === "all" || value.includes("common") || value.includes("beginner")) return false;
  if (classGroup === "warrior") return value.includes("warrior");
  if (classGroup === "magician") return value.includes("magician") || value.includes("mage");
  if (classGroup === "archer") return value.includes("archer") || value.includes("bowman");
  if (classGroup === "thief") return value.includes("thief") || value.includes("rogue");
  return false;
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

function itemAllowedForRole(item, roleCode) {
  const rule = ROLE_RULES[roleCode];
  if (!rule || !item || !VISUAL_SLOTS.has(item.slot)) return false;
  if (!labelMatchesClassOnly(item.className, rule.classGroup)) return false;
  if (item.slot === "Shield") return Boolean(rule.allowShield);
  if (item.slot !== "Weapon") return true;
  return (rule.weaponKinds || []).some((kind) => weaponMatchesKind(item, kind));
}

function compareGear(a, b) {
  const levelA = toNumber(a.reqLevel, 0);
  const levelB = toNumber(b.reqLevel, 0);
  if (levelA !== levelB) return levelA - levelB;
  return String(a.name).localeCompare(String(b.name));
}

function buildData(records) {
  const byId = new Map();
  const byRoleSlot = new Map();

  for (const item of records) {
    byId.set(String(item.id), item);
    byId.set(String(item.guidebookId), item);
  }

  for (const roleCode of Object.keys(ROLE_RULES)) {
    const roleMap = new Map();
    const candidates = records
      .filter((item) => item.msioMapped || item.id === item.guidebookId)
      .filter((item) => itemAllowedForRole(item, roleCode))
      .filter((item) => toNumber(item.reqLevel, 0) <= 60)
      .sort(compareGear);

    for (const item of candidates) {
      if (!roleMap.has(item.slot)) roleMap.set(item.slot, []);
      roleMap.get(item.slot).push(item);
    }

    byRoleSlot.set(roleCode, roleMap);
  }

  return { byId, byRoleSlot };
}

async function loadEquipmentData() {
  if (equipmentData) return equipmentData;
  if (!equipmentDataPromise) {
    equipmentDataPromise = Promise.all([
      fetch(GUIDEBOOK_ITEMS_URL, { cache: "no-store" }).then((res) => res.json()),
      fetch(GUIDEBOOK_MSIO_MAP_URL, { cache: "no-store" }).then((res) => res.text()),
    ]).then(([itemJson, mapText]) => {
      const rows = Array.isArray(itemJson) ? itemJson : itemJson.items || itemJson.data || [];
      const msioMap = buildMsioMap(parseCsv(mapText));
      const records = rows.map((item) => makeRecord(item, msioMap)).filter(Boolean);
      equipmentData = buildData(records);
      return equipmentData;
    });
  }
  return equipmentDataPromise;
}

function getRoleCodeFromImage(img) {
  const fromBox = img?.closest?.(".character-preview-bg")?.getAttribute?.("data-role");
  if (fromBox) return fromBox;
  try {
    return (new URL(img.src, window.location.href).searchParams.get("msciAction") || "").split("-")[0] || "";
  } catch {
    return "";
  }
}

function applyRoleColor(img, roleCode) {
  const color = ROLE_COLORS[roleCode];
  const box = img?.closest?.(".character-preview-bg");
  if (!box || !color) return;

  box.dataset.msciRoleColor = roleCode;
  box.style.background = color;
  box.style.backgroundColor = color;
  box.style.backgroundImage = "none";
}

function parseLegacyUrl(src) {
  const raw = String(src || "").replace(/%2C/gi, ",").replace(/%3A/gi, ":");
  if (!raw.includes(LEGACY_CHARACTER_MARKER)) return null;

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
    characterIndex,
    itemIndex: characterIndex + 2,
    actionIndex: characterIndex + 3,
    frameIndex: characterIndex + 4,
  };
}

function getItemId(entry) {
  return String(entry || "").split(":")[0].trim();
}

function isBaseAppearance(entry) {
  const id = Number(getItemId(entry));
  return Number.isFinite(id) && id >= 20000 && id < 50000;
}

function itemAlreadySelected(selected, item) {
  return selected.some((entry) => getItemId(entry) === String(item.id));
}

function selectedSlots(selected, data) {
  const slots = new Set();
  for (const entry of selected) {
    const item = data.byId.get(getItemId(entry));
    if (item?.slot) slots.add(item.slot);
  }
  return slots;
}

function pickSlot(data, roleCode, slot, selected) {
  const candidates = data.byRoleSlot.get(roleCode)?.get(slot) || [];
  return candidates.find((item) => !itemAlreadySelected(selected, item)) || candidates[0] || null;
}

function addItem(selected, item) {
  if (item && !itemAlreadySelected(selected, item)) selected.push(String(item.id));
}

function hasBody(selected, data) {
  return [...selectedSlots(selected, data)].some((slot) => BODY_SLOTS.has(slot));
}

function ensureBodyGear(selected, data, roleCode) {
  const slots = selectedSlots(selected, data);
  if (slots.has("Overall")) return;

  const overall = pickSlot(data, roleCode, "Overall", selected);
  const top = pickSlot(data, roleCode, "Top", selected);
  const bottom = pickSlot(data, roleCode, "Bottom", selected);

  if (!hasBody(selected, data) && overall) {
    addItem(selected, overall);
    return;
  }

  if (!slots.has("Top")) addItem(selected, top);
  if (!slots.has("Bottom")) addItem(selected, bottom);
}

function getWeaponId(selected) {
  return selected.map(getItemId).find((id) => WEAPON_PREFIXES.some((prefix) => id.startsWith(prefix))) || "";
}

function getStandingAction(selected) {
  const weaponId = getWeaponId(selected);
  return TWO_HANDED_WEAPON_PREFIXES.some((prefix) => weaponId.startsWith(prefix)) ? "stand2" : "stand1";
}

function filterUrlToClassGear(src, roleCode, data) {
  const parsed = parseLegacyUrl(src);
  if (!parsed || !ROLE_RULES[roleCode]) return src;

  const rawItems = parsed.parts[parsed.itemIndex]
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const selected = [];
  for (const entry of rawItems) {
    if (isBaseAppearance(entry)) {
      selected.push(entry);
      continue;
    }

    const item = data.byId.get(getItemId(entry));
    if (itemAllowedForRole(item, roleCode)) selected.push(String(item.id));
  }

  const rule = ROLE_RULES[roleCode];
  ensureBodyGear(selected, data, roleCode);
  for (const slot of rule.slots) {
    if (slot === "Overall" || slot === "Top" || slot === "Bottom") continue;
    const slots = selectedSlots(selected, data);
    if (!slots.has(slot)) addItem(selected, pickSlot(data, roleCode, slot, selected));
  }

  parsed.parts[parsed.itemIndex] = selected.join(",");
  const action = getStandingAction(selected);
  parsed.parts[parsed.actionIndex] = action;
  parsed.url.pathname = parsed.parts.join("/");
  parsed.url.searchParams.set("msciClassGear", "1");
  parsed.url.searchParams.set("msciAction", `${roleCode}-${action}-classgear`);

  return parsed.url.toString().replace(/%2C/gi, ",").replace(/%3A/gi, ":");
}

async function fixImage(img) {
  if (!img?.src) return;
  const roleCode = getRoleCodeFromImage(img);
  applyRoleColor(img, roleCode);
  if (!ROLE_RULES[roleCode]) return;

  let url;
  try {
    url = new URL(img.src, window.location.href);
    if (url.searchParams.get("msciClassGear") === "1") return;
  } catch {
    return;
  }

  try {
    const data = await loadEquipmentData();
    const nextSrc = filterUrlToClassGear(img.src, roleCode, data);
    if (nextSrc !== img.src) img.src = nextSrc;
  } catch (error) {
    console.warn("MSCI class gear filter failed:", error);
  }
}

function fixAllImages(root = document) {
  root.querySelectorAll?.("img.msio-character-img").forEach((img) => fixImage(img));
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  fixAllImages();

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "attributes" && mutation.attributeName === "src") {
        fixImage(mutation.target);
        continue;
      }
      for (const node of mutation.addedNodes || []) {
        if (node?.matches?.("img.msio-character-img")) fixImage(node);
        fixAllImages(node);
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
