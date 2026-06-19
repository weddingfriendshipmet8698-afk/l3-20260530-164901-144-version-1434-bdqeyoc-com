(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function setupFilters() {
    var input = document.querySelector('[data-search-input]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var regionFilter = document.querySelector('[data-region-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    if (!input || cards.length === 0) {
      return;
    }

    function apply() {
      var keyword = normalize(input.value);
      var yearValue = yearFilter ? normalize(yearFilter.value) : '';
      var regionValue = regionFilter ? normalize(regionFilter.value) : '';
      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.tags
        ].join(' '));
        var yearMatch = !yearValue || normalize(card.dataset.year) === yearValue;
        var regionMatch = !regionValue || normalize(card.dataset.region) === regionValue;
        var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
        card.classList.toggle('is-hidden', !(yearMatch && regionMatch && keywordMatch));
      });
    }

    input.addEventListener('input', apply);
    if (yearFilter) {
      yearFilter.addEventListener('change', apply);
    }
    if (regionFilter) {
      regionFilter.addEventListener('change', apply);
    }
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (slides.length === 0) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.dataset.heroDot || 0));
        start();
      });
    });

    show(0);
    start();
  }

  function setupPlayer() {
    var video = document.querySelector('[data-player]');
    var button = document.querySelector('[data-play]');
    if (!video || !button) {
      return;
    }
    var stream = video.dataset.stream;
    var attached = false;

    function attach() {
      if (!stream || attached) {
        return;
      }
      attached = true;
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else {
        video.src = stream;
      }
    }

    function play() {
      attach();
      button.classList.add('is-hidden');
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {
          button.classList.remove('is-hidden');
        });
      }
    }

    button.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
  }

  ready(function () {
    setupMenu();
    setupFilters();
    setupHero();
    setupPlayer();
  });
})();
