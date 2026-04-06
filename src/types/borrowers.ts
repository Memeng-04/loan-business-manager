export interface Borrower {
  id?: string;
  full_name: string;
  business_name?: string;
  address?: string;
  phone?: string;
  notes?: string;
  created_at?: string;
}

export interface CreateBorrowerInput {
  full_name: string;
  business_name?: string;
  address?: string;
  phone?: string;
  notes?: string;
}
