(function () {
  var players = document.querySelectorAll('[data-player]');

  var bind = function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-play-button]');

    if (!video) {
      return;
    }

    var source = video.getAttribute('data-source');
    var loaded = false;

    var loadSource = function () {
      if (loaded || !source) {
        return;
      }
      loaded = true;

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
    };

    var start = function () {
      loadSource();
      shell.classList.add('is-playing');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          shell.classList.remove('is-playing');
        });
      }
    };

    if (button) {
      button.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        shell.classList.remove('is-playing');
      }
    });
  };

  players.forEach(bind);
})();
