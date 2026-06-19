(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupMobileNavigation() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (!button || !nav) {
      return;
    }

    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHeaderSearch() {
    var forms = document.querySelectorAll("[data-site-search]");

    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = "./movies.html";
        }
      });
    });
  }

  function setupHeroSlider() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var previous = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    if (previous) {
      previous.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var panel = document.querySelector("[data-filter-panel]");

    if (!panel) {
      return;
    }

    var input = document.querySelector("[data-search-input]");
    var region = document.querySelector("[data-region-filter]");
    var year = document.querySelector("[data-year-filter]");
    var type = document.querySelector("[data-type-filter]");
    var count = document.querySelector("[data-result-count]");
    var empty = document.querySelector("[data-empty-state]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var params = new URLSearchParams(window.location.search);
    var queryFromUrl = params.get("q");

    if (input && queryFromUrl) {
      input.value = queryFromUrl;
    }

    function matches(card) {
      var query = normalize(input && input.value);
      var selectedRegion = normalize(region && region.value);
      var selectedYear = normalize(year && year.value);
      var selectedType = normalize(type && type.value);
      var haystack = normalize(card.getAttribute("data-search"));
      var cardRegion = normalize(card.getAttribute("data-region"));
      var cardYear = normalize(card.getAttribute("data-year"));
      var cardType = normalize(card.getAttribute("data-type"));

      if (query && haystack.indexOf(query) === -1) {
        return false;
      }

      if (selectedRegion && cardRegion !== selectedRegion) {
        return false;
      }

      if (selectedYear && cardYear !== selectedYear) {
        return false;
      }

      if (selectedType && cardType !== selectedType) {
        return false;
      }

      return true;
    }

    function apply() {
      var visible = 0;

      cards.forEach(function (card) {
        var ok = matches(card);
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = String(visible);
      }

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [input, region, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play-button]");
      var status = player.querySelector("[data-player-status]");
      var source = player.getAttribute("data-src");
      var initialized = false;
      var hlsInstance = null;

      function setStatus(message) {
        if (status) {
          status.textContent = message || "";
        }
      }

      function attachSource() {
        if (!video || !source || initialized) {
          return;
        }

        initialized = true;
        setStatus("正在加载播放源...");

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);

          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus("播放源加载完成");
            playVideo();
          });

          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }

            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              setStatus("网络异常，正在重试播放源...");
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              setStatus("媒体异常，正在尝试恢复...");
              hlsInstance.recoverMediaError();
            } else {
              setStatus("当前播放源暂时无法播放");
              hlsInstance.destroy();
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.addEventListener("loadedmetadata", function () {
            setStatus("播放源加载完成");
            playVideo();
          }, { once: true });
        } else {
          setStatus("当前浏览器无法直接播放 HLS，请使用支持 HLS 的浏览器。 ");
        }
      }

      function playVideo() {
        if (!video) {
          return;
        }

        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            setStatus("点击播放器后即可继续播放");
          });
        }
      }

      function startPlayback() {
        attachSource();
        playVideo();
      }

      if (button) {
        button.addEventListener("click", startPlayback);
      }

      if (video) {
        video.addEventListener("play", function () {
          player.classList.add("is-playing");
          setStatus("");
        });

        video.addEventListener("pause", function () {
          if (!video.ended) {
            player.classList.remove("is-playing");
          }
        });
      }

      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMobileNavigation();
    setupHeaderSearch();
    setupHeroSlider();
    setupFilters();
    setupPlayers();
  });
})();
