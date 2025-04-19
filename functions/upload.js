const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  console.log('Event received:', JSON.stringify(event, null, 2)); // Detailed debug log
  const file = event.files && event.files.image;
  let category = null;

  // Attempt to extract category from multipart/form-data body
  if (event.body) {
    const bodyStr = event.body.toString();
    const categoryMatch = bodyStr.match(/name="category"\r\n\r\n([\w_]+)/);
    if (categoryMatch && categoryMatch[1]) {
      category = categoryMatch[1];
      console.log('Parsed category from body:', category);
    }
  }

  console.log('Received category:', category);
  console.log('Received file:', file ? file.name : 'No file');

  if (!file || !category || !['bridge_work', 'road_safety', 'concrete_road', 'building'].includes(category)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Image and valid category are required' }) };
  }

  const tempDir = '/tmp/images';
  const uploadDir = path.join(tempDir, category);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileName = `${Date.now()}-${file.name}`;
  const filePath = path.join(uploadDir, fileName);

  try {
    fs.writeFileSync(filePath, file.data);
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