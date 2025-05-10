

//---------------------------
//---------------------------
//-----PROGRESS BAR----------
//---------------------------
//---------------------------


// Progress bar functionality
window.addEventListener('scroll', function() {
  // Calculate how far down the page the user has scrolled
  const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  
  // Calculate the total scrollable height (total height minus viewport height)
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  
  // Calculate the scrolled percentage
  const scrolled = (winScroll / height) * 100;
  
  // Update the width of the progress bar
  document.getElementById("myProgressBar").style.width = scrolled + "%";
});



//---------------------------
//---------------------------
//-----HEADLINES----------
//---------------------------
//--------------------------- 
 
// document.addEventListener('DOMContentLoaded', function() {
//   // Configuration
//   const numberOfHeadlines = 19;
//   const headlinesContainer = document.querySelector('.headlines-container');
//   const section2 = document.querySelectorAll('.section')[1];
//   const secondCaption = section2.querySelectorAll('.caption')[1];
  
//   // Array to track placed headlines for collision detection
//   const placedHeadlines = [];
  
//   // Function to check if a position overlaps with existing headlines
//   function checkOverlap(x, y, width, height) {
//     // Add some margin between headlines
//     const margin = 20;
    
//     for (const placed of placedHeadlines) {
//       // Check if rectangles overlap
//       if (
//         x < placed.x + placed.width + margin &&
//         x + width + margin > placed.x &&
//         y < placed.y + placed.height + margin &&
//         y + height + margin > placed.y
//       ) {
//         return true; // Overlap detected
//       }
//     }
//     return false; // No overlap
//   }
  
//   // Create headlines
//   for (let i = 1; i <= numberOfHeadlines; i++) {
//     const headline = document.createElement('div');
//     headline.classList.add('headline');
    
//     // Set headline dimensions
//     const width = 300;
//     const height = 100;
    
//     // Try to find a non-overlapping position (max 50 attempts)
//     let positionFound = false;
//     let attempts = 0;
//     let top, left;
    
//     while (!positionFound && attempts < 50) {
//       // Generate random position
//       top = 10 + Math.random() * 70; // % from top
//       left = Math.random() * 80; // % from left
      
//       // Convert percentage to pixels for collision detection
//       const xPos = (left / 100) * window.innerWidth;
//       const yPos = (top / 100) * window.innerHeight;
      
//       // Check if this position overlaps with existing headlines
//       if (!checkOverlap(xPos, yPos, width, height)) {
//         positionFound = true;
        
//         // Remember this position for future collision checks
//         placedHeadlines.push({
//           x: xPos,
//           y: yPos,
//           width: width,
//           height: height
//         });
//       }
      
//       attempts++;
//     }
    
//     // Set position
//     headline.style.top = `${top}%`;
//     headline.style.left = `${left}%`;
//     headline.style.width = `${width}px`;
//     headline.style.height = `${height}px`;
    
//     headline.style.backgroundImage = `url('headlines/headline${i}.png')`;
//     headlinesContainer.appendChild(headline);
//   }







    
//     // Get all headlines
//     const headlines = document.querySelectorAll('.headline');
    
//     // Scroll handler to show/hide headlines
//     window.addEventListener('scroll', function() {
//       // Check if second caption is in the middle of the screen
//       const secondCaptionRect = secondCaption.getBoundingClientRect();
//       const viewportMiddle = window.innerHeight / 2;
//       const captionCenter = (secondCaptionRect.top + secondCaptionRect.bottom) / 2;
//       const isCaptionInMiddle = Math.abs(captionCenter - viewportMiddle) < 150; // Adjust this value as needed
      
//       // Check if we've scrolled past section 2
//       const section2Bottom = section2.getBoundingClientRect().bottom;
//       const isPastSection2 = section2Bottom < 0;
      
//       // Show headlines when caption is in the middle and we haven't scrolled past section 2
//       if (isCaptionInMiddle && !isPastSection2) {
//         headlines.forEach((headline, index) => {
//           setTimeout(() => {
//             headline.style.opacity = '1';
//           }, index * 300); // Staggered appearance
//         });
//       } 
//       // Hide headlines otherwise
//       else {
//         headlines.forEach((headline, index) => {
//           setTimeout(() => {
//             headline.style.opacity = '0';
//           }, index * 150); // Staggered disappearance
//         });
//       }
//     });
//   });




