import html2canvas from "html2canvas";

function isExportButton(target) {
  const button = target?.closest?.("button");
  if (!button) return null;

  const text = (button.textContent || "").replace(/\s+/g, "").trim();
  if (text.includes("导出分享卡片") || text.includes("正在生成截图")) return button;

  return null;
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

  try {
    await waitForImages(target);

    const canvas = await html2canvas(target, {
      backgroundColor: "#F9F9F6",
      scale: Math.min(window.devicePixelRatio || 2, 3),
      useCORS: true,
      allowTaint: false,
      logging: false,
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
