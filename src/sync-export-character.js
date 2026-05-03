const EXPORT_BUTTON_TEXT = "导出 PNG 图片";
const VISIBLE_CHARACTER_SELECTOR = ".result-capture-card .result-hero .msio-character-img, .result-capture-card .result-image-panel .msio-character-img, .result-capture-card .msio-character-img";
const EXPORT_CHARACTER_SELECTOR = ".export-share-card .msio-character-img";

function getVisibleCharacterImage() {
  return document.querySelector(VISIBLE_CHARACTER_SELECTOR);
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
  syncExportCharacterImage();
  window.requestAnimationFrame(syncExportCharacterImage);
  window.setTimeout(syncExportCharacterImage, 60);
  window.setTimeout(syncExportCharacterImage, 180);
  window.setTimeout(syncExportCharacterImage, 360);
}

if (typeof document !== "undefined") {
  document.addEventListener(
    "click",
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const button = target.closest("button");
      if (!button) return;
      if (!String(button.textContent || "").includes(EXPORT_BUTTON_TEXT)) return;
      scheduleExportCharacterSync();
    },
    { capture: true, passive: true }
  );
}

export { syncExportCharacterImage };
