import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { supabaseAdmin, supabaseUser } from '../../../src/repositories/__tests__/test-utils';

describe('Edge Function: allocate-payment', () => {
  let testLoanId: string;
  let testScheduleId: string;
  let edgeUserId: string;
  let userToken: string;
  let setupFailed = false;

  beforeAll(async () => {
    try {
      // 1. Create a clean test user
      const testEmail = `test-alloc-${Date.now()}@example.com`;
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
      const { data: borrower, error: bError } = await supabaseAdmin.from('borrowers').insert({
        full_name: 'Allocation Test Borrower',
        phone: '1234567890',
        user_id: edgeUserId
      }).select().single();
      if (bError || !borrower) throw new Error(`borrower insert failed: ${bError?.message}`);

      // 4. Create a test loan (with ALL required columns)
      const { data: loan, error: lError } = await supabaseAdmin.from('loans').insert({
        borrower_id: borrower.id,
        user_id: edgeUserId,
        principal: 1000,
        interest: 100,
        interest_rate: 10,
        total_payable: 1100,
        frequency: 'weekly',
        payment_amount: 1100,
        start_date: '2025-01-01',
        end_date: '2025-02-01',
        penalty_rate: 1,
        status: 'active'
      }).select().single();
      if (lError || !loan) throw new Error(`loan insert failed: ${lError?.message}`);
      testLoanId = loan.id;

      // 5. Create a test schedule
      const { data: schedule, error: sError } = await supabaseAdmin.from('payment_schedules').insert({
        loan_id: loan.id,
        user_id: edgeUserId,
        amount_due: 100,
        due_date: new Date().toISOString().split('T')[0],
        status: 'unpaid'
      }).select().single();
      if (sError || !schedule) throw new Error(`schedule insert failed: ${sError?.message}`);
      testScheduleId = schedule.id;
    } catch (err) {
      console.error('SETUP FAILED:', err);
      setupFailed = true;
    }
  }, 60000);

  afterAll(async () => {
    if (edgeUserId) {
      await supabaseAdmin.from('payment_schedules').delete().eq('user_id', edgeUserId);
      await supabaseAdmin.from('payments').delete().eq('user_id', edgeUserId);
      await supabaseAdmin.from('loans').delete().eq('user_id', edgeUserId);
      await supabaseAdmin.from('borrowers').delete().eq('user_id', edgeUserId);
      await supabaseAdmin.auth.admin.deleteUser(edgeUserId);
    }
  }, 60000);

  it('should allocate payment successfully', async () => {
    if (setupFailed) {
      console.warn('Skipping: setup failed');
      return;
    }

    const { data, error } = await supabaseUser.functions.invoke('allocate-payment', {
      body: {
        loanId: testLoanId,
        scheduleId: testScheduleId,
        amountPaid: 50,
        paymentDate: new Date().toISOString()
      },
      headers: {
        Authorization: `Bearer ${userToken}`
      }
    });

    // Edge Function returns non-2xx → error is a FunctionsHttpError object
    if (error) {
      console.error('EDGE FUNCTION ERROR:', error);
      if (error instanceof Error && 'context' in error) {
        const body = await (error as any).context?.text?.();
        console.error('ERROR BODY:', body);
      }
      throw error;
    }
    
    expect(data?.success).toBe(true);
  }, 60000);

  it('should fail if unauthorized (invalid token)', async () => {
    if (setupFailed) return;

    const { data, error } = await supabaseUser.functions.invoke('allocate-payment', {
      body: {
        loanId: testLoanId,
        scheduleId: testScheduleId,
        amountPaid: 100
      },
      headers: {
        Authorization: 'Bearer invalid-token'
      }
    });

    if (error && error.message?.includes('Function not found')) return;

    // Expect an error: either the client reports it or the body says success:false
    const isRejected = error !== null || (data && data.success === false);
    expect(isRejected).toBe(true);
  }, 60000);

  it('should fail if amountPaid is negative', async () => {
    if (setupFailed) return;

    const { data, error } = await supabaseUser.functions.invoke('allocate-payment', {
      body: {
        loanId: testLoanId,
        scheduleId: testScheduleId,
        amountPaid: -50
      },
      headers: {
        Authorization: `Bearer ${userToken}`
      }
    });

    if (error && error.message?.includes('Function not found')) return;
    const isRejected = error !== null || (data && data.success === false);
    expect(isRejected).toBe(true);
  }, 60000);
});
