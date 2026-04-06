import { useState } from "react";
import { BorrowerRepository } from "../repositories/BorrowerRepository";
import type { Borrower, CreateBorrowerInput } from "../types/borrowers";

export function useCreateBorrower() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function createBorrower(
    input: CreateBorrowerInput,
  ): Promise<Borrower | null> {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const saved = await BorrowerRepository.create(input);
      setSuccess(true);
      return saved;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to add borrower.";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { createBorrower, loading, error, success };
}
