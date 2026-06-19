var Hls = window.Hls;
var video = document.querySelector(".video-player");
var button = document.querySelector("[data-play]");
var hlsInstance = null;
var prepared = false;

function prepareVideo() {
    if (!video || prepared) {
        return;
    }

    var stream = video.getAttribute("data-stream");
    if (!stream) {
        return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        prepared = true;
        return;
    }

    if (Hls && Hls.isSupported()) {
        hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        prepared = true;
    }
}

function playVideo() {
    if (!video) {
        return;
    }

    prepareVideo();

    var started = video.play();
    if (started && typeof started.then === "function") {
        started.catch(function () {});
    }

    if (button) {
        button.classList.add("is-hidden");
    }
}

if (button) {
    button.addEventListener("click", playVideo);
}

if (video) {
    video.addEventListener("click", function () {
        if (video.paused) {
            playVideo();
        }
    });
    video.addEventListener("play", function () {
        if (button) {
            button.classList.add("is-hidden");
        }
    });
    video.addEventListener("pause", function () {
        if (button && video.currentTime === 0) {
            button.classList.remove("is-hidden");
        }
    });
    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
