# 🏗️ Architecture Documentation

## System Overview

Maven is a full-stack web application that enables peer-to-peer skill exchange through video calls, real-time collaboration, and intelligent matching.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Login   │  │ Profile  │  │Dashboard │  │Classroom │   │
│  │ Register │  │  Setup   │  │ Matches  │  │ Session  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│         │              │              │              │       │
│         └──────────────┴──────────────┴──────────────┘       │
│                        │                                      │
│                  ┌─────▼─────┐                               │
│                  │  API Lib  │                               │
│                  │  (Axios)  │                               │
│                  └─────┬─────┘                               │
└────────────────────────┼──────────────────────────────────────┘
                         │ HTTP/REST
                         │
┌────────────────────────▼──────────────────────────────────────┐
│                    Backend (Node.js/Express)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │   Auth   │  │  Users   │  │ Matches  │  │Classroom │    │
│  │  Routes  │  │  Routes  │  │  Routes  │  │  Routes  │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       │             │              │              │           │
│  ┌────▼─────────────▼──────────────▼──────────────▼─────┐   │
│  │              Middleware Layer                          │   │
│  │  • Authentication (JWT)                                │   │
│  │  • Request Validation                                  │   │
│  │  • Error Handling                                      │   │
│  └────────────────────────────────────────────────────────┘   │
│       │             │              │              │           │
│  ┌────▼─────────────▼──────────────▼──────────────▼─────┐   │
│  │              Business Logic Layer                      │   │
│  │  • Matching Engine (Cron Job)                         │   │
│  │  • Trust Score Calculation                            │   │
│  │  • Timezone Helpers                                   │   │
│  └────────────────────────────────────────────────────────┘   │
│                         │                                      │
└─────────────────────────┼──────────────────────────────────────┘
                          │
                    ┌─────▼─────┐
                    │  MongoDB  │
                    │ Database  │
                    └───────────┘

┌─────────────────────────────────────────────────────────────┐
│              Real-time Communication Layer                   │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │   Socket.IO      │         │     WebRTC       │         │
│  │  (Server/Client) │         │  (Peer-to-Peer)  │         │
│  │                  │         │                  │         │
│  │  • Chat Messages │         │  • Video Streams │         │
│  │  • Whiteboard    │         │  • Audio Streams │         │
│  │  • Signaling     │         │  • ICE Candidate │         │
│  └──────────────────┘         └──────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Registration & Authentication

```
User Input → Frontend → POST /api/auth/register → Backend
                                ↓
                        Create User in DB
                                ↓
                        Generate JWT Token
                                ↓
                        Return Token + User Data
                                ↓
                        Store in localStorage
                                ↓
                        Redirect to Profile
```

### 2. Matching Engine Flow

```
Cron Job (Every 10 min) → Matching Engine
                                ↓
                    Fetch All Users with profile_completed=true
                                ↓
                    For Each User:
                        ↓
            Calculate Match Scores with All Other Users
                        ↓
            Skill Match (40%) + Level Match (30%) + Timezone (30%)
                        ↓
            Filter: Both directions > 50% match
                        ↓
            Sort by Total Score
                        ↓
            Create Top 3 Match Records
                                ↓
                    Update Database
                                ↓
                    Notify Users (via polling)
```

### 3. Real-time Classroom Session

```
User Joins → Load Classroom Data → Initialize Socket.IO Connection
                                            ↓
                            Emit: join-classroom
                                            ↓
                            ┌───────────────┴───────────────┐
                            ▼                               ▼
                    WebRTC Setup                    Socket.IO Events
                            │                               │
                ┌───────────┼───────────┐                  │
                ▼           ▼           ▼                   ▼
            Video       Audio       Screen          Chat, Whiteboard
                                                    Synchronization
```

## Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  googleId: String (optional),
  offer_skill: String,
  offer_level: Enum ['Beginner', 'Intermediate', 'Advanced'],
  want_skill: String,
  want_level: Enum ['Beginner', 'Intermediate', 'Advanced'],
  timezone: String,
  trust_score: Number (0-5),
  total_reviews: Number,
  profile_completed: Boolean,
  avatar: String,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### Match Collection
