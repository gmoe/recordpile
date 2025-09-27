import Image from 'next/image';

import logo from '../logo.svg';
import styles from './layout.module.scss';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <Image src={logo.src} alt="RecordPile logo" width="200" height="56" />
      </header>
      <section>
        {children}
      </section>
    </main>
  );
}
