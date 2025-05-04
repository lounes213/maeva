/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'maeva-tawny.vercel.app', 'maevashop.netlify.app'], // Removed https:// prefix
  },
  // Add any other configuration options here
};

module.exports = nextConfig;