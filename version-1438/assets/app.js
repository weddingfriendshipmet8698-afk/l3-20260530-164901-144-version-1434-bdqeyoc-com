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
    var nav = document.querySelector('[data-main-nav]');
    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      toggle.classList.toggle('open');
    });
  }

  function setupImageFallbacks() {
    var images = document.querySelectorAll('img[data-image-fallback]');
    images.forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('image-missing');
        image.removeAttribute('src');
      });
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function setupFilters() {
    var form = document.querySelector('[data-filter-form]');
    var list = document.querySelector('[data-filter-list]');
    if (!form || !list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
    var emptyState = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || params.get('keyword') || '';
    var keywordInput = form.querySelector('[name="keyword"]');
    var yearInput = form.querySelector('[name="year"]');

    if (keywordInput && query) {
      keywordInput.value = query;
    }

    function applyFilter() {
      var keyword = normalize(keywordInput ? keywordInput.value : '');
      var year = normalize(yearInput ? yearInput.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-keywords'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesYear = !year || cardYear.indexOf(year) !== -1;
        var shouldShow = matchesKeyword && matchesYear;
        card.hidden = !shouldShow;
        if (shouldShow) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter();
    });

    form.addEventListener('input', applyFilter);
    form.addEventListener('change', applyFilter);
    applyFilter();
  }

  ready(function () {
    setupMenu();
    setupImageFallbacks();
    setupHeroCarousel();
    setupFilters();
  });
})();
