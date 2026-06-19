(function () {
  var hlsScriptUrl = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
  var loadingPromise = null;

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function loadHlsScript() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (loadingPromise) {
      return loadingPromise;
    }

    loadingPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = hlsScriptUrl;
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = function () {
        reject(new Error('hls.js load failed'));
      };
      document.head.appendChild(script);
    });

    return loadingPromise;
  }

  function canPlayNativeHls(video) {
    return Boolean(video.canPlayType('application/vnd.apple.mpegurl')) ||
      Boolean(video.canPlayType('application/x-mpegURL'));
  }

  function bindSource(video, sourceUrl) {
    if (video.dataset.bound === 'true') {
      return Promise.resolve();
    }

    video.dataset.bound = 'true';

    if (canPlayNativeHls(video)) {
      video.src = sourceUrl;
      return Promise.resolve();
    }

    return loadHlsScript()
      .then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          var hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 90
          });
          hls.loadSource(sourceUrl);
          hls.attachMedia(video);
          video._hlsInstance = hls;
          return;
        }
        video.src = sourceUrl;
      })
      .catch(function () {
        video.src = sourceUrl;
      });
  }

  function setupPlayer(shell) {
    var video = shell.querySelector('video[data-src]');
    var button = shell.querySelector('.play-button');

    if (!video) {
      return;
    }

    function startPlayback() {
      var sourceUrl = video.getAttribute('data-src');
      if (!sourceUrl) {
        return;
      }

      shell.classList.add('is-loading');
      bindSource(video, sourceUrl).then(function () {
        shell.classList.remove('is-loading');
        shell.classList.add('is-playing');
        return video.play();
      }).catch(function () {
        shell.classList.remove('is-loading');
        shell.classList.add('needs-user-action');
      });
    }

    if (button) {
      button.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      shell.classList.remove('is-playing');
    });
  }

  ready(function () {
    var shells = document.querySelectorAll('[data-video-shell]');
    shells.forEach(setupPlayer);
  });
})();
