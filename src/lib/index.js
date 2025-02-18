async function fetchCSV(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.text();
        const parsedData = d3.csvParse(data, d => ({
            day: +d.day,
            class: d.class,
            hour: +d.hour,
            food: d.simplified_food,
            value: 1 
        }));

        // Aggregate the data to count meals per hour and day
        const groupedData = d3.group(parsedData, d => d.day, d => d.hour);
        const aggregatedData = Array.from(groupedData, ([day, hours]) => 
            Array.from(hours, ([hour, values]) => {
                const foodCounts = d3.rollup(values, v => v.length, d => d.food);
                const mostPopularFoodEntry = Array.from(foodCounts).reduce((a, b) => a[1] > b[1] ? a : b);
                const mostPopularFood = mostPopularFoodEntry[0];
                const count = mostPopularFoodEntry[1];
                return {
                    day: day,
                    hour: hour,
                    value: values.length,
                    food: mostPopularFood,
                    count: count
                }
        })).flat();
        return aggregatedData;
    } catch (error) {
        console.error('Error fetching the CSV data:', error);
    }
}

async function fetchCSV_2(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.text();
        const parsedData = d3.csvParse(data, d => ({
            day: +d.day,
            hour: +d.hour,
            food: d.simplified_food,
            food_class: d.class,  // 'meal', 'snack', or 'beverage'
            calories: +d.calorie,
            total_carb: +d.carb,
            sugar: +d.sugar
        }));

        // Group data by (day, hour)
        const groupedData = d3.group(parsedData, d => `${d.day}-${d.hour}`);

        // Process each (day, hour) group
        const aggregatedData = Array.from(groupedData, ([key, values]) => {
            const [day, hour] = key.split('-').map(Number);

            // Separate foods by class
            const meals = values.filter(d => d.food_class === 'Meal');
            const snacks = values.filter(d => d.food_class === 'Snack');
            const beverages = values.filter(d => d.food_class === 'Beverage');

            // Calculate the sum of calories, carbs, and sugar for each category
            const mealCalories = d3.sum(meals, d => d.calories);
            const mealCarbs = d3.sum(meals, d => d.total_carb);
            const mealSugar = d3.sum(meals, d => d.sugar);

            const snackCalories = d3.sum(snacks, d => d.calories);
            const snackCarbs = d3.sum(snacks, d => d.total_carb);
            const snackSugar = d3.sum(snacks, d => d.sugar);

            const beverageCalories = d3.sum(beverages, d => d.calories);
            const beverageCarbs = d3.sum(beverages, d => d.total_carb);
            const beverageSugar = d3.sum(beverages, d => d.sugar);

            return {
                day,
                hour,
                meal: meals.length > 0 ? meals[0].food : "no info available",
                snack: snacks.length > 0 ? snacks[0].food : "no info available",
                beverage: beverages.length > 0 ? beverages[0].food : "no info available",
                meal_calories: mealCalories,
                meal_total_carb: mealCarbs,
                meal_sugar: mealSugar,
                snack_calories: snackCalories,
                snack_total_carb: snackCarbs,
                snack_sugar: snackSugar,
                beverage_calories: beverageCalories,
                beverage_total_carb: beverageCarbs,
                beverage_sugar: beverageSugar
            };
        });

        return aggregatedData;
    } catch (error) {
        console.error('Error fetching the CSV data:', error);
    }
}

// Set the dimensions and margins of the graph
const margin = {top: 20, right: 30, bottom: 40, left: 40},
    width = 860 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// Append the svg object to the middle-container div
