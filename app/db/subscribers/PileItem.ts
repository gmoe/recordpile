import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { PileItem } from '@/app/db/entities/PileItem';
import { PileItemStatus, PileItemStatusLabels } from '@/app/db/entities/PileItemTypes';

@EventSubscriber()
export class PileItemSubscriber implements EntitySubscriberInterface<PileItem> {
  listenTo() {
    return PileItem;
  }

  async beforeInsert(event: InsertEvent<PileItem>) {
    if (event.entity.orderIndex === undefined || event.entity.orderIndex === null) {
      const repository = event.manager.getRepository(PileItem);

      const maxOrder = await repository
        .createQueryBuilder('entity')
        .select('MAX(entity.orderIndex)', 'max')
        .getRawOne();

      event.entity.orderIndex = (maxOrder.max || 0) + 1;
    }
  }

  beforeUpdate(event: UpdateEvent<PileItem>) {
    if (event.entity?.status) {
      switch (event.entity.status) {
        case PileItemStatus.LISTENED:
          event.entity.listenedAt = new Date();
          break;
        case PileItemStatus.DID_NOT_FINISH:
          event.entity.didNotFinishAt = new Date();
          break;
        case PileItemStatus.QUEUED:
          break;
        default: throw new Error('Unhandled PileItemStatus');
      }
    }
  }
}