```javascript
{
  _id: ObjectId,
  user1_id: ObjectId (ref: User),
  user2_id: ObjectId (ref: User),
  status: Enum ['pending', 'active', 'completed', 'cancelled'],
  user1_accepted: Boolean,
  user2_accepted: Boolean,
  skill_match: {
    user1_teaches: String,
    user1_learns: String,
    user2_teaches: String,
    user2_learns: String
  },
  match_score: Number,
  scheduled_time: DateTime,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### Classroom Collection
```javascript
{
  _id: ObjectId,
  match_id: ObjectId (ref: Match, unique),
  video_call_room_id: String (UUID),
  whiteboard_session_id: String (UUID),
  chat_history: [
    {
      sender_id: ObjectId (ref: User),
      message: String,
      timestamp: DateTime
    }
  ],
  session_started: DateTime,
  session_ended: DateTime,
  is_active: Boolean,
  whiteboard_data: Mixed (Array),
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### Review Collection
```javascript
{
  _id: ObjectId,
  from_user_id: ObjectId (ref: User),
  to_user_id: ObjectId (ref: User),
  match_id: ObjectId (ref: Match),
  rating_teaching: Number (1-5),
  rating_exchange: Number (1-5),
  comment: String,
  exchange_completed: Boolean,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

## Key Algorithms

### Matching Score Calculation

```javascript
function calculateMatchScore(user1, user2) {
  // Skill Match Score (40%)
  offerMatch = skillSimilarity(user1.offer_skill, user2.want_skill)
  wantMatch = skillSimilarity(user1.want_skill, user2.offer_skill)
  skillScore = (offerMatch + wantMatch) / 2 * 0.4
  
  // Level Match Score (30%)
  offerLevelScore = levelCompatibility(user1.offer_level, user2.want_level)
  wantLevelScore = levelCompatibility(user1.want_level, user2.offer_level)
  levelScore = (offerLevelScore + wantLevelScore) / 2 * 0.3
  
  // Timezone Proximity Score (30%)
  timezoneScore = calculateTimezoneProximity(user1.timezone, user2.timezone) * 0.3
  
  return skillScore + levelScore + timezoneScore
}
```

### Trust Score Calculation

```javascript
function updateTrustScore(userId) {
  reviews = getAllReviewsForUser(userId)
  
  if (reviews.length === 0) return 0
  
  totalTeaching = sum(reviews.map(r => r.rating_teaching))
  totalExchange = sum(reviews.map(r => r.rating_exchange))
  
  avgTeaching = totalTeaching / reviews.length
  avgExchange = totalExchange / reviews.length
  
  trustScore = (avgTeaching + avgExchange) / 2
  
  updateUser(userId, { 
    trust_score: trustScore,
    total_reviews: reviews.length 
  })
}
```

## Security Considerations

### Authentication
- JWT tokens with 30-day expiration
- Bcrypt password hashing (salt rounds: 10)
- Protected routes with middleware
- Token validation on every request

### Authorization
- User can only access their own data
- Match participants verified before classroom access
- Review submissions validated

### Data Validation
- Express-validator for input sanitization
- Mongoose schema validation
- Client-side form validation

### WebRTC Security
- Peer-to-peer connection (no server recording)
- STUN servers for NAT traversal
- Secure signaling via Socket.IO

## Performance Optimizations

### Database
- Indexed fields: user_id, email, match status
- Compound indexes for match queries
- Lean queries for list operations

### Frontend
- React.memo for expensive components
- Debounced whiteboard draw events
- Lazy loading of routes
- Image optimization

### Backend
- Connection pooling for MongoDB
- Cron job rate limiting (10 min intervals)
- Socket.IO room-based broadcasting
- Middleware caching for auth checks

## Scalability Considerations

### Current Limitations
- Single server instance
- In-memory Socket.IO (no clustering)
- Local MongoDB

### Future Improvements
- Load balancing with Nginx
- Redis for Socket.IO adapter
- MongoDB replica sets
- CDN for static assets
- Microservices architecture
  - Auth service
  - Matching service
  - Communication service

## Technology Choices Rationale

### Why React?
- Component-based architecture
- Rich ecosystem
- Excellent for real-time UIs
- WebRTC compatibility

### Why Socket.IO?
- Reliable real-time communication
- Automatic fallback mechanisms
- Room support for isolated sessions
- Event-based architecture

### Why MongoDB?
- Flexible schema for evolving features
- Excellent for JSON-like documents
- Good performance for read-heavy apps
- Easy horizontal scaling

### Why WebRTC?
- Direct peer-to-peer connection
- Low latency for video/audio
- Browser native support
- No server bandwidth for streams

## Monitoring & Logging

### Backend Logging
- Express middleware logs
- Database operation logs
- Matching engine execution logs
- Error stack traces

### Frontend Logging
- Console errors in development
- Network request failures
- WebRTC connection status

### Recommended Production Tools
- PM2 for process management
- Winston for structured logging
- New Relic for APM
- Sentry for error tracking

## Deployment Architecture

### Recommended Stack
```
Frontend: Netlify/Vercel
Backend: DigitalOcean/Heroku/Railway
Database: MongoDB Atlas
File Storage: AWS S3 (for future features)
CDN: Cloudflare
```

---

This architecture is designed to be **simple, scalable, and maintainable** while providing a solid foundation for future enhancements.
