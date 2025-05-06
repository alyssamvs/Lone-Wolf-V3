document.addEventListener('DOMContentLoaded', () => {
  const sections = Array.from(document.querySelectorAll('.section'));
  const wrapper = document.getElementById('bg-wrapper');
  const scroller = document.getElementById('bg-scroller');
  const steps = document.querySelectorAll('.step');
  
  // Track current section and progress
  let currentSectionIndex = 0;
  let scrollProgress = 0;

  // 1) Build background layers (one per section)
  sections.forEach(sec => {
    const layer = document.createElement('div');
    layer.className = 'bg-layer';
    layer.style.backgroundImage = `url('${sec.dataset.bg}')`;
    scroller.appendChild(layer);
  });

  // 2) Set up smooth scrolling for captions
  const stepIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // Get the step's index relative to all steps
      const allSteps = Array.from(steps);
      const stepIndex = allSteps.indexOf(entry.target);
      
      // Calculate visibility percentage (0 to 1)
      const ratio = Math.max(0, Math.min(1, entry.intersectionRatio));
      
      // Apply transforms based on scroll position
      if (entry.isIntersecting) {
        // Make step visible with smooth entrance
        entry.target.classList.add('is-visible');
        
        // Apply a parallax effect based on intersection ratio
        const translateY = (1 - ratio) * 30; // px to move
        entry.target.style.transform = `translateY(${translateY}px)`;
        entry.target.style.opacity = ratio;
        
        // Find which section this step belongs to
        let sectionIndex = 0;
        sections.forEach((section, idx) => {
          if (section.contains(entry.target)) {
            sectionIndex = idx;
          }
        });
        
        // Update current section and progress
        if (ratio > 0.5) {
          currentSectionIndex = sectionIndex;
          
          // Find progress within the section (which step in the section)
          const sectionSteps = Array.from(sections[sectionIndex].querySelectorAll('.step'));
          const stepInSectionIndex = sectionSteps.indexOf(entry.target);
          const totalStepsInSection = sectionSteps.length;
          
          // Calculate progress percentage through the section
          scrollProgress = stepInSectionIndex / totalStepsInSection;
          
          // Apply smooth background transition
          const translateAmount = -(sectionIndex + scrollProgress * 0.5) * 100;
          scroller.style.transform = `translateY(${translateAmount}vh)`;
        }
      } else {
        // Remove visible class when completely out of view
        if (ratio === 0) {
          entry.target.classList.remove('is-visible');
        }
      }
    });
  }, { 
    threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] 
  });
  
  // Observe all steps
  steps.forEach(step => stepIO.observe(step));

  // 3) Add scroll-driven animations
  window.addEventListener('scroll', () => {
    // Calculate overall scroll progress
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const overallProgress = scrollTop / scrollHeight;
    
    // Optional: Apply subtle parallax to non-current bg images
    document.querySelectorAll('.bg-layer').forEach((layer, idx) => {
      if (idx !== currentSectionIndex) {
        const parallaxShift = (idx - currentSectionIndex) * 10 * overallProgress;
        layer.style.transform = `translateY(${parallaxShift}px)`;
      }
    });
  });
});