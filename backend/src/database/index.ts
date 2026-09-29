import { Dashboard } from './entities/dashboard.entity';
import { DashboardPanel } from './entities/dashboard-panel.entity';
import { UserProfile } from './entities/user-profile.entity';
import { SessionMetadata } from './entities/session-metadata.entity';
import { ApiKey } from './entities/api-key.entity';
import { AuditLog } from './entities/audit-log.entity';

export const AllEntities = [
  Dashboard,
  DashboardPanel,
  UserProfile,
  SessionMetadata,
  ApiKey,
  AuditLog,
];

export const CustomRepository = [];
