'use server';
import { revalidatePath } from 'next/cache';
import { notFound } from 'next/navigation';
import { MusicBrainzApi, IReleaseGroupList } from 'musicbrainz-api';
import { DiscogsClient } from '@lionralfs/discogs-client';
import { FindManyOptions, ILike, Any } from 'typeorm';

import { SortableContract } from '@/app/api/types';
import { dbSource, PileItem, PileItemStatus } from '@/app/db';

const mbApi = new MusicBrainzApi({
  appName: 'record-pile',
  appVersion: '0.1.0',
  appContactInfo: 'me@griffinmoe.com',
});

export type ClientPileItem = PileItem & {
  coverImageUrl: string;
};

type PileItemSearchFilters = {
  searchQuery?: string;
  filters?: {
    owned?: boolean;
    status?: PileItemStatus[];
  };
  sort?: SortableContract<PileItem, 'orderIndex' | 'artistName' | 'albumName' | 'addedAt' | 'listenedAt' | 'didNotFinishAt'>;
};

export async function getPileItems(
  searchFilters: PileItemSearchFilters = {},
): Promise<ClientPileItem[]> {
  const con = await dbSource();

  const { field: sortField, order: sortOrder } = searchFilters?.sort ?? {
    field: 'orderIndex',
    order: 'DESC',
  };

  const query = {
    order: {
      [sortField]: sortOrder,
    },
  } as FindManyOptions<PileItem>;
  if (searchFilters.searchQuery) {
    query.where = [
      { artistName: ILike(`%${searchFilters.searchQuery}%`) },
      { albumName: ILike(`%${searchFilters.searchQuery}%`) },
    ];

    if (searchFilters.filters?.status) {
      query.where = query.where.map((part) => ({
        ...part,
        status: Any(searchFilters.filters?.status ?? []),
      }));
    }
  } else if (searchFilters.filters?.status) {
    query.where = {
      status: Any(searchFilters.filters.status),
    };
  }

  const pileItems = await con.pileItemRepo.find(query);

  return pileItems.map((item) => ({
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
  const item = new PileItem();

  // TODO validation
  item.artistName = pileItem.artistName;
  item.albumName = pileItem.albumName;
  if (pileItem.musicBrainzReleaseGroupId) {
    item.musicBrainzReleaseGroupId = pileItem.musicBrainzReleaseGroupId;
    const coverImageRes = await fetch(
      `https://coverartarchive.org/release-group/${pileItem.musicBrainzReleaseGroupId}/front-1200`
    );
    const coverImage = await coverImageRes.bytes();
    item.coverImage = await Buffer.from(coverImage);
  }

  const con = await dbSource();
  await con.pileItemRepo.save(item);

  revalidatePath('/my-pile');
}

export async function updatePileItem(
  id: PileItem['id'],
  payload: Partial<Pick<PileItem, 'status' | 'owned' | 'notes'>>
) {
  const con = await dbSource();

  // TODO: Validation
  await con.pileItemRepo.update({ id }, payload);
  revalidatePath('/my-pile');
}

export async function reorderPileItem(id: PileItem['id'], newPosition: number) {
  const con = await dbSource();

  await con.dataSource.transaction(async manager => {
    const item = await manager.findOne(PileItem, { where: { id } });
    if (!item) {
      notFound();
      return;
    }
    const oldPosition = item.orderIndex;

    if (newPosition > oldPosition) {
      // Moving down: decrement order of items between old and new position
      await manager
        .createQueryBuilder()
        .update(PileItem)
        .set({ orderIndex: () => 'orderIndex - 1' })
        .where('orderIndex > :oldPos AND orderIndex <= :newPos', {
          oldPos: oldPosition,
          newPos: newPosition
        })
        .execute();
    } else {
      // Moving up: increment order of items between new and old position
      await manager
        .createQueryBuilder()
        .update(PileItem)
        .set({ orderIndex: () => 'orderIndex + 1' })
        .where('orderIndex >= :newPos AND orderIndex < :oldPos', {
          newPos: newPosition,
          oldPos: oldPosition
        })
        .execute();
    }

    await manager.update(PileItem, id, { orderIndex: newPosition });
  });
  revalidatePath('/my-pile');
}

export async function deletePileItem(id: string) {
  const con = await dbSource();

  try {
    await con.pileItemRepo.delete(id);
  } catch (error) {
    return notFound();
  }

  revalidatePath('/my-pile');
}
