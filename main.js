document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('.section');
    const captions = document.querySelectorAll('.caption');
    const bgImages = document.querySelectorAll('.bg-image');
    
    // Set initial opacity of captions
    captions.forEach(caption => {
      caption.style.opacity = 0;
    });
    
    // Function to handle scroll
    function handleScroll() {
      // Get current scroll position
      const scrollPosition = window.scrollY;
      
      // Handle each section
      sections.forEach((section, index) => {
        // Get section position relative to viewport
        const rect = section.getBoundingClientRect();
        
        // Calculate how far the section is in the viewport (0 to 1)
        // 0 = just entered, 0.5 = middle of viewport, 1 = about to exit
        const sectionProgress = 1 - (rect.top / window.innerHeight);
        
        // If section is in view
        if (sectionProgress > 0 && sectionProgress < 1) {
          // Show caption with opacity based on position
          const caption = section.querySelector('.caption');
          
          // Fade in as it enters, fade out as it leaves
          let opacity = 0;
          if (sectionProgress < 0.2) {
            // Fade in
            opacity = sectionProgress * 5; // 0 to 1 in first 20%
          } else if (sectionProgress > 0.8) {
            // Fade out
            opacity = (1 - sectionProgress) * 5; // 1 to 0 in last 20%
          } else {
            // Stay fully visible in middle
            opacity = 1;
          }
          
          caption.style.opacity = opacity;
          
          // Apply parallax effect to background image
          const bgImage = section.querySelector('.bg-image');
          
          // Move background slower than scroll rate (30% speed)
          const yOffset = scrollPosition * 0.3;
          
          // Apply transform to create parallax
          bgImage.style.transform = `scale(1.1) translateY(-${yOffset}px)`;
        }
      });
    }
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Initial check
    handleScroll();
  });