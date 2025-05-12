//------------------
//------------------
//SET-UP
//------------------
//------------------

const isMobile = window.innerWidth < 600;


document.addEventListener('DOMContentLoaded', function() {

// Load the pre-processed data

  fetch('./Data/processed-accelerationism.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
    // Use all events without filtering
    if (data.length === 0) {
        throw new Error('No events found in the data');
    } 
    
// Initialize the visualization

      initializeVisualization(data);
    })
    .catch(error => {
      console.error('Error loading data:', error);
      document.getElementById('visualization').innerHTML = 
        `<div class="error-message">Error loading data: ${error.message}. Please check the console for details.</div>`;
    });
  
function initializeVisualization(events) {
    // Calculate year counts
    const yearCounts = {};

    
// Setup visualization dimensions

    const margin = {
    top: isMobile ? 10 : 30, 
    right: isMobile ? 10 : 40, 
    bottom: isMobile ? 10 : 80, 
    left: isMobile ? 10 : 40
    };
    const width = 1100 - margin.left - margin.right; // Increased width
    // const height = 550 - margin.top - margin.bottom;
    const height = isMobile ? 
    (window.innerHeight - margin.top - margin.bottom) : // Mobile: 100% screen
    (550 - margin.top - margin.bottom);      
    
// Create SVG with responsive settings

    const svg = d3.select("#visualization")
    .append("svg")
    .attr("width", "100%")
    .attr("height", height + margin.top + margin.bottom)
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
    .attr("transform", isMobile ? 
    `translate(${margin.left}, ${margin.top - 400})` :  // Lift up by 30px on mobile
    `translate(${margin.left}, ${margin.top})`);       // Normal position on desktop
    
    // Create scale for circle size based on casualties
    const maxCasualties = d3.max(events, d => d.incident.casualties.total) || 1;
    const radiusScale = d3.scaleSqrt()
        .domain([0, maxCasualties])
        .range([isMobile ? 8 : 4, isMobile ? 30 : 20]);
    
// Create tooltip

    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
    
    // Filter events with valid years
    const validEvents = events.filter(d => d.date && d.date.year);
    
    // Group events by year
    const eventsByYear = d3.group(validEvents, d => d.date.year);
    const years = Array.from(eventsByYear.keys()).sort((a, b) => a - b);
    
    // Add missing years to ensure all years in range are included
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    
    // Create array of all years including those without events
    const allYears = [];
    for (let y = minYear; y <= maxYear; y++) {
      allYears.push(y);
      // If this year isn't in the data, create an entry for it
      if (!years.includes(y)) {
        eventsByYear.set(y, []);
      }
    }
    
    // Sort all years
    allYears.sort((a, b) => a - b);

    
// Create year center positions - all in a single row
    const yearPositions = [];

//------------------
//------------------
//MOBILE VERSION
//------------------
//------------------

    if (isMobile) {
// VERTICAL LAYOUT FOR MOBILE - years arranged top to bottom

// Option 1: Use fixed spacing between years
const fixedSpacing = 45; // 100 pixels between each year

// Position each year with fixed spacing
allYears.forEach((year, i) => {
    const yearEvents = eventsByYear.get(year) || [];
    const count = yearEvents.length;
    
    yearPositions.push({
        year: year,
        x: width / 2, // Center horizontally
        y: 80 + (i * fixedSpacing), // Start at 80px from top, then fixed spacing
        count: count
    });
});

    

    } else {
    
    // Position all years in a single row
    const yearSpacing = width / (allYears.length + 1); // Add 1 for margins
    
    // Calculate positions for all years
    allYears.forEach((year, i) => {
      const yearEvents = eventsByYear.get(year) || [];
      const count = yearEvents.length;
      const sizeMultiplier = Math.sqrt(count) / 5 + 0.8;
      
      yearPositions.push({
        year: year,
        x: (i + 1) * yearSpacing, // +1 to start a bit from the left edge
        y: height / 2, // Center vertically
        count: count,
        radius: Math.max(yearSpacing / 3 * Math.min(sizeMultiplier, 1.5), 15)
      });
    });
}
    
//------------------
//------------------
//LABELS 
//------------------
//------------------

    // Add year labels - show only some years to avoid overcrowding
    svg.selectAll(".year-label")
      .data(yearPositions)
      .enter()
      .append("text")
      .attr("class", "year-label")
      .attr("x", d => d.x)
      .attr("y", d => d.y + 100)
      .attr("text-anchor", "middle")
      .text((d, i) => {
        // Show years with spacing to avoid overlapping
        if (yearPositions.length <= 10) return d.year;
        if (yearPositions.length <= 15) return i % 2 === 0 ? d.year : '';
        if (yearPositions.length <= 25) return i % 3 === 0 ? d.year : '';
        return i % 4 === 0 ? d.year : '';
      });

//------------------
//------------------
//CIRCLES
//------------------
//------------------

    // Create a flat array of all events with their year center position
    const flatEvents = [];
    
    yearPositions.forEach(yearPosition => {
      const year = yearPosition.year;
      const yearEvents = eventsByYear.get(year) || [];
      
      yearEvents.forEach(event => {
        flatEvents.push({
          ...event,
          yearCenter: yearPosition,
          // Start positions: random across the visualization
          x: Math.random() * width,
          y: Math.random() * height
        });
      });
    });
    
    // Create event circles
    const eventCircles = svg.selectAll(".event")
      .data(flatEvents)
      .enter()
      .append("circle")
      .attr("class", "event")
      .attr("r", isMobile ? 12 : 5)
      .attr("fill", "#3498db")
      .attr("opacity", 0.8)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .on("mouseover", function(event, d) {
        // Highlight circle on hover
        d3.select(this)
          .transition()
          .duration(200)
          .attr("stroke-width", 2)
          .attr("opacity", 1);

//------------------
//------------------
//TOOLTIP
//------------------
//------------------
        
        // Format the date
        const dateStr = d.date.full || `${d.date.year || ''}`;
        
        // Show tooltip with the new data structure
        tooltip.transition()
          .duration(200)
          .style("opacity", 0.9);
        
        // Build tooltip content from available data
        let tooltipContent = '';
        
        if (dateStr) tooltipContent += `<strong>Date:</strong> ${dateStr}<br>`;
        if (d.incident.location.formatted) tooltipContent += `<strong>Location:</strong> ${d.incident.location.formatted}<br>`;
        // if (d.ideology.affiliation) tooltipContent += `<strong>Ideology:</strong> ${d.ideology.affiliation}<br>`;
        // if (d.incident.method) tooltipContent += `<strong>Method:</strong> ${d.incident.method}<br>`;
        
        tooltipContent += `<strong>Casualties:</strong> ${d.incident.casualties.killed} killed, ${d.incident.casualties.injured} injured<br>`;
        
        if (d.perpetrator.name) tooltipContent += `<strong>Perpetrator:</strong> ${d.perpetrator.name}<br>`;
        // if (d.narrative) tooltipContent += `<strong>Details:</strong> ${d.narrative}`;
        
        tooltip.html(tooltipContent)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 15) + "px");
      })
      .on("mouseout", function() {
        // Reset circle appearance
        d3.select(this)
          .transition()
          .duration(200)
          .attr("stroke-width", 1)
          .attr("opacity", 0.8);
        
        // Hide tooltip
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });
    
