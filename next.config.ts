/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['http://localhost:3000/'], // Removed https:// prefix
  },
  // Add any other configuration options here
};

module.exports = nextConfig;