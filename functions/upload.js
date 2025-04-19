const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const execPromise = promisify(exec);

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const formData = event.body ? JSON.parse(event.body) : {};
  const file = event.files && event.files.image;
  const category = formData.category || event.queryStringParameters.category;

  if (!file || !category || !['bridge_work', 'road_safety', 'concrete_road', 'building'].includes(category)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Image and valid category are required' }) };
  }

  const uploadDir = path.join(__dirname, '..', '..', 'images', category);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileName = `${Date.now()}-${file.name}`;
  const filePath = path.join(uploadDir, fileName);

  try {
    fs.writeFileSync(filePath, file.data);
    await execPromise('git add .');
    await execPromise(`git commit -m "Add new image to ${category} category"`);
    await execPromise('git push origin main');

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Image uploaded and deployed' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to upload image' })
    };
  }
};