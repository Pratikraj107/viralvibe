/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed static export to allow dynamic API routes
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    // Fix Supabase realtime-js issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    // Ignore problematic modules during build
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        '@supabase/realtime-js': 'commonjs @supabase/realtime-js',
      });
    }
    
    return config;
  },
  // Reduce memory usage
  swcMinify: true,
  compress: true,
};

module.exports = nextConfig;
