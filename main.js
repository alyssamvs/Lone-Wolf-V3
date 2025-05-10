

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

// Creating and positioning

// Simple headline functionality
document.addEventListener('DOMContentLoaded', function() {
  
  // Configuration
  const numberOfHeadlines = 19; // How many headlines to show
  const headlinesContainer = document.querySelector('.headlines-container');
  const section2 = document.querySelectorAll('.section')[1];
  const secondCaption = section2.querySelectorAll('.caption')[1];
  
  // Create headlines
  for (let i = 1; i <= numberOfHeadlines; i++) {
    // Create a headline element
    const headline = document.createElement('div');
    headline.classList.add('headline');
    
    // Position randomly
    const top = Math.random() * 80; // % from top 
    const left = Math.random() * 80; // % from left
    
    headline.style.top = `${top}%`;
    headline.style.left = `${left}%`;
    
    // Set the background image 
    headline.style.backgroundImage = `url('headlines/headline${i}.png')`;
    
    // Add to container
    headlinesContainer.appendChild(headline);
  }
  
  // Get all created headlines (selects everything)
  const headlines = document.querySelectorAll('.headline');
  
 
 
  // Headlines Appearing

  // // Scroll handler to show/hide headlines
  // window.addEventListener('scroll', function() {
  //   // Check if second caption is in view
  //   const secondCaptionRect = secondCaption.getBoundingClientRect();
  //   const isCaptionVisible = (
  //     secondCaptionRect.top < window.innerHeight && 
  //     secondCaptionRect.bottom > 0
  //   );


// Scroll handler to show/hide headlines
window.addEventListener('scroll', function() {
  // Check if second caption is in the middle of the screen
  const secondCaptionRect = secondCaption.getBoundingClientRect();
  
  // Calculate the middle of the viewport
  const viewportMiddle = window.innerHeight / 2;
  
  // Check if the caption is near the middle of the screen
  // We can use the top and bottom of the caption to calculate its center
  const captionCenter = (secondCaptionRect.top + secondCaptionRect.bottom) / 2;
  
  // Check if the caption's center is close to the viewport middle
  // You can adjust the 100 value to make the trigger area larger or smaller
  const isCaptionInMiddle = Math.abs(captionCenter - viewportMiddle) < 100;
  
  // Check if we've scrolled past section 2
  const section2Bottom = section2.getBoundingClientRect().bottom;
  const isPastSection2 = section2Bottom < 0;
  
  // Show headlines when caption is in the middle and we haven't scrolled past section 2
  if (isCaptionInMiddle && !isPastSection2) {
    headlines.forEach((headline, index) => {
      setTimeout(() => {
        headline.style.opacity = '1';
      }, index * 100); // Staggered appearance
    });
  } 
  // Hide headlines otherwise
  else {
    headlines.forEach((headline, index) => {
      setTimeout(() => {
        headline.style.opacity = '0';
      }, index * 50); // Staggered disappearance
    });
  }
});
    
//     // Check if we've scrolled past section 2
//     const section2Bottom = section2.getBoundingClientRect().bottom;
//     const isPastSection2 = section2Bottom < 0;
    
//     // Show headlines when second caption is visible
//     if (isCaptionVisible && !isPastSection2) {
//       headlines.forEach((headline, index) => {
//         setTimeout(() => {
//           headline.style.opacity = '1';
//         }, index * 100); // Staggered appearance
//       });
//     } 
//     // Hide headlines when not in section 2
//     else {
//       headlines.forEach((headline, index) => {
//         setTimeout(() => {
//           headline.style.opacity = '0';
//         }, index * 50); // Staggered disappearance
//       });
//     }
//   });
});



