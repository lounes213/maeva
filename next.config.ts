/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'localhost',
      'via.placeholder.com',
      'maevashop.netlify.app',
      'maeva-tawny.vercel.app'
    ],
    // You can also use remotePatterns for more specific control
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      }
    ]
  },
  // Add any other configuration options here
};

module.exports = nextConfig;