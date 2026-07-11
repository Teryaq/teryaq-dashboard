export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  pharmacyName: string;
  branchName: string;
  branchAddress?: string | null;
  branchPhone?: string | null;
  ownerEmail: string;
  ownerPassword: string;
}

export type AuthRole = 'Owner' | 'Pharmacist';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: AuthRole;
  tenantId: string;
  branchId: string | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: AuthUser;
  tenantId: string;
  branchId: string | null;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  tenantId: string;
  branchId: string | null;
  role: AuthRole;
  user: AuthUser;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
