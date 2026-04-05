import { headers } from 'next/headers';
import { asc } from 'drizzle-orm';

import { auth } from '@/app/lib/auth';
import { database } from '@/app/db';
import { pileItems } from '@/app/db/schemas/pileItems';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const items = await database.query.pileItems.findMany({
    columns: { coverImage: false },
    orderBy: [asc(pileItems.position)],
  });

  const clientItems = items.map((item) => ({
    ...item,
    coverImageUrl: `/api/cover-image/${item.id}`,
  }));

  return Response.json(clientItems);
}
