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

function schedulePersonaNameSync() {
  syncPersonaNames();
  syncQuestionRewrites();
  window.requestAnimationFrame(() => {
    syncPersonaNames();
    syncQuestionRewrites();
  });
  window.setTimeout(() => {
    syncPersonaNames();
    syncQuestionRewrites();
  }, 80);
  window.setTimeout(() => {
    syncPersonaNames();
    syncQuestionRewrites();
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
  syncExportCharacterImage();
  window.requestAnimationFrame(() => {
    syncPersonaNames();
    syncQuestionRewrites();
    syncExportCharacterImage();
  });
  window.setTimeout(() => {
    syncPersonaNames();
    syncQuestionRewrites();
    syncExportCharacterImage();
  }, 60);
  window.setTimeout(() => {
    syncPersonaNames();
    syncQuestionRewrites();
    syncExportCharacterImage();
  }, 180);
  window.setTimeout(() => {
    syncPersonaNames();
    syncQuestionRewrites();
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

export { syncExportCharacterImage, syncPersonaNames, syncQuestionRewrites };
