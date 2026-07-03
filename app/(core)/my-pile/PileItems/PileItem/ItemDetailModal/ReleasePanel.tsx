import { useQuery } from '@tanstack/react-query';
import { format, parseISO, intervalToDuration, type Duration } from 'date-fns';
import { Info } from 'lucide-react';

import type { PileItemDetailResponse } from '@/app/api/pile-item/[id]/route';
import Spinner from '@/app/components/Spinner';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/app/components/Tooltip';
import { type ClientPileItem } from '../../../actions';
import styles from './ReleasePanel.module.scss';

type ReleasePanelProps = {
  item: ClientPileItem;
  open: boolean;
};

const formatPlace = (n: number): string => n <= 9 ? `0${n}` : String(n);

const formatDuration = (duration: Duration): string => {
  const orderedUnits = [
    'years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds'
  ] as Array<keyof Duration>;

  const fullDuration = orderedUnits.reduce((acc, key) => ({
    ...acc,
    [key]: duration[key] ?? 0,
  }), {} as Required<{ [k in keyof Duration]: number }>);

  const firstSigUnitIdx = orderedUnits.findIndex((unitKey) => fullDuration[unitKey] > 0);
  if (firstSigUnitIdx === -1) return '0:00';
  if (orderedUnits[firstSigUnitIdx] === 'seconds') {
    return `0:${formatPlace(fullDuration.seconds)}`;
  }

  return orderedUnits.slice(firstSigUnitIdx).map(
     (unitKey, idx, keys) => (idx + 1 === keys.length
       ? formatPlace(fullDuration[unitKey])
       : fullDuration[unitKey])
  ).join(':');
};

export default function ReleasePanel({ item, open }: ReleasePanelProps) {
  const {
    isPending: isPendingReleastDetails,
    error: errorReleaseDetails,
    data: releaseDetails,
  } = useQuery({
    enabled: open,
    queryKey: ['releaseDetails', item.id],
    queryFn: async () => {
      const res = await fetch(`/api/pile-item/${item.id}`);
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      return res.json() as Promise<PileItemDetailResponse>;
    },
  });

  if (isPendingReleastDetails) {
    return (
      <Spinner label="Fetching album details" />
    );
  }

  if (errorReleaseDetails) {
    return (
      <div>Failed to fetch release details</div>
    );
  }

  const durationStart = new Date(0);

  return (
    <div className={styles.releasePanel}>
      <h3>Release Info</h3>
      <dl className={styles.releaseInfo}>
        <dt>Release Date:</dt>
        <dd>{!releaseDetails.date ? 'Unknown' : format(parseISO(releaseDetails.date), 'PP')}</dd>
        <dt>Release Country:</dt>
        <dd>{releaseDetails.country ?? 'Unknown'}</dd>
        <dt>Record Label:</dt>
        <dd>
          {releaseDetails.labelInfo.label ? (
            <div className={styles.labelInfo}>
              <span>{releaseDetails.labelInfo.label.name}</span>
              {Boolean(releaseDetails.labelInfo.label.disambiguation) && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info />
                  </TooltipTrigger>
                  <TooltipContent>
                    {releaseDetails.labelInfo.label.disambiguation}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          ) : 'Unknown'}
        </dd>
        <dt>Catalog Number:</dt>
        <dd>{releaseDetails.labelInfo.catalogNumber ?? 'Unknown'}</dd>
      </dl>
      <hr />
      <div>
        <h3>Track List</h3>
        <ol className={styles.trackList}>
          {releaseDetails.media.tracks.map((track) => (
            <li key={track.number} className={styles.track}>
              <span>{track.number}</span>
              <span>{track.title}</span>
              <span className={styles.time}>
                {formatDuration(intervalToDuration({
                  start: durationStart,
                  end: new Date(track.length),
                }))}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
