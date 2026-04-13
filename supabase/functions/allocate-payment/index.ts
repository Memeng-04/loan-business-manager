// supabase/functions/allocate-payment/index.ts
// Edge Function for US-11: Auto Allocation - Allocates payments between interest and principal
// Deploy with: supabase functions deploy allocate-payment

import { createClient } from 'supabase';
import type { Database } from '../../../src/types/database';

interface AllocatePaymentRequest {
  loanId: string;
  amountPaid: number;
  paymentDate: string;
  scheduleId: string;
}

interface AllocatePaymentResponse {
  success: boolean;
  paymentId?: string;
  interestPortion?: number;
  principalPortion?: number;
  remainingBalance?: number;
  status?: string;
  error?: string;
}

// Helper: Round to 2 decimal places
const roundToTwoDecimals = (amount: number): number => {
  return Math.round(amount * 100) / 100;
};

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's JWT token (respects RLS policies)
    // Pass Authorization header so that Supabase will use the user's JWT for auth
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || '',
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    // Verify we have an authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user?.id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized: No authenticated user' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body: AllocatePaymentRequest = await req.json();
    const { loanId, amountPaid, paymentDate, scheduleId } = body;

    // Validate input
    if (!loanId || !amountPaid || !paymentDate || !scheduleId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: loanId, amountPaid, paymentDate, scheduleId',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Fetch loan data (RLS will automatically filter by user)
    const { data: loanData, error: loanError } = await supabase
      .from('loans')
      .select('*')
      .eq('id', loanId)
      .single();

    if (loanError || !loanData) {
      return new Response(
        JSON.stringify({ success: false, error: `Failed to fetch loan: ${loanError?.message}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Fetch schedule data to get due amount and interest
    const { data: scheduleData, error: scheduleError } = await supabase
      .from('payment_schedules')
      .select('*')
      .eq('id', scheduleId)
      .single();

    if (scheduleError || !scheduleData) {
      return new Response(
        JSON.stringify({ success: false, error: `Failed to fetch schedule: ${scheduleError?.message}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const amountDue = scheduleData.amount_due || 0;
    // Assume interest is calculated based on loan - this can be enhanced
    const interestDue = (amountDue * (loanData.interest_rate || 0)) / 100;

    // Step 3: Allocate payment (interest first, then principal)
    const interestPortion = roundToTwoDecimals(Math.min(amountPaid, interestDue));
    const principalPortion = roundToTwoDecimals(amountPaid - interestPortion);

    // Step 4: Determine payment status
    let paymentStatus: 'paid' | 'partial' | 'absent' = 'absent';
    if (amountPaid > 0 && amountPaid >= amountDue) {
      paymentStatus = 'paid';
    } else if (amountPaid > 0 && amountPaid < amountDue) {
      paymentStatus = 'partial';
    }

    // Step 5: Calculate remaining balance for loan
    const amountPaidToDate = scheduleData.amount_paid || 0;
    const newAmountPaid = amountPaidToDate + amountPaid;
    const remainingBalance = roundToTwoDecimals(Math.max(0, amountDue - newAmountPaid));

    // Step 6: Create payment record with allocation details
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .insert([
        {
          loan_id: loanId,
          amount_paid: amountPaid,
          payment_date: paymentDate,
          schedule_id: scheduleId,
          interest_portion: interestPortion,
          principal_portion: principalPortion,
          remaining_balance: remainingBalance,
          status: paymentStatus,
        },
      ])
      .select()
      .single();

    if (paymentError || !paymentData) {
      return new Response(
        JSON.stringify({ success: false, error: `Failed to create payment: ${paymentError?.message}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Step 7: Update payment schedule status
    const { error: scheduleUpdateError } = await supabase
      .from('payment_schedules')
      .update({
        status: paymentStatus,
        amount_paid: newAmountPaid,
        updated_at: new Date().toISOString(),
      })
      .eq('id', scheduleId);

    if (scheduleUpdateError) {
      console.error('Warning: Failed to update schedule status:', scheduleUpdateError);
      // Continue anyway - payment was recorded
    }

    // Step 8: Update loan remaining balance (if all remaining is principal)
    const totalRemainingBal = roundToTwoDecimals(
      Math.max(0, loanData.total_payable - (loanData.amount_paid || 0) - amountPaid)
    );

    const { error: loanUpdateError } = await supabase
      .from('loans')
      .update({
        amount_paid: (loanData.amount_paid || 0) + amountPaid,
        updated_at: new Date().toISOString(),
      })
      .eq('id', loanId);

    if (loanUpdateError) {
      console.error('Warning: Failed to update loan balance:', loanUpdateError);
      // Continue anyway - payment was recorded
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        paymentId: paymentData.id,
        interestPortion,
        principalPortion,
        remainingBalance,
        status: paymentStatus,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Allocate payment error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
