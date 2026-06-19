(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-main-nav]');
  var search = document.querySelector('.header-search');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      if (search) {
        search.classList.toggle('is-open');
      }
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var controls = Array.prototype.slice.call(document.querySelectorAll('.hero-control'));
  var activeIndex = 0;

  function activateHero(index) {
    if (!slides.length) {
      return;
    }
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === activeIndex);
    });
    controls.forEach(function (control, i) {
      control.classList.toggle('is-active', i === activeIndex);
    });
  }

  controls.forEach(function (control, index) {
    control.addEventListener('click', function () {
      activateHero(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      activateHero(activeIndex + 1);
    }, 6200);
  }

  var localFilter = document.querySelector('[data-local-filter]');
  var localCards = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));

  if (localFilter && localCards.length) {
    localFilter.addEventListener('input', function () {
      var keyword = localFilter.value.trim().toLowerCase();
      localCards.forEach(function (card) {
        var text = card.getAttribute('data-search') || '';
        card.style.display = text.indexOf(keyword) >= 0 ? '' : 'none';
      });
    });
  }

  var searchInput = document.querySelector('[data-search-page-input]');
  var searchButton = document.querySelector('[data-search-page-button]');
  var resultBox = document.querySelector('[data-search-results]');

  function buildCard(movie) {
    var article = document.createElement('article');
    article.className = 'movie-card';
    article.innerHTML = [
      '<a class="poster-link" href="' + movie.url + '">',
      '  <img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '  <span class="poster-badge">' + escapeHtml(movie.type || '影视') + '</span>',
      '</a>',
      '<div class="card-body">',
      '  <p class="card-meta">' + escapeHtml([movie.year, movie.region, movie.type].filter(Boolean).join(' / ')) + '</p>',
      '  <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
      '  <p class="card-desc">' + escapeHtml(movie.oneLine || '') + '</p>',
      '  <div class="mini-tags">' + buildTags(movie) + '</div>',
      '</div>'
    ].join('');
    return article;
  }

  function buildTags(movie) {
    var tags = [movie.region, movie.type, movie.year].filter(Boolean);
    String(movie.genre || '').split(/[，,\/、|]+/).forEach(function (item) {
      var term = item.trim();
      if (term && tags.indexOf(term) < 0) {
        tags.push(term);
      }
    });
    return tags.slice(0, 4).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderSearch() {
    if (!searchInput || !resultBox || !window.MOVIE_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var keyword = (searchInput.value || params.get('q') || '').trim().toLowerCase();
    if (!searchInput.value && keyword) {
      searchInput.value = keyword;
    }
    resultBox.innerHTML = '';
    if (!keyword) {
      resultBox.innerHTML = '<div class="search-results-empty">输入片名、地区、年份、类型或标签即可查找作品。</div>';
      return;
    }
    var matches = window.MOVIE_INDEX.filter(function (movie) {
      return String(movie.search || '').indexOf(keyword) >= 0;
    }).slice(0, 120);
    if (!matches.length) {
      resultBox.innerHTML = '<div class="search-results-empty">没有找到匹配的影视作品。</div>';
      return;
    }
    matches.forEach(function (movie) {
      resultBox.appendChild(buildCard(movie));
    });
  }

  if (searchInput && searchButton) {
    searchButton.addEventListener('click', renderSearch);
    searchInput.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        renderSearch();
      }
    });
    renderSearch();
  }

  var video = document.querySelector('[data-player-video]');
  var overlay = document.querySelector('[data-player-overlay]');
  var status = document.querySelector('[data-player-status]');
  var started = false;
  var bound = false;

  function bindVideo() {
    if (!video || bound) {
      return;
    }
    var url = window.__VIDEO_URL__ || '';
    if (!url) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      bound = true;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      bound = true;
      return;
    }
    video.src = url;
    bound = true;
  }

  function startVideo() {
    if (!video || started) {
      return;
    }
    bindVideo();
    started = true;
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    video.controls = true;
    var playPromise = video.play();
    if (status) {
      status.textContent = '正在加载播放内容...';
    }
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.then(function () {
        if (status) {
          status.textContent = '';
        }
      }).catch(function () {
        started = false;
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
        if (status) {
          status.textContent = '点击播放按钮继续观看。';
        }
      });
    }
  }

  if (overlay) {
    overlay.addEventListener('click', startVideo);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (!started) {
        startVideo();
      }
    });
  }
})();
