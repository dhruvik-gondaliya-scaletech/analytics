import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { EventPropertyDefinition } from './event-property-definition.entity';

export enum EventStatus {
  ACTIVE = 'ACTIVE',
  DEPRECATED = 'DEPRECATED',
  ARCHIVED = 'ARCHIVED',
  UNREGISTERED = 'UNREGISTERED',
}

@Entity('event_definitions')
export class EventDefinition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'event_name', unique: true })
  eventName: string;

  @Column({ name: 'display_name', nullable: true })
  displayName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true, default: 'general' })
  category: string;

  @Column({ type: 'enum', enum: EventStatus, default: EventStatus.UNREGISTERED })
  status: EventStatus;

  @Column({ name: 'expected_schema', type: 'jsonb', nullable: true })
  expectedSchema: Record<string, any>;

  @Column({ name: 'first_seen_at', type: 'timestamp with time zone', nullable: true })
  firstSeenAt: Date | null;

  @Column({ name: 'last_seen_at', type: 'timestamp with time zone', nullable: true })
  lastSeenAt: Date | null;

  @OneToMany(() => EventPropertyDefinition, (prop) => prop.eventDefinition, {
    cascade: true,
  })
  properties: EventPropertyDefinition[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
