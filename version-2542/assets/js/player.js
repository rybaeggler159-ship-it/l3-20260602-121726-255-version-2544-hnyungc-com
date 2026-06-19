(function () {
  var video = document.querySelector("[data-player]");
  var button = document.querySelector("[data-play-button]");

  if (!video || !button) {
    return;
  }

  var hlsInstance = null;
  var initialized = false;

  function showMessage(text) {
    button.innerHTML = "<span>" + text + "</span>";
    button.classList.remove("is-hidden");
  }

  function initialize() {
    if (initialized) {
      return Promise.resolve();
    }

    initialized = true;
    var stream = video.getAttribute("data-stream");

    if (!stream) {
      showMessage("暂不可播");
      return Promise.reject(new Error("empty stream"));
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      hlsInstance.loadSource(stream);
      hlsInstance.attachMedia(video);

      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          showMessage("重新播放");
        }
      });

      return Promise.resolve();
    }

    showMessage("暂不可播");
    return Promise.reject(new Error("hls unavailable"));
  }

  function play() {
    initialize()
      .then(function () {
        button.classList.add("is-hidden");
        var playback = video.play();

        if (playback && typeof playback.catch === "function") {
          playback.catch(function () {
            button.classList.remove("is-hidden");
          });
        }
      })
      .catch(function () {
        button.classList.remove("is-hidden");
      });
  }

  button.addEventListener("click", play);

  video.addEventListener("play", function () {
    button.classList.add("is-hidden");
  });

  video.addEventListener("pause", function () {
    if (!video.ended) {
      button.classList.remove("is-hidden");
    }
  });

  video.addEventListener("ended", function () {
    button.classList.remove("is-hidden");
  });

  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
