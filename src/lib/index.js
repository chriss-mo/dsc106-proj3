async function fetchCSV(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.text();
        const parsedData = d3.csvParse(data, d => ({
            day: +d.day,
            hour: +d.hour,
            value: 1 // Each row represents one meal
        }));

        // Aggregate the data to count meals per hour and day
        const groupedData = d3.group(parsedData, d => d.day, d => d.hour);
        const aggregatedData = Array.from(groupedData, ([day, hours]) => 
            Array.from(hours, ([hour, values]) => ({
                day: day,
                hour: hour,
                value: values.length
            }))
        ).flat();

        return aggregatedData;
    } catch (error) {
        console.error('Error fetching the CSV data:', error);
    }
}

// Set the dimensions and margins of the graph
const margin = {top: 20, right: 30, bottom: 40, left: 40},
    width = 850 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// Append the svg object to the middle-container div
const svg = d3.select("#middle-container")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// reference https://d3-graph-gallery.com/graph/heatmap_style.html
function createChart(data) {
    
    const hours = d3.range(0, 24);
    const days = d3.range(1, 10); // ranges from 1-10

    // Create scales
    const x = d3.scaleBand()
        .range([0, width])
        .domain(hours)
        .padding(0.01);

    const y = d3.scaleBand()
        .range([height, 0]) // 'flip' the y axis 
        .domain(days)
        .padding(0.01);

    const colorScale = d3.scaleSequential(d3.interpolateViridis) 
        .domain([0, d3.max(data, d => d.value)]); // change color here

    // Append rectangles
    svg.selectAll()
    .data(data, function(d) { return d.day+':'+d.hour; })
    .enter()
    .append("rect")
    .attr("x", function(d) { return x(d.hour) })
    .attr("y", function(d) { return y(d.day) })
    .attr("width", x.bandwidth() )
    .attr("height", y.bandwidth() )
    .style("fill", function(d) { return colorScale(d.value)} )
    .on("mouseover", function(event, d) {
        d3.select(this)
        .style("stroke", "black")  // Add border
        .style("stroke-width", "2");
        
        showTooltip(event, d);
    })
    .on("mousemove", function(event, d) {
        showTooltip(event, d); // Ensure tooltip follows cursor
    })
    .on("mouseout", function(d) {
        d3.select(this)
        .style("stroke", "none");  
        
        hideTooltip();
    });
    // reference: http://www.d3noob.org/2016/10/adding-axis-labels-in-d3js-v4.html
    svg.append("g") // Add the X Axis
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // text label for the x axis
    svg.append("text")             
        .attr("transform",
            "translate(" + (width/2) + " ," + 
            (height + margin.top + 15) + ")")
        .style("text-anchor", "middle")
        .text("Hour of Day");
    
    svg.append("g") // Add the Y Axis
        .call(d3.axisLeft(y));
    
        // text label for the y axis
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Day"); 
}

fetchCSV('../src/data/data1.csv').then(data => {
    if (data) {
        createChart(data);
    }
});

function showTooltip(event, d) {
    d3.select("#tooltip")
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY + 15) + "px")
        .classed("visible", true); // make a class 'visible' that sets opacity pretty genius

    d3.select("#tooltip-day").text(`Day: ${d.day}`);
    d3.select("#tooltip-hour").text(`Hour: ${d.hour}`);
    d3.select("#tooltip-meals").text(`Meals: ${d.value}`);
}
function hideTooltip() {
    d3.select("#tooltip").classed("visible", false);
}