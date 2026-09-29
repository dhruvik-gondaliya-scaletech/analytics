import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('user_profiles')
export class UserProfile {
  @PrimaryColumn()
  user_id: string; // The analytics_user_id

  @Column({ nullable: true })
  project_user_id: string;

  @Column({ type: 'jsonb', nullable: true })
  traits: Record<string, any>;

  @Column({ nullable: true })
  first_seen_at: Date;

  @Column({ nullable: true })
  last_seen_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
