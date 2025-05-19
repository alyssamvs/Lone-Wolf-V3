///////////////////
//////////////////
//DATA//
//////////////////
/////////////////

// First, let's define our data for each stage
const data = [
    // Stage 0: Initial state (empty)
    [],
    
    // Stage 1: US lone actors percentage
    [
      { 
        category: "US Terrorists", 
        values: [
          { type: "Lone Actors", value: 6 },
          { type: "Group Actors", value: 94 }
        ]
      }
    ],
    
    // Stage 2: US attacks responsibility
    [
      { 
        category: "US Terrorists", 
        values: [
          { type: "Lone Actors", value: 6 },
          { type: "Group Actors", value: 94 }
        ]
      },
      { 
        category: "US Terror Convictions", 
        values: [
          { type: "Lone Actor Convictions", value: 25 },
          { type: "Group Actor Convictions", value: 75 }
        ]
      }
    ],
    
    // Stage 3: European attacks
    [
      { 
        category: "US Terrorists", 
        values: [
          { type: "Lone Actors", value: 6 },
          { type: "Group Actors", value: 94 }
        ]
      },
      { 
        category: "US Terror Convictions", 
        values: [
          { type: "Lone Actor Convictions", value: 25 },
          { type: "Group Actor Convictions", value: 75 }
        ]
      },
      { 
        category: "European Attacks (2000-2014)", 
        values: [
          { type: "Right-wing Lone Actors", value: 55 },
          { type: "Islamic/ISIS-inspired", value: 45 }
        ]
      }
    ],
    
    // Stage 4: Western Hemisphere
    [
      { 
        category: "US Terrorists", 
        values: [
          { type: "Lone Actors", value: 6 },
          { type: "Group Actors", value: 94 }
        ]
      },
      { 
        category: "US Terror Convictions", 
        values: [
          { type: "Lone Actor Convictions", value: 25 },
          { type: "Group Actor Convictions", value: 75 }
        ]
      },
      { 
        category: "European Attacks (2000-2014)", 
        values: [
          { type: "Right-wing Lone Actors", value: 55 },
          { type: "Islamic/ISIS-inspired", value: 45 }
        ]
      },
      { 
        category: "Western Hemisphere (Last 5 Years)", 
        values: [
          { type: "Lone Actors", value: 93 },
          { type: "Group Actors", value: 7 }
        ]
      }
    ]
  ];








// Add this code to your stackedbar.js file

