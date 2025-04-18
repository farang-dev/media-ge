/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['secure.gravatar.com', 'i0.wp.com', 'i1.wp.com', 'i2.wp.com'],
  },
  // Ensure Vercel can properly build and deploy the app
  output: 'standalone',
}

module.exports = nextConfig
