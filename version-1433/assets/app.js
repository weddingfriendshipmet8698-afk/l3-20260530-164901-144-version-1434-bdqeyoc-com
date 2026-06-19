(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (menuButton && mobileNav) {
      menuButton.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
      });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var current = 0;
      if (!slides.length) {
        return;
      }
      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === current);
        });
      }
      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          show(index);
        });
      });
      window.setInterval(function () {
        show(current + 1);
      }, 5600);
    });

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
      var input = scope.querySelector('[data-search-input]');
      var yearSelect = scope.querySelector('[data-year-filter]');
      var typeSelect = scope.querySelector('[data-type-filter]');
      var container = scope.parentElement || document;
      var cards = Array.prototype.slice.call(container.querySelectorAll('[data-card]'));
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q && input) {
        input.value = q;
      }
      function run() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var year = yearSelect ? yearSelect.value : '';
        var type = typeSelect ? typeSelect.value : '';
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year')
          ].join(' ').toLowerCase();
          var matched = (!keyword || haystack.indexOf(keyword) !== -1) &&
            (!year || card.getAttribute('data-year') === year) &&
            (!type || card.getAttribute('data-type') === type);
          card.classList.toggle('is-hidden', !matched);
        });
      }
      [input, yearSelect, typeSelect].forEach(function (node) {
        if (node) {
          node.addEventListener('input', run);
          node.addEventListener('change', run);
        }
      });
      run();
    });

    document.querySelectorAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var cover = player.querySelector('.player-cover');
      var stream = player.getAttribute('data-stream');
      var loaded = false;
      var hlsInstance = null;
      if (!video || !stream) {
        return;
      }
      function attachStream() {
        if (loaded) {
          return Promise.resolve();
        }
        loaded = true;
        video.controls = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          return new Promise(function (resolve) {
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, resolve);
          });
        }
        video.src = stream;
        return Promise.resolve();
      }
      function start() {
        if (cover) {
          cover.classList.add('is-hidden');
        }
        attachStream().then(function () {
          var playRequest = video.play();
          if (playRequest && typeof playRequest.catch === 'function') {
            playRequest.catch(function () {});
          }
        });
      }
      if (cover) {
        cover.addEventListener('click', start);
      }
      video.addEventListener('click', function () {
        if (!loaded || video.paused) {
          start();
        } else {
          video.pause();
        }
      });
      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
