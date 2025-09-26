import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('verification')
export class Verification {
  @PrimaryColumn('text')
  id: string;

  @Column('text', { name: 'identifier', nullable: false })
  identifier: string;

  @Column('text', { name: 'value', nullable: false })
  value: string;

  @Column('date', { name: 'expiresAt', nullable: false })
  expiresAt: Date;

  @Column('date', { name: 'createdAt', nullable: false })
  createdAt: Date;

  @Column('date', { name: 'updatedAt', nullable: false })
  updatedAt: Date;

}