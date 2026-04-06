export interface Payment {
    id: string;
    loan_id: string;
    amount: number;
    payment_date: string; // ISO date string
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
    status: 'recorded' | 'reversed' | 'pending';
}

export interface CreatePaymentInput {
    loan_id: string;
    amount: number;
    payment_date: string;
}
