import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LoanRepository } from '../LoanRepository';
import { supabaseAdmin, supabaseUser, TEST_USER_ID, ensureTestUser } from './test-utils';

vi.mock('../../services/auth', () => ({
  getCurrentUserId: vi.fn(() => Promise.resolve(TEST_USER_ID)),
}));

describe('LoanRepository Integration Test', { timeout: 30000 }, () => {
  let testBorrowerId: string;

  beforeEach(async () => {
    // Ensure the test user exists
    await ensureTestUser();

    // Clean up
    await supabaseAdmin.from('loans').delete().eq('user_id', TEST_USER_ID);
    await supabaseAdmin.from('borrowers').delete().eq('user_id', TEST_USER_ID);

    // Create a borrower to attach loans to
    const { data: borrower } = await supabaseAdmin.from('borrowers').insert({
      full_name: 'Loan Borrower',
      phone: '123456',
      user_id: TEST_USER_ID
    }).select('id').single();
    
    testBorrowerId = borrower!.id;
  });

  afterEach(async () => {
    await supabaseAdmin.from('loans').delete().eq('user_id', TEST_USER_ID);
    await supabaseAdmin.from('borrowers').delete().eq('user_id', TEST_USER_ID);
  });

  // --- GOOD PATHS ---

  it('should create and fetch a loan', async () => {
    const loanInput = {
      borrower_id: testBorrowerId,
      principal: 1000,
      total_payable: 1100,
      interest: 100,
      interest_rate: 10,
      frequency: 'monthly' as const,
      payment_amount: 1100,
      start_date: '2025-01-01',
      end_date: '2025-02-01',
      penalty_rate: 1,
      status: 'active' as const
    };

    // Create
    const loan = await LoanRepository.create(loanInput, supabaseAdmin);
    expect(loan).toBeDefined();
    expect(loan.principal).toBe(1000);

    // Fetch by ID
    const fetched = await LoanRepository.getById(loan.id!, supabaseAdmin);
    expect(fetched).not.toBeNull();
    expect(fetched?.principal).toBe(1000);
    
    // Fetch by Borrower ID
    const borrowerLoans = await LoanRepository.getByBorrowerId(testBorrowerId, supabaseAdmin);
    expect(borrowerLoans.length).toBeGreaterThan(0);
    expect(borrowerLoans.some(l => l.id === loan.id)).toBeTruthy();

    // Fetch All
    const allLoans = await LoanRepository.getAll(supabaseAdmin);
    expect(allLoans.length).toBeGreaterThan(0);
    expect(allLoans.some(l => l.id === loan.id)).toBeTruthy();
  });

  it('should update loan status', async () => {
    const loanInput = {
      borrower_id: testBorrowerId,
      principal: 1000,
      total_payable: 1100,
      interest: 100,
      interest_rate: 10,
      frequency: 'monthly' as const,
      payment_amount: 1100,
      start_date: '2025-01-01',
      end_date: '2025-02-01',
      penalty_rate: 1,
      status: 'active' as const
    };

    const loan = await LoanRepository.create(loanInput, supabaseAdmin);
    
    const updated = await LoanRepository.updateStatus(loan.id!, 'completed', supabaseAdmin);
    expect(updated.status).toBe('completed');
  });

  // --- SAD PATHS ---

  it('should not allow fetching a loan of another user (RLS Check)', async () => {
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

    // Fetch using anon key (supabaseUser)
    // Note: getById might throw an error if `.single()` finds 0 rows, so we need to handle it.
    // LoanRepository throws error if single() fails, but it catches PGRST116? Let's check: 
    // Oh, LoanRepository doesn't catch PGRST116. It will throw the error.
    let error: any;
    try {
      await LoanRepository.getById(loan!.id, supabaseUser);
    } catch (e) {
      error = e;
    }
    
    // PGRST116 is Supabase's "JSON object requested, multiple (or no) rows returned"
    expect(error).toBeDefined();
    expect(error.code).toBe('PGRST116');

    await supabaseAdmin.from('loans').delete().eq('user_id', otherUserId);
    await supabaseAdmin.from('borrowers').delete().eq('user_id', otherUserId);
    await supabaseAdmin.auth.admin.deleteUser(otherUserId);
  });

  it('should throw error when fetching non-existent loan by ID', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';
    await expect(LoanRepository.getById(nonExistentId, supabaseAdmin))
      .rejects.toThrow();
  });

  it('should return empty array when fetching loans for non-existent borrower', async () => {
    const nonExistentBorrowerId = '00000000-0000-0000-0000-000000000000';
    const loans = await LoanRepository.getByBorrowerId(nonExistentBorrowerId, supabaseAdmin);
    expect(loans).toEqual([]);
  });

  it('should throw error when updating status of non-existent loan', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';
    await expect(LoanRepository.updateStatus(nonExistentId, 'completed', supabaseAdmin))
      .rejects.toThrow();
  });
});
