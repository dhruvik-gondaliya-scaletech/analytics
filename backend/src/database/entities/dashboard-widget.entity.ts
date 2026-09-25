import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DashboardDefinition } from './dashboard-definition.entity';
import { SavedInsight } from './saved-insight.entity';

@Entity('dashboard_widgets')
export class DashboardWidget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'dashboard_id' })
  dashboardId: string;

  @ManyToOne(() => DashboardDefinition, (dash) => dash.widgets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dashboard_id' })
  dashboard: DashboardDefinition;

  @Column({ type: 'varchar', name: 'insight_id', nullable: true })
  insightId: string | null;

  @ManyToOne(() => SavedInsight, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'insight_id' })
  insight: SavedInsight | null;

  @Column({ name: 'grid_position', type: 'jsonb' })
  gridPosition: {
    x: number;
    y: number;
    w: number;
    h: number;
  };

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;
}
