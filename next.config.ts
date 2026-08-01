import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Next 16 persists Turbopack's development cache in `.next` by default.
    // Disable it because stale CSS entries were surviving normal dev restarts.
    turbopackFileSystemCacheForDev: false,
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
