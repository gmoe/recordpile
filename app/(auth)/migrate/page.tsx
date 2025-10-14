'use client';

import { startMigration } from './actions';

export default function Migrate() {
  startMigration();

  return (
    <div>
      Next.js? Trash. DigitalOcean? Getting on my nerves.
    </div>
  );
}
