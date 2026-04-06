import { serve } from 'std/http/server.ts'
import { createClient } from 'supabase/'

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 405,
    })
  }

  try {
    const { loanId, amount, paymentDate } = await req.json()

    if (!loanId || !amount || !paymentDate) {
      return new Response(JSON.stringify({ error: 'Missing required fields: loanId, amount, paymentDate' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { 'Authorization': req.headers.get('Authorization')! } } }
    )

    // Check if the loan belongs to the authenticated user
    const { data: loan, error: loanError } = await supabase
      .from('loans')
      .select('borrower_id')
      .eq('id', loanId)
      .single()

    if (loanError) {
      console.error('Error fetching loan:', loanError)
      return new Response(JSON.stringify({ error: loanError.message }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== loan.borrower_id) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Loan does not belong to the authenticated user.' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 403,
      })
    }

    const { data: payment, error: insertError } = await supabase
      .from('payments')
      .insert({
        loan_id: loanId,
        amount: amount,
        payment_date: paymentDate,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting payment:', insertError)
      return new Response(JSON.stringify({ error: insertError.message }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    // TODO: Implement logic to update loan balance and repayment schedule here

    return new Response(JSON.stringify({ success: true, payment }), {
      headers: { 'Content-Type': 'application/json' },
      status: 201,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
