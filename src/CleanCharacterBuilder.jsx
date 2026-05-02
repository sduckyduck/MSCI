import { useEffect, useMemo, useRef, useState } from "react";
import FastCharacterBuilder from "./FastCharacterBuilder";

const FIXED_SKIN_ID = 2000;
const PIRATE_ROLE_CODES = new Set(["BRAW", "GUNR"]);

const PIRATE_HAIR = {
  male: [30000, 30040, 30100, 30170, 30240, 30340],
  female: [31000, 31050, 31100, 31220, 31320, 31380],
};

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
  GUNR: [
    [1002610, 1052095, 1072288, 1492000],
    [1002613, 1040106, 1060094, 1072288, 1492001],
    [1492000],
  ],
};

function forceDefaultSkin(root) {
  if (!root) return;

  root.querySelectorAll("img.msio-character-img").forEach((image) => {
    const currentSrc = image.getAttribute("src") || "";
    const nextSrc = currentSrc.replace(/\/Character\/\d+\//, `/Character/${FIXED_SKIN_ID}/`);

    if (nextSrc && nextSrc !== currentSrc) {
      image.setAttribute("src", nextSrc);
    }
  });
}

function randomFrom(items) {
  return items[Math.floor(Math.random() * items.length)] || items[0];
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
    const emote = roleCode === "GUNR" ? "wink" : "angry";
    const loadouts = PIRATE_LOADOUTS[roleCode] || PIRATE_LOADOUTS.BRAW;
    return {
      hair: randomFrom(PIRATE_HAIR[gender]),
      face: randomFrom(PIRATE_FACE[gender]),
      emote,
      action: roleCode === "GUNR" ? "stand1" : "stand2",
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
        <span>国服海盗装备池</span>
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

    forceDefaultSkin(root);

    const observer = new MutationObserver(() => {
      forceDefaultSkin(root);
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
