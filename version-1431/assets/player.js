function initMoviePlayer(videoUrl) {
    var video = document.getElementById('movie-video');
    var overlay = document.getElementById('play-overlay');
    if (!video || !videoUrl) {
        return;
    }
    var started = false;
    var hlsInstance = null;
    function hideOverlay() {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    }
    function startNative() {
        video.src = videoUrl;
        video.play().catch(function () {});
    }
    function startHls() {
        hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true
        });
        hlsInstance.loadSource(videoUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
        });
        hlsInstance.on(Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
                hlsInstance.destroy();
                video.src = videoUrl;
                video.play().catch(function () {});
            }
        });
    }
    function start() {
        hideOverlay();
        if (started) {
            video.play().catch(function () {});
            return;
        }
        started = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            startNative();
        } else if (window.Hls && Hls.isSupported()) {
            startHls();
        } else {
            startNative();
        }
    }
    if (overlay) {
        overlay.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
        if (video.paused) {
            start();
        }
    });
    video.addEventListener('play', hideOverlay);
    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
