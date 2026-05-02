import { useEffect, useMemo, useState } from "react";

const ASSET_BASE = `${import.meta.env.BASE_URL}character-assets`;

const OPTION_GROUPS = {
  gender: [
    { id: "male", label: "男" },
    { id: "female", label: "女" },
  ],
  hair: [
    { id: "short-black", label: "黑短发" },
    { id: "side-bangs", label: "侧分黑发" },
    { id: "twin-buns", label: "双丸子" },
    { id: "long-black", label: "黑长发" },
  ],
  face: [
    { id: "sharp", label: "锐利脸" },
    { id: "cute", label: "可爱脸" },
    { id: "calm", label: "冷静脸" },
    { id: "sleepy", label: "佛系脸" },
  ],
  expression: [
    { id: "neutral", label: "淡定" },
    { id: "smile", label: "微笑" },
    { id: "cool", label: "装酷" },
    { id: "angry", label: "认真" },
  ],
  nx: [
    { id: "starter", label: "初心套" },
    { id: "mage-purple", label: "紫法袍" },
    { id: "priest-mint", label: "圣职薄荷" },
    { id: "rogue-night", label: "夜行套" },
    { id: "archer-green", label: "绿林套" },
    { id: "knight-blue", label: "蓝骑士" },
    { id: "toxic-lab", label: "毒药师" },
  ],
  weapon: [
    { id: "none", label: "无武器" },
    { id: "sword", label: "单手剑" },
    { id: "spear", label: "长枪" },
    { id: "staff", label: "法杖" },
    { id: "bow", label: "弓" },
    { id: "crossbow", label: "弩" },
    { id: "dagger", label: "短刀" },
    { id: "throwing-star", label: "飞镖" },
  ],
  accessory: [
    { id: "none", label: "无饰品" },
    { id: "cap", label: "帽子" },
    { id: "hood", label: "兜帽" },
    { id: "scarf", label: "围巾" },
    { id: "wizard-hat", label: "巫师帽" },
    { id: "halo", label: "光环" },
  ],
};

const ROLE_PRESETS = {
  TOXI: { gender: "female", hair: "twin-buns", face: "sharp", expression: "cool", nx: "toxic-lab", weapon: "staff", accessory: "hood" },
  ZAPZ: { gender: "female", hair: "side-bangs", face: "sharp", expression: "cool", nx: "mage-purple", weapon: "staff", accessory: "wizard-hat" },
  HEAL: { gender: "female", hair: "long-black", face: "cute", expression: "smile", nx: "priest-mint", weapon: "staff", accessory: "halo" },
  STAR: { gender: "female", hair: "side-bangs", face: "sharp", expression: "cool", nx: "rogue-night", weapon: "throwing-star", accessory: "scarf" },
  STAB: { gender: "female", hair: "twin-buns", face: "sharp", expression: "angry", nx: "rogue-night", weapon: "dagger", accessory: "scarf" },
  KITE: { gender: "female", hair: "side-bangs", face: "calm", expression: "neutral", nx: "archer-green", weapon: "bow", accessory: "cap" },
  SNIP: { gender: "female", hair: "short-black", face: "calm", expression: "cool", nx: "archer-green", weapon: "crossbow", accessory: "cap" },
  SLAY: { gender: "female", hair: "side-bangs", face: "sharp", expression: "angry", nx: "knight-blue", weapon: "sword", accessory: "none" },
  SHLD: { gender: "female", hair: "short-black", face: "calm", expression: "neutral", nx: "knight-blue", weapon: "sword", accessory: "none" },
  POLE: { gender: "female", hair: "side-bangs", face: "sharp", expression: "neutral", nx: "knight-blue", weapon: "spear", accessory: "none" },
};

const FALLBACK_COLORS = {
  starter: "#d9bd83",
  "mage-purple": "#55317a",
  "priest-mint": "#9edbc5",
  "rogue-night": "#322b57",
  "archer-green": "#557b3d",
  "knight-blue": "#385f88",
  "toxic-lab": "#476b37",
};

function randomItem(options) {
  return options[Math.floor(Math.random() * options.length)]?.id;
}

function makeRandomConfig() {
  return Object.fromEntries(
    Object.entries(OPTION_GROUPS).map(([key, options]) => [key, randomItem(options)])
  );
}

