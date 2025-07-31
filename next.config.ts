/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '127.0.0.1:3000'],
    },
    // Enable performance optimizations
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  // Force disable static optimization for debugging
  trailingSlash: false,
  // Ensure server actions work properly
  serverExternalPackages: ['@prisma/client', 'prisma'],
}

module.exports = nextConfig