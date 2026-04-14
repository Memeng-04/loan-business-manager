import { serve } from 'std/http/server.ts'
import { createClient } from 'supabase'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
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
    const { loanId, amount, paymentDate } = await req.json()

    if (!loanId || !amount || !paymentDate) {
      return new Response(JSON.stringify({ error: 'Missing required fields: loanId, amount, paymentDate' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { 'Authorization': req.headers.get('Authorization')! } } }
    )

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized: No authenticated user' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // Check if the loan exists (RLS will automatically filter by user)
    const { data: loan, error: loanError } = await supabase
      .from('loans')
      .select('borrower_id')
      .eq('id', loanId)
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

    const { data: payment, error: insertError } = await supabase
      .from('payments')
      .insert({
        loan_id: loanId,
        amount_paid: amount,
        payment_date: paymentDate,
        user_id: user.id,
      })
      .select()
      .single()

    if (insertError || !payment) {
      console.error('Error inserting payment:', insertError)
      return new Response(JSON.stringify({ error: insertError?.message || 'Failed to insert payment' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    // TODO: Implement logic to update loan balance and repayment schedule here

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
