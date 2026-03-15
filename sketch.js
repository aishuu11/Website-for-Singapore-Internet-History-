/**
 * Reader's Guide (sketch.js)
 * Purpose: Main app logic — fetches JSON, compiles Handlebars templates, wires UI, and renders timeline/sections.
 * How to read: Top-level bootstrapping + helpers, then data loading, then render functions, finally event handlers.
 * Safety: Only comments were added; executable code remains unchanged.
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {

    // ===== Ensure all Handlebars helpers are registered BEFORE any compile =====
    if (window.Handlebars) {
      // {{inc @index}} → 1-based numbering
      Handlebars.registerHelper('inc', function (v) {
        return (parseInt(v, 10) || 0) + 1;
      });
      // {{side @index}} → "is-left"/"is-right" alternating rows
      Handlebars.registerHelper('side', function (i) {
        return (i % 2 === 0) ? 'is-left' : 'is-right';
      });
      // {{slice label -2}} → last 2 chars when needed
      Handlebars.registerHelper('slice', function (str, start) {
        str = String(str || '');
        return str.slice(start);
      });
      // {{#if (endsWith label "s")}} … {{/if}}
      Handlebars.registerHelper('endsWith', function (str, suffix) {
        str = String(str || '');
        suffix = String(suffix || '');
        return str.endsWith(suffix);
      });
    }

    /* =========================
       External Data (via JSON)
    ==========================*/
    // Holders filled after fetch
    var site = { evolution: [], highlights: [] };
    var BAR_DATA = null;

    var DATA_HOME = 'js/data/home.json';
    var DATA_EVOLUTION = 'js/data/evolution.json';
    var DATA_BARS = 'js/data/bars.json';

    // Kick off loading first; first render happens after data lands
    Promise.all([
      (window.JSONValidator
        ? JSONValidator.loadJSON(DATA_HOME, { highlights: [{ label: String, text: String }] })
        : fetch(DATA_HOME).then(function (r) { return r.json(); })),
      (window.JSONValidator
        ? JSONValidator.loadJSON(DATA_EVOLUTION, { items: [{ year: Number, text: String, fact: String }] })
        : fetch(DATA_EVOLUTION).then(function (r) { return r.json(); })),
      (window.JSONValidator
        ? JSONValidator.loadJSON(DATA_BARS, {
          households: { labels: [String], values: [Number], units: [String] },
          education: { labels: [String], values: [Number], units: [String] },
          business: { labels: [String], values: [Number], units: [String] },
          government: { labels: [String], values: [Number], units: [String] }
        })
        : fetch(DATA_BARS).then(function (r) { return r.json(); }))
    ]).then(function (_ref) {
      var home = _ref[0],
          evo = _ref[1],
          bars = _ref[2];

      site.highlights = (home && home.highlights) || [];
      site.evolution = (evo && evo.items) || [];
      BAR_DATA = bars || {};

      // initial renders (identical visuals)
      renderHomeTimeline();
      var initialYear = slider && slider.value ? Number(slider.value) : 2000;
      renderEvolution(initialYear);

      wireNavOnce();

      var start = 0;
      var m = (location.hash || '').match(/#p=(\d+)/);
      if (m) start = parseInt(m[1], 10) || 0;
      setPage(start, false);
    }).catch(function (err) {
      console.error('[data] Failed to load one or more JSON files:', err);
      // Graceful: page still navigates; sections simply won’t render until you fix JSON paths.
      wireNavOnce();
      setPage(0, false);
    });

    /* =========================
       Helpers
    ==========================*/

// Function: $ — what it does: see inline code; this comment is for readability only.
    function $(s, r) { return (r || document).querySelector(s); }

// Function: $all — what it does: see inline code; this comment is for readability only.
    function $all(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

    /* =========================
       Home timeline render
    ==========================*/

// Function: renderHomeTimeline — what it does: see inline code; this comment is for readability only.
    function renderHomeTimeline() {
      var root = document.querySelector('#homeTimeline, #highlights, .home-timeline');
      if (!root) return;

      // ensure wrapper exists
      var wrap = root.querySelector('.h-items');
      if (!wrap) {
        wrap = document.createElement('div');
        wrap.className = 'h-items';
        root.appendChild(wrap);
      }

      // Prefer Handlebars template for identical DOM/classes
      var tplEl = document.getElementById('tpl-home-highlight');
      var usedTemplate = false;
      if (window.Handlebars && tplEl) {
        try {
          var tpl = Handlebars.compile(tplEl.innerHTML);
          wrap.innerHTML = tpl({ highlights: site.highlights });
          usedTemplate = true;
        } catch (e) {
          console.warn('[home highlights] Handlebars failed; falling back:', e);
        }
      }
      if (!usedTemplate) {
        // Fallback to old string-builder (same structure)
        var palette = ['#FFC300', '#FF9800', '#FF5252', '#FF2FD0', '#8E44FF'];
        wrap.innerHTML = (site.highlights || []).map(function (e, i) {
          var color = palette[i % palette.length];
          var label = String(e.label || '');
          var dot = /s$/.test(label) ? label : label.slice(-2);
          return (
            '<div class="h-item" style="--tcolor:' + color + ';">' +
            '<div class="h-stem"></div>' +
            '<div class="h-dot">' + dot + '</div>' +
            '<div class="h-card">' +
            '<div class="h-year">' + label + '</div>' +
            '<div class="h-text">' + (e.text || '') + '</div>' +
            '</div>' +
            '</div>'
          );
        }).join('');
      }

      // If your CSS expects --tcolor and you used the template (which doesn’t set it),
      // re-apply palette here to avoid touching CSS:
      (function setDotColors() {
        var palette = ['#FFC300', '#FF9800', '#FF5252', '#FF2FD0', '#8E44FF'];
        wrap.querySelectorAll('.h-item').forEach(function (el, i) {
          el.style.setProperty('--tcolor', palette[i % palette.length]);
        });
      })();

      // animate in (stagger)
      Array.prototype.slice.call(wrap.querySelectorAll('.h-item')).forEach(function (el, idx) {
        el.classList.remove('is-visible');
        setTimeout(function () { el.classList.add('is-visible'); }, idx * 180);
      });
    }

    /* =========================
       Page 2: Evolution timeline
    ==========================*/

// Function: setupTimelineObserver — what it does: see inline code; this comment is for readability only.
    function setupTimelineObserver() {
      if (typeof window.IntersectionObserver !== 'function') {
        $all('#evolutionList .tl-item').forEach(function (el) { el.classList.add('is-visible'); });
        return;
      }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
        });
      }, { threshold: 0.18 });
      $all('#evolutionList .tl-item').forEach(function (el) { io.observe(el); });
    }

