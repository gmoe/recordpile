import { useCallback, useRef, useState, useTransition, type SyntheticEvent } from 'react';
import { format } from 'date-fns';
import { Trash } from 'lucide-react';

import { PileItemStatus } from '@/app/db/schemas/pileItems';
import Select from '@/app/components/Select';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/app/components/Tooltip';
import missingArt from '@/app/(core)/missingArt.svg';
import {
  type ClientPileItem,
  resyncPileItemAlbumArt,
  updatePileItem,
  deletePileItem,
} from '../../../actions';
import styles from './EditPanel.module.scss';

type EditPanelProps = {
  item: ClientPileItem;
  onOpenChange: (open: boolean) => void;
};

export default function EditPanel({ item, onOpenChange }: EditPanelProps) {
  const [stagedNotes, setStagedNotes] = useState<string>(item.notes ?? '');
  const [isSavingNotes, startNoteTransition] = useTransition();
  const [noteStatusMessage, setNoteStatusMessage] = useState<string>('');
  const handleSaveNotes = useCallback(() => {
    startNoteTransition(async () => {
      try {
        await updatePileItem(item.id, { notes: stagedNotes });
        setNoteStatusMessage('Notes saved!');
      } catch (error) {
        console.error(error);
        setNoteStatusMessage('Error while saving notes');
      } finally {
        setTimeout(() => {
          setNoteStatusMessage('');
        }, 3000);
      }
    });
  }, [item.id, stagedNotes]);

  const [isDeleteTooltipVisible, setIsDeleteTooltipVisible] = useState<boolean>(false);
  const isStagingDeleteRef = useRef<boolean>(false);
  const deleteTimeoutIdRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const handleDelete = useCallback(() => {
    setIsDeleteTooltipVisible(false);
    isStagingDeleteRef.current = true;
    clearTimeout(deleteTimeoutIdRef.current);

    const handleCancel = () => {
      clearTimeout(deleteTimeoutIdRef.current);
      deleteTimeoutIdRef.current = undefined;
      window.removeEventListener('pointerup', handleCancel);
      isStagingDeleteRef.current = false;
      setIsDeleteTooltipVisible(true);
      setTimeout(() => setIsDeleteTooltipVisible(false), 1500);
    };
    window.addEventListener('pointerup', handleCancel, { once: true });

    deleteTimeoutIdRef.current = setTimeout(async () => {
      onOpenChange(false);
      await deletePileItem(item.id)
      deleteTimeoutIdRef.current = undefined;
      window.removeEventListener('pointerup', handleCancel);
      isStagingDeleteRef.current = false;
    }, 3000);
  }, [item.id, onOpenChange]);

  const albumArtRef = useRef<HTMLImageElement | null>(null);
  const [isMissingAlbumArt, setIsMissingAlbumArt] = useState<boolean>(false);
  const [hasRefreshedArt, setHasRefreshedArt] = useState<boolean>(false);
  const [isResyncingArt, startResyncingArt] = useTransition();
  const handleImageOnError = useCallback((event: SyntheticEvent<HTMLImageElement, ErrorEvent>) => {
    if (!hasRefreshedArt) {
      event.currentTarget.src = missingArt.src;
      setIsMissingAlbumArt(true);
    }
  }, [hasRefreshedArt]);

  const handleResyncAlbumArt = useCallback(() => {
    startResyncingArt(async () => {
      await resyncPileItemAlbumArt(item.id, item.musicBrainzReleaseGroupId);
      if (albumArtRef.current) {
        albumArtRef.current.src = item.coverImageUrl;
      }
      setIsMissingAlbumArt(false);
      setHasRefreshedArt(true);
    });
  }, [albumArtRef, item.coverImageUrl, item.id, item.musicBrainzReleaseGroupId]);

  return (
    <div className={styles.content}>
      <div className={styles.albumArtContainer}>
        <img
          ref={albumArtRef}
          src={item.coverImageUrl}
          alt={`Album art for ${item.albumName}`}
          loading="lazy"
          width={332}
          height={332}
          className={styles.albumArt}
          onError={handleImageOnError}
        />
        {isMissingAlbumArt && (
          <button disabled={isResyncingArt} onClick={handleResyncAlbumArt}>
            Refresh art
          </button>
        )}
      </div>
      <div className={styles.albumInfo}>
        <span className={styles.artist}>{item.artistName}</span>
        <span className={styles.album}>{item.albumName}</span>
      </div>
      <div className={styles.dates}>
        <span className={styles.date}>
          <span className={styles.label}>Added: </span>
          <span>{format(item.addedAt ?? new Date(), 'PP')}</span>
        </span>
        {item.finishedAt !== null && (
          <span className={styles.date}>
            <span className={styles.label}>Listened: </span>
            <span>{format(item.finishedAt, 'PP')}</span>
          </span>
        )}
        {item.didNotFinishAt !== null && (
          <span className={styles.date}>
            <span className={styles.label}>DNF: </span>
            <span>{format(item.didNotFinishAt, 'PP')}</span>
          </span>
        )}
      </div>
      <div className={styles.controls}>
        <Tooltip open={isDeleteTooltipVisible}>
          <TooltipTrigger asChild>
            <button onPointerDown={handleDelete}>
              <Trash />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            Press and hold for 3 seconds to delete
          </TooltipContent>
        </Tooltip>
        <Select
          onChange={(value) => updatePileItem(item.id, { status: (value as PileItemStatus) })}
          value={item.status}
        >
          <option value={PileItemStatus.QUEUED}>Queued</option>
          <option value={PileItemStatus.FINISHED}>Listened</option>
          <option value={PileItemStatus.DID_NOT_FINISH}>Did Not Finish</option>
        </Select>
      </div>
      <div className={styles.notes}>
        <label htmlFor={`notes-${item.id}`}>Notes</label>
        <textarea
          id={`notes-${item.id}`}
          onChange={(event) => setStagedNotes(event.target.value)}
          value={stagedNotes}
        />
        <div className={styles.noteControls}>
          <span>
            {noteStatusMessage}
          </span>
          <button
            type="submit"
            disabled={isSavingNotes}
            onClick={handleSaveNotes}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
