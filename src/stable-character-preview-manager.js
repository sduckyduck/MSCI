const MSCI_DATA_BASE = "https://raw.githubusercontent.com/sduckyduck/osms-classic-guidebook/main/public/data";
const MSCI_ITEMS_URL = `${MSCI_DATA_BASE}/items.json`;
const MSCI_MAP_URL = `${MSCI_DATA_BASE}/character_item_id_map.csv`;
const MSCI_CHARACTER_MARKER = "maplestory.io/api/GMS/83/Character/";
const MSCI_SET_VERSION = "3";

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

const VISUAL_SLOTS = new Set(["Hat", "Overall", "Top", "Bottom", "Shoes", "Glove", "Cape", "Earring", "Shield", "Weapon"]);
const BODY_SLOTS = new Set(["Overall", "Top", "Bottom"]);
const EQUIP_PREFIXES = ["100", "101", "102", "103", "104", "105", "106", "107", "108", "109", "110", "111", "112", "130", "131", "132", "133", "137", "138", "140", "141", "142", "143", "144", "145", "146", "147"];
const WEAPON_PREFIXES = ["130", "131", "132", "133", "137", "138", "140", "141", "142", "143", "144", "145", "146", "147"];
const TWO_HAND_PREFIXES = ["140", "141", "142", "143", "144", "146"];
const SET_MATCH_CHANCE = 0.86;

let dataPromise = null;
let equipmentData = null;
let observer = null;
const pendingImages = new Set();
let flushScheduled = false;
let isApplyingSrc = false;

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

