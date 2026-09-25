import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EventDefinition } from './event-definition.entity';

@Entity('event_property_definitions')
export class EventPropertyDefinition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'event_definition_id' })
  eventDefinitionId: string;

  @ManyToOne(() => EventDefinition, (eventDef) => eventDef.properties, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_definition_id' })
  eventDefinition: EventDefinition;

  @Column({ name: 'property_name' })
  propertyName: string;

  @Column({ name: 'display_name', nullable: true })
  displayName: string;

  @Column({ name: 'data_type', default: 'string' })
  dataType: string;

  @Column({ default: false })
  required: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
