import { useEffect, useMemo, useState } from "react";

const MS_REGION = "GMS";
const MS_VERSION = "83";

// Same MapleStory.IO render pattern used in the guidebook character preview.
// The API renders a composed character directly from item IDs.
function buildMapleStoryIoCharacterUrl(itemIds, action = "stand1") {
  const parts = itemIds.map((id) =>
    JSON.stringify({
      ItemId: Number(id),
      Version: MS_VERSION,
      Region: MS_REGION,
    })
  );

  return `https://maplestory.io/api/character/${encodeURIComponent(parts.join(","))}/${action}/0?resize=3&renderMode=Full&bgColor=0,0,0,0`;
}

const BASE_ITEMS_BY_GENDER = {
  male: [2000, 12000],
  female: [2000, 12000],
};

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

const GENDER_OPTIONS = [
  { id: "male", label: "男" },
  { id: "female", label: "女" },
];

const OUTFIT_OPTIONS = [
  { id: "beginner", label: "初心冒险家", items: [1040002, 1060002, 1072001] },
  { id: "warrior-blue", label: "蓝甲战士", items: [1002001, 1040021, 1060016, 1072005] },
  { id: "paladin-white", label: "白金骑士", items: [1002028, 1040036, 1060026, 1072039] },
  { id: "mage-purple", label: "紫袍法师", items: [1002019, 1050003, 1072072] },
  { id: "cleric-mint", label: "薄荷牧师", items: [1002034, 1050031, 1072045] },
  { id: "archer-green", label: "绿林射手", items: [1002165, 1040067, 1060056, 1072081] },
  { id: "rogue-night", label: "夜行飞侠", items: [1002170, 1040057, 1060043, 1072032] },
  { id: "toxic-lab", label: "毒药研究员", items: [1002019, 1050035, 1072072] },
];

const WEAPON_OPTIONS = [
  { id: "none", label: "无武器", items: [] },
  { id: "sword", label: "单手剑", items: [1302000] },
  { id: "shield", label: "剑盾", items: [1302000, 1092000] },
  { id: "spear", label: "长枪", items: [1432000] },
  { id: "polearm", label: "枪战士长柄", items: [1442000] },
  { id: "wand", label: "短杖", items: [1372005] },
  { id: "staff", label: "长杖", items: [1382000] },
  { id: "bow", label: "弓", items: [1452002] },
  { id: "crossbow", label: "弩", items: [1462001] },
  { id: "dagger", label: "短刀", items: [1332000] },
  { id: "claw", label: "拳套 / 飞镖", items: [1472000] },
];

const ACCESSORY_OPTIONS = [
  { id: "none", label: "无饰品", items: [] },
  { id: "cape", label: "披风", items: [1102000] },
  { id: "earring", label: "耳环", items: [1032000] },
  { id: "glove", label: "手套", items: [1082002] },
  { id: "cape-glove", label: "披风 + 手套", items: [1102000, 1082002] },
];

