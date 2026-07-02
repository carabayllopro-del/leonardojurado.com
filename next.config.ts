import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Fail the production build on type errors instead of ignoring them.
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
