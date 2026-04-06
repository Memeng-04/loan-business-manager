import { supabase } from '../services/supabase';
import { Payment, CreatePaymentInput } from '../types/payments';

export class PaymentRepository {
    async recordPayment(paymentInput: CreatePaymentInput): Promise<Payment | null> {
        try {
            const { loan_id, amount, payment_date } = paymentInput;

            // Call the Supabase Edge Function to record the payment
            const { data, error } = await supabase.functions.invoke('record-payment', {
                body: JSON.stringify({
                    loanId: loan_id,
                    amount: amount,
                    paymentDate: payment_date,
                }),
                // Ensure headers are correctly set for authentication
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (error) {
                console.error('Error invoking record-payment function:', error);
                throw new Error(`Failed to record payment: ${error.message}`);
            }

            if (data && data.success) {
                return data.payment as Payment;
            } else {
                console.error('record-payment function returned an error:', data);
                throw new Error(`Failed to record payment: ${data?.error || 'Unknown error'}`);
            }

        } catch (error: any) {
            console.error('PaymentRepository.recordPayment error:', error);
            throw error;
        }
    }

    async getPaymentsByLoanId(loanId: string): Promise<Payment[]> {
        try {
            const { data, error } = await supabase
                .from('payments')
                .select('*')
                .eq('loan_id', loanId)
                .order('payment_date', { ascending: true });

            if (error) {
                console.error('Error fetching payments:', error);
                throw new Error(`Failed to fetch payments: ${error.message}`);
            }

            return data as Payment[];
        } catch (error: any) {
            console.error('PaymentRepository.getPaymentsByLoanId error:', error);
            throw error;
        }
    }
}
