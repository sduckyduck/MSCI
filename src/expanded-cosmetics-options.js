const MSCI_EXPANDED_MALE_HAIR = [
  [30000, "Toben Hair"],
  [30010, "Zeta"],
  [30020, "Unkempt Hair"],
  [30030, "Shaved Hair"],
  [30040, "Rockstar"],
  [30050, "Metro"],
  [30060, "Catalyst"],
  [30070, "All Back"],
  [30080, "Military Buzzcut"],
  [30090, "Mohawk"],
  [30100, "Fireball"],
  [30110, "Vincent"],
  [30120, "Antagonist"],
  [30130, "Topknot"],
  [30140, "Medium Cornrows"],
  [30150, "Trip Scratch"],
  [30160, "Line Scratch Hair"],
  [30170, "Mane"],
  [30180, "Bowl Cut"],
  [30190, "Wind"],
  [30200, "Shaggy Wax"],
  [30210, "Grooovy Do"],
  [30220, "Foil Perm"],
  [30230, "Chestnut"],
  [30240, "Afro"],
  [30250, "Caspia Hair"],
  [30260, "with Bald Spot"],
  [30270, "Mohecan Shaggy Do"],
  [30280, "Old Man 'Do"],
  [30290, "Romance"],
  [30300, "Acorn"],
  [30310, "Close-Cropped Afro"],
  [30320, "Cabana Boy Hair"],
  [30330, "Tristan Hair"],
  [30340, "Astro"],
  [30350, "Spiky Tail"],
  [30360, "Shaggy Dragon"],
  [30370, "Dragon Layered Hair"],
  [30380, "Tribal Buzz"],
];

const MSCI_EXPANDED_FEMALE_HAIR = [
  [31000, "Cutie Hair"],
  [31010, "Veronica"],
  [31020, "Francesca"],
  [31030, "Polly"],
  [31040, "Edgy"],
  [31050, "Rockstar Hair"],
  [31060, "Annie"],
  [31070, "Stella"],
  [31080, "Parted Pomp"],
  [31090, "Bridget"],
  [31100, "Mary Hair"],
  [31110, "Monica Hair"],
  [31120, "Miru Hair"],
  [31130, "Jolie"],
  [31140, "Pei Pei"],
  [31150, "Angelica Hair"],
  [31160, "Lori"],
  [31170, "Rastafari Hair"],
  [31180, "Celeb Hair"],
  [31190, "Holla' Back Do"],
  [31200, "Perfect Stranger"],
  [31210, "Caspia Hair"],
  [31220, "Rose"],
  [31230, "Disheveled"],
  [31240, "Bowlcut"],
  [31250, "Daisy Do Hair"],
  [31260, "Pigtails"],
  [31270, "Ellie"],
  [31280, "Naomi"],
  [31290, "Chantelle Hair"],
  [31300, "Carla"],
  [31310, "Roxy"],
  [31320, "Penelope Hair"],
  [31330, "Rae"],
  [31340, "Fourtail Braids"],
  [31350, "Swooshy Ponytail Hair"],
  [31360, "Stylish Burst Hair"],
  [31370, "Boyish"],
];

const MSCI_EXPANDED_MALE_FACE = [
  [20000, "Defiant Face"],
  [20001, "Confident Face"],
  [20002, "Prudent Face"],
  [20003, "Dramatic Face"],
  [20004, "Rebel's Fire"],
  [20005, "Alert Face"],
  [20006, "Babyface Pout"],
  [20007, "Sad Innocence"],
  [20008, "Worrisome Glare"],
  [20009, "Smart Aleck"],
  [20010, "Wisdom Glance"],
  [20011, "Cool Guy Gaze"],
  [20012, "Curious Dog"],
  [20013, "Insomniac Daze"],
  [20014, "Look of Wonder"],
];

const MSCI_EXPANDED_FEMALE_FACE = [
  [21000, "Defiant Face"],
  [21001, "Prudent Face"],
  [21002, "Intelligent Face"],
  [21003, "Strong Stare"],
  [21004, "Angel Glow"],
  [21005, "Babyface Pout"],
  [21006, "Pucker Up Face"],
  [21007, "Dollface Look"],
  [21008, "Hopeless Gaze"],
  [21009, "Look of Death"],
  [21010, "Wisdom Glance"],
  [21011, "Hypnotized Look"],
  [21012, "Soul's Window"],
  [21013, "Wide-eyed Girl"],
  [21014, "Curious Look"],
];

