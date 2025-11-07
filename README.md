# 🎓 Maven - Peer-to-Peer Skill Exchange Platform

Maven is a complete MVP platform for connecting people who want to teach and learn skills from each other. Built with React, Node.js, Socket.IO, and WebRTC.

## ✨ Features

### 1. **User Profile System**
- Email/password authentication
- Google OAuth support (placeholder ready)
- "Offer & Want" skill profile
- Skill level selection (Beginner/Intermediate/Advanced)
- Automatic timezone detection

### 2. **Smart Matching Engine**
- Automatic matching based on Offer ↔ Want pairs
- Skill similarity scoring
- Level compatibility ranking
- Timezone proximity scoring
- Runs automatically every 10 minutes

### 3. **Match Acceptance Flow**
- Real-time match notifications
- Accept/Decline functionality
- Mutual acceptance required
- Automatic classroom creation

### 4. **In-Platform Classroom**
- **WebRTC Video/Audio Call**
  - Camera toggle
  - Microphone mute/unmute
  - Peer-to-peer connection
  
- **Real-time Collaborative Whiteboard**
  - Multi-color drawing
  - Adjustable pen size
  - Eraser tool
  - Clear canvas
  - Real-time synchronization

- **Persistent Chat**
  - Real-time messaging
  - Chat history
  - Message persistence

### 5. **Trust Score System**
- Post-session completion confirmation
- 5-star rating system
- Teaching quality rating
- Exchange quality rating
- Automatic trust score calculation
- Review history

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express** - REST API
- **MongoDB** + **Mongoose** - Database
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Node-Cron** - Scheduled tasks

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **React Router** - Navigation
- **Socket.IO Client** - Real-time features
- **Axios** - HTTP client
- **TailwindCSS** - Styling
- **Lucide React** - Icons
- **WebRTC** - Video/audio calling

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally or connection string)
- Modern web browser with WebRTC support

### Step 1: Clone and Install

```bash
cd hack2025

# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Configure Environment Variables

**Backend** (`backend/.env`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/maven
JWT_SECRET=your_jwt_secret_key_change_this_in_production
CLIENT_URL=http://localhost:5173
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000
```

### Step 3: Start MongoDB

Make sure MongoDB is running on your system:

```bash
# macOS/Linux
mongod

# Windows
net start MongoDB
```

### Step 4: Run the Application

**Option A: Run both services together** (from root directory)
```bash
npm run dev
```

**Option B: Run separately**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

### Step 5: Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 🚀 Usage Guide

### 1. Explore the Platform
1. Navigate to http://localhost:5173
2. Browse the beautiful landing page showcasing all features
3. Click "Get Started" or "Sign Up" when ready

### 2. Create an Account
1. Click "Sign up" from the landing page or header
2. Enter your details and create an account

### 3. Complete Your Profile
1. After registration, you'll be redirected to the profile page
2. Enter:
   - Skill you can teach (e.g., "Advanced Excel")
   - Your level in that skill
   - Skill you want to learn (e.g., "Python Programming")
   - Desired learning level
3. Click "Save Profile & Find Matches"

### 4. View Matches
- The matching engine will automatically find potential partners
- View match requests on your dashboard
- See partner's skills and trust score
- Accept or decline matches

### 5. Enter Classroom
Once both users accept:
1. Click "Join Classroom" on the active match
2. Allow camera and microphone permissions
3. Use the tabs to switch between:
   - **Video Call**: Face-to-face interaction
   - **Whiteboard**: Draw and collaborate
   - **Chat**: Text communication

