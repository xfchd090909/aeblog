export default async function handler(request) {
    if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const { token } = await request.json();
        const secret = '0x4AAAAAABuV_3f-MRrgtQ3QM01xaFM5wjc'; // 您的 secret key（仅服务端可见）

        const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                secret: secret,
                response: token
            })
        });

        const data = await verifyRes.json();

        if (data.success) {
            return new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            return new Response(JSON.stringify({ success: false, errors: data['error-codes'] }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } catch (err) {
        return new Response(JSON.stringify({ success: false }), { status: 500 });
    }
}
