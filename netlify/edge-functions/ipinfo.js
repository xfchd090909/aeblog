export default async (request, context) => {
    const token = Netlify.env.get("IPINFO_TOKEN");
    const clientIp = context.ip;
    
    try {
        // 请求 ipinfo API 拼凑用户 IP 和 Token
        const response = await fetch(`https://ipinfo.io/${clientIp}?token=${token}`);
        const data = await response.json();
        return Response.json(data);
    } catch (error) {
        return Response.json({ country: "UNKNOWN", error: error.message });
    }
};
