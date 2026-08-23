(function () {
  var toggle = document.getElementById('navToggle');
  var panel = document.getElementById('navPanel');
  var scrim = document.getElementById('navScrim');
  var closeBtn = document.getElementById('navClose');
  function openNav(){ panel.classList.add('open'); scrim.classList.add('open'); toggle.setAttribute('aria-expanded','true'); panel.setAttribute('aria-hidden','false'); }
  function closeNav(){ panel.classList.remove('open'); scrim.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); panel.setAttribute('aria-hidden','true'); }
  if (toggle) toggle.addEventListener('click', openNav);
  if (closeBtn) closeBtn.addEventListener('click', closeNav);
  if (scrim) scrim.addEventListener('click', closeNav);

  // scroll-reveal
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }
})();
