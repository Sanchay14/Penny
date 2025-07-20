/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '127.0.0.1:3000'],
    },
  },
  // Force disable static optimization for debugging
  trailingSlash: false,
  // Ensure server actions work properly
  serverExternalPackages: ['@prisma/client', 'prisma'],
}

module.exports = nextConfig