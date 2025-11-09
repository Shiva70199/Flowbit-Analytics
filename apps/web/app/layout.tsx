import './globals.css'

export const metadata = {
  title: 'Flowbit Analytics - Dashboard',
  description: 'Interactive Analytics Dashboard with AI-powered Chat with Data',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
