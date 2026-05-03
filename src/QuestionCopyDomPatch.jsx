import { useEffect } from "react";
import { questionCopyOverrides } from "./model/questionCopyOverrides";

const legacyQuestionCopy = {
  F10: {
    text: "全网都在抢同一种排面，价格像坐火箭，但它确实很会营造氛围。你会不会突然被审美诈骗？",
    options: [
      "不当氛围韭菜",
      "我会犹豫三秒",
      "看余额脸色",
      "可能咬牙入局",
      "颜值就是生产力",
    ],
  },
  F16: {
    text: "你不只看第一天有没有爽文开头，也想看后期有没有江湖座位。短期爽可以，长期没名分不行。",
    options: [
      "现在爽先爽",
      "以后以后再说",
      "两边都想要一点",
      "长期价值更重要",
      "我押一个未来传说",
    ],
  },
};

function patchQuestionCopy() {
  Object.entries(legacyQuestionCopy).forEach(([questionId, legacy]) => {
    const override = questionCopyOverrides[questionId];
    if (!override) return;

    document.querySelectorAll("h2").forEach((heading) => {
      if (heading.textContent.trim() === legacy.text) {
        heading.textContent = override.text;
      }
    });

    document.querySelectorAll('[role="radiogroup"]').forEach((group) => {
      if (group.getAttribute("aria-label") === legacy.text) {
        group.setAttribute("aria-label", override.text);
      }
    });

    document.querySelectorAll(".wizard-option span:last-child").forEach((label) => {
      const optionIndex = legacy.options.indexOf(label.textContent.trim());
      if (optionIndex >= 0 && override.options?.[optionIndex]) {
        label.textContent = override.options[optionIndex];
      }
    });
  });
}

function QuestionCopyDomPatch({ children }) {
  useEffect(() => {
    patchQuestionCopy();

    const observer = new MutationObserver(() => patchQuestionCopy());
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, []);

  return children;
}

export default QuestionCopyDomPatch;
