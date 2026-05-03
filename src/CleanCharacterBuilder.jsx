import { useEffect, useMemo, useRef, useState } from "react";
import FastCharacterBuilder from "./FastCharacterBuilder";

const FIXED_SKIN_ID = 2000;
const PIRATE_ROLE_CODES = new Set(["BRAW", "GUNS"]);
const GENDER_STORAGE_KEY = "msci-character-gender";
const GENDER_EVENT_NAME = "msci-character-gender-change";
const HAIR_COLOR_OFFSETS = [0, 1, 2, 3, 4, 5, 6, 7];

const HAIR_STYLE_IDS = {
  male: [
    30000, 30020, 30030, 30040, 30050, 30060, 30110, 30120, 30130, 30140,
    30150, 30160, 30170, 30180, 30190, 30200, 30210, 30220, 30230, 30240,
    30250, 30260, 30270, 30280, 30290, 30300, 30310, 30320, 30330, 30340,
    30350, 30360, 30370, 30380, 30400, 30410, 30420, 30440, 30450, 30460,
    30470, 30480, 30490, 30510, 30520, 30530, 30540, 30550, 30560, 30570,
    30580, 30590, 30600, 30610, 30620, 30630, 30640, 30650, 30660, 30670,
    30680, 30690, 30700, 30710, 30720, 30730, 30740, 30750, 30760, 30770,
    30780, 30790, 30800, 30810, 30820, 30830, 30840, 30850, 30860, 30870,
    30880, 30890, 30900, 30910, 30920, 30930, 35340, 35350,
  ],
  female: [
    31000, 31010, 31020, 31030, 31040, 31050, 31060, 31070, 31080, 31090,
    31100, 31110, 31120, 31130, 31140, 31150, 31160, 31170, 31180, 31190,
    31200, 31210, 31220, 31230, 31240, 31250, 31260, 31270, 31280, 31290,
    31300, 31310, 31320, 31330, 31340, 31350, 31360, 31370, 31380, 31420,
    31430, 31440, 31450, 31460, 31470, 31480, 31490, 31500, 31520, 31530,
    31540, 31550, 31560, 31570, 31580, 31590, 31600, 31610, 31620, 31630,
    31640, 31650, 31660, 31670, 31680, 31690, 31700, 31710, 31720, 31730,
    31740, 31750, 31760, 31770, 31780, 31790, 31800, 31810, 31820, 31830,
    31840, 31850, 31860, 31870, 31880, 31890, 31900, 31910, 31920, 31930,
    31940, 31950, 31960, 31970, 31980, 31990, 32000, 34010, 34020, 34030,
    34040, 34090, 34100, 34110, 34120, 34130, 34140, 34150, 34160, 34170,
    34180, 34190, 34200, 34210, 34230, 34240, 34250, 34260, 34270, 34280,
    34290, 34300, 34310, 34320, 34330, 34340, 34350, 34360, 34370, 34380,
    34400, 34410, 34420, 34430, 34440, 34450, 34470, 34480, 34490, 34510,
    34540, 34560, 34580, 34590, 34600, 34610, 34620, 34630, 34640, 34650,
    34660, 34670, 34680, 34690, 34700, 34710, 34720, 34730, 34740, 34750,
    34760, 34770, 34780, 34790, 34800, 34810, 34820, 34830, 34840, 34850,
    34860, 34870, 34880, 34890, 34900, 34910, 34940, 34950, 34960, 34970,
    34980, 37000, 37010, 37020, 37030, 37040, 37060, 37070, 37080, 37090,
    37100, 37110, 37120, 37130, 37140, 37150, 37160, 37170, 37180, 37190,
    37200, 37210, 37220, 37230, 37300, 37310, 37320, 37340, 37370, 37380,
    37420, 37450, 37460, 37470, 37500, 37560, 37580, 37600, 37610, 37620,
    37630, 32560, 37760, 37770, 37780, 37790, 37800, 37810, 37820, 37830,
    37840, 37850, 37860, 37910, 37920, 37930, 37940, 37950, 37960, 37970,
    37980, 37990, 38000, 38010, 38020, 38030, 38040, 38050, 38060, 38070,
    38080, 38090, 38100, 38110, 38120, 38130, 38140, 38150, 38160, 38170,
    38240, 38250, 38260, 38270, 38280, 38290, 38300, 38310, 38320, 38330,
    38340, 38350, 38360, 38370, 38380, 38390, 38400, 38410, 38420, 38430,
    38440, 38450, 38460, 38470, 38480, 38490, 38500, 38510, 38520, 39040,
  ],
};

