/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'https://invictus-mentoria.netlify.app',
  },
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig