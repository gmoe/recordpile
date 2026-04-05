'use server';
import {
  startOfMonth,
  startOfYear,
  interval,
  eachDayOfInterval,
  subDays,
  format,
} from 'date-fns';
import { UTCDate, utc } from '@date-fns/utc';
import { sql, count, between, gt, eq, desc, and } from 'drizzle-orm';

import { database } from '@/app/db';
import { pileItems, PileItemStatus } from '@/app/db/schemas/pileItems';

/*
 * TODO: Stats ideas
 *
 * – [x] Average time to listen
 * – [ ] Line chart: y - Number of albums heard, x - month/year
 * – [x] Line chart: y - Number of albums heard, x - day/month
 * – [x] 10 Most heard artists in month, year
 * - [ ] Total albums heard
 * – [ ] 10 Most heard labels in month, year
 * – [ ] Average release year in current month, year
 * – [ ] Genres of the past
 *
 * --------------
 * TODO: Goal tracking
 * – On track for albums per year
 */


export async function getAverageTimeToListen(): Promise<number | null> {
  const result = await database
    .select({
      average: sql<number>`AVG(EXTRACT(DAY FROM (${pileItems.finishedAt} - ${pileItems.addedAt})))`,
    }).from(pileItems);

  return result[0].average;
}

export type AlbumsHeardHistory = {
   finishedDay: Date;
   count: string;
   albumNames: string[];
}

export async function getNumberAlbumsHeard(
  timeFrame: 'month' | 'year'
): Promise<AlbumsHeardHistory[]> {
  const startDate = timeFrame === 'month'
    ? subDays(new UTCDate(), 30, { in: utc })
    : startOfYear(new UTCDate(), { in: utc });

  const endDate = new UTCDate();

  const statsResult = await database
    .select({
      finishedDay: sql<Date>`DATE_TRUNC('Day', ${pileItems.finishedAt})`,
      count: count(),
      albumNames: sql<string[]>`ARRAY_AGG(${pileItems.albumName})`,
    })
    .from(pileItems)
    .where(between(pileItems.finishedAt, startDate, endDate))
    .groupBy(({ finishedDay }) => finishedDay);

  const mapForDay = (date: Date) => format(date, 'LL dd');

  const statsByDay = statsResult.reduce((acc, data) => {
    acc[mapForDay(data.finishedDay)] = { ...data, count: `${data.count}` };
    return acc;
  }, {} as Record<string, AlbumsHeardHistory>);

  return eachDayOfInterval(interval(startDate, endDate)).map((day) => (
    statsByDay[mapForDay(day)] ?? {
      finishedDay: day,
      count: '0',
      albumNames: [],
    }
  ));
}

export async function getTotalAlbumCount(
  timeFrame: '30days' | 'month' | 'year'
): Promise<number> {
  const now = new Date();

  const startDate = (() => {
    switch (timeFrame) {
      case '30days': return subDays(now, 30, { in: utc });
      case 'month': return startOfMonth(now, { in: utc });
      case 'year': return startOfYear(now, { in: utc });
    }
  })();

  const count = await database
    .$count(pileItems, and(
      eq(pileItems.status, PileItemStatus.FINISHED),
      gt(pileItems.finishedAt, startDate),
    ));

  return count;
}

export async function getTopArtistsHeard(
  timeFrame: '30days' | 'month' | 'year' | 'allTime'
): Promise<{ artistName: string, count: number }[]> {
  const now = new Date();
  // TODO
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const startDate = (() => {
    switch (timeFrame) {
      case '30days': return subDays(now, 30, { in: utc });
      case 'month': return startOfMonth(now, { in: utc });
      case 'year': return startOfYear(now, { in: utc });
      case 'allTime': return (new Date(0), { in: utc });
    }
  })();

  const statsResult = await database
    .select({
      artistName: pileItems.artistName,
      count: count(),
    })
    .from(pileItems)
    .where(eq(pileItems.status, PileItemStatus.FINISHED))
    .groupBy(pileItems.artistName)
    .orderBy(({ count }) => desc(count));

  return statsResult;
}
