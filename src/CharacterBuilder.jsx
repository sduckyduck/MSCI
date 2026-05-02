import { useEffect, useMemo, useState } from "react";

const MS_REGION = "GMS";
const MS_VERSION = "83";
const CHARACTER_ACTION = "stand1";
const CHARACTER_STYLE_ITEM = 12000;
const GUIDEBOOK_DATA_BASE = "https://raw.githubusercontent.com/sduckyduck/osms-classic-guidebook/main/public/data";
const GUIDEBOOK_ITEMS_URL = `${GUIDEBOOK_DATA_BASE}/items.json`;
const GUIDEBOOK_MSIO_MAP_URL = `${GUIDEBOOK_DATA_BASE}/character_item_id_map.csv`;

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

// Uses the same modern MapleStory.IO character route as the guidebook preview:
// /api/character/{json item list}/{animation}/{emote}
// This is more reliable for expressions than the old faceId:faceAnimation item-entry route.
function buildMapleStoryIoCharacterUrl({ itemIds, action = CHARACTER_ACTION, emote = "default" }) {
  const parts = itemIds
    .filter((id) => Number.isFinite(Number(id)) && Number(id) > 0)
    .map((id) =>
      JSON.stringify({
        ItemId: Number(id),
        Version: MS_VERSION,
        Region: MS_REGION,
      })
    );

  return `https://maplestory.io/api/character/${encodeURIComponent(parts.join(","))}/${normalizeMsioAction(action)}/${encodeURIComponent(normalizeMsioEmote(emote))}?resize=3&renderMode=Full&bgColor=0,0,0,0`;
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

function buildGuidebookItemIndex(items) {
  const itemById = new Map();
  const itemByName = new Map();

  for (const item of items || []) {
    if (!item || item.category !== "Equipment") continue;

    const itemId = toNumber(item.id, null);
    const itemName = String(item.name || "").trim();
    if (itemId) itemById.set(String(itemId), item);
    if (itemName) itemByName.set(normalizeName(itemName), item);
  }

  return { itemById, itemByName };
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

// Common MapleStory face animation names used by MapleStory.IO face layers.
// The closest official Nexon OpenAPI emotion enum is E00-E10:
// E00 default, E01 wink, E02 smile, E03 cry, E04 angry, E05 bewildered,
// E06 blink, E07 blaze, E08 bowing, E09 cheers, E10 chu.
// MapleStory.IO uses readable WZ animation names rather than the E-codes.
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

const EQUIPMENT_SEEDS = {
  1040002: { guidebookId: 1040002, fallbackName: "White Undershirt", fallbackClassName: "Beginner", fallbackSlot: "Top" },
  1060002: { guidebookId: 1060002, fallbackName: "Brown Cotton Shorts", fallbackClassName: "Beginner", fallbackSlot: "Bottom" },
  1072001: { guidebookId: 1072001, fallbackName: "Beginner Shoes", fallbackClassName: "Beginner", fallbackSlot: "Shoes" },

  1002001: { guidebookId: 1002001, fallbackName: "Green Skullcap", fallbackClassName: "Warrior", fallbackSlot: "Hat" },
  1040021: { guidebookId: 1040021, fallbackName: "Warrior Top", fallbackClassName: "Warrior", fallbackSlot: "Top" },
  1060016: { guidebookId: 1060016, fallbackName: "Steel Sergeant Kilt", fallbackClassName: "Warrior", fallbackSlot: "Bottom" },
  1072005: { guidebookId: 1072005, fallbackName: "Warrior Shoes", fallbackClassName: "Warrior", fallbackSlot: "Shoes" },

  1002028: { guidebookId: 1002028, fallbackName: "Knight Hat", fallbackClassName: "Warrior", fallbackSlot: "Hat" },
  1040036: { guidebookId: 1040036, fallbackName: "Knight Armor Top", fallbackClassName: "Warrior", fallbackSlot: "Top" },
  1060026: { guidebookId: 1060026, fallbackName: "Knight Armor Bottom", fallbackClassName: "Warrior", fallbackSlot: "Bottom" },
  1072039: { guidebookId: 1072039, fallbackName: "Knight Shoes", fallbackClassName: "Warrior", fallbackSlot: "Shoes" },

  1002019: { guidebookId: 1002019, fallbackName: "Brown Apprentice Hat", fallbackClassName: "Magician", fallbackSlot: "Hat" },
  1050003: { guidebookId: 1050003, fallbackName: "Magician Robe", fallbackClassName: "Magician", fallbackSlot: "Overall" },
  1072072: { guidebookId: 1072072, fallbackName: "Magician Shoes", fallbackClassName: "Magician", fallbackSlot: "Shoes" },
  1002034: { guidebookId: 1002034, fallbackName: "Cleric Hat", fallbackClassName: "Magician", fallbackSlot: "Hat" },
  1050031: { guidebookId: 1050031, fallbackName: "Cleric Robe", fallbackClassName: "Magician", fallbackSlot: "Overall" },
  1050035: { guidebookId: 1050035, fallbackName: "Poison Magician Robe", fallbackClassName: "Magician", fallbackSlot: "Overall" },

  1002165: { guidebookId: 1002165, fallbackName: "Archer Hat", fallbackClassName: "Archer", fallbackSlot: "Hat" },
  1040067: { guidebookId: 1040067, fallbackName: "Archer Top", fallbackClassName: "Archer", fallbackSlot: "Top" },
  1060056: { guidebookId: 1060056, fallbackName: "Archer Pants", fallbackClassName: "Archer", fallbackSlot: "Bottom" },
  1072081: { guidebookId: 1072081, fallbackName: "Archer Shoes", fallbackClassName: "Archer", fallbackSlot: "Shoes" },

  1002170: { guidebookId: 1002170, fallbackName: "Thief Hat", fallbackClassName: "Thief", fallbackSlot: "Hat" },
  1040057: { guidebookId: 1040057, fallbackName: "Thief Top", fallbackClassName: "Thief", fallbackSlot: "Top" },
  1060043: { guidebookId: 1060043, fallbackName: "Green Legolier Pants", fallbackClassName: "Thief", fallbackSlot: "Bottom" },
  1072032: { guidebookId: 1072032, fallbackName: "Thief Shoes", fallbackClassName: "Thief", fallbackSlot: "Shoes" },

  1102000: { guidebookId: 1102000, fallbackName: "Old Raggedy Cape", fallbackClassName: "Common", fallbackSlot: "Cape" },
  1032000: { guidebookId: 1032000, fallbackName: "Weighted Earrings", fallbackClassName: "Common", fallbackSlot: "Earring" },
  1082002: { guidebookId: 1082002, fallbackName: "Steel Fingerless Gloves", fallbackClassName: "Common", fallbackSlot: "Glove" },
};

function seedItems(ids) {
  return ids.map((id) => resolveEquipmentSeed(EQUIPMENT_SEEDS[id], null, null));
}

const OUTFIT_SEEDS = [
  { id: "beginner", label: "初心冒险家", guidebookIds: [1040002, 1060002, 1072001] },
  { id: "warrior-blue", label: "蓝甲战士", guidebookIds: [1002001, 1040021, 1060016, 1072005] },
  { id: "paladin-white", label: "白金骑士", guidebookIds: [1002028, 1040036, 1060026, 1072039] },
  { id: "mage-purple", label: "紫袍法师", guidebookIds: [1002019, 1050003, 1072072] },
  { id: "cleric-mint", label: "薄荷牧师", guidebookIds: [1002034, 1050031, 1072045] },
  { id: "archer-green", label: "绿林射手", guidebookIds: [1002165, 1040067, 1060056, 1072081] },
  { id: "rogue-night", label: "夜行飞侠", guidebookIds: [1002170, 1040057, 1060043, 1072032] },
  { id: "toxic-lab", label: "毒药研究员", guidebookIds: [1002019, 1050035, 1072072] },
];

const ACCESSORY_SEEDS = [
  { id: "none", label: "无饰品", guidebookIds: [] },
  { id: "cape", label: "披风", guidebookIds: [1102000] },
  { id: "earring", label: "耳环", guidebookIds: [1032000] },
  { id: "glove", label: "手套", guidebookIds: [1082002] },
  { id: "cape-glove", label: "披风 + 手套", guidebookIds: [1102000, 1082002] },
];

const FALLBACK_OUTFIT_OPTIONS = OUTFIT_SEEDS.map((option) => ({
  ...option,
  equipment: seedItems(option.guidebookIds),
}));

const FALLBACK_ACCESSORY_OPTIONS = ACCESSORY_SEEDS.map((option) => ({
  ...option,
  equipment: seedItems(option.guidebookIds),
}));

function resolveEquipmentSeed(seed, itemIndex, msioMap) {
  if (!seed) return null;

  const sourceItem =
    itemIndex?.itemById?.get(String(seed.guidebookId)) ||
    itemIndex?.itemByName?.get(normalizeName(seed.fallbackName)) ||
    null;

  const guidebookId = toNumber(sourceItem?.id, seed.guidebookId);
  const guidebookName = String(sourceItem?.name || seed.fallbackName || `Item ${guidebookId}`);
  const msioId =
    msioMap?.msioBySourceId?.get(String(guidebookId)) ||
    msioMap?.msioBySourceName?.get(normalizeName(guidebookName)) ||
    guidebookId;

  return {
    id: msioId,
    guidebookId,
    name: guidebookName,
    className: sourceItem?.req_job_label || seed.fallbackClassName || "Unknown",
    slot: sourceItem?.sub_category || seed.fallbackSlot || "Unknown",
    source: sourceItem ? "guidebook-items-json" : "fallback-seed",
    msioMapped: Boolean(msioMap?.msioBySourceId?.has(String(guidebookId)) || msioMap?.msioBySourceName?.has(normalizeName(guidebookName))),
  };
}

function resolveEquipmentOptions(optionSeeds, itemIndex, msioMap) {
  return optionSeeds.map((option) => ({
    ...option,
    equipment: option.guidebookIds
      .map((id) => resolveEquipmentSeed(EQUIPMENT_SEEDS[id], itemIndex, msioMap))
      .filter(Boolean),
  }));
}

function useGuidebookEquipmentOptions() {
  const [state, setState] = useState({
    outfitOptions: FALLBACK_OUTFIT_OPTIONS,
    accessoryOptions: FALLBACK_ACCESSORY_OPTIONS,
    loading: true,
    source: "fallback-seed",
    resolvedCount: 0,
    mappedCount: 0,
    error: "",
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
        const itemIndex = buildGuidebookItemIndex(itemRows);
        const msioMap = buildMsioMap(parseCsv(mapText));
        const outfitOptions = resolveEquipmentOptions(OUTFIT_SEEDS, itemIndex, msioMap);
        const accessoryOptions = resolveEquipmentOptions(ACCESSORY_SEEDS, itemIndex, msioMap);
        const allEquipment = [...outfitOptions, ...accessoryOptions].flatMap((option) => option.equipment || []);

        if (!cancelled) {
          setState({
            outfitOptions,
            accessoryOptions,
            loading: false,
            source: "guidebook-items-json + character-item-id-map",
            resolvedCount: allEquipment.filter((item) => item.source === "guidebook-items-json").length,
            mappedCount: allEquipment.filter((item) => item.msioMapped).length,
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

const ROLE_PRESETS = {
  SLAY: { outfit: "warrior-blue", accessory: "cape", emote: "angry" },
  SHLD: { outfit: "paladin-white", accessory: "cape", emote: "default" },
  POLE: { outfit: "warrior-blue", accessory: "glove", emote: "default" },
  ZAPZ: { outfit: "mage-purple", accessory: "cape", emote: "bewildered" },
  TOXI: { outfit: "toxic-lab", accessory: "earring", emote: "wink" },
  HEAL: { outfit: "cleric-mint", accessory: "cape", emote: "smile" },
  STAR: { outfit: "rogue-night", accessory: "glove", emote: "wink" },
  STAB: { outfit: "rogue-night", accessory: "cape-glove", emote: "angry" },
  KITE: { outfit: "archer-green", accessory: "cape", emote: "default" },
  SNIP: { outfit: "archer-green", accessory: "glove", emote: "blink" },
};

const ROLE_RANDOM_POOLS = {
  warrior: ["warrior-blue", "paladin-white", "beginner"],
  magician: ["mage-purple", "cleric-mint", "toxic-lab"],
  archer: ["archer-green", "beginner"],
  thief: ["rogue-night", "beginner"],
};

const CODE_TO_GROUP = {
  SLAY: "warrior",
  SHLD: "warrior",
  POLE: "warrior",
  ZAPZ: "magician",
  TOXI: "magician",
  HEAL: "magician",
  STAR: "thief",
  STAB: "thief",
  KITE: "archer",
  SNIP: "archer",
};

function pick(options) {
  return options[Math.floor(Math.random() * options.length)];
}

function getOption(options, id) {
  return options.find((option) => String(option.id) === String(id)) || options[0];
}

function makeConfigForProfile(profile, randomize = true, fixedGender = "female") {
  const code = profile?.code || "SLAY";
  const base = ROLE_PRESETS[code] || ROLE_PRESETS.SLAY;
  const group = CODE_TO_GROUP[code] || "warrior";
  const gender = fixedGender;
  const hair = pick(HAIR_OPTIONS[gender]).id;
  const face = pick(FACE_OPTIONS[gender]).id;
  const outfitPool = ROLE_RANDOM_POOLS[group] || OUTFIT_SEEDS.map((option) => option.id);

  return {
    skin: 2000,
    gender,
    hair,
    face,
    emote: randomize ? pick(EMOTE_OPTIONS).id : base.emote,
    outfit: randomize ? pick(outfitPool) : base.outfit,
    accessory: randomize ? pick(ACCESSORY_SEEDS).id : base.accessory,
  };
}

function makeFullyRandomConfig(fixedGender = "female", outfitOptions = FALLBACK_OUTFIT_OPTIONS, accessoryOptions = FALLBACK_ACCESSORY_OPTIONS) {
  const gender = fixedGender;
  return {
    skin: pick(SKIN_OPTIONS).id,
    gender,
    hair: pick(HAIR_OPTIONS[gender]).id,
    face: pick(FACE_OPTIONS[gender]).id,
    emote: pick(EMOTE_OPTIONS).id,
    outfit: pick(outfitOptions).id,
    accessory: pick(accessoryOptions).id,
  };
}

function getEquipmentIds(option) {
  return (option?.equipment || option?.items || [])
    .map((item) => (typeof item === "object" ? item.id : item))
    .filter((id) => Number.isFinite(Number(id)) && Number(id) > 0)
    .map(Number);
}

function getEquipmentSummary(config, outfitOptions, accessoryOptions) {
  const outfit = getOption(outfitOptions, config.outfit);
  const accessory = getOption(accessoryOptions, config.accessory);

  return [...(outfit.equipment || []), ...(accessory.equipment || [])]
    .map((item) => `${item.name} / ${item.className} / OSMS ${item.guidebookId} → MSIO ${item.id}`)
    .join("; ");
}

function buildCharacterItemIds(config, outfitOptions, accessoryOptions) {
  const outfit = getOption(outfitOptions, config.outfit);
  const accessory = getOption(accessoryOptions, config.accessory);

  return [
    Number(config.skin),
    CHARACTER_STYLE_ITEM,
    Number(config.hair),
    Number(config.face),
    ...getEquipmentIds(outfit),
    ...getEquipmentIds(accessory),
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
  const equipmentOptions = useGuidebookEquipmentOptions();
  const { outfitOptions, accessoryOptions } = equipmentOptions;
  const defaultConfig = useMemo(() => makeConfigForProfile(profile, true, "female"), [profile?.code]);
  const [config, setConfig] = useState(defaultConfig);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setConfig(defaultConfig);
    setImageFailed(false);
  }, [defaultConfig]);

  const characterItemIds = useMemo(
    () => buildCharacterItemIds(config, outfitOptions, accessoryOptions),
    [config, outfitOptions, accessoryOptions]
  );
  const imageUrl = useMemo(
    () => buildMapleStoryIoCharacterUrl({ itemIds: characterItemIds, emote: config.emote }),
    [characterItemIds, config.emote]
  );

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  const hairOptions = HAIR_OPTIONS[config.gender] || HAIR_OPTIONS.male;
  const faceOptions = FACE_OPTIONS[config.gender] || FACE_OPTIONS.male;
  const selectedEmote = getOption(EMOTE_OPTIONS, config.emote);
  const equipmentSummary = getEquipmentSummary(config, outfitOptions, accessoryOptions);

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
  }

  function resetRecommended() {
    setImageFailed(false);
    setConfig(makeConfigForProfile(profile, false, config.gender));
  }

  function randomizeAll() {
    setImageFailed(false);
    setConfig(makeFullyRandomConfig(config.gender, outfitOptions, accessoryOptions));
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
          <span>已折叠 · 随机不会改变性别</span>
        </summary>

        <div className="builder-control-head">
          <b>角色外观</b>
          <div className="builder-button-row">
            <button type="button" className="ghost-btn small-btn" onClick={resetRecommended}>结果推荐</button>
            <button type="button" className="primary-btn small-btn" onClick={randomizeForResult}>本职业随机</button>
            <button type="button" className="ghost-btn small-btn" onClick={randomizeAll}>全随机</button>
          </div>
        </div>

        <div className="builder-grid">
          <SelectField label="性别" value={config.gender} options={GENDER_OPTIONS} onChange={(value) => updateConfig("gender", value)} />
          <SelectField label="皮肤" value={String(config.skin)} options={SKIN_OPTIONS} onChange={(value) => updateConfig("skin", Number(value))} />
          <SelectField label="发型" value={String(config.hair)} options={hairOptions} onChange={(value) => updateConfig("hair", Number(value))} />
          <SelectField label="脸型" value={String(config.face)} options={faceOptions} onChange={(value) => updateConfig("face", Number(value))} />
          <SelectField label="表情" value={config.emote} options={EMOTE_OPTIONS} onChange={(value) => updateConfig("emote", value)} />
          <SelectField label="饰品" value={config.accessory} options={accessoryOptions} onChange={(value) => updateConfig("accessory", value)} />
        </div>

        <p className="builder-note">
          使用 MapleStory.IO GMS v83 API 实时生成；装备从 guidebook `items.json` 按 ID/名称读取，并用 `character_item_id_map.csv` 转成 MSIO 渲染 ID；当前数据源：{equipmentOptions.source}{equipmentOptions.loading ? "（加载中）" : ""}{equipmentOptions.error ? `（回退原因：${equipmentOptions.error}）` : ""}；已解析 {equipmentOptions.resolvedCount} 件，已映射 {equipmentOptions.mappedCount} 件；当前表情：{selectedEmote.label} / {selectedEmote.apiCode} / {normalizeMsioEmote(selectedEmote.id)}；Item IDs：{characterItemIds.join(", ")}；装备池：{equipmentSummary}
        </p>
      </details>
    </div>
  );
}
