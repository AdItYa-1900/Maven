const supabase = require('../config/supabase');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.id);

    // Join a classroom room
    socket.on('join-classroom', async ({ classroomId, userId }) => {
      socket.join(classroomId);
      console.log(`✅ User ${userId} joined classroom ${classroomId}`);
      console.log(`📊 Room ${classroomId} now has ${io.sockets.adapter.rooms.get(classroomId)?.size || 0} users`);
      
      // Notify others in the room
      socket.to(classroomId).emit('user-joined', { userId });
      console.log(`📢 Notified room about user ${userId}`);
    });

    // WebRTC Signaling
    socket.on('webrtc-offer', ({ classroomId, offer, userId }) => {
      console.log(`📤 WebRTC offer from ${userId} to room ${classroomId}`);
      socket.to(classroomId).emit('webrtc-offer', { offer, userId });
    });

    socket.on('webrtc-answer', ({ classroomId, answer, userId }) => {
      console.log(`📤 WebRTC answer from ${userId} to room ${classroomId}`);
      socket.to(classroomId).emit('webrtc-answer', { answer, userId });
    });

    socket.on('webrtc-ice-candidate', ({ classroomId, candidate, userId }) => {
      socket.to(classroomId).emit('webrtc-ice-candidate', { candidate, userId });
    });

    // Chat messages
    socket.on('send-message', async ({ classroomId, message, senderId }) => {
      console.log(`💬 Message from ${senderId} in ${classroomId}: ${message}`);
      try {
        // Get current classroom
        const { data: classroom, error } = await supabase
          .from('classrooms')
          .select('chat_history')
          .eq('id', classroomId)
          .single();
        
        if (!error && classroom) {
          const newMessage = {
            sender_id: senderId,
            message: message,
            timestamp: new Date().toISOString()
          };
          
          const updatedHistory = [...(classroom.chat_history || []), newMessage];
          
          // Update chat history
          await supabase
            .from('classrooms')
            .update({ chat_history: updatedHistory })
            .eq('id', classroomId);

          // Broadcast message to all in room
          io.to(classroomId).emit('receive-message', newMessage);
          console.log(`📢 Broadcasted message to room ${classroomId}`);
        }
      } catch (error) {
        console.error('Error saving chat message:', error);
      }
    });

    // Whiteboard drawing
    socket.on('whiteboard-draw', ({ classroomId, drawData }) => {
      console.log(`🎨 Draw event in room ${classroomId}`);
      socket.to(classroomId).emit('whiteboard-draw', drawData);
    });

    socket.on('whiteboard-clear', ({ classroomId }) => {
      console.log(`🎨 Clear whiteboard in room ${classroomId}`);
      socket.to(classroomId).emit('whiteboard-clear');
    });

    // Video/Audio controls
    socket.on('toggle-video', ({ classroomId, userId, enabled }) => {
      socket.to(classroomId).emit('user-video-toggle', { userId, enabled });
    });

    socket.on('toggle-audio', ({ classroomId, userId, enabled }) => {
      socket.to(classroomId).emit('user-audio-toggle', { userId, enabled });
    });

    // Leave classroom
    socket.on('leave-classroom', ({ classroomId, userId }) => {
      console.log(`👋 User ${userId} leaving classroom ${classroomId}`);
      socket.leave(classroomId);
      socket.to(classroomId).emit('user-left', { userId });
    });

    socket.on('disconnect', () => {
      console.log('❌ User disconnected:', socket.id);
    });
  });
};
