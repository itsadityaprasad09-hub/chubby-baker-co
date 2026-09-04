window.chubbyReveal = (function () {
  var io = null;
  function ensureObserver() {
    if (io || !('IntersectionObserver' in window)) return;
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  }
  function scan() {
    var els = document.querySelectorAll('.reveal:not(.reveal-bound)');
    if (!els.length) return;
    ensureObserver();
    els.forEach(function (el, i) {
      el.classList.add('reveal-bound');
      el.style.transitionDelay = (i % 6) * 70 + 'ms';
      if (io) io.observe(el);
      else el.classList.add('is-visible');
    });
  }
  document.addEventListener('DOMContentLoaded', scan);
  return { scan: scan };
})();
