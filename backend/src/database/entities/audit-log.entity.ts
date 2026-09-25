import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', name: 'user_id', nullable: true })
  userId: string | null;

  @Column()
  action: string;

  @Column({ name: 'target_type' })
  targetType: string;

  @Column({ type: 'varchar', name: 'target_id', nullable: true })
  targetId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, any> | null;

  @Column({ type: 'varchar', name: 'ip_address', nullable: true })
  ipAddress: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;
}
