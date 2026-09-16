import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/:key.txt',
        destination: '/api/indexnow-key?key=:key',
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'qymwloeofmjnaknhvyfk.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
