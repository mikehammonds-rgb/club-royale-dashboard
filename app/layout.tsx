import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://club-royale-offer-compass.the-unlimite-3666.chatgpt.site'),
  title: 'Club Royale Offer Compass',
  description: 'A private dashboard for Club Royale casino offers and eligible comp sailings.',
  openGraph: {
    type: 'website',
    title: 'Club Royale Offer Compass',
    description: 'Casino comps, clearly charted.',
    images: [{ url: '/og.png', width: 1731, height: 909, alt: 'Club Royale Offer Compass' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Club Royale Offer Compass',
    description: 'Casino comps, clearly charted.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
