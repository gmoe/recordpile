'use client';
import { usePathname } from 'next/navigation';
import { Layers, ChartPie } from 'lucide-react';

import Tabs from '@/app/components/Tabs';

export default function NavLinks() {
  const pathname = usePathname();

  if (!pathname.startsWith('/my-pile') && !pathname.startsWith('/stats')) {
    return null;
  }

  return (
    <Tabs>
      <Tabs.Tab
        active={pathname.startsWith('/my-pile')}
        href="/my-pile"
        icon={Layers}
        label="Pile"
      />
      <Tabs.Tab
        active={pathname.startsWith('/stats')}
        href="/stats"
        icon={ChartPie}
        label="Stats"
      />
    </Tabs>
  );
}
