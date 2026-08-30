import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Archivist Customer Portal | Decentralized Storage',
  description:
    'Modern end-user cloud storage portal powered by the Archivist decentralized network. Securely upload, download, stream, and manage your content.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className="bg-slate-950 text-slate-100 min-h-full font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
