# 🚀 Supabase Setup Guide for Maven

## Step 1: Create Supabase Account & Project

### 1.1 Sign Up
1. Go to https://supabase.com
2. Click **"Start your project"**
3. Sign up with GitHub, Google, or email

### 1.2 Create New Project
1. Click **"New Project"**
2. Choose your organization (or create one)
3. Fill in project details:
   - **Name**: `maven` or `maven-platform`
   - **Database Password**: Create a strong password (SAVE THIS!)
   - **Region**: Choose closest to you (e.g., `us-east-1` for USA)
4. Click **"Create new project"**
5. Wait 2-3 minutes for setup to complete

---

## Step 2: Get Your Credentials

### 2.1 Find Project Settings
1. In your Supabase project dashboard, click **"Settings"** (gear icon) in left sidebar
2. Click **"API"** under Project Settings

### 2.2 Copy Credentials
You'll need 3 things:

1. **Project URL**
   - Look for "Project URL"
   - Copy the URL (looks like: `https://xxxxxxxxxxxxx.supabase.co`)

2. **Anon/Public Key**
   - Look for "Project API keys" → "anon public"
   - Click to reveal and copy

3. **Service Role Key** (⚠️ Keep Secret!)
   - Look for "Project API keys" → "service_role"
   - Click to reveal and copy

---

## Step 3: Update Your .env File

1. Open `backend/.env` (create if it doesn't exist)
2. Add these lines with YOUR actual values:

```env
PORT=5000

# Supabase Configuration
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here

# JWT Secret (generate a random string)
JWT_SECRET=your_random_secret_key_at_least_32_characters_long

# Frontend URL
CLIENT_URL=http://localhost:5173
```

**⚠️ IMPORTANT**: Never commit `.env` to Git! It's already in `.gitignore`.

---

## Step 4: Create Database Tables

### 4.1 Open SQL Editor
1. In Supabase dashboard, click **"SQL Editor"** in left sidebar
2. Click **"New query"**

### 4.2 Run Table Creation Script

Copy and paste this ENTIRE script into the SQL editor, then click **"Run"**:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- USERS TABLE
-- ========================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  google_id TEXT UNIQUE,
  offer_skill TEXT,
  offer_level TEXT CHECK (offer_level IN ('Beginner', 'Intermediate', 'Advanced')),
  want_skill TEXT,
  want_level TEXT CHECK (want_level IN ('Beginner', 'Intermediate', 'Advanced')),
  timezone TEXT DEFAULT 'UTC',
  trust_score DECIMAL(2,1) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  profile_completed BOOLEAN DEFAULT FALSE,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_profile_completed ON users(profile_completed);

-- ========================================
-- MATCHES TABLE
-- ========================================
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'active', 'completed', 'cancelled')) DEFAULT 'pending',
  user1_accepted BOOLEAN DEFAULT FALSE,
  user2_accepted BOOLEAN DEFAULT FALSE,
  skill_match JSONB,
  match_score DECIMAL(5,2),
  scheduled_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for matches
CREATE INDEX idx_matches_user1 ON matches(user1_id);
CREATE INDEX idx_matches_user2 ON matches(user2_id);
CREATE INDEX idx_matches_status ON matches(status);

-- ========================================
-- CLASSROOMS TABLE
-- ========================================
CREATE TABLE classrooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID UNIQUE REFERENCES matches(id) ON DELETE CASCADE,
  video_call_room_id TEXT NOT NULL,
  whiteboard_session_id TEXT NOT NULL,
  chat_history JSONB DEFAULT '[]'::jsonb,
  session_started TIMESTAMP WITH TIME ZONE,
  session_ended TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  whiteboard_data JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for classrooms
CREATE INDEX idx_classrooms_match ON classrooms(match_id);

-- ========================================
-- REVIEWS TABLE
-- ========================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  rating_teaching INTEGER CHECK (rating_teaching >= 1 AND rating_teaching <= 5),
  rating_exchange INTEGER CHECK (rating_exchange >= 1 AND rating_exchange <= 5),
  comment TEXT,
  exchange_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for reviews
