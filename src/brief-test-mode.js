import { msciV2Questions } from "./model/msciV2QuestionBank";

const BRIEF_TEST_TOTAL = 15;
const FULL_TEST_MODE = "full";
const BRIEF_TEST_MODE = "brief";
const STYLE_ID = "msci-brief-test-mode-style";
const BRIEF_BUTTON_CLASS = "msci-brief-test-btn";
const FULL_BUTTON_CLASS = "msci-full-test-btn";
const NOTE_CLASS = "msci-test-mode-note";
const FULL_QUESTIONS = [...msciV2Questions];
let isStartingBriefTest = false;

function shuffleCopy(items) {
  const shuffled = [...(items || [])];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function replaceQuestionPool(questions, mode) {
  msciV2Questions.splice(0, msciV2Questions.length, ...questions);
  window.__msciQuestionMode = mode;
}

function restoreFullQuestionPool() {
  replaceQuestionPool(FULL_QUESTIONS, FULL_TEST_MODE);
}

function buildBriefQuestionSet() {
  const groups = [];
  const groupMap = new Map();

  FULL_QUESTIONS.forEach((question) => {
    const key = question.section || "其他";
    if (!groupMap.has(key)) {
      const group = { key, items: [] };
      groupMap.set(key, group);
      groups.push(group);
    }
    groupMap.get(key).items.push(question);
  });

  const targetCount = Math.min(BRIEF_TEST_TOTAL, FULL_QUESTIONS.length);
  const picks = groups.map((group) => {
    const half = group.items.length / 2;
    const baseTake = Math.max(1, Math.floor(half));
    return {
      group,
      cursor: Math.min(baseTake, group.items.length),
      selected: group.items.slice(0, Math.min(baseTake, group.items.length)),
      remainder: half - Math.floor(half),
    };
  });

  let selected = picks.flatMap((pick) => pick.selected);

  while (selected.length < targetCount) {
    const nextPick = picks
      .filter((pick) => pick.cursor < pick.group.items.length)
      .sort((a, b) => b.remainder - a.remainder || b.group.items.length - a.group.items.length)[0];
    if (!nextPick) break;
    selected.push(nextPick.group.items[nextPick.cursor]);
    nextPick.cursor += 1;
    nextPick.remainder = 0;
  }

  if (selected.length > targetCount) selected = selected.slice(0, targetCount);
  return selected;
}

function useBriefQuestionPool() {
  replaceQuestionPool(buildBriefQuestionSet(), BRIEF_TEST_MODE);
}

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .${NOTE_CLASS} {
      margin: 12px auto 10px;
      max-width: 420px;
      color: #526277;
      font-size: 13px;
      line-height: 1.45;
      text-align: center;
    }

    .${FULL_BUTTON_CLASS},
    .${BRIEF_BUTTON_CLASS} {
      width: min(100%, 360px);
      margin-left: auto !important;
      margin-right: auto !important;
    }

    .${BRIEF_BUTTON_CLASS} {
      margin-top: 10px !important;
      background: linear-gradient(180deg, #f9fbff, #edf4ff) !important;
      color: #315d8d !important;
      border: 1px solid rgba(49, 93, 141, 0.36) !important;
      box-shadow: 0 8px 20px rgba(49, 93, 141, 0.12) !important;
    }
  `;
  document.head.appendChild(style);
}

function findOriginalStartButton() {
  return Array.from(document.querySelectorAll(".intro-card button.primary-btn")).find((button) => {
    if (!(button instanceof HTMLButtonElement)) return false;
    if (button.classList.contains(BRIEF_BUTTON_CLASS)) return false;
    const text = String(button.textContent || "");
    return text.includes("开始测试") || text.includes("完整模式") || text.includes("30题");
  });
}

function syncTestTitle() {
  const title = document.querySelector(".wizard-title-row h1");
  if (!title) return;
  const isBrief = window.__msciQuestionMode === BRIEF_TEST_MODE;
  title.textContent = isBrief ? "15 题简短职业人格测试" : `${FULL_QUESTIONS.length} 题职业人格测试`;
}

function ensureBriefModeUi() {
  injectStyles();
  syncTestTitle();

  const introCard = document.querySelector(".intro-card");
  if (!introCard) return;

  if (!isStartingBriefTest && window.__msciQuestionMode !== FULL_TEST_MODE) restoreFullQuestionPool();

  const startButton = findOriginalStartButton();
  if (!(startButton instanceof HTMLButtonElement)) return;

  startButton.textContent = `完整模式 ${FULL_QUESTIONS.length}题`;
  startButton.classList.add(FULL_BUTTON_CLASS);

  if (!startButton.dataset.msciFullModeBound) {
    startButton.dataset.msciFullModeBound = "true";
    startButton.addEventListener(
      "click",
      () => {
        if (!isStartingBriefTest) restoreFullQuestionPool();
      },
      { capture: true }
    );
  }

  if (!introCard.querySelector(`.${NOTE_CLASS}`)) {
    const note = document.createElement("p");
    note.className = NOTE_CLASS;
    note.textContent = "完整模式更稳；简短模式只抽每类约一半题，适合快速出结果。";
    startButton.insertAdjacentElement("beforebegin", note);
  }

  if (introCard.querySelector(`.${BRIEF_BUTTON_CLASS}`)) return;

  const briefButton = document.createElement("button");
  briefButton.type = "button";
  briefButton.className = `primary-btn ${BRIEF_BUTTON_CLASS}`;
  briefButton.textContent = `简短模式 ${BRIEF_TEST_TOTAL}题`;
  briefButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    isStartingBriefTest = true;
    useBriefQuestionPool();
    startButton.click();
    window.setTimeout(() => {
      isStartingBriefTest = false;
    }, 600);
  });

  startButton.insertAdjacentElement("afterend", briefButton);
}

function scheduleBriefModeSync() {
  ensureBriefModeUi();
  window.requestAnimationFrame(ensureBriefModeUi);
  window.setTimeout(ensureBriefModeUi, 80);
  window.setTimeout(ensureBriefModeUi, 240);
}

if (typeof document !== "undefined") {
  restoreFullQuestionPool();
  scheduleBriefModeSync();

  const observer = new MutationObserver(scheduleBriefModeSync);
  observer.observe(document.body, { childList: true, subtree: true });

  document.addEventListener("click", scheduleBriefModeSync, { capture: true, passive: true });
}

export { buildBriefQuestionSet, ensureBriefModeUi, restoreFullQuestionPool, useBriefQuestionPool };
