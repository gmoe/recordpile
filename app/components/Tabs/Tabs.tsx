'use client';
import type { ReactElement, ComponentProps } from 'react';
import Link from 'next/link';
import { cva } from 'class-variance-authority';
import { LucideIcon } from 'lucide-react';

import styles from './Tabs.module.scss';

const tabCva = cva(styles.tab, {
  variants: {
    active: {
      true: styles.active,
    },
  },
});

type TabProps = {
  active: boolean;
  href: string;
  icon: LucideIcon;
  label: string;
};

function Tab({ active, href, icon: Icon, label }: TabProps) {
  return (
    <li>
      <Link
        className={tabCva({ active })}
        href={href}
      >
        <Icon />
        <span>{label}</span>
      </Link>
    </li>
  );
}

type TabsProps = {
  children: Array<ReactElement<ComponentProps<typeof Tab>>>;
};

export default function Tabs({ children }: TabsProps) {
  return (
    <nav>
      <ul className={styles.tabs}>
        {children}
      </ul>
    </nav>
  );
}

Tabs.Tab = Tab;
