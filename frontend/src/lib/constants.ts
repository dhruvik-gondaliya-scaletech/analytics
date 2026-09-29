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
  // Add other endpoints here as they are developed
};

export const QUERY_KEYS = {
  DASHBOARDS: {
    ALL: ["dashboards"] as const,
    DETAIL: (id: string) => ["dashboards", id] as const,
  },
  TRENDS: {
    ALL: ["trends"] as const,
  },
};
