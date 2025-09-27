'use server';
import { revalidatePath } from 'next/cache';
import { notFound } from 'next/navigation';
import { MusicBrainzApi, IReleaseGroupList } from 'musicbrainz-api';
import { DiscogsClient } from '@lionralfs/discogs-client';
import { asc, desc, eq, ilike, and, or, inArray, gt, lte, gte, lt, sql } from 'drizzle-orm';

import { SortableContract } from '@/app/api/types';
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

type PileItemSearchFilters = {
  searchQuery?: string;
  filters?: {
    owned?: boolean;
    status?: PileItemStatus[];
  };
  sort?: SortableContract<PileItem, 'orderIndex' | 'artistName' | 'albumName' | 'addedAt' | 'finishedAt' | 'didNotFinishAt'>;
};

export async function getPileItems(
  searchFilters: PileItemSearchFilters = {},
): Promise<ClientPileItem[]> {
  const { field: sortField, order: sortOrder } = searchFilters?.sort ?? {
    field: 'orderIndex',
    order: 'DESC',
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

export async function searchForNewItems(query: string): Promise<IReleaseGroupList> {
  // TODO: Handle pagination
  const releases = await mbApi.search('release-group', { query });
  return releases;
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

// export async function reorderPileItem(id: PileItem['id'], newPosition: number) {
  // const con = await dbSource();

  // await con.dataSource.transaction(async manager => {
  //   const item = await manager.findOne(PileItem, { where: { id } });
  //   if (!item) {
  //     notFound();
  //     return;
  //   }
  //   const oldPosition = item.orderIndex;

  //   if (newPosition > oldPosition) {
  //     // Moving down: decrement order of items between old and new position
  //     await manager
  //       .createQueryBuilder()
  //       .update(PileItem)
  //       .set({ orderIndex: () => 'orderIndex - 1' })
  //       .where('orderIndex > :oldPos AND orderIndex <= :newPos', {
  //         oldPos: oldPosition,
  //         newPos: newPosition
  //       })
  //       .execute();
  //   } else {
  //     // Moving up: increment order of items between new and old position
  //     await manager
  //       .createQueryBuilder()
  //       .update(PileItem)
  //       .set({ orderIndex: () => 'orderIndex + 1' })
  //       .where('orderIndex >= :newPos AND orderIndex < :oldPos', {
  //         newPos: newPosition,
  //         oldPos: oldPosition
  //       })
  //       .execute();
  //   }

  //   await manager.update(PileItem, id, { orderIndex: newPosition });
  // });
  // revalidatePath('/my-pile');
// }
//

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
