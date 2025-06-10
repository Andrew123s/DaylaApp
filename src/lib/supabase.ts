import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Database types
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          user_id: string
          email: string
          name: string
          avatar_url?: string
          bio?: string
          interests: string[]
          has_completed_onboarding: boolean
          travel_preferences: any
          settings: any
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          email: string
          name: string
          avatar_url?: string
          bio?: string
          interests?: string[]
          has_completed_onboarding?: boolean
          travel_preferences?: any
          settings?: any
        }
        Update: {
          name?: string
          avatar_url?: string
          bio?: string
          interests?: string[]
          has_completed_onboarding?: boolean
          travel_preferences?: any
          settings?: any
        }
      }
      trips: {
        Row: {
          id: string
          title: string
          description?: string
          start_date: string
          end_date: string
          color: string
          invite_code: string
          is_public: boolean
          owner_id: string
          collaborators: string[]
          settings: any
          created_at: string
          updated_at: string
        }
        Insert: {
          title: string
          description?: string
          start_date: string
          end_date: string
          color?: string
          is_public?: boolean
          owner_id: string
          collaborators?: string[]
          settings?: any
        }
        Update: {
          title?: string
          description?: string
          start_date?: string
          end_date?: string
          color?: string
          is_public?: boolean
          collaborators?: string[]
          settings?: any
        }
      }
      sticky_notes: {
        Row: {
          id: string
          trip_id: string
          content: string
          x_position: number
          y_position: number
          color: string
          emoji?: string
          created_by?: string
          last_edited_by?: string
          editing_users: string[]
          images: string[]
          voice_note_url?: string
          linked_notes: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          trip_id: string
          content: string
          x_position: number
          y_position: number
          color?: string
          emoji?: string
          created_by?: string
          last_edited_by?: string
          editing_users?: string[]
          images?: string[]
          voice_note_url?: string
          linked_notes?: string[]
        }
        Update: {
          content?: string
          x_position?: number
          y_position?: number
          color?: string
          emoji?: string
          last_edited_by?: string
          editing_users?: string[]
          images?: string[]
          voice_note_url?: string
          linked_notes?: string[]
        }
      }
      expenses: {
        Row: {
          id: string
          trip_id: string
          budget_id: string
          amount: number
          currency: string
          category: string
          description: string
          expense_date: string
          location?: string
          paid_by: string
          is_settled: boolean
          receipt_image_url?: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          trip_id: string
          budget_id: string
          amount: number
          currency: string
          category: string
          description: string
          expense_date: string
          location?: string
          paid_by: string
          is_settled?: boolean
          receipt_image_url?: string
          created_by: string
        }
        Update: {
          amount?: number
          currency?: string
          category?: string
          description?: string
          expense_date?: string
          location?: string
          paid_by?: string
          is_settled?: boolean
          receipt_image_url?: string
        }
      }
      payments: {
        Row: {
          id: string
          trip_id: string
          from_user_id: string
          to_user_id?: string
          amount: number
          currency: string
          description: string
          payment_method: string
          transaction_id?: string
          status: string
          expense_id?: string
          split_id?: string
          processed_at?: string
          created_at: string
        }
        Insert: {
          trip_id: string
          from_user_id: string
          to_user_id?: string
          amount: number
          currency: string
          description: string
          payment_method: string
          transaction_id?: string
          status?: string
          expense_id?: string
          split_id?: string
          processed_at?: string
        }
        Update: {
          status?: string
          transaction_id?: string
          processed_at?: string
        }
      }
    }
  }
}

// Realtime subscriptions helper
export const subscribeToTrip = (tripId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`trip-${tripId}`)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'sticky_notes',
        filter: `trip_id=eq.${tripId}`
      }, 
      callback
    )
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'user_presence',
        filter: `trip_id=eq.${tripId}`
      }, 
      callback
    )
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'live_notifications',
        filter: `trip_id=eq.${tripId}`
      }, 
      callback
    )
    .subscribe();
};

// Chat subscriptions
export const subscribeToChat = (chatId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`chat-${chatId}`)
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chat_messages',
        filter: `chat_id=eq.${chatId}`
      }, 
      callback
    )
    .subscribe();
};

// Helper functions for API calls
export const apiCall = async (functionName: string, data: any) => {
  const { data: result, error } = await supabase.functions.invoke(functionName, {
    body: data
  });

  if (error) {
    throw error;
  }

  return result;
};

// Authentication helpers
export const signUp = async (email: string, password: string, name: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name
      }
    }
  });

  if (error) {
    throw error;
  }

  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw error;
  }

  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw error;
  }
};

// File upload helper
export const uploadFile = async (bucket: string, path: string, file: File) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return publicUrl;
};