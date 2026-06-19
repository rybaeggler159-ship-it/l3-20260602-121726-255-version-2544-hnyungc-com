(function () {
  var navButton = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-main-nav]');

  if (navButton && nav) {
    navButton.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;

    var show = function (target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    };

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });

    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  var toolbars = document.querySelectorAll('[data-filter-toolbar]');
  toolbars.forEach(function (toolbar) {
    var input = toolbar.querySelector('[data-filter-input]');
    var year = toolbar.querySelector('[data-filter-year]');
    var type = toolbar.querySelector('[data-filter-type]');
    var list = document.querySelector('[data-filter-list]');

    if (!list) {
      return;
    }

    var items = Array.prototype.slice.call(list.children);
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q');

    if (initial && input) {
      input.value = initial;
    }

    var apply = function () {
      var q = input ? input.value.trim().toLowerCase() : '';
      var y = year ? year.value : '';
      var t = type ? type.value : '';

      items.forEach(function (item) {
        var text = [
          item.getAttribute('data-title'),
          item.getAttribute('data-region'),
          item.getAttribute('data-type'),
          item.getAttribute('data-year'),
          item.getAttribute('data-genre'),
          item.getAttribute('data-tags'),
          item.textContent
        ].join(' ').toLowerCase();
        var okText = !q || text.indexOf(q) !== -1;
        var okYear = !y || item.getAttribute('data-year') === y;
        var okType = !t || item.getAttribute('data-type') === t;
        item.classList.toggle('is-hidden', !(okText && okYear && okType));
      });
    };

    ['input', 'change'].forEach(function (eventName) {
      if (input) {
        input.addEventListener(eventName, apply);
      }
      if (year) {
        year.addEventListener(eventName, apply);
      }
      if (type) {
        type.addEventListener(eventName, apply);
      }
    });

    apply();
  });
})();
