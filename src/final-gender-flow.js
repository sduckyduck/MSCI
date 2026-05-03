const GENDER_STORAGE_KEY = "msci-character-gender";
const GENDER_EVENT_NAME = "msci-character-gender-change";

const GENDER_OPTIONS = [
  { id: "male", label: "男号", sub: "结果角色卡用男角色生成" },
  { id: "female", label: "女号", sub: "结果角色卡用女角色生成" },
];

let hasAutoScrolledToCompletion = false;

function normalizeGender(value) {
  const key = String(value || "").trim().toLowerCase();
  return key === "male" || key === "female" ? key : "";
}

function getStoredGender() {
  try {
    return normalizeGender(window.localStorage.getItem(GENDER_STORAGE_KEY));
  } catch {
    return "";
  }
}

function setStoredGender(gender) {
  const normalized = normalizeGender(gender);
  if (!normalized) return;

  try {
    window.localStorage.setItem(GENDER_STORAGE_KEY, normalized);
  } catch {
    // Ignore storage failures; the custom event still updates the current page.
  }

  window.dispatchEvent(new CustomEvent(GENDER_EVENT_NAME, { detail: { gender: normalized } }));
}

function ensureStyle() {
  if (document.getElementById("msci-final-gender-style")) return;

  const style = document.createElement("style");
  style.id = "msci-final-gender-style";
  style.textContent = `
    .final-gender-question {
      margin: 18px 0 14px;
      padding: 16px;
      border: 2px solid rgba(77, 51, 31, 0.18);
      border-radius: 18px;
      background: rgba(255, 248, 220, 0.72);
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.58);
    }

    .final-gender-question .eyebrow {
      margin-bottom: 6px;
    }

    .final-gender-question h3 {
      margin: 0 0 6px;
      font-size: 1.12rem;
    }

    .final-gender-question p {
      margin: 0 0 12px;
      color: rgba(64, 43, 26, 0.76);
      line-height: 1.45;
    }

    .final-gender-options {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }

    .final-gender-option {
      cursor: pointer;
      border: 2px solid rgba(90, 62, 36, 0.24);
      border-radius: 14px;
      padding: 12px 10px;
      background: rgba(255, 255, 255, 0.58);
      color: inherit;
      text-align: left;
      transition: transform 0.16s ease, border-color 0.16s ease, background 0.16s ease;
    }

    .final-gender-option:hover {
      transform: translateY(-1px);
      background: rgba(255, 255, 255, 0.78);
    }

    .final-gender-option.active {
      border-color: rgba(70, 135, 74, 0.82);
      background: rgba(222, 245, 219, 0.86);
    }

    .final-gender-option b,
    .final-gender-option small {
      display: block;
    }

    .final-gender-option b {
      font-size: 1rem;
      margin-bottom: 4px;
    }

    .final-gender-option small {
      color: rgba(64, 43, 26, 0.68);
      line-height: 1.35;
    }

    .completion-anchor .primary-btn.gender-required {
      opacity: 0.58;
      filter: grayscale(0.25);
      cursor: not-allowed;
    }
  `;
  document.head.appendChild(style);
}

function findCompletionCard() {
  return document.querySelector(".completion-anchor");
}

function findResultButton(card) {
  if (!card) return null;
  return Array.from(card.querySelectorAll("button")).find((button) =>
    String(button.textContent || "").includes("查看最终结果")
  );
}

function updateGenderButtons(container) {
  const selected = getStoredGender();
  container.querySelectorAll(".final-gender-option").forEach((button) => {
    const active = button.dataset.gender === selected;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

function updateResultButtonState(card) {
  const button = findResultButton(card);
  if (!button) return;

  const hasGender = Boolean(getStoredGender());
  button.disabled = !hasGender;
  button.classList.toggle("gender-required", !hasGender);
  button.title = hasGender ? "" : "请先选择角色性别";
}

function makeGenderQuestion(card) {
  const existing = card.querySelector(".final-gender-question");
  if (existing) return existing;

  const section = document.createElement("section");
  section.className = "final-gender-question";
  section.innerHTML = `
    <p class="eyebrow">Final Character</p>
    <h3>最后一题：结果角色卡用男号还是女号？</h3>
    <p>这个选择不影响职业分数，只决定结果页和导出 PNG 里的角色预览性别。</p>
    <div class="final-gender-options" role="radiogroup" aria-label="选择结果角色性别"></div>
  `;

  const options = section.querySelector(".final-gender-options");
  GENDER_OPTIONS.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "final-gender-option";
    button.dataset.gender = option.id;
    button.setAttribute("aria-pressed", "false");
    button.innerHTML = `<b>${option.label}</b><small>${option.sub}</small>`;
    button.addEventListener("click", () => {
      setStoredGender(option.id);
      updateGenderButtons(section);
      updateResultButtonState(card);
      findResultButton(card)?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    options.appendChild(button);
  });

  const resultButton = findResultButton(card);
  if (resultButton) {
    card.insertBefore(section, resultButton);
  } else {
    card.appendChild(section);
  }

  updateGenderButtons(section);
  return section;
}

function syncCompletionGenderFlow() {
  ensureStyle();

  const card = findCompletionCard();
  if (!card) {
    hasAutoScrolledToCompletion = false;
    return;
  }

  makeGenderQuestion(card);
  updateResultButtonState(card);

  if (!hasAutoScrolledToCompletion) {
    hasAutoScrolledToCompletion = true;
    window.setTimeout(() => {
      card.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 220);
  }
}

function startFinalGenderFlow() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  ensureStyle();
  syncCompletionGenderFlow();

  const observer = new MutationObserver(() => syncCompletionGenderFlow());
  observer.observe(document.body, { childList: true, subtree: true });

  window.addEventListener(GENDER_EVENT_NAME, () => {
    const card = findCompletionCard();
    if (!card) return;
    const question = card.querySelector(".final-gender-question");
    if (question) updateGenderButtons(question);
    updateResultButtonState(card);
  });
}

startFinalGenderFlow();

export { GENDER_EVENT_NAME, GENDER_STORAGE_KEY };
