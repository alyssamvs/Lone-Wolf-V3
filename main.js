

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
 
// 
document.addEventListener('DOMContentLoaded', function() {
  // Configuration
  const numberOfHeadlines = 15;
  const headlinesContainer = document.querySelector('.headlines-container');
  const section2 = document.querySelectorAll('.section')[1];
  const secondCaption = section2.querySelectorAll('.caption')[1];
  
  // Track animation state
  let headlinesVisible = false;
  let animationInProgress = false;
  
  // Detect if we're on mobile
  const isMobile = window.innerWidth < 768;
  
  // Adjust headline size based on device
  const headlineWidth = isMobile ? 200 : 300;
  const headlineHeight = isMobile ? 60 : 100;
  
  // Safety margins to prevent cutoff (percentage of viewport)
  const safetyMarginLeft = isMobile ? 10 : 5; // % from left edge
  const safetyMarginRight = isMobile ? 15 : 10; // % from right edge
  const safetyMarginTop = 5; // % from top edge
  const safetyMarginBottom = 5; // % from bottom edge
  
  // Calculate usable area (accounting for headline dimensions)
  const usableWidthPercent = 100 - safetyMarginLeft - safetyMarginRight - (headlineWidth / window.innerWidth * 100);
  const usableHeightPercent = 100 - safetyMarginTop - safetyMarginBottom - (headlineHeight / window.innerHeight * 100);
  
  // Array to track placed headlines
  const placedHeadlines = [];
  
  // Divide the screen into zones to ensure even distribution
  const numHorizontalZones = isMobile ? 3 : 4;
  const numVerticalZones = 5;
  
  // Create a grid of zones to place headlines
  const zones = [];
  for (let x = 0; x < numHorizontalZones; x++) {
    for (let y = 0; y < numVerticalZones; y++) {
      zones.push({ x, y });
    }
  }
  
  // Shuffle zones for random placement
  for (let i = zones.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [zones[i], zones[j]] = [zones[j], zones[i]];
  }
  
  // Function to check if a position overlaps with existing headlines
  function checkOverlap(x, y, width, height) {
    const margin = isMobile ? 10 : 20;
    
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
  
  // Create headlines using the zone system with safety margins
  for (let i = 0; i < Math.min(numberOfHeadlines, zones.length); i++) {
    const headline = document.createElement('div');
    headline.classList.add('headline');
    
    // Set dimensions
    headline.style.width = `${headlineWidth}px`;
    headline.style.height = `${headlineHeight}px`;
    
    // Get a zone for this headline
    const zone = zones[i];
    
    // Calculate safe zone boundaries
    const zoneWidth = usableWidthPercent / numHorizontalZones;
    const zoneHeight = usableHeightPercent / numVerticalZones;
    
    // Calculate position within the zone (with some randomness)
    const zoneLeftStart = zone.x * zoneWidth + safetyMarginLeft;
    const zoneTopStart = zone.y * zoneHeight + safetyMarginTop;
    
    // Add randomness within the zone (but keep within zone boundaries)
    const leftOffset = Math.random() * (zoneWidth * 0.7);
    const topOffset = Math.random() * (zoneHeight * 0.7);
    
    // Calculate final position percentages with safety constraints
    const left = Math.min(Math.max(zoneLeftStart + leftOffset, safetyMarginLeft), 100 - safetyMarginRight - (headlineWidth / window.innerWidth * 100));
    const top = Math.min(Math.max(zoneTopStart + topOffset, safetyMarginTop), 100 - safetyMarginBottom - (headlineHeight / window.innerHeight * 100));
    
    // Convert percentage to pixels for collision detection
    const xPos = (left / 100) * window.innerWidth;
    const yPos = (top / 100) * window.innerHeight;
    
    // Only check for overlap in congested areas
    let overlap = false;
    if (placedHeadlines.length > numHorizontalZones * numVerticalZones * 0.5) {
      overlap = checkOverlap(xPos, yPos, headlineWidth, headlineHeight);
    }
    
    if (!overlap) {
      // Apply the position
      headline.style.top = `${top}%`;
      headline.style.left = `${left}%`;
      
      // Remember this position for collision detection
      placedHeadlines.push({
        x: xPos,
        y: yPos,
        width: headlineWidth,
        height: headlineHeight
      });
      
      // Set background image
      headline.style.backgroundImage = `url('headlines/headline${i+1}.png')`;
      headline.style.backgroundSize = 'contain';
      
      // Add debug border (comment out in production)
      // headline.style.border = "1px solid blue";
      
      headlinesContainer.appendChild(headline);
    }
  }
  
  // Get all headlines
  const headlines = Array.from(document.querySelectorAll('.headline'));
  
  // Shuffle the headlines array for random appearance order
  for (let i = headlines.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [headlines[i], headlines[j]] = [headlines[j], headlines[i]];
  }
  
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
    
    headlines.forEach((headline, index) => {
      setTimeout(() => {
        headline.style.opacity = '1';
        
        // When last headline is shown, update state
        if (index === headlines.length - 1) {
          headlinesVisible = true;
          animationInProgress = false;
        }
      }, index * (isMobile ? 200 : 300));
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
      }, index * (isMobile ? 100 : 150));
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
    // Recalculate whether we're on mobile
    const wasMobile = isMobile;
    const isMobileNow = window.innerWidth < 768;
    
    // If mobile status changed, reload the page to regenerate headlines
    if (wasMobile !== isMobileNow) {
      location.reload();
    }
  }, 250));
  
  // Initial check
  handleScroll();
});