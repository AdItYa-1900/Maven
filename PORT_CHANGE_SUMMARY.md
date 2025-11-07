# ✅ Port Changed from 5000 to 6000

## 📋 Files Updated

### **Backend Files:**

1. ✅ **`backend/.env.example`**
   ```env
   PORT=6000
   GOOGLE_CALLBACK_URL=http://localhost:6000/api/auth/google/callback
   ```

2. ✅ **`backend/server.js`**
   ```javascript
   const PORT = process.env.PORT || 6000;
   ```

### **Frontend Files:**

3. ✅ **`frontend/src/lib/api.js`**
   ```javascript
   const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:6000/api'
   ```

4. ✅ **`frontend/vite.config.js`**
   ```javascript
   proxy: {
     '/api': {
       target: 'http://localhost:6000',
       changeOrigin: true,
     },
   }
   ```

5. ✅ **`frontend/src/pages/Classroom.jsx`**
   ```javascript
   const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:6000')
   ```

---

## ⚠️ Important: Update Your .env File

**You MUST manually update your `backend/.env` file:**

```env
PORT=6000
```

Change this line from `PORT=5000` to `PORT=6000`

---

## 🚀 New Server URLs

- **Backend API**: http://localhost:6000
- **Frontend**: http://localhost:5173 (unchanged)
- **Health Check**: http://localhost:6000/health

---

## 🔄 How to Restart

1. **Stop any running servers** (Ctrl+C)
2. **Update your `backend/.env` file** to have `PORT=6000`
3. **Start fresh:**
   ```bash
   npm run dev
   ```

4. **You should see:**
   ```
   [0] 🚀 Server running on port 6000  ← New port!
   [0] ✅ Supabase Connected
   [1] ➜ Local: http://localhost:5173/
   ```

---

## ✅ All References Updated

Every file that referenced port 5000 has been changed to 6000:
- API calls
- Socket.io connections
- Vite proxy
- OAuth callback URLs
- Server configuration

Your Maven platform now runs on port 6000! 🎉
