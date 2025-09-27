import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('session')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('date', { name: 'expiresAt', nullable: false })
  expiresAt: Date;

  @Column('text', { name: 'token', nullable: false, unique: true })
  token: string;

  @Column('date', { name: 'createdAt', nullable: false })
  createdAt: Date;

  @Column('date', { name: 'updatedAt', nullable: false })
  updatedAt: Date;

  @Column('text', { name: 'ipAddress', nullable: true })
  ipAddress: string;

  @Column('text', { name: 'userAgent', nullable: true })
  userAgent: string;

  @Column('text', { name: 'userId', nullable: false })
  userId: string;

}
