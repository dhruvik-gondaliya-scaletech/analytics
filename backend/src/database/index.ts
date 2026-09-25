import { DashboardUser } from './entities/dashboard-user.entity';
import { IngestionApiKey } from './entities/ingestion-api-key.entity';
import { EventDefinition } from './entities/event-definition.entity';
import { EventPropertyDefinition } from './entities/event-property-definition.entity';
import { SavedInsight } from './entities/saved-insight.entity';
import { DashboardDefinition } from './entities/dashboard-definition.entity';
import { DashboardWidget } from './entities/dashboard-widget.entity';
import { AuditLog } from './entities/audit-log.entity';

export * from './entities/dashboard-user.entity';
export * from './entities/ingestion-api-key.entity';
export * from './entities/event-definition.entity';
export * from './entities/event-property-definition.entity';
export * from './entities/saved-insight.entity';
export * from './entities/dashboard-definition.entity';
export * from './entities/dashboard-widget.entity';
export * from './entities/audit-log.entity';

export const AllEntities = [
  DashboardUser,
  IngestionApiKey,
  EventDefinition,
  EventPropertyDefinition,
  SavedInsight,
  DashboardDefinition,
  DashboardWidget,
  AuditLog,
];