//------------------
//------------------
//FORCE SIMULATION
//------------------
//------------------

    // Create improved force simulation
    const simulation = d3.forceSimulation(flatEvents)
    .alphaDecay(0.003)
    .velocityDecay(isMobile ? 0.4 : 0.3) // More friction on mobile
    .force("x", d3.forceX(d => d.yearCenter.x).strength(isMobile ? 0.1 : 0.4)) // Less horizontal constraint on mobile
    .force("y", d3.forceY(d => d.yearCenter.y).strength(0.5))
    .force("charge", d3.forceManyBody().strength(isMobile ? -40 : -20)) // More repulsion on mobile
    .force("collide", d3.forceCollide(isMobile ? 15 : 5).strength(isMobile ? 0.5 : 0.5)) // Larger collision area on mobile
            .on("tick", () => {
        eventCircles
          .attr("cx", d => d.x)
          .attr("cy", d => d.y);
      })
      .stop();
    
    // Track scrolling state for smoother transitions
    let inCasualtyView = false;
    let inHighCasualtyFocus = false;
    let hasStartedAnimation = false;
    
    // Create an observer for the visualization container

//------------------
//------------------
//ANIMATION TRIGGER
//------------------
//------------------

// 1) Create the observer
const visualizationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      console.log('🔍 Viz observer entry:', entry.intersectionRatio, 'isIntersecting?', entry.isIntersecting);
  
      // Only fire once, when we first see enough of the viz
      if (entry.isIntersecting && !hasStartedAnimation) {
        console.log("▶️ visualizationObserver firing startAnimation()");
        startAnimation();
  
        // Stop observing so it only ever runs once
        visualizationObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2  // fire when 20% of the visualization-container is visible
  });
  
  // 2) Hook it up to the container
  const vizTrigger = document.getElementById('section-3');
  console.log('🐝 Now observing:', vizTrigger);
  visualizationObserver.observe(vizTrigger);

    