document.addEventListener('DOMContentLoaded', function() {
  // Configuration
  const numberOfHeadlines = 15;
  const headlinesContainer = document.querySelector('.headlines-container');
  const section2 = document.querySelectorAll('.section')[1];
  const secondCaption = section2.querySelectorAll('.caption')[1];
  
  // Track animation state
  let headlinesVisible = false;
  let animationInProgress = false;
  
  // Array to track placed headlines for collision detection
  const placedHeadlines = [];
  
  // Function to check if a position overlaps with existing headlines
  function checkOverlap(x, y, width, height) {
    const margin = 20;
    
    for (const placed of placedHeadlines) {
      if (
        x < placed.x + placed.width + margin &&
        x + width + margin > placed.x &&
        y < placed.y + placed.height + margin &&
        y + height + margin > placed.y
      ) {
        return true;
      }
    }
    return false;
  }
  
  // Create headlines
  for (let i = 1; i <= numberOfHeadlines; i++) {
    const headline = document.createElement('div');
    headline.classList.add('headline');
    
    const width = 300;
    const height = 100;
    
    let positionFound = false;
    let attempts = 0;
    let top, left;
    
    while (!positionFound && attempts < 50) {
      top = 10 + Math.random() * 70;
      left = Math.random() * 80;
      
      const xPos = (left / 100) * window.innerWidth;
      const yPos = (top / 100) * window.innerHeight;
      
      if (!checkOverlap(xPos, yPos, width, height)) {
        positionFound = true;
        
        placedHeadlines.push({
          x: xPos,
          y: yPos,
          width: width,
          height: height
        });
      }
      
      attempts++;
    }
    
    headline.style.top = `${top}%`;
    headline.style.left = `${left}%`;
    headline.style.width = `${width}px`;
    headline.style.height = `${height}px`;
    
    headline.style.backgroundImage = `url('headlines/headline${i}.png')`;
    headlinesContainer.appendChild(headline);
  }
  
  // Get all headlines
  const headlines = Array.from(document.querySelectorAll('.headline'));
  
  // Shuffle the headlines array
  for (let i = headlines.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [headlines[i], headlines[j]] = [headlines[j], headlines[i]];
  }
  
  // Debounce function to prevent rapid firing
  function debounce(func, wait) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }
  
  // Function to show headlines with staggered timing
  function showHeadlines() {
    if (headlinesVisible || animationInProgress) return;
    
    animationInProgress = true;
    
    headlines.forEach((headline, index) => {
      setTimeout(() => {
        headline.style.opacity = '1';
        
        // When last headline is shown, update state
        if (index === headlines.length - 1) {
          headlinesVisible = true;
          animationInProgress = false;
        }
      }, index * 300);
    });
  }
  
  // Function to hide headlines with staggered timing
  function hideHeadlines() {
    if (!headlinesVisible || animationInProgress) return;
    
    animationInProgress = true;
    
    headlines.forEach((headline, index) => {
      setTimeout(() => {
        headline.style.opacity = '0';
        
        // When last headline is hidden, update state
        if (index === headlines.length - 1) {
          headlinesVisible = false;
          animationInProgress = false;
        }
      }, index * 150);
    });
  }
  
  // Scroll handler with debounce
  const handleScroll = debounce(function() {
    // Check if second caption is in the middle of the screen
    const secondCaptionRect = secondCaption.getBoundingClientRect();
    const viewportMiddle = window.innerHeight / 2;
    const captionCenter = (secondCaptionRect.top + secondCaptionRect.bottom) / 2;
    
    // Add a larger buffer zone to reduce flickering during small scroll movements
    const isCaptionNearMiddle = Math.abs(captionCenter - viewportMiddle) < 200;
    
    // Check if we've scrolled past section 2
    const section2Bottom = section2.getBoundingClientRect().bottom;
    const isPastSection2 = section2Bottom < 0;
    
    // Clear decision to show or hide
    if (isCaptionNearMiddle && !isPastSection2) {
      showHeadlines();
    } else {
      hideHeadlines();
    }
  }, 100); // 100ms debounce
  
  // Attach debounced scroll handler
  window.addEventListener('scroll', handleScroll);
  
  // Initial check in case the page loads with the caption already in position
  handleScroll();
});


