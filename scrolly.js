// 1) Cache your DOM queries once
const steps = document.querySelectorAll('.step');
const bg     = document.getElementById('bg');

// 2) One observer to do both things:
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const step = entry.target;
    const section = step.closest('.section');

    if (entry.intersectionRatio >= 0.5) {
      // mark active/visible
      step.classList.add('is-visible');
      // swap bg if this section has changed
      const img = section.dataset.bg;
      if (bg.style.backgroundImage.indexOf(img) === -1) {
        bg.style.backgroundImage = `url('${img}')`;
      }
    } else {
      step.classList.remove('is-visible');
    }
  });
}, {
  threshold: 0.5
});

// 3) Observe them
steps.forEach(s => io.observe(s));

// 4) Set initial background from the first section
const firstSection = document.querySelector('.section');
if (firstSection) {
  bg.style.backgroundImage = `url('${firstSection.dataset.bg}')`;
}
