import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse-new"],
  },
};

export default nextConfig;
