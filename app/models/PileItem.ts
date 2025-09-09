import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  EventSubscriber,
  EntitySubscriberInterface,
  UpdateEvent,
} from 'typeorm';
import { PileItemStatus, PileItemStatusLabels } from './PileItemTypes';

@Entity()
export class PileItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: 'enum',
    enum: PileItemStatus,
    default: PileItemStatus.QUEUED,
  })
  status: PileItemStatus;

  @Column({ type: 'text' })
  artistName: string;

  @Column({ type: 'text' })
  albumName: string;

  @Column({ type: 'boolean', default: false })
  owned: boolean;

  @Column({
    type: 'text',
    unique: true,
    nullable: true,
  })
  discogsReleaseId: string;

  @Column({
    type: 'text',
    unique: true,
    nullable: true,
  })
  musicBrainzReleaseGroupId: string;

  @Column({
    type: 'bytea',
    nullable: true,
    select: false,
  })
  coverImage: Buffer<ArrayBuffer>;

  @CreateDateColumn({ insert: true })
  addedAt: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  listenedAt: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  didNotFinishAt: Date;

  @Column({
    type: 'text',
    nullable: true,
  })
  notes: string;
}

@EventSubscriber()
export class PileItemSubscriber implements EntitySubscriberInterface<PileItem> {
  listenTo() {
    return PileItem;
  }

  beforeUpdate(event: UpdateEvent<PileItem>) {
    if (event.entity && event.databaseEntity) {
      if (event.entity.status !== event.databaseEntity.status) {
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
}
