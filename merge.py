import os
import shutil

# Define the folder paths
road_kaman_folder = "images/road_kaman"
road_pattii_folder = "images/road_pattii"
road_safety_folder = "images/road_safety"

# Ensure the destination folder exists
os.makedirs(road_safety_folder, exist_ok=True)

# Function to get sorted list of files
def get_sorted_files(folder):
    return sorted(os.listdir(folder))

# Copy files from source to destination while maintaining sequence
def copy_files_to_destination(source_folder, destination_folder, start_index):
    for file_name in get_sorted_files(source_folder):
        source_path = os.path.join(source_folder, file_name)
        if os.path.isfile(source_path):
            # Generate new file name with sequence
            new_file_name = f"image{start_index}.JPG"
            destination_path = os.path.join(destination_folder, new_file_name)
            shutil.copy2(source_path, destination_path)
            print(f"Copied {source_path} to {destination_path}")
            start_index += 1
    return start_index

# Start merging files
index = 1
index = copy_files_to_destination(road_kaman_folder, road_safety_folder, index)
index = copy_files_to_destination(road_pattii_folder, road_safety_folder, index)

print("Merging completed!")