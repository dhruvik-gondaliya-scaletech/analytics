// ─── API Base URL ──────────────────────────────────────────────────────────────
export const API_BASE_URL = import.meta.env?.VITE_API_URL ?? "http://localhost:3000/api";

// ─── Frontend Routes (Single Source of Truth) ──────────────────────────────────
export const FRONTEND_ROUTES = {
    LANDING: "/",
    LOGIN: "/login",
    REGISTER: "/register",
    VERIFY: "/verify",
    OVERVIEW: "/overview",
    EXPLORER: "/explorer",
    REGISTRY: "/registry",
    FUNNELS: "/funnels",
    RETENTION: "/retention",
    INSIGHTS: "/insights",
    DASHBOARDS: "/dashboards",
    SETTINGS: "/settings",
    TERMS_OF_SERVICE: "/terms-of-service",
    PRIVACY_POLICY: "/privacy-policy",
    FAQ: "/faq",
} as const;

/** Alias for backward compatibility */
export const FRONTEND_ROUTE = FRONTEND_ROUTES;

// ─── Backend API Endpoints (Single Source of Truth) ───────────────────────────
export const API_ENDPOINTS = {
    // Auth
    AUTH: {
        LOGIN: "/v1/auth/login",
        LOGOUT: "/v1/auth/logout",
        ME: "/v1/auth/me",
    },

    // Analytics
    OVERVIEW: "/v1/analytics/overview",
    EVENTS: "/v1/analytics/events",
    EXPORT_CSV: "/v1/analytics/events/export.csv",
    FUNNEL: "/v1/analytics/funnel",
    RETENTION: "/v1/analytics/retention",

    // Registry
    REGISTRY_EVENTS: "/v1/registry/events",
    DEPRECATE_EVENT: (name: string) => `/v1/registry/events/${name}/deprecate`,

    // Insights
    INSIGHTS: "/v1/insights",
    INSIGHT_BY_ID: (id: string) => `/v1/insights/${id}`,
    GET_INSIGHTS: "/v1/insights",

    // Dashboards
    DASHBOARDS: "/v1/dashboards",
    DASHBOARD_BY_ID: (id: string) => `/v1/dashboards/${id}`,
    GET_DASHBOARDS: "/v1/dashboards",

    // Settings
    INGESTION_KEYS: "/v1/settings/ingestion-keys",
    KEY_BY_ID: (id: string) => `/v1/settings/ingestion-keys/${id}`,
    USERS: "/v1/settings/users",
    PURGE_USER_DATA: "/v1/settings/data-purge",
} as const;

// ─── API Config (Derived from Base URL and Endpoints) ──────────────────────────
export const API_CONFIG = {
    BASE_URL: API_BASE_URL,
    AUTH: API_ENDPOINTS.AUTH,
} as const;

// ─── Auth Storage Keys (Single Source of Truth) ────────────────────────────────
export const AUTH_STORAGE_KEYS = {
    ACCESS_TOKEN: "analytics_access_token",
    REFRESH_TOKEN: "analytics_refresh_token",
    REGISTRATION_TOKEN: "analytics_registration_token",
    EMAIL_VERIFIED: "analytics_email_verified",
    PHONE_VERIFIED: "analytics_phone_verified",
    PROFILE_COMPLETE: "analytics_profile_complete",
} as const;