// Function: renderEvolution — what it does: see inline code; this comment is for readability only.

    function renderEvolution(yearCut) {
      yearCut = typeof yearCut === 'number' ? yearCut : 2000;
      var el = document.querySelector('#evolutionList');
      if (!el) return;

      var items = (site.evolution || [])
        .filter(function (e) { return e.year <= yearCut; })
        .sort(function (a, b) { return a.year - b.year; });

      if (!items.length) {
        el.innerHTML = '<div class="tl-item is-left is-visible" data-step="•">' +
          '<div class="tl-card"><div class="tl-year">—</div>' +
          '<div class="tl-text">Slide the year to see milestones</div>' +
          '<figure class="tl-photo" aria-hidden="true"></figure>' +
          '</div></div>';
        return;
      }

      // Prefer Handlebars for identical DOM/classes
      var tplEl = document.getElementById('tpl-evolution-item');
      if (window.Handlebars && tplEl) {
        try {
          var tpl = Handlebars.compile(tplEl.innerHTML);
          el.innerHTML = tpl({ items: items }); // left/right via helper
        } catch (e) {
          // fallback if compile fails for any reason
          el.innerHTML = items.map(function (e, i) {
            var side = (i % 2 === 0) ? 'is-left' : 'is-right';
            return (
              '<div class="tl-item ' + side + '" data-step="' + (i + 1) + '" data-year="' + e.year + '" id="year-' + e.year + '">' +
              '<div class="tl-card" tabindex="0">' +
              '<div class="tl-year">' + e.year + '</div>' +
              '<div class="tl-text">' + e.text + '</div>' +
              '<figure class="tl-photo" aria-hidden="true"></figure>' +
              (e.fact ? '<div class="tl-fact"><strong>FYI</strong> ' + e.fact + '</div>' : '') +
              '</div>' +
              '</div>'
            );
          }).join('');
        }
      } else {
        // fallback builder
        el.innerHTML = items.map(function (e, i) {
          var side = (i % 2 === 0) ? 'is-left' : 'is-right';
          return (
            '<div class="tl-item ' + side + '" data-step="' + (i + 1) + '" data-year="' + e.year + '" id="year-' + e.year + '">' +
            '<div class="tl-card" tabindex="0">' +
            '<div class="tl-year">' + e.year + '</div>' +
            '<div class="tl-text">' + e.text + '</div>' +
            '<figure class="tl-photo" aria-hidden="true"></figure>' +
            (e.fact ? '<div class="tl-fact"><strong>FYI</strong> ' + e.fact + '</div>' : '') +
            '</div>' +
            '</div>'
          );
        }).join('');
      }

      setupTimelineObserver();
    }

    // Page 2 title split + replay

