## Visualization Rationale

### Introduction
(what is our visualization and what it does)

### Features

- 
- 
- 

### Justification (Explaining why we did things)
This visualization aimed to highlight when people eat throughout the day and which foods are most popular at specific times of the day.

A heatmap was chosen because it is able to show differences in meal counts as a series of time where higher counts show a brighter more distinct color drawing attention times with more activity. 

Additionally, the heatmap’s structure made it easy to organize and label data by both day and time.

### Interaction (Explaining why these interactions)
Our primary interactive feature involves displaying information when a user hovers over a section of the heatmap and clickable boxes that shows 

When clicked a nutrition label is created with data on the most popular food items, snacks, and beverages. 

We use the information from the dataset to generate its nutrition facts by aggregating the overall calories, carbs and sugars. 

We considered adding additional interactivity by allowing for full column selection to generate the most popular within a certain hour but that information seemed somewhat redundant and we decided that creating a nutrition label would be more interesting.

### Alternative Visualizations
We had quite a few ideas for our data set like exploring the trends of a specific beverage like coffee, or focusing on a single subjects trends. Some questions we wanted to ask:
- Are people addicted to coffee? 
- What is subject (xx)'s addiction to icecream ?
- What do night time eaters eat? breakfast skippers?  
- Any interesting food combinations? e.g. pickles and ice cream?

While these questions are interesting, our dataset is rather small and inconsistent, which made choosing to focus on a subset of our data hard. We ultimately decided to focus on a broader topic like 'What are popular foods of the hour' 

Some ideas we had were to create a pie chart and group by time of day, like morning, afternoon, night and find popular foods of the hour. 

## Development Process
To map meal counts throughout the day, we used D3 to create the heatmap visualization based on the original data. One significant challenge we encountered was the inconsistency in how foods were logged, particularly with varied spelling and formatting. For example, “Babybel Cheese” was logged in four different ways. As a result, much of our time was spent cleaning and standardizing the data to ensure that meaningful insights could be drawn.

We began by classifying the logged foods into categories like “meals,” “beverages,” or “snacks” in a new column called `food_class`. Next, we simplified food entries into broader categories (called `simplified_foods`), such as grouping all poultry-related foods (chicken, turkey, etc.) under a single label and combining entries like all types of coffee and lattes into a general “coffee” category for beverages. After organizing the data, we aggregated it by `simplified_food` to calculate the average calorie count, carbs (in grams), and sugar (in grams) for a single log entry, assuming each log represented one serving.

Once the data was cleaned, classified, and aggregated, we used it to create interactive heatmap visualizations with D3.

We first began with generating the heatmap visualization in such a way that it was readible and informative to the viewer. After that we got it to display on a website and construted the sections we needed for this project. We then created the code to generate information based on which hour and day combination was clicked. This information would then be displayed in the text section below the visualization. This feature later got upgraded into the nutrition labels that get generated below the heatmap. Once that was completed we began work on generating tooltips when the sections are hovered over. This included a highlight feature that lifts the selected square up along with a label that gives information on the day, hour, number of meals at that time, popular meal, popular snack, and popular beverage. After that we finialized the website by polishing up the titles, contribution sections, and writing the writeup in the readme of our repository.
