// @ts-nocheck
import { createClient } from 'supabase'

interface PaymentInsert {
  loan_id: string;
  amount_paid: number;
  payment_date: string;
  user_id: string;
  schedule_id?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    })
  }

  try {
    // 1. Check authorization header first (Security First)
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Missing or invalid authorization header' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // 2. Parse body
    const { loanId, amount, paymentDate, scheduleId } = await req.json()

    if (!loanId || !amount || !paymentDate) {
      return new Response(JSON.stringify({ error: 'Missing required fields: loanId, amount, paymentDate' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // 3. Create Supabase client with SERVICE_ROLE_KEY for system-level operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // 4. Verify user from JWT token explicitly
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user?.id) {
      return new Response(JSON.stringify({ error: `Unauthorized: ${userError?.message || 'No authenticated user'}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // 5. Check if the loan exists and belongs to this user
    const { data: loan, error: loanError } = await supabase
      .from('loans')
      .select('borrower_id')
      .eq('id', loanId)
      .eq('user_id', user.id)
      .single()

    if (loanError) {
      console.error('Error fetching loan:', loanError)
      return new Response(JSON.stringify({ error: loanError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    if (!loan) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Loan does not belong to the authenticated user.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      })
    }

    // 6. Insert payment
    const insertPayload: PaymentInsert = {
      loan_id: loanId,
      amount_paid: amount,
      payment_date: paymentDate,
      user_id: user.id,
    }

    if (scheduleId !== undefined) {
       insertPayload.schedule_id = scheduleId;
    }

    const { data: payment, error: insertError } = await supabase
      .from('payments')
      .insert(insertPayload)
      .select()
      .single()

    if (insertError || !payment) {
      console.error('Error inserting payment:', insertError)
      return new Response(JSON.stringify({ error: insertError?.message || 'Failed to insert payment' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    return new Response(JSON.stringify({ success: true, payment }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
