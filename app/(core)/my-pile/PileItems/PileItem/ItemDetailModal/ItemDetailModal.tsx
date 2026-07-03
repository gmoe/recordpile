import { useState } from 'react';
import { LibraryBig, FilePen } from 'lucide-react';

import { Dialog, DialogContent, DialogHeading, DialogDescription, DialogFooter } from '@/app/components/Dialog';
import Tabs from '@/app/components/Tabs';
import { type ClientPileItem } from '../../../actions';
import ReleasePanel from './ReleasePanel';
import EditPanel from './EditPanel';

type EditItemProps = {
  item: ClientPileItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function ItemDetailModal({
  item,
  open,
  onOpenChange,
}: EditItemProps) {
  const [currentTab, setCurrentTab] = useState<'edit' | 'info'>('edit');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeading>Edit Item</DialogHeading>
        <DialogDescription>
          {currentTab === 'edit' && (
            <EditPanel item={item} onOpenChange={onOpenChange} />
          )}
          {currentTab === 'info' && (
            <ReleasePanel item={item} open={open} />
          )}
        </DialogDescription>
        <DialogFooter alignment="center">
          <Tabs>
            <Tabs.Tab
              active={currentTab === 'edit'}
              icon={FilePen}
              onClick={() => setCurrentTab('edit')}
              label="Edit Item"
            />
            <Tabs.Tab
              active={currentTab === 'info'}
              icon={LibraryBig}
              onClick={() => setCurrentTab('info')}
              label="Release Info"
            />
          </Tabs>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
