(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function initMobileMenu() {
    var button = document.querySelector("[data-mobile-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }

    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }

    var current = 0;
    var timer = null;

    function showSlide(index) {
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
        showSlide(current + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    start();
  }

  function initFilterGrid() {
    var grids = Array.prototype.slice.call(document.querySelectorAll("[data-filter-grid]"));
    grids.forEach(function (grid) {
      var input = grid.querySelector("[data-search-input]");
      var selects = Array.prototype.slice.call(grid.querySelectorAll("[data-filter-select]"));
      var reset = grid.querySelector("[data-filter-reset]");
      var counter = grid.querySelector("[data-visible-count]");
      var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));

      function readQueryFromUrl() {
        if (!input) {
          return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (query) {
          input.value = query;
        }
      }

      function matchesSearch(card, keyword) {
        if (!keyword) {
          return true;
        }
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags"),
          card.textContent
        ].join(" ").toLowerCase();
        return haystack.indexOf(keyword) !== -1;
      }

      function matchesSelects(card) {
        return selects.every(function (select) {
          var value = select.value;
          if (!value) {
            return true;
          }
          var field = select.getAttribute("data-filter-field");
          var cardValue = card.getAttribute("data-" + field) || "";
          return cardValue === value;
        });
      }

      function applyFilters() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var visible = 0;
        cards.forEach(function (card) {
          var isVisible = matchesSearch(card, keyword) && matchesSelects(card);
          card.hidden = !isVisible;
          if (isVisible) {
            visible += 1;
          }
        });
        if (counter) {
          counter.textContent = String(visible);
        }
      }

      readQueryFromUrl();
      applyFilters();

      if (input) {
        input.addEventListener("input", applyFilters);
      }
      selects.forEach(function (select) {
        select.addEventListener("change", applyFilters);
      });
      if (reset) {
        reset.addEventListener("click", function () {
          if (input) {
            input.value = "";
          }
          selects.forEach(function (select) {
            select.value = "";
          });
          applyFilters();
        });
      }
    });
  }

  function initHlsPlayers() {
    var wrappers = Array.prototype.slice.call(document.querySelectorAll("[data-hls-player]"));
    wrappers.forEach(function (wrapper) {
      var video = wrapper.querySelector("video[data-src]");
      var button = wrapper.querySelector("[data-player-play]");
      var status = wrapper.querySelector("[data-player-status]");
      var hlsInstance = null;

      if (!video) {
        return;
      }

      var source = video.getAttribute("data-src");

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function attachSource() {
        if (!source) {
          setStatus("当前影片暂未配置播放源。");
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          if (video.src !== source) {
            video.src = source;
          }
          setStatus("已使用浏览器原生 HLS 能力加载播放源。");
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          if (!hlsInstance) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: false,
              backBufferLength: 90
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              setStatus("HLS 播放源已加载，点击播放或使用视频控件开始观看。");
            });
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                setStatus("播放源加载失败，请稍后重试或更换浏览器。");
              }
            });
          }
          return;
        }

        setStatus("当前浏览器不支持 HLS，建议使用 Safari、Edge、Chrome 或支持 Hls.js 的浏览器访问。");
      }

      attachSource();

      if (button) {
        button.addEventListener("click", function () {
          attachSource();
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
              setStatus("浏览器阻止了自动播放，请再次点击视频控件播放。");
            });
          }
        });
      }

      video.addEventListener("play", function () {
        wrapper.classList.add("is-playing");
      });

      video.addEventListener("pause", function () {
        if (video.currentTime === 0 || video.ended) {
          wrapper.classList.remove("is-playing");
        }
      });
    });
  }

  function initShareButtons() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-share-button]"));
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var targetUrl = button.getAttribute("data-share-url") || window.location.href;
        var absoluteUrl = new URL(targetUrl, window.location.href).href;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(absoluteUrl).then(function () {
            button.textContent = "链接已复制";
          }).catch(function () {
            window.prompt("复制影片链接", absoluteUrl);
          });
          return;
        }
        window.prompt("复制影片链接", absoluteUrl);
      });
    });
  }

  ready(function () {
    initMobileMenu();
    initHeroSlider();
    initFilterGrid();
    initHlsPlayers();
    initShareButtons();
  });
}());
