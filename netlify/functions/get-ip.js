const axios = require('axios');

exports.handler = async (event, context) => {
  const token = process.env.ipinfo_token;
  const ip = event.headers['x-nf-client-connection-ip'] || event.headers['client-ip'];

  try {
    const response = await axios.get(`https://ipinfo.io/${ip}?token=${token}`);
    return {
      statusCode: 200,
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch IP info' })
    };
  }
};