function num(value, fallback = null) {
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
    const sourceId = num(row.osms_item_id ?? row.source_item_id ?? row.item_id ?? row.id, null);
    const msioId = num(row.msio_item_id ?? row.mapped_item_id ?? row.target_item_id ?? row.msio_id, null);
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

function makeRecord(item, msioMap) {
  const guidebookId = num(item?.id, null);
  const name = String(item?.name || "").trim();
  if (!guidebookId || !name || item?.category !== "Equipment") return null;

  const mappedId = msioMap.bySourceId.get(String(guidebookId)) || msioMap.bySourceName.get(normalizeName(name)) || null;
  const record = {
    id: mappedId || guidebookId,
    guidebookId,
    name,
    className: item.req_job_label || item.requiredJob || item.requiredJobs?.join("/") || "All",
    slot: normalizeSlot(item.sub_category),
    reqLevel: num(item.stats?.reqLevel ?? item.reqLevel ?? item.requiredLevel, 0),
    weaponType: item.weapon_type || item.weaponType || "",
    msioMapped: Boolean(mappedId),
  };

  record.gender = inferItemGender(record);
  return record;
}

async function loadData() {
  if (equipmentData) return equipmentData;
  if (!dataPromise) {
    dataPromise = Promise.all([
      fetch(MSCI_ITEMS_URL, { cache: "force-cache" }).then((res) => res.json()),
      fetch(MSCI_MAP_URL, { cache: "force-cache" }).then((res) => res.text()),
    ]).then(([itemJson, mapText]) => {
      const rows = Array.isArray(itemJson) ? itemJson : itemJson.items || itemJson.data || [];
      const msioMap = buildMsioMap(parseCsv(mapText));
      const records = rows.map((item) => makeRecord(item, msioMap)).filter(Boolean);
      const byId = new Map();
      for (const item of records) {
        byId.set(String(item.id), item);
        byId.set(String(item.guidebookId), item);
      }
      equipmentData = { records, byId };
      return equipmentData;
    });
  }
  return dataPromise;
}

function getItemId(entry) {
  return String(entry || "").split(":")[0].trim();
}

function hasPrefix(entry, prefixes) {
  const id = getItemId(entry);
  return prefixes.some((prefix) => id.startsWith(prefix));
}

function isEquipmentEntry(entry) {
  return hasPrefix(entry, EQUIP_PREFIXES);
}

function parseCharacterUrl(src) {
  const raw = String(src || "").replace(/%2C/gi, ",").replace(/%3A/gi, ":");
  if (!raw.includes(MSCI_CHARACTER_MARKER)) return null;

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

function getRoleFromUrl(src) {
  try {
    const url = new URL(src, window.location.href);
    return (url.searchParams.get("msciAction") || "").split("-")[0] || "";
  } catch {
    return "";
  }
}

function getRole(img, src) {
  return img?.closest?.(".character-preview-bg")?.getAttribute?.("data-role") || getRoleFromUrl(src) || "";
}

function inferGender(items) {
  const ids = items.map(getItemId);
  if (ids.some((id) => id.startsWith("31") || id.startsWith("21"))) return "female";
  if (ids.some((id) => id.startsWith("30") || id.startsWith("20"))) return "male";
  return "female";
}

function labelSupportsClass(label, classGroup) {
  const value = String(label || "").toLowerCase();
  if (!value || value === "all" || value.includes("common") || value.includes("beginner")) return true;
  if (classGroup === "warrior") return value.includes("warrior");
  if (classGroup === "magician") return value.includes("magician") || value.includes("mage");
  if (classGroup === "archer") return value.includes("archer") || value.includes("bowman");
  if (classGroup === "thief") return value.includes("thief") || value.includes("rogue");
  return false;
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
  const rule = ROLE_RULES[roleCode];
  if (!rule || !item || !VISUAL_SLOTS.has(item.slot)) return false;
  if (!itemMatchesGender(item, gender)) return false;
  if (!labelSupportsClass(item.className, rule.classGroup)) return false;
  if (item.slot === "Shield") return Boolean(rule.allowShield);
  if (item.slot !== "Weapon") return true;
  return (rule.weaponKinds || []).some((kind) => weaponMatchesKind(item, kind));
}

function pick(items) {
  if (!items?.length) return null;
  return items[Math.floor(Math.random() * items.length)];
}

function buildCandidates(data, roleCode, gender) {
  const bySlot = new Map();

  for (const item of data.records) {
    if (!item.msioMapped && item.id !== item.guidebookId) continue;
    if (num(item.reqLevel, 0) > 60) continue;
    if (!itemAllowed(item, roleCode, gender)) continue;
    if (!bySlot.has(item.slot)) bySlot.set(item.slot, []);
    bySlot.get(item.slot).push(item);
  }

  for (const items of bySlot.values()) {
    items.sort((a, b) => num(a.reqLevel, 0) - num(b.reqLevel, 0) || String(a.name).localeCompare(String(b.name)));
  }

  return bySlot;
}

function scoreLevel(level, bySlot, rule) {
  const presentSlots = new Set();
  for (const slot of rule.slots) {
    const items = bySlot.get(slot) || [];
    if (items.some((item) => num(item.reqLevel, 0) === level)) presentSlots.add(slot);
  }

  const bodyScore = presentSlots.has("Overall") || (presentSlots.has("Top") && presentSlots.has("Bottom")) ? 2 : 0;
  const weaponScore = presentSlots.has("Weapon") ? 2 : 0;
  const coreScore = ["Hat", "Shoes", "Glove"].filter((slot) => presentSlots.has(slot)).length;
  return bodyScore + weaponScore + coreScore + presentSlots.size * 0.2;
}

function pickTargetLevel(bySlot, rule) {
  const levels = new Set();
  for (const slot of rule.slots) {
    for (const item of bySlot.get(slot) || []) {
      const level = num(item.reqLevel, 0);
      if (level > 0 && level <= 60) levels.add(level);
    }
  }

  const weighted = [...levels]
    .map((level) => ({ level, score: scoreLevel(level, bySlot, rule) }))
    .filter((row) => row.score >= 2);

  if (!weighted.length) return 30;

  const total = weighted.reduce((sum, row) => sum + row.score * row.score, 0);
  let roll = Math.random() * total;
  for (const row of weighted) {
    roll -= row.score * row.score;
    if (roll <= 0) return row.level;
  }
  return weighted[weighted.length - 1].level;
}

function pickSlotItem(bySlot, slot, targetLevel, selectedIds, preferSet = true) {
  const all = (bySlot.get(slot) || []).filter((item) => !selectedIds.has(String(item.id)));
  if (!all.length) return null;

  const exact = all.filter((item) => num(item.reqLevel, 0) === targetLevel);
  const nearby = all.filter((item) => Math.abs(num(item.reqLevel, 0) - targetLevel) <= 5);
  const sameBand = all.filter((item) => Math.abs(num(item.reqLevel, 0) - targetLevel) <= 10);

  if (preferSet && exact.length && Math.random() < SET_MATCH_CHANCE) return pick(exact);
  if (nearby.length && Math.random() < 0.65) return pick(nearby);
  if (sameBand.length && Math.random() < 0.75) return pick(sameBand);
  return pick(all);
}

function weaponKind(item) {
  if (!item) return "";
  if (weaponMatchesKind(item, "wand")) return "wand";
  if (weaponMatchesKind(item, "staff")) return "staff";
  return "";
}

function makeLoadout(data, roleCode, gender) {
  const rule = ROLE_RULES[roleCode];
  const bySlot = buildCandidates(data, roleCode, gender);
  const targetLevel = pickTargetLevel(bySlot, rule);
  const selected = [];
  const selectedIds = new Set();

  function add(item) {
    if (!item || selectedIds.has(String(item.id))) return null;
    selected.push(item);
    selectedIds.add(String(item.id));
    return item;
  }

  const weapon = add(pickSlotItem(bySlot, "Weapon", targetLevel, selectedIds, true));
  const currentWeaponKind = weaponKind(weapon);

  const overallExact = (bySlot.get("Overall") || []).some((item) => num(item.reqLevel, 0) === targetLevel);
  const topExact = (bySlot.get("Top") || []).some((item) => num(item.reqLevel, 0) === targetLevel);
  const bottomExact = (bySlot.get("Bottom") || []).some((item) => num(item.reqLevel, 0) === targetLevel);
  const useOverall = overallExact && (!topExact || !bottomExact || Math.random() < 0.58);

  if (rule.slots.includes("Overall") && useOverall) {
    add(pickSlotItem(bySlot, "Overall", targetLevel, selectedIds, true));
  } else {
    if (rule.slots.includes("Top")) add(pickSlotItem(bySlot, "Top", targetLevel, selectedIds, true));
    if (rule.slots.includes("Bottom")) add(pickSlotItem(bySlot, "Bottom", targetLevel, selectedIds, true));
  }

  for (const slot of rule.slots) {
    if (slot === "Weapon" || slot === "Overall" || slot === "Top" || slot === "Bottom" || slot === "Shield") continue;
    add(pickSlotItem(bySlot, slot, targetLevel, selectedIds, true));
  }

  if (rule.allowShield) {
    const isMage = roleCode === "ZAPZ" || roleCode === "TOXI" || roleCode === "HEAL";
    const shieldAllowed = isMage ? currentWeaponKind === "wand" : true;
    if (shieldAllowed && Math.random() < 0.85) add(pickSlotItem(bySlot, "Shield", targetLevel, selectedIds, false));
  }

  return { items: selected, targetLevel };
}

function actionForLoadout(roleCode, loadoutItems) {
  if (roleCode === "KITE") return "stand1";
  if (roleCode === "SNIP") return "stand2";
  if (roleCode === "ZAPZ" || roleCode === "TOXI" || roleCode === "HEAL") return "stand1";

  const weaponId = String(loadoutItems.find((item) => item.slot === "Weapon")?.id || "");
  return TWO_HAND_PREFIXES.some((prefix) => weaponId.startsWith(prefix)) ? "stand2" : "stand1";
}

function currentGearIsValid(items, data, roleCode, gender) {
  const records = items
    .map((entry) => data.byId.get(getItemId(entry)))
    .filter(Boolean);

  if (!records.length) return false;
  return records.every((item) => itemAllowed(item, roleCode, gender));
}

function buildStableUrl(src, img, force = false) {
  const data = equipmentData;
  if (!data) return src;

  const parsed = parseCharacterUrl(src);
  if (!parsed) return src;

  const roleCode = getRole(img, src);
  const rule = ROLE_RULES[roleCode];
  if (!rule) return src;

  const rawItems = parsed.parts[parsed.itemIndex]
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const gender = inferGender(rawItems);

  if (!force && parsed.url.searchParams.get("msciStableGear") === MSCI_SET_VERSION && currentGearIsValid(rawItems, data, roleCode, gender)) {
    return src;
  }

  const baseItems = rawItems.filter((entry) => !isEquipmentEntry(entry));
  const loadout = makeLoadout(data, roleCode, gender);
  const equipmentIds = loadout.items.map((item) => String(item.id));
  const action = actionForLoadout(roleCode, loadout.items);

  parsed.parts[parsed.itemIndex] = [...baseItems, ...equipmentIds].join(",");
  parsed.parts[parsed.actionIndex] = action;
  parsed.url.pathname = parsed.parts.join("/");
  parsed.url.searchParams.set("msciStableGear", MSCI_SET_VERSION);
  parsed.url.searchParams.set("msciSetLevel", String(loadout.targetLevel));
  parsed.url.searchParams.set("msciSetGender", gender);
  parsed.url.searchParams.set("msciAction", `${roleCode}-${action}-level${loadout.targetLevel}`);

  return parsed.url.toString().replace(/%2C/gi, ",").replace(/%3A/gi, ":");
}

function applyImage(img, force = false) {
  if (!img?.src || isApplyingSrc) return;

  const nextSrc = buildStableUrl(img.src, img, force);
  if (!nextSrc || nextSrc === img.src) return;

  isApplyingSrc = true;
  try {
    img.src = nextSrc;
  } finally {
    isApplyingSrc = false;
  }
}

function queueImage(img, force = false) {
  if (!img?.matches?.("img.msio-character-img")) return;
  img.dataset.msciForceStablePreview = force ? "1" : img.dataset.msciForceStablePreview || "0";
  pendingImages.add(img);

  if (flushScheduled) return;
  flushScheduled = true;
  requestAnimationFrame(flushPendingImages);
}

function flushPendingImages() {
  flushScheduled = false;
  const images = [...pendingImages];
  pendingImages.clear();

  for (const img of images) {
    const force = img.dataset.msciForceStablePreview === "1";
    img.dataset.msciForceStablePreview = "0";
    applyImage(img, force);
  }
}

function queueAll(root = document, force = false) {
  root.querySelectorAll?.("img.msio-character-img").forEach((img) => queueImage(img, force));
}

function handleRandomClick(event) {
  const button = event.target?.closest?.("button");
  if (!button) return;

  const label = String(button.textContent || "").replace(/\s+/g, "").trim().toLowerCase();
  if (!label.includes("随机") && !label.includes("random")) return;

  const card = button.closest(".character-preview-card") || document;
  window.setTimeout(() => queueAll(card, true), 0);
  window.setTimeout(() => queueAll(card, true), 120);
}

async function boot() {
  try {
    await loadData();
    queueAll(document, false);
  } catch (error) {
    console.warn("MSCI stable character preview manager failed:", error);
  }
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  document.addEventListener("click", handleRandomClick, true);

  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "attributes" && mutation.attributeName === "src") {
        queueImage(mutation.target, false);
        continue;
      }

      for (const node of mutation.addedNodes || []) {
        if (node?.matches?.("img.msio-character-img")) queueImage(node, false);
        queueAll(node, false);
      }
    }
  });

  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["src"],
  });

  boot();
}
