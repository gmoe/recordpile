import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [new URL('https://coverartarchive.org/release-group/**/front-200')],
  },
  logging: {
    incomingRequests: false,
  },
};

export default nextConfig;
