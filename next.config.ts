import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* other config options here */
  images: {
    domains: ['localhost', 'maevashop.netlify.app'], // Added your Netlify domain
  },
  // Add any other configuration options here
};

module.exports = nextConfig;