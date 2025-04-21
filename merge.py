import os
import hashlib
from PIL import Image
from pathlib import Path

def get_image_hash(file_path):
    """Compute MD5 hash of an image's content."""
    try:
        with Image.open(file_path) as img:
            # Convert to RGB to handle PNG transparency consistently
            img = img.convert('RGB')
            # Get raw pixel data
            img_data = img.tobytes()
            # Compute MD5 hash
            return hashlib.md5(img_data).hexdigest()
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return None

def remove_duplicates_and_rename(folder_path, output_format='jpg'):
    """Remove duplicate images and rename sequentially as image1.jpg, image2.jpg, etc."""
    # Validate folder
    folder = Path(folder_path)
    if not folder.exists() or not folder.is_dir():
        print(f"Error: {folder_path} is not a valid directory")
        return

    # Supported image extensions
    image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp'}
    
    # Dictionary to store hash -> file path
    image_hashes = {}
    
    # Scan folder for images
    print(f"Scanning {folder_path} for images...")
    for file_path in folder.iterdir():
        if file_path.suffix.lower() in image_extensions:
            image_hash = get_image_hash(file_path)
            if image_hash:
                if image_hash in image_hashes:
                    # Duplicate found, delete this file
                    print(f"Removing duplicate: {file_path}")
                    try:
                        file_path.unlink()
                    except Exception as e:
                        print(f"Error deleting {file_path}: {e}")
                else:
                    # Store first occurrence
                    image_hashes[image_hash] = file_path

    # Get list of unique image paths
    unique_images = list(image_hashes.values())
    print(f"Found {len(unique_images)} unique images")

    # Rename images sequentially
    for index, file_path in enumerate(sorted(unique_images), 1):
        new_name = folder / f"image{index}.jpg"
        if file_path != new_name:
            try:
                # Convert to JPG if needed
                if file_path.suffix.lower() != '.jpg':
                    with Image.open(file_path) as img:
                        img = img.convert('RGB')
                        img.save(new_name, 'JPEG', quality=95)
                    print(f"Converted and renamed: {file_path} -> {new_name}")
                    file_path.unlink()  # Remove original
                else:
                    # Just rename
                    file_path.rename(new_name)
                    print(f"Renamed: {file_path} -> {new_name}")
            except Exception as e:
                print(f"Error renaming {file_path} to {new_name}: {e}")

    print(f"Completed! {len(unique_images)} images renamed as image1.jpg, image2.jpg, etc.")

if __name__ == "__main__":
    # Specify your folder path here
    folder_path = r"D:\dadu\harisai\images\road_safety"  # Change to your folder
    remove_duplicates_and_rename(folder_path, output_format='jpg')