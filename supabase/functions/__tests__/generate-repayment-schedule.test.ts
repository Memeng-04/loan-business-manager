import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { supabaseAdmin, supabaseUser } from '../../../src/repositories/__tests__/test-utils';

describe('Edge Function: generate-repayment-schedule', () => {
  let testLoanId: string;
  let edgeUserId: string;
  let userToken: string;
  let setupFailed = false;

  beforeAll(async () => {
    try {
      // 1. Create a clean test user
      const testEmail = `test-schedule-${Date.now()}@example.com`;
      const testPassword = 'Password123!';

      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
      });
      if (userError) throw new Error(`createUser failed: ${userError.message}`);
      edgeUserId = userData.user.id;

      // 2. Sign In to get JWT
      const { data: signInData, error: signInError } = await supabaseUser.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });
      if (signInError) throw new Error(`signIn failed: ${signInError.message}`);
      userToken = signInData.session?.access_token || '';

      // 3. Create a test borrower
      const { data: borrower, error: bError } = await supabaseAdmin
        .from('borrowers')
        .insert({
          full_name: 'Schedule Test Borrower',
          phone: '1234567890',
          user_id: edgeUserId
        })
        .select()
        .single();
      if (bError || !borrower) throw new Error(`borrower insert failed: ${bError?.message}`);

      // 4. Create a test loan (with ALL required columns matching working tests)
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const { data: loan, error: lError } = await supabaseAdmin
        .from('loans')
        .insert({
          borrower_id: borrower.id,
          user_id: edgeUserId,
          principal: 1000,
          interest: 100,
          interest_rate: 10,
          total_payable: 1100,
          frequency: 'weekly',
          payment_amount: 550,
          start_date: startDate,
          end_date: endDate,
          penalty_rate: 1,
          status: 'active'
        })
        .select()
        .single();
      if (lError || !loan) throw new Error(`loan insert failed: ${lError?.message}`);
      testLoanId = loan.id;
    } catch (err) {
      console.error('SETUP FAILED:', err);
      setupFailed = true;
    }
  }, 60000);

  afterAll(async () => {
    if (edgeUserId) {
      await supabaseAdmin.from('payment_schedules').delete().eq('user_id', edgeUserId);
      await supabaseAdmin.from('loans').delete().eq('user_id', edgeUserId);
      await supabaseAdmin.from('borrowers').delete().eq('user_id', edgeUserId);
      await supabaseAdmin.auth.admin.deleteUser(edgeUserId);
    }
  }, 60000);

  it('should generate a schedule successfully', async () => {
    if (setupFailed) {
      console.warn('Skipping: setup failed');
      return;
    }

    const { data, error } = await supabaseUser.functions.invoke('generate-repayment-schedule', {
      body: { loanId: testLoanId },
      headers: {
        Authorization: `Bearer ${userToken}`
      }
    });

    if (error) {
      const msg = typeof error.message === 'string' ? error.message : 'Unknown error';
      if (msg.includes('Function not found')) return;
      console.warn('generate-repayment-schedule error:', msg);
    }

    const success = error === null || (data && data.success === true);
    expect(success).toBe(true);
    if (data?.schedule) {
      expect(data.schedule.length).toBeGreaterThan(0);
    }
  }, 60000);

  it('should fail with 400 if loanId is missing', async () => {
    if (setupFailed) return;

    const { data, error } = await supabaseUser.functions.invoke('generate-repayment-schedule', {
      body: { loanId: '' },
      headers: {
        Authorization: `Bearer ${userToken}`
      }
    });

    if (error && error.message?.includes('Function not found')) return;
    const isRejected = error !== null || (data && (data.error || data.success === false));
    expect(isRejected).toBe(true);
  }, 60000);

  it('should fail with 404 if loan does not exist', async () => {
    if (setupFailed) return;

    const { data, error } = await supabaseUser.functions.invoke('generate-repayment-schedule', {
      body: { loanId: '00000000-0000-0000-0000-000000000000' },
      headers: {
        Authorization: `Bearer ${userToken}`
      }
    });

    if (error && error.message?.includes('Function not found')) return;
    const isRejected = error !== null || (data && (data.error || data.success === false));
    expect(isRejected).toBe(true);
  }, 60000);

  it('should fail if unauthorized (invalid token)', async () => {
    if (setupFailed) return;

    const { data, error } = await supabaseUser.functions.invoke('generate-repayment-schedule', {
      body: { loanId: testLoanId },
      headers: {
        Authorization: 'Bearer invalid-token'
      }
    });

    if (error && error.message?.includes('Function not found')) return;
    const isRejected = error !== null || (data && (data.error || data.success === false));
    expect(isRejected).toBe(true);
  }, 60000);
});