//------------------
//------------------
//ANIMATION FUNCTION
//------------------
//------------------

    
  function startAnimation() {
    if (hasStartedAnimation) return;
    hasStartedAnimation = true;
      
      // Calculate cluster radii based on event count
      const yearEventCounts = {};
      flatEvents.forEach(e => {
        yearEventCounts[e.date.year] = (yearEventCounts[e.date.year] || 0) + 1;
      });

      // simulation.alphaTarget(0.3).restart();
      simulation
        .alpha(0.2)    // jump current α up to 0.8
        .alphaTarget(0.01) // then let it decay back toward 0
        .restart();
      
    }

//------------------
//------------------
//SCROLLY
//------------------
//------------------
    

// Function to handle visualization transitions

  function handleStep(idx) {
    
// // Start animation if needed

//       if (!hasStartedAnimation) {
//       console.log("Starting animation from caption step");
//       startAnimation();
//     }
    
// Always restart simulation for more movement

    if (hasStartedAnimation) {
    simulation.alpha(0.2).restart(); }


//-------------------------------------------------
//------------------CAPTION STEPS------------------
//-------------------------------------------------

switch (idx) {

//------------------STEP 1------------------
  
case 0:
  // Reset to default frequency-over-time
  eventCircles
    .interrupt()
    .transition().duration(300)
    .attr("r", isMobile ? 12 : 5)
    .attr("fill", "#3498db")
    .style("opacity", 0.8)
    .attr("stroke-width", 1);
  simulation.force("collide", d3.forceCollide(isMobile ? 10 : 6).strength(0.9));
  inCasualtyView = false;
  inHighCasualtyFocus = false;
  break;

//------------------STEP 2------------------

case 1:
  // Transition to casualty view (size = total casualties, color by severity)
  eventCircles
    .interrupt()
    .transition().duration(300)
    .attr("r", d => radiusScale(d.incident.casualties.total))
    .attr("fill", d => {
      if (d.incident.casualties.killed > 5) return '#e74c3c';
      if (d.incident.casualties.killed > 0) return '#e67e22';
      if (d.incident.casualties.injured > 0) return '#f1c40f';
      return '#3498db';
    })
    .style("opacity", 0.8)
    .attr("stroke-width", 1);
  simulation.force("collide", d3.forceCollide(d => radiusScale(d.incident.casualties.total) + 1).strength(0.9));
  inCasualtyView = true;
  inHighCasualtyFocus = false;
  break;

//------------------STEP 3------------------

case 2:
  // Focus on high-casualty events
  // (ensure we’re in casualty view first)
  if (!inCasualtyView) {
    eventCircles.interrupt()
      .transition().duration(300)
      .attr("r", d => radiusScale(d.incident.casualties.total))
      .attr("fill", d => {
        if (d.incident.casualties.killed > 5) return '#e74c3c';
        if (d.incident.casualties.killed > 0) return '#e67e22';
        if (d.incident.casualties.injured > 0) return '#f1c40f';
        return '#3498db';
      });
    simulation.force("collide", d3.forceCollide(d => radiusScale(d.incident.casualties.total) + 1).strength(0.9));
    inCasualtyView = true;
  }
  eventCircles.interrupt()
    .transition().duration(300)
    .style("opacity", d => (d.incident.casualties.total > 10 ? 1 : 0.3))
    .attr("stroke-width", d => (d.incident.casualties.total > 10 ? 2 : 1));
  inHighCasualtyFocus = true;
  break;

//------------------STEP 4------------------

case 3:
  // Back to full view (all circles sized by casualties but fully visible)
  eventCircles.interrupt()
    .transition().duration(300)
    .attr("r", d => radiusScale(d.incident.casualties.total))
    .attr("fill", d => {
      if (d.incident.casualties.killed > 5) return '#e74c3c';
      if (d.incident.casualties.killed > 0) return '#e67e22';
      if (d.incident.casualties.injured > 0) return '#f1c40f';
      return '#3498db';
    })
    .style("opacity", 0.8)
    .attr("stroke-width", 1);
  simulation.force("collide", d3.forceCollide(d => radiusScale(d.incident.casualties.total) + 1).strength(0.9));
  inHighCasualtyFocus = false;
  break;
}
}

//New Logic for Intersection Observer

  const captions = document.querySelectorAll('.caption');
  const captionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const idx = +entry.target.getAttribute('data-index');
      console.log('Showing step', idx);
      handleStep(idx);
    });
  }, { threshold: 0.5 });

  captions.forEach(el => captionObserver.observe(el));




   }
});