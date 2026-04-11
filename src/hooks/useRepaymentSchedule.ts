import { useState, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { generateSchedule } from '../strategies/ScheduleStrategy';
import type { ScheduleEntry } from '../strategies/ScheduleStrategy';
import type { PaymentFrequency } from '../types/loans';

export const useRepaymentSchedule = () => {
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const previewFromLoan = useCallback(async (loanId: string) => {
    setLoading(true);
    setError(null);
    setSchedule([]);
    setSaved(false);

    try {
      const { data, error: fetchError } = await supabase
        .from('loans')
        .select('total_payable, frequency, start_date, end_date')
        .eq('id', loanId)
        .single();

      if (fetchError) {
        console.error("Error fetching loan data:", fetchError);
        throw new Error(`Failed to fetch loan details for ID ${loanId}. Please check if the loan was created correctly.`);
      }

      if (!data) {
        throw new Error(`No loan data found for ID ${loanId}.`);
      }

      const start = new Date(data.start_date);
      const end = new Date(data.end_date);
      const termDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      const generated = generateSchedule(
        data.start_date,
        data.total_payable,
        data.frequency as PaymentFrequency,
        termDays
      );

      setSchedule(generated);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSchedule = async (loanId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await supabase.functions.invoke(
        'generate-repayment-schedule',
        {
          body: { loanId }
        }
      );

      // Check if response has an error (from the function JSON response)
      if (response.error) {
        throw new Error(response.error.message || 'Failed to save schedule');
      }

      // Check if the data contains an error message
      if (response.data && typeof response.data === 'object' && 'error' in response.data) {
        throw new Error((response.data as { error: string }).error);
      }

      setSaved(true);
      return response.data;
    } catch (err: any) {
      let errorMessage = 'Failed to save schedule';
      
      if (err.message) {
        errorMessage = err.message;
      } else if (err.context?.error_description) {
        errorMessage = err.context.error_description;
      }
      
      setError(errorMessage);
      console.error('Save error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { schedule, previewFromLoan, saveSchedule, loading, error, saved };
};
