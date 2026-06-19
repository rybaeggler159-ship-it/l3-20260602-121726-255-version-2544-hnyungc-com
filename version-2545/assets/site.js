(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.main-nav');

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var activeIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeIndex);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      showSlide(dotIndex);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  var searchForms = document.querySelectorAll('[data-search-form]');

  searchForms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : '';

      if (!value) {
        event.preventDefault();
        return;
      }
    });
  });

  var filterInput = document.querySelector('[data-local-search]');
  var resultItems = Array.prototype.slice.call(document.querySelectorAll('[data-search-item]'));
  var countNode = document.querySelector('[data-search-count]');

  function updateSearch() {
    if (!filterInput || !resultItems.length) {
      return;
    }

    var query = filterInput.value.trim().toLowerCase();
    var shown = 0;

    resultItems.forEach(function (item) {
      var text = item.getAttribute('data-search-text') || '';
      var match = !query || text.toLowerCase().indexOf(query) !== -1;
      item.style.display = match ? '' : 'none';
      if (match) {
        shown += 1;
      }
    });

    if (countNode) {
      countNode.textContent = String(shown);
    }
  }

  if (filterInput) {
    var params = new URLSearchParams(window.location.search);
    var keyword = params.get('q');

    if (keyword) {
      filterInput.value = keyword;
    }

    filterInput.addEventListener('input', updateSearch);
    updateSearch();
  }
})();
