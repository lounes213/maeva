import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* other config options here */
  images: {
    domains: ['localhost', 'https://maeva-tawny.vercel.app/'], // Added your Netlify domain
  },
  // Add any other configuration options here
};

module.exports = nextConfig;