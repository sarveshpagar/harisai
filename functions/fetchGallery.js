const fetch = require('node-fetch');

exports.handler = async (event) => {
    const { category } = event.queryStringParameters;

    const CLOUDINARY_API_KEY = '776273213436843';
    const CLOUDINARY_API_SECRET = '7PjEFF4jrN8akBiHvcBO7MaG2bY';
    const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/djbxxkpji/image/list/${category}.json`;

    const auth = Buffer.from(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`).toString('base64');

    try {
        const response = await fetch(CLOUDINARY_URL, {
            headers: {
                Authorization: `Basic ${auth}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch gallery: ${response.statusText}`);
        }

        const data = await response.json();
        return {
            statusCode: 200,
            body: JSON.stringify(data),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};