document.addEventListener('DOMContentLoaded', function() {
    // Define size and margins
    const margin = { top: 40, right: 30, bottom: 40, left: 100 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
    // Colors for the different types of actors
    const colors = {
      "Lone Actors": "#FF570F", // Using your site's accent color
      "Group Actors": "#888888",
      "Lone Actor Convictions": "#FF570F",
      "Group Actor Convictions": "#888888",
      "Right-wing Lone Actors": "#FF570F",
      "Islamic/ISIS-inspired": "#888888",
    };
    
    // Create the SVG container
    const svg = d3.select('#visualization')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Add title
    svg.append('text')
      .attr('class', 'chart-title')
      .attr('x', width / 2)
      .attr('y', -15)
      .attr('text-anchor', 'middle')
      .text('Lone Actor Terrorism Statistics');
    
    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, width]);
    
    const yScale = d3.scaleBand()
      .padding(0.3);
    
    // Create axes
    const xAxis = svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`);
    
    const yAxis = svg.append('g')
      .attr('class', 'y-axis');
    
    // Initialize with empty data
    updateChart(0);
    
    // Function to update the chart based on the stage
    function updateChart(stage) {
      const currentData = data[stage];
      
      if (!currentData || currentData.length === 0) {
        // Hide chart if no data
        svg.selectAll('.bar-group').remove();
        svg.select('.x-axis').style('opacity', 0);
        svg.select('.y-axis').style('opacity', 0);
        svg.select('.chart-title').style('opacity', 0);
        return;
      }
      
      // Show axes and title
      svg.select('.x-axis').style('opacity', 1);
      svg.select('.y-axis').style('opacity', 1);
      svg.select('.chart-title').style('opacity', 1);
      
      // Update y scale domain
      yScale.domain(currentData.map(d => d.category))
        .range([0, height * (currentData.length / 4)]);
      
      // Update y axis
      yAxis.transition().duration(500)
        .call(d3.axisLeft(yScale));
      
      // Update x axis
      xAxis.transition().duration(500)
        .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => d + '%'));
      
      // Select all bar groups
      const barGroups = svg.selectAll('.bar-group')
        .data(currentData, d => d.category);
      
      // Remove old bar groups
      barGroups.exit().remove();
      
      // Add new bar groups
      const enterGroups = barGroups.enter()
        .append('g')
        .attr('class', 'bar-group')
        .attr('transform', d => `translate(0,${yScale(d.category)})`);
      
      // Merge enter and update selections
      const allGroups = enterGroups.merge(barGroups);
      
      // Update positions of existing groups
      allGroups.transition().duration(500)
        .attr('transform', d => `translate(0,${yScale(d.category)})`);
      
      // Add bars to each group
      const bars = allGroups.selectAll('.bar')
        .data(d => {
          let xOffset = 0;
          return d.values.map(v => {
            const bar = {
              type: v.type,
              value: v.value,
              xOffset: xOffset
            };
            xOffset += v.value;
            return bar;
          });
        });
      
      // Remove old bars
      bars.exit().remove();
      
      // Add new bars
      const enterBars = bars.enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('height', yScale.bandwidth())
        .attr('x', d => xScale(d.xOffset))
        .attr('width', 0)
        .attr('fill', d => colors[d.type] || '#999');
      
      // Merge and update all bars
      enterBars.merge(bars).transition().duration(500)
        .attr('x', d => xScale(d.xOffset))
        .attr('width', d => xScale(d.value))
        .attr('height', yScale.bandwidth())
        .attr('fill', d => colors[d.type] || '#999');
      
      // Add labels
      const labels = allGroups.selectAll('.bar-label')
        .data(d => {
          let xOffset = 0;
          return d.values.map(v => {
            const label = {
              type: v.type,
              value: v.value,
              xOffset: xOffset + (v.value / 2)
            };
            xOffset += v.value;
            return label;
          });
        });
      
      // Remove old labels
      labels.exit().remove();
      
      // Add new labels
      const enterLabels = labels.enter()
        .append('text')
        .attr('class', 'bar-label')
        .attr('y', yScale.bandwidth() / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .text(d => d.value + '%')
        .style('fill', 'white')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('opacity', 0);
      
      // Merge and update all labels
      enterLabels.merge(labels).transition().duration(500)
        .attr('x', d => xScale(d.xOffset))
        .style('opacity', d => d.value >= 10 ? 1 : 0)
        .text(d => d.value + '%');
    }
    
    // Expose the update function to the window object so we can call it from scroll
    window.updateStackedBarChart = updateChart;
  });


 ////////////////////
  //SCROLLING FUNCTION
  ////////////////////

  // Add this at the end of your file

// Function to handle scrolling and update the chart
function handleScroll() {
    const captions = document.querySelectorAll('#section-3 .caption');
    if (!captions.length) return;
    
    // Find which caption is currently visible
    const viewportHeight = window.innerHeight;
    let visibleCaptionIndex = 0;
    
    captions.forEach((caption, index) => {
      const rect = caption.getBoundingClientRect();
      // If the caption is in the center of the viewport
      if (rect.top <= viewportHeight / 2 && rect.bottom >= viewportHeight / 2) {
        visibleCaptionIndex = index;
      }
    });
    
    // Update the chart based on the visible caption
    if (window.updateStackedBarChart) {
      window.updateStackedBarChart(visibleCaptionIndex);
    }
  }
  
  // Add scroll event listener
  window.addEventListener('scroll', handleScroll);
  
  // Initial call to set the correct state
  setTimeout(handleScroll, 100);