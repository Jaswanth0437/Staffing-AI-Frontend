const BACKEND_ORIGIN = process.env.BACKEND_URL ?? "http://localhost:8000";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // The FastAPI backend has no CORS middleware (and we don't touch backend
  // code), so the browser can't call it directly from a different origin.
  // Proxying same-origin through the Next.js server sidesteps that —
  // requests to /api/backend/* never leave the browser's own origin.
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: `${BACKEND_ORIGIN}/:path*`,
      },
    ];
  },
};

export default nextConfig;
