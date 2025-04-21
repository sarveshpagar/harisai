import json
import os
from flask import Flask, jsonify
import cloudinary
import cloudinary.api
from serverless_wsgi import handle_request

# Initialize Flask app
app = Flask(__name__)

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)

# Endpoint to fetch images by tag
@app.route("/get_images/<tag>", methods=["GET"])
def get_images(tag):
    try:
        result = cloudinary.api.resources_by_tag(
            tag,
            resource_type="image",
            max_results=100
        )
        return jsonify(result["resources"])
    except Exception as e:
        return jsonify({"error": f"Failed to fetch images for tag: {tag}, Error: {str(e)}"}), 500

# Handler for Netlify Functions
def handler(event, context):
    return handle_request(app, event, context)