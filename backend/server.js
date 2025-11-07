const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const cron = require('node-cron');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const matchRoutes = require('./routes/matches');
const classroomRoutes = require('./routes/classrooms');
const reviewRoutes = require('./routes/reviews');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/reviews', reviewRoutes);

// Socket.IO for real-time features
const socketHandler = require('./sockets/socketHandler');
socketHandler(io);

// Matching engine cron job - runs every 10 minutes
const { runMatchingEngine } = require('./services/matchingEngine');
cron.schedule('*/10 * * * *', async () => {
  console.log('🔄 Running matching engine...');
  await runMatchingEngine();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Maven API is running' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
