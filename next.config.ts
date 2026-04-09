import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development'

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
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "geracodigo.com.br" }],
        destination: "https://www.geracodigo.com.br/:path*",
        statusCode: 301,
      },
      {
        source: "/gerador-codigo-de-barras",
        destination: "/gerador-de-codigo-de-barras",
        statusCode: 301,
      },
      {
        source: "/termos-e-privacidade",
        destination: "/termos",
        statusCode: 301,
      },
    ];
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
