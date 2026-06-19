function initMoviePlayer(sourceUrl) {
  var shell = document.getElementById("movie-player-shell");
  var video = document.getElementById("movie-player");
  var button = document.getElementById("movie-play-button");
  var hlsInstance = null;
  var loaded = false;

  if (!shell || !video || !button || !sourceUrl) {
    return;
  }

  function loadSource() {
    if (loaded) {
      return;
    }
    loaded = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
    } else if (typeof Hls !== "undefined" && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }
  }

  function playVideo() {
    loadSource();
    shell.classList.add("is-playing");
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  button.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    playVideo();
  });

  shell.addEventListener("click", function (event) {
    if (!loaded && event.target !== video) {
      playVideo();
    }
  });

  video.addEventListener("play", function () {
    shell.classList.add("is-playing");
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
