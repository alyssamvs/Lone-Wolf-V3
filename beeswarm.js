//------------------
//------------------
//SET-UP
//------------------
//------------------

//code from Nicola




//------------------

const isMobile = window.innerWidth < 600;


document.addEventListener('DOMContentLoaded', function() {

// Load the pre-processed data

Promise.all([
  fetch('../Data/processed-combined-dataset.json').then(response => response.json()),
  fetch('../Data/sourcetargetaccel.csv').then(response => response.text())
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


  console.log('Loaded events:', eventsData.length);
console.log('Loaded connections:', connections.length);

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

  let zoom = d3.zoom()
    .on('zoom', zoomed)    
// Create SVG (keep your existing SVG code)
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



//DEBUGGING





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

console.log('Helper functions defined');

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

// Position events in clusters
const periodSpacing = isMobile ? 300 : 400;
const largeClusterRadius = isMobile ? 100 : 140;
const mediumClusterRadius = isMobile ? 70 : 100;
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
    const centerY = (periodIndex * periodSpacing) + 200;
    
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
});

console.log('Positioned all events');

// Debug: Check some position values
console.log('Sample positions:');
validEvents.slice(0, 5).forEach(event => {
    console.log(`${event.perpetrator.name}: x=${event.x}, y=${event.y}, year=${event.date.year}`);
});
console.log(`Width: ${width}, Height: ${height}`);



// Create links first (so they appear behind circles)
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



    function zoomed(e) {
      const { x, y, k } = e.transform
      svg.attr("transform", "translate(" + x + "," + y + ")" + " scale(" + k + ")")
    }

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

console.log('Created visual elements');

//INNER CIRCLES FOR MANIFESTOS 

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
      return Math.max(2, outerRadius * 0.5); // Inner circle is 50% of outer radius
  })
  .attr("fill", "none")
  .attr("stroke", "#FFFFFF")
  .attr("stroke-width", 5)
  .attr("opacity", 0.9)
  .attr("cx", d => d.x)
  .attr("cy", d => d.y);

console.log('Added manifesto circles');

//RAYS FOR LIVESTREAM

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

console.log('Added rays for livestreamed events');

//TOOLTIP

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

//Force Simulation 

// Optional: Add a light force simulation to prevent overlaps (accounting for spikes)
const simulation = d3.forceSimulation(validEvents)
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
for (let i = 0; i < 50; ++i) simulation.tick();

// Update positions after simulation
eventCircles
    .attr("cx", d => d.x)
    .attr("cy", d => d.y);

manifestoCircles
    .attr("cx", d => d.x)
    .attr("cy", d => d.y);



//update lines position 

links
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

// Update rays positions
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

// links
//     .attr("x1", d => eventsByName.get(d.source).x)
//     .attr("y1", d => eventsByName.get(d.source).y)
//     .attr("x2", d => eventsByName.get(d.target).x)
//     .attr("y2", d => eventsByName.get(d.target).y);

   }
});