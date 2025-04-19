# import os
# import shutil

# # Paths to the source and destination folders
# source_folder = r"D:\dadu\harisai\images\Harisai 2"
# destination_folder = r"D:\dadu\harisai\images\concrete_road"

# # Get the list of existing images in the destination folder
# existing_images = [f for f in os.listdir(destination_folder) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.JPG'))]

# # Determine the next sequence number
# if existing_images:
#     # Extract numbers from filenames like "image1.JPG"
#     existing_numbers = [
#         int(f.split('.')[0].replace('image', '')) for f in existing_images if f.startswith('image') and f.split('.')[0].replace('image', '').isdigit()
#     ]
#     next_number = max(existing_numbers) + 1 if existing_numbers else 1
# else:
#     next_number = 1

# # Get the list of images in the source folder
# source_images = [f for f in os.listdir(source_folder) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]

# # Copy and rename images from the source folder to the destination folder
# for image in source_images:
#     # Construct the new filename
#     new_filename = f"image{next_number}.JPG"
#     source_path = os.path.join(source_folder, image)
#     destination_path = os.path.join(destination_folder, new_filename)

#     # Copy the image
#     shutil.copy(source_path, destination_path)
#     print(f"Copied {image} to {new_filename}")

#     # Increment the sequence number
#     next_number += 1

# print("All images have been copied and renamed successfully.")





# # thiss is the script for the sequencing the images in the folder
import os

# Path to the destination folder where images are copied
destination_folder = r"D:\dadu\harisai\images\concrete_road"

# Get all image files in the destination folder
image_files = [f for f in os.listdir(destination_folder) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]

# Sort the files to ensure consistent renaming
image_files.sort()

# Temporary renaming to avoid conflicts
temp_files = []
for index, image in enumerate(image_files):
    temp_filename = f"temp_{index}.tmp"
    old_path = os.path.join(destination_folder, image)
    temp_path = os.path.join(destination_folder, temp_filename)
    os.rename(old_path, temp_path)
    temp_files.append(temp_filename)

# Rename the files in sequence
sequence_number = 1
for temp_file in temp_files:
    new_filename = f"image{sequence_number}.JPG"
    temp_path = os.path.join(destination_folder, temp_file)
    new_path = os.path.join(destination_folder, new_filename)
    os.rename(temp_path, new_path)
    print(f"Renamed {temp_file} to {new_filename}")
    sequence_number += 1

print("All images have been renamed in sequence successfully.")