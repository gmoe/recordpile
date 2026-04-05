'use server';
import { revalidatePath } from 'next/cache';
import { notFound } from 'next/navigation';
import { MusicBrainzApi } from 'musicbrainz-api';
import { DiscogsClient } from '@lionralfs/discogs-client';
import { asc, desc, eq, ilike, and, or, inArray } from 'drizzle-orm';
import { generateKeyBetween } from 'fractional-indexing';

import { SortableContract } from '@/app/api/types';
import { sanitizeReleaseGroupList, type MBReleaseGroup, type MBResultList } from '@/app/util/musicBrainz';
import { database } from '@/app/db';
import {
  pileItems,
  PileItem,
  PileItemInsert,
  PileItemStatus,
} from '@/app/db/schemas/pileItems';

const mbApi = new MusicBrainzApi({
  appName: 'record-pile',
  appVersion: '0.1.0',
  appContactInfo: 'me@griffinmoe.com',
});

export type ClientPileItem = Omit<PileItem, 'coverImage'> & {
  coverImageUrl: string;
};

export type PileItemSearchFilters = {
  searchQuery?: string;
  filters?: {
    owned?: boolean;
    status?: PileItemStatus[];
  };
  sort?: SortableContract<PileItem, 'position' | 'artistName' | 'albumName' | 'addedAt' | 'finishedAt' | 'didNotFinishAt'>;
};

export async function getPileItems(
  searchFilters: PileItemSearchFilters = {},
): Promise<ClientPileItem[]> {
  const { field: sortField, order: sortOrder } = searchFilters?.sort ?? {
    field: 'position',
    order: 'ASC',
  };

  const orderDir = sortOrder === 'ASC' ? asc : desc;
  const items = await database.query.pileItems.findMany({
    columns: {
      coverImage: false,
    },
    orderBy: [orderDir(pileItems[sortField])],
    where: and(
      ...(searchFilters.searchQuery ? [or(
        ilike(pileItems.artistName, `%${searchFilters.searchQuery}%`),
        ilike(pileItems.albumName, `%${searchFilters.searchQuery}%`),
      )] : []),
      ...(searchFilters.filters?.status ? [
        inArray(pileItems.status, searchFilters.filters.status)
      ] : []),
    ),
  });

  return items.map((item) => ({
    ...item,
    coverImageUrl: `/api/cover-image/${item.id}`,
  }));
}

export async function getDiscogsCollection() {
  const d = new DiscogsClient({
    userAgent: 'RecordPile/1.0.0',
    auth: {
      userToken: process.env.DISCOGS_USER_TOKEN,
    },
  });

  const collection = await d.user().collection().getReleases('nullchord', 0, {
    sort: 'added',
    sort_order: 'desc'
  });

  // TODO: Fetch all pages

  return collection;
}

export type ClientReleaseGroup = MBReleaseGroup & {
  inPile: boolean;
};

export async function searchForNewItems(query: string): Promise<MBResultList<ClientReleaseGroup>> {
  // TODO: Handle pagination
  const releases = sanitizeReleaseGroupList(
    await mbApi.search('release-group', { query })
  );

  const existingMatches = await database.query.pileItems.findMany({
    columns: {
      coverImage: false,
    },
    where: inArray(
      pileItems.musicBrainzReleaseGroupId,
      releases.results.map((group) => group.id)
    ),
  });
  const itemsMap = existingMatches.reduce<Record<PileItem['id'], boolean>>((acc, item) => {
    if (item.musicBrainzReleaseGroupId) {
      acc[item.musicBrainzReleaseGroupId] = true;
    }
    return acc;
  }, {});

  const clientReleases: ClientReleaseGroup[] = releases.results.map((release) => ({
    ...release,
    inPile: itemsMap[release.id] ?? false,
  }));

  return {
    ...releases,
    results: clientReleases,
  };
}

export async function createPileItem(pileItem: {
  artistName: string,
  albumName: string,
  musicBrainzReleaseGroupId?: string,
}) {
  const item = {} as PileItemInsert;

  // TODO validation
  item.artistName = pileItem.artistName;
  item.albumName = pileItem.albumName;

  // Generate a fractional-indexing position after the current last item
  const lastItem = await database.query.pileItems.findFirst({
    columns: { position: true },
    orderBy: [desc(pileItems.position)],
  });
  item.position = generateKeyBetween(lastItem?.position ?? null, null);

  if (pileItem.musicBrainzReleaseGroupId) {
    item.musicBrainzReleaseGroupId = pileItem.musicBrainzReleaseGroupId;
    const coverImageRes = await fetch(
      `https://coverartarchive.org/release-group/${pileItem.musicBrainzReleaseGroupId}/front-1200`
    );
    const coverImage = await coverImageRes.arrayBuffer();
    const b = await Buffer.from(coverImage);
    item.coverImage = b;
  }

  await database.insert(pileItems).values(item);

  // Notify client-side containers that items have changed
  revalidatePath('/my-pile');
}

export async function updatePileItem(
  id: PileItem['id'],
  payload: Partial<Pick<PileItem, 'status' | 'owned' | 'notes'>>
) {
  // TODO: Validation
  await database.update(pileItems).set(payload).where(eq(pileItems.id, id));
  revalidatePath('/my-pile');
}

export async function reorderPileItem(id: PileItem['id'], newPosition: string) {
  await database
    .update(pileItems)
    .set({ position: newPosition })
    .where(eq(pileItems.id, id));

  revalidatePath('/my-pile');
}

export async function deletePileItem(id: string) {
  try {
    await database.delete(pileItems).where(eq(pileItems.id, id));
  } catch (error) {
    console.error(error);
    return notFound();
  }

  revalidatePath('/my-pile');
}
