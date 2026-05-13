import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Калькулятор металла',
  description: 'Расчёт веса и длины металлопроката. Справочник ГОСТ.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
