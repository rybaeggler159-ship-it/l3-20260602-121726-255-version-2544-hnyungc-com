(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector(".mobile-menu-button");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        var isOpen = mobilePanel.hasAttribute("hidden");
        if (isOpen) {
          mobilePanel.removeAttribute("hidden");
          menuButton.setAttribute("aria-expanded", "true");
          menuButton.textContent = "×";
        } else {
          mobilePanel.setAttribute("hidden", "");
          menuButton.setAttribute("aria-expanded", "false");
          menuButton.textContent = "☰";
        }
      });
    }

    initHeroCarousel();
    initPageFilters();
    initSearchPage();
  });

  function initHeroCarousel() {
    var carousel = document.querySelector(".hero-carousel");
    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    var index = 0;
    var timer = null;

    function show(nextIndex) {
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

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var next = parseInt(dot.getAttribute("data-slide"), 10);
        show(Number.isNaN(next) ? 0 : next);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initPageFilters() {
    var input = document.querySelector(".page-filter-input");
    var select = document.querySelector(".page-filter-category");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .rank-row"));

    if (!cards.length || (!input && !select)) {
      return;
    }

    var message = document.createElement("div");
    message.className = "empty-filter-message";
    message.textContent = "暂无匹配影片";
    message.hidden = true;

    var container = cards[0].parentElement;
    if (container) {
      container.parentElement.appendChild(message);
    }

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function applyFilter() {
      var keyword = normalize(input ? input.value : "");
      var category = normalize(select ? select.value : "");
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-category"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags")
        ].join(" "));
        var cardCategory = normalize(card.getAttribute("data-category"));
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedCategory = !category || cardCategory === category;
        var matched = matchedKeyword && matchedCategory;
        card.classList.toggle("is-hidden-by-filter", !matched);
        if (matched) {
          visible += 1;
        }
      });

      message.hidden = visible !== 0;
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }
    if (select) {
      select.addEventListener("change", applyFilter);
    }
    applyFilter();
  }

  function initSearchPage() {
    var results = document.getElementById("search-results");
    var input = document.getElementById("search-page-input");
    var select = document.getElementById("search-category-select");
    var title = document.getElementById("search-results-title");

    if (!results || !input || typeof SEARCH_MOVIES === "undefined") {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    input.value = params.get("q") || "";

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function cardHtml(movie) {
      return [
        '<article class="movie-card glass-effect card-hover" data-title="', escapeHtml(movie.title), '" data-category="', escapeHtml(movie.category), '" data-year="', escapeHtml(movie.year), '" data-tags="', escapeHtml((movie.tags || []).join(" ")), '">',
        '<a class="movie-card-link" href="movies/movie-', escapeHtml(movie.id), '.html">',
        '<div class="movie-poster">',
        '<img src="./', escapeHtml(movie.cover), '.jpg" alt="', escapeHtml(movie.title), '" loading="lazy">',
        '<div class="poster-shade"></div>',
        '<div class="poster-meta"><span>', escapeHtml(movie.duration), '</span><span>', escapeHtml(movie.views), '</span></div>',
        '<span class="poster-play">▶</span>',
        '</div>',
        '<div class="movie-card-body">',
        '<h3>', escapeHtml(movie.title), '</h3>',
        '<p>', escapeHtml(movie.oneLine), '</p>',
        '<div class="movie-card-foot"><span class="pill">', escapeHtml(movie.category), '</span><span>', escapeHtml(movie.year), '</span></div>',
        '</div>',
        '</a>',
        '</article>'
      ].join("");
    }

    function render() {
      var keyword = normalize(input.value);
      var category = normalize(select ? select.value : "");
      var matches = SEARCH_MOVIES.filter(function (movie) {
        var text = normalize([
          movie.title,
          movie.oneLine,
          movie.summary,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          (movie.tags || []).join(" ")
        ].join(" "));
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedCategory = !category || normalize(movie.category) === category;
        return matchedKeyword && matchedCategory;
      }).slice(0, 120);

      if (title) {
        title.textContent = keyword || category ? "搜索结果" : "推荐影片";
      }

      if (!matches.length) {
        results.innerHTML = '<div class="empty-filter-message">暂无匹配影片</div>';
        return;
      }

      results.innerHTML = matches.map(cardHtml).join("");
    }

    input.addEventListener("input", render);
    if (select) {
      select.addEventListener("change", render);
    }
    render();
  }
})();
