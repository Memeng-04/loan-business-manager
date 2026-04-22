import type { PaymentFrequency } from './loans';

// Interest Strategy
export interface ScheduleEntry {
  id?:        string
  loan_id?:   string
  due_date:   string
  amount_due: number
  status:     'unpaid' | 'paid' | 'partial' | 'missed'
  is_penalty?: boolean
}

export interface CalculationResult {
  interest: number;
  totalPayable: number;
  interestRate: number;
  paymentAmount: number;
  endDate: string;
}

export interface IInterestStrategy {
  calculate(
    principal: number,
    termDays: number,
    frequency: PaymentFrequency,
    startDate: string,
    rateOrTotal: number
  ): CalculationResult;
}

// Payment Action Strategy
export interface PaymentActionInput {
  loanId: string;
  scheduleId: string;
  amountPaid: number;
  paymentDate: string;
  penaltyPercentage?: number;
}

export interface IPaymentActionStrategy {
  execute(input: PaymentActionInput): Promise<void>;
}

// Schedule Strategy
export interface IScheduleStrategy {
  generate(
    startDate: string,
    totalPayable: number,
    frequency: PaymentFrequency,
    termDays: number
  ): ScheduleEntry[];
}

