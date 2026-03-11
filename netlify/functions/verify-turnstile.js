export default async function handler(request) {
    if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const { token } = await request.json();
        const secret = process.env.TURNSTILE_SECRET_KEY;

        if (!secret) {
            return new Response(JSON.stringify({ success: false }), { status: 500 });
        }

        const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ secret, response: token })
        });

        const data = await verifyRes.json();

        return new Response(
            JSON.stringify({ success: data.success }),
            { status: data.success ? 200 : 400 }
        );
    } catch (err) {
        return new Response(JSON.stringify({ success: false }), { status: 500 });
    }
}
