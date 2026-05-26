import type { Metadata } from 'next'
import './globals.css'
import './theme-green.css'
import './ui-system.css'

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
              root.dataset.accent = allowedAccents.indexOf(accentScheme) >= 0 ? accentScheme : 'green';
            } catch(e) {}
          })();
        `}} />
      </head>
      <body>{children}</body>
    </html>
  )
}
