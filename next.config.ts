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
    loader: "custom",
    loaderFile: "./supabase-image-loader.ts",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'qymwloeofmjnaknhvyfk.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