function configFromProfile(profile) {
  return ROLE_PRESETS[profile?.code] || makeRandomConfig();
}

function assetPath(type, id) {
  return `${ASSET_BASE}/${type}/${id}.png`;
}

function AssetLayer({ type, id, className }) {
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    setMissing(false);
  }, [type, id]);

  if (!id || id === "none" || missing) return null;

  return (
    <img
      className={`builder-layer ${className || ""}`}
      src={assetPath(type, id)}
      alt=""
      aria-hidden="true"
      draggable="false"
      onError={() => setMissing(true)}
    />
  );
}

function CharacterFallback({ config }) {
  const outfitColor = FALLBACK_COLORS[config.nx] || FALLBACK_COLORS.starter;

  return (
    <div
      className="fallback-character"
      data-gender={config.gender}
      data-hair={config.hair}
      data-face={config.face}
      data-expression={config.expression}
      data-weapon={config.weapon}
      data-accessory={config.accessory}
      style={{ "--outfit-color": outfitColor }}
      aria-hidden="true"
    >
      <span className="fallback-shadow" />
      <span className="fallback-weapon" />
      <span className="fallback-cape" />
      <span className="fallback-body" />
      <span className="fallback-neck" />
      <span className="fallback-head" />
      <span className="fallback-hair" />
      <span className="fallback-eye fallback-eye-left" />
      <span className="fallback-eye fallback-eye-right" />
      <span className="fallback-mouth" />
      <span className="fallback-accessory" />
      <span className="fallback-prop" />
    </div>
  );
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
  const defaultConfig = useMemo(() => configFromProfile(profile), [profile?.code]);
  const [config, setConfig] = useState(defaultConfig);

  useEffect(() => {
    setConfig(defaultConfig);
  }, [defaultConfig]);

  function updateConfig(key, value) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="character-builder">
      <div className="character-preview-card">
        <div className="character-preview-bg" data-role={profile?.code || "MSCI"}>
          <CharacterFallback config={config} />
          <div className="character-asset-stage" aria-hidden="true">
            <AssetLayer type="body" id={config.gender} className="layer-body" />
            <AssetLayer type="face" id={config.face} className="layer-face" />
            <AssetLayer type="expression" id={config.expression} className="layer-expression" />
            <AssetLayer type="hair" id={config.hair} className="layer-hair" />
            <AssetLayer type="nx" id={config.nx} className="layer-nx" />
            <AssetLayer type="weapon" id={config.weapon} className="layer-weapon" />
            <AssetLayer type="accessory" id={config.accessory} className="layer-accessory" />
          </div>
        </div>
      </div>

      <div className="character-builder-controls" data-html2canvas-ignore="true">
        <div className="builder-control-head">
          <b>自定义角色卡片</b>
          <div className="builder-button-row">
            <button type="button" className="ghost-btn small-btn" onClick={() => setConfig(configFromProfile(profile))}>按结果推荐</button>
            <button type="button" className="primary-btn small-btn" onClick={() => setConfig(makeRandomConfig())}>随机搭配</button>
          </div>
        </div>

        <div className="builder-grid">
          <SelectField label="性别" value={config.gender} options={OPTION_GROUPS.gender} onChange={(value) => updateConfig("gender", value)} />
          <SelectField label="发型" value={config.hair} options={OPTION_GROUPS.hair} onChange={(value) => updateConfig("hair", value)} />
          <SelectField label="脸型" value={config.face} options={OPTION_GROUPS.face} onChange={(value) => updateConfig("face", value)} />
          <SelectField label="表情" value={config.expression} options={OPTION_GROUPS.expression} onChange={(value) => updateConfig("expression", value)} />
          <SelectField label="NX / 装备" value={config.nx} options={OPTION_GROUPS.nx} onChange={(value) => updateConfig("nx", value)} />
          <SelectField label="武器" value={config.weapon} options={OPTION_GROUPS.weapon} onChange={(value) => updateConfig("weapon", value)} />
          <SelectField label="饰品" value={config.accessory} options={OPTION_GROUPS.accessory} onChange={(value) => updateConfig("accessory", value)} />
        </div>
        <p className="builder-note">本地素材放到 public/character-assets/ 对应文件夹后，会自动覆盖占位角色。</p>
      </div>
    </div>
  );
}
