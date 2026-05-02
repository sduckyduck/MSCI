const INTRO_HEROES_BANNER_SRC = `${import.meta.env.BASE_URL}assets/msci-class-heroes.svg`;

function removeTopbarExtras(root = document) {
  const topbar = root.querySelector?.(".sbti-topbar");
  if (!topbar) return;

  topbar.querySelectorAll("span, .language-pill").forEach((element) => element.remove());
}

function addIntroHeroesBanner(root = document) {
  const introCard = root.querySelector?.(".sbti-intro-card");
  if (!introCard || introCard.querySelector(".intro-heroes-banner")) return;

  const introCopy = introCard.querySelector("div");
  if (!introCopy) return;

  const banner = document.createElement("img");
  banner.className = "intro-heroes-banner";
  banner.src = INTRO_HEROES_BANNER_SRC;
  banner.alt = "MapleStory class characters";
  banner.loading = "eager";
  banner.decoding = "async";

  introCopy.insertBefore(banner, introCopy.firstChild);
}

function applyIntroLayoutCleanup(root = document) {
  removeTopbarExtras(root);
  addIntroHeroesBanner(root);
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  applyIntroLayoutCleanup();

  const observer = new MutationObserver((mutations) => {
    applyIntroLayoutCleanup();

    for (const mutation of mutations) {
      for (const node of mutation.addedNodes || []) {
        if (node?.nodeType === 1) applyIntroLayoutCleanup(node);
      }
    }
  });

  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
  });
}
