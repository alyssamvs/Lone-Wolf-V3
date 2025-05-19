


document.addEventListener('DOMContentLoaded', function() {

    // Check if we have the visualization element
    const svg = d3.select('#stacked-bar-visualization');
    if (svg.empty()) return;
  
    // Data for each stage
    const data = [
      // Stage 0: Initial context (empty)
      [],
      
      // Stage 1: US lone actors (6%)
      [
        { label: "Lone Actors", value: 6, color: "#FF570F" },
        { label: "Group Actors", value: 94, color: "#888888" }
      ],
      
      // Stage 2: US terror convictions (25%)
      [
        { label: "Lone Actor Convictions", value: 25, color: "#FF570F" },
        { label: "Group Actor Convictions", value: 75, color: "#888888" }
      ],
      
      // Stage 3: European attacks
      [
        { label: "Right-wing Lone Actors", value: 55, color: "#FF570F" },
        { label: "Islamic/ISIS-inspired", value: 45, color: "#888888" }
      ],
      
      // Stage 4: Western Hemisphere
      [
        { label: "Lone Actors", value: 93, color: "#FF570F" },
        { label: "Group Actors", value: 7, color: "#888888" }
      ]
    ];
  
    // Set up dimensions
    const width = 400;
    const height = 600;
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const barHeight = 60;
  
    // Initialize current stage
    let currentStage = -1;

    //IMAGES

      // Add image data - paths are relative to your HTML file
  const images = [
    "", // No image for stage 0
    "", // Image for stage 1
    "./Assets/usa.png", // Image for stage 2
    "./Assets/europe.png", // Image for stage 3
    "./Assets/worldmap.png"  // Image for stage 4
  ];
  
  // Initialize the floating image container
  function initFloatingImages() {
    const container = document.getElementById('floating-image-container');
    if (!container) return;
    
    // Clear any existing content
    container.innerHTML = '';
    
    // Create image elements for each stage
    images.forEach((src, index) => {
      if (!src) return; // Skip empty sources
      
      const img = document.createElement('img');
      img.src = src;
      img.alt = `Illustration for stage ${index}`;
      img.dataset.stage = index;
      img.className = 'floating-image';
      
      container.appendChild(img);
    });
  }
  
  // Call once to initialize images
  initFloatingImages();
  
  // Function to update which image is visible
  function updateFloatingImage(stage) {
    // Get all images
    const images = document.querySelectorAll('.floating-image');
    
    // Hide all images
    images.forEach(img => {
      img.classList.remove('active');
    });
    
    // Show the image for the current stage
    const currentImage = document.querySelector(`.floating-image[data-stage="${stage}"]`);
    if (currentImage) {
      currentImage.classList.add('active');
    }
  }
  
    // Function to update the visualization based on the stage
    function updateVisualization(stage) {
      // If stage hasn't changed, do nothing
      if (stage === currentStage) return;
      
      // Update current stage
      currentStage = stage;
      
      // If empty stage, clear the SVG
      if (stage === 0 || !data[stage]) {
        svg.selectAll('*').remove();
        return;
      }
      
      // Get the current data
      const currentData = data[stage];
      
      // Calculate xScale for the stacked bar
      const xScale = d3.scaleLinear()
        .domain([0, 100])
        .range([0, width - margin.left - margin.right]);
      
      // Calculate the vertical position for the horizontal bar
      const barY = height / 2;
      
      // Remove previous bars if this is the first time we're showing a real stage
      if (stage === 1) {
        svg.selectAll('.bar-group').remove();
      }
      
      // Prepare stacked data
      let stackedData = [];
      let cumulative = 0;
      
      currentData.forEach(d => {
        stackedData.push({
          label: d.label,
          value: d.value,
          start: cumulative,
          end: cumulative + d.value,
          color: d.color
        });
        cumulative += d.value;
      });
      
      // Create/update stacked bar
      const barGroups = svg.selectAll('.bar-group')
        .data(stackedData);
      
      // Enter new segments
      const enterGroups = barGroups.enter()
        .append('g')
        .attr('class', 'bar-group');
      
      // Add rectangles to new groups
      enterGroups.append('rect')
        .attr('class', 'bar-segment')
        .attr('x', d => margin.left + xScale(d.start))
        .attr('y', barY - barHeight / 2)
        .attr('width', d => xScale(d.value))
        .attr('height', barHeight)
        .attr('fill', d => d.color);
      
      // Add value labels to segments (only if the segment is wide enough)
      enterGroups.append('text')
        .attr('class', 'value-label')
        .attr('x', d => margin.left + xScale(d.start) + xScale(d.value) / 2)
        .attr('y', barY)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .style('fill', d => d.value > 20 ? 'white' : 'black')
        // .text(d => d.value + '%');
      
      // Update existing segments with transition
      barGroups.select('rect')
        .transition()
        .duration(1000)
        .attr('x', d => margin.left + xScale(d.start))
        .attr('width', d => xScale(d.value));
      
      // Update existing labels with transition
      barGroups.select('text')
        .transition()
        .duration(1000)
        .attr('x', d => margin.left + xScale(d.start) + xScale(d.value) / 2)
        .style('fill', d => d.value > 20 ? 'white' : 'black')
        // .text(d => d.value + '%');
      
      // Exit if necessary (shouldn't happen with this data structure)
      barGroups.exit().remove();
    }
  
    // Function to check which caption is visible
    function checkVisibleCaption() {
      const captions = document.querySelectorAll('#section-3 .caption');
      if (!captions.length) return;
      
      // Get viewport height
      const viewportHeight = window.innerHeight;
      
      // Check each caption
      captions.forEach((caption, index) => {
        const rect = caption.getBoundingClientRect();
        
        // If caption is in the center of the viewport
        if (rect.top <= viewportHeight / 2 && rect.bottom >= viewportHeight / 2) {
          updateVisualization(index);
        }
      });
    }
  
    // Add scroll event listener
    window.addEventListener('scroll', checkVisibleCaption);
    
    // Initial check
    setTimeout(checkVisibleCaption, 100);
  });