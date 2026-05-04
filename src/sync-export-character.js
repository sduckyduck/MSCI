const EXPORT_BUTTON_TEXT = "导出 PNG 图片";
const VISIBLE_CHARACTER_SELECTOR = ".result-capture-card .result-hero .msio-character-img, .result-capture-card .result-image-panel .msio-character-img, .result-capture-card .msio-character-img";
const EXPORT_CHARACTER_SELECTOR = ".export-share-card .msio-character-img";
const PERSONA_TEXT_SELECTOR = "h1, h2, h3, h4, p, b, small, span, div";
const FLOATING_SAVE_UI_ID = "msci-floating-save-ui";
const FLOATING_SAVE_STYLE_ID = "msci-floating-save-ui-style";
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

const QUESTION_REWRITES = [
  {
    matchTexts: [
      "街上小女孩递给你棒棒糖，你第一反应是？",
      "对于游戏货币，你的核心理念更贴合哪一种？",
    ],
    text: "你准备靠刷怪囤材料赚钱，最想走哪种资源路线？",
    options: [
      "大范围清图，材料像流水线一样进仓库",
      "盯高价值怪，少打但每一只都要值钱",
      "固定路线慢慢刷，稳定囤够再出手",
      "研究冷门材料，公测涨价前先囤一波",
      "跟队友分工刷材料，我负责补位和后勤",
    ],
  },
  {
    matchTexts: [
      "朋友喊你去团建，你的真实想法更贴合哪一种？",
    ],
    text: "朋友喊你一起刷材料，你更像哪种队友？",
    options: [
      "我负责主力清图，效率不掉队",
      "我负责盯高价值怪，少走弯路",
      "我负责整理配方需求，缺什么补什么",
      "我负责长期蹲点，稳定供货不乱跑",
      "我负责看市场行情，刷完统一卖高价",
    ],
  },
  {
    matchTexts: [
      "打本出了一件不是自己职业的毕业装备，你会？",
    ],
    text: "刷到一堆材料和装备后，你第一反应是？",
    options: [
      "直接摆摊变现，换钱继续提升刷怪效率",
      "先留给队伍和朋友做装备、冲熟练度",
      "按配方分类囤仓，哪个职业缺就卖哪个",
      "长期刷同一张图，稳定产出不赌运气",
      "看行情讨价还价，热门材料必须卖到位",
    ],
  },
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

function findQuestionRewrite(questionText) {
  const normalizedText = String(questionText || "").trim();
  return QUESTION_REWRITES.find((rewrite) => rewrite.matchTexts.includes(normalizedText));
}

function syncQuestionRewrites() {
  if (typeof document === "undefined") return;

  document.querySelectorAll(".wizard-card").forEach((card) => {
    if (!(card instanceof HTMLElement)) return;
    const title = card.querySelector("h2");
    const rewrite = findQuestionRewrite(title?.textContent);
    if (!rewrite || !title) return;

    title.textContent = rewrite.text;
    card.querySelectorAll(".wizard-option").forEach((option, index) => {
      const label = rewrite.options[index];
      if (!label) return;
      const labelSpan = option.querySelector("span:last-child");
      if (labelSpan) labelSpan.textContent = label;
    });
  });
}

function injectFloatingSaveStyles() {
  if (typeof document === "undefined" || document.getElementById(FLOATING_SAVE_STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = FLOATING_SAVE_STYLE_ID;
  style.textContent = `
    #${FLOATING_SAVE_UI_ID} {
      position: fixed;
      left: 50%;
      bottom: calc(18px + env(safe-area-inset-bottom, 0px));
      transform: translateX(-50%);
      z-index: 99990;
      width: min(430px, calc(100vw - 28px));
      pointer-events: none;
      font-family: inherit;
    }

    #${FLOATING_SAVE_UI_ID} .msci-floating-save-card {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 10px 12px;
      align-items: center;
      padding: 11px 13px 11px 11px;
      border: 1px solid rgba(47, 86, 126, 0.28);
      border-radius: 22px;
      background: rgba(255, 255, 255, 0.96);
      box-shadow: 0 12px 32px rgba(24, 44, 70, 0.2);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      pointer-events: auto;
    }

    #${FLOATING_SAVE_UI_ID} .msci-floating-save-button {
      appearance: none;
      border: 0;
      border-radius: 999px;
      padding: 12px 18px;
      min-width: 112px;
      background: #315d8d;
      color: #fff;
      font-size: 15px;
      font-weight: 900;
      letter-spacing: 0.02em;
      box-shadow: inset 0 -2px 0 rgba(0, 0, 0, 0.14), 0 6px 14px rgba(49, 93, 141, 0.3);
    }

    #${FLOATING_SAVE_UI_ID} .msci-floating-save-button:disabled {
      opacity: 0.72;
    }

    #${FLOATING_SAVE_UI_ID} .msci-floating-save-copy {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
      color: #26364a;
      line-height: 1.25;
    }

    #${FLOATING_SAVE_UI_ID} .msci-floating-save-copy strong {
      font-size: 13px;
      font-weight: 900;
    }

    #${FLOATING_SAVE_UI_ID} .msci-floating-save-copy span {
      font-size: 11px;
      color: #65758a;
    }

    body.exporting-png #${FLOATING_SAVE_UI_ID} {
      display: none !important;
    }

    @media (max-width: 520px) {
      #${FLOATING_SAVE_UI_ID} {
        bottom: calc(14px + env(safe-area-inset-bottom, 0px));
        width: min(390px, calc(100vw - 22px));
      }

      #${FLOATING_SAVE_UI_ID} .msci-floating-save-card {
        grid-template-columns: 1fr;
        gap: 7px;
        padding: 10px;
        text-align: center;
      }

      #${FLOATING_SAVE_UI_ID} .msci-floating-save-button {
        width: 100%;
        padding: 12px 16px;
        font-size: 16px;
      }
    }
  `;
  document.head.appendChild(style);
}

function findExportPngButton() {
  return Array.from(document.querySelectorAll("button")).find((button) => {
    if (!(button instanceof HTMLButtonElement)) return false;
    if (button.closest(`#${FLOATING_SAVE_UI_ID}`)) return false;
    const text = String(button.textContent || "");
    return text.includes(EXPORT_BUTTON_TEXT) || text.includes("正在生成 PNG 图片");
  });
}

function setFloatingSaveBusy(isBusy) {
  const button = document.querySelector(`#${FLOATING_SAVE_UI_ID} .msci-floating-save-button`);
  const copy = document.querySelector(`#${FLOATING_SAVE_UI_ID} .msci-floating-save-copy span`);
  if (!(button instanceof HTMLButtonElement)) return;
  button.disabled = isBusy;
  button.textContent = isBusy ? "生成中..." : "保存 PNG";
  if (copy) {
    copy.textContent = isBusy
      ? "正在生成分享图，请等系统分享/下载面板弹出。"
      : "iPhone：分享面板→存储图像；安卓：下载/保存图片。";
  }
}

function clickExportPngButtonFromFloating() {
  const exportButton = findExportPngButton();
  if (!exportButton || exportButton.disabled) {
    document.querySelector(".action-row")?.scrollIntoView?.({ block: "center", behavior: "smooth" });
    return;
  }

  setFloatingSaveBusy(true);
  scheduleExportCharacterSync();
  exportButton.click();
  window.setTimeout(() => setFloatingSaveBusy(false), 4200);
}

function ensureFloatingSaveUi() {
  if (typeof document === "undefined") return;

  injectFloatingSaveStyles();
  const resultPage = document.querySelector(".result-page");
  const existing = document.getElementById(FLOATING_SAVE_UI_ID);

  if (!resultPage) {
    existing?.remove();
    return;
  }

  if (existing) return;

  const wrapper = document.createElement("aside");
  wrapper.id = FLOATING_SAVE_UI_ID;
  wrapper.dataset.html2canvasIgnore = "true";
  wrapper.setAttribute("aria-label", "保存 MSCI 结果 PNG");
  wrapper.innerHTML = `
    <div class="msci-floating-save-card">
      <button class="msci-floating-save-button" type="button">保存 PNG</button>
      <div class="msci-floating-save-copy">
        <strong>不用滑到底，点这里生成结果图</strong>
        <span>iPhone：分享面板→存储图像；安卓：下载/保存图片。</span>
      </div>
    </div>
  `;

  wrapper.querySelector(".msci-floating-save-button")?.addEventListener("click", clickExportPngButtonFromFloating);
  document.body.appendChild(wrapper);
}

function schedulePersonaNameSync() {
  syncPersonaNames();
  syncQuestionRewrites();
  ensureFloatingSaveUi();
  window.requestAnimationFrame(() => {
    syncPersonaNames();
    syncQuestionRewrites();
    ensureFloatingSaveUi();
  });
  window.setTimeout(() => {
    syncPersonaNames();
    syncQuestionRewrites();
    ensureFloatingSaveUi();
  }, 80);
  window.setTimeout(() => {
    syncPersonaNames();
    syncQuestionRewrites();
    ensureFloatingSaveUi();
  }, 240);
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
  syncQuestionRewrites();
  ensureFloatingSaveUi();
  syncExportCharacterImage();
  window.requestAnimationFrame(() => {
    syncPersonaNames();
    syncQuestionRewrites();
    ensureFloatingSaveUi();
    syncExportCharacterImage();
  });
  window.setTimeout(() => {
    syncPersonaNames();
    syncQuestionRewrites();
    ensureFloatingSaveUi();
    syncExportCharacterImage();
  }, 60);
  window.setTimeout(() => {
    syncPersonaNames();
    syncQuestionRewrites();
    ensureFloatingSaveUi();
    syncExportCharacterImage();
  }, 180);
  window.setTimeout(() => {
    syncPersonaNames();
    syncQuestionRewrites();
    ensureFloatingSaveUi();
    syncExportCharacterImage();
  }, 360);
}

if (typeof document !== "undefined") {
  schedulePersonaNameSync();

  const saveUiObserver = new MutationObserver(() => {
    ensureFloatingSaveUi();
  });
  saveUiObserver.observe(document.body, { childList: true, subtree: true });

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

export { syncExportCharacterImage, syncPersonaNames, syncQuestionRewrites, ensureFloatingSaveUi };
