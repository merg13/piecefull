import './globals.css'
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Cozy Puzzle App',
  description: 'Create beautiful jigsaw puzzles and share them with friends. Solve puzzles in a relaxing lofi atmosphere with animated pets and seasonal themes.',
  keywords: 'puzzle, jigsaw, cozy, lofi, games, relaxing',
  authors: [{ name: 'Cozy Puzzle App' }],
  openGraph: {
    title: 'Cozy Puzzle App',
    description: 'Create and solve beautiful jigsaw puzzles in a cozy atmosphere',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning>{children}</body>
    </html>
  )
}
