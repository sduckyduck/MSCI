import { useEffect, useMemo, useState } from "react";

const MS_REGION = "GMS";
const MS_VERSION = "83";
const CHARACTER_ACTION = "stand1";
const CHARACTER_STYLE_ITEM = 12000;

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

// MSCI internal API pool. These entries keep the MeowDB-style equipment identity
// together with the MapleStory.IO render ID so presets can be audited and replaced
// without showing the equipment selector to users.
const MSCI_API_EQUIPMENT_POOL = [
  { id: 1040002, name: "White Undershirt", className: "Beginner", slot: "Top" },
  { id: 1060002, name: "Brown Cotton Shorts", className: "Beginner", slot: "Bottom" },
  { id: 1072001, name: "Beginner Shoes", className: "Beginner", slot: "Shoes" },

  { id: 1002001, name: "Green Skullcap", className: "Warrior", slot: "Hat" },
  { id: 1040021, name: "Warrior Top", className: "Warrior", slot: "Top" },
  { id: 1060016, name: "Steel Sergeant Kilt", className: "Warrior", slot: "Bottom" },
  { id: 1072005, name: "Warrior Shoes", className: "Warrior", slot: "Shoes" },

  { id: 1002028, name: "Knight Hat", className: "Warrior", slot: "Hat" },
  { id: 1040036, name: "Knight Armor Top", className: "Warrior", slot: "Top" },
  { id: 1060026, name: "Knight Armor Bottom", className: "Warrior", slot: "Bottom" },
  { id: 1072039, name: "Knight Shoes", className: "Warrior", slot: "Shoes" },

  { id: 1002019, name: "Brown Apprentice Hat", className: "Magician", slot: "Hat" },
  { id: 1050003, name: "Magician Robe", className: "Magician", slot: "Overall" },
  { id: 1072072, name: "Magician Shoes", className: "Magician", slot: "Shoes" },
  { id: 1002034, name: "Cleric Hat", className: "Magician", slot: "Hat" },
  { id: 1050031, name: "Cleric Robe", className: "Magician", slot: "Overall" },
  { id: 1050035, name: "Poison Magician Robe", className: "Magician", slot: "Overall" },

  { id: 1002165, name: "Archer Hat", className: "Archer", slot: "Hat" },
  { id: 1040067, name: "Archer Top", className: "Archer", slot: "Top" },
  { id: 1060056, name: "Archer Pants", className: "Archer", slot: "Bottom" },
  { id: 1072081, name: "Archer Shoes", className: "Archer", slot: "Shoes" },

  { id: 1002170, name: "Thief Hat", className: "Thief", slot: "Hat" },
  { id: 1040057, name: "Thief Top", className: "Thief", slot: "Top" },
  { id: 1060043, name: "Green Legolier Pants", className: "Thief", slot: "Bottom" },
  { id: 1072032, name: "Thief Shoes", className: "Thief", slot: "Shoes" },

  { id: 1102000, name: "Old Raggedy Cape", className: "Common", slot: "Cape" },
  { id: 1032000, name: "Weighted Earrings", className: "Common", slot: "Earring" },
  { id: 1082002, name: "Steel Fingerless Gloves", className: "Common", slot: "Glove" },
];

const EQUIPMENT_BY_ID = new Map(MSCI_API_EQUIPMENT_POOL.map((item) => [item.id, item]));

function outfitItems(ids) {
  return ids.map((id) => EQUIPMENT_BY_ID.get(id) || { id, name: `MSIO ${id}`, className: "Unknown", slot: "Unknown" });
}

// This stays internal only. The user-facing NX / 装备 selector has been removed.
// The app still needs clothing item IDs so the MapleStory.IO character is not rendered as an empty/base body.
const OUTFIT_OPTIONS = [
  { id: "beginner", label: "初心冒险家", equipment: outfitItems([1040002, 1060002, 1072001]) },
  { id: "warrior-blue", label: "蓝甲战士", equipment: outfitItems([1002001, 1040021, 1060016, 1072005]) },
  { id: "paladin-white", label: "白金骑士", equipment: outfitItems([1002028, 1040036, 1060026, 1072039]) },
  { id: "mage-purple", label: "紫袍法师", equipment: outfitItems([1002019, 1050003, 1072072]) },
  { id: "cleric-mint", label: "薄荷牧师", equipment: outfitItems([1002034, 1050031, 1072045]) },
  { id: "archer-green", label: "绿林射手", equipment: outfitItems([1002165, 1040067, 1060056, 1072081]) },
  { id: "rogue-night", label: "夜行飞侠", equipment: outfitItems([1002170, 1040057, 1060043, 1072032]) },
  { id: "toxic-lab", label: "毒药研究员", equipment: outfitItems([1002019, 1050035, 1072072]) },
];

const ACCESSORY_OPTIONS = [
  { id: "none", label: "无饰品", equipment: [] },
  { id: "cape", label: "披风", equipment: outfitItems([1102000]) },
  { id: "earring", label: "耳环", equipment: outfitItems([1032000]) },
  { id: "glove", label: "手套", equipment: outfitItems([1082002]) },
  { id: "cape-glove", label: "披风 + 手套", equipment: outfitItems([1102000, 1082002]) },
];

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
  const outfitPool = ROLE_RANDOM_POOLS[group] || OUTFIT_OPTIONS.map((option) => option.id);

  return {
    skin: 2000,
    gender,
    hair,
    face,
    emote: randomize ? pick(EMOTE_OPTIONS).id : base.emote,
    outfit: randomize ? pick(outfitPool) : base.outfit,
    accessory: randomize ? pick(ACCESSORY_OPTIONS).id : base.accessory,
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
    outfit: pick(OUTFIT_OPTIONS).id,
    accessory: pick(ACCESSORY_OPTIONS).id,
  };
}

function getEquipmentIds(option) {
  return (option?.equipment || option?.items || [])
    .map((item) => (typeof item === "object" ? item.id : item))
    .filter((id) => Number.isFinite(Number(id)) && Number(id) > 0)
    .map(Number);
}

function getEquipmentSummary(config) {
  const outfit = getOption(OUTFIT_OPTIONS, config.outfit);
  const accessory = getOption(ACCESSORY_OPTIONS, config.accessory);

  return [...(outfit.equipment || []), ...(accessory.equipment || [])]
    .map((item) => `${item.name} / ${item.className} / ${item.id}`)
    .join("; ");
}

function buildCharacterItemIds(config) {
  const outfit = getOption(OUTFIT_OPTIONS, config.outfit);
  const accessory = getOption(ACCESSORY_OPTIONS, config.accessory);

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
  const defaultConfig = useMemo(() => makeConfigForProfile(profile, true, "female"), [profile?.code]);
  const [config, setConfig] = useState(defaultConfig);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setConfig(defaultConfig);
    setImageFailed(false);
  }, [defaultConfig]);

  const characterItemIds = useMemo(() => buildCharacterItemIds(config), [config]);
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
  const equipmentSummary = getEquipmentSummary(config);

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
    setConfig(makeFullyRandomConfig(config.gender));
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
          <SelectField label="饰品" value={config.accessory} options={ACCESSORY_OPTIONS} onChange={(value) => updateConfig("accessory", value)} />
        </div>

        <p className="builder-note">
          使用 MapleStory.IO GMS v83 API 实时生成；不显示武器和装备选项；随机不会改变当前性别；当前表情：{selectedEmote.label} / {selectedEmote.apiCode} / {normalizeMsioEmote(selectedEmote.id)}；Item IDs：{characterItemIds.join(", ")}；装备池：{equipmentSummary}
        </p>
      </details>
    </div>
  );
}
