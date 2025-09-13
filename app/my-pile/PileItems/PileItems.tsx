'use client';
import { useCallback, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ClientPileItem, reorderPileItem } from '../actions';
import PileItem from './PileItem';
import styles from './PileItems.module.scss';

interface PileItemsProps {
  pileItems: ClientPileItem[];
}

export default function PileItems({ pileItems }: PileItemsProps) {
  const itemIds = useMemo(() => pileItems.reverse().map((item) => item.id), [pileItems]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEng = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (active && over?.data?.current && active.id !== over.id) {
      const target = pileItems.find((item) => item.id === over.id);
      reorderPileItem(active.id as string, target!.orderIndex);
    }
  }, [itemIds, pileItems]);

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEng}
      collisionDetection={closestCenter}
    >
      <SortableContext
        items={itemIds}
        strategy={verticalListSortingStrategy}
      >
        <ol className={styles.pile}>
          {pileItems.map((item) => (
            <PileItem key={item.id} item={item} />
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  );
}
