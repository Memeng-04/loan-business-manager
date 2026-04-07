export interface Borrower {
  id?: string;
  full_name: string;
  email?: string;
  address?: string;
  phone?: string;
  created_at?: string;
  monthly_income?: number;
  source_of_income?: string;
  secondary_contact_number?: string;
  secondary_contact_name?: string;
}

export interface CreateBorrowerInput {
  full_name: string;
  email?: string;
  address?: string;
  phone: string;
  monthly_income?: number;
  source_of_income?: string;
  secondary_contact_number?: string;
  secondary_contact_name?: string;
}
