## Visualization Rationale

### Visualization
We aimed to highlight how people's eating habits change throughout the day and identify which foods are most popular at specific times. A heatmap was chosen for this visualization because it allows for easy differentiation of higher meal counts with more distinct colors, effectively drawing attention to popular timeframes. Additionally, the heatmap’s structure made it easy to organize and label data by both day and time.

### Alternative Visualizations
Other visualization options were considered during the planning stage. For example, we thought about using a stacked bar chart to track meal counts over the day. However, we ultimately decided that the heatmap would better show meal counts by the hour and day for all participants. We also explored the possibility of visualizing trends specifically for coffee consumption, as it remained consistent among subjects. While some individual coffee trends were interesting, we decided that an overall tracker would offer more useful insights. Additionally, we considered visualizing the differences in eating habits between male and female subjects. However, after further analysis, we determined that focusing on the overall trends of the study would be more beneficial.

### Interaction
Our primary interactive feature involves displaying information when a user hovers over a section of the heatmap. Since the heatmap consists of clickable boxes, we implemented a tooltip feature that provides basic information when the user hovers over a box. When clicked a nutrition label is created with data on the most popular food items, snacks, and beverages. We use the information from the dataset to generate it's nutrition facts by aggregating the overall calories, carbs and proteins. We considered adding additional interactivity by allowing for full column selection to generate the most popular overall but that information seemed somewhat redundant and we decided that creating a nutrion label would be more interesting.

## Overview of Development Process
To map meal counts throughout the day, we used D3 to create the heatmap visualization based on the original data. One significant challenge we encountered was the inconsistency in how foods were logged, particularly with varied spelling and formatting. For example, “Babybel Cheese” was logged in four different ways. As a result, much of our time was spent cleaning and standardizing the data to ensure that meaningful insights could be drawn.

We began by classifying the logged foods into categories like “meals,” “beverages,” or “snacks” in a new column called food_class. Next, we simplified food entries into broader categories (called simplified_foods), such as grouping all poultry-related foods (chicken, turkey, etc.) under a single label. For beverages, we combined entries like all types of coffee and lattes into a general “coffee” category. After organizing the data, we aggregated it by simplified_food to calculate the average calorie count, carbs (in grams), and sugar (in grams) for a single log entry, assuming each log represented one serving.

Once the data was cleaned, classified, and aggregated, we used it to create interactive heatmap visualizations with D3.
