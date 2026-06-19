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

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  tenantId: string;
  branchId: string | null;
  role: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  tenantId: string;
  branchId: string | null;
  role: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
