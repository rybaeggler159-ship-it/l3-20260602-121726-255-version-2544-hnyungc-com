(function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
    });
  }

  var backTop = document.querySelector("[data-back-top]");

  if (backTop) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 480) {
        backTop.classList.add("is-visible");
      } else {
        backTop.classList.remove("is-visible");
      }
    });

    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(
      hero.querySelectorAll(".hero-slide"),
    );
    var dots = Array.prototype.slice.call(
      hero.querySelectorAll("[data-hero-dot]"),
    );
    var previous = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var activeIndex = 0;
    var timer = null;

    function setHero(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
    }

    function startHero() {
      stopHero();
      timer = window.setInterval(function () {
        setHero(activeIndex + 1);
      }, 5200);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (previous) {
      previous.addEventListener("click", function () {
        setHero(activeIndex - 1);
        startHero();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        setHero(activeIndex + 1);
        startHero();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        setHero(Number(dot.getAttribute("data-hero-dot")) || 0);
        startHero();
      });
    });

    hero.addEventListener("mouseenter", stopHero);
    hero.addEventListener("mouseleave", startHero);
    setHero(0);
    startHero();
  }

  var scopes = Array.prototype.slice.call(
    document.querySelectorAll("[data-filter-scope]"),
  );

  function normalize(value) {
    return String(value || "")
      .trim()
      .toLowerCase();
  }

  function getComparableText(card) {
    return normalize(
      [
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-year"),
        card.getAttribute("data-category"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags"),
      ].join(" "),
    );
  }

  function cardYear(card) {
    var raw = card.getAttribute("data-year") || "";
    var match = raw.match(/\d{4}/);
    return match ? Number(match[0]) : 0;
  }

  scopes.forEach(function (scope) {
    var list = scope.parentElement.querySelector("[data-filter-list]");
    var controls = Array.prototype.slice.call(
      scope.querySelectorAll("[data-filter-control]"),
    );
    var empty = scope.querySelector("[data-empty-state]");

    if (!list || !controls.length) {
      return;
    }

    var originalCards = Array.prototype.slice.call(list.children);
    var queryControl = scope.querySelector("[data-url-query]");

    if (queryControl) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get(queryControl.getAttribute("data-url-query"));

      if (query) {
        queryControl.value = query;
      }
    }

    function applyFilters() {
      var values = {};

      controls.forEach(function (control) {
        values[control.getAttribute("data-filter-control")] = normalize(
          control.value,
        );
      });

      var visibleCards = originalCards.filter(function (card) {
        var haystack = getComparableText(card);
        var titleMatch = !values.query || haystack.indexOf(values.query) !== -1;
        var yearMatch =
          !values.year ||
          normalize(card.getAttribute("data-year")).indexOf(values.year) !== -1;
        var typeMatch =
          !values.type ||
          normalize(card.getAttribute("data-type")).indexOf(values.type) !== -1;
        var categoryMatch =
          !values.category ||
          normalize(card.getAttribute("data-category")) === values.category;

        return titleMatch && yearMatch && typeMatch && categoryMatch;
      });

      if (values.sort === "year-desc") {
        visibleCards.sort(function (a, b) {
          return cardYear(b) - cardYear(a);
        });
      }

      if (values.sort === "title-asc") {
        visibleCards.sort(function (a, b) {
          return normalize(a.getAttribute("data-title")).localeCompare(
            normalize(b.getAttribute("data-title")),
            "zh-Hans-CN",
          );
        });
      }

      originalCards.forEach(function (card) {
        card.hidden = true;
      });

      visibleCards.forEach(function (card) {
        card.hidden = false;
        list.appendChild(card);
      });

      if (empty) {
        empty.hidden = visibleCards.length > 0;
      }
    }

    controls.forEach(function (control) {
      control.addEventListener("input", applyFilters);
      control.addEventListener("change", applyFilters);
    });

    applyFilters();
  });
})();
