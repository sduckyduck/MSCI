const SET_RANDOMIZER_DATA_BASE = "https://raw.githubusercontent.com/sduckyduck/osms-classic-guidebook/main/public/data";
const SET_RANDOMIZER_ITEMS_URL = `${SET_RANDOMIZER_DATA_BASE}/items.json`;
const SET_RANDOMIZER_MSIO_MAP_URL = `${SET_RANDOMIZER_DATA_BASE}/character_item_id_map.csv`;
const SET_RANDOMIZER_MARKER = "maplestory.io/api/GMS/83/Character/";

const SET_RANDOMIZER_ROLES = {
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

const SET_RANDOMIZER_VISUAL_SLOTS = new Set(["Hat", "Overall", "Top", "Bottom", "Shoes", "Glove", "Cape", "Earring", "Shield", "Weapon"]);
const SET_RANDOMIZER_BODY_SLOTS = new Set(["Overall", "Top", "Bottom"]);
const SET_RANDOMIZER_EQUIP_PREFIXES = ["100", "101", "102", "103", "104", "105", "106", "107", "108", "109", "110", "111", "112", "130", "131", "132", "133", "137", "138", "140", "141", "142", "143", "144", "145", "146", "147"];
const SET_RANDOMIZER_WEAPON_PREFIXES = ["130", "131", "132", "133", "137", "138", "140", "141", "142", "143", "144", "145", "146", "147"];
const SET_RANDOMIZER_TWO_HAND_PREFIXES = ["140", "141", "142", "143", "144", "146"];
const SET_RANDOMIZER_SET_MATCH_CHANCE = 0.85;

let setRandomizerDataPromise = null;
let setRandomizerData = null;

function parseSetRandomizerCsv(text) {
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

function setRandomizerNumber(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(String(value).replace(/[,+]/g, "").trim());
  return Number.isFinite(n) ? n : fallback;
}

function normalizeSetRandomizerName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildSetRandomizerMsioMap(rows) {
  const bySourceId = new Map();
  const bySourceName = new Map();

  for (const row of rows || []) {
    const sourceId = setRandomizerNumber(row.osms_item_id ?? row.source_item_id ?? row.item_id ?? row.id, null);
    const msioId = setRandomizerNumber(row.msio_item_id ?? row.mapped_item_id ?? row.target_item_id ?? row.msio_id, null);
    if (!msioId || msioId <= 0) continue;

    if (sourceId) bySourceId.set(String(sourceId), msioId);

    const note = String(row.note || row.match_note || "");
    const sourceNameFromNote = note.match(/^\s*([^>-]+?)\s*->/)?.[1]?.trim();
    if (sourceNameFromNote) bySourceName.set(normalizeSetRandomizerName(sourceNameFromNote), msioId);

    const sourceName = row.osms_item_name || row.source_item_name || row.item_name || row.name;
    if (sourceName) bySourceName.set(normalizeSetRandomizerName(sourceName), msioId);
  }

  return { bySourceId, bySourceName };
}

function normalizeSetRandomizerSlot(slot) {
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

function getSetRandomizerGenderFromItemId(item) {
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

function makeSetRandomizerRecord(item, msioMap) {
  const guidebookId = setRandomizerNumber(item?.id, null);
  const name = String(item?.name || "").trim();
  if (!guidebookId || !name || item?.category !== "Equipment") return null;

  const mappedId = msioMap.bySourceId.get(String(guidebookId)) || msioMap.bySourceName.get(normalizeSetRandomizerName(name)) || null;
  const record = {
    id: mappedId || guidebookId,
    guidebookId,
    name,
    className: item.req_job_label || item.requiredJob || item.requiredJobs?.join("/") || "All",
    slot: normalizeSetRandomizerSlot(item.sub_category),
    reqLevel: setRandomizerNumber(item.stats?.reqLevel ?? item.reqLevel ?? item.requiredLevel, 0),
    weaponType: item.weapon_type || item.weaponType || "",
    msioMapped: Boolean(mappedId),
  };

  record.gender = getSetRandomizerGenderFromItemId(record);
  return record;
}

function buildSetRandomizerData(records) {
  const byId = new Map();
  for (const item of records) {
    byId.set(String(item.id), item);
    byId.set(String(item.guidebookId), item);
  }
  return { records, byId };
}

async function loadSetRandomizerData() {
  if (setRandomizerData) return setRandomizerData;
  if (!setRandomizerDataPromise) {
    setRandomizerDataPromise = Promise.all([
      fetch(SET_RANDOMIZER_ITEMS_URL, { cache: "no-store" }).then((res) => res.json()),
      fetch(SET_RANDOMIZER_MSIO_MAP_URL, { cache: "no-store" }).then((res) => res.text()),
    ]).then(([itemJson, mapText]) => {
      const rows = Array.isArray(itemJson) ? itemJson : itemJson.items || itemJson.data || [];
      const msioMap = buildSetRandomizerMsioMap(parseSetRandomizerCsv(mapText));
      const records = rows.map((item) => makeSetRandomizerRecord(item, msioMap)).filter(Boolean);
      setRandomizerData = buildSetRandomizerData(records);
      return setRandomizerData;
    });
  }
  return setRandomizerDataPromise;
}

function getSetRandomizerItemId(entry) {
  return String(entry || "").split(":")[0].trim();
}

function hasSetRandomizerPrefix(entry, prefixes) {
  const id = getSetRandomizerItemId(entry);
  return prefixes.some((prefix) => id.startsWith(prefix));
}

function isSetRandomizerEquipmentEntry(entry) {
  return hasSetRandomizerPrefix(entry, SET_RANDOMIZER_EQUIP_PREFIXES);
}

function getSetRandomizerRoleFromUrl(src) {
  try {
    const url = new URL(src, window.location.href);
    return (url.searchParams.get("msciAction") || "").split("-")[0] || "";
  } catch {
    return "";
  }
}

function getSetRandomizerRole(img, src) {
  return img?.closest?.(".character-preview-bg")?.getAttribute?.("data-role") || getSetRandomizerRoleFromUrl(src) || "";
}

function parseSetRandomizerCharacterUrl(src) {
  const raw = String(src || "").replace(/%2C/gi, ",").replace(/%3A/gi, ":");
  if (!raw.includes(SET_RANDOMIZER_MARKER)) return null;

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

function inferSetRandomizerGenderFromItems(items) {
  const ids = items.map(getSetRandomizerItemId);
  if (ids.some((id) => id.startsWith("31") || id.startsWith("21"))) return "female";
  if (ids.some((id) => id.startsWith("30") || id.startsWith("20"))) return "male";
  return "female";
}

function labelSupportsSetRandomizerClass(label, classGroup) {
  const value = String(label || "").toLowerCase();
  if (!value || value === "all" || value.includes("common") || value.includes("beginner")) return true;
  if (classGroup === "warrior") return value.includes("warrior");
  if (classGroup === "magician") return value.includes("magician") || value.includes("mage");
  if (classGroup === "archer") return value.includes("archer") || value.includes("bowman");
  if (classGroup === "thief") return value.includes("thief") || value.includes("rogue");
  return false;
}

function itemMatchesSetRandomizerGender(item, gender) {
  return !item?.gender || item.gender === "all" || item.gender === gender;
}

function getSetRandomizerWeaponText(item) {
  return `${item?.weaponType || ""} ${item?.name || ""}`.toLowerCase();
}

function weaponMatchesSetRandomizerKind(item, kind) {
  const text = getSetRandomizerWeaponText(item);
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

function itemAllowedForSetRandomizerRole(item, roleCode, gender) {
  const rule = SET_RANDOMIZER_ROLES[roleCode];
  if (!rule || !item || !SET_RANDOMIZER_VISUAL_SLOTS.has(item.slot)) return false;
  if (!itemMatchesSetRandomizerGender(item, gender)) return false;
  if (!labelSupportsSetRandomizerClass(item.className, rule.classGroup)) return false;
  if (item.slot === "Shield") return Boolean(rule.allowShield);
  if (item.slot !== "Weapon") return true;
  return (rule.weaponKinds || []).some((kind) => weaponMatchesSetRandomizerKind(item, kind));
}

function pickSetRandomizer(items) {
  if (!items?.length) return null;
  return items[Math.floor(Math.random() * items.length)];
}

function buildSetRandomizerCandidates(data, roleCode, gender) {
  const bySlot = new Map();
  for (const item of data.records) {
    if (!item.msioMapped && item.id !== item.guidebookId) continue;
    if (setRandomizerNumber(item.reqLevel, 0) > 60) continue;
    if (!itemAllowedForSetRandomizerRole(item, roleCode, gender)) continue;
    if (!bySlot.has(item.slot)) bySlot.set(item.slot, []);
    bySlot.get(item.slot).push(item);
  }

  for (const items of bySlot.values()) {
    items.sort((a, b) => setRandomizerNumber(a.reqLevel, 0) - setRandomizerNumber(b.reqLevel, 0) || String(a.name).localeCompare(String(b.name)));
  }

  return bySlot;
}

function scoreSetRandomizerLevel(level, bySlot, rule) {
  const presentSlots = new Set();
  for (const slot of rule.slots) {
    const items = bySlot.get(slot) || [];
    if (items.some((item) => setRandomizerNumber(item.reqLevel, 0) === level)) presentSlots.add(slot);
  }

  const hasOverall = presentSlots.has("Overall");
  const hasTopBottom = presentSlots.has("Top") && presentSlots.has("Bottom");
  const bodyScore = hasOverall || hasTopBottom ? 2 : 0;
  const weaponScore = presentSlots.has("Weapon") ? 2 : 0;
  const coreScore = ["Hat", "Shoes", "Glove"].filter((slot) => presentSlots.has(slot)).length;
  return bodyScore + weaponScore + coreScore + presentSlots.size * 0.2;
}

function pickSetRandomizerTargetLevel(bySlot, rule) {
  const levelSet = new Set();
  for (const slot of rule.slots) {
    for (const item of bySlot.get(slot) || []) {
      const level = setRandomizerNumber(item.reqLevel, 0);
      if (level > 0 && level <= 60) levelSet.add(level);
    }
  }

  const weighted = [...levelSet]
    .map((level) => ({ level, score: scoreSetRandomizerLevel(level, bySlot, rule) }))
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

function pickSetRandomizerSlotItem(bySlot, slot, targetLevel, selectedIds, preferSet = true) {
  const all = (bySlot.get(slot) || []).filter((item) => !selectedIds.has(String(item.id)));
  if (!all.length) return null;

  const exact = all.filter((item) => setRandomizerNumber(item.reqLevel, 0) === targetLevel);
  const nearby = all.filter((item) => Math.abs(setRandomizerNumber(item.reqLevel, 0) - targetLevel) <= 5);
  const sameBand = all.filter((item) => Math.abs(setRandomizerNumber(item.reqLevel, 0) - targetLevel) <= 10);

  if (preferSet && exact.length && Math.random() < SET_RANDOMIZER_SET_MATCH_CHANCE) return pickSetRandomizer(exact);
  if (nearby.length && Math.random() < 0.65) return pickSetRandomizer(nearby);
  if (sameBand.length && Math.random() < 0.75) return pickSetRandomizer(sameBand);
  return pickSetRandomizer(all);
}

function selectedSetRandomizerWeaponKind(item) {
  if (!item) return "";
  if (weaponMatchesSetRandomizerKind(item, "wand")) return "wand";
  if (weaponMatchesSetRandomizerKind(item, "staff")) return "staff";
  return "";
}

function makeSetRandomizerLoadout(data, roleCode, gender) {
  const rule = SET_RANDOMIZER_ROLES[roleCode];
  const bySlot = buildSetRandomizerCandidates(data, roleCode, gender);
  const targetLevel = pickSetRandomizerTargetLevel(bySlot, rule);
  const selected = [];
  const selectedIds = new Set();

  function add(item) {
    if (!item || selectedIds.has(String(item.id))) return null;
    selected.push(item);
    selectedIds.add(String(item.id));
    return item;
  }

  const weapon = add(pickSetRandomizerSlotItem(bySlot, "Weapon", targetLevel, selectedIds, true));
  const weaponKind = selectedSetRandomizerWeaponKind(weapon);

  const overallExact = (bySlot.get("Overall") || []).some((item) => setRandomizerNumber(item.reqLevel, 0) === targetLevel);
  const topExact = (bySlot.get("Top") || []).some((item) => setRandomizerNumber(item.reqLevel, 0) === targetLevel);
  const bottomExact = (bySlot.get("Bottom") || []).some((item) => setRandomizerNumber(item.reqLevel, 0) === targetLevel);
  const useOverall = overallExact && (!topExact || !bottomExact || Math.random() < 0.58);

  if (rule.slots.includes("Overall") && useOverall) {
    add(pickSetRandomizerSlotItem(bySlot, "Overall", targetLevel, selectedIds, true));
  } else {
    if (rule.slots.includes("Top")) add(pickSetRandomizerSlotItem(bySlot, "Top", targetLevel, selectedIds, true));
    if (rule.slots.includes("Bottom")) add(pickSetRandomizerSlotItem(bySlot, "Bottom", targetLevel, selectedIds, true));
  }

  for (const slot of rule.slots) {
    if (slot === "Weapon" || slot === "Overall" || slot === "Top" || slot === "Bottom" || slot === "Shield") continue;
    add(pickSetRandomizerSlotItem(bySlot, slot, targetLevel, selectedIds, true));
  }

  if (rule.allowShield) {
    const shieldAllowed = roleCode === "ZAPZ" || roleCode === "TOXI" || roleCode === "HEAL" ? weaponKind === "wand" : true;
    if (shieldAllowed && Math.random() < 0.85) add(pickSetRandomizerSlotItem(bySlot, "Shield", targetLevel, selectedIds, false));
  }

  return { items: selected, targetLevel };
}

function getSetRandomizerCurrentRecords(items, data) {
  return items
    .map((entry) => data.byId.get(getSetRandomizerItemId(entry)))
    .filter(Boolean);
}

function currentSetRandomizerGearIsValid(items, data, roleCode, gender) {
  const records = getSetRandomizerCurrentRecords(items, data);
  if (!records.length) return false;
  return records.every((item) => itemAllowedForSetRandomizerRole(item, roleCode, gender));
}

function getSetRandomizerStandingAction(roleCode, loadoutItems) {
  if (roleCode === "KITE") return "stand1";
  if (roleCode === "SNIP") return "stand2";
  if (roleCode === "ZAPZ" || roleCode === "TOXI" || roleCode === "HEAL") return "stand1";

  const weaponId = String(loadoutItems.find((item) => item.slot === "Weapon")?.id || "");
  return SET_RANDOMIZER_TWO_HAND_PREFIXES.some((prefix) => weaponId.startsWith(prefix)) ? "stand2" : "stand1";
}

function fixSetRandomizerUrl(src, img = null, force = false) {
  if (!setRandomizerData) return src;

  const parsed = parseSetRandomizerCharacterUrl(src);
  if (!parsed) return src;

  const roleCode = getSetRandomizerRole(img, src);
  const rule = SET_RANDOMIZER_ROLES[roleCode];
  if (!rule) return src;

  const rawItems = parsed.parts[parsed.itemIndex]
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const gender = inferSetRandomizerGenderFromItems(rawItems);

  if (!force && parsed.url.searchParams.get("msciSetGear") === "2" && currentSetRandomizerGearIsValid(rawItems, setRandomizerData, roleCode, gender)) {
    return src;
  }

  const baseItems = rawItems.filter((entry) => !isSetRandomizerEquipmentEntry(entry));
  const loadout = makeSetRandomizerLoadout(setRandomizerData, roleCode, gender);
  const equipmentIds = loadout.items.map((item) => String(item.id));
  const action = getSetRandomizerStandingAction(roleCode, loadout.items);

  parsed.parts[parsed.itemIndex] = [...baseItems, ...equipmentIds].join(",");
  parsed.parts[parsed.actionIndex] = action;
  parsed.url.pathname = parsed.parts.join("/");
  parsed.url.searchParams.set("msciSetGear", "2");
  parsed.url.searchParams.set("msciSetLevel", String(loadout.targetLevel));
  parsed.url.searchParams.set("msciSetGender", gender);
  parsed.url.searchParams.set("msciAction", `${roleCode}-${action}-level${loadout.targetLevel}`);

  return parsed.url.toString().replace(/%2C/gi, ",").replace(/%3A/gi, ":");
}

function fixSetRandomizerImage(img, force = false) {
  if (!img?.src || !setRandomizerData) return;
  const nextSrc = fixSetRandomizerUrl(img.src, img, force);
  if (nextSrc && nextSrc !== img.src) img.src = nextSrc;
}

function fixAllSetRandomizerImages(root = document, force = false) {
  root.querySelectorAll?.("img.msio-character-img").forEach((img) => fixSetRandomizerImage(img, force));
}

function installSetRandomizerSetterGuard() {
  if (window.__msciEquipmentSetRandomizerInstalled) return;

  const descriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, "src");
  if (!descriptor?.set || !descriptor?.get) return;

  window.__msciEquipmentSetRandomizerInstalled = true;

  Object.defineProperty(HTMLImageElement.prototype, "src", {
    configurable: descriptor.configurable,
    enumerable: descriptor.enumerable,
    get() {
      return descriptor.get.call(this);
    },
    set(value) {
      const force = window.__msciForceEquipmentSetRandomUntil && Date.now() < window.__msciForceEquipmentSetRandomUntil;
      descriptor.set.call(this, fixSetRandomizerUrl(value, this, Boolean(force)));
    },
  });
}

function markForceRandomOnRandomButtonClick(event) {
  const button = event.target?.closest?.("button");
  if (!button) return;
  const label = String(button.textContent || "").trim();
  if (!label.includes("随机") && !label.toLowerCase().includes("random")) return;

  window.__msciForceEquipmentSetRandomUntil = Date.now() + 900;
  window.setTimeout(() => fixAllSetRandomizerImages(document, true), 60);
  window.setTimeout(() => fixAllSetRandomizerImages(document, true), 220);
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  installSetRandomizerSetterGuard();
  document.addEventListener("click", markForceRandomOnRandomButtonClick, true);

  loadSetRandomizerData()
    .then(() => fixAllSetRandomizerImages(document, false))
    .catch((error) => console.warn("MSCI equipment set randomizer failed:", error));

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "attributes" && mutation.attributeName === "src") {
        fixSetRandomizerImage(mutation.target, false);
        continue;
      }

      for (const node of mutation.addedNodes || []) {
        if (node?.matches?.("img.msio-character-img")) fixSetRandomizerImage(node, false);
        fixAllSetRandomizerImages(node, false);
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
