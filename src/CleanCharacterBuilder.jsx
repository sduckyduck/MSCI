import { useEffect, useRef } from "react";
import FastCharacterBuilder from "./FastCharacterBuilder";

const FIXED_SKIN_ID = 2000;

function forceDefaultSkin(root) {
  if (!root) return;

  root.querySelectorAll("img.msio-character-img").forEach((image) => {
    const currentSrc = image.getAttribute("src") || "";
    const nextSrc = currentSrc.replace(/\/Character\/\d+\//, `/Character/${FIXED_SKIN_ID}/`);

    if (nextSrc && nextSrc !== currentSrc) {
      image.setAttribute("src", nextSrc);
    }
  });
}

function CleanCharacterBuilder(props) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    forceDefaultSkin(root);

    const observer = new MutationObserver(() => {
      forceDefaultSkin(root);
    });

    observer.observe(root, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["src"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef} className="clean-character-builder">
      <style>{`
        .clean-character-builder .builder-summary span {
          display: none !important;
        }
      `}</style>
      <FastCharacterBuilder {...props} />
    </div>
  );
}

export default CleanCharacterBuilder;
