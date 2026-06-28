/** Response shape for a single branch (maps to backend BranchDto). */
export interface Branch {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  isMain: boolean;
  isActive: boolean;
}

/** Request body for POST /branches. */
export interface CreateBranchDto {
  name: string;
  address?: string | null;
  phone?: string | null;
}

/** Request body for PUT /branches/{id}. Same fields as create. */
export type UpdateBranchDto = CreateBranchDto;
