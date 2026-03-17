export default async (request, context) => {
    const token = Netlify.env.get("IPINFO_TOKEN");
    const restrictedList = Netlify.env.get("RESTRICTED_REGIONS") || "";
    const clientIp = context.ip;
    
    // 将环境变量中的字符串转为数组
    const restrictedRegions = restrictedList.split(",").map(s => s.trim().toUpperCase());
    
    try {
        const response = await fetch(`https://ipinfo.io/${clientIp}?token=${token}`);
        const data = await response.json();
        
        return Response.json({
            country: data.country,
            restrictedRegions: restrictedRegions
        });
    } catch (error) {
        return Response.json({ country: "UNKNOWN", restrictedRegions: ["CN"] });
    }
};
