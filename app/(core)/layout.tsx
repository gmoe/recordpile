import Image from 'next/image';

import logo from '../logo.svg';
import NavLinks from './NavLinks';
import AddToPile from './AddToPile';
import OfflineIndicator from '@/app/components/OfflineIndicator/OfflineIndicator';
import styles from './layout.module.scss';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <Image src={logo.src} alt="RecordPile logo" width="200" height="56" />
        </div>
        <div className={styles.actions}>
          <NavLinks />
          <AddToPile />
        </div>
      </header>
      <main className={styles.main}>
        {children}
      </main>
      <OfflineIndicator />
    </>
  );
}
