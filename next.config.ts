/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    deviceSizes: [320, 420, 768, 1024, 1200],
    imageSizes: [16, 32, 48, 64, 96],

    domains: [
      'localhost',
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