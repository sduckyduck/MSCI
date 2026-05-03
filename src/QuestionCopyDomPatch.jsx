import { useEffect } from "react";
import { questionCopyOverrides } from "./model/questionCopyOverrides";

const legacyF10Text = "全网都在抢同一种排面，价格像坐火箭，但它确实很会营造氛围。你会不会突然被审美诈骗？";
const legacyF10Options = [
  "不当氛围韭菜",
  "我会犹豫三秒",
  "看余额脸色",
  "可能咬牙入局",
  "颜值就是生产力",
];

function patchF10Copy() {
  const override = questionCopyOverrides.F10;
  if (!override) return;

  document.querySelectorAll("h2").forEach((heading) => {
    if (heading.textContent.trim() === legacyF10Text) {
      heading.textContent = override.text;
    }
  });

  document.querySelectorAll('[role="radiogroup"]').forEach((group) => {
    if (group.getAttribute("aria-label") === legacyF10Text) {
      group.setAttribute("aria-label", override.text);
    }
  });

  document.querySelectorAll(".wizard-option span:last-child").forEach((label) => {
    const optionIndex = legacyF10Options.indexOf(label.textContent.trim());
    if (optionIndex >= 0 && override.options?.[optionIndex]) {
      label.textContent = override.options[optionIndex];
    }
  });
}

function QuestionCopyDomPatch({ children }) {
  useEffect(() => {
    patchF10Copy();

    const observer = new MutationObserver(() => patchF10Copy());
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
