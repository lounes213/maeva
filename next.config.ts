import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
};
module.exports = {
  images: {
    domains: ['https://maevashop.netlify.app/'], // Correction du domaine pour autoriser les images locales
  },
};
export default nextConfig;
