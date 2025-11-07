# 🚀 Quick Test Guide for Socket Issues

## Setup (Do This First)

### 1. Restart Backend with Logging
```bash
cd backend
npm start
```

**Watch for:**
- ✅ Server running on port 5001
- Socket.IO initialized

### 2. Restart Frontend
```bash
cd frontend
npm run dev
```

### 3. Open Two Browser Windows
- Window 1: User A (e.g., http://localhost:5173)
- Window 2: User B (e.g., http://localhost:5173) - Use incognito/private mode

---

## Test Procedure

### Step 1: Both Users Join Classroom

**User A:**
1. Login
2. Go to Dashboard
3. Accept a match (or create one)
4. Click "Join Classroom"
5. **Open Console (F12)**

**Expected in User A Console:**
```
🔌 Connecting to socket...
✅ Socket connected: <id>
📍 Joining classroom: <classroom-id> User: <user-id>
🎥 Requesting media access...
🎥 Media access granted
🔗 Setting up WebRTC connection...
📤 Creating offer...
📤 Sending offer
```

**Expected in Backend Console:**
```
✅ User connected: <socket-id>
✅ User <user-A-id> joined classroom <classroom-id>
📊 Room <classroom-id> now has 1 users
📢 Notified room about user <user-A-id>
📤 WebRTC offer from <user-A-id> to room <classroom-id>
```

**User B:**
1. Login (different account)
2. Go to Dashboard  
3. Accept the same match
4. Click "Join Classroom"
5. **Open Console (F12)**

**Expected in User B Console:**
```
🔌 Connecting to socket...
✅ Socket connected: <id>
📍 Joining classroom: <classroom-id> User: <user-B-id>
👋 User joined: <user-A-id>  ← IMPORTANT!
🎥 Requesting media access...
🎥 Media access granted
📨 Received offer from: <user-A-id>  ← IMPORTANT!
✅ Set remote description
📤 Sending answer
Connection state: connected
📡 Received remote track: <stream-id>  ← VIDEO WORKS!
```

**Expected in User A Console (after B joins):**
```
👋 User joined: <user-B-id>  ← SHOULD SEE THIS!
📨 Received answer from: <user-B-id>
✅ Set remote description from answer
Connection state: connected
📡 Received remote track: <stream-id>  ← VIDEO WORKS!
```

**Expected in Backend Console:**
```
✅ User connected: <socket-id-B>
✅ User <user-B-id> joined classroom <classroom-id>
📊 Room <classroom-id> now has 2 users  ← SHOULD BE 2!
📢 Notified room about user <user-B-id>
📨 Received offer from: <user-A-id>
📤 WebRTC answer from <user-B-id> to room <classroom-id>
```

---

### Step 2: Test Chat

**User A:**
1. Click chat icon (bottom right)
2. Type "Hello from A"
3. Press Send

**Expected in User A Console:**
```
💬 Sending message: {classroomId: "...", message: "Hello from A", ...}
```

**Expected in Backend Console:**
```
💬 Message from <user-A-id> in <classroom-id>: Hello from A
📢 Broadcasted message to room <classroom-id>
```

**Expected in User B Console:**
```
💬 Received message: {message: "Hello from A", sender_id: "...", ...}
```

**User B should see:** Message appears in chat popup!

---

### Step 3: Test Whiteboard

**User A:**
1. Click "Whiteboard" tab in header
2. Draw a line on canvas

**Expected in User A Console:**
```
🎨 Sending draw: {x0: 100, y0: 100, x1: 150, y1: 150, ...}
```

**Expected in Backend Console:**
```
🎨 Draw event in room <classroom-id>
```

**Expected in User B Console:**
```
🎨 Received draw: {x0: 100, y0: 100, x1: 150, y1: 150, ...}
```

**User B should see:** The line appears on their whiteboard!

---

## ❌ Common Problems & Solutions

### Problem: "👋 User joined" Never Appears

**Symptom:** Partner never sees "User joined" notification

**Check:**
1. **Different classroomIds?**
   - Console should show same classroom ID for both users
   - Fix: Ensure both accepting same match

2. **Socket not connected?**
   - Should see ✅ Socket connected
   - Fix: Restart backend, check port 5001 is free

3. **Backend not broadcasting?**
   - Backend should show: "📢 Notified room about user"
   - Fix: Check backend/sockets/socketHandler.js

### Problem: Chat Not Working

**Symptom:** Message sent but partner doesn't receive

**Check Backend Console:**
- Should see: `💬 Message from <user> in <room>: <text>`
- Should see: `📢 Broadcasted message to room <room>`

**If missing:**
- classroomId mismatch
- Socket not in room
- Database error (check Supabase connection)

### Problem: Whiteboard Not Syncing

**Symptom:** Draw on one side, nothing on other

**Check:**
1. Both users on Whiteboard tab?
2. Backend shows: `🎨 Draw event in room`?
3. Receiver shows: `🎨 Received draw`?

**Common fix:** Switch to Whiteboard tab on both sides first

### Problem: Video Stuck on "Waiting..."

**Symptom:** "Waiting for partner to join..." forever

**Check:**
1. WebRTC offer/answer exchange happening?
2. ICE candidates being exchanged?
3. Firewall blocking WebRTC?

**Console should show:**
```
📨 Received offer from: ...
📨 Received answer from: ...
Sending ICE candidate (multiple times)
Connection state: connected
📡 Received remote track
```

**If stuck at "connecting":**
- Try different network
- Check firewall settings
- Use Chrome (best WebRTC support)

---

## ✅ Success Checklist

After both users join, verify:

- [ ] Backend shows "Room has 2 users"
- [ ] Both users see "👋 User joined" toast
- [ ] User A sees User B's video
- [ ] User B sees User A's video  
- [ ] Chat messages appear instantly
- [ ] Whiteboard strokes sync in real-time
- [ ] No red errors in any console

---

## 🆘 Still Not Working?

### Copy These Logs:

**From User A Console:**
- All lines starting with 🔌 ✅ 📍 🎥 🔗 📨 📤

**From User B Console:**
- All lines starting with 🔌 ✅ 📍 🎥 🔗 📨 📤

**From Backend Console:**
- Last 50 lines

### Also Note:
- Exact steps taken
- What IS working vs what ISN'T
- Browser versions
- Any error messages

---

**The comprehensive logging will help identify exactly where the issue is!**
