const axios = require('axios');

exports.handler = async (event, context) => {
  // 1. 从请求头中获取用户的真实 IP
  // Netlify 会把用户真实 IP 放在 x-forwarded-for 中
  const clientIP = event.headers['x-forwarded-for'] || event.headers['client-ip'];

  // 2. 如果拿不到 IP（本地测试时），则回退到 'me'
  const target = clientIP ? clientIP.split(',')[0] : 'me';
  
  // 3. 将 IP 拼接到 API 请求中
  const API_URL = `https://api.ipinfo.io/lite/${target}?token=${process.env.IPINFO_TOKEN}`;

  try {
    const response = await axios.get(API_URL);
    
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "获取 IP 数据失败", details: error.message }),
    };
  }
};
