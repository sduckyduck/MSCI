import { useMemo, useState } from "react";

const MS_REGION = "GMS";
const MS_VERSION = "83";
const DEFAULT_ACTION = "stand1";

const SKIN_OPTIONS = [
  { id: 2000, label: "普通皮肤" },
  { id: 2001, label: "白皙皮肤" },
  { id: 2002, label: "偏暖皮肤" },
  { id: 2003, label: "健康皮肤" },
];

const HAIR_OPTIONS = {
  male: [30000, 30020, 30030, 30040],
  female: [31000, 31040, 31050, 31060],
};

const FACE_OPTIONS = {
  male: [20000, 20001, 20002, 20003],
  female: [21000, 21001, 21002, 21003],
};

const GENDER_OPTIONS = [
  { id: "male", label: "男" },
  { id: "female", label: "女" },
];

const EMOTES = ["default", "wink", "smile", "angry", "blink", "bewildered"];

const ROLE_PRESETS = {
  SLAY: {
    label: "剑客",
    action: "stand2",
    emote: "angry",
    equipmentSets: [
      [1002001, 1040002, 1060016, 1072001, 1082002, 1102000, 1402000],
      [1002001, 1040002, 1060002, 1072001, 1082002, 1402000],
      [1040002, 1060016, 1072001, 1102000, 1402000],
    ],
  },
  SHLD: {
    label: "准骑士",
    action: "stand1",
    emote: "default",
    equipmentSets: [
      [1002001, 1040002, 1060002, 1072001, 1082002, 1102000, 1302000, 1092000],
      [1002001, 1040002, 1060016, 1072001, 1082002, 1302000, 1092000],
      [1040002, 1060002, 1072001, 1102000, 1302000, 1092000],
    ],
  },
  POLE: {
    label: "枪战士",
    action: "stand2",
    emote: "default",
    equipmentSets: [
      [1002001, 1040002, 1060016, 1072001, 1082002, 1102000, 1432000],
      [1002001, 1040002, 1060002, 1072001, 1082002, 1442000],
      [1040002, 1060016, 1072001, 1102000, 1432000],
    ],
  },
  ZAPZ: {
    label: "冰雷法师",
    action: "stand1",
    emote: "bewildered",
    equipmentSets: [
      [1002019, 1050003, 1072001, 1082002, 1102000, 1032000, 1372000],
      [1002019, 1050003, 1072001, 1082002, 1372000],
      [1050003, 1072001, 1102000, 1032000, 1382000],
    ],
  },
  TOXI: {
    label: "火毒法师",
    action: "stand1",
    emote: "wink",
    equipmentSets: [
      [1002019, 1050003, 1072001, 1082002, 1102000, 1032000, 1382000],
      [1002019, 1050003, 1072001, 1082002, 1372000],
      [1050003, 1072001, 1102000, 1032000, 1382000],
    ],
  },
  HEAL: {
    label: "牧师",
    action: "stand1",
    emote: "smile",
    equipmentSets: [
      [1002019, 1050003, 1072001, 1082002, 1102000, 1032000, 1372000],
      [1050003, 1072001, 1082002, 1102000, 1372000],
      [1002019, 1050003, 1072001, 1032000, 1382000],
    ],
  },
  STAR: {
    label: "刺客",
    action: "stand1",
    emote: "wink",
    equipmentSets: [
      [1002170, 1040002, 1060043, 1072001, 1082002, 1102000, 1032000, 1472000],
      [1002170, 1040002, 1060002, 1072001, 1082002, 1472000],
      [1040002, 1060043, 1072001, 1102000, 1032000, 1472000],
    ],
  },
  STAB: {
    label: "侠盗",
    action: "stand1",
    emote: "angry",
    equipmentSets: [
      [1002170, 1040002, 1060043, 1072001, 1082002, 1102000, 1032000, 1332000, 1092000],
      [1002170, 1040002, 1060002, 1072001, 1082002, 1332000, 1092000],
      [1040002, 1060043, 1072001, 1102000, 1332000, 1092000],
    ],
  },
  KITE: {
    label: "猎人",
    action: "stand1",
    emote: "default",
    equipmentSets: [
      [1002165, 1040002, 1060056, 1072001, 1082002, 1102000, 1032000, 1452000],
      [1002165, 1040002, 1060002, 1072001, 1082002, 1452000],
      [1040002, 1060056, 1072001, 1102000, 1032000, 1452000],
    ],
  },
  SNIP: {
    label: "弩弓手",
    action: "stand2",
    emote: "blink",
    equipmentSets: [
      [1002165, 1040002, 1060056, 1072001, 1082002, 1102000, 1032000, 1462000],
      [1002165, 1040002, 1060002, 1072001, 1082002, 1462000],
      [1040002, 1060056, 1072001, 1102000, 1032000, 1462000],
    ],
  },
};

function normalizeRoleCode(profile) {
  return String(profile?.code || "SLAY").trim().toUpperCase();
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

function pickByVariant(values, variant, offset = 0) {
  if (!values?.length) return null;
  return values[Math.abs(variant + offset) % values.length];
}

function getEquipmentSet(preset, variant) {
  const sets = preset.equipmentSets || [preset.equipment || []];
  return pickByVariant(sets, variant, 0) || [];
}

function makeCharacterConfig({ roleCode, gender, variant }) {
  const preset = ROLE_PRESETS[roleCode] || ROLE_PRESETS.SLAY;

  return {
    skin: pickByVariant(SKIN_OPTIONS, variant, roleCode.length)?.id || 2000,
    hair: pickByVariant(HAIR_OPTIONS[gender], variant, 1),
    face: pickByVariant(FACE_OPTIONS[gender], variant, 2),
    emote: variant === 0 ? preset.emote : pickByVariant(EMOTES, variant, 3),
    equipment: getEquipmentSet(preset, variant),
    action: preset.action || DEFAULT_ACTION,
  };
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

function FastCharacterBuilder({ profile }) {
  const roleCode = normalizeRoleCode(profile);
  const preset = ROLE_PRESETS[roleCode] || ROLE_PRESETS.SLAY;
  const [gender, setGender] = useState("female");
  const [variant, setVariant] = useState(0);
  const [imageError, setImageError] = useState(false);

  const config = useMemo(
    () => makeCharacterConfig({ roleCode, gender, variant }),
    [roleCode, gender, variant]
  );

  const imageSrc = useMemo(() => buildMapleStoryIoCharacterUrl(config), [config]);
  const equipmentSetNumber = (Math.abs(variant) % (preset.equipmentSets?.length || 1)) + 1;

  function updateGender(nextGender) {
    setGender(nextGender);
    setImageError(false);
  }

  function randomizePreview() {
    setVariant((value) => value + 1);
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
          <span>{preset.label} · {gender === "female" ? "女" : "男"} · 装备 {equipmentSetNumber}</span>
        </summary>

        <div className="builder-control-head">
          <b>显示设置</b>
          <div className="builder-button-row">
            <button type="button" className="ghost-btn small-btn" onClick={randomizePreview}>
              随机外观和装备
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
      </details>
    </div>
  );
}

export default FastCharacterBuilder;
