'use server';
import { revalidatePath } from 'next/cache';
import { dbSource, PileItem } from '@/app/models';
import { PileItemStatus } from '@/app/models/PileItemTypes';

/*
 * TODO: Stats ideas
 *
 * – Average time to listen
 * – Line chart: y - Number of albums heard, x - month
 * – Line chart: y - Number of albums heard, x - week
 * – 10 Most heard artists in month, year
 * – 10 Most heard labels in month, year
 * – Average release year in current month, year
 * – Genres of the past
 *
 * --------------
 * TODO: Goal tracking
 * – On track for albums per year
 */


export async function getAverageTimeToListen(): Promise<number | null> {
  const con = await dbSource();
  const result = await con.pileItemRepo
    .createQueryBuilder('pileItem')
    .select('AVG(EXTRACT(DAY FROM (pileItem.listenedAt - pileItem.addedAt)))', 'average')
    .getRawOne();
  return result.average;
}
