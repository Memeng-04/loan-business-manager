import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { loanId } = await req.json()

    const supabase = createClient(
      Deno.env.get('DB_URL')!,
      Deno.env.get('DB_SERVICE_ROLE_KEY')!
    )

    // Fetch loan data
    const { data: loan, error: loanError } = await supabase
      .from('loans')
      .select('total_payable, frequency, start_date, end_date')
      .eq('id', loanId)
      .single()

    if (loanError) throw loanError

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

    if (deleteError) throw deleteError

    // Save new schedule
    const rows = schedule.map(entry => ({
      loan_id:    loanId,
      due_date:   entry.due_date,
      amount_due: entry.amount_due,
      status:     'unpaid'
    }))

    const { data, error } = await supabase
      .from('payment_schedules')
      .insert(rows)
      .select()

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, schedule: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
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
