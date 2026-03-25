import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WebVitalsReporter from '@/components/WebVitalsReporter'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'GeraCode | Gerador de Código de Barras e QR Code Pix Grátis',
    template: '%s | GeraCode',
  },
  description: 'Gerador grátis de código de barras, QR Code e QR Code Pix. Ferramentas online para lojistas brasileiros. 100% privado, sem cadastro.',
  metadataBase: new URL('https://www.geracodigo.com.br'),
  openGraph: {
    siteName: 'GeraCode',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        {GA_ID && (
          <>
            <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
            <link rel="dns-prefetch" href="https://www.google-analytics.com" />
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="lazyOnload"
            />
            <Script
              src="/scripts/ga4-init.js"
              data-ga-id={GA_ID}
              strategy="lazyOnload"
            />
          </>
        )}
        {ADSENSE_CLIENT && (
          <Script
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            strategy="lazyOnload"
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className={inter.className}>
        <Header />
        <main id="main-content" className="min-h-screen bg-gray-50">
          {children}
        </main>
        <Footer />
        <WebVitalsReporter />
        <Script src="/scripts/sw-register.js" strategy="lazyOnload" />
      </body>
    </html>
  )
}
