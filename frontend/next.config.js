const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      }
    ],
  },
  async rewrites() {
    const BACKEND_URL = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000';
    return {
      beforeFiles: [
        // Internal Next.js API routes — must come BEFORE the Django proxy catch-all
        {
          source: '/api/internal/:path*',
          destination: '/api/internal/:path*',
        },
        // All other /api/* calls are proxied to Django backend
        {
          source: '/api/:path*',
          destination: `${BACKEND_URL}/api/:path*/`,
        },
        {
          source: '/media/:path*',
          destination: `${BACKEND_URL}/media/:path*`,
        },
      ],
    };
  },
}

module.exports = withPWA(nextConfig)