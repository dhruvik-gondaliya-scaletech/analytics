import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DashboardUser } from './dashboard-user.entity';

export enum InsightVisibility {
  PRIVATE = 'PRIVATE',
  SHARED = 'SHARED',
}

@Entity('saved_insights')
export class SavedInsight {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 'time_series' })
  type: string;

  @Column({ name: 'chart_config', type: 'jsonb' })
  chartConfig: Record<string, any>;

  @Column({ type: 'enum', enum: InsightVisibility, default: InsightVisibility.SHARED })
  visibility: InsightVisibility;

  @Column({ name: 'owner_user_id' })
  ownerUserId: string;

  @ManyToOne(() => DashboardUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_user_id' })
  ownerUser: DashboardUser;

  @Column({ name: 'is_pinned_to_overview', default: false })
  isPinnedToOverview: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
