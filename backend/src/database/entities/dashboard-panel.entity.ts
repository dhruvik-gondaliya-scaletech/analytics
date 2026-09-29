import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Dashboard } from './dashboard.entity';

@Entity('dashboard_panels')
export class DashboardPanel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'jsonb' })
  configuration: Record<string, any>; // chart type, queries, breakdown, etc.

  @ManyToOne(() => Dashboard, dashboard => dashboard.panels, { onDelete: 'CASCADE' })
  dashboard: Dashboard;

  @Column({ default: 0 })
  order: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
