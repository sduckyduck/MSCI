const INTRO_HEROES_BANNER_SRC = `${import.meta.env.BASE_URL}assets/msci-class-heroes.png`;

function installIntroLayoutStyles() {
  if (document.getElementById("msci-intro-layout-cleanup-styles")) return;

  const style = document.createElement("style");
  style.id = "msci-intro-layout-cleanup-styles";
  style.textContent = `
    .sbti-topbar {
      grid-template-columns: auto 1fr !important;
    }

    .sbti-topbar .logo-mark + b {
      justify-self: start;
    }

    .intro-heroes-banner {
      display: block;
      width: min(100%, 760px);
      max-height: 260px;
      object-fit: contain;
      object-position: center bottom;
      margin: 0 auto 26px;
      filter: drop-shadow(0 18px 22px rgba(31, 24, 16, 0.16));
    }

    .sbti-intro-card > div {
      min-width: 0;
    }

    @media (min-width: 761px) {
      .sbti-intro-card {
        grid-template-columns: minmax(0, 1fr) auto;
      }

      .intro-heroes-banner {
        margin-left: 0;
      }
    }

    @media (max-width: 760px) {
      .intro-heroes-banner {
        max-height: 210px;
        margin-bottom: 20px;
      }
    }
  `;
  document.head.appendChild(style);
}

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
  installIntroLayoutStyles();
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