// Function: prepareP2Title — what it does: see inline code; this comment is for readability only.
    function prepareP2Title() {
      var h = document.querySelector('.page[data-page="1"] #p1.p2-title');
      if (!h || h.dataset.ready === '1') return;
      var text = h.textContent;
      var frag = document.createDocumentFragment();
      for (var i = 0; i < text.length; i++) {
        var span = document.createElement('span');
        span.className = 'char';
        span.style.setProperty('--i', i);
        span.textContent = text[i];
        frag.appendChild(span);
      }
      h.textContent = '';
      h.appendChild(frag);
      h.dataset.ready = '1';
    }

// Function: playP2Title — what it does: see inline code; this comment is for readability only.
    function playP2Title() {
      var h = document.querySelector('.page[data-page="1"] #p1.p2-title');
      if (!h) return;
      h.classList.remove('is-in');
      requestAnimationFrame(function () { requestAnimationFrame(function () { h.classList.add('is-in'); }); });
    }

// Function: setupP2TitleScrollObserver — what it does: see inline code; this comment is for readability only.
    function setupP2TitleScrollObserver() {
      var titleEl = document.querySelector('.page[data-page="1"] #p1.p2-title');
      if (!titleEl || typeof window.IntersectionObserver !== 'function') return;
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { playP2Title(); }
        });
      }, { threshold: 0.3, rootMargin: '0px 0px -20% 0px' });
      observer.observe(titleEl);
    }

    /* =========================
       Page 3: Header + cards fly-in
    ==========================*/

// Function: setupP3HeaderAnim — what it does: see inline code; this comment is for readability only.
    function setupP3HeaderAnim() {
      var hdr = document.querySelector('.page[data-page="2"] .p3-fly');
      if (!hdr) return;
      hdr.classList.remove('is-in');
      if (typeof window.IntersectionObserver !== 'function') {
        hdr.classList.add('is-in');
        return;
      }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { hdr.classList.add('is-in'); }
          else { hdr.classList.remove('is-in'); }
        });
      }, { threshold: 0.6, rootMargin: '0px 0px -10% 0px' });
      io.observe(hdr);
    }

// Function: setupP3CardsAnim — what it does: see inline code; this comment is for readability only.

    function setupP3CardsAnim() {
      var page = document.querySelector('.page[data-page="2"]');
      if (!page) return;
      var cards = Array.prototype.slice.call(page.querySelectorAll('.p3-card'));
      if (!cards.length) return;
      cards.forEach(function (card, i) {
        card.style.setProperty('--p3d', (i * 100) + 'ms');
        card.classList.remove('is-in');
      });
      if (typeof window.IntersectionObserver !== 'function') {
        cards.forEach(function (c) { c.classList.add('is-in'); });
        return;
      }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { entry.target.classList.add('is-in'); }
          else { entry.target.classList.remove('is-in'); }
        });
      }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });
      cards.forEach(function (c) { io.observe(c); });
    }

    /* =========================
       Page 3: KPIs + Tabs + Bars
    ==========================*/

// Function: inView — what it does: see inline code; this comment is for readability only.
    function inView(el) {
      var r = el.getBoundingClientRect();
      return r.top < window.innerHeight * 0.9 && r.bottom > 0;
    }

