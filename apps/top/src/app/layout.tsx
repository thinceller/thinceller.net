import { Metadata } from 'next'
import './global.css'

export const metadata: Metadata = {
  title: 'thinceller',
  description: "thinceller's website",
  openGraph: {
    title: 'thinceller',
    description: "thinceller's website",
    url: 'https://thinceller.net',
    type: 'website',
    siteName: 'thinceller',
  },
}

type Props = {
  children: React.ReactNode
}

export default function RootLayout({ children }: Props) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
