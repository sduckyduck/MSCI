const COMPLETION_SELECTOR = ".completion-anchor";
const ANSWER_SELECTOR = ".wizard-option";
const COMPLETION_BADGE_SELECTOR = ".completion-badge";
const OBSERVE_TIMEOUT_MS = 900;

let pendingTimer = null;
let pendingObserver = null;
let observerTimeout = null;
let lastScrolledCompletion = null;

function isBrowser() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function clearPendingCompletionScroll() {
  if (pendingTimer) {
    window.clearTimeout(pendingTimer);
    pendingTimer = null;
  }

  if (observerTimeout) {
    window.clearTimeout(observerTimeout);
    observerTimeout = null;
  }

  if (pendingObserver) {
    pendingObserver.disconnect();
    pendingObserver = null;
  }
}

function isVisible(element) {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function isAllQuestionsAnswered() {
  const text = document.querySelector(COMPLETION_BADGE_SELECTOR)?.textContent || "";
  const match = text.match(/(\d+)\s*\/\s*(\d+)/);
  return Boolean(match && Number(match[1]) > 0 && Number(match[1]) === Number(match[2]));
}

function scrollToCompletionOnce() {
  if (!isBrowser()) return false;

  const completionCard = document.querySelector(COMPLETION_SELECTOR);
  if (!completionCard || !isVisible(completionCard) || !isAllQuestionsAnswered()) return false;

  // React StrictMode and fast clicking can fire duplicate DOM updates.
  // Only perform one smooth scroll for the same rendered completion card.
  if (lastScrolledCompletion === completionCard) return true;
  lastScrolledCompletion = completionCard;

  completionCard.scrollIntoView({
    behavior: "smooth",
    block: "center",
    inline: "nearest",
  });

  return true;
}

function afterNextPaint(callback) {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(callback);
  });
}

function observeUntilCompletionAppears() {
  if (!isBrowser() || pendingObserver) return;

  pendingObserver = new MutationObserver(() => {
    if (scrollToCompletionOnce()) clearPendingCompletionScroll();
  });

  pendingObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  observerTimeout = window.setTimeout(clearPendingCompletionScroll, OBSERVE_TIMEOUT_MS);
}

function scheduleCompletionScroll() {
  if (!isBrowser()) return;

  clearPendingCompletionScroll();

  pendingTimer = window.setTimeout(() => {
    pendingTimer = null;
    afterNextPaint(() => {
      if (!scrollToCompletionOnce()) observeUntilCompletionAppears();
    });
  }, 80);
}

if (isBrowser()) {
  document.addEventListener(
    "click",
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!target.closest(ANSWER_SELECTOR)) return;
      scheduleCompletionScroll();
    },
    { passive: true }
  );
}
