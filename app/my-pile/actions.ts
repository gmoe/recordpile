'use server';
import { dbSource, PileItem } from '@/app/models';

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
}
