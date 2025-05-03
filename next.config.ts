import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
};
module.exports = {
  images: {
    domains: ['localhost'], // Correction du domaine pour autoriser les images locales
  },
};
export default nextConfig;
