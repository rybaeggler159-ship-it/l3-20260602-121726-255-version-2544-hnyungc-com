(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');
    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeSlide);
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5000);
    }

    function prepareVideo(player) {
        var video = player.querySelector('[data-video]');
        if (!video) {
            return null;
        }
        var stream = video.getAttribute('data-stream');
        if (!stream) {
            return video;
        }
        if (video.getAttribute('data-ready') === '1') {
            return video;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true });
            hls.loadSource(stream);
            hls.attachMedia(video);
            video._hls = hls;
        } else {
            video.src = stream;
        }
        video.controls = true;
        video.setAttribute('data-ready', '1');
        return video;
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
        var trigger = player.querySelector('[data-play-trigger]');
        if (!trigger) {
            return;
        }
        trigger.addEventListener('click', function () {
            var video = prepareVideo(player);
            trigger.classList.add('is-hidden');
            if (video) {
                var playTask = video.play();
                if (playTask && typeof playTask.catch === 'function') {
                    playTask.catch(function () {
                        trigger.classList.remove('is-hidden');
                    });
                }
            }
        });
    });

    var searchLayer = document.querySelector('[data-search-layer]');
    var searchInput = document.querySelector('[data-search-input]');
    var searchResults = document.querySelector('[data-search-results]');
    var searchOpenButtons = Array.prototype.slice.call(document.querySelectorAll('[data-search-open]'));
    var searchClose = document.querySelector('[data-search-close]');

    function openSearch() {
        if (!searchLayer) {
            return;
        }
        searchLayer.classList.add('is-open');
        document.body.classList.add('searching');
        if (searchInput) {
            searchInput.focus();
        }
        renderSearch('');
    }

    function closeSearch() {
        if (!searchLayer) {
            return;
        }
        searchLayer.classList.remove('is-open');
        document.body.classList.remove('searching');
    }

    function itemUrl(item) {
        var inSubFolder = location.pathname.indexOf('/video/') !== -1 || location.pathname.indexOf('/category/') !== -1;
        return (inSubFolder ? '../' : '') + item.url;
    }

    function coverUrl(item) {
        var inSubFolder = location.pathname.indexOf('/video/') !== -1 || location.pathname.indexOf('/category/') !== -1;
        return (inSubFolder ? '../' : './') + item.cover;
    }

    function renderSearch(keyword) {
        if (!searchResults || !window.SEARCH_ITEMS) {
            return;
        }
        var key = (keyword || '').trim().toLowerCase();
        var items = window.SEARCH_ITEMS.filter(function (item) {
            if (!key) {
                return true;
            }
            return item.text.indexOf(key) !== -1;
        }).slice(0, 24);

        searchResults.innerHTML = items.map(function (item) {
            return '<a class="search-result" href="' + itemUrl(item) + '">' +
                '<img src="' + coverUrl(item) + '" alt="' + item.title.replace(/"/g, '&quot;') + '">' +
                '<div><h3>' + item.title + '</h3><p>' + item.year + ' · ' + item.region + ' · ' + item.genre + '</p></div>' +
                '</a>';
        }).join('');
    }

    searchOpenButtons.forEach(function (button) {
        button.addEventListener('click', openSearch);
    });

    if (searchClose) {
        searchClose.addEventListener('click', closeSearch);
    }

    if (searchLayer) {
        searchLayer.addEventListener('click', function (event) {
            if (event.target === searchLayer) {
                closeSearch();
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            renderSearch(searchInput.value);
        });
    }

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            closeSearch();
        }
    });
}());
