const EXPORT_BUTTON_TEXT = "导出 PNG 图片";
const VISIBLE_CHARACTER_SELECTOR = ".result-capture-card .result-hero .msio-character-img, .result-capture-card .result-image-panel .msio-character-img, .result-capture-card .msio-character-img";
const EXPORT_CHARACTER_SELECTOR = ".export-share-card .msio-character-img";
const PERSONA_TEXT_SELECTOR = "h1, h2, h3, h4, p, b, small, span, div";
const PERSONA_RENAMES = [
  ["无敌大轮椅", "冷门信仰人"],
  ["仰卧起坐王", "后期打火机"],
  ["全图立正人", "刷子鼠鼠人"],
  ["温水煮图人", "DOT刷怪人"],
  ["队伍保险箱", "最夯法师人"],
  ["钱包发光人", "跳标剑鞘炎"],
  ["反骨近身人", "刺客信条人"],
  ["冷门一发人", "冷门狙击手"],
  ["贴脸节奏怪", "超级赛亚人"],
  ["远程火力仔", "后跳BIUBIU"],
];

function getVisibleCharacterImage() {
  return document.querySelector(VISIBLE_CHARACTER_SELECTOR);
}

function renamePersonaText(value) {
  let nextValue = String(value || "");
  for (const [from, to] of PERSONA_RENAMES) nextValue = nextValue.replaceAll(from, to);
  return nextValue;
}

function syncPersonaNames() {
  if (typeof document === "undefined") return;

  document.querySelectorAll(PERSONA_TEXT_SELECTOR).forEach((element) => {
    if (!(element instanceof HTMLElement)) return;
    if (element.children.length) return;
    const currentText = element.textContent || "";
    const nextText = renamePersonaText(currentText);
    if (nextText !== currentText) element.textContent = nextText;
  });
}

function schedulePersonaNameSync() {
  syncPersonaNames();
  window.requestAnimationFrame(syncPersonaNames);
  window.setTimeout(syncPersonaNames, 80);
  window.setTimeout(syncPersonaNames, 240);
}

function syncExportCharacterImage() {
  if (typeof document === "undefined") return;

  const visibleImage = getVisibleCharacterImage();
  const visibleSrc = visibleImage?.currentSrc || visibleImage?.src || visibleImage?.getAttribute?.("src") || "";
  if (!visibleSrc) return;

  document.querySelectorAll(EXPORT_CHARACTER_SELECTOR).forEach((exportImage) => {
    if (!(exportImage instanceof HTMLImageElement)) return;
    if (exportImage.getAttribute("src") !== visibleSrc) exportImage.setAttribute("src", visibleSrc);
    exportImage.removeAttribute("srcset");
    exportImage.dataset.msciSyncedExportCharacter = "true";
  });
}

function scheduleExportCharacterSync() {
  syncPersonaNames();
  syncExportCharacterImage();
  window.requestAnimationFrame(() => {
    syncPersonaNames();
    syncExportCharacterImage();
  });
  window.setTimeout(() => {
    syncPersonaNames();
    syncExportCharacterImage();
  }, 60);
  window.setTimeout(() => {
    syncPersonaNames();
    syncExportCharacterImage();
  }, 180);
  window.setTimeout(() => {
    syncPersonaNames();
    syncExportCharacterImage();
  }, 360);
}

if (typeof document !== "undefined") {
  schedulePersonaNameSync();

  document.addEventListener(
    "click",
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      schedulePersonaNameSync();
      const button = target.closest("button");
      if (!button) return;
      if (!String(button.textContent || "").includes(EXPORT_BUTTON_TEXT)) return;
      scheduleExportCharacterSync();
    },
    { capture: true, passive: true }
  );
}

export { syncExportCharacterImage, syncPersonaNames };
