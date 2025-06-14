/*
  # Complete Dayla Platform Database Schema

  1. Authentication & Users
    - Extended user profiles with preferences and settings
    - User onboarding status and travel preferences
    - Profile images and social features

  2. Trip Management
    - Trips with collaborative features
    - Real-time collaboration tracking
    - Trip invitations and sharing

  3. Planning & Notes
    - Sticky notes with real-time editing
    - Media attachments and links
    - Note positioning and styling

  4. Budget Management
    - Comprehensive expense tracking
    - Split payments and settlements
    - Payment processing integration
    - Real-time payment status

  5. Sustainability Features
    - Carbon footprint tracking
    - Transport options comparison
    - Offset projects and contributions

  6. Smart Packing
    - Intelligent packing lists
    - Item categorization and tracking
    - Collaborative packing management

  7. Communication
    - Real-time chat system
    - Group and direct messaging
    - Message attachments

  8. Community Features
    - Forum posts and discussions
    - Travel experiences sharing
    - Social interactions

  9. Real-time Features
    - Live collaboration tracking
    - Instant notifications
    - Presence indicators

  10. Security & Permissions
    - Row Level Security for all tables
    - Role-based access control
    - Data privacy protection
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- 1. AUTHENTICATION & USER MANAGEMENT
-- =============================================

-- Extended user profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  interests TEXT[] DEFAULT '{}',
  
  -- Onboarding and preferences
  has_completed_onboarding BOOLEAN DEFAULT FALSE,
  travel_preferences JSONB DEFAULT '{}',
  
  -- Settings
  settings JSONB DEFAULT '{
    "language": "en",
    "theme": "light",
    "timezone": "UTC-8",
    "notifications": {
      "tripUpdates": true,
      "chatMessages": true,
      "communityPosts": false
    },
    "privacy": {
      "profileVisibility": "public",
      "tripSharing": true,
      "locationSharing": false
    }
  }'::jsonb,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User activity tracking
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE NOT NULL,
  trip_id UUID,
  activity_type TEXT NOT NULL,
  activity_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. TRIP MANAGEMENT
-- =============================================

-- Main trips table
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  color TEXT DEFAULT '#0EA5E9',
  invite_code TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(4), 'hex'),
  is_public BOOLEAN DEFAULT FALSE,
  
  -- Owner and collaboration
  owner_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE NOT NULL,
  collaborators UUID[] DEFAULT '{}',
  
  -- Trip settings
  settings JSONB DEFAULT '{
    "allowInvites": true,
    "showInCommunity": false,
    "allowComments": true,
    "shareLocation": false
  }'::jsonb,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trip collaborators junction table
CREATE TABLE IF NOT EXISTS trip_collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'editor' CHECK (role IN ('owner', 'editor', 'viewer')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trip_id, user_id)
);

-- Real-time user presence
CREATE TABLE IF NOT EXISTS user_presence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  current_action TEXT,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trip_id, user_id)
);

-- =============================================
-- 3. PLANNING & NOTES
-- =============================================

-- Sticky notes for trip planning
CREATE TABLE IF NOT EXISTS sticky_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  x_position INTEGER NOT NULL,
  y_position INTEGER NOT NULL,
  color TEXT DEFAULT '#FFE066',
  emoji TEXT,
  
  -- Collaboration features
  created_by UUID REFERENCES user_profiles(user_id) ON DELETE SET NULL,
  last_edited_by UUID REFERENCES user_profiles(user_id) ON DELETE SET NULL,
  editing_users UUID[] DEFAULT '{}',
  
  -- Attachments and links
  images TEXT[] DEFAULT '{}',
  voice_note_url TEXT,
  linked_notes UUID[] DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Media attachments
CREATE TABLE IF NOT EXISTS media_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  note_id UUID REFERENCES sticky_notes(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by UUID REFERENCES user_profiles(user_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 4. BUDGET MANAGEMENT
-- =============================================

-- Trip budgets
CREATE TABLE IF NOT EXISTS trip_budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE UNIQUE NOT NULL,
  total_budget DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_deadline DATE,
  reminder_settings JSONB DEFAULT '{
    "enabled": true,
    "daysBefore": 3
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budget categories
CREATE TABLE IF NOT EXISTS budget_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  budget_id UUID REFERENCES trip_budgets(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  allocated_amount DECIMAL(10,2) DEFAULT 0,
  spent_amount DECIMAL(10,2) DEFAULT 0,
  color TEXT DEFAULT '#3B82F6'
);

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  budget_id UUID REFERENCES trip_budgets(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  expense_date DATE NOT NULL,
  location TEXT,
  
  -- Payment tracking
  paid_by UUID REFERENCES user_profiles(user_id) ON DELETE SET NULL NOT NULL,
  is_settled BOOLEAN DEFAULT FALSE,
  receipt_image_url TEXT,
  
  -- Metadata
  created_by UUID REFERENCES user_profiles(user_id) ON DELETE SET NULL NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expense splits
CREATE TABLE IF NOT EXISTS expense_splits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  is_settled BOOLEAN DEFAULT FALSE,
  settled_at TIMESTAMPTZ,
  UNIQUE(expense_id, user_id)
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  from_user_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE NOT NULL,
  to_user_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Payment details
  payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'paypal', 'apple', 'bank')),
  transaction_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  
  -- References
  expense_id UUID REFERENCES expenses(id) ON DELETE SET NULL,
  split_id UUID REFERENCES expense_splits(id) ON DELETE SET NULL,
  
  -- Metadata
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settlements
CREATE TABLE IF NOT EXISTS settlements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  from_user_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE NOT NULL,
  to_user_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL,
  is_settled BOOLEAN DEFAULT FALSE,
  payment_method TEXT,
  settled_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 5. SUSTAINABILITY FEATURES
-- =============================================

-- Trip sustainability data
CREATE TABLE IF NOT EXISTS trip_sustainability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE UNIQUE NOT NULL,
  carbon_footprint JSONB DEFAULT '{
    "transport": 0,
    "accommodation": 0,
    "food": 0,
    "activities": 0,
    "total": 0,
    "treeEquivalent": 0
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transport options
CREATE TABLE IF NOT EXISTS transport_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sustainability_id UUID REFERENCES trip_sustainability(id) ON DELETE CASCADE NOT NULL,
  transport_type TEXT NOT NULL,
  name TEXT NOT NULL,
  duration_hours DECIMAL(5,2) NOT NULL,
  carbon_per_km DECIMAL(8,4) NOT NULL,
  distance_km INTEGER NOT NULL,
  total_carbon DECIMAL(10,2) NOT NULL,
  cost DECIMAL(10,2),
  is_recommended BOOLEAN DEFAULT FALSE,
  is_selected BOOLEAN DEFAULT FALSE
);

-- Accommodation options
CREATE TABLE IF NOT EXISTS accommodation_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sustainability_id UUID REFERENCES trip_sustainability(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  accommodation_type TEXT NOT NULL,
  carbon_per_night DECIMAL(8,2) NOT NULL,
  water_usage_liters INTEGER NOT NULL,
  energy_usage_kwh DECIMAL(6,2) NOT NULL,
  certifications TEXT[] DEFAULT '{}',
  sustainability_score INTEGER CHECK (sustainability_score >= 1 AND sustainability_score <= 10),
  seasonal_impact TEXT CHECK (seasonal_impact IN ('low', 'medium', 'high'))
);

-- Offset projects
CREATE TABLE IF NOT EXISTS offset_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  project_type TEXT NOT NULL CHECK (project_type IN ('forest', 'renewable', 'community', 'technology')),
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  cost_per_ton DECIMAL(8,2) NOT NULL,
  location TEXT NOT NULL,
  impact_description TEXT NOT NULL,
  certification TEXT NOT NULL,
  total_offset_tons INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Offset contributions
CREATE TABLE IF NOT EXISTS offset_contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES offset_projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE NOT NULL,
  amount_usd DECIMAL(10,2) NOT NULL,
  carbon_offset_kg DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sustainability goals
CREATE TABLE IF NOT EXISTS sustainability_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  goal_type TEXT NOT NULL,
  target_value DECIMAL(10,2) NOT NULL,
  current_value DECIMAL(10,2) DEFAULT 0,
  unit TEXT NOT NULL,
  deadline DATE NOT NULL,
  is_achieved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 6. SMART PACKING
-- =============================================

-- Packing lists
CREATE TABLE IF NOT EXISTS packing_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE UNIQUE NOT NULL,
  luggage_type TEXT DEFAULT 'carry-on' CHECK (luggage_type IN ('carry-on', 'checked', 'personal')),
  total_weight_grams INTEGER DEFAULT 0,
  total_volume_cm3 INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Packing items
CREATE TABLE IF NOT EXISTS packing_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  packing_list_id UUID REFERENCES packing_lists(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  weight_grams INTEGER NOT NULL,
  volume_cm3 INTEGER NOT NULL,
  status TEXT DEFAULT 'missing' CHECK (status IN ('packed', 'purchased', 'missing')),
  
  -- Assignment and sharing
  assigned_to UUID REFERENCES user_profiles(user_id) ON DELETE SET NULL,
  is_shared BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'recommended' CHECK (priority IN ('essential', 'recommended', 'optional')),
  
  -- Context
  weather_dependent BOOLEAN DEFAULT FALSE,
  activity_specific TEXT[] DEFAULT '{}',
  notes TEXT,
  estimated_cost DECIMAL(8,2),
  purchase_link TEXT,
  
  -- Metadata
  last_updated_by UUID REFERENCES user_profiles(user_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 7. COMMUNICATION SYSTEM
-- =============================================

-- Chat conversations
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_type TEXT NOT NULL CHECK (chat_type IN ('direct', 'group')),
  name TEXT,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  created_by UUID REFERENCES user_profiles(user_id) ON DELETE SET NULL NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat participants
CREATE TABLE IF NOT EXISTS chat_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(chat_id, user_id)
);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'voice')),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 8. COMMUNITY FEATURES
-- =============================================

-- Forum posts
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  location TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forum comments
CREATE TABLE IF NOT EXISTS forum_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post likes
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Comment likes
CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- =============================================
-- 9. NOTIFICATIONS SYSTEM
-- =============================================

-- Trip notifications
CREATE TABLE IF NOT EXISTS trip_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE NOT NULL,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Live notifications for real-time features
CREATE TABLE IF NOT EXISTS live_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  notification_type TEXT NOT NULL,
  message TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar_url TEXT,
  auto_hide BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 10. SCHEDULES & EVENTS
-- =============================================

-- Trip schedules
CREATE TABLE IF NOT EXISTS trip_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  location TEXT,
  event_type TEXT DEFAULT 'other' CHECK (event_type IN ('flight', 'accommodation', 'activity', 'meal', 'transport', 'other')),
  attendees UUID[] DEFAULT '{}',
  created_by UUID REFERENCES user_profiles(user_id) ON DELETE SET NULL NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE sticky_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_sustainability ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE accommodation_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE offset_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE offset_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sustainability_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE packing_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE packing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_schedules ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Trips policies
CREATE POLICY "Users can read trips they collaborate on" ON trips
  FOR SELECT TO authenticated
  USING (
    auth.uid() = owner_id OR 
    auth.uid() = ANY(collaborators) OR
    is_public = true
  );

CREATE POLICY "Trip owners can update trips" ON trips
  FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create trips" ON trips
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Trip owners can delete trips" ON trips
  FOR DELETE TO authenticated
  USING (auth.uid() = owner_id);

-- Trip collaborators policies
CREATE POLICY "Users can read collaborators of their trips" ON trip_collaborators
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips 
      WHERE trips.id = trip_collaborators.trip_id 
      AND (auth.uid() = trips.owner_id OR auth.uid() = ANY(trips.collaborators))
    )
  );

CREATE POLICY "Trip owners can manage collaborators" ON trip_collaborators
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips 
      WHERE trips.id = trip_collaborators.trip_id 
      AND auth.uid() = trips.owner_id
    )
  );

-- Sticky notes policies
CREATE POLICY "Users can read notes from their trips" ON sticky_notes
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips 
      WHERE trips.id = sticky_notes.trip_id 
      AND (auth.uid() = trips.owner_id OR auth.uid() = ANY(trips.collaborators))
    )
  );

CREATE POLICY "Trip collaborators can manage notes" ON sticky_notes
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips 
      WHERE trips.id = sticky_notes.trip_id 
      AND (auth.uid() = trips.owner_id OR auth.uid() = ANY(trips.collaborators))
    )
  );

-- Budget policies
CREATE POLICY "Users can read budgets from their trips" ON trip_budgets
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips 
      WHERE trips.id = trip_budgets.trip_id 
      AND (auth.uid() = trips.owner_id OR auth.uid() = ANY(trips.collaborators))
    )
  );

CREATE POLICY "Trip collaborators can manage budgets" ON trip_budgets
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips 
      WHERE trips.id = trip_budgets.trip_id 
      AND (auth.uid() = trips.owner_id OR auth.uid() = ANY(trips.collaborators))
    )
  );

-- Expenses policies
CREATE POLICY "Users can read expenses from their trips" ON expenses
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips 
      WHERE trips.id = expenses.trip_id 
      AND (auth.uid() = trips.owner_id OR auth.uid() = ANY(trips.collaborators))
    )
  );

CREATE POLICY "Trip collaborators can manage expenses" ON expenses
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips 
      WHERE trips.id = expenses.trip_id 
      AND (auth.uid() = trips.owner_id OR auth.uid() = ANY(trips.collaborators))
    )
  );

-- Payments policies
CREATE POLICY "Users can read payments from their trips" ON payments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips 
      WHERE trips.id = payments.trip_id 
      AND (auth.uid() = trips.owner_id OR auth.uid() = ANY(trips.collaborators))
    )
  );

CREATE POLICY "Users can create payments" ON payments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = from_user_id);

-- Forum posts policies (public read, authenticated write)
CREATE POLICY "Anyone can read public forum posts" ON forum_posts
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can create forum posts" ON forum_posts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own forum posts" ON forum_posts
  FOR UPDATE TO authenticated
  USING (auth.uid() = author_id);

-- Chat policies
CREATE POLICY "Users can read chats they participate in" ON chats
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_participants 
      WHERE chat_participants.chat_id = chats.id 
      AND chat_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create chats" ON chats
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Chat messages policies
CREATE POLICY "Users can read messages from their chats" ON chat_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_participants 
      WHERE chat_participants.chat_id = chat_messages.chat_id 
      AND chat_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their chats" ON chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM chat_participants 
      WHERE chat_participants.chat_id = chat_messages.chat_id 
      AND chat_participants.user_id = auth.uid()
    )
  );

-- Notifications policies
CREATE POLICY "Users can read own notifications" ON trip_notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON trip_notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sticky_notes_updated_at BEFORE UPDATE ON sticky_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trip_budgets_updated_at BEFORE UPDATE ON trip_budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trip_sustainability_updated_at BEFORE UPDATE ON trip_sustainability FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_packing_lists_updated_at BEFORE UPDATE ON packing_lists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_packing_items_updated_at BEFORE UPDATE ON packing_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_posts_updated_at BEFORE UPDATE ON forum_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trip_schedules_updated_at BEFORE UPDATE ON trip_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update expense split totals
CREATE OR REPLACE FUNCTION update_expense_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Update budget category spent amount
  UPDATE budget_categories 
  SET spent_amount = (
    SELECT COALESCE(SUM(amount), 0) 
    FROM expenses 
    WHERE expenses.category = budget_categories.category
    AND expenses.budget_id = budget_categories.budget_id
  )
  WHERE budget_id = (
    SELECT budget_id FROM expenses WHERE id = COALESCE(NEW.id, OLD.id)
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for expense totals
CREATE TRIGGER update_expense_totals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_expense_totals();

-- Function to update packing list totals
CREATE OR REPLACE FUNCTION update_packing_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE packing_lists 
  SET 
    total_weight_grams = (
      SELECT COALESCE(SUM(weight_grams * quantity), 0) 
      FROM packing_items 
      WHERE packing_list_id = packing_lists.id
    ),
    total_volume_cm3 = (
      SELECT COALESCE(SUM(volume_cm3 * quantity), 0) 
      FROM packing_items 
      WHERE packing_list_id = packing_lists.id
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.packing_list_id, OLD.packing_list_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for packing totals
CREATE TRIGGER update_packing_totals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON packing_items
  FOR EACH ROW EXECUTE FUNCTION update_packing_totals();

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Trips indexes
CREATE INDEX IF NOT EXISTS idx_trips_owner_id ON trips(owner_id);
CREATE INDEX IF NOT EXISTS idx_trips_invite_code ON trips(invite_code);
CREATE INDEX IF NOT EXISTS idx_trips_is_public ON trips(is_public);
CREATE INDEX IF NOT EXISTS idx_trips_collaborators ON trips USING GIN(collaborators);

-- Trip collaborators indexes
CREATE INDEX IF NOT EXISTS idx_trip_collaborators_trip_id ON trip_collaborators(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_collaborators_user_id ON trip_collaborators(user_id);

-- Sticky notes indexes
CREATE INDEX IF NOT EXISTS idx_sticky_notes_trip_id ON sticky_notes(trip_id);
CREATE INDEX IF NOT EXISTS idx_sticky_notes_created_by ON sticky_notes(created_by);

-- Expenses indexes
CREATE INDEX IF NOT EXISTS idx_expenses_trip_id ON expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_expenses_budget_id ON expenses(budget_id);
CREATE INDEX IF NOT EXISTS idx_expenses_paid_by ON expenses(paid_by);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

-- Expense splits indexes
CREATE INDEX IF NOT EXISTS idx_expense_splits_expense_id ON expense_splits(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_splits_user_id ON expense_splits(user_id);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_trip_id ON payments(trip_id);
CREATE INDEX IF NOT EXISTS idx_payments_from_user_id ON payments(from_user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Chat indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_chat_id ON chat_participants(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user_id ON chat_participants(user_id);

-- Forum indexes
CREATE INDEX IF NOT EXISTS idx_forum_posts_author_id ON forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON forum_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_posts_tags ON forum_posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_forum_comments_post_id ON forum_comments(post_id);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_trip_notifications_user_id ON trip_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_trip_notifications_trip_id ON trip_notifications(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_notifications_is_read ON trip_notifications(is_read);

-- =============================================
-- INITIAL DATA
-- =============================================

-- Insert default offset projects
INSERT INTO offset_projects (name, project_type, description, image_url, cost_per_ton, location, impact_description, certification, total_offset_tons) VALUES
('Global Forest Restoration', 'forest', 'Supporting reforestation efforts worldwide to combat climate change', 'https://images.pexels.com/photos/1632790/pexels-photo-1632790.jpeg?auto=compress&cs=tinysrgb&w=800', 22.00, 'Global', '1M+ trees planted', 'Gold Standard', 5000),
('Renewable Energy Development', 'renewable', 'Funding solar and wind energy projects in developing countries', 'https://images.pexels.com/photos/3617500/pexels-photo-3617500.jpeg?auto=compress&cs=tinysrgb&w=800', 18.00, 'Global', '50 MW clean energy', 'VCS', 8500),
('Community Clean Water', 'community', 'Providing clean water access while reducing carbon emissions', 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=800', 25.00, 'Africa & Asia', '100,000 people served', 'Gold Standard', 3200),
('Carbon Capture Technology', 'technology', 'Advanced carbon capture and storage solutions', 'https://images.pexels.com/photos/3617500/pexels-photo-3617500.jpeg?auto=compress&cs=tinysrgb&w=800', 35.00, 'Global', '1M tons CO2 captured', 'VCS', 2800);