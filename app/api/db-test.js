// api/db-test.js
const dns = require('dns');
const net = require('net');

module.exports = async (req, res) => {
    const host = 'db.ythixnylcizlewxukyiw.supabase.co';
    // DNS lookup
    dns.lookup(host, (err, address) => {
        if (err) {
            console.log('dns.err', err);
            return res.status(500).json({ step: 'dns', error: err.message });
        }

        // TCP connect test
        const socket = new net.Socket();
        const timeoutMs = 5000;
        let done = false;

        socket.setTimeout(timeoutMs);
        socket.on('error', (e) => {
            if (done) return;
            done = true;
            console.log('tcp.err', e);
            socket.destroy();
            return res.status(500).json({ step: 'tcp', error: e.message });
        });
        socket.on('timeout', () => {
            if (done) return;
            done = true;
            socket.destroy();
            return res.status(500).json({ step: 'tcp', error: 'timeout' });
        });
        socket.connect(5432, address, () => {
            if (done) return;
            done = true;
            socket.end();
            return res.status(200).json({ step: 'ok', dns: address, tcp: 'connected' });
        });
    });
};