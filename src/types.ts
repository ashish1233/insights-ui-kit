/**
 * Shapes shared between the hooks and the organisms. These mirror the platform
 * HTTP contract; field names are snake_case where the wire format is.
 */

/** Tenant isolation tier (ADR-2). Assigned by the platform, never self-declared. */
export type TenantTier = 'standard' | 'restricted';

/** One row from `GET /api/insights`. */
export interface InsightRow {
  id: string;
  metric: string;
  value: number | string;
  period: string;
}

/** Response body of `GET /api/insights`. */
export interface InsightsResponse {
  rows: InsightRow[];
}

/** Response body of `GET /health`. */
export interface HealthResponse {
  status: string;
  tenant_id: string;
  tier: TenantTier;
  sdk_version: string;
}

/** Request body of `POST /token/user` on the identity service. */
export interface TokenRequest {
  tenant_id: string;
  subject: string;
  scopes: string[];
}

/** Response body of `POST /token/user`. */
export interface TokenResponse {
  token: string;
}

/** What `useAuth` persists between page loads. */
export interface Session {
  token: string;
  tenantId: string;
  subject: string;
  scopes: string[];
}