### 6. End Session & Review
1. Click "End Session" when done
2. Confirm if the skill exchange was completed
3. Rate your partner's teaching (1-5 stars)
4. Rate overall exchange quality (1-5 stars)
5. Add optional comments
6. Submit review (updates partner's trust score)

## 📁 Project Structure

```
hack2025/
├── backend/
│   ├── models/          # MongoDB schemas
│   │   ├── User.js
│   │   ├── Match.js
│   │   ├── Classroom.js
│   │   └── Review.js
│   ├── routes/          # API endpoints
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── matches.js
│   │   ├── classrooms.js
│   │   └── reviews.js
│   ├── services/        # Business logic
│   │   └── matchingEngine.js
│   ├── sockets/         # Socket.IO handlers
│   │   └── socketHandler.js
│   ├── middleware/      # Express middleware
│   │   └── auth.js
│   ├── utils/           # Helper functions
│   │   └── timezoneHelper.js
│   └── server.js        # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # Reusable UI components
│   │   │   └── classroom/       # Classroom features
│   │   │       ├── VideoCall.jsx
│   │   │       ├── Whiteboard.jsx
│   │   │       ├── Chat.jsx
│   │   │       └── ReviewModal.jsx
│   │   ├── pages/               # Main pages
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── Classroom.jsx
│   │   ├── context/             # React context
│   │   │   └── AuthContext.jsx
│   │   ├── lib/                 # Utilities
│   │   │   ├── api.js
│   │   │   └── utils.js
│   │   └── App.jsx
│   └── index.html
│
└── package.json
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google OAuth

### Users
- `GET /api/users/me` - Get current user
- `PUT /api/users/profile` - Update profile
- `GET /api/users/:userId` - Get user by ID

### Matches
- `GET /api/matches/my-matches` - Get user's matches
- `POST /api/matches/:matchId/accept` - Accept match
- `POST /api/matches/:matchId/decline` - Decline match
- `GET /api/matches/:matchId` - Get match details

### Classrooms
- `GET /api/classrooms/match/:matchId` - Get classroom
- `POST /api/classrooms/:classroomId/start` - Start session
- `POST /api/classrooms/:classroomId/end` - End session
- `GET /api/classrooms/:classroomId/chat` - Get chat history

### Reviews
- `POST /api/reviews` - Submit review
- `GET /api/reviews/user/:userId` - Get user reviews
- `GET /api/reviews/check/:matchId` - Check review status

## 🎯 Key Features Explained

### Matching Algorithm
The matching engine uses a sophisticated scoring system:

1. **Skill Match** (40%)
   - Exact match: 100 points
   - Contains match: 80 points
   - Word overlap: 50-70 points

2. **Level Compatibility** (30%)
   - Same level: 100 points
   - 1 level difference: 70 points
   - 2 levels difference: 40 points

3. **Timezone Proximity** (30%)
   - Same timezone: 100 points
   - ±3 hours: 80 points
   - ±6 hours: 60 points
   - ±9 hours: 40 points

Minimum threshold: 50% match in both directions

### Trust Score Calculation
```
Trust Score = Average of all (Teaching Rating + Exchange Rating) / 2
```
- Displayed on user profiles
- Helps users choose reliable partners
- Updated after each completed session

## 🔐 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Protected API routes
- Input validation
- CORS configuration
- Secure WebRTC peer-to-peer connections

## 🚧 Future Enhancements

### Bonus Features (Ready to Implement)
- **Calendar Integration**
  - Google Calendar sync
  - Outlook integration
  - Automatic scheduling
  - Time slot selection

### Additional Ideas
- Email notifications
- Profile pictures upload
- Session recording
- Screen sharing
- File sharing in classroom
- Multi-user sessions (group learning)
- Skill verification badges
- Achievement system
- Mobile app (React Native)

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Make sure MongoDB is running
mongod --dbpath /path/to/data/directory
```

### WebRTC Not Working
- Check browser permissions for camera/microphone
- Ensure you're using HTTPS or localhost
- Check firewall settings
- Try Chrome/Firefox (best WebRTC support)

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
npx kill-port 5000

# Kill process on port 5173 (frontend)
npx kill-port 5173
```

### Socket.IO Connection Issues
- Verify backend is running
- Check CORS settings in server.js
- Ensure CLIENT_URL is correctly set

## 📝 Development Notes

### Running Tests
```bash
# Backend tests (if implemented)
cd backend
npm test

# Frontend tests (if implemented)
cd frontend
npm test
```

### Building for Production

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 🤝 Contributing

This is an MVP project. Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 📄 License

MIT License - Feel free to use this project for learning or commercial purposes.

## 👥 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the code comments
3. Open an issue on GitHub

---

**Built with ❤️ for peer-to-peer learning**

Happy Learning with Maven! 🎓✨
