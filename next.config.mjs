/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Handle canvas externals
    config.externals = [...(config.externals || []), { canvas: 'canvas' }]
    
    // Fix for TLDraw's ESM modules
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
    }
    
    // Ensure proper module resolution
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    }
    
    return config
  },
  transpilePackages: ['tldraw', '@tldraw/editor', '@tldraw/ui'],
  experimental: {
    esmExternals: 'loose',
  },
}

export default nextConfig