const svg = d3.select("#middle-container")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// reference https://d3-graph-gallery.com/graph/heatmap_style.html
function createChart(data, avgs) {
    
    const hours = d3.range(0, 24);
    const days = d3.range(1, 10); // ranges from 1-10

    // Create scales
    const x = d3.scaleBand()
        .range([0, width-25])
        .domain(hours)
        .padding(0.01);

    const y = d3.scaleBand()
        .range([height, 0])
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
        showTooltip(event, d, avgs); // Ensure tooltip follows cursor
    })
    .on("mouseout", function(d) {
        d3.select(this)
        .style("stroke", "none");  
        
        hideTooltip();
    })
    .on("click", function(event, d) {
        topFoods(d, avgs);
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

    // Add color legend
    const legendHeight = height;
    const legendWidth = 18;

    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width-10}, 0)`);

    const legendScale = d3.scaleLinear()
        .domain(colorScale.domain())
        .range([legendHeight, 0]);

    const legendAxis = d3.axisRight(legendScale)
        .ticks(6);

    legend.append("g")
        .selectAll("rect")
        .data(d3.range(legendHeight))
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", d => d)
        .attr("width", legendWidth)
        .attr("height", 1)
        .style("fill", d => colorScale(legendScale.invert(d)));

    legend.append("g")
        .attr("transform", `translate(${legendWidth},0)`)
        .call(legendAxis);
}

function showTooltip(event, d, d2) {
    d3.select("#tooltip")
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY + 15) + "px")
        .classed("visible", true);

    d3.select("#tooltip-day").text(`Day: ${d.day}`);
    d3.select("#tooltip-hour").text(`Hour: ${d.hour}`)
    d3.select("#tooltip-meals").text(`# of Meals: ${d.value}`);
    d3.select("#tooltip-food").text(`Most Popular Food: ${d.food}`);
    d3.select("#tooltip-count").text(`Food Count: ${d.count}`);

    //Find the snacks and beverages of the day
    if (!d2) {
        // console.error("Data for d2 is undefined or null", d);
        return; // Exit early if d2 is undefined or null
    }
    const day = d.day;
    const hour = d.hour;
    const filtered = d2.filter(d2Item => d2Item.day === day && d2Item.hour === hour);

    if (filtered.length === 0) {
        console.log("No matching data found.");
        return; // Exit early if no data
    }
    // Here is the part we add for snack and beverage
    const filteredItem = filtered[0];  // Filter data for matching day and hour

    if (filteredItem) {
        // Add snack and beverage details if available
        if (filteredItem.snack !== "no info available") {
            d3.select("#tooltip-snack").text(`Snack: ${filteredItem.snack}`);
        } else {
            d3.select("#tooltip-snack").text("Snack: No popular snack at this time");
        }

        if (filteredItem.beverage !== "no info available") {
            d3.select("#tooltip-beverage").text(`Beverage: ${filteredItem.beverage}`);
        } else {
            d3.select("#tooltip-beverage").text("Beverage: No popular beverage at this time");
        }
    } else {
        // If no data is available for this day/hour
        d3.select("#tooltip-snack").text("Snack: No snack at this time");
        d3.select("#tooltip-beverage").text("Beverage: No popular beverage at this time");
    }
}





function hideTooltip() {
    d3.select("#tooltip").classed("visible", false);
}

function topFoods(d, d2) {
    const day = d.day;
    const hour = d.hour;
    const filtered = d2.filter(d2Item => d2Item.day === day && d2Item.hour === hour);

    // Check if any data was found
    if (filtered.length === 0) {
        console.log("No matching data found.");
        return; // Exit early if no data
    }

    // Clear the existing content first
    d3.select("#p-hour-food").html(""); // Clear the food labels
    d3.select("#p-hour-hour").text(`Popular Foods at Hour: ${d.hour} Day: ${d.day}`);
    d3.select("#p-label").text(`*Nutrition based on one average serving`);

    // Function to format each nutrition label
    function createNutritionLabel(foodType, foodName, calories, carbs, sugar) {
        return `
            <div class="nutrition-label">
                <h4>${foodType}:</h4> 
                <h3>${foodName}</h3>
                <p class="entry"><strong><big>Calories </strong> <b>${calories}</b> </big></p>
                <p class="entry"><strong>Carbs </strong> ${carbs}g</p>
                <p class="entry"><strong>Sugar </strong> ${sugar}g</p>
                <br />
            </div>
        `;
    }
    let labelsHTML = "";  // To collect all labels

    // Assuming you want to use the first item in filtered (if it's not empty)
    const filteredItem = filtered[0]; 

    // Check and display Meal information if available
    if (filteredItem.meal !== "no info available") {
        const mealCalories = filteredItem.meal_calories.toFixed(0);
        const mealCarbs = filteredItem.meal_total_carb.toFixed(1);
        const mealSugar = filteredItem.meal_sugar.toFixed(1);

        labelsHTML += createNutritionLabel("Meal", filteredItem.meal, mealCalories, mealCarbs, mealSugar);
    }

    // Check and display Beverage information if available
    if (filteredItem.beverage !== "no info available") {
        const beverageCalories = filteredItem.beverage_calories.toFixed(0);
        const beverageCarbs = filteredItem.beverage_total_carb.toFixed(1);
        const beverageSugar = filteredItem.beverage_sugar.toFixed(1);

        labelsHTML += createNutritionLabel("Beverage", filteredItem.beverage, beverageCalories, beverageCarbs, beverageSugar);
    }

    // Check and display Snack information if available
    if (filteredItem.snack !== "no info available") {
        const snackCalories = filteredItem.snack_calories.toFixed(0);
        const snackCarbs = filteredItem.snack_total_carb.toFixed(1);
        const snackSugar = filteredItem.snack_sugar.toFixed(1);

        labelsHTML += createNutritionLabel("Snack", filteredItem.snack, snackCalories, snackCarbs, snackSugar);
    }

    d3.select("#p-hour-food").html(labelsHTML);
}

async function fetchCSVData() {
    const data1 = await fetchCSV('/src/data/data1.csv');
    const data2 = await fetchCSV_2('/src/data/avg_foods.csv');
    if (data1 && data2) {
        createChart(data1, data2);
    }
}

fetchCSVData();