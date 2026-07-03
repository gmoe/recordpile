'use server';
import { revalidatePath } from 'next/cache';
import { notFound } from 'next/navigation';
import { DiscogsClient } from '@lionralfs/discogs-client';
import { asc, desc, eq, ilike, and, or, inArray, gt, lte, gte, lt, sql } from 'drizzle-orm';

import { SortableContract } from '@/app/api/types';
import {
  mbApi,
  sanitizeReleaseGroupList,
  type MBReleaseGroup,
  type MBResultList,
} from '@/app/lib/musicBrainz';
import { database } from '@/app/db';
import {
  pileItems,
  PileItem,
  PileItemInsert,
  PileItemStatus,
} from '@/app/db/schemas/pileItems';
import { SORTABLE_PILE_FIELDS } from './constants';

export type ClientPileItem = Omit<PileItem, 'coverImage'> & {
  coverImageUrl: string;
};

export type PileItemSearchFilters = {
  searchQuery?: string;
  filters?: {
    owned?: boolean;
    status?: PileItemStatus[];
  };
  sort?: SortableContract<PileItem, typeof SORTABLE_PILE_FIELDS[number]>;
};

export async function getPileItems(
  searchFilters: PileItemSearchFilters = {},
): Promise<ClientPileItem[]> {
  const { field: argSortField, order: argSortOrder } = searchFilters?.sort ?? {
    field: 'orderIndex',
    order: 'DESC',
  };

  const sortField = SORTABLE_PILE_FIELDS.includes(argSortField) ? argSortField : 'orderIndex';
  const sortOrder = ['ASC', 'DESC'].includes(argSortOrder) ? argSortOrder : 'DESC';

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

  return items.map((item) => {
    const coverLastModified = encodeURIComponent((item.coverImageUpdatedAt === null
      ? (new Date(Date.UTC(0, 0, 0, 0, 0, 0)))
      : item.coverImageUpdatedAt).toISOString());

    return {
      ...item,
      coverImageUrl: `/api/cover-image/${item.id}?lastModified=${coverLastModified}`,
    };
  });
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
  if (pileItem.musicBrainzReleaseGroupId) {
    item.musicBrainzReleaseGroupId = pileItem.musicBrainzReleaseGroupId;
    const coverImageRes = await fetch(
      `https://coverartarchive.org/release-group/${pileItem.musicBrainzReleaseGroupId}/front-1200`
    );
    const coverImage = await coverImageRes.arrayBuffer();
    const b = await Buffer.from(coverImage);
    item.coverImage = b;
    item.coverImageUpdatedAt = new Date();
  }

  await database.insert(pileItems).values(item);

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

export async function resyncPileItemAlbumArt(
  id: PileItem['id'],
  musicBrainzReleaseGroupId: PileItem['musicBrainzReleaseGroupId'],
) {
  const coverImageRes = await fetch(
    `https://coverartarchive.org/release-group/${musicBrainzReleaseGroupId}/front-1200`
  );

  if (coverImageRes.ok) {
    const arrayBuffer = await coverImageRes.arrayBuffer();
    const coverImage = await Buffer.from(arrayBuffer);
    const payload = {
      coverImage,
      coverImageUpdatedAt: new Date(),
    };

    await database.update(pileItems).set(payload).where(eq(pileItems.id, id));
    revalidatePath(`/api/cover-image/${id}`);
    revalidatePath('/my-pile');
  } else {
    console.error('Error refreshing album art for', id);
    const text = await coverImageRes.text();
    console.error(text);
  }
}

export async function reorderPileItem(id: PileItem['id'], newPosition: number) {
  await database.transaction(async (tx) => {
    // Find the item
    const [item] = await tx
      .select()
      .from(pileItems)
      .where(eq(pileItems.id, id))
      .limit(1);

    if (!item) {
      notFound();
      return;
    }

    const oldPosition = item.orderIndex;

    if (newPosition > oldPosition) {
      // Moving down: decrement order of items between old and new position
      await tx
        .update(pileItems)
        .set({ orderIndex: sql`${pileItems.orderIndex} - 1` })
        .where(
          and(
            gt(pileItems.orderIndex, oldPosition),
            lte(pileItems.orderIndex, newPosition)
          )
        );
    } else {
      // Moving up: increment order of items between new and old position
      await tx
        .update(pileItems)
        .set({ orderIndex: sql`${pileItems.orderIndex} + 1` })
        .where(
          and(
            gte(pileItems.orderIndex, newPosition),
            lt(pileItems.orderIndex, oldPosition)
          )
        );
    }

    // Update the item's position
    await tx
      .update(pileItems)
      .set({ orderIndex: newPosition })
      .where(eq(pileItems.id, id));
  });

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
