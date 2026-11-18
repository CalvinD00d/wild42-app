import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      fallback: [{ source: "/uploads/:filename", destination: "/api/media/:filename" }],
    };
  },
  experimental: {
    // Next 16 persists Turbopack's development cache in `.next` by default.
    // Disable it because stale CSS entries were surviving normal dev restarts.
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
