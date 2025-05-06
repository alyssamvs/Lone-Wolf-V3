document.addEventListener('DOMContentLoaded', () => {
  const sections   = Array.from(document.querySelectorAll('.section'));
  const wrapper    = document.getElementById('bg-wrapper');
  const scroller   = document.getElementById('bg-scroller');

  // 1) Build one .bg-layer per section (in order)
  sections.forEach(sec => {
    const layer = document.createElement('div');
    layer.className = 'bg-layer';
    layer.style.backgroundImage = `url('${sec.dataset.bg}')`;
    scroller.appendChild(layer);
  });

  // 2) Observe every .step to fade it in
  const fadeIO = new IntersectionObserver((ents) => {
    ents.forEach(e => {
      e.target.classList.toggle('is-visible', e.intersectionRatio >= 0.5);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.step').forEach(s => fadeIO.observe(s));

  // 3) Observe each section’s *last* step to slide the bg-scroller
  const lastSteps = sections.map(sec => sec.querySelector('.step:last-child'));
  const slideIO = new IntersectionObserver((ents) => {
    ents.forEach(e => {
      const idx = lastSteps.indexOf(e.target);
      // when it scrolls *off* the top (not intersecting, and above 0)
      if (!e.isIntersecting && e.boundingClientRect.top < 0) {
        // clamp to [0..n-1]
        const slideTo = Math.min(idx+1, sections.length-1);
        scroller.style.transform = `translateY(${-slideTo * 100}vh)`;
      }
      // (optional) you could also handle scrolling back up here
    });
  }, { threshold: 0 });
  lastSteps.forEach(s => slideIO.observe(s));
});
