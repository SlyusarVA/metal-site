import type { Metadata } from 'next'
import './globals.css'
import './preview-palette.css'

export const metadata: Metadata = {
  title: 'Калькулятор металла',
  description: 'Расчёт веса и длины металлопроката. Справочник ГОСТ.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var theme = localStorage.getItem('theme') || 'system';
              var root = document.documentElement;
              if (theme === 'light') {
                root.classList.add('light');
              } else if (theme === 'dark') {
                root.classList.add('dark');
              } else if (theme === 'system') {
                root.classList.add('theme-system');
              }
            } catch(e) {}
          })();
        `}} />
      </head>
      <body>{children}</body>
    </html>
  )
}
