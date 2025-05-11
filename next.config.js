/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Add this for file uploads
  api: {
    bodyParser: {
      sizeLimit: '20mb', // Set your preferred limit
    },
    responseLimit: '20mb',
  },
  
  // Image configuration
  images: {
    domains: ['maeva-gamma.vercel.app', 'localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Server runtime configuration
  serverRuntimeConfig: {
    projectRoot: process.cwd(),
  },
};

module.exports = nextConfig;