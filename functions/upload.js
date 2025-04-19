const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  console.log('Event received:', JSON.stringify(event, null, 2));

  // Check if this is a preflight request (CORS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: ''
    };
  }

  const body = event.body || '';
  let category = null;
  let fileData = null;

  // Parse multipart/form-data manually (basic approach)
  if (body.includes('name="category"') && body.includes('name="image"')) {
    const categoryMatch = body.match(/name="category"\r\n\r\n([\w_]+)/);
    category = categoryMatch ? categoryMatch[1] : null;

    const fileMatch = body.match(/name="image"; filename="(.+?)"\r\n\r\n([\s\S]*?)(?=\r\n------WebKitFormBoundary)/);
    if (fileMatch) {
      fileData = {
        name: fileMatch[1],
        data: Buffer.from(fileMatch[2].trim(), 'base64') // Assuming base64 encoding; adjust if binary
      };
    }
  }

  console.log('Received category:', category);
  console.log('Received file:', fileData ? fileData.name : 'No file');

  if (!fileData || !category || !['bridge_work', 'road_safety', 'concrete_road', 'building'].includes(category)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Image and valid category are required' }) };
  }

  const tempDir = '/tmp/images';
  const uploadDir = path.join(tempDir, category);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileName = `${Date.now()}-${fileData.name}`;
  const filePath = path.join(uploadDir, fileName);

  try {
    fs.writeFileSync(filePath, fileData.data);
    const imagesDir = path.join(__dirname, '..', '..', 'images', category);
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    fs.copyFileSync(filePath, path.join(imagesDir, fileName));

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
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