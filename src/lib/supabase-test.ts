// Supabase Connection Test Utility
import { createClient } from '@supabase/supabase-js';

export const testSupabaseConnection = async () => {
  console.log('🔍 Testing Supabase Connection...');
  
  // Check environment variables
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  console.log('📋 Environment Variables:');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Present' : '❌ Missing');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Present' : '❌ Missing');
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing required environment variables');
    return {
      success: false,
      error: 'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables'
    };
  }
  
  try {
    // Test connection
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    console.log('🔗 Testing connection...');
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Connection test failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
    
    console.log('✅ Supabase connection successful!');
    return {
      success: true,
      message: 'Supabase connection is working correctly'
    };
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Auto-run test in development
if (import.meta.env.DEV) {
  testSupabaseConnection().then(result => {
    if (result.success) {
      console.log('🎉', result.message);
    } else {
      console.error('💥 Supabase Test Failed:', result.error);
    }
  });
}