function getFieldByLabel(root, labelText) {
  const fields = [...root.querySelectorAll(".builder-field")];
  return fields.find((field) => String(field.querySelector("span")?.textContent || "").includes(labelText)) || null;
}

function getBuilderSelects(root = document) {
  const builder = root.querySelector?.(".character-builder-controls") || document.querySelector(".character-builder-controls");
  if (!builder) return null;

  return {
    builder,
    gender: getFieldByLabel(builder, "性别")?.querySelector("select") || null,
    hair: getFieldByLabel(builder, "发型")?.querySelector("select") || null,
    face: getFieldByLabel(builder, "脸型")?.querySelector("select") || null,
  };
}

function getCurrentGender(genderSelect) {
  return String(genderSelect?.value || "female").toLowerCase() === "male" ? "male" : "female";
}

function makeOption(id, label) {
  const option = document.createElement("option");
  option.value = String(id);
  option.textContent = label;
  option.dataset.msciExpandedCosmetic = "1";
  return option;
}

function syncOptions(select, options) {
  if (!select) return;

  const currentValue = select.value;
  select.querySelectorAll("option[data-msci-expanded-cosmetic='1']").forEach((option) => option.remove());

  const existingValues = new Set([...select.options].map((option) => String(option.value)));
  for (const [id, label] of options) {
    const value = String(id);
    if (existingValues.has(value)) {
      const existing = [...select.options].find((option) => String(option.value) === value);
      if (existing && !existing.textContent.includes(label)) existing.textContent = label;
      continue;
    }
    select.appendChild(makeOption(id, label));
  }

  if ([...select.options].some((option) => option.value === currentValue)) {
    select.value = currentValue;
  }
}

function syncExpandedCosmetics(root = document) {
  const selects = getBuilderSelects(root);
  if (!selects?.hair || !selects?.face) return;

  const gender = getCurrentGender(selects.gender);
  syncOptions(selects.hair, gender === "male" ? MSCI_EXPANDED_MALE_HAIR : MSCI_EXPANDED_FEMALE_HAIR);
  syncOptions(selects.face, gender === "male" ? MSCI_EXPANDED_MALE_FACE : MSCI_EXPANDED_FEMALE_FACE);
}

function pickRandom(options) {
  return options[Math.floor(Math.random() * options.length)];
}

function dispatchSelectChange(select, value) {
  if (!select || !value) return;
  select.value = String(value);
  select.dispatchEvent(new Event("input", { bubbles: true }));
  select.dispatchEvent(new Event("change", { bubbles: true }));
}

function randomizeExpandedCosmetics() {
  const selects = getBuilderSelects(document);
  if (!selects?.hair || !selects?.face) return;

  syncExpandedCosmetics(document);
  const gender = getCurrentGender(selects.gender);
  const hair = pickRandom(gender === "male" ? MSCI_EXPANDED_MALE_HAIR : MSCI_EXPANDED_FEMALE_HAIR);
  const face = pickRandom(gender === "male" ? MSCI_EXPANDED_MALE_FACE : MSCI_EXPANDED_FEMALE_FACE);

  dispatchSelectChange(selects.hair, hair?.[0]);
  dispatchSelectChange(selects.face, face?.[0]);
}

function handleCosmeticClick(event) {
  const button = event.target?.closest?.("button");
  if (!button) return;
  const label = String(button.textContent || "").trim();
  if (!label.includes("随机") && !label.toLowerCase().includes("random")) return;

  window.setTimeout(randomizeExpandedCosmetics, 80);
  window.setTimeout(randomizeExpandedCosmetics, 240);
}

function installExpandedCosmetics() {
  if (window.__msciExpandedCosmeticsInstalled) return;
  window.__msciExpandedCosmeticsInstalled = true;

  document.addEventListener("change", (event) => {
    if (event.target?.closest?.(".character-builder-controls")) {
      window.setTimeout(() => syncExpandedCosmetics(document), 0);
    }
  }, true);

  document.addEventListener("click", handleCosmeticClick, true);

  const observer = new MutationObserver((mutations) => {
    let shouldSync = false;
    for (const mutation of mutations) {
      if (mutation.addedNodes?.length || mutation.type === "childList") {
        shouldSync = true;
        break;
      }
    }
    if (shouldSync) syncExpandedCosmetics(document);
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
  syncExpandedCosmetics(document);
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  installExpandedCosmetics();
}
