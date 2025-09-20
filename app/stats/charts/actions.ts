'use server';
import { revalidatePath } from 'next/cache';
import {
  startOfMonth,
  startOfYear,
  interval,
  eachDayOfInterval,
} from 'date-fns';
import { Between } from 'typeorm';

import { dbSource, PileItem } from '@/app/models';
import { PileItemStatus } from '@/app/models/PileItemTypes';

/*
 * TODO: Stats ideas
 *
 * – [x] Average time to listen
 * – [ ] Line chart: y - Number of albums heard, x - month
 * – [ ] Line chart: y - Number of albums heard, x - week
 * – [ ] 10 Most heard artists in month, year
 * – [ ] 10 Most heard labels in month, year
 * – [ ] Average release year in current month, year
 * – [ ] Genres of the past
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

export type AlbumsHeardHistory = {
   listenedDay: Date;
   count: string;
   albumNames: string[];
}

export async function getNumberAlbumsHeard(timeFrame: 'month' | 'year'): Promise<AlbumsHeardHistory[]> {
  const con = await dbSource();

  const startDate = timeFrame === 'month'
    ? startOfMonth(new Date())
    : startOfYear(new Date());

  const endDate = new Date();

  const statsResult = await con.pileItemRepo
    .createQueryBuilder('pileItem')
    .select('DATE_TRUNC(\'Day\', "listenedAt")', 'listenedDay')
    .addSelect('COUNT(*)', 'count')
    .addSelect('ARRAY_AGG(pileItem.albumName)', 'albumNames')
    .where('pileItem.listenedAt BETWEEN :startDate AND :endDate', { startDate, endDate })
    .groupBy('"listenedDay"')
    .getRawMany();

  const statsByDay = statsResult.reduce((acc, data) => {
    acc[data.listenedDay.toString()] = data;
    return acc;
  }, {}) as Record<string, AlbumsHeardHistory>;

  return eachDayOfInterval(interval(startDate, endDate)).map((day) => (
    statsByDay[day.toString()] ?? {
      listenedDay: day,
      count: '0',
      albumNames: [],
    }
  ));
}
