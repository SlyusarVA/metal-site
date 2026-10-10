import type { Metadata, Viewport } from 'next'
import './globals.css'
import './theme-green.css'
import './ui-system.css'

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' }

export const metadata: Metadata = {
  title: 'Калькулятор металла',
  icons: {
    icon: [
      { url: '/favicon.ico?v=4', sizes: '16x16 32x32 48x48 64x64' },
      { url: '/favicon.svg?v=4', type: 'image/svg+xml', sizes: 'any' },
    ],
    apple: [{ url: '/apple-touch-icon.png?v=4', sizes: '180x180', type: 'image/png' }],
  },
  description: 'Расчёт веса и длины металлопроката. Справочник ГОСТ.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var theme = localStorage.getItem('theme') || 'system';
              var accentScheme = localStorage.getItem('accentScheme') || 'green';
              var allowedAccents = ['green', 'blue', 'graphite', 'copper'];
              var root = document.documentElement;
              if (theme === 'light') {
                root.classList.add('light');
              } else if (theme === 'dark') {
                root.classList.add('dark');
              } else if (theme === 'system') {
                root.classList.add('theme-system');
              }
              var desktop = window.matchMedia('(min-width: 768px) and (pointer: fine), (min-width: 1024px)');
              function loadDesktopFont() {
                if (!desktop.matches || document.getElementById('desktop-font')) return;
                var link = document.createElement('link');
                link.id = 'desktop-font';
                link.rel = 'stylesheet';
                link.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap';
                document.head.appendChild(link);
              }
              loadDesktopFont();
              desktop.addEventListener('change', loadDesktopFont);
              root.dataset.accent = allowedAccents.indexOf(accentScheme) >= 0 ? accentScheme : 'green';
            } catch(e) {}
          })();
        `}} />
      </head>
      <body>{children}</body>
    </html>
  )
}
