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
            
        // aggregate by hour for the most popular foods of the hour
        const groupedByHour = d3.group(parsedData, d => d.hour);
        const aggregatedByHour = Array.from(groupedByHour, ([hour, values]) => {
            const foodCounts = d3.rollup(values, v => v.length, d => d.food); // very intersting way to count (I didn't know this)
            const mostPopularFoodEntry = Array.from(foodCounts).reduce((a, b) => a[1] > b[1] ? a : b);
            const mostPopularFood = mostPopularFoodEntry[0];
            const count = mostPopularFoodEntry[1];
            return {
                hour: hour,
                value: values.length,
                food: mostPopularFood,
                count: count
            }
        });
        return { aggregatedData, aggregatedByHour };
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
function createChart(data, datahour, avgs) {
    
    const hours = d3.range(0, 24);
    const days = d3.range(1, 10); // ranges from 1-10

    // Create scales
    const x = d3.scaleBand()
        .range([0, width])
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
        showTooltip(event, d); // Ensure tooltip follows cursor
    })
    .on("mouseout", function(d) {
        d3.select(this)
        .style("stroke", "none");  
        
        hideTooltip();
    })
    .on("click", function(event, d) {
        topFoods_2(d, avgs);
    });

    // svg.selectAll()
    // .data(avgs, function(d) { return d.day+':'+d.hour; })
    // .enter()
    // .append("rect")
    // .attr("x", function(d) { return x(d.hour) })
    // .attr("y", function(d) { return y(d.day) })
    // .attr("width", x.bandwidth() )
    // .attr("height", y.bandwidth() )
    // .on("click", function(event, d) {
    //     topFoods_2(d);
    // });


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


function showTooltip(event, d) {
    d3.select("#tooltip")
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY + 15) + "px")
        .classed("visible", true); // make a class 'visible' that sets opacity pretty genius

    d3.select("#tooltip-meals").text(`Meals: ${d.value}`);
    d3.select("#tooltip-count").text(`Food Count: ${d.count}`);
    d3.select("#tooltip-food").text(`Food: ${d.food}`);
}
function hideTooltip() {
    d3.select("#tooltip").classed("visible", false);
}

function topFoods(d, datahour) {
    const hourData = datahour.find(h => h.hour === d.hour);
    if (hourData) {
        d3.select("#p-hour-food").text(`Most Popular Food (Hour): ${hourData.food}`);
        d3.select("#p-hour-count").text(`Count: ${hourData.count}`);
    }
}

function showTooltip_2(event, d, f) {
    // console.log("Tooltip Data:", d);  // Debugging line

    d3.select("#tooltip")
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY + 15) + "px")
        .classed("visible", true);

    d3.select("#tooltip-count").text(`Food Count: ${f.count}`);
    d3.select("#tooltip-meal").text(`Meal: ${d.meal || "no info available"}`);
    d3.select("#tooltip-snack").text(`Snack: ${d.snack || "no info available"}`);
    d3.select("#tooltip-beverage").text(`Beverage: ${d.beverage || "no info available"}`);
    d3.select("#tooltip-calories").text(`Avg Calories: ${(d.average_calories || 0).toFixed(1)}`);
    d3.select("#tooltip-carb").text(`Total Carbs: ${(d.total_carb || 0).toFixed(1)}g`);
    d3.select("#tooltip-sugar").text(`Sugar: ${(d.sugar || 0).toFixed(1)}g`);
    d3.select("#tooltip-image").attr("src", `../src/img/coffee.jpg`);
}

async function fetchCSVData() {
    const { aggregatedData: data1_1, aggregatedByHour: data1_2 } = await fetchCSV('../src/data/data1.csv');
    const data2 = await fetchCSV_2('../src/data/avg_foods.csv');
    if (data1_1 && data2) {
        // console.log('hooray!');
        createChart(data1_1, data1_2, data2);
    }
}

function topFoods_2(d, d2) {
    // console.log(d);
    const day = d.day;
    const hour = d.hour;
    const filtered = d2.filter(d2Item => d2Item.day === day && d2Item.hour === hour);

    // Check if any data was found
    if (filtered.length === 0) {
        console.log("No matching data found.");
        return; // Exit early if no data
    }

    // console.log(filtered);

    // Clear the existing content first
    d3.select("#p-hour-food").html("");

    // Function to format each nutrition label
    function createNutritionLabel(foodType, foodName, calories, carbs, sugar) {
        return `
            <div class="nutrition-label">
                <h3>${foodType}: ${foodName}</h3>
                <p class="entry"><strong><big>Calories </strong> <b>${calories}</b> </big></p>
                <p class="entry"><strong>Carbs </strong> ${carbs}g</p>
                <p class="entry"><strong>Sugar </strong> ${sugar}g</p>
                <br />
                <p><i><small>Nutrition is for 1 average serving</small></i></p>
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

        labelsHTML += createNutritionLabel("Most Popular Meal", filteredItem.meal, mealCalories, mealCarbs, mealSugar);
    }

    // Check and display Beverage information if available
    if (filteredItem.beverage !== "no info available") {
        const beverageCalories = filteredItem.beverage_calories.toFixed(0);
        const beverageCarbs = filteredItem.beverage_total_carb.toFixed(1);
        const beverageSugar = filteredItem.beverage_sugar.toFixed(1);

        labelsHTML += createNutritionLabel("Most Popular Beverage", filteredItem.beverage, beverageCalories, beverageCarbs, beverageSugar);
    }

    // Check and display Snack information if available
    if (filteredItem.snack !== "no info available") {
        const snackCalories = filteredItem.snack_calories.toFixed(0);
        const snackCarbs = filteredItem.snack_total_carb.toFixed(1);
        const snackSugar = filteredItem.snack_sugar.toFixed(1);

        labelsHTML += createNutritionLabel("Most Popular Snack", filteredItem.snack, snackCalories, snackCarbs, snackSugar);
    }


    d3.select("#p-hour-food").html(labelsHTML);
}


fetchCSVData();