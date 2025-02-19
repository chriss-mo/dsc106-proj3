## Visualization Rationale

### Introduction
We used the 'BIG IDEAs Lab Glycemic Variability and Wearable Device Data' focusing on logged foods of 16 different subjects across 10 days.
We asked the questions:
- When do people eat food?
- What do people eat at certain times of the day?

To answer these questions, we created an interactive heatmap that displays meal frequency across different hours of the day. Users can engage with tooltips and nutrition labels to explore the data.

### Features
- Heatmap Visualization - Displays meal frequency by hour of day.
- Interactive Tooltips - Hovering over a section shows extra information.
- Dynamic Nutriton Labels - Clicking a section generates a label summarzing calories, carbs, and popular foods for that time.
- Data Cleaning & Aggregration - Filtered food names and categorized meals. 

### Justification
A heatmap was chosen because is able to show differences in meal frequency across time. The color gradient and color choice draws attention to high activity periods making it easier to see patterns at a glance. Where high activity is colored brighter (yellow) vs lower activity is darker purple color. To aid with our visualization we added a color bar, and a tooltip where hovering over a section shows the day and hour that section represents. 

With our website, we chose to make a simple design that's focal point is the visualization. We chose to use a lighter colors and borders around each section of our website to give some seperation and guidance for the reader. We expect them to look at the top box, then the middle, and finally the last in that order. 

### Interaction
The visualization includes:
- Hover Tooltips: Displays the number of meals, and time of day it takes place at.
- Clickable Sections: Generates a nutrition label summarizing the total calories, carbs, and sugars for the most logged foods at that time.
- Planned but Omitted Features: We considered adding a full-column selection to show the most popular foods within an entire hour but ran out of time :(

### Alternative Visualizations
We had quite a few ideas for our data set like exploring the trends of a specific beverage like coffee, or focusing on a single subjects trends. Some questions we wanted to ask:
- Are people addicted to coffee? 
- What is subject (xx)'s addiction to icecream ?
- What do night time eaters eat? breakfast skippers?  
- Any interesting food combinations? e.g. pickles and ice cream?

While these questions were pretty interesting, the dataset we chose is small and inconsistent leading us to focus on a broader, simpler question: “What are the most popular foods at different times of the day?”

## Development Process

### 1. Data Cleaning & Organization

- Many food entries had inconsistent naming (e.g., “Babybel Cheese” had multiple spellings).
- To address this, we created two new columns:
  - **`food_class`**: Categorized entries as **meals, snacks, or beverages**.
  - **`simplified_foods`**: Grouped similar foods under broader labels (e.g., all coffee-related items became “coffee”).
- Aggregated data to compute average calorie, carb, and sugar content per log entry.
- Because of the data was self reported, there was a lot of manual filtering :(  

### 2. Heatmap Visualization

- Implemented using **D3.js**.
- We made this with the help of online resources like d3-graph-gallery and other tools.
- Figuring out how to add labels to the x and y axis of our visualization took more than one hour haha.  

### 3. Interactive Features
- We started with simple tooltips to display some information which we used the same basic structure as lab 6 (DSC106) for hoverable tooltips and popups. 
- We then added clickable sections which required us to filter and aggregated our data when we read it in from a csv file. 
- Figuring out how to group by in javascript was a big pain. 

### 4. Website & Documentation
- To build our website, I looked at multiple different websites and looked at the developer console to see how other websites built them and came up with a pretty good base design. 
- We took inspiration from xkcd.com website (mainly container design)
- And my all time favorites the [motherfuckingwesbite](https://motherfuckingwebsite.com/) and [The best motherfucking website](https://thebestmotherfucking.website/) (seriously these are amazing)

### Closing
- All in all, between our group we probably spent 30-50 hours on this visualization. 
- The bulk of it was learning and writing d3 code, but another big chunk was processing our data, and doing exploratory data analysis that lead us to our visualization. 

---

### Technologies Used

- D3.js - visualization
- JavaScript & HTML/CSS - web development and styling
- Python & Pandas - data processing

### Future Improvements

- ...

---

Thanks for reading this! A lot of improvements could be made but we had a lot of fun with this one. 

