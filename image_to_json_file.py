import os
import json

# List of category folders
categories = ['road_safety', 'bridge_work', 'concrete_road', 'new_building']

# Initialize dictionary to store image paths
image_list = {}

# Scan each category folder
for cat in categories:
    folder = f'images/{cat}/'
    # Check if folder exists
    if os.path.exists(folder):
        # Get list of image files (supporting common extensions)
        files = [f'{folder}{f}' for f in os.listdir(folder) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.gif'))]
        image_list[cat] = files
    else:
        # If folder doesn't exist, assign empty list
        image_list[cat] = []

# Write to images.json
with open('images.json', 'w') as f:
    json.dump(image_list, f, indent=4)

print("images.json has been generated successfully.")