const FACE_IDS = {
  male: [20000, 20001, 20002, 20003, 20004, 20005, 20006, 20007, 20008, 20009, 20010, 20011, 20012, 20013, 20014],
  female: [21000, 21001, 21002, 21003, 21004, 21005, 21006, 21007, 21008, 21009, 21010, 21011, 21012, 21013, 21014],
};

const HAIR_COLOR_POOLS = {
  male: expandHairColors(HAIR_STYLE_IDS.male),
  female: expandHairColors(HAIR_STYLE_IDS.female),
};

const HAIR_ID_SETS = {
  male: new Set(HAIR_COLOR_POOLS.male),
  female: new Set(HAIR_COLOR_POOLS.female),
};

const PIRATE_HAIR = HAIR_COLOR_POOLS;

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

function expandHairColors(styleIds) {
  const ids = new Set();
  for (const styleId of styleIds || []) {
    const baseId = Math.floor(Number(styleId) / 10) * 10;
    for (const offset of HAIR_COLOR_OFFSETS) ids.add(baseId + offset);
  }
  return [...ids];
}

function normalizeGender(value) {
  const key = String(value || "").trim().toLowerCase();
  return key === "male" || key === "female" ? key : "";
}

function getStoredGender() {
  if (typeof window === "undefined") return "";
  try {
    return normalizeGender(window.localStorage.getItem(GENDER_STORAGE_KEY));
  } catch {
    return "";
  }
}

function setStoredGender(gender) {
  const normalized = normalizeGender(gender);
  if (!normalized || typeof window === "undefined") return;

  try {
    window.localStorage.setItem(GENDER_STORAGE_KEY, normalized);
  } catch {
    // Ignore storage failures.
  }

  window.dispatchEvent(new CustomEvent(GENDER_EVENT_NAME, { detail: { gender: normalized } }));
}

function inferGenderFromHairId(hairId) {
  const id = Number(hairId);
  if (!Number.isFinite(id)) return null;

  const baseStyleId = Math.floor(id / 10) * 10;
  if (HAIR_ID_SETS.female.has(id) || HAIR_ID_SETS.female.has(baseStyleId)) return "female";
  if (HAIR_ID_SETS.male.has(id) || HAIR_ID_SETS.male.has(baseStyleId)) return "male";

  if (id >= 31000 && id < 40000) return "female";
  if (id >= 30000 && id < 31000) return "male";
  return null;
}

function randomFrom(items) {
  return items[Math.floor(Math.random() * items.length)] || items[0];
}

function getFaceEmote(faceEntry, fallback = "default") {
  const parts = String(faceEntry || "").split(":");
  return parts[1] || fallback;
}

function itemAllowedForGender(entry, gender) {
  const id = Number(String(entry || "").split(":")[0]);
  if (!Number.isFinite(id)) return true;

  const prefix = String(id).slice(0, 4);
  if (gender === "male") return !["1041", "1051", "1061"].includes(prefix);
  if (gender === "female") return !["1040", "1050", "1060"].includes(prefix);
  return true;
}

function normalizeCharacterUrl(currentSrc, preferredGender) {
  const src = String(currentSrc || "");
  if (!src.includes("/Character/")) return src;

  return src.replace(
    /(\/Character\/)(\d+)(\/)([^/]+)(\/[^?]+)(\?.*)?$/,
    (match, characterPrefix, _skin, slash, itemSegment, actionSegment, query = "") => {
      const entries = decodeURIComponent(itemSegment)
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean);

      const gender = normalizeGender(preferredGender) || inferGenderFromHairId(entries[0]) || "female";
      const faceEmote = getFaceEmote(entries[1]);
      const equipmentEntries = entries.slice(2).filter((entry) => itemAllowedForGender(entry, gender));

      const normalizedEntries = [
        String(randomFrom(HAIR_COLOR_POOLS[gender])),
        `${randomFrom(FACE_IDS[gender])}:${faceEmote}`,
        ...equipmentEntries,
      ];

      return `${characterPrefix}${FIXED_SKIN_ID}${slash}${encodeURIComponent(normalizedEntries.join(","))}${actionSegment}${query}`;
    }
  );
}

