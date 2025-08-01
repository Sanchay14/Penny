/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '127.0.0.1:3000'],
    },
    // Enable performance optimizations
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    // Disable all static generation and caching for real-time updates
    staleTimes: {
      dynamic: 0,
      static: 0,
    },
  },
  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  // Force disable static optimization completely
  trailingSlash: false,
  // Ensure server actions work properly
  serverExternalPackages: ['@prisma/client', 'prisma'],
  // Disable caching headers globally
  async headers() {
    return [
      {
        source: '/dashboard',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig