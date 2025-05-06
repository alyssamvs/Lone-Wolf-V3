document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const scroller = document.getElementById('bg-scroller');
  const sections = document.querySelectorAll('.section');
  const steps = document.querySelectorAll('.step');
  
  // Create background layers
  sections.forEach(section => {
    const layer = document.createElement('div');
    layer.className = 'bg-layer';
    layer.style.backgroundImage = `url('${section.dataset.bg}')`;
    scroller.appendChild(layer);
  });
  
  // Set up smooth scrolling with Intersection Observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // Make the step visible when it enters viewport
      entry.target.classList.toggle('is-visible', entry.isIntersecting);
      
      if (entry.isIntersecting) {
        // Find which section this step belongs to
        const section = entry.target.closest('.section');
        const sectionIndex = Array.from(sections).indexOf(section);
        
        // Move background to correct position
        scroller.style.transform = `translateY(-${sectionIndex * 100}vh)`;
      }
    });
  }, { threshold: 0.5 });
  
  // Observe all steps
  steps.forEach(step => observer.observe(step));
});