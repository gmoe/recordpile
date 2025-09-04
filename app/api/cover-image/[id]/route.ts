'use server';
import { NextResponse, NextRequest } from 'next/server';
import { notFound } from 'next/navigation';
import { dbSource, PileItem } from '@/app/models';

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/cover-image/[id]'>) {
  const { id } = await ctx.params;

  const con = await dbSource();
  const pileItem = await con.pileItemRepo.findOne({
    where: { id },
    select: ['coverImage']
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
