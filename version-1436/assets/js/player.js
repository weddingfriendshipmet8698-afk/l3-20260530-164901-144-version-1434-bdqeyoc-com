(function () {
  window.initMoviePlayer = function (source) {
    var video = document.getElementById('movie-player');
    var trigger = document.getElementById('play-trigger');
    var hls = null;
    var ready = false;

    if (!video || !source) {
      return;
    }

    function loadPlayer() {
      if (ready) {
        return;
      }
      ready = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        return;
      }

      video.src = source;
    }

    function begin() {
      loadPlayer();
      if (trigger) {
        trigger.classList.add('is-hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (trigger) {
      trigger.addEventListener('click', begin);
    }

    video.addEventListener('play', function () {
      if (trigger) {
        trigger.classList.add('is-hidden');
      }
    });

    video.addEventListener('click', function () {
      if (!ready) {
        begin();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
