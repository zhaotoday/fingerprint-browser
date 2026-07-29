/* 指纹浏览器资源合集 — search, scroll-spy, theme, reveal.
   Content is server-rendered; this file is pure progressive enhancement. */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------ star count */

  // The build bakes in a value; this keeps it fresh between deploys.
  var starEl = document.getElementById('star-count');
  if (starEl && 'fetch' in window) {
    fetch('https://api.github.com/repos/zhaotoday/fingerprint-browser')
      .then(function (response) {
        return response.ok ? response.json() : Promise.reject();
      })
      .then(function (data) {
        var n = data.stargazers_count;
        if (typeof n !== 'number') return;
        starEl.textContent = n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : n;
        starEl.hidden = false;
      })
      .catch(function () {});
  }

  /* ---------------------------------------------------------------- theme */

  var toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var dark = document.documentElement.dataset.theme === 'dark';
      if (dark) {
        delete document.documentElement.dataset.theme;
      } else {
        document.documentElement.dataset.theme = 'dark';
      }
      try {
        localStorage.setItem('fb-theme', dark ? 'light' : 'dark');
      } catch (e) {}
      toggle.setAttribute('aria-label', dark ? '切换深色模式' : '切换浅色模式');
    });
  }

  /* --------------------------------------------------------------- search */

  var input = document.getElementById('q');
  var clearBtn = document.getElementById('search-clear');
  var result = document.getElementById('result');
  var sections = Array.prototype.slice.call(document.querySelectorAll('.section'));
  var entries = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));

  function applyFilter(raw) {
    var term = raw.trim().toLowerCase();
    var matched = 0;

    entries.forEach(function (el) {
      var hit = !term || el.dataset.search.indexOf(term) !== -1;
      el.hidden = !hit;
      if (hit) matched++;
    });

    sections.forEach(function (section) {
      var visible = 0;
      var pendingHead = null;

      Array.prototype.forEach.call(section.children, function (child) {
        if (child.classList.contains('subhead')) {
          pendingHead = child;
          child.hidden = true;
          return;
        }
        if (!child.classList.contains('grid') && !child.classList.contains('rows')) return;

        var alive = Array.prototype.some.call(child.children, function (item) {
          return !item.hidden;
        });
        child.hidden = !alive;
        if (alive) {
          visible++;
          if (pendingHead) pendingHead.hidden = false;
        }
        pendingHead = null;
      });

      if (section.id === 'faq') return;
      var empty = section.querySelector('.empty');
      if (empty) empty.hidden = !term || visible > 0;
      section.hidden = Boolean(term) && visible === 0;
    });

    var faq = document.getElementById('faq');
    if (faq) faq.hidden = Boolean(term);
    document.body.classList.toggle('is-searching', Boolean(term));

    if (result) {
      result.hidden = !term;
      result.textContent = term
        ? '“' + raw.trim() + '” 匹配到 ' + matched + ' 条资源'
        : '';
    }
    if (clearBtn) clearBtn.hidden = !term;

    try {
      var url = new URL(window.location.href);
      if (term) url.searchParams.set('q', raw.trim());
      else url.searchParams.delete('q');
      window.history.replaceState(null, '', url);
    } catch (e) {}
  }

  if (input) {
    var timer;
    input.addEventListener('input', function () {
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        applyFilter(input.value);
      }, 120);
    });

    input.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        input.value = '';
        applyFilter('');
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== '/' || event.metaKey || event.ctrlKey) return;
      var tag = document.activeElement && document.activeElement.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      event.preventDefault();
      input.focus();
    });

    var initial = new URLSearchParams(window.location.search).get('q');
    if (initial) {
      input.value = initial;
      applyFilter(initial);
    }
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      input.value = '';
      applyFilter('');
      input.focus();
    });
  }

  document.querySelectorAll('.tag').forEach(function (tag) {
    tag.addEventListener('click', function () {
      input.value = tag.dataset.q;
      applyFilter(tag.dataset.q);
      input.focus();
    });
  });

  /* ------------------------------------------------------- expandable card */

  document.querySelectorAll('.card__more').forEach(function (button) {
    button.addEventListener('click', function () {
      var card = button.closest('.card');
      var open = card.classList.toggle('is-open');
      button.setAttribute('aria-expanded', String(open));
      button.firstChild.textContent = open ? '收起介绍' : '展开完整介绍';
    });
  });

  /* ------------------------------------------------------------ scroll spy */

  var tocLinks = Array.prototype.slice.call(document.querySelectorAll('[data-toc]'));
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(
      function (records) {
        records.forEach(function (record) {
          if (!record.isIntersecting) return;
          tocLinks.forEach(function (link) {
            var active = link.dataset.toc === record.target.id;
            link.classList.toggle('is-active', active);
            // Keep the active chip reachable in the horizontally scrolling bar.
            if (active && link.parentElement.classList.contains('catbar__inner')) {
              var bar = link.parentElement;
              var left = link.offsetLeft - (bar.clientWidth - link.offsetWidth) / 2;
              bar.scrollTo({ left: left, behavior: reduceMotion ? 'auto' : 'smooth' });
            }
          });
        });
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    );
    sections.forEach(function (section) {
      if (section.id !== 'faq') spy.observe(section);
    });
  }

  /* ----------------------------------------------------- header + to-top */

  var header = document.querySelector('.header');
  var toTop = document.getElementById('to-top');

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  var sentinel = document.createElement('div');
  sentinel.setAttribute('aria-hidden', 'true');
  sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none';
  document.body.prepend(sentinel);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (records) {
      var atTop = records[0].isIntersecting;
      if (header) header.classList.toggle('is-stuck', !atTop);
      if (toTop) toTop.hidden = atTop;
    }).observe(sentinel);
  }
})();
