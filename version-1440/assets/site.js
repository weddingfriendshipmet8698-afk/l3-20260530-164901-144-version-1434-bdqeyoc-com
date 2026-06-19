(function() {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function initMobileNav() {
    var toggle = $("[data-mobile-toggle]");
    var nav = $("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function() {
      nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", nav.classList.contains("is-open") ? "true" : "false");
    });
  }

  function initHeroCarousel() {
    var carousel = $("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = $all("[data-hero-slide]", carousel);
    var dots = $all("[data-hero-dot]", carousel);
    var prev = $("[data-hero-prev]", carousel);
    var next = $("[data-hero-next]", carousel);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function startAuto() {
      stopAuto();
      timer = window.setInterval(function() {
        showSlide(index + 1);
      }, 5200);
    }

    function stopAuto() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function() {
        showSlide(index - 1);
        startAuto();
      });
    }

    if (next) {
      next.addEventListener("click", function() {
        showSlide(index + 1);
        startAuto();
      });
    }

    dots.forEach(function(dot, dotIndex) {
      dot.addEventListener("click", function() {
        showSlide(dotIndex);
        startAuto();
      });
    });

    carousel.addEventListener("mouseenter", stopAuto);
    carousel.addEventListener("mouseleave", startAuto);
    showSlide(0);
    startAuto();
  }

  function initLocalFilters() {
    var filterRoot = $("[data-filter-root]");
    if (!filterRoot) {
      return;
    }
    var input = $("[data-filter-input]", filterRoot);
    var buttons = $all("[data-filter-value]", filterRoot);
    var cards = $all("[data-movie-card]");
    var empty = $("[data-empty-state]");
    var activeValue = "all";

    function cardMatches(card, query, value) {
      var haystack = [
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-year"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags")
      ].join(" ").toLowerCase();
      var queryOk = !query || haystack.indexOf(query) !== -1;
      var valueOk = value === "all" || haystack.indexOf(value.toLowerCase()) !== -1;
      return queryOk && valueOk;
    }

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var visible = 0;
      cards.forEach(function(card) {
        var keep = cardMatches(card, query, activeValue);
        card.style.display = keep ? "" : "none";
        if (keep) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }

    buttons.forEach(function(button) {
      button.addEventListener("click", function() {
        buttons.forEach(function(item) {
          item.classList.remove("is-active");
        });
        button.classList.add("is-active");
        activeValue = button.getAttribute("data-filter-value") || "all";
        applyFilter();
      });
    });

    applyFilter();
  }

  function makeMovieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function(tag) {
      return '<span class="pill">' + escapeHtml(tag) + '</span>';
    }).join("");
    return [
      '<article class="movie-card fade-in">',
      '<a class="movie-poster" href="' + escapeHtml(movie.href) + '">',
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="movie-badge">' + escapeHtml(movie.type) + '</span>',
      '<span class="movie-year">' + escapeHtml(movie.year) + '</span>',
      '</a>',
      '<div class="movie-body">',
      '<h2 class="movie-title"><a href="' + escapeHtml(movie.href) + '">' + escapeHtml(movie.title) + '</a></h2>',
      '<p class="movie-desc">' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="pill-row">' + tags + '</div>',
      '<div class="movie-meta" style="margin-top: 12px;">',
      '<span>' + escapeHtml(movie.region) + '</span>',
      '<span>·</span>',
      '<span>' + escapeHtml(movie.genre) + '</span>',
      '</div>',
      '</div>',
      '</article>'
    ].join("");
  }

  function initSearchPage() {
    var results = $("[data-search-results]");
    var searchForm = $("[data-search-page-form]");
    var searchInput = $("[data-search-page-input]");
    var empty = $("[data-search-empty]");
    if (!results || !searchForm || !searchInput || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    function getQuery() {
      var params = new URLSearchParams(window.location.search);
      return params.get("q") || searchInput.value || "";
    }

    function performSearch(query) {
      var normalized = String(query || "").trim().toLowerCase();
      searchInput.value = query || "";
      var source = window.MOVIE_SEARCH_INDEX || [];
      var matches = source.filter(function(movie) {
        if (!normalized) {
          return true;
        }
        return [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          (movie.tags || []).join(" "),
          movie.oneLine
        ].join(" ").toLowerCase().indexOf(normalized) !== -1;
      }).slice(0, 120);
      results.innerHTML = matches.map(makeMovieCard).join("");
      if (empty) {
        empty.classList.toggle("is-visible", matches.length === 0);
      }
    }

    searchForm.addEventListener("submit", function(event) {
      event.preventDefault();
      var query = searchInput.value.trim();
      var url = new URL(window.location.href);
      if (query) {
        url.searchParams.set("q", query);
      } else {
        url.searchParams.delete("q");
      }
      window.history.replaceState(null, "", url.toString());
      performSearch(query);
    });

    performSearch(getQuery());
  }

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var existing = document.querySelector("script[data-hls-loader]");
    if (existing) {
      existing.addEventListener("load", callback);
      existing.addEventListener("error", callback);
      return;
    }
    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js";
    script.async = true;
    script.setAttribute("data-hls-loader", "true");
    script.addEventListener("load", callback);
    script.addEventListener("error", callback);
    document.head.appendChild(script);
  }

  function initSinglePlayer(frame) {
    var video = $("video", frame);
    var button = $("[data-play-button]", frame);
    var status = $("[data-player-status]", frame.parentNode);
    var source = frame.getAttribute("data-video-url");
    var started = false;
    var hlsInstance = null;

    if (!video || !button || !source) {
      return;
    }

    function setStatus(text) {
      if (status) {
        status.textContent = text || "";
      }
    }

    function attachAndPlay() {
      if (started) {
        video.play();
        return;
      }

      started = true;
      setStatus("播放源准备中");
      video.controls = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", function() {
          video.play();
        }, { once: true });
        video.play().catch(function() {
          setStatus("点击视频画面继续播放");
        });
      } else {
        loadHls(function() {
          if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function() {
              video.play().catch(function() {
                setStatus("点击视频画面继续播放");
              });
            });
            hlsInstance.on(window.Hls.Events.ERROR, function(eventName, data) {
              if (data && data.fatal) {
                setStatus("当前播放源暂时无法连接");
              }
            });
          } else {
            video.src = source;
            video.play().catch(function() {
              setStatus("当前浏览器需要支持 HLS 播放");
            });
          }
        });
      }

      button.classList.add("is-hidden");
    }

    button.addEventListener("click", attachAndPlay);
    video.addEventListener("click", function() {
      if (video.paused) {
        attachAndPlay();
      } else {
        video.pause();
      }
    });

    window.addEventListener("beforeunload", function() {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  function initPlayers() {
    $all("[data-player]").forEach(initSinglePlayer);
  }

  document.addEventListener("DOMContentLoaded", function() {
    initMobileNav();
    initHeroCarousel();
    initLocalFilters();
    initSearchPage();
    initPlayers();
  });
})();
