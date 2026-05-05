import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DashboardRepository } from '../DashboardRepository';
import { supabaseAdmin, supabaseUser, TEST_USER_ID, ensureTestUser } from './test-utils';

vi.mock('../../services/auth', () => ({
  getCurrentUserId: vi.fn(() => Promise.resolve(TEST_USER_ID)),
}));

describe('DashboardRepository Integration Test', { timeout: 30000 }, () => {
  beforeEach(async () => {
    // Ensure the test user exists
    await ensureTestUser();

    // Clean up dashboard related data (borrowers, loans, schedules)
    await supabaseAdmin.from('payment_schedules').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (in a real app we'd scope this or use a test DB)
    await supabaseAdmin.from('loans').delete().eq('user_id', TEST_USER_ID);
    await supabaseAdmin.from('borrowers').delete().eq('user_id', TEST_USER_ID);
  });

  afterEach(async () => {
    await supabaseAdmin.from('loans').delete().eq('user_id', TEST_USER_ID);
    await supabaseAdmin.from('borrowers').delete().eq('user_id', TEST_USER_ID);
  });

  // --- GOOD PATHS ---

  it('should get borrowers', async () => {
    // Insert test borrower
    const { data: borrower } = await supabaseAdmin.from('borrowers').insert({
      full_name: 'Dashboard Borrower',
      phone: '123456',
      user_id: TEST_USER_ID
    }).select('id').single();

    // Fetch using admin
    const borrowers = await DashboardRepository.getBorrowers(supabaseAdmin);
    expect(borrowers.length).toBeGreaterThan(0);
    expect(borrowers.some(b => b.id === borrower?.id)).toBeTruthy();
  });

  it('should get loans', async () => {
    const { data: borrower, error: bErr } = await supabaseAdmin.from('borrowers').insert({
      full_name: 'Dashboard Borrower',
      phone: '123456',
      user_id: TEST_USER_ID
    }).select('id').single();
    if (bErr) throw bErr;

    const { data: loan, error: lErr } = await supabaseAdmin.from('loans').insert({
      borrower_id: borrower!.id,
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
    if (lErr) throw lErr;

    const loans = await DashboardRepository.getLoans(supabaseAdmin);
    expect(loans.length).toBeGreaterThan(0);
    expect(loans.some(l => l.id === loan?.id)).toBeTruthy();
  });

  it('should get due schedules for date', async () => {
    const { data: borrower, error: bErr } = await supabaseAdmin.from('borrowers').insert({
      full_name: 'Dashboard Borrower',
      phone: '123456',
      user_id: TEST_USER_ID
    }).select('id').single();
    if (bErr) throw bErr;

    const { data: loan, error: lErr } = await supabaseAdmin.from('loans').insert({
      borrower_id: borrower!.id,
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
    if (lErr) throw lErr;

    const targetDate = '2030-01-01';
    
    const { data: schedule, error: sErr } = await supabaseAdmin.from('payment_schedules').insert({
      loan_id: loan!.id,
      user_id: TEST_USER_ID,
      due_date: targetDate,
      amount_due: 100,
      status: 'pending'
    }).select('id').single();
    if (sErr) throw sErr;

    const schedules = await DashboardRepository.getDueSchedulesForDate(targetDate, supabaseAdmin);
    expect(schedules.length).toBeGreaterThan(0);
    expect(schedules.some(s => s.loan_id === loan?.id)).toBeTruthy();
    
    // Cleanup schedule
    await supabaseAdmin.from('payment_schedules').delete().eq('id', schedule!.id);
  });

  // --- SAD PATHS ---

  it('should return empty arrays for unauthenticated users (RLS Check)', async () => {
    // supabaseUser acts as an unauthenticated/unrecognized user in this context
    const borrowers = await DashboardRepository.getBorrowers(supabaseUser);
    expect(borrowers).toEqual([]);

    const loans = await DashboardRepository.getLoans(supabaseUser);
    expect(loans).toEqual([]);

    const schedules = await DashboardRepository.getDueSchedulesForDate('2030-01-01', supabaseUser);
    expect(schedules).toEqual([]);
  });
});
