(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var sliders = document.querySelectorAll("[data-hero-slider]");

    sliders.forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
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

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
          start();
        });
      });

      slider.addEventListener("mouseenter", stop);
      slider.addEventListener("mouseleave", start);
      show(0);
      start();
    });

    var scopes = document.querySelectorAll("[data-search-scope]");

    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-search-input]");
      var select = scope.querySelector("[data-filter-category]");
      var clear = scope.querySelector("[data-clear-filter]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var empty = scope.querySelector("[data-no-results]");

      function applyFilter() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var category = select ? select.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
          var cardCategory = card.getAttribute("data-category") || "";
          var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchedCategory = !category || cardCategory === category;
          var matched = matchedKeyword && matchedCategory;

          card.style.display = matched ? "" : "none";

          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", applyFilter);
      }

      if (select) {
        select.addEventListener("change", applyFilter);
      }

      if (clear) {
        clear.addEventListener("click", function () {
          if (input) {
            input.value = "";
          }

          if (select) {
            select.value = "";
          }

          applyFilter();
        });
      }
    });
  });

  window.setupPlayer = function (streamUrl) {
    var shell = document.querySelector("[data-player]");

    if (!shell) {
      return;
    }

    var video = shell.querySelector("video");
    var cover = shell.querySelector(".player-cover");
    var hls = null;
    var loaded = false;

    function load() {
      if (loaded || !video || !streamUrl) {
        return;
      }

      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(streamUrl);
        hls.attachMedia(video);

        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
      } else {
        video.src = streamUrl;
      }
    }

    function start() {
      load();
      shell.classList.add("is-playing");
      video.play().catch(function () {
        shell.classList.remove("is-playing");
      });
    }

    if (cover) {
      cover.addEventListener("click", start);
    }

    video.addEventListener("play", function () {
      shell.classList.add("is-playing");
    });

    video.addEventListener("pause", function () {
      if (!video.currentTime) {
        shell.classList.remove("is-playing");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };
})();
