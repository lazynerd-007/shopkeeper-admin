/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Enable image optimization
  images: {
    domains: [],
    // Optimize images on demand as they are requested
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Use modern image formats when supported
    formats: ['image/avif', 'image/webp'],
  },
  
  // Enable experimental features for better performance
  experimental: {
    // Optimize CSS by removing unused styles
    optimizeCss: true,
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.default-domain.com',
  },
  
  // Configure webpack for better performance
  webpack: (config, { dev, isServer }) => {
    // Add optimization for CSS modules
    if (!dev && !isServer) {
      // Enable tree shaking and dead code elimination
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        // Create a separate chunk for CSS modules
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true,
        },
      };
    }
    
    return config;
  },
  
  // Add API proxy to avoid CORS issues
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.myshopkeeper.net/api/v1/:path*',
      },
    ];
  },
};

module.exports = nextConfig;