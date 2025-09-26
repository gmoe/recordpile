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
        <img src={logo.src} alt="RecordPile logo" />
        <NavLinks />
      </header>
      <main>
        {children}
      </main>
    </>
  );
}
