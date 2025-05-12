

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
 
document.addEventListener('DOMContentLoaded', function() {
  // Configuration
  const numberOfHeadlines = 19;
  const headlinesContainer = document.querySelector('.headlines-container');
  const section2 = document.querySelectorAll('.section')[1];
  const secondCaption = section2.querySelectorAll('.caption')[1];
  
  // Track animation state
  let headlinesVisible = false;
  let animationInProgress = false;
  
  // Detect if we're on mobile
  const isMobile = window.innerWidth < 768;
  
  // Logging for debugging
  console.log(`Screen dimensions: ${window.innerWidth}x${window.innerHeight}, Mobile: ${isMobile}`);
  
  // Headline dimensions
  const headlineWidth = isMobile ? 250 : 350;
  const headlineHeight = isMobile ? 45 : 70;
  
  // ASYMMETRIC MARGINS - Much smaller on left than right
  // The key change is here - adjust these values as needed
  const marginLeft = isMobile ? -10 : -5;  // Very small left margin (percentage)
  const marginRight = isMobile ? 30 : 10; // Larger right margin (percentage)
  const marginTop = isMobile ? 1 : 5;
  const marginBottom = isMobile ? 1 : 5;
  
  // Fixed positions approach - divide screen into a simple grid
  const positions = [];
  
  // Calculate rows and columns based on screen size
  const columns = isMobile ? 4 : 5;
  const rows = Math.ceil(numberOfHeadlines / columns);
  
  // Create a debug container to show grid layout if needed
  const debugMode = false // Set to true to see grid layout
  let debugContainer;
  
  if (debugMode) {
    debugContainer = document.createElement('div');
    debugContainer.style.position = 'fixed';
    debugContainer.style.top = '0';
    debugContainer.style.left = '0';
    debugContainer.style.width = '100%';
    debugContainer.style.height = '100vh';
    debugContainer.style.zIndex = '9';
    debugContainer.style.pointerEvents = 'none';
    document.body.appendChild(debugContainer);
  }
  
  // Calculate position for each cell in grid
  function generateGridPositions() {
    // Calculate usable area with ASYMMETRIC margins
    const usableWidth = 100 - marginLeft - marginRight;
    const usableHeight = 100 - marginTop - marginBottom;
    
    // Size of each cell
    const cellWidth = usableWidth / columns;
    const cellHeight = usableHeight / rows;
    
    // Clear positions array
    positions.length = 0;
    
    // Generate positions
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        // Calculate center point of cell - shifted left because of asymmetric margins
        const centerX = marginLeft + (c * cellWidth) + (cellWidth / 2);
        const centerY = marginTop + (r * cellHeight) + (cellHeight / 2);
        
        // Add some randomness to positions (but keep within cell)
        // Less randomness on x-axis to prevent extending off screen
        const jitterX = (Math.random() - 0.5) * (cellWidth * 0.3);
        const jitterY = (Math.random() - 0.5) * (cellHeight * 0.5);
        
        // Final position (percentage of viewport)
        const left = centerX + jitterX;
        const top = centerY + jitterY;
        
        positions.push({ left, top });
        
        // Debug visualization
        if (debugMode) {
          const cell = document.createElement('div');
          cell.style.position = 'absolute';
          cell.style.left = `${marginLeft + (c * cellWidth)}%`;
          cell.style.top = `${marginTop + (r * cellHeight)}%`;
          cell.style.width = `${cellWidth}%`;
          cell.style.height = `${cellHeight}%`;
          cell.style.border = '1px dashed rgba(255,0,0,0.5)';
          cell.innerHTML = `<div style="color:red;position:absolute;top:${cellHeight/2}px;left:${cellWidth/2}px;">Cell ${r}x${c}</div>`;
          debugContainer.appendChild(cell);
          
          // Also show the usable area
          if (r === 0 && c === 0) {
            const usableArea = document.createElement('div');
            usableArea.style.position = 'absolute';
            usableArea.style.left = `${marginLeft}%`;
            usableArea.style.top = `${marginTop}%`;
            usableArea.style.width = `${usableWidth}%`;
            usableArea.style.height = `${usableHeight}%`;
            usableArea.style.border = '2px solid blue';
            usableArea.style.boxSizing = 'border-box';
            debugContainer.appendChild(usableArea);
          }
        }
      }
    }
    
    // Shuffle positions for more natural appearance
    shuffleArray(positions);
    
    console.log(`Generated ${positions.length} positions for ${numberOfHeadlines} headlines`);
  }
  
  // Shuffle array (Fisher-Yates algorithm)
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  
  // Generate the grid positions
  generateGridPositions();
  
  // Create all headlines at the calculated positions
  const headlines = [];
  
  for (let i = 0; i < numberOfHeadlines; i++) {
    if (i >= positions.length) {
      console.warn(`Not enough positions for headline ${i+1}`);
      break;
    }
    
    const headline = document.createElement('div');
    headline.classList.add('headline');
    headline.dataset.index = i + 1; // Store index for debugging
    
    // Set dimensions
    headline.style.width = `${headlineWidth}px`;
    headline.style.height = `${headlineHeight}px`;
    
    // Position headline
    headline.style.top = `${positions[i].top}%`;
    headline.style.left = `${positions[i].left}%`;
    
    // Set background image
    headline.style.backgroundImage = `url('headlines/headline${i+1}.png')`;
    headline.style.backgroundSize = 'contain';
    headline.style.backgroundRepeat = 'no-repeat';
    
    // Add debug information
    if (debugMode) {
      headline.style.border = '1px solid blue';
      headline.innerHTML = `<span style="background:rgba(255,255,255,0.7);position:absolute;top:0;left:0;">${i+1}</span>`;
    }
    
    // Add to DOM
    headlinesContainer.appendChild(headline);
    headlines.push(headline);
    
    console.log(`Created headline ${i+1} at position left: ${positions[i].left}%, top: ${positions[i].top}%`);
  }
  
  console.log(`Successfully created ${headlines.length} of ${numberOfHeadlines} headlines`);
  
  // Debounce function
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
    console.log('Showing headlines animation started');
    
    // Create a shuffled array of indices for random appearance order
    const indices = headlines.map((_, i) => i);
    shuffleArray(indices);
    
    indices.forEach((index, i) => {
      setTimeout(() => {
        if (headlines[index]) {
          headlines[index].style.opacity = '1';
          console.log(`Showed headline ${index + 1}`);
        }
        
        // When last headline is shown, update state
        if (i === indices.length - 1) {
          headlinesVisible = true;
          animationInProgress = false;
          console.log('All headlines now visible');
        }
      }, i * (isMobile ? 150 : 200));
    });
  }
  
  // Function to hide headlines with staggered timing
  function hideHeadlines() {
    if (!headlinesVisible || animationInProgress) return;
    
    animationInProgress = true;
    console.log('Hiding headlines animation started');
    
    // Create a shuffled array of indices for random disappearance order
    const indices = headlines.map((_, i) => i);
    shuffleArray(indices);
    
    indices.forEach((index, i) => {
      setTimeout(() => {
        if (headlines[index]) {
          headlines[index].style.opacity = '0';
          console.log(`Hid headline ${index + 1}`);
        }
        
        // When last headline is hidden, update state
        if (i === indices.length - 1) {
          headlinesVisible = false;
          animationInProgress = false;
          console.log('All headlines now hidden');
        }
      }, i * (isMobile ? 75 : 100));
    });
  }
  
  // Scroll handler with debounce
  const handleScroll = debounce(function() {
    const viewportMiddle = window.innerHeight / 2;
    const secondCaptionRect = secondCaption.getBoundingClientRect();
    const captionCenter = (secondCaptionRect.top + secondCaptionRect.bottom) / 2;
    
    const triggerDistance = isMobile ? 250 : 200;
    const isCaptionNearMiddle = Math.abs(captionCenter - viewportMiddle) < triggerDistance;
    
    const section2Bottom = section2.getBoundingClientRect().bottom;
    const isPastSection2 = section2Bottom < 0;
    
    if (isCaptionNearMiddle && !isPastSection2) {
      showHeadlines();
    } else {
      hideHeadlines();
    }
  }, isMobile ? 50 : 100);
  
  // Attach debounced scroll handler
  window.addEventListener('scroll', handleScroll);
  
  // Handle window resize
  window.addEventListener('resize', debounce(function() {
    // Check if mobile status changed
    const wasMobile = isMobile;
    const isMobileNow = window.innerWidth < 768;
    
    console.log(`Window resized: ${window.innerWidth}x${window.innerHeight}, Mobile: ${isMobileNow}`);
    
    // If mobile status changed, reload the page
    if (wasMobile !== isMobileNow) {
      console.log('Mobile status changed, reloading page');
      location.reload();
    } else {
      // Recalculate positions and update headlines
      console.log('Recalculating headline positions');
      generateGridPositions();
      
      headlines.forEach((headline, i) => {
        if (i < positions.length) {
          headline.style.top = `${positions[i].top}%`;
          headline.style.left = `${positions[i].left}%`;
        }
      });
    }
  }, 250));
  
  // Initial scroll check
  handleScroll();
});




//---------------------------------
//---------------------------------
//-----BEESWARM VISUALIZATION------
//---------------------------------
//---------------------------------


