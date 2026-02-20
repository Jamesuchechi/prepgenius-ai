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
          destination: 'http://127.0.0.1:8000/api/:path*/',
        },
        {
          source: '/media/:path*',
          destination: 'http://127.0.0.1:8000/media/:path*',
        },
      ],
    };
  },
}

module.exports = withPWA(nextConfig)