/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', '@prisma/client', 'prisma'],
  },
};

export default nextConfig;
