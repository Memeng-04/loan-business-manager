import type { CreateBorrowerInput } from "../types/borrowers";

type BorrowerInsertPayload = {
  full_name: string;
  email: string | null;
  address: string | null;
  phone: string | null;
  notes: string | null;
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
    };
  }
}
