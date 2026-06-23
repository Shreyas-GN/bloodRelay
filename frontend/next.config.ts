import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {},
  webpack: (config, { isServer }) => {
    // Webpack config can go here if needed in the future
    return config;
  }
};

export default nextConfig;
