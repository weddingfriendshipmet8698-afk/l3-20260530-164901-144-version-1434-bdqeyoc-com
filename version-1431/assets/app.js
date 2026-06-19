(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initMenu() {
        var button = qs('[data-menu-button]');
        var nav = qs('[data-site-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHero() {
        var slides = qsa('.hero-slide');
        var dots = qsa('.hero-dot');
        var thumbs = qsa('.hero-thumb');
        var title = qs('[data-hero-title]');
        var desc = qs('[data-hero-desc]');
        var meta = qs('[data-hero-meta]');
        var link = qs('[data-hero-link]');
        if (!slides.length || !title || !desc || !meta || !link) {
            return;
        }
        var active = 0;
        function apply(index) {
            active = index;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === active);
            });
            thumbs.forEach(function (thumb, i) {
                thumb.classList.toggle('is-active', i === active);
            });
            var slide = slides[active];
            title.textContent = slide.getAttribute('data-title') || '';
            desc.textContent = slide.getAttribute('data-desc') || '';
            link.setAttribute('href', slide.getAttribute('data-url') || './index.html');
            meta.innerHTML = '';
            ['year', 'region', 'genre'].forEach(function (name) {
                var value = slide.getAttribute('data-' + name);
                if (value) {
                    var chip = document.createElement('span');
                    chip.textContent = value;
                    meta.appendChild(chip);
                }
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                apply(i);
            });
        });
        thumbs.forEach(function (thumb, i) {
            thumb.addEventListener('click', function () {
                apply(i);
            });
        });
        apply(0);
        window.setInterval(function () {
            apply((active + 1) % slides.length);
        }, 5200);
    }

    function buildSearchItem(item) {
        var a = document.createElement('a');
        a.className = 'search-result-item';
        a.href = item.url;
        var img = document.createElement('img');
        img.src = item.cover;
        img.alt = item.title;
        img.loading = 'lazy';
        var text = document.createElement('div');
        var strong = document.createElement('strong');
        strong.textContent = item.title;
        var span = document.createElement('span');
        span.textContent = [item.year, item.region, item.type].filter(Boolean).join(' · ');
        text.appendChild(strong);
        text.appendChild(span);
        a.appendChild(img);
        a.appendChild(text);
        return a;
    }

    function initSiteSearch() {
        var index = window.MOVIE_SEARCH_INDEX || [];
        qsa('.site-search').forEach(function (form) {
            var input = qs('.site-search-input', form);
            var results = qs('.site-search-results', form);
            if (!input || !results) {
                return;
            }
            function render() {
                var keyword = normalize(input.value);
                results.innerHTML = '';
                if (!keyword) {
                    results.classList.remove('is-visible');
                    return;
                }
                var found = index.filter(function (item) {
                    return normalize(item.title + ' ' + item.region + ' ' + item.type + ' ' + item.genre + ' ' + item.year).indexOf(keyword) !== -1;
                }).slice(0, 8);
                found.forEach(function (item) {
                    results.appendChild(buildSearchItem(item));
                });
                results.classList.toggle('is-visible', found.length > 0);
            }
            input.addEventListener('input', render);
            input.addEventListener('focus', render);
            document.addEventListener('click', function (event) {
                if (!form.contains(event.target)) {
                    results.classList.remove('is-visible');
                }
            });
            form.addEventListener('submit', function (event) {
                var keyword = normalize(input.value);
                if (!keyword) {
                    return;
                }
                var target = index.find(function (item) {
                    return normalize(item.title) === keyword;
                }) || index.find(function (item) {
                    return normalize(item.title).indexOf(keyword) !== -1;
                });
                if (target) {
                    event.preventDefault();
                    window.location.href = target.url;
                }
            });
        });
    }

    function initFilters() {
        var panel = qs('[data-filter-panel]');
        if (!panel) {
            return;
        }
        var search = qs('#filter-search');
        var year = qs('#filter-year');
        var region = qs('#filter-region');
        var type = qs('#filter-type');
        var reset = qs('#filter-reset');
        var count = qs('#filter-count');
        var cards = qsa('.movie-card[data-title]');
        var empty = qs('[data-empty-state]');
        function match(card) {
            var keyword = normalize(search && search.value);
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-year'),
                card.getAttribute('data-type'),
                card.getAttribute('data-genre')
            ].join(' '));
            var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var okYear = !year || !year.value || card.getAttribute('data-year') === year.value;
            var okRegion = !region || !region.value || card.getAttribute('data-region') === region.value;
            var okType = !type || !type.value || card.getAttribute('data-type') === type.value;
            return okKeyword && okYear && okRegion && okType;
        }
        function apply() {
            var visible = 0;
            cards.forEach(function (card) {
                var show = match(card);
                card.hidden = !show;
                if (show) {
                    visible += 1;
                }
            });
            if (count) {
                count.textContent = '当前显示 ' + visible + ' 部影片';
            }
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }
        [search, year, region, type].forEach(function (input) {
            if (input) {
                input.addEventListener('input', apply);
                input.addEventListener('change', apply);
            }
        });
        if (reset) {
            reset.addEventListener('click', function () {
                if (search) {
                    search.value = '';
                }
                if (year) {
                    year.value = '';
                }
                if (region) {
                    region.value = '';
                }
                if (type) {
                    type.value = '';
                }
                apply();
            });
        }
        apply();
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initSiteSearch();
        initFilters();
    });
}());
