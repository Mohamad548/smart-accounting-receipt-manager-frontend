import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  // Note: NEXT_PUBLIC_* variables are automatically available from .env.local
  // No need to define them in env object
};

export default nextConfig;

