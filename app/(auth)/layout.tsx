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
        <img src={logo.src} alt="RecordPile logo" />
      </header>
      <section>
        {children}
      </section>
    </main>
  );
}
