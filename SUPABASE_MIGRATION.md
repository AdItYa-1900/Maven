# 🔄 Supabase Migration Guide

## Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Create a new project
3. Note down:
   - Project URL
   - Anon/Public Key
   - Service Role Key (keep secret!)

## Step 2: Update Environment Variables

In `backend/.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Step 3: Install Supabase Client

```bash
cd backend
npm install @supabase/supabase-js
```

## Step 4: Database Schema

Run these SQL commands in Supabase SQL Editor:

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT, -- null if using OAuth
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

-- Index for faster queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_profile_completed ON users(profile_completed);
```

### Matches Table
```sql
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

-- Indexes
CREATE INDEX idx_matches_user1 ON matches(user1_id);
CREATE INDEX idx_matches_user2 ON matches(user2_id);
CREATE INDEX idx_matches_status ON matches(status);
```

### Classrooms Table
```sql
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

-- Index
CREATE INDEX idx_classrooms_match ON classrooms(match_id);
```

### Reviews Table
```sql
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

-- Indexes
CREATE INDEX idx_reviews_to_user ON reviews(to_user_id);
CREATE INDEX idx_reviews_match ON reviews(match_id);
```

### Enable Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Users: Can read all, update only their own
CREATE POLICY "Users can read all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- Matches: Can read and update own matches
CREATE POLICY "Users can read own matches" ON matches FOR SELECT 
  USING (auth.uid()::text = user1_id::text OR auth.uid()::text = user2_id::text);
CREATE POLICY "Users can update own matches" ON matches FOR UPDATE 
  USING (auth.uid()::text = user1_id::text OR auth.uid()::text = user2_id::text);

-- Classrooms: Can access if part of the match
CREATE POLICY "Users can access own classrooms" ON classrooms FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM matches 
      WHERE matches.id = classrooms.match_id 
      AND (matches.user1_id::text = auth.uid()::text OR matches.user2_id::text = auth.uid()::text)
    )
  );

-- Reviews: Can read reviews about themselves, create reviews
CREATE POLICY "Users can read reviews about them" ON reviews FOR SELECT 
  USING (auth.uid()::text = to_user_id::text OR auth.uid()::text = from_user_id::text);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT 
  WITH CHECK (auth.uid()::text = from_user_id::text);
```

## Step 5: Update Backend Code

The backend will need to be refactored to use Supabase client instead of Mongoose.

### Option A: Keep Custom JWT Auth + Supabase Database
- Use Supabase only as a PostgreSQL database
- Keep existing JWT authentication logic
- Update all database queries to use Supabase client

### Option B: Use Supabase Auth (Recommended)
- Use Supabase's built-in authentication
- Simpler implementation
- Better security out of the box
- Real-time capabilities

## Decision Required

Which approach do you prefer?
1. **Option A**: Custom JWT + Supabase Database
2. **Option B**: Full Supabase (Auth + Database)

Let me know and I'll help implement the chosen approach!

## Benefits of Supabase

✅ PostgreSQL (more powerful than MongoDB for relational data)  
✅ Built-in authentication  
✅ Real-time subscriptions  
✅ Row Level Security  
✅ Auto-generated REST API  
✅ Storage for files  
✅ Free tier available  

---

**Next Steps:** Choose your approach and I'll help migrate the code!
