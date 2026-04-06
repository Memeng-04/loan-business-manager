import { useState } from 'react';
import { PaymentRepository } from '../repositories/PaymentRepository';
import { CreatePaymentInput, Payment } from '../types/payments';

export const useRecordPayment = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const paymentRepository = new PaymentRepository();

    const recordPayment = async (paymentInput: CreatePaymentInput): Promise<Payment | null> => {
        setLoading(true);
        setError(null);
        setSuccess(false);
        try {
            const newPayment = await paymentRepository.recordPayment(paymentInput);
            setSuccess(true);
            return newPayment;
        } catch (err: any) {
            setError(err.message || 'Failed to record payment');
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { recordPayment, loading, error, success };
};
