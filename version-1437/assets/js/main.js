(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = qs('[data-menu-button]');
    var panel = qs('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var carousel = qs('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = qsa('[data-hero-slide]', carousel);
    var dots = qsa('[data-hero-dot]', carousel);
    var index = 0;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  }

  function cardText(card) {
    return [
      card.getAttribute('data-title'),
      card.getAttribute('data-year'),
      card.getAttribute('data-type'),
      card.getAttribute('data-region'),
      card.getAttribute('data-genre'),
      card.textContent
    ].join(' ').toLowerCase();
  }

  function setupFilters() {
    var containers = qsa('[data-card-container]');
    if (!containers.length) {
      return;
    }
    var searchInput = qs('[data-card-search]');
    var yearSelect = qs('[data-year-filter]');
    var queryInput = qs('[data-query-input]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (queryInput && initialQuery) {
      queryInput.value = initialQuery;
    }

    function apply() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      containers.forEach(function (container) {
        qsa('.movie-card', container).forEach(function (card) {
          var matchQuery = !query || cardText(card).indexOf(query) !== -1;
          var matchYear = !year || card.getAttribute('data-year') === year;
          card.style.display = matchQuery && matchYear ? '' : 'none';
        });
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', apply);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', apply);
    }
    apply();
  }

  window.initPlayer = function (videoId, overlayId, videoUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var started = false;
    var hlsObject = null;

    if (!video || !overlay || !videoUrl) {
      return;
    }

    function attach() {
      if (started) {
        return;
      }
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsObject = new window.Hls();
        hlsObject.loadSource(videoUrl);
        hlsObject.attachMedia(video);
      } else {
        video.src = videoUrl;
      }
    }

    function play() {
      attach();
      overlay.classList.add('is-hidden');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    overlay.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (!started || video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      overlay.classList.add('is-hidden');
    });
    window.addEventListener('pagehide', function () {
      if (hlsObject) {
        hlsObject.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
