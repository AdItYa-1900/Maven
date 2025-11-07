# 🔧 Socket.IO Troubleshooting Guide

## Issue: Partners Can't See Each Other / Chat/Whiteboard Not Syncing

### Quick Diagnostic Steps

#### 1. Check Browser Console (Both Users)
Open Developer Tools (F12) in both browser windows and look for these logs:

**Expected logs when joining:**
```
🔌 Connecting to socket...
✅ Socket connected: <socket-id>
📍 Joining classroom: <classroom-id> User: <user-id>
👋 User joined: <partner-user-id>
🎥 Requesting media access...
🎥 Media access granted
🔗 Setting up WebRTC connection...
```

**If missing:**
- No socket connection → Backend server not running
- No "User joined" → Room joining not working
- No media access → Camera/mic permissions denied

#### 2. Check Backend Console
Look for these logs in your backend terminal:

**Expected logs:**
```
✅ User connected: <socket-id>
User <user-id> joined classroom <classroom-id>
```

**If missing:**
- Socket.IO server not initialized
- Connection blocked by CORS

#### 3. Check Network Tab
In Developer Tools → Network → Filter: WS (WebSocket)

**Look for:**
- `socket.io` connection with Status 101 (Switching Protocols)
- Multiple frames being sent/received

**If broken:**
- Red X on socket.io → Connection failed
- No frames → Events not being transmitted

---

## Common Issues & Fixes

### Issue 1: "Waiting for partner to join" Forever

**Cause:** WebRTC peer connection not establishing

**Debug Steps:**
1. Check console for WebRTC logs
2. Look for "📨 Received offer from:" and "📨 Received answer from:"
3. Check ICE candidate exchange

**Fix:**
```javascript
// Both users should see:
📤 Creating offer...
📤 Sending offer
📨 Received offer from: <user-id>
✅ Set remote description
📤 Sending answer
📨 Received answer from: <user-id>
✅ Set remote description from answer
Sending ICE candidate (multiple times)
```

If missing, check:
- Both users are in same classroomId
- Socket connection is active
- No firewall blocking WebRTC

### Issue 2: Chat Messages Not Appearing

**Cause:** Messages sent but not received by partner

**Debug Steps:**
1. Send a message
2. Check console for: `💬 Sending message: {...}`
3. Partner should see: `💬 Received message: {...}`

**Fix:**
- Verify classroomId matches on both clients
- Check backend emits to correct room: `io.to(classroomId).emit('receive-message', ...)`
- Ensure socket.on('receive-message') listener is set up

### Issue 3: Whiteboard Not Syncing

**Cause:** Draw events not broadcasting

**Debug Steps:**
1. Draw on whiteboard
2. Check console for: `🎨 Sending draw: {...}`
3. Partner should see: `🎨 Received draw: {...}`

**Fix:**
- Same as chat - verify classroomId
- Check socket listeners are set up before drawing
- Verify backend broadcasts: `socket.to(classroomId).emit('whiteboard-draw', ...)`

---

## Testing Checklist

### Before Testing
- [ ] Backend server running on port 5001
- [ ] Frontend running on port 5173
- [ ] Both users have camera/mic permissions
- [ ] Using modern browser (Chrome/Edge recommended)

### Test Sequence
1. **User 1:** Log in → Accept/Create match → Join classroom
2. **Check:** User 1 sees own video
3. **User 2:** Log in → Accept match → Join classroom
4. **Expected:** 
   - User 1 sees toast: "Partner joined!"
   - User 2 sees User 1's video
   - User 1 sees User 2's video

5. **Test Chat:**
   - User 1: Send message → User 2 receives
   - User 2: Reply → User 1 receives

6. **Test Whiteboard:**
   - User 1: Draw line → User 2 sees line
   - User 2: Draw circle → User 1 sees circle

---

## Backend Verification

### Check Socket Handler
File: `backend/sockets/socketHandler.js`

Ensure these events exist:
```javascript
✅ socket.on('join-classroom', ...) 
✅ socket.on('send-message', ...)
✅ socket.on('whiteboard-draw', ...)
✅ socket.on('webrtc-offer', ...)
✅ socket.on('webrtc-answer', ...)
✅ socket.on('webrtc-ice-candidate', ...)
```

### Check Server.js
Ensure Socket.IO is initialized:
```javascript
const socketHandler = require('./sockets/socketHandler');
socketHandler(io);
```

---

## Environment Check

### Backend .env
```env
PORT=5001
CLIENT_URL=http://localhost:5173
```

### Frontend .env
```env
VITE_API_URL=http://localhost:5001
```

---

## Quick Fixes

### Fix 1: Clear Logs & Restart
```bash
# Stop all servers
# Restart backend
cd backend
npm start

# Restart frontend (new terminal)
cd frontend
npm run dev
```

### Fix 2: Hard Refresh Browser
- Chrome: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Clear cache and hard reload

### Fix 3: Check Firewall
- Allow Node.js through firewall
- Check antivirus isn't blocking WebRTC

### Fix 4: Use Incognito/Private Mode
- Test in incognito to rule out extensions

---

## Expected Console Output (Full Session)

### User 1 (First to Join)
```
🔌 Connecting to socket...
✅ Socket connected: abc123
📍 Joining classroom: room-uuid User: user1-uuid
🎥 Requesting media access...
🎥 Media access granted
🔗 Setting up WebRTC connection...
🔗 Peer connection created
📤 Creating offer...
📤 Sending offer
👋 User joined: user2-uuid
📨 Received answer from: user2-uuid
✅ Set remote description from answer
Sending ICE candidate (multiple)
Connection state: connected
📡 Received remote track: stream-id
```

### User 2 (Second to Join)
```
🔌 Connecting to socket...
✅ Socket connected: def456
📍 Joining classroom: room-uuid User: user2-uuid
🎥 Requesting media access...
🎥 Media access granted
📨 Received offer from: user1-uuid
✅ Set remote description
📤 Sending answer
🔗 Setting up WebRTC connection...
🔗 Peer connection created
Sending ICE candidate (multiple)
Connection state: connected
📡 Received remote track: stream-id
```

---

## Still Not Working?

### Check These:
1. **Same classroomId?** Both users must use same match/classroom
2. **Socket connected?** Look for ✅ Socket connected
3. **CORS errors?** Check backend console for CORS warnings
4. **Port conflicts?** Ensure 5001 and 5173 are free
5. **Network issues?** Try on same WiFi network first

### Get Help:
- Copy console logs from BOTH users
- Copy backend console output
- Note exact steps to reproduce
- Include browser version

---

## Success Indicators

✅ Both users see each other's video  
✅ Chat messages appear instantly  
✅ Whiteboard syncs in real-time  
✅ No errors in console  
✅ Toast notifications appear when partner joins/leaves

---

**Last Updated:** November 2025