// Function: countUpNumbers — what it does: see inline code; this comment is for readability only.

    function countUpNumbers(root) {
      $all('[data-countup]', root).forEach(function (el) {
        if (el.dataset.done === '1') return;
        if (!inView(el)) return;
        var target = Number(el.getAttribute('data-countup')) || 0;
        var start = 0;
        var isFloat = String(target).indexOf('.') >= 0;
        var duration = 900;
        var t0 = performance.now();

// Function: tick — what it does: see inline code; this comment is for readability only.
        function tick(t) {
          var p = Math.min(1, (t - t0) / duration);
          var val = start + (target - start) * p;
          el.textContent = isFloat ? val.toFixed(1) : Math.round(val);
          if (p < 1) requestAnimationFrame(tick); else el.dataset.done = '1';
        }
        requestAnimationFrame(tick);
      });
    }

// Function: renderBars — what it does: see inline code; this comment is for readability only.

    function renderBars(panel, key) {
      var cfg = BAR_DATA && BAR_DATA[key]; if (!cfg) return;
      var wrap = panel.querySelector('.viz-bars[data-bars="' + key + '"]'); if (!wrap) return;

      // Build static shells (same DOM/classes)
      var tplEl = document.getElementById('tpl-bars');
      if (window.Handlebars && tplEl) {
        try {
          var tpl = Handlebars.compile(tplEl.innerHTML);
          wrap.innerHTML = tpl(cfg);
        } catch (e) {
          wrap.innerHTML = '';
        }
      } else {
        wrap.innerHTML = cfg.labels.map(function (label, i) {
          var val = cfg.values[i];
          var unit = cfg.units[i] || '';
          return (
            '<div class="bar" tabindex="0">' +
            '<div class="bar-fill" style="height:0px" role="img" aria-label="' + label + ' ' + val + unit + '"></div>' +
            '<div class="bar-label">' + label + '<span class="bar-value">' + val + unit + '</span></div>' +
            '</div>'
          );
        }).join('');
      }

      var MAX_H = 160; // px

// Function: heightFor — what it does: see inline code; this comment is for readability only.

      function heightFor(label, value, unit) {
        unit = unit || '';
        if (unit === '%') return Math.max(8, Math.min(MAX_H, Math.round((value / 100) * MAX_H)));
        if (unit.indexOf('Mbps') !== -1) {
          var cap = 300; // treat ~300 Mbps as full height
          return Math.max(8, Math.min(MAX_H, Math.round((value / cap) * MAX_H)));
        }
        if (unit === 's') {
          // lower is better; 0.8s ~ full, 2.5s ~ low
          var worst = 2.5, best = 0.8;
          var clamped = Math.max(best, Math.min(worst, value));
          var norm = 1 - (clamped - best) / (worst - best);
          return Math.max(8, Math.round(norm * MAX_H));
        }
        // default (index-based)
        return Math.max(8, Math.min(MAX_H, Math.round((value / 100) * MAX_H)));
      }

      // Animate heights
      wrap.querySelectorAll('.bar').forEach(function (node, i) {
        var val = cfg.values[i];
        var unit = cfg.units[i] || '';
        var h = heightFor(cfg.labels[i], val, unit);
        var fill = node.querySelector('.bar-fill');
        requestAnimationFrame(function () { fill.style.height = h + 'px'; });
      });
    }

// Function: wireP3Tabs — what it does: see inline code; this comment is for readability only.

    function wireP3Tabs(root) {
      var tabs = $all('.a-tab', root);
      var panels = $all('.a-panel', root);

// Function: activate — what it does: see inline code; this comment is for readability only.

      function activate(id) {
        tabs.forEach(function (t) {
          var on = t.id === 'tab-' + id;
          t.classList.toggle('is-active', on);
          t.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        panels.forEach(function (p) {
          var on = p.id === 'a-' + id;
          p.classList.toggle('is-active', on);
          p.hidden = !on;
          if (on && !p.dataset.ready) {
            renderBars(p, id);
            p.dataset.ready = '1';
          }
        });
      }

      tabs.forEach(function (t) {
        t.addEventListener('click', function () { activate(t.id.replace('tab-', '')); });
        t.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(t.id.replace('tab-', '')); }
        });
      });

      activate('households'); // initial
    }

