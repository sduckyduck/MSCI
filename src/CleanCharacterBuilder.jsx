import { useEffect, useMemo, useRef, useState } from "react";
import FastCharacterBuilder from "./FastCharacterBuilder";

const FIXED_SKIN_ID = 2000;
const PIRATE_ROLE_CODES = new Set(["BRAW", "GUNS"]);

const HAIR_COLOR_OFFSETS = [0, 1, 2, 3, 4, 5, 6, 7];

const HAIR_STYLE_BASE_IDS = {
  male: [
    30000, 30010, 30020, 30030, 30040, 30050, 30060, 30070, 30080, 30090,
    30100, 30110, 30120, 30130, 30140, 30150, 30160, 30170, 30180, 30190,
    30200, 30210, 30220, 30230, 30240, 30250, 30260, 30270, 30280, 30290,
    30300, 30310, 30320, 30330, 30340, 30350, 30360, 30370, 30380,
  ],
  female: [
    31000, 31010, 31020, 31030, 31040, 31050, 31060, 31070, 31080, 31090,
    31100, 31110, 31120, 31130, 31140, 31150, 31160, 31170, 31180, 31190,
    31200, 31210, 31220, 31230, 31240, 31250, 31260, 31270, 31280, 31290,
    31300, 31310, 31320, 31330, 31340, 31350, 31360, 31370, 31380,
  ],
};

const FULL_HAIR_POOL = {
  male: expandHairPool(HAIR_STYLE_BASE_IDS.male),
  female: expandHairPool(HAIR_STYLE_BASE_IDS.female),
};

const PIRATE_HAIR = FULL_HAIR_POOL;

const PIRATE_FACE = {
  male: [20000, 20003, 20004, 20005, 20011],
  female: [21000, 21003, 21004, 21009, 21014],
};

const PIRATE_LOADOUTS = {
  BRAW: [
    [1002610, 1052095, 1072288, 1482000],
    [1002613, 1040106, 1060094, 1072288, 1482001],
    [1482000],
  ],
  GUNS: [
    [1002610, 1052095, 1072288, 1492000],
    [1002613, 1040106, 1060094, 1072288, 1492001],
    [1492000],
  ],
};

function expandHairPool(baseIds) {
  return (baseIds || []).flatMap((baseId) => HAIR_COLOR_OFFSETS.map((offset) => baseId + offset));
}

function inferGenderFromHairId(hairId) {
  const id = Number(hairId);
  if (id >= 31000 && id < 32000) return "female";
  if (id >= 30000 && id < 31000) return "male";
  return null;
}

function randomFrom(items) {
  return items[Math.floor(Math.random() * items.length)] || items[0];
}

function normalizeCharacterUrl(currentSrc) {
  const src = String(currentSrc || "");
  if (!src.includes("/Character/")) return src;

  return src.replace(
    /(\/Character\/)(\d+)(\/)([^/]+)(\/[^?]+)(\?.*)?$/,
    (match, characterPrefix, _skin, slash, itemSegment, actionSegment, query = "") => {
      const entries = decodeURIComponent(itemSegment)
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean);

      const gender = inferGenderFromHairId(entries[0]);
      if (gender && FULL_HAIR_POOL[gender]?.length) {
        entries[0] = String(randomFrom(FULL_HAIR_POOL[gender]));
      }

      return `${characterPrefix}${FIXED_SKIN_ID}${slash}${encodeURIComponent(entries.join(","))}${actionSegment}${query}`;
    }
  );
}

function normalizeCharacterImages(root) {
  if (!root) return;

  root.querySelectorAll("img.msio-character-img").forEach((image) => {
    const currentSrc = image.getAttribute("src") || "";
    if (!currentSrc || currentSrc === image.dataset.msciNormalizedSrc) return;

    const nextSrc = normalizeCharacterUrl(currentSrc);
    image.dataset.msciNormalizedSrc = nextSrc;

    if (nextSrc && nextSrc !== currentSrc) {
      image.setAttribute("src", nextSrc);
    }
  });
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
  const action = encodeURIComponent(config.action || "stand1");

  return `https://maplestory.io/api/GMS/83/Character/${FIXED_SKIN_ID}/${itemPath}/${action}/0?resize=3&renderMode=Full&bgColor=0,0,0,0&faceEmote=${encodeURIComponent(faceEmote)}`;
}

function PirateCharacterBuilder({ profile }) {
  const roleCode = String(profile?.code || "BRAW").trim().toUpperCase();
  const [gender, setGender] = useState("female");
  const [reroll, setReroll] = useState(0);
  const [useSafeFallback, setUseSafeFallback] = useState(false);

  useEffect(() => {
    setUseSafeFallback(false);
  }, [roleCode, gender, reroll]);

  const config = useMemo(() => {
    const emote = roleCode === "GUNS" ? "wink" : "angry";
    const loadouts = PIRATE_LOADOUTS[roleCode] || PIRATE_LOADOUTS.BRAW;
    return {
      hair: randomFrom(PIRATE_HAIR[gender]),
      face: randomFrom(PIRATE_FACE[gender]),
      emote,
      action: roleCode === "GUNS" ? "stand1" : "stand2",
      equipment: useSafeFallback ? [] : randomFrom(loadouts),
    };
  }, [roleCode, gender, reroll, useSafeFallback]);

  const imageUrl = buildMapleStoryIoCharacterUrl(config);

  return (
    <div className="pirate-character-builder">
      <div className="builder-preview-frame">
        <img
          className="msio-character-img"
          src={imageUrl}
          alt={`${profile?.name || "海盗"} 角色预览`}
          draggable="false"
          onError={() => {
            if (!useSafeFallback) setUseSafeFallback(true);
          }}
        />
      </div>
      <div className="builder-summary">
        <b>{profile?.name || "海盗"}</b>
        <span>国服海盗装备池 · {PIRATE_HAIR[gender].length} 发型颜色组合</span>
      </div>
      <div className="character-builder-controls" data-export-hidden="true">
        <button type="button" onClick={() => setGender((current) => (current === "female" ? "male" : "female"))}>
          {gender === "female" ? "切换男号" : "切换女号"}
        </button>
        <button type="button" onClick={() => setReroll((current) => current + 1)}>换一套</button>
      </div>
    </div>
  );
}

function CleanCharacterBuilder(props) {
  const rootRef = useRef(null);
  const roleCode = String(props?.profile?.code || "").trim().toUpperCase();
  const isPirate = PIRATE_ROLE_CODES.has(roleCode);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    normalizeCharacterImages(root);

    const observer = new MutationObserver(() => {
      normalizeCharacterImages(root);
    });

    observer.observe(root, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["src"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef} className="clean-character-builder">
      <style>{`
        .clean-character-builder .builder-summary span {
          display: none !important;
        }
      `}</style>
      {isPirate ? <PirateCharacterBuilder {...props} /> : <FastCharacterBuilder {...props} />}
    </div>
  );
}

export default CleanCharacterBuilder;
