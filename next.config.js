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
  
  // Image configuration (if needed)
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Optional: For larger files, you might need to increase the serverless function timeout
  serverRuntimeConfig: {
    projectRoot: process.cwd(),
  },
};

module.exports = nextConfig;