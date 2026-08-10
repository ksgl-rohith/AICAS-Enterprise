/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', '@prisma/client', 'prisma'],
  },
};

export default nextConfig;
