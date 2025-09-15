import type { Metadata } from 'next';
import { Rubik, Space_Mono } from 'next/font/google';
import './globals.css';
import NavLinks from './NavLinks';
import logo from './logo.svg';
import styles from './layout.module.scss';

const rubikSans = Rubik({
  variable: '--font-rubik-sans',
  subsets: ['latin'],
});

const spaceMono = Space_Mono({
  variable: '--font-space-mono',
  weight: '400',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'RecordPile',
  description: 'The "to be read" pile for your music',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${styles.main} ${rubikSans.variable} ${spaceMono.variable}`}>
        <header className={styles.header}>
          <img src={logo.src} alt="RecordPile logo" />
          <NavLinks />
        </header>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
