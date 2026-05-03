const COMPLETION_SELECTOR = ".completion-anchor";
const ANSWER_SELECTOR = ".wizard-option";

function scrollToCompletionBottom() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const completionCard = document.querySelector(COMPLETION_SELECTOR);
  if (!completionCard) return;

  completionCard.scrollIntoView({ behavior: "smooth", block: "end" });

  window.setTimeout(() => {
    window.scrollTo({
      top: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
      left: 0,
      behavior: "smooth",
    });
  }, 180);
}

function scheduleCompletionScroll() {
  window.setTimeout(scrollToCompletionBottom, 220);
  window.setTimeout(scrollToCompletionBottom, 520);
}

if (typeof document !== "undefined") {
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
