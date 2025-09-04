import type { Metadata } from "next";
import { Rubik, Space_Mono } from "next/font/google";
import "./globals.css";

const rubikSans = Rubik({
  variable: "--font-rubik-sans",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: '400',
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RecordPile",
  description: "The \"to be read\" pile for your music",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${rubikSans.variable} ${spaceMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
