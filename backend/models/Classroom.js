const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const classroomSchema = new mongoose.Schema({
  match_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true,
    unique: true
  },
  video_call_room_id: {
    type: String,
    required: true,
    unique: true
  },
  whiteboard_session_id: {
    type: String,
    required: true,
    unique: true
  },
  chat_history: [messageSchema],
  session_started: {
    type: Date
  },
  session_ended: {
    type: Date
  },
  is_active: {
    type: Boolean,
    default: false
  },
  whiteboard_data: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Classroom', classroomSchema);