// Function: bootPage3 — what it does: see inline code; this comment is for readability only.

    function bootPage3() {
      var page = $('.page[data-page="2"]');
      if (!page) return;

// Function: onScroll — helper declared as a variable (no logic changed).
      var onScroll = function () { countUpNumbers(page); };
      document.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      onScroll();
      wireP3Tabs(page);
      setupP3HeaderAnim();
      setupP3CardsAnim();
      // refresh countup when the page becomes active via nav
      try {
        var obs = new MutationObserver(function () {
          if (!page.hidden) countUpNumbers(page);
        });
        obs.observe(page, { attributes: true, attributeFilter: ['hidden'] });
      } catch (_unused) { }
    }

    /* =========================
       Page 4: Stories + Chart + Future
    ==========================*/
    var page4Wired = false;

// Function: initPage4Once — what it does: see inline code; this comment is for readability only.
    function initPage4Once() {
      if (page4Wired) return;
      page4Wired = true;

      // Stories fly-in
      var page = document.querySelector('.page[data-page="3"]');
      if (page) {
        var boxes = $all('.p4-glass', page);
        boxes.forEach(function (el, i) {
          if (!el.hasAttribute('data-dir')) {
            el.setAttribute('data-dir', (i % 2 === 0 ? 'left' : 'right'));
          }
        });
        var io;
        try {
          io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) { entry.target.classList.add('is-in'); }
              else { entry.target.classList.remove('is-in'); }
            });
          }, { threshold: 0.25, rootMargin: '0px 0px -10% 0px' });
        } catch (_unused2) { io = null; }
        if (io) { boxes.forEach(function (b) { io.observe(b); }); }
        else { boxes.forEach(function (b) { b.classList.add('is-in'); }); }
      }

      // Simple bars for the Digital Transformation Progress widget
      var chartWrapper = document.getElementById('p4-chart');
      var btn2019 = document.getElementById('btn2019');
      var btn2025 = document.getElementById('btn2025');

      if (chartWrapper && btn2019 && btn2025) {
        var chartData = {
          categories: ['E-Payments', 'Digital ID', 'E-Government', 'Cloud/AI'],
          data2019: [60, 30, 40, 15],
          data2025: [95, 80, 85, 70]
        };
        var currentDataset = 'data2019';

// Function: renderChart — what it does: see inline code; this comment is for readability only.

        function renderChart() {
          var html = '<div class="chart-bars">';
          chartData.categories.forEach(function (category, i) {
            html += '<div class="chart-bar">' +
              '<div class="bar-fill" data-index="' + i + '">' +
              '<span class="bar-value"></span>' +
              '</div>' +
              '<div class="bar-label">' + category + '</div>' +
              '</div>';
          });
          html += '</div>';
          chartWrapper.innerHTML = html;
        }

// Function: updateBars — what it does: see inline code; this comment is for readability only.

        function updateBars(dataset) {
          var data = chartData[dataset];
          var bars = chartWrapper.querySelectorAll('.bar-fill');
          var values = chartWrapper.querySelectorAll('.bar-value');
          bars.forEach(function (bar, i) {
            var height = (data[i] / 100) * 160; // Max height 160px
            bar.style.height = height + 'px';
            values[i].textContent = data[i] + '%';
          });
        }

// Function: setActiveButton — what it does: see inline code; this comment is for readability only.

        function setActiveButton(activeBtn, inactiveBtn) {
          activeBtn.classList.add('active');
          inactiveBtn.classList.remove('active');
        }

        btn2019.addEventListener('click', function () {
          if (currentDataset === 'data2019') return;
          currentDataset = 'data2019';
          setActiveButton(btn2019, btn2025);
          updateBars('data2019');
        });

        btn2025.addEventListener('click', function () {
          if (currentDataset === 'data2025') return;
          currentDataset = 'data2025';
          setActiveButton(btn2025, btn2019);
          updateBars('data2025');
        });

        renderChart();
        setTimeout(function () { updateBars('data2019'); }, 100);
      }

      // FUTURE: KPI count-ups + horizon chart (real projections)
      var FUTURE_SERIES = {
        years: ['2024', '2025', '2026', '2027', '2028', '2029', '2030'],
        fiveGShare: [35, 45, 55, 62, 70, 75, 80],   // %
        dataGrowth: [28, 26, 24, 22, 20, 18, 18]    // % YoY
      };

