export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
};

export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: "analytics_access_token",
  REGISTRATION_TOKEN: "analytics_registration_token",
};

export const FRONTEND_ROUTES = {
  LANDING: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
};

export const API_ROUTES = {
  DASHBOARDS: {
    BASE: "/dashboards",
    BY_ID: (id: string) => `/dashboards/${id}`,
  },
  INGESTION: {
    EVENTS: "/analytics/events",
  },
  TRENDS: {
    BASE: "/query/trends",
  },
  COMPARISON: { BASE: "/query/comparison" },
  FUNNEL: { BASE: "/query/funnel" },
  RETENTION: { BASE: "/query/retention" },
  BREAKDOWN: { BASE: "/query/breakdown" },
  CONVERSION: { BASE: "/query/conversion" },
  DRILLDOWN: { BASE: "/query/drilldown" },
  DROPOFF: { BASE: "/query/dropoff" },
  DURATION: { BASE: "/query/duration" },
  EVENT: { BASE: "/query/event" },
  SESSION: { BASE: "/query/session" },
  MANAGEMENT: {
    ACQUISITION: "/management/acquisition",
    ALERT: "/management/alert",
    ANALYTICSCONFIG: "/management/analyticsconfig",
    AUDIT: "/management/audit",
    EXPORT: "/management/export",
    FILTER: "/management/filter",
    IDENTITY: "/management/identity",
    USERPROFILE: "/management/userprofile",
  },
  SYSTEM: {
    STATUS: "/status",
    HEALTH: "/health",
  },
};

export const QUERY_KEYS = {
  DASHBOARDS: {
    ALL: ["dashboards"] as const,
    DETAIL: (id: string) => ["dashboards", id] as const,
  },
  TRENDS: {
    ALL: ["trends"] as const,
  },
  COMPARISON: { ALL: ["comparison"] as const },
  FUNNEL: { ALL: ["funnel"] as const },
  RETENTION: { ALL: ["retention"] as const },
  BREAKDOWN: { ALL: ["breakdown"] as const },
  CONVERSION: { ALL: ["conversion"] as const },
  DRILLDOWN: { ALL: ["drilldown"] as const },
  DROPOFF: { ALL: ["dropoff"] as const },
  DURATION: { ALL: ["duration"] as const },
  EVENT: { ALL: ["event"] as const },
  SESSION: { ALL: ["session"] as const },
  MANAGEMENT: {
    ACQUISITION: ["management_acquisition"] as const,
    ALERT: ["management_alert"] as const,
    ANALYTICSCONFIG: ["management_analyticsconfig"] as const,
    AUDIT: ["management_audit"] as const,
    EXPORT: ["management_export"] as const,
    FILTER: ["management_filter"] as const,
    IDENTITY: ["management_identity"] as const,
    USERPROFILE: ["management_userprofile"] as const,
  },
  SYSTEM: {
    STATUS: ["status"] as const,
    HEALTH: ["health"] as const,
  }
};
