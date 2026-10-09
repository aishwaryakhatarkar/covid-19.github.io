(function () {
  'use strict';
  var d = document, root = d.documentElement;
  root.classList.add('js');

  /* ---------- scroll reveal ---------- */
  var items = [].slice.call(d.querySelectorAll('.reveal'));
  items.forEach(function (el) {
    var delay = el.getAttribute('data-delay');
    if (delay) el.style.setProperty('--d', delay + 'ms');
  });

  function show(el) {
    el.classList.add('in');
    // after the animation, drop the delay so hover effects are instant
    setTimeout(function () { el.style.setProperty('--d', '0ms'); }, 1800);
    el.querySelectorAll('.counter').forEach(count);
    if (el.classList.contains('counter')) count(el);
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(show);
  }

  /* ---------- number counters ---------- */
  function count(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    var target = parseInt(el.getAttribute('data-count'), 10);
    var loc = el.getAttribute('data-locale') || 'en-US';
    if (isNaN(target) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var dur = 1800, start = null;
    function step(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString(loc);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- progress bar, navbar, back-to-top ---------- */
  var bar = d.getElementById('scrollProgress');
  var nav = d.getElementById('mainNav');
  var top = d.getElementById('toTop');
  var ticking = false;
  function onScroll() {
    var y = window.pageYOffset || root.scrollTop;
    var h = root.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    if (nav) nav.classList.toggle('scrolled', y > 40);
    if (top) top.classList.toggle('show', y > 500);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();
  if (top) top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* ---------- active nav link ---------- */
  var links = [].slice.call(d.querySelectorAll('.nav-link[href^="#"]'));
  var map = links.map(function (a) { return { a: a, s: d.querySelector(a.getAttribute('href')) }; })
                 .filter(function (m) { return m.s; });
  if ('IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          map.forEach(function (m) { m.a.classList.toggle('active', m.s === e.target); });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    map.forEach(function (m) { so.observe(m.s); });
  }

  /* close mobile menu after tapping a link */
  links.forEach(function (a) {
    a.addEventListener('click', function () {
      var c = d.getElementById('navbarSupportedContent');
      if (c && c.classList.contains('show') && window.jQuery) window.jQuery(c).collapse('hide');
    });
  });
})();


document.addEventListener("DOMContentLoaded", () => {

    const API_URL = "https://disease.sh/v3/covid-19/all";

    const elements = {
        cases: document.getElementById("cases"),
        deaths: document.getElementById("deaths"),
        recovered: document.getElementById("recovered"),
        active: document.getElementById("active")
    };

    const status = document.getElementById("covidStatus");

    const formatNumber = number =>
        Number(number).toLocaleString("en-US");

    function animateCounter(element, target) {

        const start = Number(
            element.dataset.current || 0
        );

        const duration = 1500;
        const startTime = performance.now();

        function update(now) {

            const progress = Math.min(
                (now - startTime) / duration, 1
            );

            const eased = 1 - Math.pow(1 - progress, 3);

            const value = Math.round(
                start + (target - start) * eased
            );

            element.textContent = formatNumber(value);

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.dataset.current = target;
            }
        }

        requestAnimationFrame(update);
    }

    async function loadCovidData() {

        try {
            status.textContent = "Updating data...";

            const response = await fetch(API_URL, {
                cache: "no-store"
            });

            if (!response.ok) {
                throw new Error("API request failed");
            }

            const data = await response.json();

            const values = {
                cases: data.cases,
                deaths: data.deaths,
                recovered: data.recovered,
                active: data.active
            };

            for (const key in values) {
                if (
                    Number.isFinite(values[key]) &&
                    elements[key]
                ) {
                    animateCounter(elements[key], values[key]);
                }
            }

            const updated = data.updated
                ? new Date(data.updated).toLocaleString()
                : "Not available";

            status.textContent =
                "Last source update: " + updated;

        } catch (error) {
            console.error("COVID API error:", error);

            status.textContent =
                "Live data unavailable. Please try again later.";
        }
    }

    loadCovidData();

   
    setInterval(loadCovidData, 10 * 60 * 1000);

});