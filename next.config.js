/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Ensure proper routing on Vercel
  trailingSlash: false,
  // Ensure API routes are properly handled
  async rewrites() {
    return []
  },
}

module.exports = nextConfig

