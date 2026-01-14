import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/context/ThemeContext'
import { AuthProvider } from '@/context/AuthContext'
import { LocaleProvider } from '@/context/LocaleContext'
import { ToastProvider } from '@/components/ui/Toast'
import CommandPalette from '@/components/ui/CommandPalette'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'Montara WAF - Web Application Firewall',
  description: 'Enterprise-grade Web Application Firewall Dashboard',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Montara WAF',
  },
}

export const viewport: Viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider>
            <LocaleProvider>
              <ToastProvider>
                <ProtectedRoute>
                  {children}
                </ProtectedRoute>
                <CommandPalette />
                <PWAInstallPrompt />
              </ToastProvider>
            </LocaleProvider>
          </ThemeProvider>
        </AuthProvider>
        
        {/* Service Worker Registration */}
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(registration) {
                    console.log('ServiceWorker registered:', registration.scope);
                  },
                  function(err) {
                    console.log('ServiceWorker registration failed:', err);
                  }
                );
              });
            }
          `}
        </Script>
      </body>
    </html>
  )
}
