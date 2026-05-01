import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PaymentRepository } from '../PaymentRepository';
import { supabaseAdmin, supabaseUser, TEST_USER_ID } from './test-utils';

vi.mock('../../services/auth', () => ({
  getCurrentUserId: vi.fn(() => Promise.resolve(TEST_USER_ID)),
}));

describe('PaymentRepository Integration Test', { timeout: 30000 }, () => {
  let testBorrowerId: string;
  let testLoanId: string;

  beforeEach(async () => {
    // Ensure user exists
    await supabaseAdmin.auth.admin.createUser({
      id: TEST_USER_ID,
      email: `test-lender-${Date.now()}@example.com`,
      password: 'password123',
      email_confirm: true,
    }).catch(() => {});

    // Clean up
    await supabaseAdmin.from('payments').delete().eq('user_id', TEST_USER_ID);
    await supabaseAdmin.from('payment_schedules').delete().eq('user_id', TEST_USER_ID);
    await supabaseAdmin.from('loans').delete().eq('user_id', TEST_USER_ID);
    await supabaseAdmin.from('borrowers').delete().eq('user_id', TEST_USER_ID);

    // Create a borrower
    const { data: borrower } = await supabaseAdmin.from('borrowers').insert({
      full_name: 'Payment Borrower',
      phone: '123456',
      user_id: TEST_USER_ID
    }).select('id').single();
    testBorrowerId = borrower!.id;

    // Create a loan
    const { data: loan } = await supabaseAdmin.from('loans').insert({
      borrower_id: testBorrowerId,
      user_id: TEST_USER_ID,
      principal: 1000,
      total_payable: 1100,
      interest: 100,
      interest_rate: 10,
      frequency: 'monthly',
      payment_amount: 1100,
      start_date: '2025-01-01',
      end_date: '2025-02-01',
      penalty_rate: 1,
      status: 'active'
    }).select('id').single();
    testLoanId = loan!.id;
  });

  afterEach(async () => {
    await supabaseAdmin.from('payments').delete().eq('user_id', TEST_USER_ID);
    await supabaseAdmin.from('loans').delete().eq('user_id', TEST_USER_ID);
    await supabaseAdmin.from('borrowers').delete().eq('user_id', TEST_USER_ID);
  });

  // --- GOOD PATHS ---

  it('should create and fetch a payment', async () => {
    const paymentInput = {
      loan_id: testLoanId,
      amount_paid: 500,
      payment_date: '2025-01-15'
    };

    // Create
    const payment = await PaymentRepository.create(paymentInput, supabaseAdmin);
    expect(payment).toBeDefined();
    expect(payment.amount_paid).toBe(500);

    // Fetch by Date
    const fetched = await PaymentRepository.getByDate(testLoanId, '2025-01-15', supabaseAdmin);
    expect(fetched).not.toBeNull();
    expect(fetched?.amount_paid).toBe(500);
    
    // Fetch by Loan ID
    const loanPayments = await PaymentRepository.getByLoanId(testLoanId, supabaseAdmin);
    expect(loanPayments.length).toBe(1);
    expect(loanPayments[0].id).toBe(payment.id);

    // Get Summary
    const summary = await PaymentRepository.getSummary(testLoanId, supabaseAdmin);
    expect(summary.count).toBe(1);
    expect(summary.totalPaid).toBe(500);
  });

  it('should update a payment', async () => {
    const paymentInput = {
      loan_id: testLoanId,
      amount_paid: 500,
      payment_date: '2025-01-15'
    };

    const payment = await PaymentRepository.create(paymentInput, supabaseAdmin);
    
    const updated = await PaymentRepository.update(payment.id!, { amount_paid: 600 }, supabaseAdmin);
    expect(updated.amount_paid).toBe(600);
  });

  // --- SAD PATHS ---

  it('should not allow fetching payments of another user (RLS Check)', async () => {
    const otherUserId = '550e8400-e29b-41d4-a716-446655440000';
    
    await supabaseAdmin.auth.admin.createUser({
      id: otherUserId,
      email: `other-lender-${Date.now()}@example.com`,
      password: 'password123',
      email_confirm: true,
    }).catch(() => {});

    const { data: borrower } = await supabaseAdmin.from('borrowers').insert({
      full_name: 'Other Borrower',
      user_id: otherUserId,
      phone: '999'
    }).select('id').single();

    const { data: loan } = await supabaseAdmin.from('loans').insert({
      borrower_id: borrower!.id,
      user_id: otherUserId,
      principal: 1000,
      total_payable: 1100,
      interest: 100,
      interest_rate: 10,
      frequency: 'monthly',
      payment_amount: 1100,
      start_date: '2025-01-01',
      end_date: '2025-02-01',
      penalty_rate: 1,
      status: 'active'
    }).select('id').single();

    const { data: payment } = await supabaseAdmin.from('payments').insert({
      loan_id: loan!.id,
      user_id: otherUserId,
      amount_paid: 500,
      payment_date: '2025-01-15'
    }).select('id').single();

    // Fetch using anon key (supabaseUser)
    let error: any;
    try {
      await PaymentRepository.getByDate(loan!.id, '2025-01-15', supabaseUser);
    } catch (e) {
      error = e;
    }
    
    // getByDate ignores PGRST116 and returns null, so no error should be thrown, but it should return null
    const result = await PaymentRepository.getByDate(loan!.id, '2025-01-15', supabaseUser);
    expect(result).toBeNull();

    await supabaseAdmin.from('payments').delete().eq('user_id', otherUserId);
    await supabaseAdmin.from('loans').delete().eq('user_id', otherUserId);
    await supabaseAdmin.from('borrowers').delete().eq('user_id', otherUserId);
  });

  it('should return empty summary for non-existent loan', async () => {
    const nonExistentLoanId = '00000000-0000-0000-0000-000000000000';
    const summary = await PaymentRepository.getSummary(nonExistentLoanId, supabaseAdmin);
    expect(summary.totalPaid).toBe(0);
    expect(summary.count).toBe(0);
    expect(summary.latestPaymentDate).toBeNull();
  });

  it('should throw error when updating non-existent payment', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';
    await expect(PaymentRepository.update(nonExistentId, { amount_paid: 100 }, supabaseAdmin))
      .rejects.toThrow();
  });

  it('should return null when fetching payment by non-existent loan ID and date', async () => {
    const nonExistentLoanId = '00000000-0000-0000-0000-000000000000';
    const result = await PaymentRepository.getByDate(nonExistentLoanId, '2025-01-01', supabaseAdmin);
    expect(result).toBeNull();
  });
});
