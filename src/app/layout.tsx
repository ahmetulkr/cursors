import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dil Öğrenme - Flashcard Uygulaması',
  description: 'İngilizce kelime öğrenmek için interaktif flashcard uygulaması',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}

