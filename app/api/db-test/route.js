// app/api/db-test/route.js
import dns from 'dns';
import net from 'net';

export async function GET() {
    const host = 'db.ythixnylcizlewxukyiw.supabase.co';
    return new Promise((resolve) => {
        dns.lookup(host, (err, address) => {
            if (err) {
                return resolve(new Response(JSON.stringify({ step: 'dns', error: err.message }), { status: 500 }));
            }
            const socket = new net.Socket();
            const timeoutMs = 5000;
            let done = false;
            socket.setTimeout(timeoutMs);
            socket.on('error', (e) => {
                if (done) return;
                done = true;
                socket.destroy();
                return resolve(new Response(JSON.stringify({ step: 'tcp', error: e.message }), { status: 500 }));
            });
            socket.on('timeout', () => {
                if (done) return;
                done = true;
                socket.destroy();
                return resolve(new Response(JSON.stringify({ step: 'tcp', error: 'timeout' }), { status: 500 }));
            });
            socket.connect(5432, address, () => {
                if (done) return;
                done = true;
                socket.end();
                return resolve(new Response(JSON.stringify({ step: 'ok', dns: address, tcp: 'connected' }), { status: 200 }));
            });
        });
    });
}