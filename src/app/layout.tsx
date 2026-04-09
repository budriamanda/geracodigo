import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WebVitalsReporter from '@/components/WebVitalsReporter'
import CookieConsent from '@/components/CookieConsent'
import ToastContainer from '@/components/Toast'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ?? 'AW-18071358338'

const inter = Inter({ subsets: ['latin'] })

// Analytics coleta por padrão (opt-out no banner); ads só com opt-in explícito.
const consentModeScript = `
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{
  'analytics_storage':'granted',
  'ad_storage':'denied',
  'ad_user_data':'denied',
  'ad_personalization':'denied',
  'wait_for_update':500
});
gtag('set','ads_data_redaction',true);
gtag('set','url_passthrough',true);
`

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
    apple: [{ url: '/apple-icon', type: 'image/png', sizes: '180x180' }],
  },
  manifest: '/site.webmanifest',
}

export const viewport: Viewport = {
  themeColor: '#4f46e5',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <Script
          id="consent-mode"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: consentModeScript }}
        />
        {GA_ID && (
          <>
            <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
            <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
            <link rel="preconnect" href="https://www.google-analytics.com" crossOrigin="anonymous" />
            <link rel="dns-prefetch" href="https://www.google-analytics.com" />
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="beforeInteractive"
            />
            <Script
              id="ga4-config"
              strategy="beforeInteractive"
              dangerouslySetInnerHTML={{
                __html: `gtag('js',new Date());gtag('config','${GA_ID}');`,
              }}
            />
          </>
        )}
        {GOOGLE_ADS_ID && (
          <>
            <link rel="preconnect" href="https://googleads.g.doubleclick.net" crossOrigin="anonymous" />
            <link rel="dns-prefetch" href="https://googleads.g.doubleclick.net" />
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
              strategy="beforeInteractive"
            />
            <Script
              id="google-ads-config"
              strategy="beforeInteractive"
              dangerouslySetInnerHTML={{
                __html: `gtag('js',new Date());gtag('config','${GOOGLE_ADS_ID}');`,
              }}
            />
          </>
        )}
      </head>
      <body className={inter.className}>
        <Header />
        <main id="main-content" className="min-h-screen bg-gray-50">
          {children}
        </main>
        <Footer />
        <WebVitalsReporter />
        <CookieConsent />
        <ToastContainer />
        {ADSENSE_CLIENT && (
          <Script
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            strategy="lazyOnload"
            crossOrigin="anonymous"
          />
        )}
        <Script src="/scripts/sw-register.js" strategy="lazyOnload" />
      </body>
    </html>
  )
}
