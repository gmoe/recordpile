'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cva } from 'class-variance-authority';
import { Layers, ChartPie } from 'lucide-react';

import styles from './NavLinks.module.scss';

const linkCva = cva(styles.link, {
  variants: {
    active: {
      true: styles.active,
    },
  },
});

export default function NavLinks() {
  const pathname = usePathname();

  if (!pathname.startsWith('/my-pile') && !pathname.startsWith('/stats')) {
    return null;
  }

  return (
    <nav>
      <ul className={styles.links}>
        <li>
          <Link
            className={linkCva({ active: pathname.startsWith('/my-pile') })}
            href="/my-pile"
          >
            <Layers />
            <span>Pile</span>
          </Link>
          <Link
            className={linkCva({ active: pathname.startsWith('/stats') })}
            href="/stats"
          >
            <ChartPie />
            <span>Stats</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
