import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
};
module.exports = {
  images: {
    domains: ['http://localhost:3000/'], // Add domains where your images are hosted
    // Or use a loader if images are from an external service
  },
}
export default nextConfig;
