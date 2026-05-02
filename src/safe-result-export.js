import html2canvas from "html2canvas";

function isExportButton(target) {
  const button = target?.closest?.("button");
  if (!button) return null;

  const text = (button.textContent || "").replace(/\s+/g, "").trim();
  if (text.includes("导出分享卡片") || text.includes("正在生成截图")) return button;

  return null;
}

function nextFrame() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });
}

function waitForImages(root) {
  const images = Array.from(root.querySelectorAll("img"));

  return Promise.all(
    images.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();

      return new Promise((resolve) => {
        const done = () => resolve();
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
        window.setTimeout(done, 2500);
      });
    })
  );
}

function px(value) {
  return `${Math.ceil(value)}px`;
}

function freezeResultLayout(target) {
  const resultRect = target.getBoundingClientRect();
  const previewCard = target.querySelector(".character-preview-card");
  const previewBg = target.querySelector(".character-preview-bg");
  const previewCardRect = previewCard?.getBoundingClientRect?.();
  const previewBgRect = previewBg?.getBoundingClientRect?.();

  const previous = {
    className: target.className,
    width: target.style.getPropertyValue("--msci-export-width"),
    cardWidth: target.style.getPropertyValue("--msci-character-card-width"),
    bgSize: target.style.getPropertyValue("--msci-character-bg-size"),
  };

  target.classList.add("msci-export-mode");
  target.style.setProperty("--msci-export-width", px(resultRect.width));

  if (previewCardRect?.width) {
    target.style.setProperty("--msci-character-card-width", px(previewCardRect.width));
  }

  if (previewBgRect?.width) {
    target.style.setProperty("--msci-character-bg-size", px(previewBgRect.width));
  }

  return () => {
    target.className = previous.className;

    if (previous.width) target.style.setProperty("--msci-export-width", previous.width);
    else target.style.removeProperty("--msci-export-width");

    if (previous.cardWidth) target.style.setProperty("--msci-character-card-width", previous.cardWidth);
    else target.style.removeProperty("--msci-character-card-width");

    if (previous.bgSize) target.style.setProperty("--msci-character-bg-size", previous.bgSize);
    else target.style.removeProperty("--msci-character-bg-size");
  };
}

function prepareCloneForExport(clonedDocument) {
  const cloneTarget = clonedDocument.querySelector(".result-capture-card") || clonedDocument.querySelector(".sbti-capture-card");
  if (!cloneTarget) return;

  cloneTarget.classList.add("msci-export-mode");

  const previewBg = cloneTarget.querySelector(".character-preview-bg");
  const sprite = cloneTarget.querySelector(".msio-character-img");

  if (previewBg) {
    previewBg.style.display = "flex";
    previewBg.style.alignItems = "center";
    previewBg.style.justifyContent = "center";
  }

  if (sprite) {
    sprite.style.width = "auto";
    sprite.style.height = "96%";
    sprite.style.maxWidth = "96%";
    sprite.style.maxHeight = "96%";
    sprite.style.objectFit = "contain";
    sprite.style.objectPosition = "center bottom";
    sprite.style.minWidth = "0";
    sprite.style.minHeight = "0";
  }
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

async function shareOrDownload(blob, fileName) {
  const file = new File([blob], fileName, { type: "image/png" });

  if (navigator.canShare?.({ files: [file] }) && navigator.share) {
    try {
      await navigator.share({
        title: "MSCI 冒险岛职业人格测试",
        text: "我的 MSCI 结果卡片",
        files: [file],
      });
      return;
    } catch (error) {
      // User cancellation or iOS share-sheet failure should still fall back.
      console.warn("MSCI share failed, falling back to download/open", error);
    }
  }

  downloadBlob(blob, fileName);

  // Some mobile Safari builds ignore `download`. Opening the PNG gives the user
  // a visible result they can long-press/save instead of silently doing nothing.
  window.setTimeout(() => {
    const url = URL.createObjectURL(blob);
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (!opened) return;
    window.setTimeout(() => URL.revokeObjectURL(url), 10000);
  }, 250);
}

async function exportResultCard(button) {
  if (button.dataset.msciExporting === "1") return;

  const target = document.querySelector(".result-capture-card") || document.querySelector(".sbti-capture-card");
  if (!target) {
    window.alert("没有找到可导出的结果卡片，请先进入最终结果页。");
    return;
  }

  const originalText = button.textContent;
  button.dataset.msciExporting = "1";
  button.textContent = "正在生成截图...";
  button.disabled = true;

  let restoreLayout = null;

  try {
    await waitForImages(target);
    restoreLayout = freezeResultLayout(target);
    await nextFrame();

    const rect = target.getBoundingClientRect();
    const canvas = await html2canvas(target, {
      backgroundColor: "#F9F9F6",
      scale: Math.min(window.devicePixelRatio || 2, 3),
      width: Math.ceil(rect.width),
      height: Math.ceil(rect.height),
      windowWidth: Math.max(document.documentElement.scrollWidth, Math.ceil(rect.width)),
      windowHeight: Math.max(document.documentElement.scrollHeight, Math.ceil(rect.height)),
      useCORS: true,
      allowTaint: false,
      logging: false,
      onclone: prepareCloneForExport,
      ignoreElements: (element) => element?.dataset?.html2canvasIgnore === "true",
    });

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png", 0.96));
    if (!blob) throw new Error("Canvas did not produce a PNG blob.");

    const resultCode = document.querySelector(".result-code")?.textContent?.trim() || "result";
    await shareOrDownload(blob, `MSCI-${resultCode}.png`);
  } catch (error) {
    console.error("MSCI export failed", error);
    window.alert("导出失败：有图片可能还没有加载完成。请刷新页面后再试一次。");
  } finally {
    restoreLayout?.();
    button.dataset.msciExporting = "0";
    button.textContent = originalText || "导出分享卡片";
    button.disabled = false;
  }
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  document.addEventListener(
    "click",
    (event) => {
      const button = isExportButton(event.target);
      if (!button) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      exportResultCard(button);
    },
    true
  );
}
