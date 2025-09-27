import Image from 'next/image';

import logo from '../logo.svg';
import NavLinks from './NavLinks';
import styles from './layout.module.scss';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header className={styles.header}>
        <Image src={logo.src} alt="RecordPile logo" width="200" height="56" />
        <NavLinks />
      </header>
      <main>
        {children}
      </main>
    </>
  );
}
