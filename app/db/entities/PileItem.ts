import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
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

  @Column({
    type: 'int',
    default: 0,
  })
  orderIndex: number; // User-defined order index
}
