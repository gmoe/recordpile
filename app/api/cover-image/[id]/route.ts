'use server';
import { NextResponse, NextRequest } from 'next/server';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';

import { database } from '@/app/db';
import { pileItems } from '@/app/db/schemas/pileItems';

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/cover-image/[id]'>) {
  const { id } = await ctx.params;

  const pileItem = await database.query.pileItems.findFirst({
    where: eq(pileItems.id, id),
    columns: {
      coverImage: true,
    },
  });

  if (!pileItem?.coverImage) {
    return notFound();
  }

  const imageBuffer = Buffer.from(pileItem.coverImage);

  return new NextResponse(imageBuffer, {
    headers: {
      'Content-Type': 'image/png', // TODO: Adjust based on your image type
      'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
    },
  });
}
