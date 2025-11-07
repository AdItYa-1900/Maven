# 🚀 Quick Start Guide

Get Maven running in 5 minutes!

## Prerequisites Check

```bash
# Check Node.js version (should be 16+)
node --version

# Check if MongoDB is installed
mongod --version
```

## 1. Install Dependencies (2 minutes)

```bash
# From the project root
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

## 2. Start MongoDB (30 seconds)

**Windows:**
```bash
net start MongoDB
```

**macOS/Linux:**
```bash
mongod
# Or if installed via Homebrew:
brew services start mongodb-community
```

## 3. Start the Application (1 minute)

**One Command (Recommended):**
```bash
npm run dev
```

**Or Separately:**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

## 4. Open Your Browser

Navigate to: **http://localhost:5173**

You'll see a beautiful landing page showcasing all features!

## 5. Test the Flow (2 minutes)

### Create Two Users:

**User 1:**
- Email: `teacher@test.com`
- Password: `password123`
- Offers: `React Development` (Advanced)
- Wants: `Python Programming` (Beginner)

**User 2:** (Use incognito/different browser)
- Email: `learner@test.com`
- Password: `password123`
- Offers: `Python Programming` (Intermediate)
- Wants: `React Development` (Beginner)

### Wait for Match:
- The matching engine runs every 10 minutes
- Or manually trigger by updating a profile
- Check the dashboard for match notifications

### Accept and Join:
- Both users accept the match
- Click "Join Classroom"
- Allow camera/microphone permissions
- Start your skill exchange session!

## 🎯 Features to Test

✅ **Video Call** - Toggle camera and mic  
✅ **Whiteboard** - Draw and share ideas  
✅ **Chat** - Send messages  
✅ **Review** - End session and rate partner  

## 🐛 Common Issues

**Port 5000 already in use:**
```bash
npx kill-port 5000
```

**Port 5173 already in use:**
```bash
npx kill-port 5173
```

**MongoDB not starting:**
```bash
# Create data directory
mkdir -p /data/db
# Start with specific path
mongod --dbpath /data/db
```

**WebRTC not connecting:**
- Allow camera/microphone permissions
- Use Chrome or Firefox
- Check you're on localhost or HTTPS

## 📚 Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Explore the codebase
- Customize for your needs
- Deploy to production

## 🎓 Learning Resources

**Project Highlights:**
- WebRTC peer-to-peer video
- Socket.IO real-time sync
- MongoDB database design
- React context & hooks
- RESTful API design
- Matching algorithm implementation

---

**Need Help?** Check README.md for troubleshooting and API documentation.

Happy Coding! 🚀
