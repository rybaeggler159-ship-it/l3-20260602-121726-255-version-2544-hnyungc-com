(function () {
  var video = document.getElementById('main-video');
  var button = document.querySelector('[data-play-button]');
  var status = document.querySelector('[data-player-status]');

  if (!video) {
    return;
  }

  var source = video.querySelector('source');
  var streamUrl = source ? source.getAttribute('src') : '';
  var started = false;

  function setStatus(text) {
    if (status) {
      status.textContent = text;
    }
  }

  function startVideo() {
    if (!streamUrl) {
      setStatus('播放源暂时不可用');
      return;
    }

    if (started) {
      video.play();
      return;
    }

    started = true;

    if (button) {
      button.classList.add('is-hidden');
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {
          setStatus('点击视频画面继续播放');
        });
      });
      hls.on(window.Hls.Events.ERROR, function (eventName, data) {
        if (data && data.fatal) {
          setStatus('播放连接异常，请稍后重试');
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', function () {
        video.play().catch(function () {
          setStatus('点击视频画面继续播放');
        });
      }, { once: true });
    } else {
      setStatus('浏览器需要 HLS 播放能力');
    }
  }

  if (button) {
    button.addEventListener('click', startVideo);
  }

  video.addEventListener('click', function () {
    if (!started) {
      startVideo();
    }
  });
})();
