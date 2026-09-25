export type UserRole = 'ADMIN' | 'ANALYST';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  lastLoginAt?: string;
  createdAt?: string;
}

export interface OverviewMetrics {
  dau: number;
  wau: number;
  mau: number;
  total_events: number;
  unique_users: number;
  active_sessions: number;
}

export interface TopEvent {
  event_name: string;
  count: number;
  unique_users: number;
}

export interface TrendData {
  date: string;
  events: number;
  users: number;
}

export interface OverviewData {
  metrics: OverviewMetrics;
  top_events: TopEvent[];
  trend: TrendData[];
  date_range: { from: string; to: string };
}

export interface EventItem {
  event_id: string;
  environment: string;
  event_name: string;
  event_version: number;
  timestamp: string;
  received_at: string;
  user_id: string;
  anonymous_id: string;
  session_id: string;
  ip: string;
  country: string;
  event_data: Record<string, any>;
  context: Record<string, any>;
}

export interface EventPropertyDef {
  id?: string;
  propertyName: string;
  displayName?: string;
  dataType?: string;
  required?: boolean;
  description?: string;
}

export interface EventDefinition {
  id: string;
  eventName: string;
  displayName: string;
  description: string;
  category: string;
  status: 'ACTIVE' | 'DEPRECATED' | 'ARCHIVED' | 'UNREGISTERED';
  firstSeenAt: string;
  lastSeenAt: string;
  volume?: number;
  uniqueUsers?: number;
  properties?: EventPropertyDef[];
  samplePayload?: { event_data: any; context: any };
}

export interface FunnelStep {
  step_index: number;
  step_name: string;
  unique_users: number;
  total_events: number;
  conversion_from_prev_pct: number;
  overall_conversion_pct: number;
  dropoff_count: number;
  dropoff_pct: number;
}

export interface FunnelData {
  window_days: number;
  date_range: { from: string; to: string };
  steps: FunnelStep[];
}

export interface RetentionCohort {
  cohort_date: string;
  cohort_size: number;
  retention: Array<{
    day: number;
    returning_users: number;
    retention_pct: number;
  }>;
}

export interface RetentionData {
  cohort_event: string;
  return_event: string;
  date_range: { from: string; to: string };
  cohorts: RetentionCohort[];
}

export interface SavedInsight {
  id: string;
  title: string;
  description: string;
  type: string;
  chartConfig: Record<string, any>;
  visibility: 'PRIVATE' | 'SHARED';
  ownerUserId: string;
  isPinnedToOverview: boolean;
  createdAt: string;
  updatedAt: string;
  execution_result?: any;
}

export interface DashboardWidget {
  id: string;
  dashboardId: string;
  insightId: string | null;
  insight?: SavedInsight | null;
  gridPosition: { x: number; y: number; w: number; h: number };
}

export interface Dashboard {
  id: string;
  title: string;
  description: string;
  visibility: 'PRIVATE' | 'SHARED';
  ownerUserId: string;
  isDefault: boolean;
  widgets: DashboardWidget[];
  createdAt: string;
  updatedAt: string;
}

export interface IngestionApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  lastUsedAt?: string;
  createdAt: string;
}
