import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('session_metadata')
export class SessionMetadata {
  @PrimaryColumn()
  session_id: string;

  @Column({ nullable: true })
  user_id: string;

  @Column({ nullable: true })
  anonymous_id: string;

  @Column({ nullable: true })
  started_at: Date;

  @Column({ nullable: true })
  ended_at: Date;

  @Column({ type: 'jsonb', nullable: true })
  acquisition: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