function normalizeCharacterImages(root, preferredGender) {
  if (!root) return;

  root.querySelectorAll("img.msio-character-img").forEach((image) => {
    const currentSrc = image.getAttribute("src") || "";
    const normalizedGender = normalizeGender(preferredGender) || "female";
    if (!currentSrc) return;

    if (image.dataset.msciNormalizedGender === normalizedGender && image.dataset.msciNormalizedSrc === currentSrc) {
      return;
    }

    const nextSrc = normalizeCharacterUrl(currentSrc, normalizedGender);
    image.dataset.msciNormalizedGender = normalizedGender;
    image.dataset.msciNormalizedSrc = nextSrc || currentSrc;

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

function PirateCharacterBuilder({ profile, preferredGender }) {
  const roleCode = String(profile?.code || "BRAW").trim().toUpperCase();
  const [gender, setGender] = useState(() => normalizeGender(preferredGender) || "female");
  const [reroll, setReroll] = useState(0);
  const [useSafeFallback, setUseSafeFallback] = useState(false);

  useEffect(() => {
    const nextGender = normalizeGender(preferredGender);
    if (nextGender) setGender(nextGender);
  }, [preferredGender]);

  useEffect(() => {
    setUseSafeFallback(false);
  }, [roleCode, gender, reroll]);

  const config = useMemo(() => {
    const emote = roleCode === "GUNS" ? "wink" : "angry";
    const loadouts = PIRATE_LOADOUTS[roleCode] || PIRATE_LOADOUTS.BRAW;
    return {
      hair: randomFrom(PIRATE_HAIR[gender]),
      face: randomFrom(FACE_IDS[gender]),
      emote,
      action: roleCode === "GUNS" ? "stand1" : "stand2",
      equipment: useSafeFallback ? [] : randomFrom(loadouts),
    };
  }, [roleCode, gender, reroll, useSafeFallback]);

  const imageUrl = buildMapleStoryIoCharacterUrl(config);

  function toggleGender() {
    const nextGender = gender === "female" ? "male" : "female";
    setGender(nextGender);
    setStoredGender(nextGender);
  }

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
        <button type="button" onClick={toggleGender}>
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
  const [preferredGender, setPreferredGender] = useState(() => getStoredGender() || "female");

  useEffect(() => {
    function handleGenderChange(event) {
      setPreferredGender(normalizeGender(event?.detail?.gender) || getStoredGender() || "female");
    }

    window.addEventListener(GENDER_EVENT_NAME, handleGenderChange);
    window.addEventListener("storage", handleGenderChange);
    return () => {
      window.removeEventListener(GENDER_EVENT_NAME, handleGenderChange);
      window.removeEventListener("storage", handleGenderChange);
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    root.querySelectorAll("img.msio-character-img").forEach((image) => {
      image.dataset.msciNormalizedSrc = "";
      image.dataset.msciNormalizedGender = "";
    });

    normalizeCharacterImages(root, preferredGender);

    const observer = new MutationObserver(() => {
      normalizeCharacterImages(root, preferredGender);
    });

    observer.observe(root, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["src"],
    });

    return () => observer.disconnect();
  }, [preferredGender]);

  return (
    <div ref={rootRef} className="clean-character-builder">
      <style>{`
        .clean-character-builder .builder-summary span {
          display: none !important;
        }
      `}</style>
      {isPirate ? <PirateCharacterBuilder {...props} preferredGender={preferredGender} /> : <FastCharacterBuilder {...props} />}
    </div>
  );
}

export default CleanCharacterBuilder;
