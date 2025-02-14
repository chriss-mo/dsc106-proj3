async function fetchCSV(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.text();
        const parsedData = d3.csvParse(data);
        return parsedData;
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

function createPieChart(data) {
    const counts = data.reduce((acc, d) => {
        acc[d.time_of_day] = (acc[d.time_of_day] || 0) + 1;
        return acc;
    }, {});

    const pieData = Object.entries(counts).map(([key, value]) => ({ key, value }));

    const radius = Math.min(width, height) / 2;

    const pie = d3.pie()
        .value(d => d.value);

    const arc = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    const color = d3.scaleOrdinal()
        .domain(pieData.map(d => d.key))
        .range(d3.schemeCategory10);

    const pieGroup = svg.append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    const arcs = pieGroup.selectAll(".arc")
        .data(pie(pieData))
        .enter()
        .append("g")
        .attr("class", "arc");

    arcs.append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.key));

    const legend = svg.append("g")
        .attr("transform", `translate(${width - 100},${margin.top})`);

    legend.selectAll("rect")
        .data(pieData)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", (d, i) => i * 20)
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", d => color(d.key));

    legend.selectAll("text")
        .data(pieData)
        .enter()
        .append("text")
        .attr("x", 24)
        .attr("y", (d, i) => i * 20 + 9)
        .attr("dy", "0.35em")
        .text(d => `${d.key}: ${counts[d.key]}`);

    arcs.on("click", function(event, d) {
        d3.selectAll(".arc path").attr("stroke", "none");
        d3.select(this).select("path").attr("stroke", "black").attr("stroke-width", 2);

        legend.selectAll("text").style("font-weight", "normal");
        legend.selectAll("text").filter(textData => textData.key === d.data.key).style("font-weight", "bold");
    });
}

fetchCSV('../src/data/data1.csv').then(data => {
    if (data) {
        // console.log(data);
        createPieChart(data)
    }
});