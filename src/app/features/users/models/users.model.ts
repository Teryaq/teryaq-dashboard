/** Roles that a user can hold within a tenant. */
export type UserRole = 'Owner' | 'Pharmacist';

/** Response shape for a single user (maps to backend UserDto). */
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  branchId?: string | null;
  isLocked: boolean;
}

/** Request body for POST /users (invite a new Pharmacist). */
export interface CreateUserDto {
  email: string;
  fullName: string;
  /** Minimum 8 characters. */
  password: string;
  /** Optional — assign the new user to a specific branch. */
  branchId?: string | null;
}

/** Request body for PUT /users/{id}. */
export interface UpdateUserDto {
  fullName: string;
  /** Pass null to unassign the user from their current branch. */
  branchId?: string | null;
}
