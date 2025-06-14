import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)

    if (!user) {
      throw new Error('Unauthorized')
    }

    const { action, tripId, paymentData } = await req.json()

    switch (action) {
      case 'process_payment': {
        const {
          amount,
          currency,
          description,
          paymentMethod,
          expenseId,
          splitId,
          toUserId
        } = paymentData

        // Simulate payment processing
        const isSuccessful = Math.random() > 0.1 // 90% success rate for demo

        const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        // Create payment record
        const { data: payment, error: paymentError } = await supabaseClient
          .from('payments')
          .insert({
            trip_id: tripId,
            from_user_id: user.id,
            to_user_id: toUserId,
            amount,
            currency,
            description,
            payment_method: paymentMethod,
            transaction_id: transactionId,
            status: isSuccessful ? 'completed' : 'failed',
            expense_id: expenseId,
            split_id: splitId,
            processed_at: isSuccessful ? new Date().toISOString() : null
          })
          .select()
          .single()

        if (paymentError) {
          throw paymentError
        }

        // If payment successful and related to expense split, mark as settled
        if (isSuccessful && expenseId && splitId) {
          const { error: splitError } = await supabaseClient
            .from('expense_splits')
            .update({
              is_settled: true,
              settled_at: new Date().toISOString()
            })
            .eq('id', splitId)

          if (splitError) {
            console.error('Error updating expense split:', splitError)
          }

          // Check if all splits for this expense are settled
          const { data: allSplits } = await supabaseClient
            .from('expense_splits')
            .select('is_settled')
            .eq('expense_id', expenseId)

          const allSettled = allSplits?.every(split => split.is_settled)

          if (allSettled) {
            await supabaseClient
              .from('expenses')
              .update({ is_settled: true })
              .eq('id', expenseId)
          }
        }

        // Get user profile for notification
        const { data: userProfile } = await supabaseClient
          .from('user_profiles')
          .select('name')
          .eq('user_id', user.id)
          .single()

        // Add notification
        await supabaseClient
          .from('trip_notifications')
          .insert({
            trip_id: tripId,
            user_id: user.id,
            notification_type: isSuccessful ? 'payment_completed' : 'payment_failed',
            title: isSuccessful ? 'Payment Successful' : 'Payment Failed',
            message: isSuccessful 
              ? `Payment of ${currency} ${amount} completed successfully`
              : `Payment of ${currency} ${amount} failed. Please try again.`,
            data: { 
              paymentId: payment.id,
              transactionId,
              amount,
              currency
            }
          })

        // Add live notification for successful payments
        if (isSuccessful) {
          await supabaseClient
            .from('live_notifications')
            .insert({
              trip_id: tripId,
              notification_type: 'payment_completed',
              message: `completed a payment of ${currency} ${amount}`,
              user_name: userProfile?.name || 'Someone',
              auto_hide: true
            })
        }

        return new Response(
          JSON.stringify({ 
            success: isSuccessful,
            payment,
            transactionId: isSuccessful ? transactionId : null,
            message: isSuccessful 
              ? 'Payment processed successfully'
              : 'Payment failed. Please try again.'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get_payment_history': {
        const { data: payments, error } = await supabaseClient
          .from('payments')
          .select(`
            *,
            from_user:user_profiles!payments_from_user_id_fkey(name, avatar_url),
            to_user:user_profiles!payments_to_user_id_fkey(name, avatar_url)
          `)
          .eq('trip_id', tripId)
          .order('created_at', { ascending: false })

        if (error) {
          throw error
        }

        return new Response(
          JSON.stringify({ payments }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'send_payment_reminder': {
        const { userId, amount, currency } = paymentData

        // Get user profile
        const { data: userProfile } = await supabaseClient
          .from('user_profiles')
          .select('name')
          .eq('user_id', userId)
          .single()

        // Add reminder notification
        await supabaseClient
          .from('trip_notifications')
          .insert({
            trip_id: tripId,
            user_id: userId,
            notification_type: 'payment_reminder',
            title: 'Payment Reminder',
            message: `You have an outstanding payment of ${currency} ${amount}`,
            data: { amount, currency }
          })

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        throw new Error('Invalid action')
    }

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})