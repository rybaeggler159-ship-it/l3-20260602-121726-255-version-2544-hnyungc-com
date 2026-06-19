(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");

        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                mobileNav.classList.toggle("open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle("active", position === current);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle("active", position === current);
            });
        }

        function startHero() {
            if (!slides.length) {
                return;
            }
            clearInterval(timer);
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                startHero();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                startHero();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                startHero();
            });
        }

        showSlide(0);
        startHero();

        var params = new URLSearchParams(window.location.search);
        var keywordInput = document.querySelector("[data-filter-keyword]");
        var yearInput = document.querySelector("[data-filter-year]");
        var typeInput = document.querySelector("[data-filter-type]");
        var categoryInput = document.querySelector("[data-filter-category]");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

        if (keywordInput && params.get("q")) {
            keywordInput.value = params.get("q");
        }

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function applyFilters() {
            var keyword = normalize(keywordInput && keywordInput.value);
            var year = normalize(yearInput && yearInput.value);
            var type = normalize(typeInput && typeInput.value);
            var category = normalize(categoryInput && categoryInput.value);

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-category"),
                    card.textContent
                ].join(" "));
                var passKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var passYear = !year || normalize(card.getAttribute("data-year")).indexOf(year) !== -1;
                var passType = !type || normalize(card.getAttribute("data-type")) === type;
                var passCategory = !category || normalize(card.getAttribute("data-category")) === category;
                card.classList.toggle("hidden", !(passKeyword && passYear && passType && passCategory));
            });
        }

        [keywordInput, yearInput, typeInput, categoryInput].forEach(function (input) {
            if (!input) {
                return;
            }
            input.addEventListener("input", applyFilters);
            input.addEventListener("change", applyFilters);
        });

        applyFilters();
    });
})();
