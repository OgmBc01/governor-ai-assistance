import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bauchi AI Governor Assistant',
  description: 'Official AI Assistant of Alh. Dr. Bala Mohammed, Executive Governor of Bauchi State',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-zaria-pattern bg-repeat opacity-95">
        <div className="relative z-10">
          {children}
        </div>
        {/* Grain texture overlay */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.015] bg-grain z-20" />
      </body>
    </html>
  )
}