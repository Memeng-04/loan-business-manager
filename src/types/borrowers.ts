export interface Borrower {
  id?: string;
  full_name: string;
  email?: string;
  address?: string;
  phone?: string;
  notes?: string;
  created_at?: string;
  monthly_income?: number;
  source_of_income?: string;
  secondary_contact_number?: string;
  secondary_contact_name?: string;
  bank_ewallet_details?: string;
}

export interface CreateBorrowerInput {
  full_name: string;
  email?: string;
  address?: string;
  phone: string;
  notes?: string;
  monthly_income?: number;
  source_of_income?: string;
  secondary_contact_number?: string;
  secondary_contact_name?: string;
  bank_ewallet_details?: string;
}
