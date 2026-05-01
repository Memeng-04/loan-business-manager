// @ts-nocheck
import { createClient } from "supabase"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  console.log('DEBUG: Function started - Method:', req.method)
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Get the authorization header and verify JWT first (Security First)
    const authHeader = req.headers.get('authorization')
    console.log('DEBUG: Auth Header present:', !!authHeader)

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('DEBUG: Rejecting with 401 - Missing/Invalid Header')
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Missing or invalid authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Parse request body
    console.log('Parsing request body...')
    const body = await req.json().catch(() => ({}))
    const { loanId } = body
    console.log('Received loanId:', loanId)

    if (!loanId) {
      return new Response(
        JSON.stringify({ error: 'Missing loanId parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const token = authHeader.replace('Bearer ', '');

    // Verify we have an authenticated user explicitly
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user?.id) {
      console.error('Auth error:', userError)
      return new Response(
        JSON.stringify({ error: `Unauthorized: ${userError?.message || 'Invalid token'}` }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch loan data (RLS will automatically filter by user)
    const { data: loan, error: loanError } = await supabase
      .from('loans')
      .select('total_payable, frequency, start_date, end_date')
      .eq('id', loanId)
      .eq('user_id', user.id)
      .single()

    if (loanError || !loan) {
      return new Response(
        JSON.stringify({ error: 'Loan not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate term days
    const start    = new Date(loan.start_date)
    const end      = new Date(loan.end_date)
    const termDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

    // Generate schedule
    const schedule = generateSchedule(
      loan.start_date,
      loan.total_payable,
      loan.frequency,
      termDays
    )

    // Delete existing schedule for this loan first
    const { error: deleteError } = await supabase
      .from('payment_schedules')
      .delete()
      .eq('loan_id', loanId)
      .eq('user_id', user.id)

    if (deleteError) throw deleteError

    // Save new schedule with user_id for RLS compliance
    const rows = schedule.map(entry => ({
      loan_id:    loanId,
      user_id:    user.id,
      due_date:   entry.due_date,
      amount_due: entry.amount_due,
      status:     'unpaid'
    }))

    const { data, error } = await supabase
      .from('payment_schedules')
      .insert(rows)
      .select()

    if (error || !data) {
      throw new Error(error?.message || 'Failed to insert payment schedules')
    }

    return new Response(
      JSON.stringify({ success: true, schedule: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function generateSchedule(
  startDate:    string,
  totalPayable: number,
  frequency:    string,
  termDays:     number
) {
  const schedule = []
  const start    = new Date(startDate)

  let numberOfPayments: number
  let intervalDays:     number

  switch (frequency) {
    case 'daily':
      numberOfPayments = termDays
      intervalDays     = 1
      break
    case 'weekly':
      numberOfPayments = Math.ceil(termDays / 7)
      intervalDays     = 7
      break
    case 'bi-monthly':
      numberOfPayments = Math.ceil(termDays / 15)
      intervalDays     = 15
      break
    case 'monthly':
      numberOfPayments = Math.ceil(termDays / 30)
      intervalDays     = 30
      break
    default:
      numberOfPayments = termDays
      intervalDays     = 1
  }

  // Fix decimals — round to 2 decimal places
  const amountPerPayment = Math.round((totalPayable / numberOfPayments) * 100) / 100

  for (let i = 0; i < numberOfPayments; i++) {
    const dueDate = new Date(start)
    dueDate.setDate(start.getDate() + intervalDays * (i + 1))

    schedule.push({
      due_date:   dueDate.toISOString().split('T')[0],
      amount_due: amountPerPayment
    })
  }

  return schedule
}
