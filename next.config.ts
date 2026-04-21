import type { NextConfig } from "next";
import { createReader } from '@keystatic/core/reader'
import keystaticConfig from './keystatic.config'

const isDev = process.env.NODE_ENV === 'development'

const reader = createReader(process.cwd(), keystaticConfig)

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://www.googletagmanager.com https://pagead2.googlesyndication.com https://www.googleadservices.com https://adservice.google.com https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google`,
      "style-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com",
      "img-src 'self' data: blob: https://pagead2.googlesyndication.com https://*.doubleclick.net https://www.google.com https://www.google.com.br https://googleads.g.doubleclick.net",
      "font-src 'self' https://fonts.gstatic.com",
      "worker-src 'self'",
      `connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https://pagead2.googlesyndication.com https://*.doubleclick.net https://www.googleadservices.com https://adservice.google.com https://api.indexnow.org https://www.bing.com${isDev ? ' ws://localhost:* http://localhost:*' : ''}`,
      "frame-src 'self' https://pagead2.googlesyndication.com https://tpc.googlesyndication.com https://www.google.com https://googleads.g.doubleclick.net",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
]

const nextConfig: NextConfig = {
  async redirects() {
    // Host-level redirect (apex → www) fica hardcoded — é infraestrutura, não conteúdo.
    const infraRedirects = [
      {
        source: "/:path*",
        has: [{ type: "host" as const, value: "geracodigo.com.br" }],
        destination: "https://www.geracodigo.com.br/:path*",
        statusCode: 301 as const,
      },
    ]

    const cmsConfig = await reader.singletons.redirects.read().catch(() => null)
    const cmsRedirects = (cmsConfig?.items ?? [])
      .filter((r) => r.source && r.destination)
      .map((r) => ({
        source: r.source,
        destination: r.destination,
        permanent: r.permanent !== false,
      }))

    return [...infraRedirects, ...cmsRedirects]
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
};

export default nextConfig;
