import type { CreateBorrowerInput } from "../types/borrowers";

type BorrowerInsertPayload = {
  full_name: string;
  email: string | null;
  address: string | null;
  phone: string | null;
  notes: string | null;
  monthly_income: number | null;
  source_of_income: string | null;
  secondary_contact_number: string | null;
  secondary_contact_name: string | null;
  bank_ewallet_details: string | null;
};

function toNullableText(value?: string): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export class BorrowerFactory {
  static create(input: CreateBorrowerInput): BorrowerInsertPayload {
    return {
      full_name: input.full_name.trim(),
      email: toNullableText(input.email),
      address: toNullableText(input.address),
      phone: toNullableText(input.phone),
      notes: toNullableText(input.notes),
      monthly_income: input.monthly_income ?? null,
      source_of_income: toNullableText(input.source_of_income),
      secondary_contact_number: toNullableText(input.secondary_contact_number),
      secondary_contact_name: toNullableText(input.secondary_contact_name),
      bank_ewallet_details: toNullableText(input.bank_ewallet_details),
    };
  }
}