// Function: futureCountUps — what it does: see inline code; this comment is for readability only.

      function futureCountUps() {
        var els = document.querySelectorAll('#future .ftr-num');
        if (!els.length) return;
        var io = new IntersectionObserver(function (entries, obs) {
          entries.forEach(function (e) {
            if (!e.isIntersecting) return;
            var el = e.target, target = +el.dataset.ftrCount || 0;
            var t0 = performance.now(), dur = 900;
            (function tick(t) {
              var p = Math.min(1, (t - t0) / dur);
              el.textContent = (target >= 100 ? Math.round(target * p) : Math.round(target * p * 10) / 10);
              if (p < 1) requestAnimationFrame(tick);
            })(t0);
            obs.unobserve(el);
          });
        }, { threshold: .35 });
        els.forEach(function (n) { io.observe(n); });
      }

// Function: renderFutureChart — what it does: see inline code; this comment is for readability only.

      function renderFutureChart() {
        var host = document.getElementById('futureChart');
        if (!host) return;

        // inline layout so we don't touch your CSS
        host.style.display = 'flex';
        host.style.alignItems = 'flex-end';
        host.style.gap = '28px';
        host.style.justifyContent = 'space-between';
        host.style.flexWrap = 'wrap';

        var MAX_H = 180;
        host.innerHTML = FUTURE_SERIES.years.map(function (y, i) {
          var fiveg = FUTURE_SERIES.fiveGShare[i];
          var growth = FUTURE_SERIES.dataGrowth[i];
          var h5g = Math.max(6, Math.round((fiveg / 100) * MAX_H));
          var hg = Math.max(6, Math.round((growth / 100) * MAX_H));

          return (
            '<div class="ftr-col" ' +
            'style="display:flex;flex-direction:column;align-items:center;min-width:72px;">' +
            '<div class="ftr-stack" ' +
            'style="display:flex;flex-direction:column;align-items:center;gap:10px;">' +
            '<div class="bar bar--5g" style="height:' + h5g + 'px"><span class="val">' + fiveg + '%</span></div>' +
            '<div class="bar bar--data" style="height:' + hg + 'px"><span class="val">' + growth + '%</span></div>' +
            '</div>' +
            '<div class="label" style="margin-top:8px;text-align:center;">' + y + '</div>' +
            '</div>'
          );
        }).join('');
      }

      futureCountUps();
      renderFutureChart();
    }

    /* =========================
       Navigation
    ==========================*/
    var pages = $all('.page');             // expects data-page="0..3"
    var tabs = $all('.tab');
    var backBtn = $('#backBtn');
    var nextBtn = $('#nextBtn');
    var homeBtn = $('#homeBtn');
    var pageIndex = 0;
    var cardsWired = false;
    var navWired = false;

// Function: wireHomeCardsOnce — what it does: see inline code; this comment is for readability only.

    function wireHomeCardsOnce() {
      if (cardsWired) return;
      var homeCards = document.querySelectorAll('.home-page .home-cards .home-card');
      homeCards.forEach(function (card) {

// Function: go — what it does: see inline code; this comment is for readability only.
        function go() {
          var to = parseInt(card.getAttribute('data-goto'), 10) || 0;
          setPage(to, true);
        }
        card.addEventListener('click', go);
        card.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
        });
      });
      cardsWired = true;
    }

