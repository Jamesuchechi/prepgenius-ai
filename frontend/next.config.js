/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
  async rewrites() {
    return {
      beforeFiles: [
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

module.exports = nextConfig