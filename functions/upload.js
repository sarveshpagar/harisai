const Busboy = require('busboy');
const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  console.log('Headers:', event.headers);
  console.log('Body:', event.body);

  return new Promise((resolve, reject) => {
    const busboy = new Busboy({ headers: event.headers });
    const tempDir = '/tmp/images';
    const uploadData = { category: null, fileName: null, fileContent: null };

    busboy.on('file', (fieldname, file, filename) => {
      const filePath = path.join(tempDir, filename);
      uploadData.fileName = filename;

      // Save the file to /tmp
      const writeStream = fs.createWriteStream(filePath);
      file.pipe(writeStream);

      file.on('end', () => {
        uploadData.fileContent = filePath;
      });
    });

    busboy.on('field', (fieldname, value) => {
      if (fieldname === 'category') {
        uploadData.category = value;
      }
    });

    busboy.on('finish', () => {
      if (!uploadData.fileContent || !uploadData.category) {
        return resolve({
          statusCode: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ error: 'Image and valid category are required' }),
        });
      }

      const categoryDir = path.join(__dirname, '..', '..', 'images', uploadData.category);
      if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir, { recursive: true });
      }

      const destinationPath = path.join(categoryDir, uploadData.fileName);
      fs.copyFileSync(uploadData.fileContent, destinationPath);

      resolve({
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: true, message: 'Image uploaded successfully' }),
      });
    });

    busboy.on('error', (error) => {
      console.error('Busboy error:', error);
      reject({
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Failed to process upload' }),
      });
    });

    busboy.end(Buffer.from(event.body, 'base64'));
  });
};