// Function: setPage — what it does: see inline code; this comment is for readability only.

    function setPage(i, fromUser) {
      if (!pages.length) return;
      pageIndex = Math.max(0, Math.min(pages.length - 1, Number(i) || 0));

      pages.forEach(function (p, idx) { p.hidden = (idx !== pageIndex); });
      tabs.forEach(function (t, idx) {
        var isActive = (idx === pageIndex);
        t.setAttribute('aria-current', isActive ? 'page' : 'false');
        t.setAttribute('aria-selected', isActive ? 'true' : 'false');
        t.classList.toggle('is-active', isActive);
      });

      var mainEl = $('#main'); if (mainEl) mainEl.focus();
      wireHomeCardsOnce();

      // Page-specific hooks
      if (pageIndex === 1) {
        // Page 2
        prepareP2Title();
        playP2Title();
        setupP2TitleScrollObserver();
        setupTimelineObserver();
        var eraCards = document.querySelectorAll('.page[data-page="1"] .era');
        eraCards.forEach(function (card) { card.classList.remove('fly-in'); });
        setTimeout(function () { eraCards.forEach(function (card) { card.classList.add('fly-in'); }); }, 200);
      }

      if (pageIndex === 2) {
        // Page 3
        bootPage3();
      }

      if (pageIndex === 3) {
        // Page 4
        initPage4Once();
      }

      if (fromUser) {
        try { history.pushState({ pageIndex: pageIndex }, '', '#p=' + pageIndex); } catch (_unused3) { }
      }
    }

// Function: wireNavOnce — what it does: see inline code; this comment is for readability only.

    function wireNavOnce() {
      if (navWired) return;
      if (nextBtn) nextBtn.addEventListener('click', function () { setPage(pageIndex + 1, true); });
      if (backBtn) backBtn.addEventListener('click', function () { setPage(pageIndex - 1, true); });
      if (homeBtn) homeBtn.addEventListener('click', function () { setPage(0, true); });
      tabs.forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          var to = parseInt(e.currentTarget.getAttribute('data-goto'), 10) || 0;
          setPage(to, true);
          e.preventDefault();
        });
      });
      window.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') setPage(pageIndex + 1, true);
        if (e.key === 'ArrowLeft') setPage(pageIndex - 1, true);
      });
      window.addEventListener('popstate', function (e) {
        var idx = e.state && typeof e.state.pageIndex === 'number' ? e.state.pageIndex : pageIndex;
        setPage(idx, false);
      });
      navWired = true;
    }

    /* =========================
       Slider wiring (Page 2)
    ==========================*/
    var slider = $('#yearSlider');
    var yearOut = $('#yearOut');

// Function: setRangeFill — what it does: see inline code; this comment is for readability only.
    function setRangeFill(r) {
      if (!r) return;
      var min = r.min ? +r.min : 0;
      var max = r.max ? +r.max : 100;
      var val = +r.value;
      r.style.setProperty('--fill', ((val - min) / (max - min)) * 100 + '%');
    }
    if (slider) {
      setRangeFill(slider);
      slider.addEventListener('input', function (ev) {
        var y = Number(ev.target.value);
        if (yearOut) yearOut.textContent = String(y);
        setRangeFill(slider);
        renderEvolution(y);
      });
    }

    /* =========================
       Home KPIs count-up on view
    ==========================*/
    (function () {
      var nums = document.querySelectorAll('.home-kpis .kpi-num');
      if (!nums.length) return;
      var io = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var el = e.target, target = +el.dataset.countup || 0, t0 = performance.now(), dur = 900;
          (function tick(t) {
            var p = Math.min(1, (t - t0) / dur);
            el.textContent = Math.round(target * (0.15 + 0.85 * p));
            if (p < 1) requestAnimationFrame(tick);
          })(t0);
          obs.unobserve(el);
        });
      }, { threshold: .35 });
      nums.forEach(function (n) { io.observe(n); });
    })();

    /* =========================
       Home mini-bars animate width on view
    ==========================*/
    (function () {
      var bars = document.querySelectorAll('.mini-bars .bar');
      if (!bars.length) return;
      var io = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var pct = +e.target.dataset.pct || 0;
          var fill = e.target.querySelector('i');
          if (fill) fill.style.width = pct + '%';
          obs.unobserve(e.target);
        });
      }, { threshold: .35 });
      bars.forEach(function (b) { io.observe(b); });
    })();

    /* =========================
       Smooth scroll to the timeline from hero CTA
    ==========================*/
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a.hero-cta');
      if (!link) return;
      e.preventDefault();
      var target = document.querySelector('#homeTimeline');
      if (!target) return;
      var header = document.querySelector('.site-header');
      var offset = header ? header.offsetHeight : 0;
      var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });
      target.classList.add('pulse-once');
      setTimeout(function () { target.classList.remove('pulse-once'); }, 1200);
    });

    // (No Boot calls down here; initial render happens after JSON loads)
  });
})();