const ROLE_PRESETS = {
  SLAY: { outfit: "warrior-blue", weapon: "sword", accessory: "cape" },
  SHLD: { outfit: "paladin-white", weapon: "shield", accessory: "cape" },
  POLE: { outfit: "warrior-blue", weapon: "polearm", accessory: "glove" },
  ZAPZ: { outfit: "mage-purple", weapon: "staff", accessory: "cape" },
  TOXI: { outfit: "toxic-lab", weapon: "staff", accessory: "earring" },
  HEAL: { outfit: "cleric-mint", weapon: "wand", accessory: "cape" },
  STAR: { outfit: "rogue-night", weapon: "claw", accessory: "glove" },
  STAB: { outfit: "rogue-night", weapon: "dagger", accessory: "cape-glove" },
  KITE: { outfit: "archer-green", weapon: "bow", accessory: "cape" },
  SNIP: { outfit: "archer-green", weapon: "crossbow", accessory: "glove" },
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

function getRoleWeaponPool(code) {
  const group = CODE_TO_GROUP[code];
  if (group === "warrior") return ["sword", "shield", "spear", "polearm"];
  if (group === "magician") return ["wand", "staff"];
  if (group === "archer") return ["bow", "crossbow"];
  if (group === "thief") return ["dagger", "claw"];
  return WEAPON_OPTIONS.map((option) => option.id);
}

function makeConfigForProfile(profile, randomize = true) {
  const code = profile?.code || "SLAY";
  const base = ROLE_PRESETS[code] || ROLE_PRESETS.SLAY;
  const group = CODE_TO_GROUP[code] || "warrior";
  const gender = randomize ? pick(GENDER_OPTIONS).id : "female";
  const hair = pick(HAIR_OPTIONS[gender]).id;
  const face = pick(FACE_OPTIONS[gender]).id;
  const outfitPool = ROLE_RANDOM_POOLS[group] || OUTFIT_OPTIONS.map((option) => option.id);
  const weaponPool = getRoleWeaponPool(code);

  return {
    gender,
    hair,
    face,
    outfit: randomize ? pick(outfitPool) : base.outfit,
    weapon: randomize ? pick(weaponPool) : base.weapon,
    accessory: randomize ? pick(ACCESSORY_OPTIONS).id : base.accessory,
  };
}

function makeFullyRandomConfig() {
  const gender = pick(GENDER_OPTIONS).id;
  return {
    gender,
    hair: pick(HAIR_OPTIONS[gender]).id,
    face: pick(FACE_OPTIONS[gender]).id,
    outfit: pick(OUTFIT_OPTIONS).id,
    weapon: pick(WEAPON_OPTIONS).id,
    accessory: pick(ACCESSORY_OPTIONS).id,
  };
}

function getActionForWeapon(weaponId) {
  const option = getOption(WEAPON_OPTIONS, weaponId);
  const twoHandPrefixes = new Set([138, 140, 141, 142, 143, 144, 145, 146]);

  for (const id of option.items) {
    const prefix = Math.floor(Number(id) / 10000);
    if (twoHandPrefixes.has(prefix)) return "stand2";
  }

  return "stand1";
}

function buildItemIds(config) {
  const outfit = getOption(OUTFIT_OPTIONS, config.outfit);
  const weapon = getOption(WEAPON_OPTIONS, config.weapon);
  const accessory = getOption(ACCESSORY_OPTIONS, config.accessory);

  return [
    ...(BASE_ITEMS_BY_GENDER[config.gender] || BASE_ITEMS_BY_GENDER.male),
    Number(config.hair),
    Number(config.face),
    ...outfit.items,
    ...weapon.items,
    ...accessory.items,
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
  const defaultConfig = useMemo(() => makeConfigForProfile(profile, true), [profile?.code]);
  const [config, setConfig] = useState(defaultConfig);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setConfig(defaultConfig);
    setImageFailed(false);
  }, [defaultConfig]);

  const itemIds = useMemo(() => buildItemIds(config), [config]);
  const action = useMemo(() => getActionForWeapon(config.weapon), [config.weapon]);
  const imageUrl = useMemo(() => buildMapleStoryIoCharacterUrl(itemIds, action), [itemIds, action]);

  const hairOptions = HAIR_OPTIONS[config.gender] || HAIR_OPTIONS.male;
  const faceOptions = FACE_OPTIONS[config.gender] || FACE_OPTIONS.male;

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
    setConfig(makeConfigForProfile(profile, true));
  }

  function resetRecommended() {
    setImageFailed(false);
    setConfig(makeConfigForProfile(profile, false));
  }

  function randomizeAll() {
    setImageFailed(false);
    setConfig(makeFullyRandomConfig());
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

      <div className="character-builder-controls" data-html2canvas-ignore="true">
        <div className="builder-control-head">
          <b>自定义 API 角色</b>
          <div className="builder-button-row">
            <button type="button" className="ghost-btn small-btn" onClick={resetRecommended}>结果推荐</button>
            <button type="button" className="primary-btn small-btn" onClick={randomizeForResult}>本职业随机</button>
            <button type="button" className="ghost-btn small-btn" onClick={randomizeAll}>全随机</button>
          </div>
        </div>

        <div className="builder-grid">
          <SelectField label="性别" value={config.gender} options={GENDER_OPTIONS} onChange={(value) => updateConfig("gender", value)} />
          <SelectField label="发型" value={String(config.hair)} options={hairOptions} onChange={(value) => updateConfig("hair", Number(value))} />
          <SelectField label="脸型" value={String(config.face)} options={faceOptions} onChange={(value) => updateConfig("face", Number(value))} />
          <SelectField label="NX / 装备" value={config.outfit} options={OUTFIT_OPTIONS} onChange={(value) => updateConfig("outfit", value)} />
          <SelectField label="武器" value={config.weapon} options={WEAPON_OPTIONS} onChange={(value) => updateConfig("weapon", value)} />
          <SelectField label="饰品" value={config.accessory} options={ACCESSORY_OPTIONS} onChange={(value) => updateConfig("accessory", value)} />
        </div>

        <p className="builder-note">
          使用 MapleStory.IO GMS v83 API 实时生成；当前动作：{action}｜Item IDs：{itemIds.join(", ")}
        </p>
      </div>
    </div>
  );
}
