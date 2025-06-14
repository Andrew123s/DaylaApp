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
      case 'join_trip': {
        const { inviteCode } = data
        
        // Find trip by invite code
        const { data: trip, error: tripError } = await supabaseClient
          .from('trips')
          .select('*')
          .eq('invite_code', inviteCode)
          .single()

        if (tripError || !trip) {
          throw new Error('Invalid invite code')
        }

        // Check if user is already a collaborator
        const { data: existingCollaborator } = await supabaseClient
          .from('trip_collaborators')
          .select('*')
          .eq('trip_id', trip.id)
          .eq('user_id', user.id)
          .single()

        if (existingCollaborator) {
          return new Response(
            JSON.stringify({ success: true, message: 'Already a collaborator' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Add user as collaborator
        const { error: collaboratorError } = await supabaseClient
          .from('trip_collaborators')
          .insert({
            trip_id: trip.id,
            user_id: user.id,
            role: 'editor'
          })

        if (collaboratorError) {
          throw collaboratorError
        }

        // Update trip collaborators array
        const updatedCollaborators = [...(trip.collaborators || []), user.id]
        const { error: updateError } = await supabaseClient
          .from('trips')
          .update({ collaborators: updatedCollaborators })
          .eq('id', trip.id)

        if (updateError) {
          throw updateError
        }

        // Add notification
        const { data: userProfile } = await supabaseClient
          .from('user_profiles')
          .select('name')
          .eq('user_id', user.id)
          .single()

        await supabaseClient
          .from('trip_notifications')
          .insert({
            trip_id: trip.id,
            user_id: trip.owner_id,
            notification_type: 'user_joined',
            title: 'New Collaborator',
            message: `${userProfile?.name || 'Someone'} joined ${trip.title}`,
            data: { userId: user.id, userName: userProfile?.name }
          })

        return new Response(
          JSON.stringify({ success: true, trip }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'update_presence': {
        const { currentAction } = data

        // Update user presence
        const { error } = await supabaseClient
          .from('user_presence')
          .upsert({
            trip_id: tripId,
            user_id: user.id,
            is_active: true,
            current_action: currentAction,
            last_activity: new Date().toISOString()
          })

        if (error) {
          throw error
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'add_live_notification': {
        const { notificationType, message, userName, userAvatar, autoHide } = data

        const { error } = await supabaseClient
          .from('live_notifications')
          .insert({
            trip_id: tripId,
            notification_type: notificationType,
            message,
            user_name: userName,
            user_avatar_url: userAvatar,
            auto_hide: autoHide
          })

        if (error) {
          throw error
        }

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