CREATE INDEX idx_reviews_to_user ON reviews(to_user_id);
CREATE INDEX idx_reviews_from_user ON reviews(from_user_id);
CREATE INDEX idx_reviews_match ON reviews(match_id);

-- ========================================
-- AUTO-UPDATE TIMESTAMP TRIGGER
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classrooms_updated_at BEFORE UPDATE ON classrooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 4.3 Verify Tables Created
1. Click **"Table Editor"** in left sidebar
2. You should see: `users`, `matches`, `classrooms`, `reviews`

---

## Step 5: Set Up Row Level Security (RLS)

### 5.1 Run RLS Script

In SQL Editor, run this script to enable security:

```sql
-- ========================================
-- ENABLE ROW LEVEL SECURITY
-- ========================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- ========================================
-- RLS POLICIES
-- ========================================

-- Users: Anyone can read, users can update their own profile
CREATE POLICY "Allow public read access to users"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Allow users to update own profile"
  ON users FOR UPDATE
  USING (auth.uid()::text = id::text);

CREATE POLICY "Allow users to insert own profile"
  ON users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow users to read own matches"
  ON matches FOR SELECT
  USING (
    auth.uid()::text = user1_id::text OR 
    auth.uid()::text = user2_id::text
  );

CREATE POLICY "Allow users to update own matches"
  ON matches FOR UPDATE
  USING (
    auth.uid()::text = user1_id::text OR 
    auth.uid()::text = user2_id::text
  );

CREATE POLICY "Allow system to create matches"
  ON matches FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow users to access own classrooms"
  ON classrooms FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = classrooms.match_id
      AND (
        matches.user1_id::text = auth.uid()::text OR 
        matches.user2_id::text = auth.uid()::text
      )
    )
  );

CREATE POLICY "Allow users to read reviews"
  ON reviews FOR SELECT
  USING (
    auth.uid()::text = to_user_id::text OR 
    auth.uid()::text = from_user_id::text
  );

CREATE POLICY "Allow users to create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid()::text = from_user_id::text);
```

---

## Step 6: Install Supabase Client

In your terminal:

```bash
cd backend
npm install @supabase/supabase-js
```

---

## Step 7: Test Your Connection

### 7.1 Run Test Script

I'll create a test script for you. After running it, you should see:
- ✅ Connection successful
- ✅ Tables listed

```bash
cd backend
node test-supabase.js
```

---

## Step 8: Start Your Application

```bash
# From root directory
npm run dev
```

Or separately:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## ✅ Verification Checklist

- [ ] Supabase project created
- [ ] Credentials copied to `backend/.env`
- [ ] Database tables created (4 tables: users, matches, classrooms, reviews)
- [ ] RLS policies enabled
- [ ] `@supabase/supabase-js` installed
- [ ] Test script runs successfully
- [ ] Application starts without errors

---

## 🆘 Troubleshooting

### "Cannot connect to Supabase"
- Check your `.env` file has correct SUPABASE_URL and keys
- Make sure URL starts with `https://`
- Verify keys don't have extra spaces

### "Table already exists" error
- Tables were already created
- You can skip table creation or drop them first:
  ```sql
  DROP TABLE IF EXISTS reviews CASCADE;
  DROP TABLE IF EXISTS classrooms CASCADE;
  DROP TABLE IF EXISTS matches CASCADE;
  DROP TABLE IF EXISTS users CASCADE;
  ```

### "Authentication failed"
- Check your SERVICE_ROLE_KEY is correct
- Make sure you're using the service_role key, not anon key for backend

---

## 📚 Next Steps

1. ✅ Complete setup above
2. Register a user via frontend
3. Complete your profile
4. Let the matching engine find partners
5. Start your first skill exchange session!

---

**Need help?** Check the Supabase docs: https://supabase.com/docs
