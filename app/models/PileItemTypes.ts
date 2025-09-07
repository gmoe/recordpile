export enum PileItemStatus {
  QUEUED = 'queued',
  LISTENED = 'listened',
  DID_NOT_FINISH = 'dnf',
}

export const PileItemStatusLabels: Record<PileItemStatus, string> = {
  [PileItemStatus.QUEUED]: 'Queued',
  [PileItemStatus.LISTENED]: 'Listened',
  [PileItemStatus.DID_NOT_FINISH]: 'Did Not Finish',
};
