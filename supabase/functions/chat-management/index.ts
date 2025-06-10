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

    const { action, data } = await req.json()

    switch (action) {
      case 'create_chat': {
        const { chatType, name, participants, tripId } = data

        // Create chat
        const { data: chat, error: chatError } = await supabaseClient
          .from('chats')
          .insert({
            chat_type: chatType,
            name: chatType === 'group' ? name : null,
            trip_id: tripId,
            created_by: user.id
          })
          .select()
          .single()

        if (chatError) {
          throw chatError
        }

        // Add participants (including creator)
        const allParticipants = [user.id, ...participants]
        const participantInserts = allParticipants.map(userId => ({
          chat_id: chat.id,
          user_id: userId
        }))

        const { error: participantsError } = await supabaseClient
          .from('chat_participants')
          .insert(participantInserts)

        if (participantsError) {
          throw participantsError
        }

        return new Response(
          JSON.stringify({ success: true, chat }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'send_message': {
        const { chatId, content, messageType = 'text', imageUrl } = data

        // Verify user is participant
        const { data: participant } = await supabaseClient
          .from('chat_participants')
          .select('*')
          .eq('chat_id', chatId)
          .eq('user_id', user.id)
          .single()

        if (!participant) {
          throw new Error('Not authorized to send messages to this chat')
        }

        // Send message
        const { data: message, error: messageError } = await supabaseClient
          .from('chat_messages')
          .insert({
            chat_id: chatId,
            sender_id: user.id,
            content,
            message_type: messageType,
            image_url: imageUrl
          })
          .select(`
            *,
            sender:user_profiles!chat_messages_sender_id_fkey(name, avatar_url)
          `)
          .single()

        if (messageError) {
          throw messageError
        }

        // Update chat updated_at
        await supabaseClient
          .from('chats')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', chatId)

        return new Response(
          JSON.stringify({ success: true, message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get_user_chats': {
        const { data: chats, error } = await supabaseClient
          .from('chats')
          .select(`
            *,
            chat_participants!inner(user_id),
            chat_messages(
              id,
              content,
              message_type,
              created_at,
              sender:user_profiles!chat_messages_sender_id_fkey(name)
            )
          `)
          .eq('chat_participants.user_id', user.id)
          .order('updated_at', { ascending: false })

        if (error) {
          throw error
        }

        // Get latest message for each chat
        const chatsWithLatestMessage = chats?.map(chat => ({
          ...chat,
          lastMessage: chat.chat_messages?.[chat.chat_messages.length - 1] || null,
          participantCount: chat.chat_participants?.length || 0
        }))

        return new Response(
          JSON.stringify({ chats: chatsWithLatestMessage }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get_chat_messages': {
        const { chatId, limit = 50, offset = 0 } = data

        // Verify user is participant
        const { data: participant } = await supabaseClient
          .from('chat_participants')
          .select('*')
          .eq('chat_id', chatId)
          .eq('user_id', user.id)
          .single()

        if (!participant) {
          throw new Error('Not authorized to view this chat')
        }

        const { data: messages, error } = await supabaseClient
          .from('chat_messages')
          .select(`
            *,
            sender:user_profiles!chat_messages_sender_id_fkey(name, avatar_url)
          `)
          .eq('chat_id', chatId)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)

        if (error) {
          throw error
        }

        return new Response(
          JSON.stringify({ messages: messages?.reverse() || [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'add_participants': {
        const { chatId, participantIds } = data

        // Verify user is in the chat
        const { data: participant } = await supabaseClient
          .from('chat_participants')
          .select('*')
          .eq('chat_id', chatId)
          .eq('user_id', user.id)
          .single()

        if (!participant) {
          throw new Error('Not authorized to add participants')
        }

        // Add new participants
        const participantInserts = participantIds.map((userId: string) => ({
          chat_id: chatId,
          user_id: userId
        }))

        const { error } = await supabaseClient
          .from('chat_participants')
          .insert(participantInserts)

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