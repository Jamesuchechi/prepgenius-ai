/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: 'http://localhost:8000/api/:path*',
        },
        {
          source: '/media/:path*',
          destination: 'http://localhost:8000/media/:path*',
        },
      ],
    };
  },
}

module.exports = nextConfig