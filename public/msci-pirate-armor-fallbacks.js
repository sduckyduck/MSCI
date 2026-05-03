(() => {
  const RETRY_DELAY_MS = 980;
  const RECHECK_DELAY_MS = 1700;
  const PIRATE_ROLES = new Set(["BRAW", "GUNS"]);
  const ZAKUM_HELMET_ID = "1002357";

  const PIRATE_ARMOR_BY_SLOT = {
    Hat: [
      { id: 1002610, name: "Brown Rocky Bandana", reqLevel: 10, slot: "Hat" },
      { id: 1002613, name: "Brown Lagger Cap", reqLevel: 15, slot: "Hat" },
      { id: 1002616, name: "Brown Double Marine", reqLevel: 20, slot: "Hat" },
      { id: 1002619, name: "Brown Pitz Bandana", reqLevel: 25, slot: "Hat" },
      { id: 1002622, name: "White Oceania Cap", reqLevel: 30, slot: "Hat" },
      { id: 1002625, name: "Blue Den Marine", reqLevel: 35, slot: "Hat" },
      { id: 1002628, name: "Red Misty", reqLevel: 40, slot: "Hat" },
      { id: 1002631, name: "Brown Leather Ocean Hat", reqLevel: 50, slot: "Hat" },
      { id: 1002634, name: "Purple Cast Linen", reqLevel: 60, slot: "Hat" },
    ],
    Overall: [
      { id: 1052095, name: "Brown Rocky Suit", reqLevel: 10, slot: "Overall" },
      { id: 1052098, name: "Brown Cotton Lagger", reqLevel: 15, slot: "Overall" },
      { id: 1052101, name: "Beige Carribean", reqLevel: 20, slot: "Overall" },
      { id: 1052104, name: "Brown Turk Gally", reqLevel: 25, slot: "Overall" },
      { id: 1052107, name: "Brown Pollard", reqLevel: 30, slot: "Overall" },
      { id: 1052110, name: "Blue Brace Look", reqLevel: 35, slot: "Overall" },
      { id: 1052113, name: "Red Barbay", reqLevel: 40, slot: "Overall" },
      { id: 1052116, name: "Green Plasteer", reqLevel: 50, slot: "Overall" },
      { id: 1052119, name: "Black Royal Barone", reqLevel: 60, slot: "Overall" },
    ],
    Shoes: [
      { id: 1072285, name: "Brown Lagger Slipper", reqLevel: 15, slot: "Shoes" },
      { id: 1072288, name: "Brown Skeedy Sandals", reqLevel: 20, slot: "Shoes" },
      { id: 1072291, name: "Brown Wooden Krag", reqLevel: 25, slot: "Shoes" },
      { id: 1072294, name: "Brown Paulie Boots", reqLevel: 30, slot: "Shoes" },
      { id: 1072297, name: "Brown Leather Krag", reqLevel: 35, slot: "Shoes" },
      { id: 1072300, name: "Brown Double Boots", reqLevel: 40, slot: "Shoes" },
      { id: 1072303, name: "Black Basile Boots", reqLevel: 50, slot: "Shoes" },
      { id: 1072306, name: "Black Voyson Shoes", reqLevel: 60, slot: "Shoes" },
    ],
    Glove: [
      { id: 1082180, name: "Green Lagger Halfglove", reqLevel: 15, slot: "Glove" },
      { id: 1082183, name: "Brown Leather Armor Glove", reqLevel: 20, slot: "Glove" },
      { id: 1082186, name: "Hard Leather Glove", reqLevel: 25, slot: "Glove" },
      { id: 1082189, name: "Yellow Tartis", reqLevel: 30, slot: "Glove" },
      { id: 1082192, name: "Brown Jeweled", reqLevel: 35, slot: "Glove" },
      { id: 1082195, name: "Brown Barbee", reqLevel: 40, slot: "Glove" },
      { id: 1082198, name: "Brown Royce", reqLevel: 50, slot: "Glove" },
      { id: 1082201, name: "Black Schult", reqLevel: 60, slot: "Glove" },
    ],
  };

  const SLOT_PREFIXES = {
    Hat: ["100"],
    Overall: ["105", "104", "106"],
    Shoes: ["107"],
    Glove: ["108"],
  };

  function currentImg() {
    return document.querySelector("img.msio-character-img");
  }

  function currentRole(img = currentImg()) {
    return String(img?.closest?.(".character-preview-bg")?.dataset?.role || "").toUpperCase();
  }

  function idPart(value) {
    return String(value || "").split(":")[0];
  }

  function entryStartsWith(entry, prefixes) {
    const id = idPart(entry);
    return prefixes.some((prefix) => id.startsWith(prefix));
  }

  function randomItem(items) {
    if (!items?.length) return null;
    return items[Math.floor(Math.random() * items.length)];
  }

  function getCharacterUrlParts(src) {
    const url = new URL(src);
    const parts = url.pathname.split("/");
    const skinIndex = parts.findIndex((part) => part === "2000");
    const itemIndex = skinIndex + 1;
    if (skinIndex < 0 || !parts[itemIndex]) return null;
    return { url, parts, itemIndex };
  }

  function parseEntries(src) {
    const parsed = getCharacterUrlParts(src);
    if (!parsed) return [];
    return decodeURIComponent(parsed.parts[parsed.itemIndex])
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  function replaceEntries(src, updater) {
    const parsed = getCharacterUrlParts(src);
    if (!parsed) return src;
    const { url, parts, itemIndex } = parsed;
    const entries = parseEntries(src);
    parts[itemIndex] = encodeURIComponent(updater(entries).join(","));
    url.pathname = parts.join("/");
    return url.toString();
  }

  function applyPirateArmor(img) {
    if (!img || !img.classList?.contains("msio-character-img")) return;
    const roleCode = currentRole(img);
    if (!PIRATE_ROLES.has(roleCode)) return;

    const currentSrc = img.currentSrc || img.src || "";
    if (!currentSrc || img.dataset.msciPirateArmorAppliedSrc === currentSrc) return;

    const originalEntries = parseEntries(currentSrc);
    if (!originalEntries.length) return;

    const hasHat = originalEntries.some((entry) => entryStartsWith(entry, SLOT_PREFIXES.Hat));
    const hasZakum = originalEntries.some((entry) => idPart(entry) === ZAKUM_HELMET_ID);
    const applied = [];

    let nextSrc = replaceEntries(currentSrc, (entries) => {
      let nextEntries = entries;

      if (hasHat && !hasZakum) {
        const hat = randomItem(PIRATE_ARMOR_BY_SLOT.Hat);
        if (hat) {
          nextEntries = nextEntries.filter((entry) => !entryStartsWith(entry, SLOT_PREFIXES.Hat));
          nextEntries.push(String(hat.id));
          applied.push(`hat: ${hat.name} (${hat.id})`);
        }
      }

      const overall = randomItem(PIRATE_ARMOR_BY_SLOT.Overall);
      if (overall) {
        nextEntries = nextEntries.filter((entry) => !entryStartsWith(entry, SLOT_PREFIXES.Overall));
        nextEntries.push(String(overall.id));
        applied.push(`overall: ${overall.name} (${overall.id})`);
      }

      const shoes = randomItem(PIRATE_ARMOR_BY_SLOT.Shoes);
      if (shoes) {
        nextEntries = nextEntries.filter((entry) => !entryStartsWith(entry, SLOT_PREFIXES.Shoes));
        nextEntries.push(String(shoes.id));
        applied.push(`shoes: ${shoes.name} (${shoes.id})`);
      }

      const glove = randomItem(PIRATE_ARMOR_BY_SLOT.Glove);
      if (glove) {
        nextEntries = nextEntries.filter((entry) => !entryStartsWith(entry, SLOT_PREFIXES.Glove));
        nextEntries.push(String(glove.id));
        applied.push(`glove: ${glove.name} (${glove.id})`);
      }

      return nextEntries;
    });

    if (!nextSrc || nextSrc === currentSrc) return;
    img.dataset.msciPirateArmor = applied.join("; ");
    img.dataset.msciPirateArmorAppliedSrc = nextSrc;
    img.dataset.msciEqualCheckedSrc = nextSrc;
    img.dataset.msciEqualAppliedSrc = nextSrc;
    img.src = nextSrc;
  }

  function scan() {
    document.querySelectorAll("img.msio-character-img").forEach((img) => {
      window.setTimeout(() => applyPirateArmor(img), RETRY_DELAY_MS);
    });
  }

  function listArmor(slot = null) {
    const key = slot ? String(slot).trim() : null;
    const slots = key ? [key] : Object.keys(PIRATE_ARMOR_BY_SLOT);
    const rows = [];
    slots.forEach((slotName) => {
      (PIRATE_ARMOR_BY_SLOT[slotName] || []).forEach((item) => {
        rows.push({ slot: slotName, id: item.id, name: item.name, level: item.reqLevel });
      });
    });
    console.table(rows);
    return rows;
  }

  if (typeof document !== "undefined") {
    window.addEventListener("DOMContentLoaded", () => {
      window.setTimeout(scan, RECHECK_DELAY_MS);
      window.setTimeout(scan, RECHECK_DELAY_MS * 2);
    });

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes" && mutation.target?.classList?.contains("msio-character-img")) {
          window.setTimeout(() => applyPirateArmor(mutation.target), RETRY_DELAY_MS);
        }
        mutation.addedNodes?.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches?.("img.msio-character-img")) window.setTimeout(() => applyPirateArmor(node), RETRY_DELAY_MS);
          node.querySelectorAll?.("img.msio-character-img").forEach((img) => {
            window.setTimeout(() => applyPirateArmor(img), RETRY_DELAY_MS);
          });
        });
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["src"],
    });

    window.MSCI_PIRATE_ARMOR_FALLBACKS = {
      armorBySlot: PIRATE_ARMOR_BY_SLOT,
      scan,
      listArmor,
    };
  }
})();
