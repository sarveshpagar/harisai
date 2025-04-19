const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const file = event.files && event.files.image;
  const category = event.body ? (new URLSearchParams(event.body).get('category') || event.queryStringParameters.category) : null;

  if (!file || !category || !['bridge_work', 'road_safety', 'concrete_road', 'building'].includes(category)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Image and valid category are required' }) };
  }

  // Use a temporary directory for Netlify Functions
  const tempDir = '/tmp/images';
  const uploadDir = path.join(tempDir, category);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileName = `${Date.now()}-${file.name}`;
  const filePath = path.join(uploadDir, fileName);

  try {
    fs.writeFileSync(filePath, file.data);
    // Copy to images directory (relative to project root during build)
    const imagesDir = path.join(__dirname, '..', '..', 'images', category);
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    fs.copyFileSync(filePath, path.join(imagesDir, fileName));

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Image uploaded and will be deployed' })
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to upload image' })
    };
  }
};