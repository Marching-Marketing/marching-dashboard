import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MARCHING Analytics',
  description: 'Dashboard de Tráfego Pago',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
