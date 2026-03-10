export default async function handler() {
    return new Response(
        JSON.stringify({
            siteKey: process.env.TURNSTILE_SITE_KEY
        }),
        {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        }
    );
}
