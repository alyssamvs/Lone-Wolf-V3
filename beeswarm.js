//------------------
//------------------
//SET-UP
//------------------
//------------------


const isMobile = window.innerWidth < 600;


document.addEventListener('DOMContentLoaded', function() {

// Load the pre-processed data

Promise.all([
  fetch('./Data/processed-combined-dataset.json').then(response => response.json()),
  fetch('./Data/sourcetargetaccel.csv').then(response => response.text())
]).then(([eventsData, csvText]) => {
    
// Parse CSV connections

const lines = csvText.trim().split('\n').slice(1); // Skip header
const connections = lines.map(line => {
  // Simple approach: if line starts with quote, find the closing quote
  if (line.startsWith('"')) {
    const firstQuoteEnd = line.indexOf('"', 1);
    if (firstQuoteEnd !== -1) {
      const source = line.substring(1, firstQuoteEnd);
      const remainingLine = line.substring(firstQuoteEnd + 1);
      const target = remainingLine.replace(/^,\s*/, '').trim().replace(/"/g, '');
      return { source, target };
    }
  } else {
    // Regular comma split for non-quoted lines
    const parts = line.split(',');
    if (parts.length >= 2) {
      const source = parts[0].trim().replace(/"/g, '');
      const target = parts[1].trim().replace(/"/g, '');
      return { source, target };
    }
  }
  return null;
}).filter(conn => conn && conn.source && conn.target);

// Use eventsData instead of data

  if (eventsData.length === 0) {
    throw new Error('No events found in the data');
  } 

// Initialize the visualization with both datasets

initializeVisualization(eventsData, connections);
})
.catch(error => {
  console.error('Error loading data:', error);
  document.getElementById('visualization').innerHTML = 
    `<div class="error-message">Error loading data: ${error.message}. Please check the console for details.</div>`;
});

//------------------
//------------------
//Function to initialize the visualization
//------------------
//------------------
  
function initializeVisualization(events, connections) {

// Store connections for later use
const allConnections = connections;

let currentLayout = 'original';
    
// Setup visualization dimensions (keep your existing responsive code)

const margin = {
    top: isMobile ? 10 : 30, 
    right: isMobile ? 10 : 40, 
    bottom: isMobile ? 10 : 80, 
    left: isMobile ? 10 : 40
};
const width = 1100 - margin.left - margin.right;
const height = isMobile ? 
    (window.innerHeight - margin.top - margin.bottom) : 
    (window.innerHeight - margin.top - margin.bottom);


//------------------
//------------------
//ZOOM
//------------------
//------------------    

let zoom = d3.zoom()
    .scaleExtent([0.1, 5])
    .on('zoom', zoomed);

// Create separate zoom behaviors
let panOnly = d3.zoom()
    .scaleExtent([1, 1]) // Lock scale to 1 (no zooming)
    .on('zoom', zoomed);

let panAndZoom = d3.zoom()
    .scaleExtent([0.1, 5])
    .on('zoom', zoomed);

// Zoom toggle functionality
let zoomEnabled = false;

const zoomToggle = document.getElementById('zoom-toggle');
zoomToggle.addEventListener('click', function() {
    zoomEnabled = !zoomEnabled;
    
    if (zoomEnabled) {
        d3.select("#visualization").select("svg").call(panAndZoom);
        zoom = panAndZoom; // Update the global zoom reference
        zoomToggle.classList.add('active');
        zoomToggle.title = "Disable zoom (panning still enabled)";
    } else {
        d3.select("#visualization").select("svg").call(panOnly);
        zoom = panOnly; // Update the global zoom reference
        zoomToggle.classList.remove('active');
        zoomToggle.title = "Enable zoom (panning always enabled)";
    }
});

// Initially set to pan-only mode
d3.select("#visualization").select("svg").call(panOnly);
zoom = panOnly; // Set the global zoom reference


//------------------
//------------------
//CREATE SVG
//------------------
//------------------


// Create SVG 
const svg = d3.select("#visualization")
    .append("svg")
    .attr("width", "100%")
    .attr("height", height + margin.top + margin.bottom)
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .call(zoom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Create tooltip (keep your existing tooltip code)
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

console.log('Network visualization setup complete');

//-------------------

//Arrowheads

svg.append("defs").append("marker")
    .attr("id", "arrowhead")
    .attr("viewBox", "0 -1.25 2.5 2.5")
    .attr("refX", 0)                      // Change to 0 so arrow starts at line end
    .attr("refY", 0)
    .attr("markerWidth", 2.5)
    .attr("markerHeight", 1.5)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-1.25L2.5,0L0,1.25")
    .attr("fill", "#666");
//------------------

// Filter valid events and sort by date

const validEvents = events.filter(d => d.date && d.date.year)
.sort((a, b) => {
    if (a.date.year !== b.date.year) return a.date.year - b.date.year;
    if (a.date.month !== b.date.month) return (a.date.month || 0) - (b.date.month || 0);
    return (a.date.day || 0) - (b.date.day || 0);
});

console.log('Valid events after filtering:', validEvents.length);

// Create name mapping for connections

const eventsByName = new Map();
validEvents.forEach(event => {
eventsByName.set(event.perpetrator.name, event);
});

// Filter connections to only include events we have data for

const validConnections = allConnections.filter(conn => 
eventsByName.has(conn.source) && eventsByName.has(conn.target)
);

console.log('Valid connections found:', validConnections.length);

// Count connections for each perpetrator

const allConnectionCounts = new Map();
validConnections.forEach(conn => {
allConnectionCounts.set(conn.source, (allConnectionCounts.get(conn.source) || 0) + 1);
allConnectionCounts.set(conn.target, (allConnectionCounts.get(conn.target) || 0) + 1);
});


//------------------
//------------------
//CHANGING CIRCLES COLOR, SIZE, RAYS
//------------------
//------------------



// Function to get color based on connections
function getConnectionColor(connections) {
  if (connections === 0) return '#3498db';      // Blue - no connections
  if (connections <= 2) return '#f1c40f';      // Yellow - 1-2 connections  
  if (connections <= 5) return '#e67e22';      // Orange - 3-5 connections
  if (connections <= 20) return '#e74c3c';     // Red - 6-20 connections
  return '#8b0000';                             // Dark red - 20+ connections
}

// Function to get radius based on casualties
function getCasualtyRadius(total) {
  return Math.max(6, Math.min(40, 6 + Math.sqrt(total) * 3)*1.5);
}

// Function to create rays for livestream (32 spikes)
function createRays(parent, x, y, radius, hasLivestream, circleColor) {
  if (!hasLivestream || hasLivestream === 'No' || hasLivestream === 'Unknown') return;
  
  const rayCount = 60;
  const rayLength = radius + 20;
  
  for (let i = 0; i < rayCount; i++) {
      const angle = (i * 2 * Math.PI) / rayCount;
      const x1 = x + Math.cos(angle) * radius;
      const y1 = y + Math.sin(angle) * radius;
      const x2 = x + Math.cos(angle) * rayLength;
      const y2 = y + Math.sin(angle) * rayLength;
      
      parent.append("line")
          .attr("x1", x1)
          .attr("y1", y1)
          .attr("x2", x2)
          .attr("y2", y2)
          .attr("stroke", circleColor)
          .attr("stroke-width", 1)
          .attr("opacity", 0.7)
          .attr("class", "ray");
  }
}

//------------------
//------------------
//UPDATE EVERY THING FUNCTION
//------------------
//------------------

// Function to update all visual elements positions
function updateAllElements() {
    eventCircles.attr("cx", d => d.x).attr("cy", d => d.y);
    manifestoCircles.attr("cx", d => d.x).attr("cy", d => d.y);
    updateLinks();
    updateRays();
}

// Function to update links
function updateLinks() {
    links.attr("x1", d => {
        const source = eventsByName.get(d.source);
        const target = eventsByName.get(d.target);
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const sourceRadius = getCasualtyRadius(source.incident.casualties.total);
        return source.x + (dx * sourceRadius) / distance;
    })
    .attr("y1", d => {
        const source = eventsByName.get(d.source);
        const target = eventsByName.get(d.target);
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const sourceRadius = getCasualtyRadius(source.incident.casualties.total);
        return source.y + (dy * sourceRadius) / distance;
    })
    .attr("x2", d => {
        const source = eventsByName.get(d.source);
        const target = eventsByName.get(d.target);
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const targetRadius = getCasualtyRadius(target.incident.casualties.total);
        return target.x - (dx * (targetRadius + 10)) / distance;
    })
    .attr("y2", d => {
        const source = eventsByName.get(d.source);
        const target = eventsByName.get(d.target);
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const targetRadius = getCasualtyRadius(target.incident.casualties.total);
        return target.y - (dy * (targetRadius + 10)) / distance;
    });
}

// Function to update rays
function updateRays() {
    raysGroup.selectAll(".ray").remove();
    validEvents.forEach(event => {
        const livestreamValue = (event.loneActorData && event.loneActorData.livestream) || event.livestream;
        if (livestreamValue === 'Yes') {
            const radius = getCasualtyRadius(event.incident.casualties.total);
            const allConnections = allConnectionCounts.get(event.perpetrator.name) || 0;
            const circleColor = getConnectionColor(allConnections);
            createRays(raysGroup, event.x, event.y, radius, livestreamValue, circleColor);
        }
    });
}

//------------------
//------------------
//SAVE/RESTORE LAYOUT
//------------------
//------------------

// Function to save current positions
function saveCurrentLayout() {
    validEvents.forEach(event => {
        event.savedX = event.x;
        event.savedY = event.y;
    });
    console.log('Layout saved successfully');
}

//------------------
//------------------
//INITIAL FORCE SCATTER
//------------------
//------------------

let currentSimulation = null;

// Function for scattered layout
function applyScatteredLayout() {

    if (currentLayout === 'scattered') return;
    currentLayout = 'scattered';
    
    // Stop any previous simulations first
    if (currentSimulation) {
        currentSimulation.stop();
    }
    if (collisionSimulation) {
        collisionSimulation.stop();
    }

    const simulation = d3.forceSimulation(validEvents)
        .alphaDecay(0.005)
        .velocityDecay(0.8)
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("charge", d3.forceManyBody().strength(-100))
        .force("collide", d3.forceCollide().radius(d => getCasualtyRadius(d.incident.casualties.total) + 20).strength(0.4))
        .force("radial", d3.forceRadial(200, width / 2, height / 2).strength(0.1))
        .force("x", d3.forceX(width / 2).strength(0.1))
        .force("y", d3.forceY(height / 2).strength(0.1))
        .on("tick", () => {
            updateAllElements();
        });

    simulation.alpha(1).restart();
    currentSimulation = simulation;
}



//------------------
//------------------
//GROUP EVENTS
//------------------
//------------------



// Group events by 5-year periods for clustering

const minYear = d3.min(validEvents, d => d.date.year);
const maxYear = d3.max(validEvents, d => d.date.year);

const eventsByPeriod = new Map();

validEvents.forEach(event => {
    // Calculate periods backwards from maxYear
    const yearsFromMax = maxYear - event.date.year;
    const period = Math.floor(yearsFromMax / 5);
    const endYear = maxYear - period * 5;
    const startYear = endYear - 4; // 5-year span
    const periodKey = `${startYear}-${endYear}`;
    
    if (!eventsByPeriod.has(periodKey)) {
        eventsByPeriod.set(periodKey, []);
    }
    eventsByPeriod.get(periodKey).push(event);
});

const periods = Array.from(eventsByPeriod.keys()).sort();
console.log('Created periods:', periods);

//------------------
//------------------
//CLUSTER EVENTS
//------------------
//------------------

const periodSpacing = isMobile ? 450 : 650;
const largeClusterRadius = isMobile ? 150 : 200;
const mediumClusterRadius = isMobile ? 100 : 120
const smallClusterRadius = isMobile ? 40 : 60;

validEvents.forEach((event, i) => {
  // Calculate periods backwards from maxYear (same as above)
  const yearsFromMax = maxYear - event.date.year;
  const period = Math.floor(yearsFromMax / 5);
  const endYear = maxYear - period * 5;
  const startYear = endYear - 4;
  const periodKey = `${startYear}-${endYear}`;
  const periodIndex = periods.indexOf(periodKey);
    const eventsInPeriod = eventsByPeriod.get(periodKey);
    const eventIndexInPeriod = eventsInPeriod.indexOf(event);
    
    // Choose cluster radius based on number of events
    let clusterRadius;
    if (eventsInPeriod.length >= 20) {
        clusterRadius = largeClusterRadius;
    } else if (eventsInPeriod.length >= 10) {
        clusterRadius = mediumClusterRadius;
    } else {
        clusterRadius = smallClusterRadius;
    }
    
    // Position for this period
    const centerX = width / 2;

//------------------
//------------------
//CLUSTER POSITIONS
//------------------
//------------------

// Calculate cumulative Y position instead of using periodIndex
let cumulativeY = 200; // Starting position

// You'll need to calculate this before the main positioning loop
// First, create an array to store Y positions for each period
const periodYPositions = [];

periods.forEach((periodKey, periodIndex) => {
    const eventsInPeriod = eventsByPeriod.get(periodKey);
    
    if (periodIndex === 0) {
        periodYPositions[periodIndex] = cumulativeY;
    } else {
        // Add spacing based on previous cluster size
        const prevEventsInPeriod = eventsByPeriod.get(periods[periodIndex - 1]);
        let spacing;
        if (prevEventsInPeriod.length >= 20) {
            spacing = periodSpacing;
        } else if (prevEventsInPeriod.length >= 10) {
            spacing = periodSpacing * 0.7;
        } else if (prevEventsInPeriod.length >= 2) {
            spacing = periodSpacing * 0.5;
        } else {
            spacing = periodSpacing * 2;
        }
        cumulativeY += spacing;
        periodYPositions[periodIndex] = cumulativeY;
    }
});

// Then in your main positioning loop, use:
const centerY = periodYPositions[periodIndex];
    
    if (eventsInPeriod.length === 1) {
        event.x = centerX;
        event.y = centerY;
    } else {
        const angle = (eventIndexInPeriod / eventsInPeriod.length) * 2 * Math.PI;
        event.x = centerX + Math.cos(angle) * clusterRadius;
        event.y = centerY + Math.sin(angle) * clusterRadius;
    }
    
    // Add small random scatter
    event.x += (Math.random() - 0.5) * 20;
    event.y += (Math.random() - 0.5) * 20;

    validEvents.forEach(event => {
        event.originalX = event.x;
        event.originalY = event.y;
    });
});



//------------------
//------------------
//ORIGINAL LAYOUT FUNCTION / RESTORE
//------------------
//------------------


function restoreLayout() {
    if (currentLayout === 'restored') return;
    
    // Stop ALL simulations
    if (currentSimulation) {
        currentSimulation.stop();
        currentSimulation = null;
    }
    if (collisionSimulation) {
        collisionSimulation.stop();
    }

    // Hide rays during transition
    raysGroup.transition().duration(200)
        .style("opacity", 0);

    // Reset positions to saved state
    validEvents.forEach(event => {
        if (event.savedX !== undefined && event.savedY !== undefined) {
            event.x = event.savedX;
            event.y = event.savedY;
        }
    });

    // Smoothly transition all visual elements
    eventCircles.transition().duration(1000)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

    manifestoCircles.transition().duration(1000)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

    // Update other elements after transition and show rays again
    setTimeout(() => {
        updateLinks();
        updateRays();
        // Fade rays back in
        raysGroup.transition().duration(500)
            .style("opacity", 1);
    }, 1000);

    currentLayout = 'restored';
    console.log('Layout restored successfully');
}

//------------------
//------------------
//CREATING LINKS
//------------------
//------------------

// Create links first (so they appear behind circles)

const links = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(validConnections)
    .enter()
    .append("line")
    .attr("stroke", "#666")
    .attr("stroke-opacity", 0)
    .attr("stroke-width", 1.5)
    .attr("x1", d => {
        const source = eventsByName.get(d.source);
        const target = eventsByName.get(d.target);
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const sourceRadius = getCasualtyRadius(source.incident.casualties.total);
        return source.x + (dx * sourceRadius) / distance;
    })
    .attr("y1", d => {
        const source = eventsByName.get(d.source);
        const target = eventsByName.get(d.target);
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const sourceRadius = getCasualtyRadius(source.incident.casualties.total);
        return source.y + (dy * sourceRadius) / distance;
    })
    .attr("x2", d => {
        const source = eventsByName.get(d.source);
        const target = eventsByName.get(d.target);
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const targetRadius = getCasualtyRadius(target.incident.casualties.total);
        return target.x - (dx * (targetRadius + 10)) / distance;  // Big gap of 20
    })
    .attr("y2", d => {
        const source = eventsByName.get(d.source);
        const target = eventsByName.get(d.target);
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const targetRadius = getCasualtyRadius(target.incident.casualties.total);
        return target.y - (dy * (targetRadius + 10)) / distance;  // Big gap of 20
    });

//------------------
//------------------
//ZOOM FUNCTION
//------------------
//------------------


    function zoomed(e) {
      const { x, y, k } = e.transform
      svg.attr("transform", "translate(" + x + "," + y + ")" + " scale(" + k + ")")
    }

//------------------
//------------------
//CREATE CIRCLES
//------------------
//------------------

// Create event circles
const eventCircles = svg.selectAll(".event")
    .data(validEvents)
    .enter()
    .append("circle")
    .attr("class", "event")
    .attr("r", d => getCasualtyRadius(d.incident.casualties.total))
    .attr("fill", d => {
        const connections = allConnectionCounts.get(d.perpetrator.name) || 0;
        return getConnectionColor(connections);
    })
    .attr("opacity", 0.8)
    .attr("stroke", "none")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .on("click", function(e, d) {
      d3.select(this).style("fill","red")
      const tgtX = +d3.select(this).attr("cx")
      const tgtY = +d3.select(this).attr("cy")
      const k = 3
      console.log(tgtX,tgtY,k)
      d3.select("svg").transition()
        .call(zoom.transform, d3.zoomIdentity
          .scale(k).translate(-tgtX +((width/k)/2) , -tgtY+((height/k)/2)))}
        )


//------------------
//------------------
//MANIFESTO CIRCLES
//------------------
//------------------

// Add inner concentric circles for manifestos
const manifestoEvents = validEvents.filter(d => {
  const manifestoValue = (d.loneActorData && d.loneActorData.manifesto) || d.manifesto;
  return manifestoValue === 'Yes';
});

const manifestoCircles = svg.selectAll(".manifesto-circle")
  .data(manifestoEvents)
  .enter()
  .append("circle")
  .attr("class", "manifesto-circle")
  .attr("r", d => {
      const outerRadius = getCasualtyRadius(d.incident.casualties.total);
      return Math.max(2, outerRadius * 0.6); // Inner circle is 50% of outer radius
  })
  .attr("fill", "none")
  .attr("stroke", "#FFFFFF")
  .attr("stroke-width", 5)
  .attr("opacity", 0.9)
  .attr("cx", d => d.x)
  .attr("cy", d => d.y);



//------------------
//------------------
//LIVESTREAM RAYS
//------------------
//------------------

// Create rays for livestreamed attacks (behind circles)
const raysGroup = svg.append("g").attr("class", "rays");

validEvents.forEach(event => {
    const livestreamValue = (event.loneActorData && event.loneActorData.livestream) || event.livestream;
    if (livestreamValue === 'Yes') {
        const radius = getCasualtyRadius(event.incident.casualties.total);
        const allConnections = allConnectionCounts.get(event.perpetrator.name) || 0;
        const circleColor = getConnectionColor(allConnections);
        createRays(raysGroup, event.x, event.y, radius, livestreamValue, circleColor);
    }
});

//------------------
//------------------
//TOOLTIP
//------------------
//------------------


// Add tooltip functionality
eventCircles
    .on("mouseover", function(event, d) {
        d3.select(this)
            .transition()
            .duration(200)
            .attr("opacity", 1);

        // Highlight connections
        links.style("stroke-opacity", link => 
            (link.source === d.perpetrator.name || link.target === d.perpetrator.name) ? 0.8 : 0.1
        ).style("stroke-width", link => 
            (link.source === d.perpetrator.name || link.target === d.perpetrator.name) ? 3 : 1.5
        ).attr("marker-end", link => 
        (link.source === d.perpetrator.name || link.target === d.perpetrator.name) ? "url(#arrowhead)" : null
        );

        // Show tooltip
        const dateStr = d.date.full || `${d.date.year || ''}`;
        const allConnections = allConnectionCounts.get(d.perpetrator.name) || 0;
        
        let tooltipContent = `<strong>${d.perpetrator.name}</strong><br>`;
        if (dateStr) tooltipContent += `<strong>Date:</strong> ${dateStr}<br>`;
        if (d.incident.location.formatted) tooltipContent += `<strong>Location:</strong> ${d.incident.location.formatted}<br>`;
        if (d.incident.casualties.total > 0) {
            tooltipContent += `<strong>Casualties:</strong> ${d.incident.casualties.killed} killed, ${d.incident.casualties.injured} injured<br>`;
        }
        if (allConnections > 0) {
            tooltipContent += `<strong>Connections:</strong> ${allConnections}`;
        }

        tooltip.transition()
            .duration(200)
            .style("opacity", 1);
        
        tooltip.html(tooltipContent)
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 10) + "px");
    })
    .on("mouseout", function() {
        d3.select(this)
            .transition()
            .duration(200)
            .attr("opacity", 0.8);
        
        // Reset connection highlighting
        links.style("stroke-opacity", 0)
             .style("stroke-width", 1.5)
            .attr("marker-end", null);

        
        tooltip.transition()
            .duration(300)
            .style("opacity", 0);
    });

console.log('Added interactivity');

//------------------
//------------------
//FORCE SIMULATION
//------------------
//------------------

let collisionSimulation = null;

// Optional: Add a light force simulation to prevent overlaps (accounting for spikes)
collisionSimulation = d3.forceSimulation(validEvents)
    .force("collide", d3.forceCollide().radius(d => {
        const baseRadius = getCasualtyRadius(d.incident.casualties.total);
        const livestreamValue = (d.loneActorData && d.loneActorData.livestream) || d.livestream;
        
        // If it has spikes, add extra space for the spike length
        if (livestreamValue === 'Yes') {
            return baseRadius + 20 + 4; // spike length (8) + buffer (4)
        }
        
        return baseRadius + 3; // just base radius + small buffer
    }).strength(0.5))
    .stop();

// Run simulation briefly to resolve overlaps
for (let i = 0; i < 50; ++i) collisionSimulation.tick();

// Update positions after simulation
eventCircles
    .attr("cx", d => d.x)
    .attr("cy", d => d.y);

manifestoCircles
    .attr("cx", d => d.x)
    .attr("cy", d => d.y);

    d3.select("#visualization").classed("active", true);

//------------------
//------------------
//UPDATE ALL
//------------------
//------------------

updateAllElements();


//------------------
//------------------
//SAVE CURRENT LAYOUT
//------------------
//------------------

saveCurrentLayout();


//------------------
//------------------
//SCROLL-TRIGGERED ZOOM
//------------------
//------------------

// Function to zoom to a specific location
function zoomToLocation(x, y, scale = 2, duration = 1000) {
    d3.select("svg").transition()
        .duration(duration)
        .call(zoom.transform, d3.zoomIdentity
            .scale(scale)
            .translate(-x + (width/scale)/2, -y + (height/scale)/2)
        );
}

// Function to handle each caption step
function handleCaptionStep(stepIndex) {
    switch(stepIndex) {
        case 0:
            // Caption 1: Overview - zoom out to see everything
                removeAllLabels();

                d3.select("svg").transition()
                .duration(1000)
                .call(zoom.transform, d3.zoomIdentity);

            applyScatteredLayout();
                break;

        case 1:
          
            removeAllLabels();
            restoreLayout();
            // applyOriginalLayout();
                break;
        
        case 2:

        
    
        // Focus on Timothy McVeigh (Oklahoma City) 
        const mcveigh = validEvents.find(e => e.perpetrator.name.includes('McVeigh'));
        if (mcveigh) {
                addLabelsToNodes(['McVeigh']);
                zoomToLocation(mcveigh.savedX, mcveigh.savedY, 2.5);
        }
            break;
            
        case 3:
            // Caption 2: Focus on Anders Breivik (highly influential)
            const breivik = validEvents.find(e => e.perpetrator.name.includes('Breivik'));
            if (breivik) {
                addLabelsToNodes(['Breivik']);
                zoomToLocation(breivik.x, breivik.y, 2.5);
            }
            break;
            
        case 4:
            // Caption 3: Focus on Brenton Tarrant (Christchurch shooter)
            const tarrant = validEvents.find(e => e.perpetrator.name.includes('Tarrant'));
            if (tarrant) {
                addLabelsToNodes(['Tarrant']);
                zoomToLocation(tarrant.x, tarrant.y, 2.5);
            }
            break;
            
        case 5:
            // Caption 4: Focus on Payton Gendron
            const gendron = validEvents.find(e => e.perpetrator.name.includes('Gendron'));
            if (gendron) {
                
                zoomToLocation(gendron.x, gendron.y, 2.5);
            }
            break;

        case 6:
            // Caption 4: Focus on Crimo
            const henderson = validEvents.find(e => e.perpetrator.name.includes('Henderson'));
            if (henderson) {
                zoomToLocation(henderson.x, henderson.y, 2.5);
            }
            break;
    }
}

// Scroll handler for Section 4 captions
function handleSection4Scroll() {
    const captions = document.querySelectorAll('#section-4 .caption');
    const viewportMiddle = window.innerHeight / 2;
    
    captions.forEach((caption, index) => {
        const rect = caption.getBoundingClientRect();
        const captionCenter = (rect.top + rect.bottom) / 2;
        const isActive = Math.abs(captionCenter - viewportMiddle) < 200;
        
        if (isActive) {
            handleCaptionStep(index);
        }
    });
}

// Add scroll listener
window.addEventListener('scroll', handleSection4Scroll);


//------------------
//------------------
//LABELS ON SCROLL
//------------------
//------------------


// Function to add labels to specific nodes
function addLabelsToNodes(nodeNames, labelClass = 'caption-label') {
    // Remove existing labels of this class
    svg.selectAll(`.${labelClass}`).remove();
    
    // Add new labels
    nodeNames.forEach(nodeName => {
        const event = validEvents.find(e => e.perpetrator.name.includes(nodeName));
        console.log(`Looking for "${nodeName}":`, event ? 'FOUND' : 'NOT FOUND');
        if (event) {
            console.log(`Adding label for: ${event.perpetrator.name}`);
            svg.append("text")
                .attr("class", labelClass)
                .attr("x", event.x)
                .attr("y", event.y - getCasualtyRadius(event.incident.casualties.total) - 15)
                .attr("text-anchor", "middle")
                .style("font-family", "Arial, sans-serif")
                .style("font-size", "14px")
                .style("font-weight", "bold")
                .style("fill", "#333")
                .style("stroke", "white")
                .style("stroke-width", "2px")
                .style("paint-order", "stroke")
                .text(event.perpetrator.name)
                .style("opacity", 0)
                .transition()
                .duration(500)
                .style("opacity", 1);
        } else {
            // Let's see what names are available
            console.log('Available names containing this term:');
            validEvents.filter(e => e.perpetrator.name.toLowerCase().includes(nodeName.toLowerCase()))
                .forEach(e => console.log(` - ${e.perpetrator.name}`));
        }
    });
}

// Function to remove all caption labels
function removeAllLabels(labelClass = 'caption-label') {
    svg.selectAll(`.${labelClass}`)
        .transition()
        .duration(300)
        .style("opacity", 0)
        .remove();
}

   }
});