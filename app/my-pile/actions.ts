'use server';
import { revalidatePath } from 'next/cache';
import { MusicBrainzApi, IReleaseGroupList } from 'musicbrainz-api';
import { DiscogsClient } from '@lionralfs/discogs-client';
import { dbSource, PileItem } from '@/app/models';

const mbApi = new MusicBrainzApi({
  appName: 'record-pile',
  appVersion: '0.1.0',
  appContactInfo: 'me@griffinmoe.com',
});

export type ClientPileItem = PileItem & {
  coverImageUrl: string;
};

export async function getPileItems(): Promise<ClientPileItem[]> {
  const con = await dbSource();
  const pileItems = await con.pileItemRepo.find();

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
  const releases = await mbApi.search('release-group', { query });
  return releases;
}

export async function createPileItem(formData: FormData) {
  const item = new PileItem();

  // TODO validation
  item.artistName = formData.get('artistName') as string;
  item.albumName = formData.get('albumName') as string;
  if (formData.has('coverImage')) {
    const buffer = await (formData.get('coverImage') as File).arrayBuffer();
    item.coverImage = await Buffer.from(buffer);
  }

  const con = await dbSource();
  await con.pileItemRepo.save(item);
  revalidatePath('/my-pile');
}
