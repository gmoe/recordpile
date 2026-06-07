import { NextResponse, NextRequest } from 'next/server';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';

import { database } from '@/app/db';
import { pileItems } from '@/app/db/schemas/pileItems';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/cover-image/[id]'>) {
  const { id } = await ctx.params;

  const pileItem = await database.query.pileItems.findFirst({
    where: eq(pileItems.id, id),
    columns: {
      coverImage: true,
      coverImageUpdatedAt: true,
    },
  });

  if (!pileItem?.coverImage) {
    return notFound();
  }

  const imageBuffer = Buffer.from(pileItem.coverImage);
  const lastModified = pileItem.coverImageUpdatedAt === null
    ? (new Date(Date.UTC(0, 0, 0, 0, 0, 0)))
    : pileItem.coverImageUpdatedAt;

  return new NextResponse(imageBuffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, must-revalidate', // Cache for 1 year
      'Last-Modified': lastModified.toUTCString(),
    },
  });
}
