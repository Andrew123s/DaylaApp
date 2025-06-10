/*
  # Fix User Profiles RLS Policy

  This migration fixes the Row Level Security policy for user_profiles to allow
  authenticated users to read profiles of other users who are collaborators on
  shared trips. This enables the payment-processing Edge Function to successfully
  retrieve user details for payment history.

  ## Changes
  - Drop existing restrictive RLS policy
  - Create new policy allowing access to collaborator profiles
*/

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;

-- Create new policy that allows reading own profile and profiles of collaborators on shared trips
CREATE POLICY "Users can read own profile and profiles of collaborators on shared trips" ON user_profiles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM trip_collaborators tc1
      JOIN trip_collaborators tc2 ON tc1.trip_id = tc2.trip_id
      WHERE tc1.user_id = auth.uid() AND tc2.user_id = user_profiles.user_id
    ) OR
    EXISTS (
      SELECT 1 FROM trips t1
      JOIN trips t2 ON (t1.owner_id = auth.uid() AND t2.owner_id = user_profiles.user_id)
      WHERE auth.uid() = ANY(t2.collaborators) OR user_profiles.user_id = ANY(t1.collaborators)
    )
  );