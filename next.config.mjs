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
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
        ],
      },
    ]
  },
  webpack: (config, { isServer }) => {
    // Handle canvas externals
    config.externals = [...(config.externals || []), { canvas: 'canvas' }]
    
    // Fix for TLDraw's ESM modules - ensure single instance
    // Use dedupe to ensure only one version of each package is loaded
    config.resolve.alias = {
      ...config.resolve.alias,
    }
    
    // Deduplicate tldraw packages
    if (!config.resolve.plugins) {
      config.resolve.plugins = []
    }
    
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
  transpilePackages: [
    'tldraw',
    '@tldraw/editor',
    '@tldraw/ui',
    '@tldraw/store',
    '@tldraw/utils',
    '@tldraw/state',
    '@tldraw/state-react',
    '@tldraw/validate',
    '@tldraw/tlschema',
  ],
  experimental: {
    esmExternals: 'loose',
  },
}

export default nextConfig
