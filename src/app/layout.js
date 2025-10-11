import './globals.css'
import { Analytics } from "@vercel/analytics/next"

export const metadata = {
  title: 'NextStep - Platform Lowongan Magang',
  description: 'NextStep dibuat untuk memudahkan pengguna mencari lowongan magang sesuai minat, lokasi, dan bidang keahlian. Semua data lowongan bersumber dari situs resmi Kementerian Ketenagakerjaan RI.',
  keywords: 'magang, lowongan magang, internship, kemnaker, lowongan kerja, fresh graduate',
  authors: [{ name: 'MIAbidin' }],
  
  // Open Graph
  openGraph: {
    title: 'NextStep - Platform Lowongan Magang',
    description: 'NextStep dibuat untuk memudahkan pengguna mencari lowongan magang sesuai minat, lokasi, dan bidang keahlian.',
    type: 'website',
    url: 'https://nextstep.id',
    images: [
      {
        url: 'https://nextstep.id/preview.png',
        width: 1200,
        height: 630,
        alt: 'NextStep - Platform Lowongan Magang',
      },
    ],
    locale: 'id_ID',
    siteName: 'NextStep',
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    site: '@MIAbidin',
    title: 'NextStep - Platform Lowongan Magang',
    description: 'NextStep dibuat untuk memudahkan pengguna mencari lowongan magang sesuai minat, lokasi, dan bidang keahlian.',
    images: ['https://nextstep.id/preview.png'],
  },
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}