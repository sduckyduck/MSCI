(() => {
  const WEAPON_ID_PREFIXES = [
    "130", "131", "132", "133", "137", "138", "140", "141", "142", "143", "144", "145", "146", "147", "148", "149",
  ];
  const TWO_HAND_WEAPON_PREFIXES = ["140", "141", "142", "143", "144", "146"];

  function normalizeName(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9\u4e00-\u9fff]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function currentImg() {
    return document.querySelector("img.msio-character-img");
  }

  function currentRole() {
    return currentImg()?.closest?.(".character-preview-bg")?.dataset?.role || "";
  }

  function idPart(value) {
    return String(value || "").split(":")[0];
  }

  function isWeaponId(value) {
    const id = idPart(value);
    return WEAPON_ID_PREFIXES.some((prefix) => id.startsWith(prefix));
  }

  function actionForWeapon(roleCode, weaponId) {
    if (roleCode === "SNIP") return "stand2";
    if (["KITE", "ZAPZ", "TOXI", "HEAL", "STAR", "STAB", "SHLD", "BRAW", "GUNS"].includes(roleCode)) return "stand1";
    const id = String(weaponId || "");
    return TWO_HAND_WEAPON_PREFIXES.some((prefix) => id.startsWith(prefix)) ? "stand2" : "stand1";
  }

  function getCharacterUrlParts(src) {
    const url = new URL(src);
    const parts = url.pathname.split("/");
    const skinIndex = parts.findIndex((part) => part === "2000");
    const itemIndex = skinIndex + 1;
    const actionIndex = skinIndex + 2;
    if (skinIndex < 0 || !parts[itemIndex]) return null;
    return { url, parts, itemIndex, actionIndex };
  }

  function replaceWeaponInSrc(src, roleCode, weaponId) {
    const parsed = getCharacterUrlParts(src);
    if (!parsed) return src;
    const { url, parts, itemIndex, actionIndex } = parsed;
    const entries = decodeURIComponent(parts[itemIndex])
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .filter((entry) => !isWeaponId(entry));

    entries.push(String(weaponId));
    parts[itemIndex] = encodeURIComponent(entries.join(","));
    if (parts[actionIndex]) parts[actionIndex] = encodeURIComponent(actionForWeapon(roleCode, weaponId));
    url.pathname = parts.join("/");
    return url.toString();
  }

  function ensurePool() {
    const pool = window.MSCI_RARE_WEAPON_POOL;
    if (!pool) {
      console.warn("MSCI equipment pool has not loaded yet. Wait 1-2 seconds after opening the result page, then run the command again.");
      return null;
    }
    return pool;
  }

  function weaponPool(roleCode = currentRole()) {
    const pool = ensurePool();
    if (!pool) return [];
    return pool.pools?.[String(roleCode || "").toUpperCase()] || [];
  }

  function hatPool(roleCode = currentRole()) {
    const pool = ensurePool();
    if (!pool) return [];
    return pool.hatsByRole?.[String(roleCode || "").toUpperCase()] || [];
  }

  function listWeapons(roleCode = currentRole()) {
    const role = String(roleCode || currentRole()).toUpperCase();
    const rows = weaponPool(role).map((item) => ({
      role,
      id: item.id,
      name: item.name,
      level: item.reqLevel,
      type: item.weaponType,
    }));
    console.table(rows);
    console.info(`${role} weapon pool count: ${rows.length}. Equal chance per weapon is about ${rows.length ? (100 / rows.length).toFixed(2) : 0}% per reroll.`);
    return rows;
  }

  function listHats(roleCode = currentRole()) {
    const role = String(roleCode || currentRole()).toUpperCase();
    const rows = hatPool(role).map((item) => ({
      role,
      id: item.id,
      name: item.name,
      level: item.reqLevel,
    }));
    console.table(rows);
    console.info(`${role} hat pool count: ${rows.length}. Equal chance per hat is about ${rows.length ? (100 / rows.length).toFixed(2) : 0}% per reroll.`);
    return rows;
  }

  function findWeapon(query, roleCode = currentRole()) {
    const role = String(roleCode || currentRole()).toUpperCase();
    const key = normalizeName(query);
    const rows = weaponPool(role)
      .filter((item) => normalizeName(`${item.name} ${item.weaponType} ${item.id}`).includes(key))
      .map((item) => ({ role, id: item.id, name: item.name, level: item.reqLevel, type: item.weaponType }));
    console.table(rows);
    if (!rows.length) console.warn(`No weapon matched "${query}" in ${role}. Try a shorter keyword like "odin", "fair", "maple", "spear", "staff", "claw".`);
    return rows;
  }

  function findHat(query, roleCode = currentRole()) {
    const role = String(roleCode || currentRole()).toUpperCase();
    const key = normalizeName(query);
    const rows = hatPool(role)
      .filter((item) => normalizeName(`${item.name} ${item.id}`).includes(key))
      .map((item) => ({ role, id: item.id, name: item.name, level: item.reqLevel }));
    console.table(rows);
    if (!rows.length) console.warn(`No hat matched "${query}" in ${role}. Try "zakum".`);
    return rows;
  }

  function forceWeapon(query, roleCode = currentRole()) {
    const img = currentImg();
    if (!img) {
      console.warn("No visible character image found. Open the result page first.");
      return null;
    }
    const role = String(roleCode || currentRole()).toUpperCase();
    const matches = findWeapon(query, role);
    const item = weaponPool(role).find((weapon) => String(weapon.id) === String(matches[0]?.id));
    if (!item) return null;

    const nextSrc = replaceWeaponInSrc(img.currentSrc || img.src, role, item.id);
    img.dataset.msciDebugLocked = "true";
    img.dataset.msciEqualCheckedSrc = nextSrc;
    img.dataset.msciEqualAppliedSrc = nextSrc;
    img.dataset.msciForcedWeapon = `${item.name} (${item.id})`;
    img.src = nextSrc;
    console.info(`Forced ${role} weapon: ${item.name} (${item.id})`);
    return item;
  }

  function unlock() {
    const img = currentImg();
    if (!img) return false;
    delete img.dataset.msciDebugLocked;
    delete img.dataset.msciForcedWeapon;
    console.info("MSCI debug lock removed. Normal random behavior will resume on the next reroll/result render.");
    return true;
  }

  function summary() {
    const pool = ensurePool();
    if (!pool) return null;
    const rows = Object.keys(pool.pools || {}).map((role) => {
      const weapons = pool.pools?.[role] || [];
      const hats = pool.hatsByRole?.[role] || [];
      const zakum = hats.filter((item) => normalizeName(item.name).includes("zakum"));
      return {
        role,
        weapons: weapons.length,
        hats: hats.length,
        weaponChanceEach: weapons.length ? `${(100 / weapons.length).toFixed(2)}%` : "0%",
        hatChanceEach: hats.length ? `${(100 / hats.length).toFixed(2)}%` : "0%",
        zakumInHatPool: zakum.length > 0,
      };
    });
    console.table(rows);
    return rows;
  }

  window.MSCI_EQUIP_DEBUG = {
    summary,
    listWeapons,
    listHats,
    findWeapon,
    findHat,
    forceWeapon,
    unlock,
    currentRole,
  };
})();
