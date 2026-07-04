import { NextResponse, NextRequest } from 'next/server';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import type { IRelease, ILabel, IMedium } from 'musicbrainz-api';

import { database } from '@/app/db';
import { mbApi, sanitize, type Sanitize } from '@/app/lib/musicBrainz';
import { pileItems } from '@/app/db/schemas/pileItems';

export type PileItemDetailResponse = Pick<
  Sanitize<IRelease> & {
    labelInfo?: {
      catalogNumber?: string;
      label: Sanitize<ILabel>;
    }
  },
  'country' | 'date' | 'disambiguation' | 'labelInfo' | 'releaseEvents'
> & {
  media: Sanitize<IMedium>;
};

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/pile-item/[id]'>) {
  const { id } = await ctx.params;

  const pileItem = await database.query.pileItems.findFirst({
    where: eq(pileItems.id, id),
    columns: { coverImage: false },
  });

  if (!pileItem) {
    return notFound();
  }

  if (pileItem.musicBrainzReleaseGroupId) {
    const releases = await mbApi.browse(
      'release',
      { 'release-group': pileItem.musicBrainzReleaseGroupId },
      ['artist-rels', 'labels', 'recordings']
    ); 

    if (releases.releases[0]) {
      const firstRelease = sanitize(releases.releases[0]) as Sanitize<IRelease> & {
        labelInfo: { catalogNumber: string; label: Sanitize<ILabel> }[],
      };
      return NextResponse.json({
        country: firstRelease.country,
        date: firstRelease.date,
        disambiguation: firstRelease.disambiguation,
        media: firstRelease.media[0],
        labelInfo: firstRelease.labelInfo[0],
        releaseEvents: firstRelease.releaseEvents,
      } as PileItemDetailResponse);
    }
  }

  return NextResponse.json(
    { error: 'Failed to fetch pile item details' },
    { status: 500 }
  );
}
