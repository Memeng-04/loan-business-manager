import { useState } from "react";
import { BorrowerRepository } from "../repositories/BorrowerRepository";
import type { Borrower, CreateBorrowerInput } from "../types/borrowers";

export function useUpdateBorrower() {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateBorrower(
    id: string,
    input: CreateBorrowerInput,
  ): Promise<Borrower | null> {
    setUpdating(true);
    setError(null);

    try {
      return await BorrowerRepository.update(id, input);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update borrower.";
      setError(message);
      return null;
    } finally {
      setUpdating(false);
    }
  }

  return { updateBorrower, updating, error };
}
