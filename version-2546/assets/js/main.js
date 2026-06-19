(function () {
  const header = document.getElementById("siteHeader");
  const menuButton = document.querySelector(".menu-button");
  const mobileNav = document.querySelector(".mobile-nav");

  function updateHeader() {
    if (!header) {
      return;
    }

    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      const isOpen = mobileNav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });
  }

  const hero = document.getElementById("heroCarousel");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll(".hero-dot"));
    const prev = hero.querySelector(".hero-prev");
    const next = hero.querySelector(".hero-next");
    let index = 0;
    let timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5600);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.dataset.slide || 0));
        startTimer();
      });
    });

    startTimer();
  }

  const pageFilter = document.querySelector(".page-filter-input");
  const filterableGrid = document.querySelector(".filterable-grid");

  if (pageFilter && filterableGrid) {
    const cards = Array.from(filterableGrid.querySelectorAll(".movie-card"));

    pageFilter.addEventListener("input", function () {
      const keyword = pageFilter.value.trim().toLowerCase();

      cards.forEach(function (card) {
        const content = (card.dataset.search || "").toLowerCase();
        card.classList.toggle("is-hidden", keyword.length > 0 && !content.includes(keyword));
      });
    });
  }

  const searchKeyword = document.getElementById("searchKeyword");
  const searchGroup = document.getElementById("searchGroup");
  const searchType = document.getElementById("searchType");
  const searchRegion = document.getElementById("searchRegion");
  const resetSearch = document.getElementById("resetSearch");
  const searchStatus = document.getElementById("searchStatus");
  const searchGrid = document.querySelector(".search-grid");

  if (searchKeyword && searchGrid) {
    const cards = Array.from(searchGrid.querySelectorAll(".movie-card"));
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q") || "";

    searchKeyword.value = initialQuery;

    function applySearch() {
      const keyword = searchKeyword.value.trim().toLowerCase();
      const group = searchGroup ? searchGroup.value : "";
      const type = searchType ? searchType.value : "";
      const region = searchRegion ? searchRegion.value : "";
      let shown = 0;

      cards.forEach(function (card) {
        const content = (card.dataset.search || "").toLowerCase();
        const matchKeyword = !keyword || content.includes(keyword);
        const matchGroup = !group || card.dataset.group === group;
        const matchType = !type || card.dataset.type === type;
        const matchRegion = !region || card.dataset.region === region;
        const visible = matchKeyword && matchGroup && matchType && matchRegion;

        card.classList.toggle("is-hidden", !visible);

        if (visible) {
          shown += 1;
        }
      });

      if (searchStatus) {
        searchStatus.textContent = keyword || group || type || region ? "匹配影片 " + shown + " 部" : "影片片库";
      }
    }

    [searchKeyword, searchGroup, searchType, searchRegion].forEach(function (input) {
      if (input) {
        input.addEventListener("input", applySearch);
        input.addEventListener("change", applySearch);
      }
    });

    if (resetSearch) {
      resetSearch.addEventListener("click", function () {
        searchKeyword.value = "";
        if (searchGroup) {
          searchGroup.value = "";
        }
        if (searchType) {
          searchType.value = "";
        }
        if (searchRegion) {
          searchRegion.value = "";
        }
        applySearch();
      });
    }

    applySearch();
  }
})();
