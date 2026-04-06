import { useEffect, useState } from "react";
import { BorrowerRepository } from "../repositories/BorrowerRepository";
import type { Borrower } from "../types/borrowers";

export function useBorrowers() {
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchBorrowers() {
      setLoading(true);
      setError(null);

      try {
        const data = await BorrowerRepository.getAll();

        if (isMounted) {
          setBorrowers(data);
        }
      } catch (err) {
        if (isMounted) {
          const message =
            err instanceof Error ? err.message : "Failed to load borrowers.";
          setError(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchBorrowers();

    return () => {
      isMounted = false;
    };
  }, []);

  return { borrowers, loading, error };
}
