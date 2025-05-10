/** @type {import('next').NextConfig} */
const nextConfig = {

  async rewrites() {
    return [
      {
        source: '/.well-known/appspecific/com.chrome.devtools.json',
        destination: '/api/chrome-devtools' // or any endpoint you want
      }
    ]
  },
  images: {
    deviceSizes: [320, 420, 768, 1024, 1200],
    imageSizes: [16, 32, 48, 64, 96],

    domains: [
      'localhost',
     
      'maeva-three.vercel.app',
      // Add your cloud storage domain here
      'your-cloud-storage-domain.com'
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
    ],
    // Add this to ensure local images work
    unoptimized: true
  },
  // Add any other configuration options here
};

module.exports = nextConfig;