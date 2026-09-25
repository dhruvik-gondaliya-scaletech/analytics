import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum KeyStatus {
  ACTIVE = 'ACTIVE',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED',
}

@Entity('ingestion_api_keys')
export class IngestionApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ name: 'key_prefix' })
  keyPrefix: string;

  @Column({ name: 'key_hash', select: false })
  keyHash: string;

  @Column({ name: 'last_used_at', type: 'timestamp with time zone', nullable: true })
  lastUsedAt: Date | null;

  @Column({ name: 'expires_at', type: 'timestamp with time zone', nullable: true })
  expiresAt: Date | null;

  @Column({ type: 'enum', enum: KeyStatus, default: KeyStatus.ACTIVE })
  status: KeyStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
