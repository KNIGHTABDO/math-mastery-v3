import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Math Mastery - Plateforme éducative pour 2BAC Sciences Mathématiques',
  description: 'Plateforme communautaire dédiée aux étudiants marocains en 2ème année Baccalauréat Sciences Mathématiques et Physiques. Cours, exercices, quiz et communauté d\'apprentissage.',
  keywords: 'mathématiques, 2bac, maroc, sciences mathématiques, cours, exercices, quiz, communauté, éducation',
  authors: [{ name: 'Math Mastery Team' }],
  viewport: 'width=device-width, initial-scale=1',
  openGraph: {
    title: 'Math Mastery - Plateforme éducative pour 2BAC Sciences Mathématiques',
    description: 'Rejoignez la communauté Math Mastery et excellez en mathématiques au 2BAC Sciences Mathématiques et Physiques',
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Math Mastery - Plateforme éducative pour 2BAC Sciences Mathématiques',
    description: 'Rejoignez la communauté Math Mastery et excellez en mathématiques au 2BAC Sciences Mathématiques et Physiques',
  },
  robots: 'index, follow',
  manifest: '/manifest.json'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#3B82F6" />
      </head>
      <body className={`${inter.className} min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
        <ThemeProvider>
          <AuthProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
