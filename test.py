### This is a quick document to help us manually label foods logged into certain groups to allow us to make visualizations based on the classes.

import pandas as pd
import glob, os
import numpy as np
import re
import seaborn as sns
import matplotlib.pyplot as plt
import plotly.express as px
import plotly.graph_objects as go
import json

entire_dataset = pd.DataFrame()
for i,file in enumerate(glob.glob('./data/*.csv')):
    df_temp = pd.read_csv(file)
    df_temp['subject'] = np.ones(df_temp.shape[0]) * (i+1)
    entire_dataset = pd.concat([entire_dataset, df_temp])

foods = entire_dataset['logged_food'].unique()

food_classes = {}
for i in range(foods.shape[0]):
    food = foods[i]
    label = input(f'{food}: ')
    food_classes[food] = label

filename = "food_classes.json"

with open(filename, 'w') as file:
    json.dump(food_classes, file, indent=4)