//------------------
//------------------
// TIMELINE SETUP
//------------------
//------------------

document.addEventListener('DOMContentLoaded', function() {
    
    // Wait a bit to ensure other scripts have loaded
    setTimeout(initializeTimeline, 1000);
    
});

function initializeTimeline() {
    console.log('Timeline initialization started');
    
    // Load the same data as the network visualization
    Promise.all([
        fetch('./Data/processed-combined-dataset.json').then(response => response.json()),
        fetch('./Data/sourcetargetaccel.csv').then(response => response.text())
    ]).then(([eventsData, csvText]) => {
        
        console.log('Timeline data loaded:', eventsData.length, 'events');
        
        // Parse connections (same as beeswarm.js)
        const lines = csvText.trim().split('\n').slice(1);
        const connections = lines.map(line => {
            if (line.startsWith('"')) {
                const firstQuoteEnd = line.indexOf('"', 1);
                if (firstQuoteEnd !== -1) {
                    const source = line.substring(1, firstQuoteEnd);
                    const remainingLine = line.substring(firstQuoteEnd + 1);
                    const target = remainingLine.replace(/^,\s*/, '').trim().replace(/"/g, '');
                    return { source, target };
                }
            } else {
                const parts = line.split(',');
                if (parts.length >= 2) {
                    const source = parts[0].trim().replace(/"/g, '');
                    const target = parts[1].trim().replace(/"/g, '');
                    return { source, target };
                }
            }
            return null;
        }).filter(conn => conn && conn.source && conn.target);
        
        // Initialize the timeline visualization
        createTimeline(eventsData, connections);
        
    }).catch(error => {
        console.error('Error loading timeline data:', error);
    });
}

function createTimeline(events, connections) {
    console.log('Creating timeline with', events.length, 'events');
    
    // Clear any existing visualization
    d3.select("#timeline-visualization").selectAll("*").remove();
    
    // Setup dimensions
    const container = document.getElementById('timeline-visualization');
    const containerRect = container.getBoundingClientRect();
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const width = containerRect.width - margin.left - margin.right;
    const height = containerRect.height - margin.top - margin.bottom;
    
    // Filter valid events and sort by date
    const validEvents = events.filter(d => d.date && d.date.year)
        .sort((a, b) => {
            if (a.date.year !== b.date.year) return a.date.year - b.date.year;
            if (a.date.month !== b.date.month) return (a.date.month || 0) - (b.date.month || 0);
            return (a.date.day || 0) - (b.date.day || 0);
        });
    
    console.log('Valid timeline events:', validEvents.length);
    
    // Calculate connections (same logic as beeswarm)
    const eventsByName = new Map();
    validEvents.forEach(event => {
        eventsByName.set(event.perpetrator.name, event);
    });
    
    const validConnections = connections.filter(conn => 
        eventsByName.has(conn.source) && eventsByName.has(conn.target)
    );
    
    const allConnectionCounts = new Map();
    validConnections.forEach(conn => {
        allConnectionCounts.set(conn.source, (allConnectionCounts.get(conn.source) || 0) + 1);
        allConnectionCounts.set(conn.target, (allConnectionCounts.get(conn.target) || 0) + 1);
    });
    
    // Store data globally for filtering
    window.timelineData = {
        events: validEvents,
        connections: validConnections,
        connectionCounts: allConnectionCounts,
        eventsByName: eventsByName
    };
    
    // Create the timeline
    drawTimeline(validEvents, allConnectionCounts, width, height, margin);
}

function drawTimeline(events, connectionCounts, width, height, margin) {
    
    // Create SVG
    const svg = d3.select("#timeline-visualization")
        .append("svg")
        .attr("width", (width * 2.5) + margin.left + margin.right) // 2x wider
        .attr("height", height + margin.top + margin.bottom);
    
    // Create main group with zoom/pan capability
    const g = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    // Setup time scale (horizontal axis)
    const minYear = d3.min(events, d => d.date.year);
    const maxYear = d3.max(events, d => d.date.year);
    
    const xScale = d3.scaleLinear()
        .domain([minYear, maxYear])
        .range([0, width * 2.5]); // Make timeline 2x wider


    // Position events vertically to avoid overlaps
    const eventsByYear = d3.group(events, d => d.date.year);
    const maxEventsPerYear = d3.max(Array.from(eventsByYear.values()), d => d.length);
    
    // Create circular clusters for events in the same year
   
        positionEventsInClusters(events, xScale, height / 2);
   
    
    
    
    
        // Add force simulation to prevent overlaps while maintaining year clustering

        const simulation = createForceSimulation(events, xScale, height / 2, getCasualtyRadius);



    
    // Helper functions (same as beeswarm)



    function getConnectionColor(connections) {
        if (connections === 0) return '#3498db';
        if (connections <= 2) return '#f1c40f';
        if (connections <= 5) return '#e67e22';
        if (connections <= 20) return '#e74c3c';
        return '#8b0000';
    }
    
    function getCasualtyRadius(total) {
        return Math.max(8, Math.min(30, 8 + Math.sqrt(total) * 2));
    }
    
    // Add X-axis
    const xAxis = d3.axisBottom(xScale)
        .tickFormat(d => d.toString())
        .ticks(Math.min(10, maxYear - minYear));
    
    g.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis)
        .selectAll("text")
        .style("fill", "white")
        .style("font-size", "12px");
    
    g.select(".x-axis")
        .selectAll("path, line")
        .style("stroke", "white");
    
        console.log('Timeline basic structure created');
    
        // Add zoom and pan functionality
        const zoom = d3.zoom()
            .scaleExtent([0.5, 10])
            .on("zoom", function(event) {
                const { transform } = event;
                g.attr("transform", `translate(${margin.left + transform.x}, ${margin.top + transform.y}) scale(${transform.k})`);
            });
        
        svg.call(zoom);

                // Set initial view to show the right half (recent events)
                const totalWidth = width * 2.5; // Total timeline width
                const viewportWidth = width + margin.left + margin.right; // Visible area width
                const rightHalfStart = totalWidth - viewportWidth; // Position to show right half
                
                // Apply initial transform to show recent events
                svg.call(zoom.transform, d3.zoomIdentity.translate(-rightHalfStart, 0));
                
        
        // Store references for filtering (CREATE THE OBJECT FIRST)
        window.timelineViz = { 
            svg, 
            g, 
            xScale, 
            events, 
            connectionCounts, 
            getConnectionColor, 
            getCasualtyRadius, 
            zoom,
            simulation
        };
        
        // Draw the events
            // Draw the events after simulation settles
    setTimeout(() => {
        drawTimelineEvents();
    }, 2000); // Wait 2 seconds for simulation to settle


}

function drawTimelineEvents() {
    const { svg, g, xScale, events, connectionCounts, getConnectionColor, getCasualtyRadius } = window.timelineViz;
    
    // Create tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "timeline-tooltip")
        .style("position", "absolute")
        .style("background", "rgba(0, 0, 0, 0.9)")
        .style("color", "white")
        .style("padding", "12px")
        .style("border-radius", "6px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .style("z-index", "1000");
    
    // Create rays group (behind circles)
    const raysGroup = g.append("g").attr("class", "timeline-rays");
    
    // Create rays for livestreamed events
    function createTimelineRays(event) {
        const livestreamValue = (event.loneActorData && event.loneActorData.livestream) || event.livestream;
        if (livestreamValue !== 'Yes') return;
        
        const radius = getCasualtyRadius(event.incident.casualties.total);
        const connections = connectionCounts.get(event.perpetrator.name) || 0;
        const color = getConnectionColor(connections);
        const rayCount = 32;
        const rayLength = radius + 15;
        
        for (let i = 0; i < rayCount; i++) {
            const angle = (i * 2 * Math.PI) / rayCount;
            const x1 = event.timelineX + Math.cos(angle) * radius;
            const y1 = event.timelineY + Math.sin(angle) * radius;
            const x2 = event.timelineX + Math.cos(angle) * rayLength;
            const y2 = event.timelineY + Math.sin(angle) * rayLength;
            
            raysGroup.append("line")
                .attr("x1", x1)
                .attr("y1", y1)
                .attr("x2", x2)
                .attr("y2", y2)
                .attr("stroke", color)
                .attr("stroke-width", 1)
                .attr("opacity", 0.7)
                .attr("class", "timeline-ray");
        }
    }
    
    // Draw rays for all livestreamed events
    events.forEach(createTimelineRays);
    
    // Create event circles
    const eventCircles = g.selectAll(".timeline-event")
        .data(events)
        .enter()
        .append("circle")
        .attr("class", "timeline-event")
        .attr("cx", d => d.timelineX)
        .attr("cy", d => d.timelineY)
        .attr("r", d => getCasualtyRadius(d.incident.casualties.total))
        .attr("fill", d => {
            const connections = connectionCounts.get(d.perpetrator.name) || 0;
            return getConnectionColor(connections);
        })
        .attr("opacity", 0.8)
        .attr("stroke", "white")
        .attr("stroke-width", 0);
    
    console.log('Timeline events drawn:', events.length);
    
    // Store for filtering
    window.timelineViz.eventCircles = eventCircles;
    window.timelineViz.raysGroup = raysGroup;
    window.timelineViz.tooltip = tooltip;

    // Add manifesto indicators (inner circles)
    const manifestoEvents = events.filter(d => {
        const manifestoValue = (d.loneActorData && d.loneActorData.manifesto) || d.manifesto;
        return manifestoValue === 'Yes';
    });
    
    const manifestoCircles = g.selectAll(".timeline-manifesto")
        .data(manifestoEvents)
        .enter()
        .append("circle")
        .attr("class", "timeline-manifesto")
        .attr("cx", d => d.timelineX)
        .attr("cy", d => d.timelineY)
        .attr("r", d => {
            const outerRadius = getCasualtyRadius(d.incident.casualties.total);
            return Math.max(3, outerRadius * 0.6);
        })
        .attr("fill", "none")
        .attr("stroke", "#FFFFFF")
        .attr("stroke-width", 3)
        .attr("opacity", 0.9);
    
    // Add tooltip functionality
    eventCircles
        .on("mouseover", function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("opacity", 1)
                .attr("stroke-width", 3);
            
            const connections = connectionCounts.get(d.perpetrator.name) || 0;
            const dateStr = d.date.full || `${d.date.year || ''}`;
            const livestreamValue = (d.loneActorData && d.loneActorData.livestream) || d.livestream;
            const manifestoValue = (d.loneActorData && d.loneActorData.manifesto) || d.manifesto;
            
            let tooltipContent = `<strong>${d.perpetrator.name}</strong><br>`;
            if (dateStr) tooltipContent += `<strong>Date:</strong> ${dateStr}<br>`;
            if (d.incident.location.formatted) tooltipContent += `<strong>Location:</strong> ${d.incident.location.formatted}<br>`;
            if (d.incident.casualties.total > 0) {
                tooltipContent += `<strong>Casualties:</strong> ${d.incident.casualties.killed} killed, ${d.incident.casualties.injured} injured<br>`;
            }
            if (connections > 0) {
                tooltipContent += `<strong>Connections:</strong> ${connections}<br>`;
            }
            if (livestreamValue === 'Yes') {
                tooltipContent += `<strong>Livestreamed:</strong> Yes<br>`;
            }
            if (manifestoValue === 'Yes') {
                tooltipContent += `<strong>Manifesto:</strong> Yes`;
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
                .attr("opacity", 0.8)
                .attr("stroke-width", 1);
            
            tooltip.transition()
                .duration(300)
                .style("opacity", 0);
        });

    console.log('Timeline events drawn:', events.length);
    
    // Store for filtering
    window.timelineViz.eventCircles = eventCircles;
    window.timelineViz.manifestoCircles = manifestoCircles;
    window.timelineViz.raysGroup = raysGroup;
    window.timelineViz.tooltip = tooltip;
}

//------------------
//------------------
// FILTER FUNCTIONALITY
//------------------
//------------------

// Initialize filter controls
function initializeFilterControls() {
    // Update display values when sliders change
    document.getElementById('start-year').addEventListener('input', function() {
        document.getElementById('start-year-display').textContent = this.value;
    });
    
    document.getElementById('end-year').addEventListener('input', function() {
        document.getElementById('end-year-display').textContent = this.value;
    });
    
    document.getElementById('casualties-slider').addEventListener('input', function() {
        document.getElementById('casualties-display').textContent = this.value;
    });
    
    document.getElementById('connections-slider').addEventListener('input', function() {
        document.getElementById('connections-display').textContent = this.value;
    });

    document.getElementById('connections-slider').addEventListener('input', function() {
        document.getElementById('connections-display').textContent = this.value;
    });
    
    // Time stretch slider
    document.getElementById('time-stretch-slider').addEventListener('input', function() {
        const value = parseFloat(this.value);
        document.getElementById('time-stretch-display').textContent = value + 'x';
        updateTimelineStretch(value);
    });
    
    
    // Apply filters button
    document.getElementById('apply-filters').addEventListener('click', applyTimelineFilters);
    
    // Reset filters button
    document.getElementById('reset-filters').addEventListener('click', resetTimelineFilters);
}

// Apply all active filters
function applyTimelineFilters() {
    console.log('Applying timeline filters...');
    
    if (!window.timelineData) {
        console.error('No timeline data available for filtering');
        return;
    }
    
    const startYear = parseInt(document.getElementById('start-year').value);
    const endYear = parseInt(document.getElementById('end-year').value);
    const minCasualties = parseInt(document.getElementById('casualties-slider').value);
    const minConnections = parseInt(document.getElementById('connections-slider').value);
    
    const showLivestream = document.getElementById('filter-livestream').checked;
    const showManifesto = document.getElementById('filter-manifesto').checked;
    const showNeither = document.getElementById('filter-neither').checked;
    
    // Filter the original data
    const filteredEvents = window.timelineData.events.filter(event => {
        // Date filter
        if (event.date.year < startYear || event.date.year > endYear) return false;
        
        // Casualties filter
        if (event.incident.casualties.total < minCasualties) return false;
        
        // Connections filter
        const connections = window.timelineData.connectionCounts.get(event.perpetrator.name) || 0;
        if (connections < minConnections) return false;
        
        // Special characteristics filter
        const livestreamValue = (event.loneActorData && event.loneActorData.livestream) || event.livestream;
        const manifestoValue = (event.loneActorData && event.loneActorData.manifesto) || event.manifesto;
        const hasLivestream = livestreamValue === 'Yes';
        const hasManifesto = manifestoValue === 'Yes';
        const hasNeither = !hasLivestream && !hasManifesto;
        
        if (hasLivestream && !showLivestream) return false;
        if (hasManifesto && !showManifesto) return false;
        if (hasNeither && !showNeither) return false;
        
        return true;
    });
    
    console.log(`Filtered to ${filteredEvents.length} events from ${window.timelineData.events.length}`);
    
    // Redraw timeline with filtered data
    redrawTimelineWithFilteredData(filteredEvents);
}

// Reset all filters to default values
function resetTimelineFilters() {
    document.getElementById('start-year').value = 1978;
    document.getElementById('end-year').value = 2025;
    document.getElementById('casualties-slider').value = 0;
    document.getElementById('connections-slider').value = 0;
    
    document.getElementById('filter-livestream').checked = true;
    document.getElementById('filter-manifesto').checked = true;
    document.getElementById('filter-neither').checked = true;
    
    // Update displays
    document.getElementById('start-year-display').textContent = '1978';
    document.getElementById('end-year-display').textContent = '2025';
    document.getElementById('casualties-display').textContent = '0';
    document.getElementById('connections-display').textContent = '0';
    
    // Show all data
    if (window.timelineData) {
        redrawTimelineWithFilteredData(window.timelineData.events);
    }
}

// Redraw timeline with filtered data
function redrawTimelineWithFilteredData(filteredEvents) {
    console.log('Redrawing timeline with', filteredEvents.length, 'events');
    
    if (!window.timelineViz) {
        console.error('Timeline visualization not initialized');
        return;
    }
    
    const { svg, g, xScale, connectionCounts, getConnectionColor, getCasualtyRadius } = window.timelineViz;
    
    // Recalculate positions for filtered events
    // Reposition events using circular clustering
    positionEventsInClusters(filteredEvents, xScale, 300);
    
    // Create new force simulation for filtered data
    if (window.timelineViz.simulation) {
        window.timelineViz.simulation.stop();
    }
    
    const newSimulation = createForceSimulation(filteredEvents, xScale, 300, getCasualtyRadius);
    window.timelineViz.simulation = newSimulation;
    
    // Update the events reference in timelineViz for the simulation
    window.timelineViz.events = filteredEvents;
    
    // Clear existing elements
    g.selectAll(".timeline-event").remove();
    g.selectAll(".timeline-manifesto").remove();
    g.selectAll(".timeline-rays").selectAll("*").remove();
    
    // Redraw rays
    function createTimelineRays(event) {
        const livestreamValue = (event.loneActorData && event.loneActorData.livestream) || event.livestream;
        if (livestreamValue !== 'Yes') return;
        
        const radius = getCasualtyRadius(event.incident.casualties.total);
        const connections = connectionCounts.get(event.perpetrator.name) || 0;
        const color = getConnectionColor(connections);
        const rayCount = 32;
        const rayLength = radius + 15;
        
        for (let i = 0; i < rayCount; i++) {
            const angle = (i * 2 * Math.PI) / rayCount;
            const x1 = event.timelineX + Math.cos(angle) * radius;
            const y1 = event.timelineY + Math.sin(angle) * radius;
            const x2 = event.timelineX + Math.cos(angle) * rayLength;
            const y2 = event.timelineY + Math.sin(angle) * rayLength;
            
            window.timelineViz.raysGroup.append("line")
                .attr("x1", x1)
                .attr("y1", y1)
                .attr("x2", x2)
                .attr("y2", y2)
                .attr("stroke", color)
                .attr("stroke-width", 1)
                .attr("opacity", 0.7)
                .attr("class", "timeline-ray");
        }
    }
    
    // Draw rays for filtered events
    filteredEvents.forEach(createTimelineRays);
    
    // Redraw event circles
 // Redraw event circles
    const eventCircles = g.selectAll(".timeline-event")
    .data(filteredEvents)
    .enter()
    .append("circle")
    .attr("class", "timeline-event")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", d => getCasualtyRadius(d.incident.casualties.total))
    .attr("fill", d => {
        const connections = connectionCounts.get(d.perpetrator.name) || 0;
        return getConnectionColor(connections);
    })
    .attr("opacity", 0.8)
    .attr("stroke", "white")
    .attr("stroke-width", 0);
        
    // Redraw manifesto indicators
    const manifestoEvents = filteredEvents.filter(d => {
        const manifestoValue = (d.loneActorData && d.loneActorData.manifesto) || d.manifesto;
        return manifestoValue === 'Yes';
    });
    
    const manifestoCircles = g.selectAll(".timeline-manifesto")
        .data(manifestoEvents)
        .enter()
        .append("circle")
        .attr("class", "timeline-manifesto")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", d => {
            const outerRadius = getCasualtyRadius(d.incident.casualties.total);
            return Math.max(3, outerRadius * 0.6);
        })
        .attr("fill", "none")
        .attr("stroke", "#FFFFFF")
        .attr("stroke-width", 3)
        .attr("opacity", 0.9);
    
    // Re-add tooltip functionality (reuse from original)
    eventCircles
        .on("mouseover", function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("opacity", 1)
                .attr("stroke-width", 3);
            
            const connections = connectionCounts.get(d.perpetrator.name) || 0;
            const dateStr = d.date.full || `${d.date.year || ''}`;
            const livestreamValue = (d.loneActorData && d.loneActorData.livestream) || d.livestream;
            const manifestoValue = (d.loneActorData && d.loneActorData.manifesto) || d.manifesto;
            
            let tooltipContent = `<strong>${d.perpetrator.name}</strong><br>`;
            if (dateStr) tooltipContent += `<strong>Date:</strong> ${dateStr}<br>`;
            if (d.incident.location.formatted) tooltipContent += `<strong>Location:</strong> ${d.incident.location.formatted}<br>`;
            if (d.incident.casualties.total > 0) {
                tooltipContent += `<strong>Casualties:</strong> ${d.incident.casualties.killed} killed, ${d.incident.casualties.injured} injured<br>`;
            }
            if (connections > 0) {
                tooltipContent += `<strong>Connections:</strong> ${connections}<br>`;
            }
            if (livestreamValue === 'Yes') {
                tooltipContent += `<strong>Livestreamed:</strong> Yes<br>`;
            }
            if (manifestoValue === 'Yes') {
                tooltipContent += `<strong>Manifesto:</strong> Yes`;
            }
            
            window.timelineViz.tooltip.transition()
                .duration(200)
                .style("opacity", 1);
            
            window.timelineViz.tooltip.html(tooltipContent)
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function() {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("opacity", 0.8)
                .attr("stroke-width", 0);
            
            window.timelineViz.tooltip.transition()
                .duration(300)
                .style("opacity", 0);
        });
    
    console.log('Timeline redrawn with', filteredEvents.length, 'events');

        // Update stored references for the simulation to work properly
        window.timelineViz.eventCircles = eventCircles;
        window.timelineViz.manifestoCircles = manifestoCircles;
    
}

// Call this after timeline is created
setTimeout(() => {
    if (document.getElementById('start-year')) {
        initializeFilterControls();
    }
}, 2000);

//-----------------
//------------------
// REUSABLE POSITIONING & SIMULATION
//------------------
//------------------

// Position events in circular clusters around their year
function positionEventsInClusters(events, xScale, centerY = 300) {
    const eventsByYear = d3.group(events, d => d.date.year);
    
    events.forEach(event => {
        const eventsInYear = eventsByYear.get(event.date.year);
        const indexInYear = eventsInYear.indexOf(event);
        const totalInYear = eventsInYear.length;
        
        // Central point for this year
        const centerX = xScale(event.date.year);
        
        if (totalInYear === 1) {
            // Single event - place at center
            event.timelineX = centerX;
            event.timelineY = centerY;
        } else {
            // Multiple events - arrange in circle around center
            const clusterRadius = Math.min(80, 30 + totalInYear * 8);
            const angle = (indexInYear / totalInYear) * 2 * Math.PI;
            
            event.timelineX = centerX + Math.cos(angle) * clusterRadius;
            event.timelineY = centerY + Math.sin(angle) * clusterRadius;
        }
        
        // Set initial positions for simulation
        event.x = event.timelineX;
        event.y = event.timelineY;
    });
}

//function force simulation

function createForceSimulation(events, xScale, centerY = 300, getCasualtyRadius) {
    // Stop existing simulation
    if (window.timelineViz && window.timelineViz.simulation) {
        window.timelineViz.simulation.stop();
    }
    
    const simulation = d3.forceSimulation(events)
        .force("x", d3.forceX(d => xScale(d.date.year)).strength(0.8))
        .force("y", d3.forceY(centerY).strength(0.3))
        .force("collide", d3.forceCollide().radius(d => {
            const radius = getCasualtyRadius(d.incident.casualties.total);
            const livestreamValue = (d.loneActorData && d.loneActorData.livestream) || d.livestream;
            return livestreamValue === 'Yes' ? radius + 20 : radius + 5;
        }).strength(0.7))
        .alphaDecay(0.02)
        .on("tick", updateVisualizationDuringSimulation);
    
    // Store the simulation
    if (window.timelineViz) {
        window.timelineViz.simulation = simulation;
    }
    
    return simulation;
}

// Update visual elements during simulation
function updateVisualizationDuringSimulation() {
    if (window.timelineViz && window.timelineViz.eventCircles) {
        window.timelineViz.eventCircles
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
            
        if (window.timelineViz.manifestoCircles) {
            window.timelineViz.manifestoCircles
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
        }
        
        // Update rays efficiently
        updateRaysDuringSimulation();
    }
}

// Update rays during simulation
function updateRaysDuringSimulation() {
    if (!window.timelineViz || !window.timelineViz.raysGroup) return;
    
    window.timelineViz.raysGroup.selectAll(".timeline-ray").remove();
    
    window.timelineViz.events.forEach(event => {
        const livestreamValue = (event.loneActorData && event.loneActorData.livestream) || event.livestream;
        if (livestreamValue === 'Yes') {
            const radius = window.timelineViz.getCasualtyRadius(event.incident.casualties.total);
            const connections = window.timelineViz.connectionCounts.get(event.perpetrator.name) || 0;
            const color = window.timelineViz.getConnectionColor(connections);
            const rayCount = 32;
            const rayLength = radius + 15;
            
            for (let i = 0; i < rayCount; i++) {
                const angle = (i * 2 * Math.PI) / rayCount;
                const x1 = event.x + Math.cos(angle) * radius;
                const y1 = event.y + Math.sin(angle) * radius;
                const x2 = event.x + Math.cos(angle) * rayLength;
                const y2 = event.y + Math.sin(angle) * rayLength;
                
                window.timelineViz.raysGroup.append("line")
                    .attr("x1", x1)
                    .attr("y1", y1)
                    .attr("x2", x2)
                    .attr("y2", y2)
                    .attr("stroke", color)
                    .attr("stroke-width", 1)
                    .attr("opacity", 0.7)
                    .attr("class", "timeline-ray");
            }
        }
    });
}

// Update timeline stretch based on slider value
function updateTimelineStretch(stretchFactor) {
    console.log('Updating timeline stretch to', stretchFactor + 'x');
    
    if (!window.timelineViz) {
        console.error('Timeline not initialized');
        return;
    }
    
    const { events, xScale, g } = window.timelineViz;
    const currentDomain = xScale.domain();
    const currentRange = xScale.range();
    
    // Calculate new range based on stretch factor
    const baseWidth = currentRange[1] / 2.5; // Original width before our 2.5x multiplier
    const newWidth = baseWidth * stretchFactor;
    
    // Update the x scale range
    const newXScale = d3.scaleLinear()
        .domain(currentDomain)
        .range([0, newWidth]);
    
    // Update the stored scale
    window.timelineViz.xScale = newXScale;
    
    // Reposition events with new scale
    positionEventsInClusters(events, newXScale, 300);
    
    // Restart force simulation with new positions
    if (window.timelineViz.simulation) {
        window.timelineViz.simulation.stop();
    }
    
    const newSimulation = createForceSimulation(events, newXScale, 300, window.timelineViz.getCasualtyRadius);
    window.timelineViz.simulation = newSimulation;
    
    // Update the x-axis
    const newXAxis = d3.axisBottom(newXScale)
        .tickFormat(d => d.toString())
        .ticks(Math.min(15, currentDomain[1] - currentDomain[0]));
    
    g.select(".x-axis")
        .transition()
        .duration(500)
        .call(newXAxis);
    
    console.log('Timeline stretch updated');
    // After stretching, re-center on recent events
    const newTotalWidth = newWidth;
    const viewportWidth = window.timelineViz.svg.node().getBoundingClientRect().width;
    const newRightHalfStart = newTotalWidth - viewportWidth;
    
    // Apply transform to keep showing recent events
    setTimeout(() => {
        window.timelineViz.svg.transition()
            .duration(500)
            .call(window.timelineViz.zoom.transform, 
                d3.zoomIdentity.translate(-newRightHalfStart, 0));
    }, 100);

}

// Call this after timeline is created