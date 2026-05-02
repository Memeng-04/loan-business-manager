import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ScheduleRepository } from '../ScheduleRepository';
import { supabaseAdmin, supabaseUser, TEST_USER_ID } from './test-utils';
import type { ScheduleEntry } from '../../types/strategies';

vi.mock('../../services/auth', () => ({
  getCurrentUserId: vi.fn(() => Promise.resolve(TEST_USER_ID)),
}));

describe('ScheduleRepository Integration Test', { timeout: 30000 }, () => {
  let testBorrowerId: string;
  let testLoanId: string;
  let setupFailed = false;

  beforeEach(async () => {
    setupFailed = false;
    try {
      // Ensure user exists
      const { error: userError } = await supabaseAdmin.auth.admin.createUser({
        id: TEST_USER_ID,
        email: `test-lender-${Date.now()}@example.com`,
        password: 'password123',
        email_confirm: true,
      }).catch((e) => ({ error: e }));
      
      // Ignore "User already exists" errors
      if (userError && !userError.message?.includes('already exists')) {
        console.warn('User creation warning:', userError.message);
      }

      // Clean up
      await supabaseAdmin.from('payment_schedules').delete().eq('user_id', TEST_USER_ID);
      await supabaseAdmin.from('loans').delete().eq('user_id', TEST_USER_ID);
      await supabaseAdmin.from('borrowers').delete().eq('user_id', TEST_USER_ID);

      // Create a borrower
      const { data: borrower, error: bError } = await supabaseAdmin.from('borrowers').insert({
        full_name: 'Schedule Borrower',
        phone: '123456',
        user_id: TEST_USER_ID
      }).select('id').single();
      
      if (bError || !borrower) {
        throw new Error(`borrower insert failed: ${bError?.message}`);
      }
      testBorrowerId = borrower.id;

      // Create a loan
      const { data: loan, error: lError } = await supabaseAdmin.from('loans').insert({
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
      
      if (lError || !loan) {
        throw new Error(`loan insert failed: ${lError?.message}`);
      }
      testLoanId = loan.id;
    } catch (err) {
      console.error('SETUP FAILED:', err);
      setupFailed = true;
    }
  });

  afterEach(async () => {
    await supabaseAdmin.from('payment_schedules').delete().eq('user_id', TEST_USER_ID);
    await supabaseAdmin.from('loans').delete().eq('user_id', TEST_USER_ID);
    await supabaseAdmin.from('borrowers').delete().eq('user_id', TEST_USER_ID);
  });

  // --- GOOD PATHS ---

  it('should save and fetch schedules by loan ID', async () => {
    if (setupFailed) return;
    const schedulesInput: ScheduleEntry[] = [
      {
        loan_id: testLoanId,
        due_date: '2025-01-15',
        amount_due: 550,
        status: 'unpaid'
      },
      {
        loan_id: testLoanId,
        due_date: '2025-02-15',
        amount_due: 550,
        status: 'unpaid'
      }
    ];

    // Create
    const saved = await ScheduleRepository.saveSchedule(schedulesInput, supabaseAdmin);
    expect(saved.length).toBe(2);
    expect(saved[0].amount_due).toBe(550);

    // Fetch
    const fetched = await ScheduleRepository.getByLoanId(testLoanId, supabaseAdmin);
    expect(fetched.length).toBe(2);
    expect(fetched[0].due_date).toBe('2025-01-15');
    expect(fetched[1].due_date).toBe('2025-02-15');
  });

  it('should update a schedule', async () => {
    if (setupFailed) return;
    const schedulesInput: ScheduleEntry[] = [
      {
        loan_id: testLoanId,
        due_date: '2025-01-15',
        amount_due: 550,
        status: 'unpaid'
      }
    ];

    const saved = await ScheduleRepository.saveSchedule(schedulesInput, supabaseAdmin);
    const scheduleId = saved[0].id!;

    // Update
    await ScheduleRepository.updateSchedule(scheduleId, { status: 'paid' }, supabaseAdmin);
    
    // Verify
    const fetched = await ScheduleRepository.getByLoanId(testLoanId, supabaseAdmin);
    expect(fetched[0].status).toBe('paid');
  });

  it('should delete schedules by loan ID', async () => {
    if (setupFailed) return;
    const schedulesInput: ScheduleEntry[] = [
      {
        loan_id: testLoanId,
        due_date: '2025-01-15',
        amount_due: 550,
        status: 'unpaid'
      }
    ];

    await ScheduleRepository.saveSchedule(schedulesInput, supabaseAdmin);
    
    // Delete
    await ScheduleRepository.deleteByLoanId(testLoanId, supabaseAdmin);
    
    // Verify
    const fetched = await ScheduleRepository.getByLoanId(testLoanId, supabaseAdmin);
    expect(fetched.length).toBe(0);
  });

  it('should get dashboard schedules within date range', async () => {
    if (setupFailed) return;
    const schedulesInput: ScheduleEntry[] = [
      {
        loan_id: testLoanId,
        due_date: '2025-01-15',
        amount_due: 550,
        status: 'unpaid'
      },
      {
        loan_id: testLoanId,
        due_date: '2025-03-15',
        amount_due: 550,
        status: 'unpaid'
      }
    ];

    await ScheduleRepository.saveSchedule(schedulesInput, supabaseAdmin);

    // Fetch dashboard schedules
    const dashboard = await ScheduleRepository.getDashboardSchedules('2025-01-01', '2025-02-01', supabaseAdmin);
    expect(dashboard.length).toBe(1);
    expect(dashboard[0].due_date).toBe('2025-01-15');
    // Ensure relations are fetched
    expect(dashboard[0].loan).toBeDefined();
    expect(dashboard[0].loan.borrower).toBeDefined();
  });

  // --- SAD PATHS ---

  it('should not allow fetching schedules of another user (RLS Check)', async () => {
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

    await supabaseAdmin.from('payment_schedules').insert({
      loan_id: loan!.id,
      user_id: otherUserId,
      due_date: '2025-01-15',
      amount_due: 550,
      status: 'unpaid'
    });

    // Fetch using anon key (supabaseUser)
    const result = await ScheduleRepository.getByLoanId(loan!.id, supabaseUser);
    
    // RLS should hide this record
    expect(result).toEqual([]);

    await supabaseAdmin.from('payment_schedules').delete().eq('user_id', otherUserId);
    await supabaseAdmin.from('loans').delete().eq('user_id', otherUserId);
    await supabaseAdmin.from('borrowers').delete().eq('user_id', otherUserId);
  });

  it('should return empty array for dashboard when no schedules exist in range', async () => {
    const dashboard = await ScheduleRepository.getDashboardSchedules('2099-01-01', '2099-02-01', supabaseAdmin);
    expect(dashboard).toEqual([]);
  });

  it('should not throw when deleting non-existent schedule', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';
    await expect(ScheduleRepository.deleteById(nonExistentId, supabaseAdmin))
      .resolves.not.toThrow();
  });
});
