import React, { useState } from 'react';
import { useRecordPayment } from '../../hooks/useRecordPayment';
import Button from '../Button';

interface RecordPaymentFormProps {
    loanId: string;
    onPaymentRecorded?: () => void;
}

export const RecordPaymentForm: React.FC<RecordPaymentFormProps> = ({ loanId, onPaymentRecorded }) => {
    const [amount, setAmount] = useState<number | ''>('');
    const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
    const { recordPayment, loading, error, success } = useRecordPayment();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (amount === '' || amount <= 0) {
            alert('Please enter a valid amount.');
            return;
        }
        if (!paymentDate) {
            alert('Please select a payment date.');
            return;
        }

        const newPayment = await recordPayment({
            loan_id: loanId,
            amount_paid: Number(amount),
            payment_date: paymentDate,
        });

        if (newPayment && onPaymentRecorded) {
            onPaymentRecorded();
            setAmount(''); // Clear form after successful submission
            setPaymentDate(new Date().toISOString().split('T')[0]);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Record New Payment</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                        Amount
                    </label>
                    <input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        step="0.01"
                        min="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-500"
                        required
                        disabled={loading}
                    />
                </div>
                <div>
                    <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Date
                    </label>
                    <input
                        type="date"
                        id="paymentDate"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-500"
                        required
                        disabled={loading}
                    />
                </div>
                <Button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-offset-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'Recording...' : 'Record Payment'}
                </Button>

                {success && (
                    <p className="text-green-600 text-sm mt-2">Payment recorded successfully!</p>
                )}
                {error && (
                    <p className="text-red-600 text-sm mt-2">Error: {error}</p>
                )}
            </form>
        </div>
    );
};
