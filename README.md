## Visualization Rational  
We wanted to highlight how people's eating habits change over the course of a day, and which foods are the most popular at a certain time. 
We decided on a heatmap to visualize the data, since a higher count of meals would be a more distinct color for a certain timeframe and would 
draw the user's attention to those entries. We also considered doing a stacked bar chart to show the trends of the counts over the course of 
a day, but we ended up opting for the heatmap to show the counts of meals for each hour and day of the study among all participants. Another 
idea we were considering was showing the difference in eating habits of male and female subject subjects, but we decided that observing the 
trends of the study as a whole were more useful after exploring the data furhter.  
  
## Overview of Development Process  
To map the counts of meals throughout the day, we used D3 to create the heatmap of the original data. 
One main issue in making our visualization is that much of the entries for `logged_food` had lots of variation in spelling and formatting.
For example, there were 4 unique ways that subjects logged Babybel Cheese. As such, much of our time was spent engineering our data to provide
meaningful information to the user of the visualizer.  
We began by classifying foods logged as "meals," "beverages," or "snacks" as the column `food_class` to denote the type of food a subject logged 
in a certain time of day. From there, we further simplified the entries into more general classes (called `simplified_foods`) such as "poultry" 
for chicken and turkey products and "coffee" for all coffees and lattes to group similar foods with each other. We then aggregated by `simplified_food` 
to find the average calorie count, carbs (in grams), and sugar (in grams) of a single log of the food, assuming that each log entry was a single serving.  
