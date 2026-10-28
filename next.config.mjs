/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // NO usar output:'export' ni output:'standalone' — incompatibles con @netlify/plugin-nextjs
  // El plugin maneja automáticamente el SSR y las funciones serverless

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Security headers para el dashboard
  async headers() {
    return [
      {
        source: '/dashboard/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "media-src 'self' blob: data: https://res.cloudinary.com https://*.bunnycdn.com",
              "frame-src 'self' https://www.youtube.com https://player.vimeo.com https://*.bunnycdn.com",
              "img-src 'self' data: blob: https://res.cloudinary.com https://*.supabase.co",
            ].join('; '),
          },
          { key: 'Referrer-Policy', value: 'no-referrer' },
        ],
      },
    ]
  },
}

export default nextConfig
