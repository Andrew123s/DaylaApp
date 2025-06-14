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

    const { action, tripId, data } = await req.json()

    switch (action) {
      case 'calculate_transport_footprint': {
        const { transportType, distance, passengers = 1 } = data

        // Carbon emission factors (kg CO2 per km per passenger)
        const emissionFactors = {
          flight: 0.255,
          train: 0.041,
          bus: 0.089,
          car: 0.171,
          ferry: 0.195
        }

        const carbonPerKm = emissionFactors[transportType as keyof typeof emissionFactors] || 0.2
        const totalCarbon = carbonPerKm * distance * passengers

        // Update trip sustainability
        const { data: sustainability } = await supabaseClient
          .from('trip_sustainability')
          .select('carbon_footprint')
          .eq('trip_id', tripId)
          .single()

        if (sustainability) {
          const currentFootprint = sustainability.carbon_footprint
          const updatedFootprint = {
            ...currentFootprint,
            transport: totalCarbon,
            total: totalCarbon + currentFootprint.accommodation + currentFootprint.food + currentFootprint.activities,
            treeEquivalent: Math.round((totalCarbon + currentFootprint.accommodation + currentFootprint.food + currentFootprint.activities) / 22)
          }

          await supabaseClient
            .from('trip_sustainability')
            .update({ carbon_footprint: updatedFootprint })
            .eq('trip_id', tripId)
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            carbonFootprint: totalCarbon,
            carbonPerKm,
            treeEquivalent: Math.round(totalCarbon / 22)
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'add_offset_contribution': {
        const { projectId, amountUsd, carbonOffsetKg } = data

        const { error } = await supabaseClient
          .from('offset_contributions')
          .insert({
            trip_id: tripId,
            project_id: projectId,
            user_id: user.id,
            amount_usd: amountUsd,
            carbon_offset_kg: carbonOffsetKg,
            status: 'completed'
          })

        if (error) {
          throw error
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
            notification_type: 'sustainability_goal_achieved',
            title: 'Carbon Offset Contribution',
            message: `${userProfile?.name || 'You'} contributed $${amountUsd} to offset ${carbonOffsetKg}kg CO2`,
            data: { amountUsd, carbonOffsetKg, projectId }
          })

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get_sustainability_report': {
        const { data: sustainability } = await supabaseClient
          .from('trip_sustainability')
          .select(`
            *,
            transport_options(*),
            accommodation_options(*),
            offset_contributions(
              *,
              offset_projects(name, project_type, cost_per_ton)
            ),
            sustainability_goals(*)
          `)
          .eq('trip_id', tripId)
          .single()

        if (!sustainability) {
          throw new Error('Sustainability data not found')
        }

        // Calculate total offsets
        const totalOffsets = sustainability.offset_contributions?.reduce(
          (sum: number, contrib: any) => sum + contrib.carbon_offset_kg, 0
        ) || 0

        // Calculate net footprint
        const netFootprint = sustainability.carbon_footprint.total - totalOffsets

        // Generate recommendations
        const recommendations = []
        
        if (sustainability.carbon_footprint.transport > 1000) {
          recommendations.push({
            category: 'transport',
            message: 'Consider train or bus travel to reduce transport emissions',
            potentialSaving: sustainability.carbon_footprint.transport * 0.6
          })
        }

        if (sustainability.carbon_footprint.accommodation > 200) {
          recommendations.push({
            category: 'accommodation',
            message: 'Look for eco-certified accommodations',
            potentialSaving: sustainability.carbon_footprint.accommodation * 0.3
          })
        }

        return new Response(
          JSON.stringify({
            sustainability,
            totalOffsets,
            netFootprint,
            recommendations,
            isNeutral: netFootprint <= 0
          }),
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