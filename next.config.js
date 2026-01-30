/** @type {import('next').NextConfig} */
const nextConfig = {
    logging: {
        fetches: {
            fullUrl: true,
        },
    },
};

console.log("--- VERCEL BUILD CHECK ---");
console.log("AUTH_GOOGLE_ID exists:", !!process.env.AUTH_GOOGLE_ID);
console.log("AUTH_GOOGLE_SECRET exists:", !!process.env.AUTH_GOOGLE_SECRET);
console.log("--------------------------");

module.exports = nextConfig;
