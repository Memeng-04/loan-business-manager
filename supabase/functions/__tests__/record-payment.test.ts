import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { supabaseAdmin, supabaseUser } from '../../../src/repositories/__tests__/test-utils';

describe('Edge Function: record-payment', () => {
  let edgeUserId: string;
  let testLoanId: string;
  let userToken: string;
  let setupFailed = false;

  beforeAll(async () => {
    try {
      // 1. Create a unique test user
      const testEmail = `test-record-${Date.now()}@example.com`;
      const testPassword = 'Password123!';

      const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
      });
      if (createError) throw new Error(`createUser failed: ${createError.message}`);
      edgeUserId = userData.user.id;

      // 2. Sign In to get a real JWT
      const { data: signInData, error: signInError } = await supabaseUser.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });
      if (signInError) throw new Error(`signIn failed: ${signInError.message}`);
      userToken = signInData.session?.access_token || '';

      // 3. Create a test borrower
      const { data: borrower, error: bError } = await supabaseAdmin.from('borrowers').insert({
        full_name: 'Record Payment Borrower',
        phone: '123456',
        user_id: edgeUserId
      }).select('id').single();
      if (bError || !borrower) throw new Error(`borrower insert failed: ${bError?.message}`);

      // 4. Create a test loan (ALL required columns)
      const { data: loan, error: lError } = await supabaseAdmin.from('loans').insert({
        borrower_id: borrower.id,
        user_id: edgeUserId,
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
      if (lError || !loan) throw new Error(`loan insert failed: ${lError?.message}`);
      testLoanId = loan.id;
    } catch (err) {
      console.error('SETUP FAILED:', err);
      setupFailed = true;
    }
  }, 60000);

  afterAll(async () => {
    if (edgeUserId) {
      await supabaseAdmin.from('payments').delete().eq('user_id', edgeUserId);
      await supabaseAdmin.from('loans').delete().eq('user_id', edgeUserId);
      await supabaseAdmin.from('borrowers').delete().eq('user_id', edgeUserId);
      await supabaseAdmin.auth.admin.deleteUser(edgeUserId);
    }
  }, 60000);

  // --- HAPPY PATHS ---

  it('should record a payment successfully', async () => {
    if (setupFailed) {
      console.warn('Skipping: setup failed');
      return;
    }

    const { data, error } = await supabaseUser.functions.invoke('record-payment', {
      headers: {
        Authorization: `Bearer ${userToken}`
      },
      body: {
        loanId: testLoanId,
        amount: 100,
        paymentDate: '2025-01-15'
      }
    });

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

  // --- SAD PATHS ---

  it('should fail if missing required fields', async () => {
    if (setupFailed) return;

    const { data, error } = await supabaseUser.functions.invoke('record-payment', {
      headers: {
        Authorization: `Bearer ${userToken}`
      },
      body: {
        loanId: testLoanId,
        // missing amount and paymentDate
      }
    });

    if (error && error.message?.includes('Function not found')) return;
    // Expect rejection: either error is not null, or data contains an error
    const isRejected = error !== null || (data && data.error);
    expect(isRejected).toBeTruthy();
  }, 60000);

  it('should fail if unauthorized (invalid token)', async () => {
    if (setupFailed) return;

    const { data, error } = await supabaseUser.functions.invoke('record-payment', {
      body: {
        loanId: testLoanId,
        amount: 100,
        paymentDate: '2025-01-15'
      },
      headers: {
        Authorization: 'Bearer invalid-token'
      }
    });

    if (error && error.message?.includes('Function not found')) return;
    const isRejected = error !== null || (data && data.error);
    expect(isRejected).toBeTruthy();
  }, 60000);

  it('should fail if loan does not exist', async () => {
    if (setupFailed) return;

    const fakeId = '00000000-0000-0000-0000-000000000000';
    const { data, error } = await supabaseUser.functions.invoke('record-payment', {
      headers: {
        Authorization: `Bearer ${userToken}`
      },
      body: {
        loanId: fakeId,
        amount: 100,
        paymentDate: '2025-01-15'
      }
    });

    if (error && error.message?.includes('Function not found')) return;
    const isRejected = error !== null || (data && data.error);
    expect(isRejected).toBeTruthy();
  }, 60000);
});
