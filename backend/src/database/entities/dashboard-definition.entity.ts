import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { DashboardUser } from './dashboard-user.entity';
import { DashboardWidget } from './dashboard-widget.entity';
import { InsightVisibility } from './saved-insight.entity';

@Entity('dashboard_definitions')
export class DashboardDefinition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: InsightVisibility, default: InsightVisibility.SHARED })
  visibility: InsightVisibility;

  @Column({ name: 'owner_user_id' })
  ownerUserId: string;

  @ManyToOne(() => DashboardUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_user_id' })
  ownerUser: DashboardUser;

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @OneToMany(() => DashboardWidget, (widget) => widget.dashboard, { cascade: true })
  widgets: DashboardWidget[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
