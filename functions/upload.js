const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST' && event.httpMethod !== 'OPTIONS') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept'
      },
      body: ''
    };
  }

  console.log('Raw event:', JSON.stringify(event, null, 2));

  const body = event.body || '';
  let category = null;
  let fileName = null;
  let fileContent = null;

  // Parse multipart/form-data
  if (body.includes('boundary=')) {
    const boundary = body.match(/boundary=(.+?)(?=\r\n)/)[1];
    const parts = body.split(`--${boundary}`).filter(part => part.trim() && !part.includes('--'));

    parts.forEach(part => {
      if (part.includes('name="category"')) {
        category = part.match(/name="category"\r\n\r\n([\w_]+)/)?.[1] || null;
        console.log('Extracted category:', category);
      } else if (part.includes('name="image"')) {
        const matches = part.match(/name="image"; filename="(.+?)"\r\nContent-Type: (.+?)\r\n\r\n([\s\S]*?)(?=\r\n--)/);
        if (matches) {
          fileName = matches[1];
          fileContent = Buffer.from(matches[3].trim(), 'binary'); // Use 'binary' for raw data
          console.log('Extracted file:', fileName);
        }
      }
    });
  }

  console.log('Final category:', category);
  console.log('Final file:', fileName ? fileName : 'No file');

  if (!fileContent || !category || !['bridge_work', 'road_safety', 'concrete_road', 'building'].includes(category)) {
    return {
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Image and valid category are required' })
    };
  }

  const tempDir = '/tmp/images';
  const uploadDir = path.join(tempDir, category);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileNameWithTimestamp = `${Date.now()}-${fileName}`;
  const filePath = path.join(uploadDir, fileNameWithTimestamp);

  try {
    fs.writeFileSync(filePath, fileContent);
    const imagesDir = path.join(__dirname, '..', '..', 'images', category);
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    fs.copyFileSync(filePath, path.join(imagesDir, fileNameWithTimestamp));

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, message: 'Image uploaded and will be deployed' })
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to upload image' })
    };
  }
};